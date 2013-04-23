<?php
$title = $_REQUEST['title'];
$videos = json_decode($_REQUEST['list']);

$list = '[{"title":"Oliver Koletzki feat. Bosse U-Bahn - live - Astra Berlin 24.03.2012","prob":20},{"title":"Parov Stelar - The Paris Swing Box and Betty Boop Cartoon Banned For Drug Use HD","prob":20},{"title":"Parov Stelar  - The Paris Swing Box (2012)","prob":20},{"title":"Parov Stelar - The Paris Swing Box (The Princess 2012)","prob":20},{"title":"99","prob":1},{"title":"Border Colie.avi","prob":1},{"title":"Oliver Koletzki & Fran - Arrow and Bow ( Marek Hemmann Remix )","prob":20},{"title":"Oliver Koletzki - Nimm Mich Mit (with lyrics)","prob":20},{"title":"Oliver Koletzki - Reisezeit","prob":20},{"title":"BOSSE live im Waschhaus Potsdam - U-Bahn - 21.02.2012","prob":20},{"title":"The Paris Swing Box","prob":1},{"title":"Oliver Koletzki - Oh Shine","prob":20},{"title":"U-Bahn U6   München Monaco","prob":1},{"title":"Parov Stelar -- "The Paris Swing Box"","prob":20},{"title":"Sven Väth LIVE @ Nature One 2011 HQ","prob":20},{"title":"U-BAHN fahr´n","prob":20},{"title":"Hit The Road Jack@Berlin U-Bahn U2","prob":20},{"title":"Oliver Koletzki - Music From The Heart (Marco Dassi Mungus Love Act Remix)","prob":20},{"title":"RAC - Hollywood (ft. Penguin Prison) *OFFICIAL*","prob":20},{"title":"Oliver Koletzki - Zuckerwatte (Jonas Woehl Remix) | HD","prob":20},{"title":"Brummton aus dem Tunnel der U5 Therese Giehse Allee, München","prob":1},{"title":"SMS X5 2011 - Oliver Koletzki & Fran - U Bahn (Live)","prob":20},{"title":"Berlin U-Bahn U3 Dahlem Dorf","prob":1},{"title":"Oliver Koletzki - Music From The Heart (Alex Dolby Remix)","prob":20},{"title":"STURM UND DRANG","prob":1}]';
$videos = json_decode($list);

// Si la categoría es Music, empezamos el proceso de Last.fm
$aux = explode('-', $title);
$artist = trim($aux[0]);

echo '<pre>' . print_r($videos, true) . '</pre>';

$url = 'http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=' . urlencode($artist) . '&api_key=595b427b9ceb5defce2b51a1dc21258b&format=json';
$curl = curl_init($url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
$return = curl_exec($curl);
curl_close($curl);
$lastfm = json_decode($return, true);

$lastfm_artist = array();
$lastfm_artist[$artist] = 1;
foreach($lastfm['similarartists']['artist'] as $item) {
	$lastfm_artist[$item['name']] = $item['match'];
}

$videoIds = array();
$max = 0;
foreach ($videos as $idx => $video) {
 	$videoIds[] = $video['id'];
	$aux = explode('-', $video['title']);
	$artist = trim($aux[0]);
	if (in_array($artist, $lastfm_artist_keys)) {
	  $videoProbability[$idx] = $video['prob'] + 100*$lastfm_artist[$artist];
	}    
}

$prob = rand(0, max($videoProbability));
$numElements = (count($result['data']['items'])-1);
do {
    $el = rand(0, $numElements);
} while ($prob > $videoProbability[$el]);
echo $videoIds[$el];
