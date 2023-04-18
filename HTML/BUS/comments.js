/*! 
User comments script functions for Premium Pack Version 4.3.0
Support for Disqus and IntenseDebate commenting systems
Copyright (c) 2015-2021 by Tim Green 
All rights reserved. 
*/

var comments_off = false;
var comments_delay = 10;
var $cBox, $cLink1, $cLink2, comments_online; 
var cCount = "0";
var pCount = 0;
var iOx = /ipad|iphone/gi;
var comments_intensedebate = comments_type.toLowerCase() == 'intensedebate' ? true : false;
var comments_disqus = comments_type.toLowerCase() == 'disqus' ? true : false;


var commentsWidth = function() {
	var boxWd = $cBox.width();
	var rOffs = hmHeaderTopic ? "40px" : "60px";
	var winWd = $(document).width();
	var boxDf = 0;
	if (boxWd > 842 && winWd > 912) {
		boxDf = boxWd - 842;
		$cBox.css({"right": "", "width": "842px"});
	} else if (winWd < 912){
		$cBox.css({"right": rOffs, "width": ""});
		}
	}

// Init for online comments services
comments_online = comments_path.substr(0,comments_path.lastIndexOf("/")) == location.href.substr(0,location.href.lastIndexOf("/"));
	if (!comments_online) {
	// Disable comments if the current location does not match the registered server location 
	comments_off = true;
	}

$(document).ready(function() {
		$cBox = $("div#commentsWrapper");
		$cLink1 = $("a#commentToggle1");
		$cLink2 = $("a#commentToggle2");
		$("a[id^='commentToggle']").click(function(e) {e.preventDefault();});
	
	if (window.frameElement) {
		if (window.frameElement.id != "hmcontent") {
			$("a.commentLink").hide();
			}
		}
	// Disqus is not compatible with iOs in frames
	if ((iOx.test(navigator.platform) && comments_disqus) || comments_off) {
		$("p#commentLink1,p#commentLink2,div#commentsBox").hide();
	} else {
	
	if (comments_disqus) {
    
	} else if (comments_intensedebate) {
	
		var countLabel = "idc-commentcount";
		var commentTest = "idc-commentcount_label";
		var setCount = window.setInterval(function() {
		
		if ($("#"+commentTest).length > 0) {
		cCount = document.getElementById(countLabel) ? document.getElementById(countLabel).innerHTML : "0";
		$cLink1.html(document.getElementById(countLabel) ? window.comments_link + ' (<span class="comments">' + cCount + '</span>)' : window.comments_link + ' (<span class="comments">0</span>)').attr("title",window.comments_showtip);
		$cLink2.html($cLink1.html()).attr("title",window.comments_showtip);
		window.clearInterval(setCount);
		} else if (pCount > comments_delay*5) {
		cCount = "?";
		$cLink1.html(window.comments_link + ' (<span class="comments">?</span>)');
		$cLink2.html($cLink1.html());
		$cBox.html('<h4>' + window.comments_offline + '</h4>');	
		window.clearInterval(setCount);
		}
		pCount++;
		},200); // setCount poll
	}
} 
}); // Check iOs and Disqus and comments on/off 	
	
$(window).on("resize",commentsWidth);

function showComments() {
	var caption;
	
	// Must work with visibility instead of simple hide because Disqus will not initialize
	// properly in a hidden element without dimensions in Internet Explorer. So comments box
	// must have full dimensions when initializing, after that must switch both visibility and
	// show/hide to manage it with the animation effect.
	if ($cBox.css("visibility") == "visible") {
	$cBox.slideUp(400, function() {
		$("div#atocIcon").show();
		$cLink1.css("visibility","visible");
		$cLink2.css("visibility","visible");
		$cBox.css("visibility","hidden");
		if (comments_intensedebate) window.location.reload();
		});
	return false;
	} else {
	$cBox.hide();
	$cBox.css("visibility","visible");
	$cBox.slideDown(400);
	$("div#atocIcon").hide();
	$cLink1.css("visibility","hidden");
	$cLink2.css("visibility","hidden");
	commentsWidth();
	return false;
	} 
} // showComments()

function doDisqus() {
document.write('<div id="disqus_thread"></div>');
   if (!iOx.test(navigator.platform) && !comments_off) {
		(function() {
		var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
	document.write('<noscript>Please enable JavaScript to view the <a href="//disqus.com/?ref_noscript" target="_blank">comments powered by Disqus.</a></noscript>');
document.write('<a href="//disqus.com" class="dsq-brlink" target="_blank">Commenting system powered by <span class="logo-disqus">Disqus</span></a>');

	   // Prevent Chrome from displaying fragmentary comments overlay on load
	   if (/AppleWebKit.+?KHTML.+?Gecko.+?Chrome/.test(navigator.userAgent)) {
	   $("#commentsWrapper").hide();   
	   }
   }
} // doDisqus()

function writeCommentLink(l) {
	var cLink = "commentLink1";
	var tLink = "commentToggle1";
	if (l == "2") {
		cLink = "commentLink2";
		tLink = "commentToggle2";
		}
	if (comments_disqus) {
	document.write('<p id="'+cLink+'" class="commentPara"><a id="'+tLink+'" class="commentLink" title="'+comments_showtip+'" href="#disqus_thread" onclick="showComments();return false;" data-disqus-identifier="'+tVars.mailid+'">'+comments_link+'</a></p>')
	
         if (l == "2") {
         	(function () {
		var s = document.createElement('script'); s.async = true;
		s.type = 'text/javascript';
		s.src = '//' + disqus_shortname + '.disqus.com/count.js';
		(document.getElementsByTagName('HEAD')[0] || document.getElementsByTagName('BODY')[0]).appendChild(s);
		}());
         }
        
        
        } else {
	document.write('<p id="'+cLink+'" class="commentPara"><a id="'+tLink+'" class="commentLink" title="'+comments_showtip+'" href="javascript:void(0)" onclick="showComments();return false;">'+comments_link+'</a></p>');
	}
	}

function doIntenseDebate() {
if (!comments_off) {
  var idScript=document.createElement('script');
  idScript.setAttribute("type","text/javascript");
  idScript.setAttribute("src", 'http://www.intensedebate.com/js/genericCommentWrapperV2.js');
  document.write('<span id="IDCommentsPostTitle" style="display:none"></span>');
  document.getElementById("commentsBox").appendChild(idScript);
  } 
 } // doIntenseDebate()
 
