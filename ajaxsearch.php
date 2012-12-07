<?php
ini_set('display_errors', E_ALL);
$searchQuery = $_GET['search_query'];
if ($searchQuery) {
  $url = "https://gdata.youtube.com/feeds/api/videos?q=" . urlencode($searchQuery) . "&max-results=30&v=2&alt=json";

  $curl = curl_init($url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  $return = curl_exec($curl);
  curl_close($curl);
  $result = json_decode($return, true);

  $r = array();
    if (isset($result['feed']['entry'])) {
      foreach ($result['feed']['entry'] as $idx => $video) {
        $videoId = explode(':', $video['id']['$t']);
        $r[] = array(
            'id' => $videoId[3],
            'thumb' => $video['media$group']['media$thumbnail'][0]['url'],
            'title' => $video['title']['$t']
            );
      }
    }

    echo json_encode($r);

}
