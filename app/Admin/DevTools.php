<?php
/**
 * DevTools class file.
 *
 * @package CraftsmanSuite\Admin
 */

namespace CraftsmanSuite\Admin;

/**
 * Class DevTools
 *
 * Handles the developer tools admin page.
 */
class DevTools {
	/**
	 * DevTools constructor.
	 */
	public function __construct() {
		$this->register_menu();
	}

	/**
	 * Registers the submenu page under Tools.
	 */
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

	/**
	 * Renders the admin page content.
	 */
	public function render_page() {
		if ( ! \current_user_can( 'manage_options' ) ) {
			\wp_die( 'Unauthorized access' );
		}
		?>
		<div id="craftsman-suite-dev-tools-root"></div>
		<?php
	}
}
