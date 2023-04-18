/*! 
User comments script functions for Premium Pack Version 4.3.0
Support for XCommentPro commenting system
Copyright (c) 2015-2021 by Tim Green 
All rights reserved. 
*/

var commentsOpen = "closed";
var $cBox, $cLink1, $cLink2; 
var iOx = /ipad|iphone/gi;
var comments_xcomment = comments_type.toLowerCase() == 'xcomment' ? true : false;


var commentsWidth = function() {
	var boxWd = $cBox.width();
	var winWd = $(document).width();
	var boxDf = 0;
	if (boxWd > 842 && winWd > 912) {
		boxDf = boxWd - 842;
		$cBox.css({"right": "", "width": "842px"});
	} else if (winWd < 912){
		$cBox.css({"right": 40 + "px", "width": ""});
		}
	}

function showComments() {
	var caption;
	if ($cBox.is(":visible")) {
	$cBox.slideUp(400, function() {
		$("div#atocIcon").show();
		$cLink1.css("visibility","visible");
		$cLink2.css("visibility","visible");
		commentsOpen = "closed";
		});
	return false;
	} else {
	commentsWidth();
	$cBox.slideDown(400);
	$("div#atocIcon").hide();
	$cLink1.css("visibility","hidden");
	$cLink2.css("visibility","hidden");
	commentsOpen = "open";
	return false;
	} 
} // showComments()

function doXcomment() {
	if (!cookiesEnabled) {
		alert("Cookies must be enabled in your browser for user comments.");
		return;
		}
  $(window).on("unload",function() {
	doCookies.setCookie("commentsOpen",commentsOpen,"seconds",3);
	}); 
  commentsOpen = (doCookies.getCookie("commentsOpen") === "open") ? "open" : "closed";
 	if (!$("span.xcSpanNoMessages").length > 0) {
	// $("span.comments").html("Add your comment");	
	 if ($("span.xcSpanPagination").length > 0) {
		(function() {
		var xPages = parseInt($($("a.xcPaginationLinks")[$("a.xcPaginationLinks").length-1]).html(),10);
		var xCpage = parseInt($("span.xcSpanCurrentPageNum").html().replace(/\(|\)/g,""),10);
		xPages = xPages > xCpage ? xPages : xCpage;
		$("span.comments").html(xPages + " " + comments_pages);
		})();
		} else {
		$("span.comments").html($("div.xcDivCommentHeader").length);
		}
	}
    if (commentsOpen === "open") {
	// $("div#xCommentsLB").show();
    showComments();
}
	// $("div#commentsBox p a[style^='display: block']").attr("style","");
  
} // doXcomment

// Initialize
$(document).ready(function(){
	var server;
	try {server = parent.hmWebHelp.server;} catch(err) {server = false;}
	if (window.frameElement && server) {
	if (window.frameElement.id == "hmcontent") {
		$cLink1 = $("a#commentToggle1");
		$cLink2 = $("a#commentToggle2");
		$cBox = $("div#commentsWrapper");
		$(window).on("resize",commentsWidth);
		doXcomment(); 
		} else {
			$("p.commentPara").hide();
			}
	} else {
	$("p.commentPara").hide();
	}
	});

