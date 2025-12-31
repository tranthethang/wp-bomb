<?php
/**
 * Logger Service
 *
 * @package CraftsmanSuite\Services
 */

namespace CraftsmanSuite\Services;

/**
 * Class Logger
 */
class Logger {
	/**
	 * Log data to error log if WP_DEBUG is enabled.
	 *
	 * @param mixed $log The data to log.
	 * @return void
	 */
	public static function log( $log ) {
		if ( defined( 'WP_DEBUG' ) && true === WP_DEBUG ) {
			if ( is_array( $log ) || is_object( $log ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r, WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( print_r( $log, true ) );
			} else {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( $log );
			}
		}
	}
}
