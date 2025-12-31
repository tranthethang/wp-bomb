<?php
/**
 * Thumbnails service file.
 *
 * @package CraftsmanSuite\Services
 */

namespace CraftsmanSuite\Services;

/**
 * Class Thumbnails
 */
class Thumbnails {
	/**
	 * Auto attach thumbnails to posts.
	 *
	 * @param int   $min   Minimum attachment ID.
	 * @param int   $max   Maximum attachment ID.
	 * @param array $items Array of attachment IDs.
	 * @param array $types Post types to attach thumbnails to.
	 *
	 * @return void
	 */
	public static function auto_thumbs( $min = 0, $max = 0, $items = array(), $types = array( 'post' ) ) {
		if ( $min && $max ) {
			$items = array();
			for ( $i = $min; $i <= $max; $i++ ) {
				$items[] = $i;
			}
		}

		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$posts = new \WP_Query(
			array(
				'post_type'      => $types,
				'posts_per_page' => -1,
			)
		);

		$index = 0;

		while ( $posts->have_posts() ) :
			$posts->the_post();

			\set_post_thumbnail( \get_the_ID(), (int) $items[ $index ] );

			if ( count( $items ) - 1 === $index ) {
				$index = 0;
			} else {
				++$index;
			}
		endwhile;

		\wp_reset_postdata();
	}
}
