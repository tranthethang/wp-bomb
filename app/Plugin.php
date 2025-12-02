<?php

namespace WpBomb;

use WpBomb\Admin\DevTools;

class Plugin {
	private static $instance = null;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function __construct() {
		$this->init_hooks();
	}

	private function init_hooks() {
		add_action( 'admin_menu', array( $this, 'load_admin' ) );
		add_action( 'admin_init', array( $this, 'handle_admin_forms' ) );
	}

	public function load_admin() {
		new DevTools();
	}

	public function handle_admin_forms() {
		if ( isset( $_POST['bomb_execute_thumbs'] ) ) {
			DevTools::process_auto_thumbs_form();
		}
	}
}
