<?php
/**
 * Batch Processor Service.
 *
 * @package CraftsmanSuite\Services
 */

namespace CraftsmanSuite\Services;

/**
 * Class BatchProcessor
 *
 * Handles batch processing of attachment regeneration.
 */
class BatchProcessor {
	/**
	 * Maximum memory usage.
	 *
	 * @var int
	 */
	private static $max_memory = 52428800;

	/**
	 * Memory usage threshold percentage.
	 *
	 * @var float
	 */
	private static $memory_threshold = 0.9;

	/**
	 * Process a batch of attachments.
	 *
	 * @param array $attachment_ids Array of attachment IDs.
	 * @param array $selected_sizes Array of selected sizes to regenerate.
	 * @param bool  $skip_existing  Whether to skip existing sizes.
	 * @return array Results of the batch processing.
	 */
	public static function process_batch( $attachment_ids, $selected_sizes = array(), $skip_existing = false ) {
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
				$result                    = static::regenerate_single_attachment( $attachment_id, $selected_sizes, $skip_existing );
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

	/**
	 * Regenerate a single attachment.
	 *
	 * @param int   $attachment_id  Attachment ID.
	 * @param array $selected_sizes Array of selected sizes to regenerate.
	 * @param bool  $skip_existing  Whether to skip existing sizes.
	 * @return array Result of the regeneration.
	 */
	public static function regenerate_single_attachment( $attachment_id, $selected_sizes = array(), $skip_existing = false ) {
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

		// Filter sizes to generate.
		$filter_callback = function ( $sizes ) use ( $selected_sizes, $skip_existing, $metadata, $file ) {
			$dir = dirname( $file );
			foreach ( $sizes as $size => $data ) {
				// If not in selected sizes, remove it.
				if ( ! empty( $selected_sizes ) && ! in_array( $size, $selected_sizes, true ) ) {
					unset( $sizes[ $size ] );
					continue;
				}

				// If skipping existing, check if file exists.
				if ( $skip_existing && isset( $metadata['sizes'][ $size ]['file'] ) ) {
					$size_file = \trailingslashit( $dir ) . $metadata['sizes'][ $size ]['file'];
					if ( file_exists( $size_file ) ) {
						unset( $sizes[ $size ] );
					}
				}
			}
			return $sizes;
		};

		\add_filter( 'intermediate_image_sizes_advanced', $filter_callback );

		// Only delete files that are NOT being skipped.
		if ( isset( $metadata['sizes'] ) && is_array( $metadata['sizes'] ) ) {
			$sizes_to_delete = $metadata['sizes'];
			if ( $skip_existing || ! empty( $selected_sizes ) ) {
				foreach ( $sizes_to_delete as $size => $size_data ) {
					// Don't delete if we are skipping existing and it exists.
					if ( $skip_existing && isset( $size_data['file'] ) ) {
						$size_file = \trailingslashit( dirname( $file ) ) . $size_data['file'];
						if ( file_exists( $size_file ) ) {
							unset( $sizes_to_delete[ $size ] );
							continue;
						}
					}

					// Don't delete if it's not in selected sizes.
					if ( ! empty( $selected_sizes ) && ! in_array( $size, $selected_sizes, true ) ) {
						unset( $sizes_to_delete[ $size ] );
					}
				}
			}
			static::delete_thumbnail_files( $file, $sizes_to_delete );
		}

		$new_metadata = \wp_generate_attachment_metadata( $attachment_id, $file );

		\remove_filter( 'intermediate_image_sizes_advanced', $filter_callback );

		if ( ! $new_metadata ) {
			return array(
				'success' => false,
				'error'   => 'Failed to generate metadata',
				'status'  => 'generation_failed',
			);
		}

		// Merge new metadata with old if we only regenerated some sizes.
		if ( ! empty( $selected_sizes ) || $skip_existing ) {
			if ( ! isset( $new_metadata['sizes'] ) ) {
				$new_metadata['sizes'] = array();
			}
			$new_metadata['sizes'] = array_merge( $metadata['sizes'] ?? array(), $new_metadata['sizes'] );
		}

		\wp_update_attachment_metadata( $attachment_id, $new_metadata );

		return array(
			'success'           => true,
			'attachment_id'     => $attachment_id,
			'status'            => 'completed',
			'filename'          => basename( $file ),
			'sizes_regenerated' => count( $new_metadata['sizes'] ?? array() ),
		);
	}

	/**
	 * Delete thumbnail files.
	 *
	 * @param string $file  Path to the main file.
	 * @param array  $sizes Array of sizes to delete.
	 */
	private static function delete_thumbnail_files( $file, $sizes ) {
		$dir = dirname( $file );

		foreach ( $sizes as $size_data ) {
			if ( isset( $size_data['file'] ) ) {
				$file_path = \trailingslashit( $dir ) . $size_data['file'];
				if ( file_exists( $file_path ) ) {
					\wp_delete_file( $file_path );
				}
			}
		}
	}

	/**
	 * Clear object cache for an attachment.
	 *
	 * @param int $attachment_id Attachment ID.
	 */
	private static function clear_object_cache( $attachment_id ) {
		$cache_key = 'attachment_metadata_' . $attachment_id;
		\wp_cache_delete( $attachment_id, 'post' );
		\wp_cache_delete( $cache_key );
	}

	/**
	 * Check if memory usage is critical.
	 *
	 * @return bool True if memory usage is above threshold.
	 */
	private static function is_memory_critical() {
		$current = memory_get_usage( true );
		$limit   = \wp_convert_hr_to_bytes( WP_MEMORY_LIMIT );

		return ( $current / $limit ) > static::$memory_threshold;
	}
}
