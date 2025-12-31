<?php

namespace CraftsmanSuite\Utilities;

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

		while ( $posts->have_posts() ) :
			$posts->the_post();

			\set_post_thumbnail( \get_the_ID(), (int) $items[ $index ] );

			if ( $index == count( $items ) - 1 ) {
				$index = 0;
			} else {
				++$index;
			}
		endwhile;

		\wp_reset_postdata();
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
			\wp_set_post_terms( \get_the_ID(), $terms, $taxonomy, true );
		}

		\wp_reset_postdata();
	}

	public static function clone_post_field( $source_id, $field_name, $types = array( 'post' ) ) {
		if ( empty( $source_id ) ) {
			return;
		}

		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$content = \get_post_field( $field_name, $source_id );

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
					'ID'        => \get_the_ID(),
					$field_name => $content,
				);

				\wp_update_post( $_post );
			}

			\wp_reset_postdata();
		}
	}

	public static function clone_post_meta( $source_id, $meta_key, $types = array( 'post' ), $single = true ) {
		if ( empty( $source_id ) ) {
			return;
		}

		if ( empty( $types ) ) {
			$types = PostTypeHelper::get_types();
		}

		$meta_value = \get_post_meta( $source_id, $meta_key, $single );

		$posts = new \WP_Query(
			array(
				'post_type'      => $types,
				'posts_per_page' => -1,
				'post__not_in'   => array( $source_id ),
			)
		);

		while ( $posts->have_posts() ) {
			$posts->the_post();
			\update_post_meta( \get_the_ID(), $meta_key, $meta_value );
		}

		\wp_reset_postdata();
	}

	public static function regenerate_thumbnails() {
		$attachments = \get_posts(
			array(
				'post_type'      => 'attachment',
				'posts_per_page' => -1,
				'fields'         => 'ids',
			)
		);

		$count = 0;

		foreach ( $attachments as $attachment_id ) {
			$file = \get_attached_file( $attachment_id );
			if ( ! $file || ! file_exists( $file ) ) {
				continue;
			}

			$metadata = \wp_get_attachment_metadata( $attachment_id );
			if ( ! $metadata ) {
				continue;
			}

			if ( isset( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ) {
				foreach ( $metadata['sizes'] as $size => $size_data ) {
					if ( isset( $size_data['file'] ) ) {
						$file_path = \trailingslashit( dirname( $file ) ) . $size_data['file'];
						if ( file_exists( $file_path ) ) {
							@unlink( $file_path );
						}
					}
				}

				$metadata['sizes'] = array();
			}

			$new_metadata = \wp_generate_attachment_metadata( $attachment_id, $file );
			if ( $new_metadata ) {
				\wp_update_attachment_metadata( $attachment_id, $new_metadata );
				++$count;
			}
		}

		return $count;
	}
}
