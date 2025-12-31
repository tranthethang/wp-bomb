<?php
/**
 * Post Type Helper class file.
 *
 * @package CraftsmanSuite\Services
 */

namespace CraftsmanSuite\Services;

/**
 * Class PostTypeHelper
 *
 * Helper class for retrieving post types.
 */
class PostTypeHelper {

	/**
	 * Get list of supported post types.
	 *
	 * @return array List of post types.
	 */
	public static function get_types() {
		$types   = array();
		$types[] = 'post';
		$types[] = 'portfolio';
		$types[] = 'staff';
		$types[] = 'slide';
		$types[] = 'testimonial';
		$types[] = 'brand';
		$types[] = 'event';
		$types[] = 'service';
		$types[] = 'client';
		$types[] = 'download';
		$types[] = 'faq';
		$types[] = 'music';
		$types[] = 'skill';

		return $types;
	}
}
