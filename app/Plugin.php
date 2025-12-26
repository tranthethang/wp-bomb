<?php

namespace WpBomb;

use WpBomb\Admin\DevTools;
use WpBomb\Api\RegenerateThumbnailsController;

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
		\add_action( 'admin_init', array( $this, 'handle_admin_forms' ) );
		\add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
		\add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function load_admin() {
		new DevTools();
	}

	public function handle_admin_forms() {
		if ( isset( $_POST['bomb_execute_thumbs'] ) ) {
			DevTools::process_auto_thumbs_form();
		}
	}

	public function register_rest_routes() {
		$controller = new RegenerateThumbnailsController();
		$controller->register_routes();
	}

	public function enqueue_scripts( $hook ) {
		if ( 'tools_page_bomb-dev-tools' !== $hook ) {
			return;
		}

		\wp_enqueue_script(
			'wp-bomb-regenerate-thumbnails',
			\plugin_dir_url( WP_BOMB_PLUGIN_FILE ) . 'assets/js/regenerate-thumbnails.js',
			array( 'wp-api-fetch', 'wp-element' ),
			'1.1',
			true
		);

		\wp_localize_script(
			'wp-bomb-regenerate-thumbnails',
			'wpBombData',
			array(
				'nonce'      => \wp_create_nonce( 'wp_rest' ),
				'rest_url'   => \rest_url(),
				'batch_size' => (int) \apply_filters( 'wpbomb_thumbnail_batch_size', 8 ),
			)
		);

		\wp_enqueue_style(
			'wp-bomb-regenerate-thumbnails',
			\plugin_dir_url( WP_BOMB_PLUGIN_FILE ) . 'assets/css/regenerate-thumbnails.css',
			array(),
			'1.1'
		);
	}
}
