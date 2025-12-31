<?php

namespace CraftsmanSuite\Utilities;

class Logger {
	public static function log( $log ) {
		if ( WP_DEBUG === true ) {
			if ( is_array( $log ) || is_object( $log ) ) {
				error_log( print_r( $log, true ) );
			} else {
				error_log( $log );
			}
		}
	}

	public static function list_hooked( $tag = false ) {
		global $wp_filter;

		if ( $tag ) {
			$hook[ $tag ] = $wp_filter[ $tag ];
			if ( ! is_array( $hook[ $tag ] ) ) {
				trigger_error( "Nothing found for '$tag' hook", E_USER_WARNING );
				return;
			}
		} else {
			$hook = $wp_filter;
			ksort( $hook );
		}

		echo '<pre>';

		foreach ( $hook as $tag => $priority ) {
			echo "<h3><strong>$tag</strong></h3>";
			ksort( $priority );
			foreach ( $priority as $priority => $function ) {
				echo $priority;
				foreach ( $function as $name => $properties ) {
					echo "$name<br/>";
				}
			}
		}

		echo '</pre>';
	}
}
