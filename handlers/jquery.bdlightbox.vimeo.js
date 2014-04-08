(function ($) {
	function vimeoUrls(str) {
		if (/^https?:\/\/vimeo.com/.test(str)) {
			var obj = {};
			
			var videoId = str.split('/').pop();
			
			videoId.replace(/autoplay\=1\&?/, '');
			obj.html = '<iframe src="http://player.vimeo.com/video/' + videoId + '" width="100%" height="100%" frameborder="0"></iframe>';
			
			videoId += videoId.indexOf('?') == -1 ? '?' : '&';
			videoId += 'autoplay=1';
			obj.auto = '<iframe src="http://player.vimeo.com/video/' + videoId + '" width="100%" height="100%" frameborder="0"></iframe>';
			
			obj.type = 'video';
			
			return obj;
		}
		
		return false;
	}
	
	$.fn.bdLightbox.urlHandlers.push(vimeoUrls);
})(jQuery);