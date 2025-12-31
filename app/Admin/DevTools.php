<?php

namespace WpBomb\Admin;

use WpBomb\Utilities\MediaHelper;
use WpBomb\Utilities\Thumbnails;

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

		$min_media_id = MediaHelper::get_min_media_id();
		$max_media_id = MediaHelper::get_max_media_id();
		?>
		<div class="px-4 sm:px-8 lg:px-12 py-8 max-w-6xl mx-auto">
			<header class="mb-8">
				<h1 class="text-3xl font-normal text-wp-text mb-2">Dev Tools</h1>
				<p class="text-sm text-wp-sub leading-relaxed max-w-3xl">
					Utility tools for WordPress developers to automate common tasks and streamline workflow.
				</p>
			</header>

			<?php $this->display_messages(); ?>

			<div class="bg-wp-surface dark:bg-[#2c3338] border-l-4 border-wp-primary shadow-wp-card p-4 mb-8 flex items-start rounded-r-sm">
				<span class="material-icons text-wp-primary mr-3 mt-0.5 flex-shrink-0">info</span>
				<div>
					<p class="text-sm text-wp-text leading-relaxed">
						Make sure to backup your database before running bulk operations.
					</p>
				</div>
			</div>

			<div class="mb-6">
				<h1 class="text-2xl font-medium text-gray-800 mb-2">Auto Attach Thumbnail</h1>
				<p class="text-[13px] text-wp-sub leading-relaxed max-w-4xl">This module scans posts within the specified ID range and automatically attaches the first image found in the content as the featured image (thumbnail) if one is not already set.</p>
			</div>

			<div class="bg-wp-surface dark:bg-[#2c3338] border border-wp-border shadow-wp-card rounded-sm overflow-hidden">
				<div class="p-6 md:p-8">
					<form method="post" action="" name="bomb-auto-thumbs-form" class="space-y-6">
						<?php \wp_nonce_field( 'bomb_auto_thumbs_action', 'bomb_auto_thumbs_nonce' ); ?>
						
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div class="space-y-2">
								<label class="block text-sm font-semibold text-wp-text" for="bomb_min_id">
									Min ID
								</label>
								<div class="relative rounded-sm shadow-sm">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<span class="text-gray-400 dark:text-gray-500 text-sm">#</span>
									</div>
									<input 
										id="bomb_min_id" 
										name="bomb_min_id" 
										placeholder="e.g. 1842" 
										type="number" 
										required
										min="0"
										value="<?php echo \esc_attr( $min_media_id ); ?>"
										style="padding-left: 28px;"
									/>
								</div>
								<p class="text-xs text-wp-sub">Starting post ID for the operation.</p>
							</div>

							<div class="space-y-2">
								<label class="block text-sm font-semibold text-wp-text" for="bomb_max_id">
									Max ID
								</label>
								<div class="relative rounded-sm shadow-sm">
									<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<span class="text-gray-400 dark:text-gray-500 text-sm">#</span>
									</div>
									<input 
										id="bomb_max_id" 
										name="bomb_max_id" 
										placeholder="e.g. 1848" 
										type="number" 
										required
										min="0"
										value="<?php echo \esc_attr( $max_media_id ); ?>"
										style="padding-left: 28px;"
									/>
								</div>
								<p class="text-xs text-wp-sub">Ending post ID for the operation.</p>
							</div>
						</div>

						<div class="pt-4 flex items-center justify-end border-t border-wp-border">
							<button 
								type="submit" 
								name="bomb_execute_thumbs"
								class="button button-primary"
								style="display: inline-flex; align-items: center; gap: 8px;"
							>
								<span class="material-icons" style="font-size: 18px;">play_arrow</span>
								Execute
							</button>
						</div>
					</form>
				</div>

				<div class="bg-gray-50 dark:bg-black/20 border-t border-wp-border p-4">
					<div class="flex items-center justify-between mb-2">
						<h4 class="text-xs font-semibold uppercase text-wp-sub tracking-wide">Output Log</h4>
						<span class="text-xs text-wp-sub">Ready to run</span>
					</div>
					<div class="h-24 bg-white dark:bg-[#101517] border border-wp-border rounded p-3 overflow-y-auto font-mono text-xs text-wp-sub">
						<span class="block mb-1">&gt; System ready...</span>
						<span class="block mb-1">&gt; Waiting for user input...</span>
					</div>
				</div>
			</div>

			<section class="mt-8">
				<div id="wp-bomb-regenerate-thumbnails-root"></div>
			</section>

			<footer class="mt-12 pt-6 border-t border-wp-border flex justify-between items-center text-xs text-wp-sub">
				<p>Thank you for creating with <a class="text-wp-primary hover:underline" href="https://wordpress.org/">WordPress</a>.</p>
				<p><?php echo \esc_html( \get_bloginfo( 'version' ) ); ?></p>
			</footer>
		</div>
		<?php
	}

	private function display_messages() {
		if ( ! isset( $_GET['bomb_message'] ) ) {
			return;
		}
		?>
		<div class="notice notice-<?php echo \esc_attr( $_GET['bomb_message_type'] ); ?> is-dismissible">
			<p><?php echo \esc_html( \wp_unslash( $_GET['bomb_message'] ) ); ?></p>
		</div>
		<?php
	}

	public static function process_auto_thumbs_form() {
		if ( ! isset( $_POST['bomb_auto_thumbs_nonce'] ) || ! \wp_verify_nonce( $_POST['bomb_auto_thumbs_nonce'], 'bomb_auto_thumbs_action' ) ) {
			return;
		}

		if ( ! \current_user_can( 'manage_options' ) ) {
			return;
		}

		$min_id = isset( $_POST['bomb_min_id'] ) ? intval( $_POST['bomb_min_id'] ) : 0;
		$max_id = isset( $_POST['bomb_max_id'] ) ? intval( $_POST['bomb_max_id'] ) : 0;

		if ( $min_id <= 0 || $max_id <= 0 || $min_id > $max_id ) {
			\wp_redirect( \admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Error: Invalid ID range. Min and Max must be valid positive numbers with Min less than or equal to Max.' ) . '&bomb_message_type=error' ) );
			exit;
		}

		try {
			Thumbnails::auto_thumbs( $min_id, $max_id );
			\wp_redirect( \admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Thumbnails attached successfully!' ) . '&bomb_message_type=success' ) );
			exit;
		} catch ( \Exception $e ) {
			\wp_redirect( \admin_url( 'tools.php?page=bomb-dev-tools&bomb_message=' . urlencode( 'Error: ' . $e->getMessage() ) . '&bomb_message_type=error' ) );
			exit;
		}
	}


}
