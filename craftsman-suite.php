<?php
/**
 * Plugin Name: Craftsman Suite
 * Plugin URI: https://github.com/tranthethang/craftsman-suite
 * Description: Craftsman Suite is the ultimate developer's workbench for WordPress theme mastery. It streamlines your workflow by automating tedious tasks: auto-attaching thumbnails, bulk regenerating images, and monitoring logs in real-time. Designed for precision and efficiency, it lets you focus on crafting beautiful code while it handles the heavy lifting.
 * Version: 1.0.1
 * Author: tranthethang
 * Author URI: https://github.com/tranthethang
 * License: GNU General Public License v3 or later
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Craftsman Suite plugin, Copyright 2014 tranthethang
 * Craftsman Suite is distributed under the terms of the GNU GPL
 *
 * Requires at least: 4.1
 * Tested up to: 4.5.2
 * Text Domain: craftsman-suite
 * Domain Path: /languages/
 *
 * @package Craftsman Suite
 */

use CraftsmanSuite\Plugin;

const CRAFTSMAN_SUITE_PLUGIN_FILE = __FILE__;

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

Plugin::get_instance();
