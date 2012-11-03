<?php
if ($_GET['v']) {
  $videoId = $_GET['v'];
  $url = "http://gdata.youtube.com/feeds/api/videos/" . $videoId . "/related?v=2&alt=jsonc";
  $curl = curl_init($url);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  $return = curl_exec($curl);
  curl_close($curl);
  $result = json_decode($return, true);  
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Bootstrap, from Twitter</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
    </style>
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
      <div class="row">
        <div class="span1">
          <h1>Play</h1>
        </div>
        <div class="span2">
        </div>
        <div class="span6">
          <object width="640" height="360">
            <param name="movie" value="https://www.youtube.com/v/<?php echo $videoId; ?>?version=3"></param>
            <param name="allowFullScreen" value="true"></param>
            <param name="allowScriptAccess" value="always"></param>
            <embed src="https://www.youtube.com/v/<?php echo $videoId; ?>?version=3" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="always" width="640" height="360"></embed>
          </object>
        </div>
        <div class="span2">
        </div>
        <div class="span1">
          <h1>Nxt</h1>
        </div>
      </div>
      <div class="row">

        <?php
        foreach ($result['data']['items'] as $idx => $video) {
        //var_dump($video);
        //echo '<pre>' . print_r($video, true) . '</pre>';
        if ($idx%6 == 0) {
          echo '</div><div class="row">';
        }
        echo '<div class="span2 center">';
        echo '<a href="watch.php?v=' . $video['id'] . '">';
        echo '<img src="' . $video['thumbnail']['sqDefault'] . '" />';
        echo '<h5>' . $video['title'] . '</h5>';
        echo '</a>';
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
    <script src="js/jquery.js"></script>
    <script src="js/bootstrap-transition.js"></script>
    <script src="js/bootstrap-alert.js"></script>
    <script src="js/bootstrap-modal.js"></script>
    <script src="js/bootstrap-dropdown.js"></script>
    <script src="js/bootstrap-scrollspy.js"></script>
    <script src="js/bootstrap-tab.js"></script>
    <script src="js/bootstrap-tooltip.js"></script>
    <script src="js/bootstrap-popover.js"></script>
    <script src="js/bootstrap-button.js"></script>
    <script src="js/bootstrap-collapse.js"></script>
    <script src="js/bootstrap-carousel.js"></script>
    <script src="js/bootstrap-typeahead.js"></script>

  </body>
</html>
