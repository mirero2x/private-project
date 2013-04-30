/*
 * My profiling Tools.
 */
(function() {
	// Detect OS
	var ua = navigator.userAgent;
	var os = ['Windows', 'iPhone OS', '(Intel |PPC )?Mac OS X', 'Linux'].join('|');
	var pOS = new RegExp('((' + os + ') [^ \);]*)').test(ua) ? RegExp.$1 : null;
	if (!pOS)
		pOS = new RegExp('((' + os + ')[^ \);]*)').test(ua) ? RegExp.$1 : null;

	// Detect browser
	var browserName = /(Chrome|MSIE|Safari|Opera|Firefox)/.test(ua) ? RegExp.$1 : null;

	// Detect version
	var vre = new RegExp('(Version|' + browserName + ')[ \/]([^ ;]*)');
	var browserVersion = (browserName && vre.test(ua)) ? RegExp.$2 : null;
	var platform = (pOS && browserName && browserVersion) ? browserName + ' ' + browserVersion + ' on ' + pOS : 'unknown platform';
})(); 