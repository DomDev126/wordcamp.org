<?php
/*
 * Plugin Name: WordCamp.org Calendar
 * PLugin Description: Returns an .ical calendar on the calendar.ical endpoint.
 */

class WordCamp_Calendar_Plugin {
	public $ttl = 1; // seconds to live

	function __construct() {
		add_filter( 'query_vars', array( $this, 'query_vars' ) );
		add_action( 'init', array( $this, 'init' ) );
		add_action( 'parse_request', array( $this, 'parse_request' ) );
	}

	function init() {
		add_rewrite_rule( '^calendar\.ics$', 'index.php?wcorg_wordcamps_ical=1', 'top' );
	}

	function query_vars( $query_vars ) {
		array_push( $query_vars, 'wcorg_wordcamps_ical' );
		return $query_vars;
	}

	function parse_request( $request ) {
		if ( empty( $request->query_vars[ 'wcorg_wordcamps_ical' ] ) )
			return;

		header( 'Content-type: text/calendar; charset=utf-8' );
		header( 'Content-Disposition: inline; filename=calendar.ics' );
		echo $this->get_ical_contents();
		exit;
	}

	function get_ical_contents() {
		$cache_key = 'wcorg_wordcamps_ical';

		$cache = get_option( $cache_key, false );
		if ( is_array( $cache ) && $cache['timestamp'] > time() - $this->ttl )
			return $cache['contents'];

		$cache = array( 'contents' => $this->generate_ical_contents(), 'timestamp' => time() );
		delete_option( $cache_key );
		add_option( $cache_key, $cache, false, 'no' );

		return $cache['contents'];
	}

	function generate_ical_contents() {
		if ( ! defined( 'WPCT_POST_TYPE_ID' ) )
			define( 'WPCT_POST_TYPE_ID', 'wordcamp' );

		$ical = 'BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
';

		$query = new WP_Query( array(
			'post_type'		 => WCPT_POST_TYPE_ID,
			'posts_per_page' => 50,
			'meta_key'       => 'Start Date (YYYY-mm-dd)',
			'orderby'        => 'meta_value',
			'order'          => 'ASC',
			'meta_query'     => array( array(
				'key'        => 'Start Date (YYYY-mm-dd)',
				'value'      => strtotime( '-15 days' ),
				'compare'    => '>'
			) )
		) );

		while ( $query->have_posts() ) {
			$query->the_post();

			$uid = get_permalink();
			$start = get_post_meta( get_the_ID(), 'Start Date (YYYY-mm-dd)', true );
			$end = get_post_meta( get_the_ID(), 'End Date (YYYY-mm-dd)', true );
			if ( ! $end )
				$end = strtotime( '+1 day', $start );

			$uid = get_the_ID();
			$title = get_the_title();
			$start = date( 'Ymd', $start );
			$end = date( 'Ymd', $end );

			$ical .= "BEGIN:VEVENT
UID:$uid
DTSTAMP;VALUE=DATE:$start
DTSTART;VALUE=DATE:$start
DTEND;VALUE=DATE:$end
SUMMARY:$title
END:VEVENT
";

		}

		$ical .= 'END:VCALENDAR';
		return $ical;
	}
}

// Go!
new WordCamp_Calendar_Plugin;

/**
 * Activation and deactivation routines.
 */
function wcorg_calendar_plugin_activate() {
	global $wp_rewrite;
	add_rewrite_rule( '^calendar\.ics$', 'index.php?wcorg_wordcamps_ical=1', 'top' );
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'wcorg_calendar_plugin_activate' );

function wcorg_calendar_plugin_deactivate() {
	flush_rewrite_rules(); // Doesn't really remove the created rule.
	delete_option( 'wcorg_wordcamps_ical' );
}
register_deactivation_hook( __FILE__, 'wcorg_calendar_plugin_deactivate' );