(function ($) {
    $.fn.bdLightbox = function (options) {
	
        $.fn.bdLightbox.count = $.fn.bdLightbox.count ? $.fn.bdLightbox.count + 1 : 1;
		
        var settings = {
			//basic easy configuration settings
            maxWidth: 750,
            marginType: '%',
            margin: 10,
			captions: false,
			
			//advanced settings
			urlAttr: 'href',
			imageMax: false,
            videoMax: false,
            iframeMax: false,
			adjustHeight: true,
			fromTop: 'center',
			fromLeft: 'center',
			position: 'fixed',
			hMargin: false,
            vMargin: false,
			
			//loading content frames
            autoPlayVideos: true,
            reloadVideos: true,
            reloadIframes: false,
			
			//gallery settings
			gallery: false,
			autoRotateGallery: false,
			autoRotateInterval: 7000,
			autoRotateTimeout: 100,
			
			//disable default event handlers
            disableOpenHandler: false,
			disableCloseHandler: false,
			disableOverlayCloseHandler: false,
			disableWindowResizeHandler: false,
			disableGalleryNavigation: false,
			
			//callbacks
			onLightboxLoad: function () {},
			onOpenBefore: function () {},
			onOpenAfter: function () {},
			onCloseBefore: function () {},
			onCloseAfter: function () {},
			onSlideNext: function () {},
			onSlidePrev: function () {}
        };
        
        var _this = this;
        
        var items = [];
        var index = false;
		var isOpen = false;
        
        for (var o in options) {
            settings[o] = options[o];
        }
		
		var lightboxLoad = [];
		var openBefore = [];
		var openAfter = [];
		var closeBefore = [];
		var closeAfter = [];
		var slideNext = [];
		var slidePrev = [];
		
		lightboxLoad.push(settings.onLightboxLoad);
		openBefore.push(settings.onOpenBefore);
		openAfter.push(settings.onOpenAfter);
		closeBefore.push(settings.onCloseBefore);
		closeAfter.push(settings.onCloseAfter);
		slideNext.push(settings.onSlideNext);
		slidePrev.push(settings.onSlidePrev);
		
		var urlHandlers = $.fn.bdLightbox.urlHandlers;
        
        // if selector is empty, do nothing
        if (!this.length) {
            return this;
        }
        
		$('body').append('<div class="bd-overlay"></div>');
		var bdOverlay = $('.bd-overlay:last');
		bdOverlay.hide();
		if (!settings.disableOverlayCloseHandler) {
			bdOverlay.on('click.bdLightbox:' + $.fn.bdLightbox.count, function () {
				_this.closeLightbox();
			});
		}
        
        $('body').append('<div class="bd-container"></div>');
        var bdContainer = $('.bd-container:last');
        
        this.each(function () {
            var elem = document.createElement('div');
			var parent = document.createElement('div');
			var caption = document.createElement('div');
			var close = document.createElement('div');
			var next = document.createElement('div');
			var prev = document.createElement('div');
            var $elem = $(elem);
			var $parent = $(parent);
			var $caption = $(caption);
			var $close = $(close);
			var $next = $(next);
			var $prev = $(prev);
			
            var data = {};
            $elem.addClass('closed').addClass('bd-content');
			
			$close.addClass('bd-close');
			
			$parent.addClass('bd-item').append(close).append(elem);
			
			if (settings.captions) {
				var cap = getCaption.call(this, settings.captions);
				$caption.html(cap).addClass('bd-caption');
				$parent.append(caption);
			}
			
			if (settings.gallery) {
				$prev.addClass('bd-prev');
				$next.addClass('bd-next');
				$parent.append(prev).append(next);
			}
            
            var info = parse($(this).attr(settings.urlAttr));
			
            if (info.type == 'image') {
                var preloader = new Image();
                preloader.onload = function () {
                    var ratio = preloader.width / preloader.height;
                    var maxWidth = settings.imageMax ? settings.imageMax :
                                       settings.maxWidth ? settings.maxWidth : false;
                    $elem.data().maxWidth = preloader.width > maxWidth ? maxWidth : preloader.width;
                    $elem.data().maxHeight = preloader.height > (maxWidth / ratio) ? (maxWidth / ratio) : preloader.height;
                    $elem.data().aspect = ratio;
					$elem.data().init();
					if (isOpen && index == $elem.data().index) {
						_this.resize($elem);
					}
                };
                preloader.src = $(this).attr('href');
                data.image = true;
                data.loaded = true;
                data.unloaded = false;
				data.init = function () {
					$elem.html(info.html);
				};
                data.open = function () {
                    $(this).removeClass('closed').addClass('open');
                };
                data.close = function () {
                    $(this).removeClass('open').addClass('closed');
                };
            } else if (info.type == 'video') {
                var ratio = 16 / 9;
                data.maxWidth = settings.videoMax ? settings.videoMax :
                                    settings.maxWidth ? settings.maxWidth : false;
                data.maxHeight = false;
                data.aspect = ratio;
                data.video = true;
                data.loaded = false;
                data.unloaded = true;
                $elem.text(info.html);
                data.open = function () {
                    if (this.unloaded) {
                        $elem.html($elem.text());
                        this.loaded = !this.loaded;
                        this.unloaded = !this.unloaded;
                    }
                    $elem.removeClass('closed').addClass('open');
                };
                data.close = function () {
                    if (this.loaded && settings.reloadVideos) {
                        $elem.text($elem.html());
                        this.loaded = !this.loaded;
                        this.unloaded = !this.unloaded;
                    }
                    $elem.removeClass('open').addClass('closed');
                };
            } else {
                data.maxWidth = settings.iframeMax ? settings.iframeMax :
                                    settings.maxWidth ? settings.maxWidth : false;
                data.maxHeight = false;
                data.aspect = false;
                data.iframe = true;
                data.loaded = false;
                data.unloaded = true;
                $(elem).text(info.html);
                data.open = function () {
                    if (this.unloaded) {
                        $elem.html($elem.text());
                        this.loaded = !this.loaded;
                        this.unloaded = !this.unloaded;
                    }
                    $elem.removeClass('closed').addClass('open');
                };
                data.close = function () {
                    if (this.loaded && settings.reloadIframes) {
                        $elem.text($elem.html());
                        this.loaded = !this.loaded;
                        this.unloaded = !this.unloaded;
                    }
                    $elem.removeClass('open').addClass('closed');
                };
            }
            
            data.index = items.length;
			data.link = $(this);
            
            $elem.data(data);
			$parent.hide();
            
            items[items.length] = $elem;
            
            bdContainer.append(parent);
            
            if (!settings.disableClickHandler) {
                $(this).on('click.bdLightbox:' + $.fn.bdLightbox.count, function (e) {
                    e.preventDefault();
                    _this.showLightbox($elem);
                });
            }
			
			if (!settings.disableCloseHandler) {
				$close.on('click.bdLightbox:' + $.fn.bdLightbox.count, function (e) {
					_this.closeLightbox();
				});
			}
			
			if (settings.gallery && !settings.disableGalleryNavigation) {
				$prev.on('click.bdLightbox:' + $.fn.bdLightbox.count, function (e) {
					_this.prevSlide();
				});
				
				$next.on('click.bdLightbox:' + $.fn.bdLightbox.count, function (e) {
					_this.nextSlide();
				});
			}
        });
		
        if (!settings.disableWindowResizeHandler) {
			$(window).on('resize.bdLightbox:' + $.fn.bdLightbox.count, function () {
				_this.resize(items[index]);
			});
		}
        
        function parse(str) {
			var obj;
            for (var i = 0; i < urlHandlers.length; i++) {
				obj = urlHandlers[i](str);
				if (obj) {
					if (obj.type == 'video' && obj.auto) {
						obj.html = settings.autoPlayVideos ? obj.auto : obj.html;
					}
					return obj;
				}
				
			}
			
			var returnObj = {};
			returnObj.html = '<iframe src="' + str + '" width="100%" height="100%" frameborder="0"></iframe>';
			returnObj.type = 'iframe';
            return returnObj;
        };
        
        function getMargin() {
            if (!settings.marginType) {
                return { h: 0, v: 0 };
            } else if (settings.marginType = '%') {
                var vert = settings.vMargin ? (settings.vMargin * .01) * $(window).height() : (settings.margin * .01) * $(window).height();
                var horiz = settings.hMargin ? (settings.hMargin * .01) * $(window).width() : (settings.margin * .01) * $(window).width();
                return { h: horiz, v: vert };
            } else if (settings.marginType = 'px') {
                var vert = settings.vMargin ? settings.vMargin : settings.margin;
                var horiz = settings.hMargin ? settings.hMargin : settings.margin;
                return { h: horiz, v: vert };
            } else {
                var vert = .1 * $(window).height();
                var horiz = .1 * $(window).width();
                console.log('BD: The margin value is invalid. Using defaults instead.');
                return { h: horiz, v: vert };
            }
        };
		
		function getCaption(arg) {
			if (typeof(arg) == 'function') {
				return arg.call(this);
			} else if ($(this).attr(arg)) {
				var str = $(this).attr(arg);
				if (str.substring(0, 2) == '$$') {
					return $($.trim(str.substring(2))).html();
				} else {
					return str;
				}
			}
			return '';
		}
		
		var timer = settings.autoRotateInterval;
		var auto = settings.autoRotateGallery;
		var pause = true;
		var timeout;
		
		function autoRotate() {
			if (auto && !pause) {
				timer -= settings.autoRotateTimeout;
				if (timer <= 0) {
					resetInterval();
					_this.nextSlide();
				}
				clearTimeout(timeout);
				timeout = setTimeout(autoRotate, settings.autoRotateTimeout);
			}
		};
		
		function pauseAuto() {
			pause = true;
		}
		
		function resumeAuto() {
			pause = false;
			timer = settings.autoRotateInterval;
			autoRotate();
		}
		
		function resetInterval() {
			timer = settings.autoRotateInterval;
		};
        
        this.resize = function (elem) {
            var data = elem.data();
			var parent = elem.parent();
			parent.css('visibility','hidden').show();
			var hPadding = parent.outerWidth() - parent.width();
			var vPadding = parent.outerHeight() - elem.height();
            var margin = getMargin();
            var winWidth = $(window).width();
            var winHeight = $(window).height();
            var maxWidth = data.maxWidth && winWidth - (margin.h * 2) > data.maxWidth + hPadding ? data.maxWidth : winWidth - (margin.h * 2) - hPadding;
            var maxHeight = data.maxHeight && winHeight - (margin.v * 2) > data.maxHeight + vPadding ? data.maxHeight : winHeight - (margin.v * 2) - vPadding;
            var width, height;
            
            if (data.aspect == (maxWidth / maxHeight) || !data.aspect) {
                width = maxWidth;
                height = maxHeight;
            } else if (data.aspect > (maxWidth / maxHeight)) {
                width = maxWidth;
                height = (maxWidth / data.aspect);
            } else if (data.aspect < (maxWidth / maxHeight)) {
                width = (maxHeight * data.aspect);
                height = maxHeight;
            }
			
			elem.css({
                width: width + 'px',
                height: height + 'px'
            });
			
			parent.css('width', width + 'px');
            
            var left = (($(window).width() - parent.outerWidth()) / 2) + 'px';
            var top = settings.fromTop == 'center' ? (($(window).height() - parent.outerHeight()) / 2) + 'px' : settings.fromTop;
			
			parent.css({
				left: left,
				top: top,
				visibility: ''
			});
			
			if (!settings.adjustHeight && data.image) {
                height = 'auto';
            }
			
            return this;
        };
        
        this.showLightbox = function (elem) {
			if (typeof(elem) == 'number') {
				if (elem >= 0 && elem < items.length) {
					elem = items[parseInt(elem)];
				} else {
					console.log('BD: the supplied index of ' + elem + ' falls outside the supported range of 0 - ' + 
						(items.length - 1) + ' for this gallery. An index of 0 has been substituted instead.');
					elem = items[0];
				}
			}
			
			var oldIndex = index
			$.each(openBefore, function () {
				this.call(_this, elem.data().index, oldIndex);
			});
			
            this.closeLightbox();
            bdOverlay.show();
			
            $.each(items, function () {
				this.parent().hide();
			});
			
            elem.data().open();
            elem.parent().show();
            this.resize(elem);
            index = elem.data().index;
			isOpen = true;
			
			resumeAuto();
			
			$.each(openAfter, function () {
				this.call(_this, elem.data().index, oldIndex);
			});
			
            return this;
        };
        
        this.closeLightbox = function () {
			
			$.each(closeBefore, function () {
				this.call(_this, index);
			});
			
            $('.bd-item').hide();
            for (var i = 0; i < items.length; i++) {
                items[i].data().close();
            }
            bdOverlay.hide();
			isOpen = false;
			
			pauseAuto();
			
			$.each(closeAfter, function () {
				this.call(_this, index);
			});
			
            return this;
        };
        
        this.nextSlide = function () {
            if (settings.gallery) {
                var newIndex = index >= items.length - 1 ? 0 : index + 1;
				
				$.each(slideNext, function () {
					this.call(_this, newIndex, index);
				});
				
                this.showLightbox(items[newIndex]);
            }
			
            return this;
        };
        
        this.prevSlide = function () {
            if (settings.gallery) {
                var newIndex = index == 0 ? items.length - 1 : index - 1;
				
				$.each(slidePrev, function () {
					this.call(_this, newIndex, index);
				});
				
                this.showLightbox(items[newIndex]);
            }
			
            return this;
        };
		
		this.startAuto = function () {
			auto = true;
			resumeAuto();
		};
		
		this.stopAuto = function () {
			auto = false;
			pauseAuto();
		};
		
		this.getItems = function () {
			return items;
		};
		
		this.getCurrentIndex = function () {
			return index;
		};
		
		this.getIsOpen = function () {
			return isOpen;
		};
		
		this.getTimerValue = function () {
			return timer;
		};
		
		this.getIsAuto = function () {
			return auto;
		};
		
		this.onLightboxLoad = function (handler) {
			lightboxLoad.push(handler);
		};
		
		this.onOpenBefore = function (handler) {
			openBefore.push(handler);
		};
		
		this.onOpenAfter = function (handler) {
			openAfter.push(handler);
		};
		
		this.onCloseBefore = function (handler) {
			closeBefore.push(handler);
		};
		
		this.onCloseAfter = function (handler) {
			closeAfter.push(handler);
		};
		
		this.onSlideNext = function (handler) {
			slideNext.push(handler);
		};
		
		this.onSlidePrev = function (handler) {
			slidePrev.push(handler);
		};
		
		this.reloadLightbox = function (obj) {
			var open = isOpen;
			var index = index;
			
			$.each(items, function () {
				this.data().link.off('click.bdLightbox:' + $.fn.bdLightbox.count);
			});
            $(window).off('resize.bdLightbox:' + $.fn.bdLightbox.count);
            bdContainer.remove();
			bdOverlay.remove();
			
			this.bdLightbox(obj);
			
			if (open) {
				this.showLightbox(index);
			}
		};
		
		this.updateSettings = function (obj) {
			var open = isOpen;
			var index = index;
			
			for (var o in obj) {
				settings[o] = obj[o];
			}
			$.each(items, function () {
				this.data().link.off('click.bdLightbox:' + $.fn.bdLightbox.count);
			});
            $(window).off('resize.bdLightbox:' + $.fn.bdLightbox.count);
            bdContainer.remove();
			bdOverlay.remove();
			
			this.bdLightbox(settings);
			
			if (open) {
				this.showLightbox(index);
			}
		};
		
        this.destroyLightbox = function () {
			$.each(items, function () {
				this.data().link.off('click.bdLightbox:' + $.fn.bdLightbox.count);
			});
			$(window).off('resize.bdLightbox:' + $.fn.bdLightbox.count);
            bdContainer.remove();
			bdOverlay.remove();
			
            delete this;
        };
		
		$.each(lightboxLoad, function () {
			this.call(_this, settings);
		});
        
        return this;
    };
	
	$.fn.bdLightbox.urlHandlers = [];
	
	function imageUrls(str) {
		if (/\.jpg$|\.png$|\.gif$|\.jpeg$/.test(str)) {
			var obj = {};
			obj.html = '<img src="' + str + '" width="100%" height="100%" />';
			obj.type = 'image';
			return obj;
		}
		
		return false;
	}
	$.fn.bdLightbox.urlHandlers.push(imageUrls);
	
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