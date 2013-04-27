google.load("swfobject","2.2");
google.load("jquery","1");
google.load("jqueryui","1");
var INITIAL_VID_THUMBS=24;
var currentVideoId = '';
var videoItems = {};
var currentVideo = {};
var playlist = [];
var favlist = [];
var xhrWorking = false;
var ytplayer = '';
var playerLoaded = false;
var init = true;

function _run(){
    $(document).on('click', '.playlist-trash', function(event){
        if(countPlaylistItems() > 1){
            var id = $(this).parent().parent().attr('id');
            removeFromPlaylist(id.substring(1));
            ga('send', 'event', 'Playlist', 'delete', 'playlist-trash', 1);
        }
    }).on('click', '.playlist-play', function(event){
        var id=$(this).parent().parent().attr('id').substring(1);
        var title=$(this).parent().parent().find('small').html();
        ga('send', 'event', 'Video', 'play', 'playlist-play', 1);
        goVideo(id, title);
    }).on('click', '.videoinfotitle a', function(e){
        e.preventDefault();
        var id=$(this).parent().parent().parent().attr('id');
        var title=$(this).html();
        ga('send', 'event', 'Video', 'play', 'related-play', 1);
        goVideo(id.substring(1), title);
    });
    $('#searchButton').click(function(){
        ga('send', 'event', 'Search', 'search', 'button', 1);
        doSearch();
    });
    $('#searchBox').keypress(function(e){
        if (e.which == 13){
            ga('send', 'event', 'Search', 'search', 'enter', 1);
            doSearch();
        }
    });
    $('#formsearch').submit(function(){
        return false;
    });
    $('#homeLink').click(function(event){
        event.preventDefault();
        $('#index').slideDown('fast');
        History.pushState('','Infinitube','/');
        ga('send', 'pageview', '/');
        ga('send', 'event', 'Nav', 'index', 'header', 1);
    });

    _initPlaylist();
    _initFavlist();

    $( "#playlisttable" ).sortable();
    $( "#playlisttable" ).disableSelection();

    if(location.search){
        var search = location.search;
        if(search.substring(0,3)=='?v='){
            $('#index').hide();
            ga('send', 'event', 'Video', 'play', 'init', 1);
            currentVideoId=search.substring(3);
            if(_.findWhere(favlist, {id:currentVideoId})){
                $('#btn-fav').addClass('red-icon');
            }

            loadPlayer();
            getRelatedVideos(currentVideoId, true);
            //loadAndPlayVideo(currentVideoId);
        }
    }    
}
function onBodyLoad(){
    currentSearch='';
    currentSuggestion='';
    currentVideoId='';
    playlistShowing=false;
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
        ga('send', 'event', 'Video', 'play', 'auto', 1);
    }
}
function countPlaylistItems(){
    return playlist.length;
}
function loadPlayer(){
    if(!playerLoaded){
        $('#btn-toolbar').show();
        var params={allowScriptAccess:"always"};
        var atts={id:"ytPlayer",allowFullScreen:"true"};
        swfobject.embedSWF("http://www.youtube.com/v/"+currentVideoId+"&enablejsapi=1&playerapiid=ytplayer"+"&rel=0&autoplay=0&egm=0&loop=0&fs=1&hd=0&showsearch=0&showinfo=0&iv_load_policy=3&cc_load_policy=1","innerVideo","700","420","8",null,null,params,atts);
    }   
    playerLoaded=true;
}
function playlistToJson(){
    return listToJson('playlisttable');
}
function favToJson(){
    return JSON.stringify(favlist);
}
function listToJson(element){
    var items=$('#'+element+' tr');
    var array=[];
    $.each(items, function(){
        array.push({'id': $(this).attr('id').substring(1), 'title':$(this).find('small').html()});
    });
    return JSON.stringify(array);
}
function getPlaylist(){
    var p=localStorage.getItem('playlist');
    if(p){
        return JSON.parse(p);
    } else {
        return new Array();
    }
//    return playlist;
}
function getFavlist(){
    var p=localStorage.getItem('favlist');
    if(p){
        return JSON.parse(p);
    } else {
        return new Array();
    }
//    return favlist;
}
function saveFav(){
    localStorage.setItem('favlist', JSON.stringify(favlist));
}
function savePlaylist(){
    localStorage.setItem('playlist', JSON.stringify(playlist));
}

function _initFavlist(){
    var items=getFavlist();
    if(items != null){
        if(items.length>0){
            $.each(items, function(){
                addToFavlist(this.id, this.title);
            });
        }
    }
}
function _initPlaylist(){
    var items=getPlaylist();
    if(items != null){
        if(items.length>0){
            $.each(items, function(){
                addToPlaylist(this.id, this.title);
            });
        }
    }
}
function toggleToFavlist(){
    if(_.findWhere(favlist, {id:currentVideoId})){
        removeFromFavlist(currentVideoId);
    } else {
        addToFavlist('', '');
    } 
}
function removeFromFavlist(videoId){
    favlist = _(favlist).reject(function(el) { return el.id === videoId});
    $('#btn-fav').removeClass('red-icon');
    $('#f'+videoId).fadeOut(function(){
        saveFav();    
    }).remove();
}
function removeFromPlaylist(videoId){
    playlist = _(playlist).reject(function(el) { return el.id === videoId});
    $('#r'+videoId).fadeOut(function(){
        savePlaylist();    
    }).remove();
}
function addToFavlist(videoId, title){
    if(videoId==''){
        videoId=currentVideo.id;
    }
    if(title==''){
        title=currentVideo.title;
    }
    ga('send', 'event', 'Favlist', 'add', 'button', 1);

    favlist.push({'id':videoId,'title':title});
    var str='<tr id="f'+videoId+'"><td><img src="http://i.ytimg.com/vi/'+videoId+'/default.jpg" class="minithumb" /></td><td><small>'+title+'</small></td><td><i class="playlist-trash icon-trash"></i><i class="icon-play playlist-play"></i></td></tr>';
//    $('#f'+currentVideoId).remove();
    $('#favlisttable').html($('#favlisttable').html()+str);
    $('#btn-fav').addClass('red-icon');
    saveFav();
}
function addToPlaylist(videoId, title){
    playlist.push({'id':videoId,'title':title});
    var str='<tr id="r'+videoId+'"><td><img src="http://i.ytimg.com/vi/'+videoId+'/default.jpg" class="minithumb" /></td><td><small>'+title+'</small></td><td><i class="playlist-trash icon-trash"></i><i class="icon-play playlist-play"></i></td></tr>';
    $('#r'+currentVideoId).remove();
    $('#playlisttable').html($('#playlisttable').html()+str);
    savePlaylist();
}
function onYouTubePlayerReady(playerId){
    ytplayer=document.getElementById("ytPlayer");
    ytplayer.addEventListener("onStateChange","onPlayerStateChange");
}
function goNextVideo(){
    var id=$('#playlisttable tr').first().attr('id').substring(1);
    var title=$('#playlisttable tr').first().find('small').html();
    ga('send', 'event', 'Video', 'play', 'next-button', 1);

    History.pushState({'id':id,'Title':title},title,'?v='+id);
}
function goVideo(videoId, title){
    History.pushState({'id':videoId,'Title':title},title,'?v='+videoId);
}
function doSearch(){
    if(xhrWorking){
        pendingSearch=true;
        return;
    }
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
function getRelatedVideos(videoId, page, init){
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
            if(typeof responseData.data != 'undefined'){
                if(responseData.data.items){
                    videoItems=responseData.data.items;
                    // playlistArr=[];
                    // playlistArr.push(videos);
                    updateVideoDisplay(videoItems);
                    fillVideoInfo(currentVideoId, init);
                    pendingDoneWorking=true;
                }else{
                    doneWorking();
                }
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
    var numLastfmItems=0;
    var prob=0;
    var tmp=0;
    var str='';
    var a = '';
    var videosTmp=[];
    var maxProb = 0;
    var rndProb = 0;
    var match=0;
    if(typeof lastfmData.similarartists != 'undefined'){
        numLastfmItems=lastfmData.similarartists.artist.length;
    }
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
    
    addToPlaylist(videosTmp[rndItem].id,videosTmp[rndItem].title);
}
function updateVideoDisplay(videos){
    var numThumbs=(videos.length>=INITIAL_VID_THUMBS)?INITIAL_VID_THUMBS:videos.length;

    var relatedVideos = '<ul class="inline unstyled related">';
    for(var i=0;i<numThumbs;i++){
        var tmp='<li id="a'+videos[i].id+'" class="span2 relatedvideos"><a href="javascript:setNextVideo(\''+videos[i].id+'\')"><img src="' + videos[i].thumbnail.sqDefault + '"></a><ul class="unstyled videoinfo"><li class="pagination-centered videoinfotitle"><a href="?v='+videos[i].id+'">' + videos[i].title + '</a></li><li class="hidden">' + videos[i].category + '</li></ul></li>';
        relatedVideos = relatedVideos + tmp;
    }
    relatedVideos = relatedVideos + '</ul>';
    $('#thumbswrapper').html(relatedVideos);
}
function doneWorking(){
    xhrWorking=false;
    if(pendingSearch){
        pendingSearch=false;
    }
    var searchBox=$('#searchBox');
    searchBox.attr('class','statusPlaying');
}
function setNextVideo(videoId){
    ga('send', 'event', 'Playlist', 'add', 'related-img', 1);

    addToPlaylist(videoId,$('#a'+videoId+' .videoinfotitle a').html());
    var options = { to: "#playlistlink", className: "ui-effects-transfer" };
    $( "#a"+videoId ).effect('transfer', options, 500);
}
function prepareFBShare(){
    // $('#hidden').empty();
    // $('#hidden').append($('<a id="fb_share" name="fb_share" type="button_count" href="http://www.facebook.com/sharer.php">Share</a>'))
    // $('#hidden').append($('<script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script>'));
}
function doFBShare(){
    // $('#fb_share').click();
}
function setVideoVolume(){
    var volume=parseInt(document.getElementById("volumeSetting").value);
    if(isNaN(volume)||volume<0||volume>100){alert("Please enter a valid volume between 0 and 100.");
    }else if(ytplayer){
        ytplayer.setVolume(volume);
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
                $('#videoData').html(responseData.data.title);
                currentVideo=responseData.data;
                if(countPlaylistItems()==0 || init==false){                    
                    selectNextVideo(videoItems, responseData.data);
                }
                init = false;                   
            }
        }
    });
}
function loadAndPlayVideo(videoId,bypassXhrWorkingCheck){
    if(!bypassXhrWorkingCheck&&xhrWorking){
        return;
    }
    $('#index').slideUp('fast');
    if(ytplayer){
        xhrWorking=true;
        ytplayer.loadVideoById(videoId);
        currentVideoId=videoId;
        pendingDoneWorking=true;
        if(_.findWhere(favlist, {id:videoId})){
            $('#btn-fav').addClass('red-icon');
        }else{
            $('#btn-fav').removeClass('red-icon');
        }
    }
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
    currentVideoId=History.getState().data['id'];
    if(currentVideoId){
        loadPlayer();
        loadAndPlayVideo(currentVideoId);
        // Incrementamos el número de páginas vista
        ga('send', 'pageview', '?v='+History.getState().data['id'], History.getState().data['title']);
    }
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

==============

Google Analytics 
https://developers.google.com/analytics/devguides/collection/analyticsjs/advanced

==============

http://playground.html5rocks.com/#semantic_markup

*/