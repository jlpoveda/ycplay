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
}
?><!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Play - Search</title>
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
    <link rel="shortcut icon" href="../assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
  </head>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <a class="brand" href="#">Project name</a>
          <form class="navbar-form pull-left" action="search.php" method="get">
            <input class="span2" type="text" placeholder="Title" name="search_query" value="<?php echo $_GET['search_query']?>">
            <button type="submit" class="btn">Search</button>
          </form>
        </div>
      </div>
    </div>


    <div class="container">
      <h1>Hello, world!</h1>
      <div class="row">
    <?php
    if ($result) {
      foreach ($result['feed']['entry'] as $idx => $video) {
        //var_dump($video);
        //echo '<pre>' . print_r($video, true) . '</pre>';
        $videoId = explode(':', $video['id']['$t']);
        $videoId = $videoId[3];
        if ($idx%6 == 0) {
          echo '</div><div class="row">';
        }
        $title = $video['title']['$t'];
        echo '<div class="span2">';
        echo '<a href="watch.php?v=' . $videoId . '">';
        echo '<img src="' . $video['media$group']['media$thumbnail'][0]['url'] . '" />';
        echo '<h5>' . $title . '</h5>';
        echo '</a>';
        echo '</div>';
      }
    }
    ?>
        </div>
      </div>
    </div>




    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="js/bootstrap.min.js"></script>
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