<?php
if ($_GET['v']) {
  $videoId = $_GET['v'];
  $url = "http://gdata.youtube.com/feeds/api/videos/" . $videoId . "/related?v=2&alt=jsonc";
  $curl = curl_init($url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  $return = curl_exec($curl);
  curl_close($curl);
  $result = json_decode($return, true);

    $url = 'https://gdata.youtube.com/feeds/api/videos/' . $videoId . '?v=2&alt=jsonc';
    $curl = curl_init($url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $return = curl_exec($curl);
    curl_close($curl);
    $videoObj = json_decode($return, true);
} else {
  header('Location: /');
}
$videoIds = array();
foreach ($result['data']['items'] as $idx => $video) {
  $videoIds[] = $video['id'];
}
$nextVideoId = $videoIds[rand(0, (count($result['data']['items'])-1))];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Play - Watch</title>
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

    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <a class="brand" href="#">Project name</a>
          <form class="navbar-form pull-left" action="search.php" method="get">
            <input class="span2" type="text" placeholder="Title" name="search_query">
            <button type="submit" class="btn">Search</button>
          </form>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Main hero unit for a primary marketing message or call to action -->
      <div class="row" style="position: fixed; background: #FFF; border-bottom: 1px solid #BBB; padding: 50px 0 10px 0">
        <div class="span1">
          <h1>Play</h1>
        </div>
        <div class="span2">
        </div>
        <div class="span6">
            <h4 style="text-align: center"><?php echo $videoObj['data']['title']?></h4>
          <div id="player"></div>
        </div>
        <div class="span2">
        </div>
        <div class="span1">
          <h1><a href="?v=<?php echo $nextVideoId?>" id="next">Nxt</a></h1>
        </div>
      </div>
      <div class="row" style="padding-top: 495px">

        <?php
        $videoIds = array();
        foreach ($result['data']['items'] as $idx => $video) {
          //var_dump($video);
          //echo '<pre>' . print_r($video, true) . '</pre>';
          if ($idx%6 == 0) {
            echo '</div><div class="row">';
          }
          echo '<div class="span2 center related_video ' . ($video['id']==$nextVideoId?'next_video':'related_video') . '">';
          echo '<img src="' . $video['thumbnail']['sqDefault'] . '" />';
          echo '<a href="watch.php?v=' . $video['id'] . '">';
          echo '<h5>' . $video['title'] . '</h5>';
          echo '</a>';
          echo '<small>' . $video['category'] . '</small>';
          echo '</div>';
        }
        ?>
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
        $('#next').attr('href', $(this).parent().find('a').attr('href'));
      });

    </script>
    <script type="text/javascript">

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
