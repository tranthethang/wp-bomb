<?php

namespace CraftsmanSuite\Api;

use CraftsmanSuite\Utilities\Thumbnails;
use CraftsmanSuite\Utilities\MediaHelper;

class AutoAttachThumbnailController {
	public function register_routes() {
		\register_rest_route(
			'craftsman-suite/v1',
			'/auto-attach-thumbnail/execute',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'execute' ),
				'permission_callback' => array( $this, 'check_permission' ),
				'args'                => array(
					'min_id' => array(
						'type'     => 'integer',
						'required' => true,
					),
					'max_id' => array(
						'type'     => 'integer',
						'required' => true,
					),
				),
			)
		);

		\register_rest_route(
			'craftsman-suite/v1',
			'/auto-attach-thumbnail/stats',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_stats' ),
				'permission_callback' => array( $this, 'check_permission' ),
			)
		);
	}

	public function check_permission() {
		return \current_user_can( 'manage_options' );
	}

	public function execute( \WP_REST_Request $request ) {
		$min_id = intval( $request->get_param( 'min_id' ) );
		$max_id = intval( $request->get_param( 'max_id' ) );

		if ( $min_id <= 0 || $max_id <= 0 || $min_id > $max_id ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Invalid ID range. Min and Max must be valid positive numbers with Min less than or equal to Max.',
				),
				400
			);
		}

		try {
			Thumbnails::auto_thumbs( $min_id, $max_id );
			return new \WP_REST_Response(
				array(
					'success' => true,
					'message' => 'Thumbnails attached successfully!',
				)
			);
		} catch ( \Exception $e ) {
			return new \WP_REST_Response(
				array(
					'success' => false,
					'message' => 'Error: ' . $e->getMessage(),
				),
				500
			);
		}
	}

	public function get_stats() {
		return new \WP_REST_Response(
			array(
				'success' => true,
				'min_id'  => MediaHelper::get_min_media_id(),
				'max_id'  => MediaHelper::get_max_media_id(),
			)
		);
	}
}
