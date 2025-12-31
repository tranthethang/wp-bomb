---
description: Repository Information Overview
alwaysApply: true
---

# Craftsman Suite Plugin Information

## Summary

Craftsman Suite is a comprehensive WordPress utility plugin for developers that provides essential developer tools accessible from the WordPress admin panel. It automates common WordPress tasks including thumbnail attachment, thumbnail regeneration, and post field/meta cloning. Built with modern PHP using OOP architecture and PSR-4 autoloading.

## Structure

- **`craftsman-suite.php`**: Main plugin entry point with plugin headers and initialization
- **`app/Plugin.php`**: Core plugin class using singleton pattern
- **`app/Admin/DevTools.php`**: Admin menu registration and form rendering for developer tools
- **`app/Utilities/`**: Helper classes for media, thumbnails, and post operations
  - `Thumbnails.php`: Auto-attach thumbnails, regenerate thumbnails, clone post data
  - `MediaHelper.php`: Query media ID ranges
  - `PostTypeHelper.php`: Post type utilities
  - `Logger.php`: Logging functionality
- **`composer.json`**: Dependency management and PSR-4 autoloading configuration
- **`README.md`**: Plugin documentation

## Language & Runtime

**Language**: PHP  
**Version**: 7.4 or higher (as specified in composer.json)  
**Build System**: Composer (autoloading)  
**Package Manager**: Composer

## Dependencies

**Runtime Requirements**:
- PHP >= 7.4
- WordPress >= 4.1

**No external packages** are required beyond standard WordPress APIs.

## Installation & Setup

```bash
# Extract to /wp-content/plugins/craftsman-suite/
# Activate from WordPress admin panel
```

**Autoloading**: PSR-4 autoloading configured in `composer.json` with namespace `CraftsmanSuite\` mapped to `app/` directory. If vendor directory exists, it's automatically loaded by the plugin.

## Main Entry Point

**Plugin File**: `craftsman-suite.php` (craftsman-suite.php:1-30)
- Loads Composer autoloader if available
- Initializes plugin via `Plugin::get_instance()` singleton

**Core Plugin Class**: `app/Plugin.php` (app/Plugin.php:1-39)
- Registers admin hooks for menu and form handling
- Loads `DevTools` admin interface on `admin_menu` hook

## Key Components

**Admin Interface**: `app/Admin/DevTools.php` (app/Admin/DevTools.php:1-162)
- Registers "Dev Tools" submenu under Tools → Dev Tools
- Displays two main tools:
  1. **Auto Attach Thumbnail**: Bulk attach media thumbnails to posts by ID range
  2. **Regenerate Thumbnails**: Delete cropped images and regenerate all thumbnail sizes
- Includes nonce verification and capability checks for security

**Utilities**:
- **Thumbnails.php**: `auto_thumbs()`, `regenerate_thumbnails()`, `clone_post_field()`, `clone_post_meta()`, `auto_set_term()`
- **MediaHelper.php**: `get_min_media_id()`, `get_max_media_id()`
- **PostTypeHelper.php**: Post type retrieval utilities

## Architecture Notes

- **Single Singleton Pattern**: Plugin uses singleton pattern for single instance initialization
- **OOP Design**: Clean object-oriented structure with namespaced classes
- **Security**: Implements WordPress nonce verification and capability checks (`current_user_can('manage_options')`)
- **Admin Forms**: POST-based form processing with JavaScript confirmation dialogs for destructive operations
- **WordPress Integration**: Uses WordPress hooks (`admin_menu`, `admin_init`) and standard APIs
