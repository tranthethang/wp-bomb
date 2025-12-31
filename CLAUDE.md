# WP Bomb - Build & Development

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build CSS and JS:
   ```bash
   npm run build:prod
   ```

## Development

Watch CSS and JS files for changes:
```bash
npm run dev
```

This will automatically compile CSS and bundle JS when source files change.

### Individual Build Scripts

```bash
npm run build:css      # Compile CSS only
npm run build:js       # Bundle JS only
npm run dev:css        # Watch CSS changes
npm run dev:js         # Watch JS changes and bundle
```

## File Structure

```
assets/
├── css/
│   └── dev-tools.css                 (Source CSS with Tailwind directives)
├── dist/
│   ├── css/
│   │   └── dev-tools.min.css         (Compiled CSS output)
│   └── js/
│       ├── dev-tools.min.js          (Bundled JS entry point)
│       └── regenerate-thumbnails.js  (React component - copied as-is)
└── js/
    ├── dev-tools.js                  (Main entry point - imports modules)
    ├── auto-attach-thumbnail.js      (Auto Attach Thumbnail form logic)
    └── regenerate-thumbnails.js      (React component - Regenerate Thumbnails)

app/
├── Admin/DevTools.php                (PHP admin page template)
└── Plugin.php                        (Asset enqueuing)

tailwind.config.js                    (Tailwind configuration)
postcss.config.js                     (PostCSS configuration)
```

## Build Process

| File Type | Source | Output | Process |
|-----------|--------|--------|---------|
| CSS | `assets/css/dev-tools.css` | `assets/dist/css/dev-tools.min.css` | PostCSS + Tailwind + Autoprefixer |
| JS | `assets/js/dev-tools.js` | `assets/dist/js/dev-tools.min.js` | esbuild + bundling + minification |

## JavaScript Modules

### `assets/js/dev-tools.js` (Entry Point)
- Imports and initializes both feature modules:
  - `initAutoAttachThumbnail()` from `auto-attach-thumbnail.js`
  - `initRegenerateThumbnails()` from `regenerate-thumbnails.js`
- Initializes dark mode detection
- Single bundled output: `dev-tools.min.js`

### `assets/js/auto-attach-thumbnail.js`
- Exported function: `initAutoAttachThumbnail()`
- Handles form submission confirmation for Auto Attach Thumbnail

### `assets/js/regenerate-thumbnails.js`
- Exported function: `initRegenerateThumbnails()`
- React component for Regenerate Thumbnails feature
- Depends on WordPress `wp-api-fetch` and `wp-element`
- Bundled into `dev-tools.min.js`

## Important Notes

- **Source files**: Edit in `assets/css/` and `assets/js/`
- **Compiled output**: Auto-generated in `assets/dist/`
- **DO NOT edit** `assets/dist/` files - use build scripts instead
- **Form elements**: No custom styles - use WordPress defaults only
- **Styling**: Use Tailwind utilities for layout/spacing
- **Buttons**: Use `.button` and `.button-primary` WordPress classes
- **Colors**: Use CSS variables (--wp-primary, --wp-text, etc.)
- **Dark mode**: Via 'dark:' Tailwind prefix + system preference detection
- **JS entry point**: Only `dev-tools.min.js` is enqueued - it bundles all JavaScript including `auto-attach-thumbnail.js` and `regenerate-thumbnails.js`
- **Dependencies**: `wp-api-fetch` and `wp-element` are declared as dependencies for the bundled script
