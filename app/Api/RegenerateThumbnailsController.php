<?php

namespace WpBomb\Api;

use WpBomb\Utilities\BatchProcessor;

class RegenerateThumbnailsController {
	public function register_routes() {
		\register_rest_route(
			'wpbomb/v1',
			'/regenerate-thumbnails/attachments',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_all_attachments' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);

		\register_rest_route(
			'wpbomb/v1',
			'/regenerate-thumbnails/batch',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'process_batch' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'attachment_id' => array(
						'type'     => 'integer',
						'required' => true,
					),
				),
			)
		);

		\register_rest_route(
			'wpbomb/v1',
			'/regenerate-thumbnails/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_status' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	public function check_permission() {
		return \current_user_can( 'manage_options' );
	}

	public function get_all_attachments() {
		$attachments = \get_posts(
			array(
				'post_type'      => 'attachment',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'orderby'        => 'ID',
				'order'          => 'ASC',
			)
		);

		return new \WP_REST_Response(
			array(
				'success'           => true,
				'total'             => count( $attachments ),
				'attachment_ids'    => $attachments,
			)
		);
	}

	public function process_batch( \WP_REST_Request $request ) {
		$attachment_id = intval( $request->get_param( 'attachment_id' ) );

		if ( $attachment_id <= 0 ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Invalid or missing attachment ID',
				),
				400
			);
		}

		$result = BatchProcessor::regenerate_single_attachment( $attachment_id );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'result'  => $result,
			)
		);
	}

	public function get_status() {
		$transient = \get_transient( 'wpbomb_regen_status' );

		return new \WP_REST_Response(
			array(
				'success' => true,
				'status'  => $transient ?: array(),
			)
		);
	}
}
