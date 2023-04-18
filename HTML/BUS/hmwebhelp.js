/*! Main WebHelp functions for HM Premium Pack Version 4.3.0
	Copyright (c) 2015-2021 by Tim Green 
All rights reserved. */

// Name the main window for reference from external windows 
if (hmnavpages.mainWindowName !== "") $(window).attr({"id": hmnavpages.mainWindowName, "name": hmnavpages.mainWindowName});

// Timer globals
var timer1 = new Date().getTime(), timer2 = new Date().getTime();

// Add Array.indexOf method for brain-dead Internet Explorer
if(!Array.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0; i<this.length; i++){
			if(this[i]==obj){
				return i;
			}
		}
		return -1;
	}
}

// Browser platform functions

// Check for IE >= 8
function newIE() {
    var rv = -1;
    var ua = navigator.userAgent.toLowerCase();
    var re = new RegExp("trident\/([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
    }
    return (rv >= 4);
}

// Browser platform 
var hmBrowser = {};
(function() {
	
	var isEventSupported = (function(){
		var TAGNAMES = {
      'select':'input','change':'input',
      'submit':'form','reset':'form',
      'error':'img','load':'img','abort':'img'
    }
    function isEventSupported(eventName) {
      var el = document.createElement(TAGNAMES[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported) {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
    return isEventSupported;
  })();
	
	var agent = navigator.userAgent.toLowerCase();
	hmBrowser.agent = agent;
	
	// Old and weak mobile browsers
	hmBrowser.oldMobile = ((agent.indexOf("series60") != -1) || (agent.indexOf("symbian") != -1) || (agent.indexOf("windows ce") != -1));
	
	// Touch-compatible Blackberry
	var match = navigator.userAgent.match(/blackberry(.*?\(khtml, like gecko\) version\/(\d)\.\d.\d.[\d]{1,4}.*?mobile safari)?/ig);
	if (match != null && match[1] == null) hmBrowser.oldMobile = true;
	hmBrowser.bb = (match != null && match[2] >= 6);

	// Windows Phone 7 and 8
	var myregexp = /Windows Phone.*?([\d]{1,1}).*? trident\/([\d]{1,1})/i;
	match = myregexp.exec(agent);
	hmBrowser.wp7 = (match != null && match[1] >=7 && match[1] < 8  && match[2] >= 3);
	hmBrowser.wp8 = (match != null && match[1] >=8 && match[2] >= 6);

	// Support for touch events
	hmBrowser.touchOS = ((isEventSupported("touchstart") || "ontouchstart" in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
	
	// Windows 7
	hmBrowser.windows7 = /windows nt 6\.1/i.test(agent) && /win32|win64/gi.test(navigator.platform);
	
	// Windows 8 
	hmBrowser.windows8 = /windows nt 6\.[23]/i.test(agent) && /win32|win64/gi.test(navigator.platform);
	
	// Windows 8 Touch (tablet or other touchscreen Windows device)
	hmBrowser.windowsTouchIe = (!hmBrowser.wp7 && !hmBrowser.wp8 && /windows nt 6\.[23].+?trident\/[67].+?touch/ig.test(agent) && hmBrowser.touchOS);
	hmBrowser.windowsTouchOther = (hmBrowser.windows8 && !hmBrowser.windowsTouchIe && hmBrowser.touchOS);
	hmBrowser.windowsTouch = (hmBrowser.windowsTouchIe || hmBrowser.windowsTouchOther);
	
	// Rotation/orientation support 
	hmBrowser.rotation = (function(){
		if ("onorientationchange" in window || isEventSupported("orientationchange")) return "orientationchange";
		else if (("onmsorientationchange" in window) || isEventSupported("msorientationchange")) return "MSOrientationChange";
		else return "resize";
		})();
	
	// Windows 8 Touch with rotation 
	hmBrowser.windowsRotation = (hmBrowser.windowsTouch && hmBrowser.rotation != "resize");

	// Desktop platform is needed to help eliminate tablet PCs with touchscreens
	hmBrowser.desktopOS = (/Win32|Win64|MacIntel|MacPPC|Linux i686|Linux x86_64|SunOS i86pc|X11/ig.test(navigator.platform) && !hmBrowser.wp7 && !hmBrowser.wp8) || (hmBrowser.windows8 && !hmBrowser.windowsTouch);

	// iPhone and iPad can be reliably identified with the navigator.platform string.
	hmBrowser.iPhone = /iPhone/gi.test(navigator.platform);
	hmBrowser.iPad = /iPad/gi.test(navigator.platform);
	hmBrowser.iOS = hmBrowser.iPhone || hmBrowser.iPad;
	
	// If the user agent string contains "android" then it's Android. If it's spoofing and
	// doesn't but it's not an old mobile browser, not an iOS or wp7/8 device and we're in
	// a mobile and touch OS and not a desktop OS then we can be pretty certain that it's Android.
	hmBrowser.android = (/android/gi.test(agent) || (!hmBrowser.iOS && !hmBrowser.oldMobile && !hmBrowser.wp7 && !hmBrowser.wp8 && hmBrowser.touchOS && !hmBrowser.desktopOS && !hmBrowser.windowsTouch));

	// Android tablet or smartphone?
	hmBrowser.androidTablet = (hmBrowser.android && (!/mobile/gi.test(agent) || /tablet/gi.test(agent)));
	hmBrowser.androidPhone = (hmBrowser.android &&  /mobile/gi.test(agent));
	
	// Is this a mobile OS?
	hmBrowser.mobileOS = !hmBrowser.desktopOS && !hmBrowser.windows8 && hmBrowser.touchOS;
	
	// Rotation supporting OS?
	hmBrowser.mobileRotation = hmBrowser.mobileOS && hmBrowser.rotation != "resize";

	// IE 8 or higher
    var rv = -1;
    var ua = navigator.userAgent;
    var re = new RegExp("Trident\/([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
        rv = parseFloat(RegExp.$1);
    }
    hmBrowser.newIE = rv >= 4;

	// IE Stuff
	hmBrowser.IE6 = /msie 6/i.test(agent) && !hmBrowser.newIE;
	hmBrowser.IE7 = /msie 7/i.test(agent) && !hmBrowser.newIE;
	hmBrowser.IE8 = /msie 8.*?trident\/4/i.test(agent);
	
	// Screen and scaling
	hmBrowser.sHeight = screen.height;
	hmBrowser.sWidth = screen.width;
	hmBrowser.pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
	hmBrowser.pixelRatioUndefined = window.devicePixelRatio ? false : true;
	hmBrowser.fullScreenMode = (!window.screenTop && !window.screenY);

	// Metro
	hmBrowser.W8Metro = (function() {
        if (hmBrowser.windows8 && hmBrowser.fullScreenMode) {
			
	   var isMetro = null;        
	   try {
        isMetro = !new ActiveXObject("htmlfile");
		} catch (e) {
		if (hmBrowser.newIE)
			isMetro = true;
			else
			isMetro = false;
		}

    return isMetro;
		
		} else {
			return false;
		}
    })();
	})();

// Update CSS for JS interface and iPad 
function addCss(cssCode) {
var styleElement = document.createElement("style");
  styleElement.type = "text/css";
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = cssCode;
  } else {
    styleElement.appendChild(document.createTextNode(cssCode));
  }
  document.getElementsByTagName("head")[0].appendChild(styleElement);
}
var jsCSS = 'div#hmtoolbar, div#hmtabscontrols {display: block;}' +
'\ntable#tbtable {display: table;}';
if (hmBrowser.iPad || hmBrowser.android  || /IEMobile\/10/.test(navigator.userAgent) || hmBrowser.W8Metro) {
jsCSS += '\ndiv#hmtabsCtab, div#tabsMenu, img.closetab {display: none;}' +
'\ndiv#hmtabswindow {left: 10px}' +
'\ndiv#undocktabtool, div#newtabtool, li#indextab img.closetab, li#searchtab img.closetab {display: none;}';
if (/IEMobile\/10/.test(navigator.userAgent)) {
	jsCSS += '\n@media (max-width: 400px) {@-ms-viewport {width: 320px;}}';
	}
if (/iPad/.test(navigator.platform)) jsCSS += '\ninput#searchinput {height: 1.8em}';
}
addCss(jsCSS);


// Redefine Help & Manual's TOC sync function for older  Internet Explorer versions (not needed for 11+)
 if (document.all && !window.opera) {
 lazysync = function(topicID) {
    if (topicID != "") {
       var toc = hmNavigationFrame().document.getElementById("toc");
       if (toc) {
          if (!tocselecting) {
            var currentTopic = $("a[href^='"+topicID+"']",toc);
            if (currentTopic.length > 0) {
              var currentSpanID = $(currentTopic).children("span").attr("id");
              var selectionchanged = false;
              if (hmTocSingleClick) {
                selectionchanged = hilightexpand(currentSpanID);
              }
              else { 
                selectionchanged = hilight(currentSpanID);
              }
             intoview(currentTopic[0], toc, selectionchanged);
			 hilight(currentSpanID); // Only changed line
            }
          }
          if (autocollapse) {
             if (currentselection) collapseunfocused(toc, currentselection.id);
             else collapseunfocused(toc, "");
          }
       }
		track('topic', topicID);
	}
    tocselecting = false;
}
}

// Deselect extension function
$(function(){
    $.extend($.fn.disableTextSelect = function() {
        return this.each(function(){
            if(/gecko.+?firefox/i.test(navigator.UserAgent)){//Firefox
                $(this).css('MozUserSelect','none');
            // }else if(document.all && !window.opera){//IE
			}else if(window.ActiveXObject || "ActiveXObject" in window){//IE
                $(this).on('selectstart',function(){return false;});
            }else{//Opera, etc.
                $(this).mousedown(function(){return false;});
            }
        });
    });
});

// Cookie functions
var doCookies = {
	setCookie: function(name,value,timebase,time) {
		if (timebase && typeof(time) === "number") {
		switch(timebase) {
			case "seconds":
			time = time * 1000;
			break;
			case "minutes":
			time = time * 1000 * 60;
			break;
			case "hours":
			time = time * 1000 * 60 * 60;
			break;
			case "days":
			time = time * 1000 * 60 * 60 * 24;
			break;
			// Default is days
			default:
			time = time * 1000 * 60 * 60 * 24;
			}
		}
		if (time) {
			var date = new Date();
			date.setTime(date.getTime()+(time));
			var expires = "; expires="+date.toGMTString();
		}
		// 0 or null makes a session cookie
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
		}, // setCookie
	getCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},
	deleteCookie: function(name) {
		this.setCookie(name,"","days",-1);
	}
};

// Session variables
var sessionVariable = {
		
		localS: Storage && localStorage && sessionStorage,
		
		setPV: function(sVar,sVal) {
			if (this.localS) {
				localStorage.setItem(hminfo.compilehash + sVar,sVal);
			} else
				doCookies.setCookie(hminfo.compilehash + sVar,sVal,"days",365);	
		},
		setSV: function(sVar,sVal) {
			if (this.localS)
				sessionStorage.setItem(hminfo.compilehash + sVar,sVal);
			else
				doCookies.setCookie(hminfo.compilehash + sVar,sVal,"minutes",false);
		},
		getPV: function(sVar) {
			if (this.localS) {
				if (typeof(localStorage.getItem(hminfo.compilehash + sVar)) !== "undefined")
					return localStorage.getItem(hminfo.compilehash + sVar);
				else return null;
			} else 
				return doCookies.getCookie(hminfo.compilehash + sVar);
		},
		getSV: function(sVar) {
			if (this.localS) {
				if (typeof(sessionStorage[hminfo.compilehash + sVar]) !== "undefined")
					return sessionStorage[hminfo.compilehash + sVar];
				else return null;
			} else 
				return doCookies.getCookie(sVar);
		},
		deletePV: function(sVar) {
			if (this.localS)
				localStorage.removeItem(hminfo.compilehash + sVar);
			else
				doCookies.deleteCookie(hminfo.compilehash + sVar);
				
		},
		deleteSV: function(sVar) {
			if (this.localS)
				sessionStorage.removeItem(hminfo.compilehash + sVar);
			else
				doCookies.deleteCookie(hminfo.compilehash + sVar);
				
		}
	};
if (sessionVariable.getPV("navwidth") !== null)
	hmnavpages.tocWidth = parseInt(sessionVariable.getPV("navwidth"),10);

// Permalink functions

function closePermalink() {
		$("div#permalink").css("visibility","hidden");
		$("div#unclicker").off("click.closeperma");
		$("div#unclicker").hide();
		document.onselectstart = function(){return false;};
}

function doPermalink(x) {

	// Turn general selection back on to allow manual selection of permalink
	document.onselectstart = function(){};
	var activeTitle = hmWebHelp.tabsapi.getCurrentPane().find("iframe").contents().find("title").text();
	var activePage =  hmWebHelp.tabsapi.getCurrentPane().find("iframe").attr("src");
	if (hmnavpages.cachefix)
		activePage = activePage.replace(/\?cachehash=\d*?$/img, "");
	var tab = hmWebHelp.tabsapi.getIndex();

	var topic = activePage;
    if (tab == 0) topic = hmWebHelp.activePage;
	
	if (hmpldata.auto) {
	// Get location and remove hash and search 
    var ref = document.location.href.toString().replace(/\#.*$/,"");
	ref = ref.replace(/\?.*$/,"");
	} else {
	var ref = hmpldata.hurl;
	// Correct missing trailing / in URLs without filename
	if (!/\.[\w]{3,4}$/im.test(ref) && !/\/$/im.test(ref)) {
		ref = ref + "/";
		}
	}
	if (
		/* topic == "index" || 
		topic == "search" */
		tab > 0 && tab < 3
		) topic = hmWebHelp.currentPage;
		// Check whether filename is in the URL or not
	if (ref.length == ref.lastIndexOf("/")+1) {
		ref = ref + x + "?" + topic;
		} else {
		ref = ref + "?" + topic;
		}
	// Encode spaces in invalid paths for stubborn browsers like Safari
	ref = ref.replace(/ /g,"%20");
	switch (x)
	{
	case "close":
	closePermalink();
	break;
	
	case "bookmark":
	if (hmWebHelp.server) {
		if (window.sidebar && window.sidebar.addPanel) { // FF
			window.sidebar.addPanel(activeTitle,ref, "");
				closePermalink();
		} else if (window.external && "AddFavorite" in window.external) { // ie
			window.external.AddFavorite(ref, activeTitle);
			closePermalink();	
			} else {
			$('textarea#plinkBox').focus().select();
			alert(hmpldata.sorry);
			} 
	} else {
	alert(hmpldata.noserver);
	closePermalink();
  
	}
	document.onselectstart = function(){return false;};
	break;
	
	case "alert":
	$('textarea#plinkBox').focus().select();
	alert(hmpldata.manualcopy);
	document.onselectstart = function(){return false;};
	break;
	
	default:
	// Close dialog if user clicks again after it's been opened
	if ($("div#permalink").css("visibility") == "visible") {
		closePermalink();
	return;
	}
    // Close permalink box on click outside
	$("div#unclicker").on("click.closeperma",function() {
		closePermalink();
	}).show();

	
	var pBoxWidth = 400;
	if ($("div#hmtoolbar").width() < pBoxWidth) pBoxWidth = $("div#hmtoolbar").width() -25;
	
	$("textarea#plinkBox").css("height",(Math.round( ref.length / 30) * 17) +"px");
	$("textarea#plinkBox").css("width", pBoxWidth + "px").val(ref);
	if (!hmWebHelp.server) {
		$("tr#offlinemessage").show();
		$("#selectPermalink, #bookmarkPermalink").attr("disabled","disabled");
		}
	$("div#permalink").css("visibility","visible");	
	$('textarea#plinkBox').select();
	break;
		}
}   

function initClipboard() {
  if ((navigator.platform.indexOf("iPad") === -1 && navigator.platform.indexOf("iPhone") === -1) && !hmnavpages.isEWriter) { 
  
  hmWebHelp.clipboard = new Clipboard('input#selectPermalink');
  
  hmWebHelp.clipboard.on('success', function(e){
	$('textarea#plinkBox').select();
		  alert(hmpldata.copied + "\n" + document.getElementById('plinkBox').value);
	closePermalink();
        } );
  
  hmWebHelp.clipboard.on('error', function(e){
	  $('textarea#plinkBox').select();
	  doPermalink("alert");
      } );

  }
} // initClipboard()
// String trimmer
function trimString (str) {
   return str.replace(/^\s+/g, '').replace(/\s+$/g, '');  
}

function browserPlatform(check) {
// Page for incompatible old devices
if (hmBrowser.wp7 || hmBrowser.oldMobile || hmBrowser.bb ) {
	document.location.replace("_nomobilewarning.html");
	return;
	}
if (hmBrowser.IE6 | hmBrowser.IE7) {
	document.location.replace("_oldiewarning.html");
	return;
	} 
if (hmBrowser.desktopOS) {
	return;
	} 
// If iPad/Android tablet redirect is active hmBrowser.androidTablet
if (check && hmBrowser.iPad || hmBrowser.androidTablet) {
	if (mobRe.ipad != "") document.location.replace(mobRe.ipad);
		else return;
	}
// If redirect smartphones is active
if (check && (hmBrowser.androidPhone || hmBrowser.iPhone || hmBrowser.wp8 || hmBrowser.wp7 || hmBrowser.bb)) {
	if (mobRe.smart != "") {
		document.location.replace(mobRe.smart);
		}
	} 
} // browserPlatform();

// Cachefix -- must be instantiated as the object hmCacheFix  
 function hmcachefix(refreshvalue) {

	var hmCacheRefresh = refreshvalue;
	
	// Add a hash method to the global Number object
	Number.prototype.hashCode = function() {
	  var hash = 0, i, chr, len, source=this.toString();
	  if (source.length == 0) return hash;
	  for (i = 0, len = source.length; i < len; i++) {
		chr   = source.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
		if (hash < 0) hash = -hash;
	  }
	  return hash;
	}
	
	this.getTarget = function(target ) {
		var cacheHashLocal = this.cacheHash();
		if (target.indexOf("\?") > -1)
			cacheHashLocal = cacheHashLocal.replace(/\?/,"\&");
		if (target.indexOf("\#") > -1) {
		target = target.replace(/\#/,(cacheHashLocal + "#"));
		} else {
		target = target + cacheHashLocal;
		} 
		return target;
	}
	
	this.cacheHash = function() {
		if (hmCacheRefresh == 999) {
			return ("?cachehash=" + new Date().getTime().hashCode());
		} else {
			var tempHash = doCookies.getCookie("cacheHash");
			if (!tempHash) {
			tempHash = "?cachehash=" + new Date().getTime().hashCode();
			doCookies.setCookie("cacheHash",tempHash,"minutes",hmCacheRefresh);
			} 
			return tempHash; 
		}
			
	}
	
	 } // hmcachefix object

if (hmnavpages.cachefix) 
	var hmCacheFix = new hmcachefix(hmnavpages.cachefix);
// Constructor for open windows object for undock/redock
function openWindow(win,tabid,tool) {
		this.win = win;
		this.tabID = tabid;
		this.liID = tabid.replace(/(.*?)Link$/mg, "li$1");
		this.tool = tool;
	}

// Main tab slider object
	
var hmTabSlider = {

	// Tab slider variables
	sliderWidth: 0,
	currentTab: 0,
	navTabs: [], // Array of positions of visible tabs in pixels
	userTabs: [], // Associative array, indexes are tab IDs, values are tab index numbers, both visible and invisible
	visibleTabs: [], // Associative array of visible tabs with indexes mapped to positions on the slider
	tabsNum: 0, // Number of tabs -- since userTabs is really an object you can't get its length
	isMaxPos: false, // Flag set if the tab slider is at the maximum left position
	canBounce: true, // Flag set if bouncing the tab slider is allowed

	// Update the tabs widths array and tabs slider width
    updateSlider: function() {
    var prevTab = 0; // Placeholder for populating previous and next tab target indexes

	// Null the tabs arrays and tabs menu
	var tabs = hmTabSlider.navTabs.length;
	// alert(tabs);
	if (tabs > 0) {
		hmTabSlider.navTabs.splice(0,tabs);
		hmTabSlider.visibleTabs.splice(0,tabs);
		}
	$("ul#tabsList").html("");
	// Rebuild the arrays of visible tabs and positions
	hmTabSlider.sliderWidth = 0;
	hmTabSlider.navTabs.push(hmTabSlider.sliderWidth);
	$("ul#topictabs a").each(function(index) {
	$(this).parent("li").attr("tabnum",index);
	// Slider width and tab positions
	if ($(this).is(":visible")) {
	hmTabSlider.sliderWidth+=$(this).parent("li").outerWidth(true)+2;
	hmTabSlider.navTabs.push(hmTabSlider.sliderWidth);
	hmTabSlider.visibleTabs.push(index);
	} 
	});
	var temp="";
	for (var x=0;x<hmTabSlider.visibleTabs.length;x++) {
	temp= temp + "index " + x + ": " + hmTabSlider.visibleTabs[x] + " - " + hmTabSlider.navTabs[x] + "\n";
	}
	// Add 2 pixels to overall tab slider container width
	hmTabSlider.sliderWidth+=2;
	// Populate drop-down tabs selector menu
	$("ul.tabs a").each(function(index) {
		var text = index == 0 ? hminfo.currtopic + ":&nbsp;" + $(this).attr("data") : (index == 1 || index == 2) ? $(this).text() : $(this).attr("data");
		if ($(this).is(":visible")) {
		$("ul#tabsList").append("<li><a id='tabList" + index + "' href='#' onclick='hmTabSlider.goToTab("+index+",true)'>" + text + "</a></li>");
		}

	});
	
	// Set menu and tabs slider widths
	$("div#hmtabslider").css("width",hmTabSlider.sliderWidth+"px");

	// Build the array of user tab indexes (includes hidden tabs)
	tabs = hmTabSlider.tabsNum;
	// Null the array if it contains anything
	if (tabs > 0) hmTabSlider.userTabs.splice(0,tabs);
	$("ul.tabs a").each(function(index) {
		hmTabSlider.userTabs[($(this).attr("id"))] = index;
		hmTabSlider.tabsNum = index;
		});
	hmTabSlider.hiTabMenu();
	},

   // Highlight current tab in the drop-down menu, activate/deactivate toggle toggle tool,
   // set current tab's window and document as the active window and document in hmWebHelp
	hiTabMenu: function() {
	var exCheck = true;
	try { hmWebHelp.mainWin.tVars != null} catch(err) { exCheck = false}
	if ( exCheck || hmWebHelp.tabsapi.getIndex() > 0) {
	hmWebHelp.togTogCheck();
	}
	// alert($("ul.tabs a").length + " : " + $("ul#tabsList a").length);
	$("ul.tabs a").each(function(index) {
		var c = $(this).attr("class") ? $(this).attr("class") : "";
		if (c && c.indexOf("current") > -1)  {
			$("ul#tabsList a[id='tabList"+index+"']").css("font-weight", "bold");
		    if (index > 0) hmWebHelp.activePage = $(this).parent("li").attr("hpage");
			
			// Index of currently active tab
			hmWebHelp.currentTabIndex = index;
			
			if (index == 1 && hmnavpages.idxno)
				setTimeout(function(){hmWebHelp.idxWin.scrollFix.doScrollFix();},0);
			if (index == 2 && hmnavpages.schno)
				setTimeout(function(){hmWebHelp.schWin.scrollFix.doScrollFix();},0);
			// Set current window and current document
			if (index >= 3) {
				hmWebHelp.currentWin = document.getElementById(hmWebHelp.currentFrameID()).contentWindow;
				hmWebHelp.currentDoc = document.getElementById(hmWebHelp.currentFrameID()).contentWindow.document;
			} else if (index < 3) {
				hmWebHelp.currentWin = hmWebHelp.mainWin;
				hmWebHelp.currentDoc = hmWebHelp.mainDoc;
			}
			
			} 
		 else if ($("ul#tabsList a").length > 0) {
		  $("ul#tabsList a[id='tabList"+index+"']").css("font-weight", "normal");
		 }
		});
	},


	// Get max tab that can be scrolled to
	maxTab: function() {
	var maxShift = hmTabSlider.sliderWidth - $("div#hmtabswindow").innerWidth();
	var x;
	for (var i = 0; i < hmTabSlider.navTabs.length; i++ ) {
		if (hmTabSlider.navTabs[i] < maxShift) x = i;
	}
	x = parseInt(x)+2;
	x = $("ul.tabs a").not(":hidden").length-1 > x ? x : $("ul.tabs a").not(":hidden").length-1;
	return x;
	},

	// Target position: Either a tab start position or the slider end point
	maxTarget: function(tab)  {
	var max = hmTabSlider.maxTab()-1;
	var target = 0;
		if (tab < max) {
		target = hmTabSlider.navTabs[tab];
		hmTabSlider.isMaxPos = false;
		} else {
		target = (hmTabSlider.sliderWidth - $("div#hmtabswindow").innerWidth());
		hmTabSlider.isMaxPos = true;
			}
	return target;
	},

	// Get the tab currently at the leftmost window position
	getCurrentTab: function() {
	var pos = $("div#hmtabslider").position();
	pos = pos.left;
	if (pos != 0) pos = -pos;
	var cTab = 0;
	for (var i = 0; i < hmTabSlider.navTabs.length; i++) {
		 if (hmTabSlider.navTabs[i] > pos) {
		break;
		}
	cTab = parseInt(i);
	}
	return cTab;
  },

	// Move the slider and bounce
	moveSlider: function(target) {
	target = target === 0 ? 0 : -target;
	$("div#hmtabslider").animate({
    left: target
	}, 550, 'easeOutBack', function() {
		// alert(target);
	});
  },

	// Bounce the slider when it can't be moved
	bounceSlider: function(dir) {
	var pos,one,two;
	// canBounce prevents bounce from being executed again by fast clicks
	if (hmTabSlider.canBounce) {
		hmTabSlider.canBounce = false;
		pos = $("div#hmtabslider").position();
		one = pos.left-10; two = pos.left;
		if (dir == "right") {
		one = pos.left+10;
		}
		$("div#hmtabslider").animate({
		left: one
		}, 100, 'easeOutBack', function() {
		$("div#hmtabslider").animate({
			left: two
			}, 100, 'easeOutBack', function() {
			setTimeout(function() {hmTabSlider.canBounce = true},300);
			});
		});
		}
	},

	// Update toolbar
	updateToolbar: function(tabIndex) {
		
		if (tabIndex === 0 && !hmWebHelp.external) {
		hmWebHelp.enableTool("newtab",true);
		hmWebHelp.enableTool("undock",false);
		hmWebHelp.enableTool("perma",true);		
		} else if (tabIndex === 0 && hmWebHelp.external) {
			hmWebHelp.enableTool("newtab",false);
			hmWebHelp.enableTool("undock",false);	
			hmWebHelp.enableTool("perma", false);
			hmWebHelp.enableTool("feedback", false);
			hmWebHelp.enableTool("printer", false);
			hmWebHelp.enableTool("togtog",false);
		} else if (tabIndex > 0 && tabIndex < 3) {
			hmWebHelp.enableTool("newtab",false);
			hmWebHelp.enableTool("undock",true);	
			hmWebHelp.enableTool("perma", false);
			hmWebHelp.enableTool("printer", false);
			hmWebHelp.enableTool("feedback", false);
		}  else {
			hmWebHelp.enableTool("newtab",false);
			hmWebHelp.enableTool("undock",true);
			hmWebHelp.enableTool("perma",true);
			hmWebHelp.enableTool("printer", true);
			hmWebHelp.enableTool("feedback", true);
			
		} 
		
	},
	
	// GoTo tab function
	goToTab: function(tabIndex,activate) {
	var pos = $("div#hmtabslider").position();
	if (hmTabSlider.sliderWidth > $("div#hmtabswindow").innerWidth() ) {
		// alert(hmTabSlider.maxTarget(tabIndex));
		hmTabSlider.moveSlider(hmTabSlider.maxTarget(tabIndex));
		// alert("Move Slider, maxpos: " + hmTabSlider.isMaxPos);
		} else if (hmTabSlider.sliderWidth < $("div#hmtabswindow").innerWidth() && pos.left < 0) {
		
		// alert();
		hmTabSlider.moveSlider(0);
		
		setTimeout(function() {hmTabSlider.goToTab(tabIndex,activate)}, 600);
		
		}
		// var xx=0;
		// for (var i in hmWebHelp.tabsapi) xx++;
		// if (activate && xx > 0) {
		if (activate) {
			hmWebHelp.tabsapi.click(tabIndex);
			hmTabSlider.updateToolbar(tabIndex);
			hmTabSlider.hiTabMenu();
			// Resize search entry form for incapable browsers
			if (tabIndex === 2) { 
				hmWebHelp.schWin.resizeForm();
				}
			if (tabIndex === 0 || tabIndex > 2) {
				// This will throw an access denied error on external pages, where it's also irrelevant
				try {
				document.getElementById(hmWebHelp.currentFrameID()).contentWindow.nsheader();
				} catch(err) {}
				if (tabIndex === 0) {
					lazysync(hmWebHelp.currentPage);
					hmWebHelp.tocWin.tocScroller(hmWebHelp.currentPage);
					}
				if (tabIndex > 0) {
					lazysync(hmWebHelp.activePage);
					hmWebHelp.tocWin.tocScroller(hmWebHelp.activePage);
					}
				}
			}
	},

  // Show/hide tab menu functions

  hideMenu: function() {
 	if ($("div#tabsMenu").is(":visible")) {
		$("div#tabsMenu").slideUp("fast");
		$("div#unclicker").off('click.tabmenu');
		}
  },

  togTabMenu: function() {
 	if ($("div#tabsMenu").is(":hidden")) {
		$("div#tabsMenu").slideDown("fast");
		} else {
		$("div#tabsMenu").slideUp("fast");
		$("div#unclicker").off('click.tabmenu');
		}
  },
  
  // If activated tab is partially in viewport move it into view
  alignTab: function(tab) {

		var pos = $("div#hmtabslider").position();
		var tabWinWidth = $("div#hmtabswindow").innerWidth();
		var tabSliderWidth = $("div#hmtabslider").innerWidth()-2;
		var tabPos = hmTabSlider.navTabs[tab]; 
		// alert (hmTabSlider.navTabs[hmTabSlider.visibleTabs[tab+1]]);
		var tabPosNext = hmTabSlider.navTabs[hmTabSlider.visibleTabs[tab+1]];
		if (!tabPosNext) tabPosNext = $("div#hmtabswindow").innerWidth();
		if (((tabWinWidth - pos.left) >= tabPosNext) || (tabPos < -pos.left) ) {
			// alert("going to tab");
			hmTabSlider.goToTab(tab,true);
		}
  }, // alignTab()

nextValidTab: function(target,direction) {

var current = target;
var max = hmTabSlider.tabsNum;

if (direction) {
	while (!$("ul#topictabs li[tabnum='"+target+"']").is(":visible") && target < max) {
			target++;
		}
	} else {
	
	while (!$("ul#topictabs li[tabnum='"+target+"']").is(":visible") && target > 0) {
			target--;
		}
	
	}
		
	if (!$("ul#topictabs li[tabnum='"+target+"']").is(":visible") || target > max || target < 0) {
			target = current-1;
	}
	
	if (target < 0) target = 0; if (target > max) target = max;

return target;

},

  // Increment to next visible tab
  incrToVisible: function(target, direction) {

  	var max = hmTabSlider.tabsNum;
  	var current = hmWebHelp.tabsapi.getIndex();
  	var bounceDir = direction ? "left" : "right";
  
	// Get next valid target
	target = hmTabSlider.nextValidTab(target,direction);

	if (target <= max && target > -1 && target != current) {
  	hmTabSlider.goToTab(target,true);
     } else {
     hmTabSlider.bounceSlider(bounceDir);
     }  	
  }, // incrToVisible()

  // Initialize the tab control buttons
  
  initTabControls: function() {

  $("img#tabRight").click(function(event) {
     hmTabSlider.incrToVisible(hmWebHelp.tabsapi.getIndex()+1,true);
	});
  $("img#tabLeft").click(function(event) {
	hmTabSlider.incrToVisible(hmWebHelp.tabsapi.getIndex()-1,false);
   });
  } // initTabControls

} // HMTabSlider

var hmWebHelp = {
	tabsapi: {}, // api object for tabs
	openTabs: [], // array storing open tabs
	tabsCookie: [], // array of last tabs opened by user
	openWindows: [], // Array of open (undocked) windows
	dockChecker: null, // Interval timer variable for open window poller
	currentPage: "", // current topic open in the main browsing tab
	activePage: "", // topic loaded into the currently active tab
	// currentPageStyle: "", // Reference style container for when no cookie
	tabFile: "",
	locationsearch: "", // Stores the original URL search extension passed to the page
	locationhash: "", // Stores the original URL hash extension passed to the page
	isNewTab: false, // Flag for loading a new topic into main or new tab
	newTabReady: false, // Flag for confirming that the current new tab is ready
	autoTabs: false, // Flag active during auto tab loading routine
	external: false, // Flag for external files in browser tab
	qSearch: true,
	searchArgs: "",
	searchReturnArgs: "",
	navWidth: hmnavpages.tocWidth >= 180 ? hmnavpages.tocWidth : 180,
	navHidden: false, // Flag for current state of nav pane
	server: (function(){return /^https??:\/\//im.test(document.location)})(), // Flag for whether we're on a server or not
	browser: "desktop", // Browser type
	textn: (function() {return hmnavpages.def.substr(hmnavpages.def.lastIndexOf("\."))})(), // Topic file extension
	// iframe document references with dummy values for unloaded state
	tocDoc: 0, // TOC document contents
	tocWin: 0, // TOC window for variables etc
	idxDoc: 0, // Keyword index document
	idxWin: 0,
	schDoc: 0, // Search document
	schWin: 0,
	mainDoc: 0, // Main topic document
	mainWin: 0, // Main topic window
	currentDoc : 0, // Active tab document
	currentWin: 0, // Active tab window
	currentTabIndex: 0,
	userParams: { paramsCount: 0 }, // URL parameters for user use
	hmWebHelpReady: false, // Flag for all documents loaded and ready
	hmTopicLoaded: false, // Flag for first topic loaded, always true after first load
	hmWebHelpPage: (function() {
	var p = document.location.href;
	p = p.substring(0, (p.indexOf("#") == -1) ? p.length : p.indexOf("#"));
	p = p.substring(0, (p.indexOf("?") == -1) ? p.length : p.indexOf("?"));
	p = p.substring(p.lastIndexOf("/") + 1, p.length);
	return p;
	})(),
	
	// Write open tabs to cookie
	doTabsCookie: function(option) {
	
	var tabsCookie = doCookies.getCookie("openTabs");
	
	var tabsArray = tabsCookie ? tabsCookie.split(",") : false;
	var openTabs = "";
	
	switch(option) {

	case "getDefaultTopic":
		if (tabsCookie) {
			return tabsArray[0];
		} else {
			return false;
		}
		break;

	case "setTabsCookie":
		// Store first 5 tabs (including main tab) in cookie
		var mainTab = hmWebHelp.currentPage.substr(0,hmWebHelp.currentPage.lastIndexOf("\."));
		if (!mainTab || mainTab === "") {
			return;
			}
		openTabs = mainTab;
		for (var i in hmWebHelp.openTabs) {
			if (hmWebHelp.openTabs[i] !== mainTab && i < 4) {
			openTabs += "," + hmWebHelp.openTabs[i];
			}
			if (i > 3) {
			break;
			}
		}
		if (tabsCookie) {
			doCookies.deleteCookie("openTabs");
			}
		doCookies.setCookie("openTabs",openTabs,"days",30);
		break;
		
	case "getTabsCookie":
		if (tabsCookie) {
			hmWebHelp.tabsCookie = tabsArray;
			} else {
			return;
			}
		break;
	}

	}, // doTabsCookie

	// Fast file existence checker
	// Always returns true when not on a server
	fileExists: function(url) {
	if ((document.location.href.indexOf("http:") < 0) && (document.location.href.indexOf("https:") < 0)) {
		return true;
		}
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
	},
	
	// Show/hide toolbar icons depending on current width on mobile devices
	tbToolAdjust: function() {
	var tbOffset = 5;
	if (hmBrowser.wp8) tbOffset = 10;
	setTimeout(function(){
		var wd = $(window).width();// screen.width;
		function tbWidth() {
			var tw = 0;
			$("div#hmsearch:visible,.naviconboxL:visible,.naviconboxR:visible").each(function(){
			tw += $(this).outerWidth()+tbOffset;
			});	
			return tw;
		}
		
		
		try {
		
		
		$("div#hmtoolbar").css({"max-width": (wd)+"px"});
		if (tbWidth() > wd) {
			$("td.tbsearch").hide();
				if (tbWidth() > wd) {
					$("td.tbleft").hide();
					$("td.tbcenter").css({"text-align": "left", "margin": "0 0"});
					}
				if (tbWidth() > wd) {
					$("div#sharetool").hide();
					}
				if (tbWidth() > wd) {
					$("div#printtool").hide();
					}
				if (tbWidth() > wd) {
					$("div#feedbacktool").hide();
					}
				if (tbWidth() > wd) {
					$("div#permatool").hide();
					}
		} else if (tbWidth() < wd) {
			$("td.tbleft").show();
			if (tbWidth() > wd) {
				$("td.tbleft").hide();
			} else 	{
			$("td.tbcenter").css({"text-align": "center", "margin": "0 auto"});
				}
				if (tbWidth() < wd) {
					$("div#permatool").show();
					}
					if (tbWidth() > wd) {
					$("div#permatool").hide();
					}
				if (tbWidth() < wd) {
					$("div#feedbacktool").show();
					}
					if (tbWidth() > wd) {
					$("div#feedbacktool").hide();
					}
				if (tbWidth() < wd) {
					$("div#printtool").show();
					}
				if (tbWidth() > wd) {
					$("div#printtool").hide();
					}
				if (tbWidth() < wd) {
					$("div#sharetool").show();
					}
				if (tbWidth() > wd) {
					$("div#sharetool").hide();
					}
			if (tbWidth() < wd) {
				$("td.tbsearch").show();
			}
			if (tbWidth() > wd) {
				$("td.tbsearch").hide();
			}
			}
			
		} catch (err) {
		
		alert( err.message);
		}
		
		
	},300);
		},
	

// Load social sharing popover
LoadSocialBox: function() {
	var	socialtitle="Share this Topic",
		socialbody=
	'<div class="sharebox">' +
	'<a id="xplShareFacebook" title="Share on Facebook" onclick="hmSharePage(\'facebook\');" class="sharebutton">' +
	'<svg viewBox="0 0 32 32" style="width:50px;height:50px">' +
	'<rect width="32" height="32" style="fill:#3B5998;stroke:none"></rect>' +
	'<path d="M22,32V20h4l1-5h-5v-2c0-2,1.002-3,3-3h2V5c-1,0-2.24,0-4,0c-3.675,0-6,2.881-6,7v3h-4v5h4v12H22z" style="fill:#FFFFFF;stroke:none"></path>' +
	'</svg>' +
	'</a>' +
	'<a class="sharebutton" title="<%BTNTEXT_SHARETWEET%>" onclick="hmSharePage(\'twitter\')">' +
	'<svg viewBox="0 0 32 32" style="width:50px;height:50px">' +
	'<g>' +
	'<rect width="32" height="32" style="fill:#00ACED;stroke:none"></rect>' +
	'<path d="M25.987,9.894c-0.736,0.322-1.525,0.537-2.357,0.635c0.85-0.498,1.5-1.289,1.806-2.231   c-0.792,0.461-1.67,0.797-2.605,0.978C22.083,8.491,21.017,8,19.838,8c-2.266,0-4.1,1.807-4.1,4.038   c0,0.314,0.036,0.625,0.104,0.922c-3.407-0.172-6.429-1.779-8.452-4.221c-0.352,0.597-0.556,1.29-0.556,2.032   c0,1.399,0.726,2.635,1.824,3.36c-0.671-0.022-1.304-0.203-1.856-0.506c-0.001,0.017-0.001,0.034-0.001,0.052   c0,1.955,1.414,3.589,3.29,3.96c-0.343,0.09-0.705,0.142-1.081,0.142c-0.264,0-0.52-0.024-0.77-0.072   c0.52,1.604,2.034,2.771,3.828,2.805C10.67,21.594,8.9,22.24,6.979,22.24c-0.33,0-0.658-0.018-0.979-0.056   c1.814,1.145,3.971,1.813,6.287,1.813c7.541,0,11.666-6.154,11.666-11.491c0-0.173-0.005-0.35-0.012-0.521   C24.741,11.414,25.438,10.703,25.987,9.894z" style="fill:#FFFFFF;stroke:none"></path>' +
	'</g>' +
	'</svg>' +
	'</a>' +
	'<a class="sharebutton" href="#" title="Share by Email" onclick="hmSharePage(\'email\')">' +
	'<svg viewBox="0 0 32 32" style="width:50px;height:50px">' +
	'<g>' +
	'<rect width="32" height="32" style="fill:#DD4B39;stroke:none"></rect>'+
	'<path d="M15.5,17 L26.5,6 L4.5,6 L15.5,17 Z M12.5,16 L15.5,19 L18.5,16 L26.5,25 L4.5,25 L12.5,16 Z M4.5,24 L4.5,7 L11.5,15 L4.5,24 Z M27.5,25 L27.5,6 L19.5,15 L27.5,25 Z" style="fill:#FFFFFF;stroke:none"></path>' +
	'</g>' +
	'</svg>' +
	'</a>'+
	'<a class="sharebutton" title="Share on LinkedIn" onclick="hmSharePage(\'linkedin\')">' +
	'<svg viewBox="0 0 32 32" style="width:50px;height:50px">' +
	'<g>' +
	'<rect width="32" height="32" style="fill:#007BB6;stroke:none"></rect>' +
	'<rect height="14" width="4" x="7" y="11" style="fill:#FFFFFF;stroke:none"></rect>' +
	'<path d="M20.499,11c-2.791,0-3.271,1.018-3.499,2v-2h-4v14h4v-8c0-1.297,0.703-2,2-2c1.266,0,2,0.688,2,2v8h4v-7 C25,14,24.479,11,20.499,11z" style="fill:#FFFFFF;stroke:none"></path>' +
	'<circle cx="9" cy="8" r="2" style="fill:#FFFFFF;stroke:none"></circle>' +
	'</g>' +
	'</svg>' +
	'</a>' +
	'</div>', 
	socialdims = {"height": "1rem", "width": "20rem"},
	$socialDiv = $("div#hmsocialmedia",hmWebHelp.currentDoc);
	$socialDiv.html(socialbody);
	},

	// Show social sharing pop-over
	doSocial: function() {
		var tab = hmWebHelp.tabsapi.getIndex();
		
		// Activate main tab if Index or Search are current
		if (tab > 0 && tab < 3) hmWebHelp.tabsapi.click(0);
	
		var socialDiv = $("div#hmsocialmedia",hmWebHelp.currentDoc);
		
		if ($("div.sharebox",hmWebHelp.currentDoc).length == 0) hmWebHelp.LoadSocialBox();
		
		if ($("div#xunclicker",hmWebHelp.currentDoc).length == 0) {
			$("body",hmWebHelp.currentDoc).prepend('<div id="xunclicker"></div>');
		}
		var unClicker = $("div#xunclicker, div#hmsocialmedia",hmWebHelp.currentDoc);

		if ($(socialDiv).css("visibility") == "hidden")
			{	
				$(unClicker).on("click", function(e) {
					$(socialDiv).css("visibility","hidden");
					$(unClicker).hide().off("click");
				}).show();
				$(socialDiv).css("visibility","visible");	
				}
			else {
				$(socialDiv).css("visibility","hidden");
				$(unClicker).off("click");
				$(unClicker).hide();
				}
	},
	
// Parser for main URL options
// var hmSearchArg = "";
// var hmIndexArg = "";
	parseUrl: function(urlArgs,urlHash) {
	
	// Default tab, search and index values
	hmLayout.startTab = 0;
	hmLayout.hmIndexArg = "";
	hmLayout.hmSearchArg = "";
	
	var userArgs = [], 
		tempArg = "",
		tempVal = "",
		nav, match, hashFix, 
		topicArg = "",
		argString = urlArgs,
		topicRx = /(\?|&)([^&?:\/]+?(\.htm[l]?|\.php[\d]?|\.asp[x]?))&?/ig,
		xxsTest = new RegExp("javascript|:|&#58;|&#x3a;|%3a|3a;|58;|\/","i");
	
	match = topicRx.exec(argString);
	if (match !== null) {
		if (!xxsTest.test(match[2]))
			topicArg = match[2].replace(/&$/,"");
		argString = urlArgs.replace(topicRx, "");
	} 
	if (argString.length > 0 && argString.indexOf("\=") > -1)
		userArgs = argString.replace(/^\?/,"").split("\&");
	
	// Any arguments?
	if (userArgs.length > 0) {
		for (var x=0; x < userArgs.length; x++) {
			if (!xxsTest.test(userArgs[x])) {
				tempArg = userArgs[x].substr(0,userArgs[x].indexOf("\="));
				tempVal = userArgs[x].substr(userArgs[x].indexOf("\=")+1);
				switch(tempArg) {
					// Switch to index or search and do nothing
					case "nav":
					if (tempVal=="index") {
						hmLayout.startTab = 1;
						}
					else if (tempVal=="search") {
						hmLayout.startTab = 2;
						} 
					break;
					// Switch to index or search and perform search
					case "search":
					hmLayout.startTab = 2;
					hmLayout.hmSearchArg = decodeURIComponent(tempVal);
					break;
					case "index":
					hmLayout.startTab = 1;
					hmLayout.hmIndexArg = decodeURIComponent(tempVal);
					break;
					// Other parameters added to userParams for use
					default:
					hmWebHelp.userParams[tempArg] = tempVal;
					hmWebHelp.userParams.paramsCount++;
					//console.log("User param: " + tempArg + "=" + tempVal);
					}
			}
		}
	} 
	if (topicArg !== "") {
		urlHash =  xxsTest.test(userArgs[0]) ? "" : urlHash; 
		hashFix = hmnavpages.cachefix ? hmCacheFix.cacheHash() : "";
		document.getElementById("hmcontent").src = topicArg + hashFix + urlHash;
	}
}, // End URL parser
	
	// AutoTab Loader
	loadAutoTabs: function() {
	
	// Only supported on desktop browsers and on a server
	// Also return if there is anything at all in the search or hash value
	if (!hmBrowser.desktopOS || !hmWebHelp.server || hmnavpages.query != "" || hmnavpages.hash != "") {
		return;
	}
	
	var pages, i, max;

	if (hmWebHelp.tabsCookie.length > 0 && hmnavpages.userReload) {
		i = 1;
		max = hmWebHelp.tabsCookie.length-1 < 5 ? hmWebHelp.tabsCookie.length : 4;
		pages = hmWebHelp.tabsCookie;
	} else if (hmnavpages.autoTabs) {
		i = 1;
		max = hmnavpages.autoTabs.length < 5 ? hmnavpages.autoTabs.length : 4;
		pages = hmnavpages.autoTabs;
		} else {
		return;
		}
	// Don't do anything if there is only one file in the list
	if (pages.length < 2) {
	return;
	}
	hmWebHelp.autoTabs = true;
	// Timed loop to load only when last page is ready
		var tabTimer = setInterval(function(){
			if (hmWebHelp.newTabReady) {
				// Make sure the file still exists before loading
				if (hmWebHelp.fileExists(pages[i] + hmWebHelp.textn)) {
				hmWebHelp.newTab(pages[i]);
				}
				i++;
				if (i === max) {
				clearInterval(tabTimer);
				setTimeout(function(){
				hmWebHelp.autoTabs = false;
				hmTabSlider.goToTab(0,true);
					},300);
				}
			}
		},50);
		
	},
	
	// Frame document reference setup routine
	// Needs to be called multiple times for multiple intervals until ready
	setFrameDoc: function(framename,framedoc) {
	var newFrame = document.getElementById(framename);
	var x = setInterval(function() {
	   try {
	   if ($("body",newFrame.contentWindow.document).html()) {
			 clearInterval(x);
			 switch (framename) {
			 case 'hmnavigation':
			 hmWebHelp.tocDoc = newFrame.contentWindow.document;
			 hmWebHelp.tocWin = newFrame.contentWindow;
			 // if (hmWebHelp.tocWin != 0) alert("TOC frame OK"); else alert("TOC frame busted"); 
			 break;
			 case 'hmcontent':
			 hmWebHelp.mainDoc = newFrame.contentWindow.document;
			 hmWebHelp.mainWin = newFrame.contentWindow;
			 break;
			 case 'hmindex':
			 hmWebHelp.idxDoc = newFrame.contentWindow.document;
			 hmWebHelp.idxWin = newFrame.contentWindow;
			 break;
			 case 'hmsearchframe':
			 hmWebHelp.schDoc = newFrame.contentWindow.document;
			 hmWebHelp.schWin = newFrame.contentWindow;
			 break;
			 //default:
			 //alert("no such framedoc found");
			 }
		   } 
		   } catch(error) {
			clearInterval(x);
			// If document wasn't found exit UI to display the 404 page
			document.location.replace(framedoc);
		   }
	  },100); 
	}, // setFrameDoc()	
	
	// Write topic page frame into layout template, including context IDs and cachefix
	writeTopic: function() {
		var q = hmnavpages.query, 
		amp, searchQuery = "";
		
		// Check for Zoom search highlight in URL from external search page
		var zoomrx = /(&zoom_highlight(?:sub)?=.+)\&|(\&zoom_highlight(?:sub)?=.+?)$/im;
		var match = zoomrx.exec(q);
		if (match != null) {
		searchQuery = typeof match[1] != "undefined" ? match[1] : match[2];
		}
		
		if (q != "") {
		amp = q.indexOf("&");
		if (amp > -1) q = q.substr(0,amp);
		if (q.indexOf("=") == -1) hmnavpages.def = q + hmnavpages.hash;
       if (typeof(hmGetContextId) != "undefined") {
         var tmpCntx = hmGetContextId(hmnavpages.query);
         if (tmpCntx != "" && tmpCntx != "undefined") 
			hmnavpages.def = tmpCntx + hmnavpages.hash;
       }
    }
	var currentPage = hmnavpages.def;
	if (hmnavpages.cachefix)
		currentPage = hmCacheFix.getTarget(currentPage);
	if (currentPage.indexOf("\?") == -1 && searchQuery != "") {
		searchQuery = searchQuery.replace(/\&/,'?');
		currentPage += searchQuery;
		}
    document.write('<iframe name="hmcontent" id="hmcontent" class="scrollpane" src="'+currentPage+'" title="Content Tab" height="100%" width="100%" frameborder="0" scrolling="auto"></iframe>');
	
	// Reload page with Zoom search query from external search URL
		if (searchQuery != "")
		setTimeout(function(){
			$("iframe#hmcontent").attr("src",currentPage);
		},500);
	},
	
	// Write TOC page frame into layout page, including cacheFix
	writeTOC: function() {
		
		var TOCfile = hmnavpages.toc;
		
		if (hmnavpages.cachefix)
			TOCfile = hmCacheFix.getTarget(TOCfile);
		document.write('<iframe name="hmnavigation" id="hmnavigation" class="scrollpane" src="'+TOCfile+'" title="Navigation Pane" height="100%" width="100%" frameborder="0" scrolling="auto"></iframe>');
	},

   // Generate printable topic window
	printTopic: function(topic) {
		// Include search highlighting if configured
		var hlPrintout = hmnavpages.printHL && lastSearch !== "" ? "&" + lastSearch: "";
		topic += "?toc=0&printWindow" + hlPrintout;
		window.open(topic,'','toolbar=1,scrollbars=1,location=0,status=1,menubar=1,titlebar=1,resizable=1');
		lastSearch = "";
	},
	
	maxZindex: function() {
		var allE = document.getElementsByTagName ? document.getElementsByTagName('*') : document.all;
		return allE.length;
	},
	
	currentFrameID: function() {
		var target = "";
		var ID = $(hmWebHelp.tabsapi.getCurrentTab()).parent().find("a").attr("id");
		switch(ID) {
		case "topictablink":
			target="hmcontent";
			break;
		case "indextablink":
			target=null;
			break;
		case "searchtablink":
			target=null;
			break;
		default:
			target = ID.replace("Link","Frame");
		} 
	return target;
	},
	
	togTogCheck: function() {
		var currentFrame = hmWebHelp.currentFrameID();
		if (!currentFrame) {
		hmWebHelp.enableTool("togtog",false);
		hmWebHelp.enableTool("feedback",false);
		hmWebHelp.enableTool("printer", false);
		return false;
		} 
		var toggles; 
		try {
			toggles = document.getElementById(currentFrame).contentWindow.HMToggles;
			} catch(err) {
			toggles = false;
			}
		if (toggles && toggles.length > 0) {
		hmWebHelp.enableTool("togtog",true);
		} else {
		hmWebHelp.enableTool("togtog",false);
		}
		if (currentFrame) {
			hmWebHelp.enableTool("feedback",true);
			hmWebHelp.enableTool("printer",true);
		}
	},
	
	toggleToggles: function() {
		var timerCheck = new Date().getTime();
		if ((timerCheck - hmWebHelp.timerCheck) < 800) return;
		hmWebHelp.timerCheck = timerCheck;
		var currentFrame = hmWebHelp.currentFrameID();
		if (!currentFrame) {
			return false;
		} else {
		document.getElementById(currentFrame).contentWindow.toggleToggles();
		}
	},
    
	// Truncate tab title texts with ellipsis where necessary
	clipTitle: function(t,max) {
		// Clean up: trim leading and trailing spaces, remove multiple spaces and HTML entities
	   t = trimString(t);
	   t = t.replace(/((?: |&nbsp;)+)/ig, " ");
	   t = $("<textarea/>").html(t).text();
	   var temp = t;
	   var newmax = max;
	   var offset = 0;
	   var lastword = "";
	   var firstword = "";
	   // A value of 0 prevents truncation
		if (t.length > max && max > 0) {
		
			// Make sure that the first word isn't longer than the maximum, trim and return it if it is
			t = t+" ";
			firstword = t.substr(0,t.indexOf(" "));
			if (firstword.length >= max) {
				firstword = t.substr(0,max);
				return firstword + "&hellip;";
			}
			t = trimString(t);
		
			temp = t.substr(0,max);
			t = t + " ";
			
		// Only trim at word boundaries
		// Move to end of current word if 5 characters or less must be added
		// Move to end of previous word if more than 5 characters must be added
			
			do {
				newmax++;
				temp = t.substr(0,newmax)
			}
			while (temp.substr(temp.length-1,1) !=" ");
			temp = trimString(temp);
			t = trimString(t);
			offset = newmax-max;
			lastword = trimString(t.substr(temp.lastIndexOf(" ")));
			lastword = trimString(lastword.substr(0,lastword.indexOf(" ")));
			if (offset < 5) {
				return trimString(t.substr(0,trimString(temp).lastIndexOf(" ") + lastword.length+1))+ "&hellip;";
			} else {
				return trimString(t.substr(0,trimString(temp).lastIndexOf(" "))) + "&hellip;";
			}
		} else
		return t;		
	},
	
	deSelect: function (){
	if (window.getSelection){
		window.getSelection().removeAllRanges();
	}
	else if (document.selection){
		document.selection.empty();
	}
	return false;
	}, // End deSelect()
	
	resizeNav: function(e,oldX) {
		hmWebHelp.deSelect();
		if ($("img#navshowhide").offset().left > 100) {
		var moveX = (!document.all && !window.opera) ? e.clientX - oldX : event.clientX - oldX;
		var newNavW = hmWebHelp.navWidth + moveX < 180 ? 180 : hmWebHelp.navWidth + moveX;
		var newCW = newNavW+17;
		$("div#hmnavbox").css("width", newNavW + "px");
		$("div#hmtopicpane").css("left", (newCW) + "px");
		}
	},

	
	// Mail Feedback

	// Mail string cleanup function
	
// Clean up email link strings
unQuot: function(varStr) {
	// varStr = varStr.replace(/\'/g, "`");
	varStr = varStr.replace(/&gt;/g, ">");
	varStr = varStr.replace(/&lt;/g, "<");
	// varStr = varStr.replace(/&quot;/g, '`');
	varStr = varStr.replace(/&quot;/g, '"');
	varStr = varStr.replace(/&nbsp;|&NBSP;/g, ' ');
	varStr = varStr.replace(/&amp;/g, '&');
	if (hmnavpages.fb_unicode) {
		varStr = encodeURIComponent(varStr);
		varStr = varStr.replace(/%24CRLF%24/g,'%0A%0D');
		return varStr;
	} else
	{ varStr = escape(varStr);
	varStr = varStr.replace(/%E2|%E0|%E5|%E1|%E3/g,'a');
	varStr = varStr.replace(/%C5|%C0|%C1|%C2|%C3/g,'A');
	varStr = varStr.replace(/%C7/g,'C');
	varStr = varStr.replace(/%E7/g,'c');
	varStr = varStr.replace(/%E9|%EA|%EB|%E8/g,'e');
	varStr = varStr.replace(/%C9|%CA|%C8|%CB/g,'E');
	varStr = varStr.replace(/%u0192/g,'f');
	varStr = varStr.replace(/%EF|%EE|%EC|%ED/g,'i');
	varStr = varStr.replace(/%CF|%CD|%CE|%CC/g,'I');
	varStr = varStr.replace(/%F1/g,'n');
	varStr = varStr.replace(/%D1/g,'N');
	varStr = varStr.replace(/%F4|%F2|%F3|%F5|%F8/g,'o');
	varStr = varStr.replace(/%D4|%D2|%D3|%D5|%D8/g,'O');
	varStr = varStr.replace(/%u0161/g,'s');
	varStr = varStr.replace(/%u0160/g,'S');
	varStr = varStr.replace(/%FB|%FA|%F9/g,'u');
	varStr = varStr.replace(/%DB|%DA|%D9/g,'U');
	varStr = varStr.replace(/%FF|%FD/g,'y');
	varStr = varStr.replace(/%DD|%u0178/g,'Y');
	varStr = varStr.replace(/%FC/g,'ue');
	varStr = varStr.replace(/%DC/g,'Ue');
	varStr = varStr.replace(/%E4|%E6/g,'ae');
	varStr = varStr.replace(/%C4|%C6/g,'Ae');
	varStr = varStr.replace(/%F6|%u0153/g,'oe');
	varStr = varStr.replace(/%D6/g,'Oe');
	varStr = varStr.replace(/%DF/g,'ss');
	varStr = varStr.replace(/%24CRLF%24/g,'%0A%0D');
	return (varStr);}
	},	// End unQuot
	
	
    // Feedback function	
	mailFB: function(simplefb) {
	
	var fbFrame = hmWebHelp.currentFrameID();
	
	// Quit if we're not in a topic page
	if (!fbFrame) return false;

	fbFrame = document.getElementById(fbFrame).contentWindow;

	// User has set an URL instead of normal feedback:
	if (fbFrame.tVars.mailUrl !== "") {
		var url = fbFrame.tVars.mailUrl;
		var query = fbFrame.tVars.mailUrlQuery !== "" ? fbFrame.tVars.mailUrlQuery : false;
		url = trimString(url);
		url = url.replace(/\?$/,"").replace(/\%20/g," ");
		if (query) {
			query = trimString(query);
			query = query.replace(/^\?/,"").replace(/&amp;/g,"&").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/\%20/g," ").replace(/&quot;/g,"\"").replace(/&apos;/g,"\'");
			url = url+"?"+query;
		}
		url = encodeURI(url);
		var fbWindow = window.open(url,"fbWin","",false);
		return;
		}
	// Normal feedback function
	var headerText = hmWebHelp.unQuot(fbFrame.tVars.mailsubject);
	var titlePath = hmWebHelp.unQuot(fbFrame.tVars.mailpath);
	var fbbody = hmWebHelp.unQuot(fbFrame.tVars.mailbody);
	var topicid = hmWebHelp.unQuot(fbFrame.tVars.mailid);
	
	// De-obfuscate address if necessary
	var deObfuscate = function(s){
		if (s.substr(0,2) !== "$$") return s;
		var temp = "";
		s=s.replace(/^\$\$/g,"").replace(/\$\$$/,"").replace(/\/\//g,"/").replace(/\"/g,"").replace(/\*/g,".");
		s = s.split("/");
		if (s.length === 4) {
			temp = '\"' + s[0] + '\" <' + s[1] + '@' + s[2] + '.' + s[3] + ">"; 
		} else if (s.length === 3) {
			temp = s[0] + '@' + s[1] + '.' + s[2]
		
		} else {
		alert("Error: Invalid feedback address format!");
		return;
		}
		return temp;
	} 
	
	var recipient = deObfuscate(hmfb.mailrecipient);
	var simplerecipient = deObfuscate(hmfb.simplerecipient);

	if (!simplefb){
		var fb1 = "mailto:" + (hmnavpages.fb_unicode ? encodeURIComponent(recipient) : escape(recipient)) + "?subject=" + headerText;
		var fb2 = "&body=Ref:%20" + titlePath + "%20ID:%20"+topicid+"%0A%0D" + fbbody + "%0A%0D";
		} else {
			var fb1 = "mailto:" + (hmnavpages.fb_unicode ? encodeURIComponent(simplerecipient): escape(simplerecipient)) + "?subject=" + fbFrame.tVars.simplesubject;
			var fb2 = "&body=Ref-ID:%20"+topicid+"%0A%0D";
			}
	var fb = fb1 + fb2;
	document.location.href=fb;

	}, // End mail feedback

	ffFix: function() {
            if (!/gecko.+?firefox/i.test(navigator.UserAgent)) return;
            var loc = document.location.search;
             if (loc.indexOf("r2d2") > -1 || loc.indexOf("nav=") > -1 || loc.indexOf("search=") > -1 || loc.indexOf("index=") > -1)
             return;
             else {
             loc = loc == "" ? "?r2d2" : loc + "&r2d2";
            document.location.search = loc;
            }
        },
	// General Init
	hmInit: function() {
    
	// Parse with the original URL extensions saved on opening
	hmWebHelp.parseUrl(hmWebHelp.locationsearch,hmWebHelp.locationhash);
	
	// Set up the autotabs variable 
	hmnavpages.autoTabs = (function(){
	var tabs = hmnavpages.autoTabs;
	if (tabs.substr(2,9) === "AUTO_TABS") {
	return false;
	} else {
	 if (tabs === "") return false;
	 // Downcase, trim out spaces and trailing comma
	 tabs = tabs.replace(/ /g,"").replace(/&nbsp;/g,"").replace(/,$/,"").toLowerCase();
	 return tabs.split(",");
	 }
	})();	
	// Set up tabs cookie features or autotabs features if enabled
	if ((hmnavpages.userReload || hmnavpages.autoTabs) && hmWebHelp.server) {

	hmWebHelp.doTabsCookie("getTabsCookie");
	// Load first autotab in the main tab if there is no cookie and autotabs are on
	if ((!hmWebHelp.tabsCookie || hmWebHelp.tabsCookie.length < 1) && hmnavpages.autoTabs && hmWebHelp.fileExists(hmnavpages.autoTabs[0] + hmWebHelp.textn)) {
		document.getElementById("hmcontent").src = hmnavpages.autoTabs[0] + hmWebHelp.textn;
	}
	else if (hmnavpages.userReload && hmWebHelp.fileExists(hmWebHelp.tabsCookie[0] + hmWebHelp.textn)) {
	
		if (hmWebHelp.tabsCookie.length > 0 && hmWebHelp.tabsCookie[0] !== hmnavpages.def.substr(0,hmnavpages.def.lastIndexOf("\."))) {
			document.getElementById("hmcontent").src = hmWebHelp.tabsCookie[0] + hmWebHelp.textn;
			}
		} else {
		doCookies.deleteCookie("openTabs");
	}
	
		// Set reload on cookie
		if (hmnavpages.userReload) {
			$(window).unload(function() {
			hmWebHelp.doTabsCookie("setTabsCookie");
			});
		}
		
	} 
	
	// Unclicker DIV
	$("body").prepend('<div id="unclicker"></div>');
	
	// Starting width of nav pane
	$("div#hmnavbox").css("width",hmWebHelp.navWidth + "px");
	$("div#hmtopicpane").css("left",(hmWebHelp.navWidth + 17) + "px");
	
	// Permalink box
	hmpldata.show = hmpldata.show && hmBrowser.desktopOS && !hmBrowser.IE8;
	if (hmpldata.show) {
		$("body").prepend('<div id="permalink" class="popups">' + 
		'<table cellspacing="3" cellpadding="0" width="400" height="50">' + 
		'<tr>' + 
		'<td align="left">' + 
		'<div id="permalink_box" style="position:relative">' + 
		'&nbsp;<input type="button" id="selectPermalink" value="'+hmpldata.select+'" data-clipboard-target="#plinkBox"/>' + 
		'</div>' + 
		'</td>' + 
		'<td align="center">' + 
		'<input type="button" id="bookmarkPermalink" value="'+hmpldata.bookmark+'" onClick="doPermalink(\'bookmark\')" />' + 
		'</td>' + 
		'<td align="right">' + 
		'<input type="button" id="closePermalink" value="'+hmpldata.close+'" onClick="doPermalink(\'close\')" />' + 
		'</td>' + 
		'</tr>' + 
		'<tr id="offlinemessage">' + 
		'<td colspan="3" align="center">' + 
		' <p>'+hmpldata.manualcopy+'</p>' + 
		'</td>' + 
		'</tr>' + 
		'<tr>' + 
		'<td colspan="3" align="center">' + 
		' <textarea id="plinkBox" readonly="readonly"></textarea>' + 
		'</td>' + 
		'</tr>' + 
		'</table>' + 
		'</div>');
		
		$("td#topicNavTD").prepend('<div class="naviconboxR" id="permatool">' +
		'<span id="navicon_perma" onclick="doPermalink(hmnavpages.top);">' +
		'<img id="perma_on" class="navicon" src="permalink.png" alt="'+hmpldata.copy+'" title="'+hmpldata.copy+'"/></span>' +
		'<img id="perma_off" src="permalinkoff.png" />' +
		'<br /><span id="permaText" class="navtextOn">'+hmpldata.title+'</span>' +
		'</div>');
		
		}
	$("input[id*='Permalink']").css("cursor","pointer");

	// Navbox dynamic components
	$("div#hmnavbox").prepend(
	'<div id="hmdragdivider"></div>' +
	'<div id="hmnavhandle">' +
	'<a href="javascript: void(0);" onclick="hmWebHelp.showHideNav()"><img src="nav_close.png" id="navshowhide" alt="'+hminfo.hidenav+'" ' +
	'title="'+hminfo.hidenav+'" border="0"></a>' +
	'</div>'
	);
	
	// Search and index panes in topic panel
	
		// Cachefix for index and search source files
	var hmIndexPageTMP = hmnavpages.idx;
	if (hmnavpages.cachefix && hmnavpages.idx != "")
		hmIndexPageTMP = hmCacheFix.getTarget(hmIndexPageTMP);
	
	var hmSearchPageTMP = hmnavpages.sch;
	if (hmnavpages.cachefix && hmnavpages.sch != "")
		hmSearchPageTMP = hmCacheFix.getTarget(hmSearchPageTMP);
	
	$("div#hmtopicbox").append(
	'<div id="hmindexbox">' +
	'<iframe name="hmindex" id="hmindex" class="scrollpane" src="'+hmIndexPageTMP+'" title="Index Tab" height="100%" width="100%" frameborder="0" scrolling="auto"></iframe>' +
	'</div>' +
	'<div id="hmsearchbox">' +
	'<iframe name="hmsearchframe" id="hmsearchframe" class="scrollpane" src="'+hmSearchPageTMP+'" title="Search Tab" height="100%" width="100%" frameborder="0" scrolling="auto"></iframe>'
	);
	
	// Vertical position of main frames
	$("#hmnavbox").css("margin-top",(parseInt($("#hmnavbox").css("margin-top")))+8+"px");
	$("#hmtopicpane").css("margin-top",(parseInt($("#hmtopicpane").css("margin-top")))+8+"px");
	
	// Hide disabled index and search tabs
		if (hmnavpages.idx == "") {
		$("li#indextab").hide();
		}
		if (hmnavpages.sch == "") {
		$("li#searchtab").hide();
		}
	
	// Initialize the User Interface
	
		// Standard tabs and tabs api
		$("ul.tabs").tabs("div#hmtopicbox > div");
		hmWebHelp.tabsapi = $("ul.tabs").data("tabs");
	
		// Nav pane resizer
		$("div#hmdragdivider").mousedown(function(e) {
		if (!hmWebHelp.navHidden) {
			// $("span#xx").html(hmWebHelp.navWidth);
			var oldX = (!document.all && !window.opera) ? e.clientX : event.clientX;
			$("div#unclicker").show().css("cursor","col-resize");
			$("div#unclicker").on("mousemove", function(e) {	
				hmWebHelp.resizeNav(e,oldX);
			}).on("mouseup", function() {
				// $("span#xx").html("");
				$("div#unclicker").hide().css("cursor","default");
				hmWebHelp.navWidth = parseInt($("div#hmnavbox").css("width"),10);
				sessionVariable.setPV("navwidth",hmWebHelp.navWidth.toString());
				$(this).off("mousemove");
				$(this).off("mouseup");
				// alert("mouseup!");
			});
			} // end NavHidden check
		});

	// Mouseover functions only if not an iPad	
	if (navigator.platform.indexOf("iPad") < 0 && !/Android/.test(navigator.userAgent)) {

		// Navigation buttons
		$("img.navicon").mouseover(function() {
		$(this).toggleClass("navicon naviconH");
		// $(this).removeClass("navicon").addClass("naviconH");
		}).mouseout(function() {
		// $(this).removeClass("naviconH").addClass("navicon");
		$(this).toggleClass("navicon naviconH");
		});
		// Standard tabs and tabs api
		// $("ul.tabs").tabs("div#hmtopicbox > div");
		// hmWebHelp.tabsapi = $("ul.tabs").data("tabs");
		
		// Non-current tabs mouseover:
		 $("ul#topictabs").on("mouseenter", "li.hmtabs",function(){
			$(this).find("a,span").not("[class='current']").addClass("hover");
			$(this).find("img.closetab").show();
			});
		$("ul#topictabs").on("mouseleave", "li.hmtabs",function(){	
				$(this).find("a,span").not("[class='current']").removeClass("hover");
				$(this).find("img.closetab").hide();
				});

		// Tabs closer handler for index and search tabs (hide, not destroy)
		$("li#indextab  img.closetab, li#searchtab  img.closetab").mouseover(function() {
		$(this).css("cursor","pointer").attr("src","closetabon.png");
		}).mouseout(function() {
		$(this).attr("src","closetaboff.png")
		}).click(function() {
		// $(this).hide();
		$(this).parent().hide();
		hmTabSlider.updateSlider();
		if ($(this).parent().has("a.current").length>0) {
		hmWebHelp.tabsapi.click(0);
		hmTabSlider.hiTabMenu();
		hmWebHelp.enableTool("newtab",true);
		hmWebHelp.enableTool("undock",false);
		} 
		});
	} 
	
	// Speed up tap performance and provide orientation change support on touch interfaces
	if (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0)) {

		// Get the supported touch event (old IE10 may only have mspointers)
		var touchEv = "touchstart";
			if ("onpointerdown" in window) touchEv = "pointerdown";
			else if ("onmspointerdown" in window) touchEv = "mspointerdown";
		// Short-circuit the click delay for key interface elements on touch devices
		$("li.hmtabs,span:has(img.navicon)").on(touchEv, function(e) {
		e.target.click();
		e.preventDefault();
		});
	
		// Slide out the TOC in portrait mode on devices that support orientation events
		
		if (("onorientationchange" in window || hmBrowser.windowsTouch) && hmBrowser.fullScreenMode && window.orientation) {
		// Only execute on screens with a narrow aspect ratio
		var sW = screen.width < screen.height ? screen.width : screen.height;
		var sH = screen.width > screen.height ? screen.width : screen.height;
		if (sH/sW > 1.4) {
			$(window).on(hmBrowser.rotation, function() {
				setTimeout(function(){var or = Math.abs(window.orientation);
				//alert(window.orientation);
				if (or == 90) {
				if (hmWebHelp.navHidden)
					hmWebHelp.showHideNav();
				}
					else {
					if (!hmWebHelp.navHidden)
						hmWebHelp.showHideNav();
					}
				},500);
				});
			}
		}
	 }
	
		// Undock tool
		hmWebHelp.enableTool("undock",false);
		
		// Disable social sharing tool if not online at the registered URL
		if (hmpldata.hurl.substr(0,hmpldata.hurl.lastIndexOf("/")) != location.href.substr(0,location.href.lastIndexOf("/"))) {
			hmWebHelp.enableTool("social",false);
		}
		
		// Search in the quick search box in the toolbar
		$('input#searchinput').keyup(function(e) {
		if(e.keyCode == 13 && $('input#searchinput').val().length > 0 && hmWebHelp.qSearch) {
		hmWebHelp.remoteSearch();}
		});
		// Configure New Tab tool depending on which tab is clicked
		$("li.hmtabs").not("li#topictab").click(function() {
		// alert("tab clicked: " + hmWebHelp.tabsapi.getIndex());
		if (hmWebHelp.tabsapi.getIndex() != 0) {
			hmWebHelp.enableTool("newtab",false);
			hmWebHelp.enableTool("undock",true);
			hmTabSlider.hiTabMenu();
			hmTabSlider.alignTab(hmWebHelp.tabsapi.getIndex());
			if (hmWebHelp.tabsapi.getIndex() == 2) {
				setTimeout(function(){
					$("#hmsearchframe").contents().find("input#zoom_searchbox").focus();
				},300);
			}
		}
		});
		$("li#topictab").click(function() {
		hmWebHelp.enableTool("newtab",true);
		hmWebHelp.enableTool("undock",false);
		hmTabSlider.hiTabMenu();
		hmTabSlider.alignTab(hmWebHelp.tabsapi.getIndex());
		});
		$("li#indextab").click(function() {
			setTimeout(function() {hmWebHelp.idxWin.nsHeader();},100);
			});
		$("img.tabPlayer").mouseover(function() {
			$(this).toggleClass("tabPlayer tabPlayerH");
			}).mouseout(function() {
			$(this).toggleClass("tabPlayerH tabPlayer");
			});

	// Build the tabs array and set the slider width
	// hmTabSlider.updateSlider();

	// Show and hide the open tabs menu
	$("img#toggleTabMenu").on("click", function(event) {
		event.stopPropagation();


		hmTabSlider.togTabMenu();
		if ($("div#tabsMenu").is(":visible")) {
		// Unclicker div temporarily makes whole page a click area
		$("div#unclicker").show().on('click.tabmenu',function() {
			$("div#tabsMenu").slideUp("fast");
			$(this).hide().off('click.tabmenu');
			});
		}
		});
	// Reload the main iFrame for older versions of IE
    if (document.all && !window.opera) $("iframe#hmcontent").attr("src",$("iframe#hmcontent").attr("src"));

	
	// Set up reference variables to iframe documents
	
	hmWebHelp.setFrameDoc('hmnavigation', hmnavpages.toc);
	hmWebHelp.setFrameDoc('hmcontent', hmnavpages.def);
	hmWebHelp.setFrameDoc('hmindex',hmnavpages.idx);
	hmWebHelp.setFrameDoc('hmsearchframe', hmnavpages.sch);

	// Cachefix setting for navigation buttons
	if (hmnavpages.cachefix) {
		$("a.cachenav").on("click",function(event){
		event.preventDefault();
		$("iframe#hmcontent").attr("src",hmCacheFix.getTarget($(this).attr("href")));
		});		
		} 
	// hmWebHelp Ready:
	var cyclecounter = 0;
	var hmWebHelpReady = setInterval(function() {
		if (hmWebHelp.tocDoc != 0 && (hmWebHelp.idxDoc != 0 || hmnavpages.idxno == 0) && (hmWebHelp.schDoc != 0 || hmnavpages.schno == 0) && hmWebHelp.mainDoc != 0 && hmWebHelp.newTabReady) {
		clearInterval(hmWebHelpReady);
		hmWebHelp.hmWebHelpReady = true;
		// Load predefined tabs if present
		hmWebHelp.loadAutoTabs();
		} else cyclecounter++;
	},100);

	// Prevent tab selection on click etc:
	$('li.hmtabs, li.hmtabs a').disableTextSelect();
	
	// Initialize clipboard if we're on a web server
	if (hmWebHelp.server && hmpldata.show && !hmnavpages.isEWriter) {
				$.getScript('clipboard.min.js', function() {
				initClipboard();
				});
		} else if (hmpldata.show) {
		$("input#selectPermalink").on("click", function() {
			doPermalink("alert");
			});
		}
	// Prevent toolbar collapse, different for mobile and desktop
	// On mobile devices we need to hide icons to make the toolbar fit
	if (!hmBrowser.desktopOS) {
	hmWebHelp.tbToolAdjust();
	$(window).on("resize", function() {hmWebHelp.tbToolAdjust()});
	} else {
		$(window).on("resize.toolbar",
		function(){
			var tbMinWidth = 0;
			var tbMwOffset = 7;
			if (/applewebkit.+?chrome/gi.test(hmBrowser.agent)) tbMwOffset = 9;
			$("div#hmsearch:visible,.naviconboxL:visible,.naviconboxR:visible").each(function(){
			tbMinWidth += $(this).outerWidth()+tbMwOffset;
			});
			$("div#hmtoolbar").css({"min-width":(tbMinWidth)+"px"});
			$(window).off("resize.toolbar");
			}
		);
	}
	
	// Initialize banner box 
	hmWebHelp.initBanner(0,true);
	if (hmnavpages.banneroff || sessionVariable.getPV("bannerstate") === "closed") hmWebHelp.toggleBanner(true);
	
	// Restore nav pane state from session variable
	if (sessionVariable.getSV("navstate") === "hidden")
		hmWebHelp.showHideNav(0);

    // Turn off selection for Chrome to prevent cursor col resize bug
	document.onselectstart = function () { return false; };
	
	// Routine for managing external files in the TOC and tabs
	$("#hmcontent").on("load", function() {
	var docLoc, currFile, currLoc;
	var lazy = hmWebHelp.external;
	currLoc = document.location.href;
	currLoc = currLoc.substr(0,currLoc.lastIndexOf("\/"));
	try {
	docLoc = this.contentDocument.location.href;
	if (docLoc) {
		if (hmWebHelp.external) {
			currFile = hmWebHelp.external;
			} else {
				currFile = docLoc.substr(docLoc.lastIndexOf("\/")+1);
				docLoc = docLoc.substr(0,docLoc.lastIndexOf("\/"));
				if (this.contentWindow.tVars != null) {
					hmWebHelp.external = false;
					} else {
					hmWebHelp.external = $("a[href$='"+currFile+"']",hmWebHelp.tocDoc).attr("href");
					}
			}
		}
	} catch(err) {
		if (!hmWebHelp.external) hmWebHelp.external = hminfo.webfile;
	}
	if (lazy && !hmWebHelp.external && currFile) {
		lazysync(currFile);
		hmWebHelp.external = false;
		hmTabSlider.goToTab(0,true);
		} else
	if (hmWebHelp.external && currFile) {
			currLoc = $("a[href='"+hmWebHelp.external+"']",hmWebHelp.tocDoc).children("span").text();
			$("a#topictablink",parent.document).html("<span>"+currLoc+"</span>");
			lazysync(hmWebHelp.external);
			hmTabSlider.goToTab(0,true);
			hmWebHelp.external = false;
	} else if (hmWebHelp.external && !currFile) {
		if (!/^https?\:|^\/\//.test(hmWebHelp.external)) {
			$("a#topictablink",parent.document).html("<span>"+hmWebHelp.external+"</span>");
			$("span[class^='hilight']",hmWebHelp.tocDoc).each(function() {
				var cNum = $(this).attr("class");
				cNum = cNum.substr(cNum.length-1);
				$(this).attr("class", "heading" + cNum);
			});
			}
		hmTabSlider.goToTab(0,true);
		hmWebHelp.external = false;
		}	
	}); // End external files in TOC and tabs routine
 
	}, // End general init
	
	// Removes lightbox from the main window on topic change
	// if the user has not closed it. 
	closeLightBox: function() {
		
	var $lightbox = $('#hmlightbox');
	if ($lightbox.length === 0) return;
	var $lightboxScrollLayer = $('#hmlightboxscrolllayer');
	var $lightboxBackground = $('#hmlightboxbackground');
	
	$lightbox.remove();
	if ($lightboxScrollLayer.length > 0) $lightboxScrollLayer.remove(); 
	if ($lightboxBackground.length > 0) $lightboxBackground.remove();

    $(window).off('.hmlightbox');
    $(document).off('.hmlightbox');
		
	},
	
	initHeadMenu: function() {
	// Set vertical position of menu (some browsers are funky)
	 $("ul.topnav li ul.subnav").css("top",$($("ul.topnav")[0]).height() + "px");
	
	// Hover version for desktop systems with mouse only
	if (!(('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))) {
	$("ul.topnav li").hover(function() { //When trigger is clicked...
		//Following events are applied to the subnav itself (moving subnav up and down)
		$(this).find("ul.subnav").slideDown('fast'); 
		}, function(){
			$(this).find("ul.subnav").hide(); //When the mouse hovers out of the subnav, snap it closed
		}); 
	} else  {
	 // Version for systems that also support touch
	 
	// Capture touch in supported event and pass directly to click to prevent delay
		 var touchEv = "touchstart";
			if ("onpointerdown" in window) touchEv = "pointerdown";
			else if ("onmspointerdown" in window) touchEv = "mspointerdown";
		$("ul.topnav > li:has(ul) > a, div#unclicker").on(touchEv, function(e) {
		e.target.click();
		// preventDefault() must come *last* here for compatibility with some Android browsers
		e.preventDefault();
		});

	// Top-level entries can only include an URL with a target if they have no submenu entries
	$("ul.topnav > li:has(ul) > a").on("click",function(event) { 
		event.preventDefault();

	// Close menus on a click or tap anywhere outside the menu
		$("div#unclicker").on("click.closemenu",function() {
			$("ul.topnav li").find("ul.subnav").hide();
			$("div#unclicker").off("click.closemenu");
			$("div#unclicker").hide();
			}).show();

			if ($(this).parent().find("ul.subnav").is(":hidden")) {
				$("ul.topnav li").find("ul.subnav").hide();
				$(this).parent().find("ul.subnav").slideDown('fast'); 
				}
		});
		// Also close menus when a link in a submenu is clicked
		$("ul.subnav li a").on("click", function(){
			$("ul.topnav li").find("ul.subnav").hide();
			});	
	}
	hmLayout.menuInit = true;
	}, // initHeadMenu end

initBanner: function(anispeed, init) {
	hmLayout.banner = $("div#hmbanner").length > 0;
	if (!anispeed) anispeed = 0;
	if (!hmLayout.menuInit && hmLayout.banner) hmWebHelp.initHeadMenu();
	var tabsOffset = $("#hmtabscontrols").height();
	var bannerOff = $("div#hmbanner").is(":hidden");
	var goPos = $("div#hmtoolbar").outerHeight();
	if ((bannerOff || init) && hmLayout.banner) goPos += $("div#hmbanner").outerHeight() - 5;
	if (!hmLayout.banner) $("div#hmtoolbar").toggleClass("bannerToolbar compactToolbar");
	$("div#hmnavbox").animate({top: goPos}, anispeed);
	$("div#hmtopicpane").animate({top: goPos + tabsOffset -5}, anispeed);	
	}, // initBanner()
	
toggleBanner: function(initClosed) {
	var timerCheck = new Date().getTime();
	if ((timerCheck - hmWebHelp.timerCheck) < 800) return;
	hmWebHelp.timerCheck = timerCheck;
	if (!hmLayout.banner) return;
	var tabsOffset = $("#hmtabscontrols").height();
	var bannerOff = $("div#hmbanner").is(":hidden");
	var newPos = $("div#hmtoolbar").outerHeight();
	if (bannerOff) {
		newPos += $("div#hmbanner").outerHeight() - 5;
		$("ul.topnav").show();
		sessionVariable.setPV("bannerstate","open");
		} else {
		$("ul.topnav").hide();
		sessionVariable.setPV("bannerstate","closed");
		}
	$("div#hmtoolbar").toggleClass("bannerToolbar compactToolbar");
	if (initClosed) {
		hmWebHelp.initBanner(0,false);
		$("div#hmbanner").slideToggle(0);
	}
		else {
	hmWebHelp.initBanner(hmLayout.bannerSpeed,false);
	$("div#hmbanner").slideToggle(hmLayout.bannerSpeed);
		}
	},
		
	showHideNav: function(sp) {
		var speed = typeof(sp) === "number" ? sp : 400;
		var navW = -(hmWebHelp.navWidth-5) + "";
		var topW = hmWebHelp.navWidth+17 + "";
		if (parseInt($("div#hmnavbox").css("left"),10) === 0) {
			$("div#hmtocbody",hmWebHelp.tocDoc).css("overflow","hidden");
			$("div#hmdragdivider").css("cursor","default");
			$("div#hmnavbox").animate({
				'left': navW
			}, speed, function() {});
			$("div#hmtopicpane").animate({
				'left': '22'
			}, speed, function() {
			
			$("img#navshowhide").attr({
				"alt": hminfo.shownav,
				"title": hminfo.shownav,
				"src": "nav_open.png"
				});
			
			});
		hmWebHelp.navHidden = true;
		sessionVariable.setSV("navstate","hidden");
		} else {
			// alert("Show Nav");
			$("div#hmdragdivider").css("cursor","col-resize");
			$("div#hmtocbody",hmWebHelp.tocDoc).css("overflow","auto");
			$("div#hmnavbox").animate({
				'left': '0'
			},400, function() {});	
			$("div#hmtopicpane").animate({
				'left': topW
			}, 400, function() {
			
			$("img#navshowhide").attr({
			"alt": hminfo.hidenav,
			"title": hminfo.hidenav,
			"src": "nav_close.png"
			});
			});			
		hmWebHelp.navHidden = false;
		sessionVariable.setSV("navstate","visible");
		}
 	},

	newTab: function(tab) {
    
    // Prevent double triggering on devices like MS Surface
    timer2 = new Date().getTime();
    if (timer2-timer1 < 500) return;
    
	var newTabID = tab ? tab : hmWebHelp.currentPage.substr(0,hmWebHelp.currentPage.lastIndexOf(".")); 
    
    // Check whether this file is already opened in a tab and cancel if it is
	if (($.inArray(newTabID, hmWebHelp.openTabs)) >= 0) {
		alert(hminfo.tabopen);
		return;
	}
    
	var newTabPage = newTabID + hmWebHelp.currentPage.substr(hmWebHelp.currentPage.lastIndexOf("."));
	// if (!hmWebHelp.fileExists(newTabPage)) {return false;}
	hmWebHelp.newTabReady = false;
	var newDivID = newTabID + "Div";
	var newFrameID = newTabID + "Frame";
	var newLinkID = newTabID + "Link";

	// Add cachefix query to page if enabled
	if (hmnavpages.cachefix)
		newTabPage = hmCacheFix.getTarget(newTabPage);
	
	// Set the new tab flag and record the topic loaded into the new tab
	hmWebHelp.isNewTab = true;
	hmWebHelp.openTabs.push(newTabID);
	// Destroy current tabset
	hmWebHelp.tabsapi.destroy();
	// Append a new tab entry and a div containing the file
	//$("ul#topictabs").append
	var undockable = !hmnavpages.isEWriter ? ' ondblclick="hmWebHelp.undockTab()" ' : '';
	
	$("li#searchtab").after('<li class="hmtabs" id="'+newTabID+'" hpage="' + newTabPage  + '"' + undockable + 'style="visibility: hidden;"><img class="closetab" src="closetaboff.png" alt="'+hminfo.tabclose+'" title="'+hminfo.tabclose+'"><a href="#" id="'+newLinkID+'"><span>-</span></a></li>');
	
	//$("div#hmtopicbox").append
	$("div#hmsearchbox").after('<div class="hmnewtabbox" id="'+newDivID+'"><iframe name="'+newFrameID+'" id="'+newFrameID+'" class="scrollpane" src="'+newTabPage+'" title="New Tab" height="100%" width="100%" frameborder="0" scrolling="auto"></iframe></div>');
	// Re-initialize the tabs and the tabs api
	$("ul.tabs").tabs("div#hmtopicbox > div");
	hmWebHelp.tabsapi = $("ul.tabs").data("tabs");
	// Initialize the new tab
	hmWebHelp.initTab($("li#"+newTabID+""),newDivID,newTabID);
	$('li#'+newTabID+',li#'+newTabID+' a').disableTextSelect();
	setTimeout(function(){
		$("li#"+newTabID+"").css("visibility","visible");
		if (!tab) {
			hmWebHelp.tabsapi.click(3);
			} 
		},200);
    timer1 = new Date().getTime();
	},

	// Function for enabling and disabling toolbar tools

	enableTool: function(toolName,state) {
		if (state) {
			$("img#"+toolName+"_on").show();
			$("img#"+toolName+"_off").hide();
			$("span#"+toolName+"Text").removeClass("navtextOff");
		} else {
			$("img#"+toolName+"_on").hide();
			$("img#"+toolName+"_off").show();
			$("span#"+toolName+"Text").addClass("navtextOff");// .attr("style","color:#777");
		}
	},

	initTab: function(tab,div,page) {
		// Click event for tab selection
		$(tab).click(function() {
			hmWebHelp.enableTool("newtab",false);
			hmWebHelp.enableTool("undock",true);
			hmTabSlider.hiTabMenu();
			hmTabSlider.alignTab(hmWebHelp.tabsapi.getIndex());
			hmWebHelp.activePage = $(this).attr("hpage");
			var currentFrame = hmWebHelp.currentFrameID();
			if (currentFrame) document.getElementById(currentFrame).contentWindow.nsheader();
			lazysync(hmWebHelp.activePage);
		});
		// Mouseover and click events for tab closer button
		$("img.closetab",tab).mouseover(function() {
		$(this).css("cursor","pointer").attr("src","closetabon.png");
		}).mouseout(function() {
		$(this).attr("src","closetaboff.png")
		}).click(function() {
		var nextTab = 0;
		if ($(this).parent().has("a.current").length>0) {
			// alert("current");
			nextTab = hmWebHelp.tabsapi.getIndex()-1;
			// Don't switch to index or search
			nextTab = nextTab < 3 ? 0 : nextTab;
			} else {
			// If the closed tab isn't current restore current after kill
			nextTab = hmWebHelp.tabsapi.getIndex();
			// If the current tab is after the closed tab decrement target by one
			var cIndex = $(this).siblings("a").attr("id");
			if (hmTabSlider.userTabs[cIndex] < nextTab ) nextTab--;
			}
		hmWebHelp.killTab($(this).parent(),div,page,nextTab);
		});
	},

	killTab: function(tab,divID,page,nextTab) {

		// Destroy current tabset
		hmWebHelp.tabsapi.destroy();
		// Remove tab and matching div box
		$(tab).remove();
		$("div#" + divID).remove();
		// Remove the killed tab from the open tabs list
		hmWebHelp.openTabs.splice(hmWebHelp.openTabs.indexOf(page),1);
		// Reinitialize the tabset and tabs api
		$("ul.tabs").tabs("div#hmtopicbox > div");
		hmWebHelp.tabsapi = $("ul.tabs").data("tabs");
		// Update the slider and tabs list
		hmTabSlider.updateSlider();
		// Activate the main tab
		hmWebHelp.tabsapi.click(nextTab);
		hmTabSlider.hiTabMenu();
		// Reactivate the new tab button
		if (nextTab == 0) {
			hmWebHelp.enableTool("newtab",true);
			}

	},
	
	// Handler for when undocked windows are closed
	windowPoller: function() {
	var checkWindow;
	if (hmWebHelp.openWindows.length > 0) { 
		for (var i=0; i < hmWebHelp.openWindows.length; i++) {
		checkWindow = hmWebHelp.openWindows[i].win;
		if (!checkWindow || checkWindow.closed) {
			var tool = hmWebHelp.openWindows[i].tool;
			$(hmWebHelp.openWindows[i].liID).show();
			$(hmWebHelp.openWindows[i].tabID).show();
			if (tool != "topic" ) {
				hmWebHelp.enableTool(tool,true);
				if (tool == "search") {
					$("#hmsearchframe").contents().find("input#zoom_searchbox").val(hmWebHelp.searchReturnArgs);
					$("#hmsearchframe").contents().find("form").submit();
					hmWebHelp.tabsapi.click(2);
					hmTabSlider.updateToolbar(2);
					} else if (tool == "index") {
					hmWebHelp.tabsapi.click(1);
					hmTabSlider.updateToolbar(1);
					}				
				}
			window.focus();
			setTimeout(function() {hmTabSlider.updateSlider()},300);
			hmWebHelp.openWindows.splice(i,1);
			break;
			}
		}
	} else {
		// Kill the polling listener if no windows open
		window.clearInterval(hmWebHelp.dockChecker);
		hmWebHelp.dockChecker = null;
		}
	},
	
	getCurTabDoc: function(type) {
		var tabidx = hmWebHelp.tabsapi.getIndex();
		if (tabidx > 0 && tabidx <3) var frameID = "hmcontent"; else {
		var frameID = hmWebHelp.tabsapi.getCurrentTab().attr("id").replace("Link","Frame");
		if (frameID == "topictablink") frameID = "hmcontent";
		}
		if (type == "window")
		return document.getElementById(frameID).contentWindow.window;
		else return document.getElementById(frameID).contentWindow.document;
		
	},
	
	undockTab: function() {
	var tabidx = hmWebHelp.tabsapi.getIndex();
		// Stop if we're in the main tab
		if (tabidx == 0) {
		alert(hminfo.noundock);
		return;
		}
	var toolName = tabidx == 1 ? "index" : tabidx == 2 ? "search" : "topic";
	var tabid = "#" + hmWebHelp.tabsapi.getCurrentTab().attr("id");
	var undockWindow;
	hmWebHelp.tabsapi.click(0);
	hmWebHelp.activePage = hmWebHelp.currentPage;
	if (tabidx < 3) hmWebHelp.enableTool(toolName,false);
	hmWebHelp.enableTool("newtab",true);

		$(tabid).hide();
		$(tabid.replace(/(.*?)Link$/mg, "li$1")).hide();
		$(tabid).siblings("img.closetab").hide();
		
		var tWidth = $("div#hmcontentbox").width();
		var tHeight = $("div#hmcontentbox").height();
		
		if (tabidx == 2) {
	hmWebHelp.searchArgs = $("#hmsearchframe").contents().find("input#zoom_searchbox").val();
	undockWindow = window.open(hmnavpages.sch,'hmsearchwindow','toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,titlebar=0,resizable=1,width='+tWidth+',height='+tHeight+'');
	} else if (tabidx == 1) {
	undockWindow = window.open(hmnavpages.idx,'hmindexwindow','toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,titlebar=0,resizable=1,width='+tWidth+',height='+tHeight+'');
		} else if (tabidx > 2) {
	var tFrame = tabid.replace(/(.*?)Link$/mg, "iframe$1Frame");
	var tFile = hmnavpages.cachefix ? $(tFrame).attr("src") + "&toc=0"  : $(tFrame).attr("src") + "?toc=0";
	var tWindow = tabid.replace(/#(.*?)Link$/mg, "$1Window");
	undockWindow = window.open(tFile,tWindow,'toolbar=0,scrollbars=1,location=0,statusbar=0,menubar=0,titlebar=0,resizable=1,width='+tWidth+',height='+tHeight+'');
	lazysync(hmWebHelp.currentPage);
	}
	hmWebHelp.enableTool("undock",false);
	hmWebHelp.openWindows.push(new openWindow(undockWindow,tabid,toolName));
	undockWindow.focus();
	if (hmWebHelp.openWindows.length === 1) {
		hmWebHelp.dockChecker = setInterval(function() {hmWebHelp.windowPoller()},200);
		}
	hmTabSlider.updateSlider();
	}, // End Undock Tab

	topicsPane: function() {
		hmWebHelp.enableTool("newtab",true);
		hmWebHelp.enableTool("undock",false);
		hmWebHelp.tabsapi.click(0);
		hmTabSlider.updateSlider();
		hmWebHelp.activePage = hmWebHelp.currentPage;
	},
	
	// PHP Feedback Form
	userFeedback: function() {
	feedbackwindow = window.open("feedback.php",'hmfeedbackwindow','toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,titlebar=0,resizable=1,width=500,height=600');
	},

	indexPane: function() {
		if (!hmnavpages.idxno) 
			return;
		$("li#indextab").show().parent().show();
		hmWebHelp.enableTool("newtab",false);
		hmWebHelp.enableTool("undock",true);
		hmWebHelp.tabsapi.click(1);
		setTimeout(function() {hmWebHelp.idxWin.nsHeader();},100);
		hmTabSlider.updateSlider();
		hmWebHelp.activePage = "index";
		
	},

	searchPane: function() {
		if (!hmnavpages.schno) 
			return;
		$("li#searchtab").show().parent().show();
		hmWebHelp.enableTool("newtab",false);
		hmWebHelp.enableTool("undock",true);
		hmWebHelp.tabsapi.click(2);
		hmTabSlider.updateSlider();
		hmWebHelp.activePage = "search";
		setTimeout(function(){
			$("#hmsearchframe").contents().find("input#zoom_searchbox").focus();
		},300);
	},

	// Search function for the quick search box in the toolbar
	remoteSearch: function() {
		var args = $("input#searchinput").val();
		$("li#searchtab").show("fast");
		hmWebHelp.tabsapi.click(2);
		hmWebHelp.activePage = "search";
		hmWebHelp.enableTool("newtab",false);
		hmWebHelp.enableTool("undock",true);
		$("#hmsearchframe").contents().find("input#zoom_searchbox").val(args);
		$("#hmsearchframe").contents().find("form").submit();
	}, // End remoteSearch

	supportsStorage: function() {
		return ('localStorage' in window) && window['localStorage'] !== null;
	} // End supportsStorage

} // End HmWebHelp object

// Set browser platform (executes mobile device redirects where necessary)
browserPlatform(true);


// Rewrite current topic from search portion of URL if found
// and if there is actually a topic to find and not a switch
if (document.location.search != "") {
  
	// Get topic reference from URL
	var target=document.location.search.substr(1);
	// Save the hash for scrolling to an anchor if specified
	var hash = document.location.hash;

	// Protect against evil cross-site scripting hacks...
	var xxsTest = new RegExp("javascript|:|&#58;|&#x3a;|%3a|3a;|58;|\/","i");
	if (target !== "") target = (xxsTest.test(target)) ? "" : target;
	if (hash !== "") hash = (xxsTest.test(hash)) ? "" : hash;
	if (target !== "") {
		if (target.indexOf("&") > -1)
		target = target.substr(0,target.indexOf("&"));
		if (target.indexOf("=") < 0)
		hmnavpages.def = target + hash;
	}
   } 

// Get the original URL extensions before processing removes them
hmWebHelp.locationsearch = document.location.search;
hmWebHelp.locationhash = document.location.hash;

$(document).ready(function() {
	if (hmnavpages.checkChrome && !hmWebHelp.server) {
		$("body").hide();
		alert("HELP SYSTEM ALERT:\n\nThis documentation needs to be deployed on a web server\nto work correctly. Modern browsers block key features in\ncomplex, multi-component web pages for security reasons\nif they are displayed without a web server. Use a different\nformat like CHM, eWriter or PDF for local documentation.");
		return;
	}
	hmWebHelp.hmInit();
	hmTabSlider.initTabControls();	
}); // End document ready function

