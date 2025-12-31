<?php

namespace WpBomb\Admin;

class DevTools {
	public function __construct() {
		$this->register_menu();
	}

	private function register_menu() {
		\add_submenu_page(
			'tools.php',
			'Dev Tools',
			'Dev Tools',
			'manage_options',
			'bomb-dev-tools',
			array( $this, 'render_page' )
		);
	}

	public function render_page() {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( 'Unauthorized access' );
		}
		?>
		<div id="wp-bomb-dev-tools-root"></div>
		<?php
	}
}
