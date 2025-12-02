<?php

namespace WpBomb\Utilities;

class Thumbnails {
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

		while ( $posts->have_posts() ):
			$posts->the_post();

			set_post_thumbnail( get_the_ID(), (int) $items[ $index ] );

			if ( $index == count( $items ) - 1 ) {
				$index = 0;
			} else {
				$index++;
			}
		endwhile;

		wp_reset_postdata();
	}

	public static function auto_set_term( $taxonomy, $terms = array(), $types = array( 'post' ) ) {
		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$posts = new \WP_Query(
			array(
				'post_type'      => $types,
				'posts_per_page' => -1,
			)
		);

		while ( $posts->have_posts() ) {
			$posts->the_post();
			wp_set_post_terms( get_the_ID(), $terms, $taxonomy, true );
		}

		wp_reset_postdata();
	}

	public static function clone_post_field( $source_id, $field_name, $types = array( 'post' ) ) {
		if ( empty( $source_id ) ) {
			return;
		}

		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$content = get_post_field( $field_name, $source_id );

		if ( $content ) {
			$posts = new \WP_Query(
				array(
					'post_type'      => $types,
					'posts_per_page' => -1,
					'post__not_in'   => array( $source_id ),
				)
			);

			while ( $posts->have_posts() ) {
				$posts->the_post();

				$_post = array(
					'ID'        => get_the_ID(),
					$field_name => $content,
				);

				wp_update_post( $_post );
			}

			wp_reset_postdata();
		}
	}

	public static function clone_post_meta( $source_id, $meta_key, $types = array( 'post' ), $single = true ) {
		if ( empty( $source_id ) ) {
			return;
		}

		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$meta_value = get_post_meta( $source_id, $meta_key, $single );

		$posts = new \WP_Query(
			array(
				'post_type'      => $types,
				'posts_per_page' => -1,
				'post__not_in'   => array( $source_id ),
			)
		);

		while ( $posts->have_posts() ) {
			$posts->the_post();
			update_post_meta( get_the_ID(), $meta_key, $meta_value );
		}

		wp_reset_postdata();
	}
}
