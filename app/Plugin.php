<?php

namespace WpBomb;

use WpBomb\Admin\DevTools;
use WpBomb\Api\RegenerateThumbnailsController;
use WpBomb\Api\AutoAttachThumbnailController;

class Plugin {
	private static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function __construct() {
		$this->load_dependencies();
		$this->init_hooks();
	}

	private function load_dependencies() {
		require_once \ABSPATH . 'wp-admin/includes/image.php';
	}

	private function init_hooks() {
		\add_action( 'admin_menu', array( $this, 'load_admin' ) );
		\add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		\add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function load_admin() {
		new DevTools();
	}

	public function register_rest_routes() {
		$regen_controller = new RegenerateThumbnailsController();
		$regen_controller->register_routes();

		$auto_attach_controller = new AutoAttachThumbnailController();
		$auto_attach_controller->register_routes();
	}

	public function enqueue_scripts( $hook ) {
		if ( 'tools_page_bomb-dev-tools' !== $hook ) {
			return;
		}

		$plugin_url = \plugin_dir_url( WP_BOMB_PLUGIN_FILE );

		// Use @wordpress/scripts build artifacts
		$asset_file = include \plugin_dir_path( WP_BOMB_PLUGIN_FILE ) . 'build/index.asset.php';

		\wp_enqueue_style(
			'wp-bomb-dev-tools',
			$plugin_url . 'assets/dist/css/dev-tools.min.css',
			array(),
			$asset_file['version']
		);

		\wp_enqueue_script(
			'wp-bomb-dev-tools',
			$plugin_url . 'build/index.js',
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);

		\wp_localize_script(
			'wp-bomb-dev-tools',
			'wpBombData',
			array(
				'nonce'      => \wp_create_nonce( 'wp_rest' ),
				'rest_url'   => \rest_url(),
				'admin_url'  => \admin_url(),
				'batch_size' => (int) \apply_filters( 'wpbomb_thumbnail_batch_size', 8 ),
			)
		);
	}
}
