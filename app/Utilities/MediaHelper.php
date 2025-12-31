<?php

namespace CraftsmanSuite\Utilities;

class MediaHelper {
	public static function get_min_media_id() {
		global $wpdb;
		$min_id = $wpdb->get_var( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' ORDER BY ID ASC LIMIT 1" );
		return $min_id ? intval( $min_id ) : 0;
	}

	public static function get_max_media_id() {
		global $wpdb;
		$max_id = $wpdb->get_var( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'attachment' ORDER BY ID DESC LIMIT 1" );
		return $max_id ? intval( $max_id ) : 0;
	}
}
