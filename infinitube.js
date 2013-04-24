google.load("swfobject","2.2");
google.load("jquery","1");
google.load("jqueryui","1");
var INITIAL_VID_THUMBS=24;
var currentVideoId = '';
var videoItems = {};
var currentVideo = {};
var playlistObjects = [];
var favObjects = [];
var xhrWorking = false;
var ytplayer = '';

// http://www.simonbingham.me.uk/index.cfm/main/post/uuid/using-html5-local-storage-and-jquery-to-persist-form-data-47
function _run(){
    loadPlayer();
    $(document).on('click', '.playlist-trash', function(event){
        if(countPlaylistItems() > 1){
            $(this).parent().parent().fadeOut('fast',function(){$(this).remove();savePlaylist();});
            _gaq.push(['_trackEvent', 'Playlist', 'delete', 1]);
        }
    }).on('click', '.playlist-play', function(event){
        var id=$(this).parent().parent().attr('id').substring(1);
        var title=$(this).parent().parent().find('small').html();
        _gaq.push(['_trackEvent', 'Video', 'Play', 'Playlist']);
        goVideo(id, title);
    });
    $('#formsearch').submit(function(){
        return false;
    })
    $( "#playlisttable" ).sortable();
    $( "#playlisttable" ).disableSelection();

    _initPlaylist();
    _initFavlist();
}
function countPlaylistItems(){
    return $('#playlisttable tr').length;
}
function loadPlayer(){
    currentVideoId='wcv3v6XfEvM';
    var params={allowScriptAccess:"always"};
    var atts={id:"ytPlayer",allowFullScreen:"true"};
    swfobject.embedSWF("http://www.youtube.com/v/"+currentVideoId+"&enablejsapi=1&playerapiid=ytplayer"+"&rel=0&autoplay=0&egm=0&loop=0&fs=1&hd=0&showsearch=0&showinfo=0&iv_load_policy=3&cc_load_policy=1","innerVideoDiv","700","420","8",null,null,params,atts);
}
function playlistToJson(){
    return listToJson('playlisttable');
}
function favToJson(){
    return listToJson('favlisttable');
}
function listToJson(element){
    var items=$('#'+element+' tr');
    var array=[];
    $.each(items, function(){
        array.push({'id': $(this).attr('id').substring(1), 'title':$(this).find('small').html()});
    });
    return JSON.stringify(array);
}
function savePlaylist(){
    localStorage.setItem('playlist', playlistToJson());
}
function getPlaylist(){
    var playlist=localStorage.getItem('playlist');
    return JSON.parse(playlist);
}
function getFavlist(){
    var playlist=localStorage.getItem('fav');
    return JSON.parse(playlist);
}
function saveFav(){
    localStorage.setItem('fav', favToJson());
    favObjects=[];
}
function _initFavlist(){
    var items=getFavlist();
    if(items.length>0){
        $.each(items, function(){
            addToFav(this.id, this.title);
        });
    }
}
function _initPlaylist(){
    var items=getPlaylist();
    if(items.length>0){
        $.each(items, function(){
            addToPlaylist(this.id, this.title);
        });
    }
}
function addToFav(videoId, title){
    if(videoId==''){
        videoId=currentVideo.id;
    }
    if(title==''){
        title=currentVideo.title;
    }
    _gaq.push(['_trackEvent', 'Favorites', 'Add', videoId]);
    favObjects.push({'id':videoId,'title':title});
    var str='<tr id="f'+videoId+'"><td><img src="http://i.ytimg.com/vi/'+videoId+'/default.jpg" class="minithumb" /></td><td><small>'+title+'</small></td><td><i class="playlist-trash icon-trash"></i><i class="icon-play playlist-play"></i></td></tr>';
//    $('#f'+currentVideoId).remove();
    $('#favlisttable').html($('#favlisttable').html()+str);
    saveFav();
}
function addToPlaylist(videoId, title){
    playlistObjects.push({'id':videoId,'title':title});
    var str='<tr id="r'+videoId+'"><td><img src="http://i.ytimg.com/vi/'+videoId+'/default.jpg" class="minithumb" /></td><td><small>'+title+'</small></td><td><i class="playlist-trash icon-trash"></i><i class="icon-play playlist-play"></i></td></tr>';
    $('#r'+currentVideoId).remove();
    $('#playlisttable').html($('#playlisttable').html()+str);
    savePlaylist();
}
function onYouTubePlayerReady(playerId){
    onBodyLoad();
	ytplayer=document.getElementById("ytPlayer");
	ytplayer.addEventListener("onStateChange","onPlayerStateChange");
	var searchBox=$('#searchBox');
//	searchBox.keyup(doInstantSearch);
	// $(document.documentElement).keydown(onKeyDown);
	$('#buttonControl').click(playPause);
	$('#linkUrl').click(function(e){
		$(this).select();
	});
	$('#embedUrl').click(function(e){
		$(this).select();
	});
    if(location.search){
        var search = location.search;
        if(search.substring(0,3)=='?v='){
            _gaq.push(['_trackEvent', 'Video', 'Play', 'Init']);
            loadAndPlayVideo(search.substring(3));
        }
    }else if(window.location.hash){
        var h = getHash();
        if(h.substring(0,1)=='v'){
            _gaq.push(['_trackEvent', 'Video', 'Play', 'Init']);
            loadAndPlayVideo(h.substring(2));
        }else if(h.substring(0,1)=='s'){
            $('#searchBox').val(h.substring(2)).focus();
            _gaq.push(['_trackEvent', 'Search', 'Init', $('#searchBox').val()]);
            doSearch();
        }
    }else{
		var defaultSearches=['Parov Stelar', 'Paul Kalkbrenner', 'Peer Kusiv'];
		var randomNumber=Math.floor(Math.random()*defaultSearches.length);
		$('#searchBox').val(defaultSearches[randomNumber]).select().focus();
	}
    $('#searchButton').click(function(){
        _gaq.push(['_trackEvent', 'Search', 'Button', $('#searchBox').val()]);
        doSearch();
    });
    $('#searchBox').keypress(function(e){
        if (e.which == 13){
            _gaq.push(['_trackEvent', 'Search', 'Enter', $('#searchBox').val()]);
            doSearch();
        }
    });  
//    doInstantSearch();
}
function onBodyLoad(){
	currentSearch='';
	currentSuggestion='';
	currentVideoId='';
	playlistShowing=false;
	playlistArr=[];
	currentPlaylistPos=0;
    currentPlaylistPage=0;
    xhrWorking=false;
    pendingSearch=false;
    pendingDoneWorking=false;
    playerState=-1;
    hashTimeout=false;
    videoList=[];
}
function onPlayerStateChange(newState){
	playerState=newState;
	if(pendingDoneWorking&&playerState==1){
		doneWorking();
		pendingDoneWorking=false;
        $('.toolPlayPause').removeClass('icon-play').addClass('icon-pause');
	}else if(playerState==0){
        $('.toolPlayPause').removeClass('icon-pause').addClass('icon-play');
		goNextVideo();
        _gaq.push(['_trackEvent', 'Video', 'Next', 'Auto']);
    }
}
function goNextVideo(){
    var id=$('#playlisttable tr').first().attr('id').substring(1);
    var title=$('#playlisttable tr').first().find('small').html();
    _gaq.push(['_trackEvent', 'Video', 'Next', 'NextButton']);

    History.pushState({'id':id,'Title':title},title,'?v='+id);
}
function goVideo(videoId, title){
    History.pushState({'id':videoId,'Title':title},title,'?v='+videoId);
}

function goPrevVideo(){
	// if(currentPlaylistPos==0){
	// 	return;
	// }
	// goVid(currentPlaylistPos-1,currentPlaylistPage);
}
// function goVid(playlistPos,playlistPage){
// 	// if(playlistPage!=currentPlaylistPage){
// 	// 	currentPlaylistPage=playlistPage;
// 	// 	return;
// 	// }
// 	loadAndPlayVideo(playlistArr[playlistPage][playlistPos].id);
// }
function doSearch(){
    if(xhrWorking){
        pendingSearch=true;
        return;
    }
    updateHash('s='+$('#searchBox').val());
    getTopSearchResult($('#searchBox').val());
}
function getTopSearchResult(keyword, page){
    if(!page){
        page = 0;
    }
    var the_url='http://gdata.youtube.com/feeds/api/videos?q='+encodeURIComponent(keyword)+'&format=5&max-results='+INITIAL_VID_THUMBS+'&v=2&alt=jsonc';
    $.ajax({
        type:"GET",
        url:the_url,
        dataType:"jsonp",
        cache : true,
        jsonpCallback : 'cachedapp',
        success:function(responseData,textStatus,XMLHttpRequest){
            if(responseData.data.items){
                var videos=responseData.data.items;
                // playlistArr=[];
                // playlistArr.push(videos);
                updateVideoDisplay(videos);
                pendingDoneWorking=true;
                pendingSearch=false;
                scrollToElement('#thumbswrapper');
            }else{
                updateSuggestedKeyword('No results for "'+keyword+'"');
                doneWorking();
            }
        }
    });
}
function scrollToElement(element){
    // Hacer que no se haga scroll si el elemento no está fuera 
    // del window
    $('html, body').animate({
        scrollTop: $(element).offset().top
    }, 1000);                
}
function getRelatedVideos(videoId, page){
    if(!page){
        page = 0;
    }
    var the_url='http://gdata.youtube.com/feeds/api/videos/'+videoId+'/related?v=2&max-results='+INITIAL_VID_THUMBS+'&start-index='+(INITIAL_VID_THUMBS*page+1)+'&alt=jsonc';
    $.ajax({
        type:"GET",
        url:the_url,
        dataType:"jsonp",
        cache : true,
        jsonpCallback : 'cachedapp',
        success:function(responseData,textStatus,XMLHttpRequest){
            if(responseData.data.items){
                videoItems=responseData.data.items;
                // playlistArr=[];
                // playlistArr.push(videos);
                updateVideoDisplay(videoItems);
                fillVideoInfo(currentVideoId);
                pendingDoneWorking=true;
            }else{
//                updateSuggestedKeyword('No results for "'+keyword+'"');
                doneWorking();
            }
        }
    });
}
function getRelatedArtists(artist){
    var the_url='http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist='+encodeURIComponent(artist)+'&api_key=595b427b9ceb5defce2b51a1dc21258b&format=json';
    $.ajax({
        type:"GET",
        url:the_url,
        cache : true,
        jsonpCallback : 'cachedapp',
        dataType:"jsonp",
        success:function(responseData,textStatus,XMLHttpRequest){
            selectNextMusicVideo(responseData, artist);
            // return responseData;
        }
    });
}
function selectNextMusicVideo(lastfmData, artist){
    var numItems=videoItems.length;
    var lastfmArtists={};
    var numLastfmItems=lastfmData.similarartists.artist.length;
    var prob=0;
    var tmp=0;
    var str='';
    var a = '';
    var videosTmp=[];
    var maxProb = 0;
    var rndProb = 0;
    var match=0;
    for(i=0;i<numLastfmItems;i++){
        if(typeof lastfmData.similarartists.artist[i].name != 'undefined') {
            str = lastfmData.similarartists.artist[i].name;
            str = str.NormalizeUrl();
            match=lastfmData.similarartists.artist[i].match;
            str="lastfmArtists.a"+str+"="+match+";";
            eval(str);
        }
    }
    for(i=0; i<numItems; i++){
        prob=0;
        if('Music'==videoItems[i].category){
            prob+=5;
        }
        if(videoItems[i].category=='Music'){
            var tmp = videoItems[i].title.split('-');
            if(tmp[0].trim()==artist){
                prob=prob+100;
            }else if(tmp[0].trim()!=videoItems[i].title){
                if(numLastfmItems>0){
                    a=tmp[0];
                    str=a.NormalizeUrl();
                    eval("tmp=lastfmArtists.a"+str+";");
                    if(typeof tmp!='undefined'){
                        prob=prob+(100*parseFloat(tmp));
                    }
                }
            }
        }
        videosTmp[i]={'id':videoItems[i].id,'prob':prob,'title':videoItems[i].title};
        if(maxProb<prob){
            maxProb=prob;
        }
    }
    rndProb=Math.floor((Math.random()*maxProb)+1);
    i=0;
    do {
        rndItem=Math.floor((Math.random()*numItems));
        i++;
    }while(videosTmp[rndItem].prob<rndProb || i<60);
    addToPlaylist(videosTmp[rndItem].id,videosTmp[rndItem].title);
}
function selectNextVideo(videos, currentVideoInfo){
    currentVideo=currentVideoInfo;
    if(currentVideo.category=='Music'){
        var currentVideoTitle = currentVideoInfo.title.split('-');
        getRelatedArtists(currentVideoTitle[0].trim());
        return;
    }
    var numItems=videoItems.length;
    var prob=0;
    var tmp=0;
    var str='';
    var a = '';
    var videosTmp=[];
    var maxProb = 0;
    var rndProb = 0;
    var match=0;
    for(i=0; i<numItems; i++){
        prob=0;
        if(currentVideo.category==videoItems[i].category){
            prob+=10;
        }
        videosTmp[i]={'id':videoItems[i].id,'prob':prob,'title':videoItems[i].title};
        if(maxProb<prob){
            maxProb=prob;
        }
    }
    rndProb=Math.floor((Math.random()*maxProb));
    i=0;
    do {
        rndItem=Math.floor((Math.random()*numItems));
        i++;
    }while(videosTmp[rndItem].prob<rndProb || i<60);
    //$('#a'+videosTmp[rndItem].id).addClass('nextVideo');
    addToPlaylist(videosTmp[rndItem].id,videosTmp[rndItem].title);
}
function updateVideoDisplay(videos){
    var numThumbs=(videos.length>=INITIAL_VID_THUMBS)?INITIAL_VID_THUMBS:videos.length;

    var relatedVideos = '<ul class="inline unstyled related">';
    for(var i=0;i<numThumbs;i++){
        var tmp='<li id="a'+videos[i].id+'" class="span2 relatedvideos"><a href="javascript:setNextVideo(\''+videos[i].id+'\')"><img src="' + videos[i].thumbnail.sqDefault + '"></a><ul class="unstyled videoinfo"><li class="pagination-centered videoinfotitle"><a href="javascript:goVideo(\''+videos[i].id+'\',\''+videos[i].title+'\')">' + videos[i].title + '</a></li><li class="hidden">' + videos[i].category + '</li></ul></li>';
        relatedVideos = relatedVideos + tmp;
    }
    relatedVideos = relatedVideos + '</ul>';
    // var playlist=$('<div />').attr('id','playlist');
    // var li=$('<li />');
    // li.addClass('span2');
    // for(var i=0;i<numThumbs;i++){
    //     var videoId=videos[i].id;
    //     var img=$('<img />').attr('src',videos[i].thumbnail.sqDefault);
    //     var a=$('<a />')
    //         .attr('id', videoId)
    //         .attr('href',"javascript:loadAndPlayVideo('"+videoId+"', "+i+")");
    //     videoList[i] = {'id':videos[i].id, 'category':videos[i].category, 'title':videos[i].title};
    //     var title=$('<div />').html(videos[i].title);
    //     playlist.append(a.append(img).append(title));
    // }
    $('#thumbswrapper').html(relatedVideos);
    playlist = '';
//    if(!playlistShowing){
//        playlistWrapper.slideDown('slow');
//        playlistShowing=true;
//    }
//    currentPlaylistPos=-1;
//    if(doPlay == true){
//        if(currentVideoId!=videos[0].id){
//            loadAndPlayVideo(videos[0].id,0,true);
//        }
//    }
}
function doneWorking(){
    xhrWorking=false;
    if(pendingSearch){
        pendingSearch=false;
        doInstantSearch();
    }
    var searchBox=$('#searchBox');
    searchBox.attr('class','statusPlaying');
}
function updateHTML(elmId,value){
    document.getElementById(elmId).innerHTML=value;
}
function setNextVideo(videoId){
    _gaq.push(['_trackEvent', 'Videos', 'addToPlaylist', 'RelatedButton']);
    addToPlaylist(videoId,$('#a'+videoId+' .videoinfotitle').html());
    var options = { to: "#playlistlink", className: "ui-effects-transfer" };
    $( "#a"+videoId ).effect('transfer', options, 500);
}
function updateSuggestedKeyword(keyword){
    updateHTML('searchTermKeyword',keyword);
}
function updateHash(hash){
    var timeDelay=1000;
    if(hashTimeout){
        clearTimeout(hashTimeout);
    }
    hashTimeout=setTimeout(function(){
        window.location.replace("#"+encodeURI(hash))
        // $('#fb_share').attr('share_url',window.location);
        // $.ajax({
        //     type:"GET",
        //     url:"http://static.ak.fbcdn.net/connect.php/js/FB.Share",
        //     dataType:"script"
        // });
        // $('#linkUrl').val(window.location);
        document.title='"'+currentSuggestion.toTitleCase()+'" on Infinitube!';
        // prepareFBShare();
    },timeDelay);
}
function getHash(){
    return decodeURIComponent(window.location.hash.substring(1));
}
function prepareFBShare(){
    // $('#hidden').empty();
    // $('#hidden').append($('<a id="fb_share" name="fb_share" type="button_count" href="http://www.facebook.com/sharer.php">Share</a>'))
    // $('#hidden').append($('<script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script>'));
}
function doFBShare(){
    // $('#fb_share').click();
}
function loadRandomTip(){
    // var tips=['Use the <strong>arrow keys</strong> on your keyboard to skip to the next video!','Press <strong>Enter</strong> to pause the video.','Every time you type a letter, a <strong>new video</strong> loads!'];var randomNumber=Math.floor(Math.random()*tips.length);$('#tip').html(tips[randomNumber]);
}
function setVideoVolume(){
    var volume=parseInt(document.getElementById("volumeSetting").value);
    if(isNaN(volume)||volume<0||volume>100){alert("Please enter a valid volume between 0 and 100.");
    }else if(ytplayer){
        ytplayer.setVolume(volume);
    }
}
function loadVideo(videoId){
    if(ytplayer){
        ytplayer.cueVideoById(videoId);currentVideoId=videoId;
    }
}
function playVideo(){
    if(ytplayer){
        ytplayer.playVideo();
    }
}
function fillVideoInfo(videoId){
    var the_url='http://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=jsonc';
    $.ajax({
        type:"GET",
        url:the_url,
        dataType:"jsonp",
        cache : true,
        jsonpCallback : 'cachedapp',
        success:function(responseData,textStatus,XMLHttpRequest){
            if(responseData.data){
                $('#videoData').html(responseData.data.title)
                    .data('category', responseData.data.category)
                    .data('description', responseData.data.description);
                selectNextVideo(videoItems, responseData.data);
            }
        }
    });
}
function loadAndPlayVideo(videoId,bypassXhrWorkingCheck){
    if(!bypassXhrWorkingCheck&&xhrWorking){
        return;
    }
    if(ytplayer){
        xhrWorking=true;
        ytplayer.loadVideoById(videoId);
        currentVideoId=videoId;
        pendingDoneWorking=true;
    }
//    updateHash('v='+videoId);
    $('#embedUrl').val('<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/'+currentVideoId+'?fs=1&hl=en_US"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/'+currentVideoId+'?fs=1&hl=en_US" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="640" height="385"></embed></object>');
    getRelatedVideos(videoId);
}
function showCredits(){$('#additionalCredits').slideToggle('fast');}
function setPlaybackQuality(quality){if(ytplayer){ytplayer.setPlaybackQuality(quality);}}
function pauseVideo(){if(ytplayer){ytplayer.pauseVideo();}}
function muteVideo(){if(ytplayer){ytplayer.mute();}}
function unMuteVideo(){if(ytplayer){ytplayer.unMute();}}
function clearVideo(){if(ytplayer){ytplayer.clearVideo();}}
function getEmbedCode(){alert(ytplayer.getVideoEmbedCode());}
function getVideoUrl(){alert(ytplayer.getVideoUrl());}
function setVolume(newVolume){if(ytplayer){ytplayer.setVolume(newVolume);}}
function getVolume(){if(ytplayer){return ytplayer.getVolume();}}
function playPause(){if(ytplayer){if(playerState==1){pauseVideo();$('#playlistWrapper').removeClass('pauseButton').addClass('playButton');}else if(playerState==2){playVideo();$('#playlistWrapper').removeClass('playButton').addClass('pauseButton');}}}
String.prototype.toTitleCase=function(){
    return this.replace(/([\w&`'‘’"“.@:\/\{\(\[<>_]+-? *)/g,
        function(match,p1,index,title){
            if(index>0&&title.charAt(index-2)!==":"&&match.search(/^(a(nd?|s|t)?|b(ut|y)|en|for|i[fn]|o[fnr]|t(he|o)|vs?\.?|via)[ \-]/i)>-1)
                return match.toLowerCase();
            if(title.substring(index-1,index+1).search(/['"_{(\[]/)>-1)
                return match.charAt(0)+match.charAt(1).toUpperCase()+match.substr(2);
            if(match.substr(1).search(/[A-Z]+|&|[\w]+[._][\w]+/)>-1||title.substring(index-1,index+1).search(/[\])}]/)>-1)
                return match;
            return match.charAt(0).toUpperCase()+match.substr(1);
        });
};
String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
String.prototype.NormalizeUrl = function () {
    var url = this;
    var preserveNormalForm = /[,_`;\':-]+/gi
    url = url.replace(preserveNormalForm, ' ');
    url = url.replace('|', '');
    // strip accents
    url = stripVowelAccent(url);

    //remove all special chars
    url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();

    //replace spaces with a -
    url = url.replace(/\s+/gi, '');
    return url;
}
function stripVowelAccent(str) {
    var rExps = [{ re: /[\xC0-\xC6]/g, ch: 'A' },
                 { re: /[\xE0-\xE6]/g, ch: 'a' },
                 { re: /[\xC8-\xCB]/g, ch: 'E' },
                 { re: /[\xE8-\xEB]/g, ch: 'e' },
                 { re: /[\xCC-\xCF]/g, ch: 'I' },
                 { re: /[\xEC-\xEF]/g, ch: 'i' },
                 { re: /[\xD2-\xD6]/g, ch: 'O' },
                 { re: /[\xF2-\xF6]/g, ch: 'o' },
                 { re: /[\xD9-\xDC]/g, ch: 'U' },
                 { re: /[\xF9-\xFC]/g, ch: 'u' },
                 { re: /[\xD1]/g, ch: 'N' },
                 { re: /[\xF1]/g, ch: 'n'}];

    for (var i = 0, len = rExps.length; i < len; i++)
        str = str.replace(rExps[i].re, rExps[i].ch);

    return str;
}

window.onstatechange = function() {
    loadAndPlayVideo(History.getState().data['id']);
    // Incrementamos el número de páginas vista
    ga('send', 'pageview');
    _gaq.push(['_trackEvent', 'Video', 'View', History.getState().data['id']]);
}

google.setOnLoadCallback(_run);

/*

Anotaciones para el History.js

window.onstatechange = function() {
    console.log('cambio de direccion ' + History.getState().data['id']);
}

History.pushState({'id':'yyy','Title':'Titulo de prueba'},'Ejemplo de titulo adsfasd','?234234234dsf');

History.back();

==============

Eventos del storage
http://html5demos.com/storage-events

==============

Modificación del favicon
$("#favicon").attr("href","favicon.png");
$("#favicon").attr("href","favicon.ico");

*/