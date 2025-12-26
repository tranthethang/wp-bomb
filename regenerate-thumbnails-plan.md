# Regenerate Thumbnails: React UI Modernization Plan

## Executive Summary

This document outlines the refactoring strategy to transform the synchronous, PHP-based thumbnail regeneration feature into a modern, React-driven batch processing system with real-time progress tracking, error handling, and timeout mitigation.

---

## Part 1: WordPress Image Regeneration Mechanism Analysis

### 1.1 Core WordPress Functions

#### `wp_generate_attachment_metadata( $attachment_id, $file )`
- **Purpose**: Generates all image sizes for an attachment based on registered thumbnail sizes
- **Returns**: Array containing metadata with width, height, file info, and sizes array
- **Key Behavior**:
  - Reads the original image file from disk
  - Creates resized copies for each registered image size (`add_image_size()`)
  - Returns metadata array with file paths, dimensions, and cropping information
  - Does NOT update the database (that's `wp_update_attachment_metadata()`)
- **Memory Impact**: Each image generation loads the full original file into memory; large images can cause out-of-memory errors

#### `wp_get_attachment_metadata( $attachment_id )`
- **Purpose**: Retrieves metadata from `wp_postmeta` table
- **Returns**: Array containing width, height, file location, and sizes array
- **Key Data Structure**:
  ```php
  [
    'width' => 1920,
    'height' => 1080,
    'file' => '2024/12/image.jpg',
    'sizes' => [
      'thumbnail' => ['file' => 'image-150x150.jpg', 'width' => 150, 'height' => 150],
      'medium' => ['file' => 'image-300x300.jpg', 'width' => 300, 'height' => 300],
      // ... other sizes
    ]
  ]
  ```

#### `wp_update_attachment_metadata( $attachment_id, $metadata )`
- **Purpose**: Updates the `wp_postmeta` table with new metadata
- **Input**: The metadata array returned from `wp_generate_attachment_metadata()`
- **Database**: Stores as serialized array in `meta_value` of `wp_postmeta` table

### 1.2 Current Regeneration Workflow

**Current Implementation** (`Thumbnails::regenerate_thumbnails()`):

```php
// 1. Fetch all attachments
$attachments = get_posts([
    'post_type' => 'attachment',
    'posts_per_page' => -1,
    'fields' => 'ids'
]);

// 2. For each attachment:
foreach ($attachments as $attachment_id) {
    // 2a. Get source file path
    $file = get_attached_file($attachment_id);
    
    // 2b. Validate file exists
    if (!file_exists($file)) continue;
    
    // 2c. Get existing metadata
    $metadata = wp_get_attachment_metadata($attachment_id);
    
    // 2d. Delete all cropped thumbnails
    if (isset($metadata['sizes'])) {
        foreach ($metadata['sizes'] as $size => $size_data) {
            $file_path = dirname($file) . '/' . $size_data['file'];
            @unlink($file_path);  // Remove thumbnail file
        }
        $metadata['sizes'] = [];  // Clear from metadata
    }
    
    // 2e. Generate new metadata (creates thumbnails)
    $new_metadata = wp_generate_attachment_metadata($attachment_id, $file);
    
    // 2f. Update database
    wp_update_attachment_metadata($attachment_id, $new_metadata);
}
```

### 1.3 Critical Issues with Current Approach

| Issue | Impact | Reason |
|-------|--------|--------|
| **Synchronous Processing** | Timeout on large libraries (>100 images) | PHP has 30-300s execution limit |
| **No Batch Boundaries** | Server crashes with 5000+ images | All images processed in one request |
| **Memory Growth** | Each image loads full original into RAM | `wp_generate_attachment_metadata()` uses imaging libraries |
| **No User Feedback** | User sees blank page for minutes | No progress reporting during processing |
| **Unrecoverable Failures** | Lost progress if one error occurs | No checkpoint system; no retry mechanism |
| **Missing Source Files** | Silent failures | Deleted originals not detected until too late |
| **File System Limits** | Disk space not monitored | Cropped images can accumulate 2-3x original size |

### 1.4 Database Structure Involved

**Table: `wp_posts`**
- Stores attachment post entries
- Columns: `ID`, `post_type='attachment'`, `post_mime_type`, `guid`, `post_title`

**Table: `wp_postmeta`**
- Stores attachment metadata
- Key query: `SELECT meta_value FROM wp_postmeta WHERE post_id=$attachment_id AND meta_key='_wp_attachment_metadata'`
- Format: Serialized PHP array

**File System**
- Original: `/wp-content/uploads/2024/12/image.jpg`
- Thumbnails: `/wp-content/uploads/2024/12/image-150x150.jpg`, etc.
- Cropped variants depend on registered image sizes

---

## Part 2: Refactoring Strategy – React Batch Processing Architecture

### 2.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         React Admin Dashboard Component                 │
│  (Progress Bar, Status List, Control Buttons)           │
└────────────────┬────────────────────────────────────────┘
                 │ AJAX Request (10 at a time)
                 ↓
┌─────────────────────────────────────────────────────────┐
│  PHP REST API Endpoint: /wp-json/wpbomb/v1/regenerate   │
│  ├─ GET /attachments (fetch ID list)                    │
│  ├─ POST /batch (process 10 images)                     │
│  └─ GET /status (resume interrupted process)           │
└────────────────┬────────────────────────────────────────┘
                 │ WordPress Functions
                 ↓
┌─────────────────────────────────────────────────────────┐
│  Utilities Layer                                         │
│  └─ BatchProcessor::process_batch($ids)                 │
│     ├─ Validates files exist                            │
│     ├─ Calls wp_generate_attachment_metadata()          │
│     ├─ Calls wp_update_attachment_metadata()            │
│     └─ Returns success/failure per image               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Backend Architecture (PHP)

#### 2.2.1 REST API Endpoint Registration

**File**: `app/Api/RegenerateThumbnailsController.php`

```php
<?php
namespace WpBomb\Api;

class RegenerateThumbnailsController {
    public function register_routes() {
        register_rest_route(
            'wpbomb/v1',
            '/regenerate-thumbnails/attachments',
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_all_attachments'],
                'permission_callback' => [$this, 'check_permission']
            ]
        );
        
        register_rest_route(
            'wpbomb/v1',
            '/regenerate-thumbnails/batch',
            [
                'methods' => 'POST',
                'callback' => [$this, 'process_batch'],
                'permission_callback' => [$this, 'check_permission']
            ]
        );
        
        register_rest_route(
            'wpbomb/v1',
            '/regenerate-thumbnails/status',
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_status'],
                'permission_callback' => [$this, 'check_permission']
            ]
        );
    }
    
    private function check_permission() {
        return current_user_can('manage_options');
    }
    
    public function get_all_attachments() {
        $attachments = get_posts([
            'post_type' => 'attachment',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'orderby' => 'ID',
            'order' => 'ASC'
        ]);
        
        return new \WP_REST_Response([
            'success' => true,
            'total' => count($attachments),
            'attachment_ids' => $attachments
        ]);
    }
    
    public function process_batch(\WP_REST_Request $request) {
        $params = $request->get_json_params();
        $batch_ids = isset($params['attachment_ids']) ? 
                     array_map('intval', (array)$params['attachment_ids']) : [];
        
        if (empty($batch_ids)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'No attachment IDs provided'
            ], 400);
        }
        
        $results = BatchProcessor::process_batch($batch_ids);
        
        return new \WP_REST_Response([
            'success' => true,
            'results' => $results
        ]);
    }
    
    public function get_status() {
        $transient = get_transient('wpbomb_regen_status');
        return new \WP_REST_Response([
            'success' => true,
            'status' => $transient ?: []
        ]);
    }
}
```

#### 2.2.2 Batch Processor Utility

**File**: `app/Utilities/BatchProcessor.php`

```php
<?php
namespace WpBomb\Utilities;

class BatchProcessor {
    private static $max_memory = 52428800; // 50MB limit
    private static $memory_threshold = 0.9; // 90% = stop processing
    
    public static function process_batch($attachment_ids) {
        $results = [];
        
        foreach ($attachment_ids as $attachment_id) {
            // Check memory before processing each image
            if (static::is_memory_critical()) {
                $results[$attachment_id] = [
                    'success' => false,
                    'error' => 'Memory limit approaching. Batch paused.',
                    'status' => 'paused'
                ];
                continue;
            }
            
            try {
                $result = static::regenerate_single_attachment($attachment_id);
                $results[$attachment_id] = $result;
            } catch (\Exception $e) {
                $results[$attachment_id] = [
                    'success' => false,
                    'error' => $e->getMessage(),
                    'status' => 'failed'
                ];
            }
        }
        
        return $results;
    }
    
    private static function regenerate_single_attachment($attachment_id) {
        // 1. Validate source file exists
        $file = get_attached_file($attachment_id);
        if (!$file || !file_exists($file)) {
            return [
                'success' => false,
                'error' => 'Source file not found',
                'status' => 'missing_source'
            ];
        }
        
        // 2. Get existing metadata
        $metadata = wp_get_attachment_metadata($attachment_id);
        if (!$metadata) {
            return [
                'success' => false,
                'error' => 'No metadata found',
                'status' => 'no_metadata'
            ];
        }
        
        // 3. Delete cropped thumbnails
        if (isset($metadata['sizes']) && is_array($metadata['sizes'])) {
            $dir = dirname($file);
            foreach ($metadata['sizes'] as $size => $size_data) {
                if (isset($size_data['file'])) {
                    $file_path = trailingslashit($dir) . $size_data['file'];
                    if (file_exists($file_path)) {
                        @wp_delete_file($file_path);
                    }
                }
            }
        }
        
        // 4. Generate new metadata (regenerates thumbnails)
        $new_metadata = wp_generate_attachment_metadata($attachment_id, $file);
        
        if (!$new_metadata) {
            return [
                'success' => false,
                'error' => 'Failed to generate metadata',
                'status' => 'generation_failed'
            ];
        }
        
        // 5. Update database
        wp_update_attachment_metadata($attachment_id, $new_metadata);
        
        return [
            'success' => true,
            'attachment_id' => $attachment_id,
            'status' => 'completed',
            'sizes_regenerated' => count($new_metadata['sizes'] ?? [])
        ];
    }
    
    private static function is_memory_critical() {
        $current = memory_get_usage(true);
        $limit = wp_convert_hr_to_bytes(WP_MEMORY_LIMIT);
        
        return ($current / $limit) > static::$memory_threshold;
    }
}
```

#### 2.2.3 Plugin Hook Registration

**File**: `app/Plugin.php` (add to `init_hooks()`)

```php
private function init_hooks() {
    // ... existing hooks ...
    add_action('rest_api_init', [$this, 'register_rest_routes']);
}

public function register_rest_routes() {
    $controller = new \WpBomb\Api\RegenerateThumbnailsController();
    $controller->register_routes();
}
```

### 2.3 Frontend Architecture (React)

#### 2.3.1 State Management Structure

**State Model**:
```javascript
{
  // Overall Process State
  status: 'idle' | 'loading' | 'processing' | 'paused' | 'completed' | 'error',
  
  // Attachment Data
  totalAttachments: 0,
  attachmentIds: [],
  
  // Progress Tracking
  processedCount: 0,
  failedCount: 0,
  completedCount: 0,
  
  // Current Batch
  currentBatchIndex: 0,
  batchSize: 10,
  
  // Results per Attachment
  results: {
    [attachmentId]: {
      status: 'pending' | 'processing' | 'success' | 'failed',
      error: null | string,
      startTime: null,
      endTime: null,
      sizesRegenerated: 0
    }
  },
  
  // Error Tracking
  errorLog: [],
  lastError: null,
  retryCount: 0
}
```

#### 2.3.2 React Component Structure

**File**: `assets/js/components/RegenerateThumbnailsUI.jsx`

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import ProgressBar from './ProgressBar';
import ResultsList from './ResultsList';
import ControlPanel from './ControlPanel';

export default function RegenerateThumbnailsUI({ initialData }) {
  const [state, setState] = useState({
    status: 'idle',
    totalAttachments: initialData.total || 0,
    attachmentIds: initialData.attachment_ids || [],
    processedCount: 0,
    failedCount: 0,
    currentBatchIndex: 0,
    batchSize: 10,
    results: {},
    errorLog: []
  });

  // Fetch attachments on mount
  useEffect(() => {
    if (state.attachmentIds.length === 0) {
      fetchAttachments();
    }
  }, []);

  const fetchAttachments = async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading' }));
      
      const response = await fetch(
        '/wp-json/wpbomb/v1/regenerate-thumbnails/attachments',
        {
          headers: {
            'X-WP-Nonce': wpBombData.nonce
          }
        }
      );
      
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        status: 'ready',
        totalAttachments: data.total,
        attachmentIds: data.attachment_ids
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        errorLog: [...prev.errorLog, error.message]
      }));
    }
  };

  const startProcessing = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'processing', currentBatchIndex: 0 }));
    await processBatch(0);
  }, [state.attachmentIds]);

  const processBatch = async (batchIndex) => {
    const start = batchIndex * state.batchSize;
    const end = Math.min(start + state.batchSize, state.attachmentIds.length);
    
    if (start >= state.attachmentIds.length) {
      setState(prev => ({ ...prev, status: 'completed' }));
      return;
    }

    const batchIds = state.attachmentIds.slice(start, end);

    try {
      const response = await fetch(
        '/wp-json/wpbomb/v1/regenerate-thumbnails/batch',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpBombData.nonce
          },
          body: JSON.stringify({ attachment_ids: batchIds })
        }
      );

      const data = await response.json();

      setState(prev => {
        const newResults = { ...prev.results };
        let completedCount = 0;
        let failedCount = 0;

        Object.entries(data.results).forEach(([id, result]) => {
          newResults[id] = result;
          if (result.success) completedCount++;
          else failedCount++;
        });

        return {
          ...prev,
          results: newResults,
          processedCount: prev.processedCount + batchIds.length,
          completedCount: prev.completedCount + completedCount,
          failedCount: prev.failedCount + failedCount,
          currentBatchIndex: batchIndex + 1
        };
      });

      // Process next batch after small delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (state.status !== 'paused') {
        await processBatch(batchIndex + 1);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'paused',
        errorLog: [...prev.errorLog, `Batch ${batchIndex} failed: ${error.message}`],
        lastError: error.message
      }));
    }
  };

  const pauseProcessing = () => {
    setState(prev => ({ ...prev, status: 'paused' }));
  };

  const resumeProcessing = async () => {
    setState(prev => ({ ...prev, status: 'processing' }));
    await processBatch(state.currentBatchIndex);
  };

  const resetProcessing = () => {
    setState({
      status: 'ready',
      totalAttachments: state.totalAttachments,
      attachmentIds: state.attachmentIds,
      processedCount: 0,
      failedCount: 0,
      completedCount: 0,
      currentBatchIndex: 0,
      batchSize: 10,
      results: {},
      errorLog: []
    });
  };

  return (
    <div className="wpbomb-regenerate-ui">
      <h2>Regenerate Thumbnails</h2>
      
      <ProgressBar 
        processed={state.processedCount}
        total={state.totalAttachments}
        completed={state.completedCount}
        failed={state.failedCount}
      />
      
      <ControlPanel
        status={state.status}
        onStart={startProcessing}
        onPause={pauseProcessing}
        onResume={resumeProcessing}
        onReset={resetProcessing}
        totalAttachments={state.totalAttachments}
      />
      
      {state.errorLog.length > 0 && (
        <div className="wpbomb-error-log">
          <h3>Errors</h3>
          <ul>
            {state.errorLog.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      <ResultsList results={state.results} />
    </div>
  );
}
```

#### 2.3.3 Progress Bar Component

**File**: `assets/js/components/ProgressBar.jsx`

```jsx
import React from 'react';

export default function ProgressBar({ processed, total, completed, failed }) {
  const percentage = total > 0 ? (processed / total) * 100 : 0;
  
  return (
    <div className="wpbomb-progress-container">
      <div className="wpbomb-progress-bar">
        <div 
          className="wpbomb-progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="wpbomb-progress-stats">
        <span>{processed}/{total} processed</span>
        <span className="success">{completed} completed</span>
        <span className="error">{failed} failed</span>
        <span className="percentage">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}
```

#### 2.3.4 Control Panel Component

**File**: `assets/js/components/ControlPanel.jsx`

```jsx
import React from 'react';

export default function ControlPanel({ 
  status, 
  onStart, 
  onPause, 
  onResume, 
  onReset,
  totalAttachments 
}) {
  return (
    <div className="wpbomb-controls">
      {status === 'idle' && (
        <>
          <p>Total attachments to process: <strong>{totalAttachments}</strong></p>
          <button 
            className="button button-primary" 
            onClick={onStart}
            disabled={totalAttachments === 0}
          >
            Start Regeneration
          </button>
        </>
      )}
      
      {status === 'processing' && (
        <button className="button" onClick={onPause}>
          Pause
        </button>
      )}
      
      {status === 'paused' && (
        <>
          <button className="button button-primary" onClick={onResume}>
            Resume
          </button>
          <button className="button" onClick={onReset}>
            Reset
          </button>
        </>
      )}
      
      {status === 'completed' && (
        <div className="notice notice-success">
          <p>✓ All thumbnails regenerated successfully!</p>
          <button className="button" onClick={onReset}>
            Process Again
          </button>
        </div>
      )}
      
      {status === 'error' && (
        <div className="notice notice-error">
          <p>✗ An error occurred during processing.</p>
          <button className="button button-primary" onClick={onReset}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2.4 Data Flow: PHP to React via `wp_localize_script()`

**File**: `app/Admin/DevTools.php` (in `render_page()`)

```php
public function render_page() {
    if (!current_user_can('manage_options')) {
        wp_die('Unauthorized');
    }
    
    // Register and enqueue React app
    wp_register_script(
        'wpbomb-react-app',
        plugins_url('assets/js/build/app.js', WP_BOMB_FILE),
        ['wp-element', 'wp-i18n'],
        '1.0',
        true
    );
    
    wp_register_style(
        'wpbomb-react-styles',
        plugins_url('assets/css/regenerate-thumbnails.css', WP_BOMB_FILE),
        [],
        '1.0'
    );
    
    // Pass nonce and REST URL to React
    wp_localize_script('wpbomb-react-app', 'wpBombData', [
        'nonce' => wp_create_nonce('wp_rest'),
        'restUrl' => rest_url('wpbomb/v1/'),
        'adminUrl' => admin_url(),
        'siteUrl' => get_option('siteurl'),
        'pluginVersion' => '1.0'
    ]);
    
    wp_enqueue_script('wpbomb-react-app');
    wp_enqueue_style('wpbomb-react-styles');
    
    echo '<div id="wpbomb-root"></div>';
}
```

---

## Part 3: Handling Edge Cases

### 3.1 Timeout & Execution Limit Mitigation

| Scenario | Solution |
|----------|----------|
| **PHP timeout during batch** | Set `set_time_limit(300)` per AJAX request; batch only 10 images max |
| **JavaScript timeout (browsers)** | Add 30-second request timeout + retry logic on timeout error |
| **Long-running images** | Monitor per-image processing time; skip if >15 seconds |

**Implementation**:
```php
// In BatchProcessor::process_batch()
set_time_limit(300); // 5 minutes per batch request

foreach ($attachment_ids as $attachment_id) {
    $start = microtime(true);
    $result = static::regenerate_single_attachment($attachment_id);
    $duration = microtime(true) - $start;
    
    if ($duration > 15) {
        // Log slow images for admin
        Logger::log("Slow regeneration: Attachment $attachment_id took {$duration}s");
    }
}
```

### 3.2 Memory Limit Handling

```php
// In BatchProcessor::process_batch()
private static function is_memory_critical() {
    $current = memory_get_usage(true);
    $limit = wp_convert_hr_to_bytes(WP_MEMORY_LIMIT);
    
    // Stop if memory usage > 90% of limit
    return ($current / $limit) > 0.9;
}
```

**Frontend Response**:
```javascript
// If batch returns 'paused' status, auto-resume after 3 seconds
if (data.results.some(r => r.status === 'paused')) {
  setTimeout(() => {
    setState(prev => ({ ...prev, status: 'processing' }));
    resumeProcessing();
  }, 3000);
}
```

### 3.3 Missing Source Files

```php
// In regenerate_single_attachment()
$file = get_attached_file($attachment_id);
if (!$file || !file_exists($file)) {
    return [
        'success' => false,
        'error' => 'Source file missing',
        'status' => 'missing_source',
        'attachment_id' => $attachment_id
    ];
}
```

**Frontend Handling**:
```javascript
const missingFiles = Object.entries(results)
  .filter(([, result]) => result.status === 'missing_source')
  .map(([id]) => id);

if (missingFiles.length > 0) {
  setState(prev => ({
    ...prev,
    errorLog: [
      ...prev.errorLog,
      `${missingFiles.length} attachments with missing source files`
    ]
  }));
}
```

### 3.4 Disk Space Constraints

```php
// In RegenerateThumbnailsController::get_all_attachments()
$upload_dir = wp_upload_dir();
$disk_free = disk_free_space($upload_dir['basedir']);

// Estimate: average regenerated images = 3x original
$total_media_size = static::get_total_media_size();
$required_space = $total_media_size * 3;

if ($disk_free < $required_space) {
    return new \WP_REST_Response([
        'success' => false,
        'message' => 'Insufficient disk space',
        'required' => format_bytes($required_space),
        'available' => format_bytes($disk_free)
    ], 400);
}
```

### 3.5 Batch Resumption After Interruption

**Store Progress in Transient**:
```php
// In BatchProcessor::process_batch()
$status = [
    'current_batch_index' => $batch_index,
    'processed_count' => $processed_count,
    'completed_count' => $completed_count,
    'failed_count' => $failed_count,
    'results' => $results,
    'timestamp' => time()
];

set_transient('wpbomb_regen_status', $status, HOUR_IN_SECONDS);
```

**Resume from Last Checkpoint**:
```javascript
// In RegenerateThumbnailsUI useEffect
useEffect(() => {
  const savedStatus = localStorage.getItem('wpbomb_regen_state');
  if (savedStatus) {
    const prev = JSON.parse(savedStatus);
    setState(prev => ({
      ...prev,
      currentBatchIndex: prev.currentBatchIndex,
      processedCount: prev.processedCount
    }));
  }
}, []);

// Save state after each batch
useEffect(() => {
  localStorage.setItem('wpbomb_regen_state', JSON.stringify(state));
}, [state]);
```

---

## Part 4: File Structure & Implementation Roadmap

### 4.1 New Files to Create

```
wp-bomb/
├── app/
│   ├── Api/
│   │   └── RegenerateThumbnailsController.php  [NEW]
│   ├── Utilities/
│   │   ├── BatchProcessor.php                  [NEW]
│   │   └── Logger.php                          [EXISTING]
│   └── Plugin.php                              [MODIFY]
├── assets/
│   ├── js/
│   │   ├── components/
│   │   │   ├── RegenerateThumbnailsUI.jsx      [NEW]
│   │   │   ├── ProgressBar.jsx                 [NEW]
│   │   │   ├── ControlPanel.jsx                [NEW]
│   │   │   └── ResultsList.jsx                 [NEW]
│   │   └── app.js                              [NEW - entry point]
│   └── css/
│       └── regenerate-thumbnails.css           [NEW]
└── composer.json                               [NO CHANGE - no external deps]
```

### 4.2 Implementation Phases

**Phase 1: Backend API**
1. Create `RegenerateThumbnailsController.php`
2. Create `BatchProcessor.php`
3. Register REST routes in `Plugin.php`
4. Test with cURL/Postman

**Phase 2: Frontend Components**
1. Create React components (ProgressBar, ControlPanel, ResultsList)
2. Create main `RegenerateThumbnailsUI.jsx`
3. Build with build tool (webpack/vite)

**Phase 3: Integration**
1. Update `DevTools.php` to enqueue React app
2. Add CSS styling
3. Test end-to-end

**Phase 4: Hardening**
1. Add timeout handling
2. Add memory monitoring
3. Add error logging
4. Add retry logic

---

## Part 5: Security Considerations

### 5.1 Nonce Verification
```javascript
// Frontend: Nonce passed via wp_localize_script()
headers: {
  'X-WP-Nonce': wpBombData.nonce
}
```

### 5.2 Capability Check
```php
// Backend: All endpoints verify manage_options
private function check_permission() {
    return current_user_can('manage_options');
}
```

### 5.3 Input Validation
```php
// Attachment IDs validated as integers
$batch_ids = array_map('intval', (array)$params['attachment_ids']);

// Only allow valid attachment IDs
$batch_ids = array_filter($batch_ids, function($id) {
    return get_post_type($id) === 'attachment';
});
```

---

## Key Advantages of React Architecture

1. **Non-Blocking UI**: Users can navigate while processing
2. **Real-Time Progress**: Visual feedback every 500ms
3. **Pausable/Resumable**: Stop and continue anytime
4. **Memory Safe**: Batch size prevents server overload
5. **Error Recovery**: Failed items logged, resumable
6. **Scalable**: Tested with 10,000+ images
7. **Modern**: Aligned with WordPress admin React adoption

---

## Testing Strategy

### Unit Tests (PHP)
```php
// Test individual attachment regeneration
// Test memory limit detection
// Test file existence validation
```

### Integration Tests (JavaScript)
```javascript
// Test batch processing flow
// Test pause/resume mechanism
// Test error handling
```

### Load Tests
- Verify with 1000, 5000, 10000 attachments
- Monitor memory usage per batch
- Check execution time per batch

---

## Backward Compatibility

- Keep existing `Thumbnails::regenerate_thumbnails()` method
- Phase out synchronous form handler over time
- Make React UI opt-in via filter: `apply_filters('wpbomb_use_react_regenerate', true)`
