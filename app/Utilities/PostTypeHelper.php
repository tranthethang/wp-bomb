<?php

namespace WpBomb\Utilities;

class PostTypeHelper {
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
