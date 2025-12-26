<?php

namespace WpBomb\Utilities;

class BatchProcessor {
	private static $max_memory = 52428800;
	private static $memory_threshold = 0.9;

	public static function process_batch( $attachment_ids ) {
		$results = array();

		foreach ( $attachment_ids as $attachment_id ) {
			if ( static::is_memory_critical() ) {
				$results[ $attachment_id ] = array(
					'success'  => false,
					'error'    => 'Memory limit approaching. Batch paused.',
					'status'   => 'paused',
				);
				continue;
			}

			try {
				$result                     = static::regenerate_single_attachment( $attachment_id );
				$results[ $attachment_id ] = $result;
			} catch ( \Exception $e ) {
				$results[ $attachment_id ] = array(
					'success' => false,
					'error'   => $e->getMessage(),
					'status'  => 'failed',
				);
			}
		}

		return $results;
	}

	public static function process_batch_optimized( $attachment_ids ) {
		$results = array();

		foreach ( $attachment_ids as $attachment_id ) {
			if ( static::is_memory_critical() ) {
				$results[ $attachment_id ] = array(
					'success' => false,
					'error'   => 'Memory limit approaching. Batch paused.',
					'status'  => 'paused',
				);
				continue;
			}

			try {
				$result                     = static::regenerate_single_attachment( $attachment_id );
				$results[ $attachment_id ] = $result;

				static::clear_object_cache( $attachment_id );
			} catch ( \Exception $e ) {
				$results[ $attachment_id ] = array(
					'success' => false,
					'error'   => $e->getMessage(),
					'status'  => 'failed',
				);
			}
		}

		return $results;
	}

	public static function regenerate_single_attachment( $attachment_id ) {
		$file = \get_attached_file( $attachment_id );
		if ( ! $file || ! file_exists( $file ) ) {
			return array(
				'success' => false,
				'error'   => 'Source file not found',
				'status'  => 'missing_source',
			);
		}

		$metadata = \wp_get_attachment_metadata( $attachment_id );
		if ( ! $metadata ) {
			return array(
				'success' => false,
				'error'   => 'No metadata found',
				'status'  => 'no_metadata',
			);
		}

		if ( isset( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ) {
			static::delete_thumbnail_files( $file, $metadata['sizes'] );
		}

		$new_metadata = \wp_generate_attachment_metadata( $attachment_id, $file );

		if ( ! $new_metadata ) {
			return array(
				'success' => false,
				'error'   => 'Failed to generate metadata',
				'status'  => 'generation_failed',
			);
		}

		\wp_update_attachment_metadata( $attachment_id, $new_metadata );

		return array(
			'success'           => true,
			'attachment_id'     => $attachment_id,
			'status'            => 'completed',
			'sizes_regenerated' => count( $new_metadata['sizes'] ?? array() ),
		);
	}

	private static function delete_thumbnail_files( $file, $sizes ) {
		$dir = dirname( $file );

		foreach ( $sizes as $size_data ) {
			if ( isset( $size_data['file'] ) ) {
				$file_path = \trailingslashit( $dir ) . $size_data['file'];
				if ( file_exists( $file_path ) ) {
					@\wp_delete_file( $file_path );
				}
			}
		}
	}

	private static function clear_object_cache( $attachment_id ) {
		$cache_key = 'attachment_metadata_' . $attachment_id;
		\wp_cache_delete( $attachment_id, 'post' );
		\wp_cache_delete( $cache_key );
	}

	private static function is_memory_critical() {
		$current = memory_get_usage( true );
		$limit   = \wp_convert_hr_to_bytes( WP_MEMORY_LIMIT );

		return ( $current / $limit ) > static::$memory_threshold;
	}
}
