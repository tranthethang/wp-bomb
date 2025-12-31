<?php

namespace CraftsmanSuite\Admin;

class DevTools {
	public function __construct() {
		$this->register_menu();
	}

	private function register_menu() {
		\add_submenu_page(
			'tools.php',
			'Craftsman Suite',
			'Craftsman Suite',
			'manage_options',
			'craftsman-suite',
			array( $this, 'render_page' )
		);
	}

	public function render_page() {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( 'Unauthorized access' );
		}
		?>
		<div id="craftsman-suite-dev-tools-root"></div>
		<?php
	}
}
