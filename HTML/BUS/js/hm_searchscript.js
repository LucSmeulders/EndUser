// HM Google Analytics tracking function
var hmSearchTrack = {},
	searchFor = $("input#zoom_searchbox").val();

if (gaaccount !== "" && searchFor !== "") {

	if (typeof gatrackername == "undefined") {
		// HM7 Version
		hmSearchTrack.gaTrackerName = "";
		hmSearchTrack.gaTrackerPath = 0;
	} else {
		// HM 8 version
		hmSearchTrack.gaTrackerName = gatrackername;
		hmSearchTrack.gaTrackerPath = gatracklevels;
	}
		if (hmSearchTrack.gaTrackerPath == 0) {
			
			hmSearchTrack.gaTrackerPath = "";
			
		} else if (hmSearchTrack.gaTrackerPath == 9) {
			
			hmSearchTrack.gaTrackerPath = location.host + location.pathname;
			hmSearchTrack.gaTrackerPath = hmSearchTrack.gaTrackerPath.substr(0,hmSearchTrack.gaTrackerPath.lastIndexOf("\/"));
			
		} else {
			
			let pathLevels = hmSearchTrack.gaTrackerPath,
				pathString = location.pathname.substr(0,location.pathname.lastIndexOf("\/")),
				pathArray = pathString.split("\/");
				hmSearchTrack.gaTrackerPath = "";
				
			for (var y = pathArray.length-1; pathLevels > 0; y--) {
    			if (y == -1) break;
				hmSearchTrack.gaTrackerPath =  pathArray[y] + hmSearchTrack.gaTrackerPath;
				pathLevels--;
			}
			hmSearchTrack.gaTrackerPath = "\/" + hmSearchTrack.gaTrackerPath;
		}
		
		hmSearchTrack.gaTrackerSource = hmSearchTrack.gaTrackerPath == "" ? "" : hmSearchTrack.gaTrackerPath + "\/index.html" + "?q=";

		// Initialize tracker
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

		if (hmSearchTrack.gaTrackerName == "") {
			ga('create', {
				trackingId: gaaccount,
				cookieDomain: 'auto'
			});
		} else {
			ga('create', {
				trackingId: gaaccount,
				cookieDomain: 'auto',
				name: hmSearchTrack.gaTrackerName
			});
		}

		// Track search term
		ga((hmSearchTrack.gaTrackerName == "" ? "" : hmSearchTrack.gaTrackerName + ".") + 'send', {
			hitType: 'event',
			eventCategory: 'Search Help',
			eventAction: 'Search',
			eventLabel: hmSearchTrack.gaTrackerSource + searchFor.replace(/\s/g, '+')
		  });
}

// Direct result links to the main window
$(function(){
	$("div.results a").attr("target","hmhelpwindow")
	});
