<?php
/**
 * Media Helper class.
 *
 * @package CraftsmanSuite\Services
 */

namespace CraftsmanSuite\Services;

/**
 * Class MediaHelper
 *
 * Helper for media related operations.
 */
class MediaHelper {

	/**
	 * Get the minimum media ID.
	 *
	 * @return int The minimum media ID.
	 */
	public static function get_min_media_id() {
		$args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'orderby'        => 'ID',
			'order'          => 'ASC',
			'fields'         => 'ids',
		);

		$posts = get_posts( $args );

		if ( ! empty( $posts ) ) {
			return intval( $posts[0] );
		}

		return 0;
	}

	/**
	 * Get the maximum media ID.
	 *
	 * @return int The maximum media ID.
	 */
	public static function get_max_media_id() {
		$args = array(
			'post_type'      => 'attachment',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'orderby'        => 'ID',
			'order'          => 'DESC',
			'fields'         => 'ids',
		);

		$posts = get_posts( $args );

		if ( ! empty( $posts ) ) {
			return intval( $posts[0] );
		}

		return 0;
	}
}
