(function ($) {
	function youtubeUrls(str) {
		if (/^https?:\/\/www.youtube.com\/watch\?v=/.test(str)) {
			var obj = {};
			
			var videoId = str.split('v=').pop().replace('&','?');
			
			videoId.replace(/autoplay\=1\&?/, '');
			obj.html = '<iframe src="http://www.youtube.com/embed/' + videoId + '" width="100%" height="100%" frameborder="0"></iframe>';
			
			videoId += videoId.indexOf('?') == -1 ? '?' : '&';
			videoId += 'autoplay=1';
			obj.auto = '<iframe src="http://www.youtube.com/embed/' + videoId + '" width="100%" height="100%" frameborder="0"></iframe>';
			
			obj.type = 'video';
			
			return obj;
		}
		
		return false;
	}
	
	$.fn.bdLightbox.urlHandlers.push(youtubeUrls);
})(jQuery);