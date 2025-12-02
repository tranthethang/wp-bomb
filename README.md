![WP Bomb](./assets/repo.png)

# WP Bomb

A comprehensive WordPress utility plugin for developers. WP Bomb provides essential developer tools to automate common tasks directly from the WordPress admin panel.

## Features

- **Auto Attach Thumbnail**: Automatically attach thumbnails to posts or media items within a specified ID range
- **Developer Tools Dashboard**: Access all tools from **Tools → Dev Tools** menu in WordPress admin
- **Built with Modern PHP**: Uses OOP architecture and PSR-4 autoloading for clean, maintainable code

## Requirements

- WordPress 4.1 or higher
- PHP 7.4 or higher

## Installation

1. Download the plugin
2. Extract to `/wp-content/plugins/wp-bomb/`
3. Activate the plugin from WordPress admin panel

## Usage

Navigate to **Tools → Dev Tools** in your WordPress admin panel to access the developer tools.

### Auto Attach Thumbnail

Use this tool to automatically attach thumbnails to media items:

1. Specify the Min ID and Max ID for the media range
2. Click **Execute** to process
3. The system will automatically attach thumbnails to media items within the specified range

## Architecture

- **PSR-4 Autoloading**: Clean namespace structure with `WpBomb\` prefix
- **Object-Oriented Design**: Single instance pattern for plugin initialization
- **Security**: Built-in nonce verification and capability checks

## License

GNU General Public License v3 or later

## Author

Tran The Thang - [GitHub Profile](https://github.com/tranthethang)

