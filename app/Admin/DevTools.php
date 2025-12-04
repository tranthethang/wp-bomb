<?php

namespace WpBomb\Admin;

use WpBomb\Utilities\MediaHelper;
use WpBomb\Utilities\Thumbnails;

class DevTools {
	public function __construct() {
		$this->register_menu();
	}

	private function register_menu() {
		add_submenu_page(
			'tools.php',
			'Dev Tools',
			'Dev Tools',
			'manage_options',
			'bomb-dev-tools',
			array( $this, 'render_page' )
		);
	}

	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized access' );
		}

		$min_media_id = MediaHelper::get_min_media_id();
		$max_media_id = MediaHelper::get_max_media_id();
		?>
		<script>
			document.addEventListener('DOMContentLoaded', function() {
				const autoThumbsForm = document.querySelector('form[name="bomb-auto-thumbs-form"]');
				const regenerateForm = document.querySelector('form[name="bomb-regenerate-thumbs-form"]');

				if (autoThumbsForm) {
					autoThumbsForm.addEventListener('submit', function(e) {
						if (!confirm('Are you sure you want to attach thumbnails? This will set thumbnails for posts based on the specified ID range.')) {
							e.preventDefault();
						}
					});
				}

				if (regenerateForm) {
					regenerateForm.addEventListener('submit', function(e) {
						if (!confirm('This will delete all cropped thumbnail images and regenerate them for all sizes. This process cannot be undone. Continue?')) {
							e.preventDefault();
						}
					});
				}
			});
		</script>
		<div class="wrap">
			<h1>Dev Tools</h1>
			<p>Utility tools for WordPress developers to automate common tasks.</p>
			
			<?php $this->display_messages(); ?>

			<section class="bomb-section" style="margin-top: 20px;">
				<h2>Auto Attach Thumbnail</h2>
				<form method="post" action="" name="bomb-auto-thumbs-form">
					<?php wp_nonce_field( 'bomb_auto_thumbs_action', 'bomb_auto_thumbs_nonce' ); ?>
					
					<table class="form-table">
						<tr>
							<th scope="row">
								<label for="bomb_min_id">Min ID:</label>
							</th>
							<td>
								<input type="number" id="bomb_min_id" name="bomb_min_id" required min="0" value="<?php echo esc_attr( $min_media_id ); ?>" />
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="bomb_max_id">Max ID:</label>
							</th>
							<td>
								<input type="number" id="bomb_max_id" name="bomb_max_id" required min="0" value="<?php echo esc_attr( $max_media_id ); ?>" />
							</td>
						</tr>
					</table>

					<p class="submit">
						<input type="submit" class="button button-primary" value="Execute" name="bomb_execute_thumbs" />
					</p>
				</form>
			</section>

			<section class="bomb-section" style="margin-top: 20px;">
				<h2>Regenerate Thumbnails</h2>
				<p>Delete all cropped images and regenerate thumbnails for all image sizes.</p>
				<form method="post" action="" name="bomb-regenerate-thumbs-form">
					<?php wp_nonce_field( 'bomb_regenerate_thumbs_action', 'bomb_regenerate_thumbs_nonce' ); ?>
					
					<p class="submit">
						<input type="submit" class="button button-primary" value="Execute" name="bomb_execute_regenerate_thumbs" />
					</p>
				</form>
			</section>
		</div>
		<?php
	}

	private function display_messages() {
		if ( ! isset( $_GET['bomb_message'] ) ) {
			return;
		}
		?>
		<div class="notice notice-<?php echo esc_attr( $_GET['bomb_message_type'] ); ?> is-dismissible">
			<p><?php echo esc_html( wp_unslash( $_GET['bomb_message'] ) ); ?></p>
		</div>
		<?php
	}

	public static function process_auto_thumbs_form() {
		if ( ! isset( $_POST['bomb_auto_thumbs_nonce'] ) || ! wp_verify_nonce( $_POST['bomb_auto_thumbs_nonce'], 'bomb_auto_thumbs_action' ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_id = isset( $_POST['bomb_min_id'] ) ? intval( $_POST['bomb_min_id'] ) : 0;
		$max_id = isset( $_POST['bomb_max_id'] ) ? intval( $_POST['bomb_max_id'] ) : 0;

		if ( $min_id <= 0 || $max_id <= 0 || $min_id > $max_id ) {
			wp_redirect( admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Error: Invalid ID range. Min and Max must be valid positive numbers with Min less than or equal to Max.' ) . '&bomb_message_type=error' ) );
			exit;
		}

		try {
			Thumbnails::auto_thumbs( $min_id, $max_id );
			wp_redirect( admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Thumbnails attached successfully!' ) . '&bomb_message_type=success' ) );
			exit;
		} catch ( \Exception $e ) {
			wp_redirect( admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Error: ' . $e->getMessage() ) . '&bomb_message_type=error' ) );
			exit;
		}
	}

	public static function process_regenerate_thumbs_form() {
		if ( ! isset( $_POST['bomb_regenerate_thumbs_nonce'] ) || ! wp_verify_nonce( $_POST['bomb_regenerate_thumbs_nonce'], 'bomb_regenerate_thumbs_action' ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		try {
			$count = Thumbnails::regenerate_thumbnails();
			wp_redirect( admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( "Thumbnails regenerated successfully for $count images!" ) . '&bomb_message_type=success' ) );
			exit;
		} catch ( \Exception $e ) {
			wp_redirect( admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Error: ' . $e->getMessage() ) . '&bomb_message_type=error' ) );
			exit;
		}
	}
}
