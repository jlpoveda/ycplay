<?php
if ($_GET['v']) {
    $videoId = $_GET['v'];
    $url = "http://gdata.youtube.com/feeds/api/videos/" . $videoId . "/related?v=2&alt=jsonc";
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $return = curl_exec($curl);
    curl_close($curl);
    $result = json_decode($return, true);
//    echo '<pre>' . print_r($result, true) . '</pre>';
    $url = 'https://gdata.youtube.com/feeds/api/videos/' . $videoId . '?v=2&alt=jsonc';
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $return = curl_exec($curl);
    curl_close($curl);
    $videoObj = json_decode($return, true);
//    var_dump($videoObj);
//    die();
} else {
    header('Location: /');
}
$videoIds = array();
$max = 0;
foreach ($result['data']['items'] as $idx => $video) {
    /*

Datos que puedo extraer de los vídeos relacionados:
                            [id] => K0-ucWKiTps
                            [uploaded] => 2011-12-14T18:29:03.000Z
                            [updated] => 2012-11-08T02:18:13.000Z
                            [uploader] => tiffanyalvord
                            [category] => Music
                            [title] => The One That Got Away - Katy Perry (Cover by Tiffany Alvord & Chester See)
                            [description] => Get this song on iTunes: http://bit.ly/TiffanyCovered2

                            [duration] => 248
                            [aspectRatio] => widescreen
                            [rating] => 4.894876
                            [likeCount] => 143246
                            [ratingCount] => 147112
                            [viewCount] => 16201777
                            [favoriteCount] => 0
                            [commentCount] => 27583
                            [accessControl] => Array
                                (
                                    [comment] => allowed
                                    [commentVote] => allowed
                                    [videoRespond] => moderated
                                    [rate] => allowed
                                    [embed] => allowed
                                    [list] => allowed
                                    [autoPlay] => allowed
                                    [syndicate] => allowed
                                )

Y estos son los datos que puedo extraer del video que suena

  'data' =>
    array
      'id' => string 'lXK5T8wK0VM' (length=11)
      'uploaded' => string '2012-03-08T03:10:21.000Z' (length=24)
      'updated' => string '2012-11-06T22:21:23.000Z' (length=24)
      'uploader' => string 'pleasuredmusic' (length=14)
      'category' => string 'Music' (length=5)
      'title' => string 'ChDLR - Plago' (length=13)
      'description' => string 'Like/Fav!' (length=9)
      'thumbnail' =>
        array
          'sqDefault' => string 'http://i.ytimg.com/vi/lXK5T8wK0VM/default.jpg' (length=45)
          'hqDefault' => string 'http://i.ytimg.com/vi/lXK5T8wK0VM/hqdefault.jpg' (length=47)
      'player' =>
        array
          'default' => string 'https://www.youtube.com/watch?v=lXK5T8wK0VM&feature=youtube_gdata_player' (length=72)
          'mobile' => string 'https://m.youtube.com/details?v=lXK5T8wK0VM' (length=43)
      'content' =>
        array
          5 => string 'https://www.youtube.com/v/lXK5T8wK0VM?version=3&f=videos&app=youtube_gdata' (length=74)
          1 => string 'rtsp://v6.cache4.c.youtube.com/CiILENy73wIaGQlT0QrMT7lylRMYDSANFEgGUgZ2aWRlb3MM/0/0/0/video.3gp' (length=95)
          6 => string 'rtsp://v3.cache4.c.youtube.com/CiILENy73wIaGQlT0QrMT7lylRMYESARFEgGUgZ2aWRlb3MM/0/0/0/video.3gp' (length=95)
      'duration' => int 238
      'aspectRatio' => string 'widescreen' (length=10)
      'rating' => float 5
      'likeCount' => string '3' (length=1)
      'ratingCount' => int 3
      'viewCount' => int 130
      'favoriteCount' => int 0
      'commentCount' => int 0
      'accessControl' =>
        array
          'comment' => string 'allowed' (length=7)
          'commentVote' => string 'allowed' (length=7)
          'videoRespond' => string 'moderated' (length=9)
          'rate' => string 'allowed' (length=7)
          'embed' => string 'allowed' (length=7)
          'list' => string 'allowed' (length=7)
          'autoPlay' => string 'allowed' (length=7)
          'syndicate' => string 'allowed' (length=7)



     */
    $videoIds[] = $video['id'];
    $videoProbability[$idx] = 0;
    // Si no se permite el embed, la probabilidad de que salga es 0
    if ($video['accessControl']['embed'] != 'allowed') {
        continue;
    }
    // Si no se permite el embed, la probabilidad de que salga es 0
    if ($video['accessControl']['autoPlay'] != 'allowed') {
        continue;
    }
    // Si ha sonado recientemente, tampoco debería volver a sonar
    /*
    if (ya_ha_sonado()) {
            continue;
    }
    */


    // Si es la misma categoría
    $videoProbability[$idx] += $videoObj['data']['category']==$video['category']?10:0;
    // Si el uploader es el mismo, más probabilidades
    $videoProbability[$idx] += $videoObj['data']['uploader']==$video['uploader']?5:0;
    // Si la duración del vídeo es +-30% que la del original, más probabilidad
    // Esto es para que de repente no salga una sesión larga cuando estás
    // escuchando canciones
    if ($video['duration']>$videoObj['data']['duration']*0.7 && $video['duration']<$videoObj['data']['duration']*1.3) {
        $videoProbability[$idx] += 6;
    }

//    echo $videoObj['data']['title'] . ' --- ' . $video['title'] . "<br />";
//    echo 'levenshtein: ' . (strlen($video['title']) - levenshtein($videoObj['data']['title'], $video['title'])) . "<br />";
    // Rating
    //$videoProbability[$idx] += floor($video['rating'])
    // Si el ratio entre vistos y favoritos se parecen, más probabilidad
    //$video['favoriteCount']/$video['viewCount'] == $videoObj['data']['favoriteCount']/$videoObj['data']['favoriteCount'];
}

$prob = rand(0, max($videoProbability));
$numElements = (count($result['data']['items'])-1);
do {
    $el = rand(0, $numElements);
} while ($prob > $videoProbability[$el]);
$nextVideoId = $videoIds[$el];
/*
echo 'Prob:';
var_dump($prob);
echo 'Probabilidades:';
var_dump($videoProbability);
echo 'el:';
var_dump($el);
echo 'Listado:';
var_dump($videoIds);
die();
/*
function normalize(&$item, $key, $param) {
    $item = $item/$param;
}

echo 'Probabilidades: <br />';
var_dump($videoProbability);
array_walk($videoProbability, 'normalize', array_sum(array_values($videoProbability)));
echo 'Probabilidades normalizadas: <br />';
var_dump($videoProbability);
echo 'Suma de probabilidades: <br />';
echo array_sum($videoProbability);
die();
*/
//$nextVideoId = $videoIds[rand(0, (count($result['data']['items'])-1))];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title><?php echo $videoObj['data']['title']?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Fav and touch icons -->
    <link rel="shortcut icon" href="ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="ico/apple-touch-icon-57-precomposed.png">
  </head>

  <body>
    <div id="search-result" style="background: #000; overflow: hidden"></div>

    <div class="navbar navbar-inverse">
      <div class="navbar-inner">
        <div class="container">
            <a class="brand" href="#" style="position: relative; padding-left: 38px"><img src="img/minilogo.png" alt="" style="height: 18px; position: absolute; left: 0; top: 11px;" /> infinitube</a>          
          <form class="navbar-form pull-left" action="search.php" method="get" id="search_form">
            <input class="span2" type="text" placeholder="Title" name="search_query" id="search_query" >
            <button type="submit" class="btn">Search</button>
          </form>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Main hero unit for a primary marketing message or call to action -->
      <div class="row" style="position: fixed; background: #FFF; border-bottom: 1px solid #BBB; padding: 50px 0 10px 0">
        <div class="span2">
        <h1 style="display:none"><img src="img/logo.gif" alt="Logo" /></h1>
        </div>
        <div class="span1">
        </div>
        <div class="span6">
            <h4 style="text-align: center"><?php echo $videoObj['data']['title']?></h4>
          <div id="player"></div>
        </div>
        <div class="span1">
        </div>
        <div class="span2" id="next_container">
          <a href="?v=<?php echo $nextVideoId?>" id="next"><h5></h5><img src="img/next_256_white.png" /></a>
        </div>
      </div>
      <div id="myCarousel" class="carousel" style="margin-top: 495px">
        <div class="carousel-inner">
        <div class="item">
        <?php
        $videoIds = array();
        foreach ($result['data']['items'] as $idx => $video) {
          //var_dump($video);
          //echo '<pre>' . print_r($video, true) . '</pre>';
          if ($idx != 0 && $idx%7 == 0) {
            echo '</div><div class="item">';
          }
//          echo '<div class="span2 center related_video ' . ($video['id']==$nextVideoId?'next_video':'related_video') . '">';
          echo '<div class="center related_video ' . ($video['id']==$nextVideoId?'next_video':'related_video') . '" style="float: left; width: 150px">';
          echo '<img src="' . $video['thumbnail']['sqDefault'] . '" />';
          echo '<a href="watch.php?v=' . $video['id'] . '">';
          echo '<h5>' . $video['title'] . '</h5>';
          echo '</a>';
          echo '<span style="font-size:7px">' . $video['category'] . '<span style="font-size:4px"> ';
          echo '<span style="font-size:7px">' . $videoProbability[$idx] . '<span style="font-size:4px">';
          echo '</div>';
        }
          echo '</div>';
        ?>
        </div>
          <a class="carousel-control left" href="#myCarousel" data-slide="prev">&lsaquo;</a>
          <a class="carousel-control right" href="#myCarousel" data-slide="next">&rsaquo;</a>        
      </div>

      <hr>

      <footer>
        <p>&copy; Company 2012</p>
      </footer>

    </div> <!-- /container -->

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="js/bootstrap.js"></script>
    <script>

      $(document).ready(function(){
        $('#next').css('background','transparent url(' + $('.next_video img').attr('src') + ') 0 0 no-repeat');
        $('#next h5').html($('.next_video h5').html());
        $('.carousel').carousel({interval: 5000}).carousel('pause').carousel('next');
        $('#search_form').submit(function(){
          if ($('#search_query').val()) {
            $('#search-result img').fadeOut();
          $.ajax({
            type: "GET",
            url: "ajaxsearch.php",
            dataType: "json",
            data: { search_query: $('#search_query').val() }
          }).done(function( result ) {
            jQuery.each(result, function(){
              $('#search-result').animate({height: 90}).append('<img src="' + this.thumb + '" > ');
            });
          });
          }
          return false;
        });
            

      });

      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "//www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
          videoId: '<?php echo $videoId?>',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
      }

      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
      }

      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED) {
          window.location = $('#next').attr('href');
        }
      }

      $('.related_video img').click(function(){
        $('.related_video').removeClass('next_video');
        $(this).parent().addClass('next_video');
        $('#next').attr('href', $(this).parent().find('a').attr('href')).css('background','transparent url(' + $('.next_video img').attr('src') + ') 0 0 no-repeat');
        $('#next h5').html($('.next_video h5').html());
      });

      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-3155832-7']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();

    </script>    
  </body>
</html>
