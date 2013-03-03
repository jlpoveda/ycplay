<?php
$artist = "Parov Stelar";

function get_related($artist) {
	ob_start();
	echo $artist . "\n";
	ob_end_flush();

	$url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' . urlencode($artist) . '&api_key=595b427b9ceb5defce2b51a1dc21258b&format=json';
	$curl = curl_init($url);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	$return = curl_exec($curl);
	curl_close($curl);
	$lastfm = json_decode($return, true);

	$lastfm_artist[$artist][$artist] = 1;
	foreach($lastfm['similarartists']['artist'] as $item) {
		$lastfm_artists[$artist][$item['name']] = $item['match'];
	}
	file_put_contents('lastfm_output.json', json_encode($lastfm_artists) . "\n", FILE_APPEND);

	return array($lastfm_artists, $artist);
}

$lastfm_artists = array();
$lastfm_artists_list = array();
list($lastfm, $artist) = get_related($artist);

$lastfm_artists_list[] = $artist;
//for ($i = 1; $i < 6; ++$i) {

foreach ($lastfm[$artist] as $key => $val) {
	if (!in_array($key, $lastfm_artists_list)) {
		get_related($key);
	}
}
//}
//cho json_encode($lastfm_artists);

