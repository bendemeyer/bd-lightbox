(function ($) {
	function imageUrls(str) {
		if (/\.jpg$|\.png$|\.gif$|\.jpeg$/.test(str)) {
			var obj = {};
			obj.html = '<img src="' + str + '" width="100%" height="100%" />';
			obj.auto = '<img src="' + str + '" width="100%" height="100%" />';
			obj.type = 'image';
			
			return obj;
		}
		
		return false;
	}
	
	$.fn.bdLightbox.urlHandlers.push(imageUrls);
})(jQuery);