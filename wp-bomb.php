<?php
/**
 * Plugin Name: WP Bomb
 * Plugin URI: https://github.com/tranthethang/WP-Bomb
 * Description: A comprehensive WordPress utility plugin for developers. Features include automated thumbnail attachment, post field/meta cloning, and term management. Access all tools from Tools → Dev Tools menu. Built with OOP architecture and PSR-4 autoloading.
 * Version: 1.0
 * Author: tranthethang
 * Author URI: https://github.com/tranthethang
 * License: GNU General Public License v3 or later
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 *
 * WP Bomb plugin, Copyright 2014 tranthethang
 * WP Bomb is distributed under the terms of the GNU GPL
 *
 * Requires at least: 4.1
 * Tested up to: 4.5.2
 * Text Domain: wp-bomb
 * Domain Path: /languages/
 *
 * @package WP Bomb 
 */

use WpBomb\Plugin;

define( 'WP_BOMB_PLUGIN_FILE', __FILE__ );

if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

Plugin::get_instance();
