'use strict';

var windowHeight = window.innerHeight,
    windowHeightExtra = 0;
var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    mobile = /Mobi/.test(navigator.userAgent);

if (safari && !mobile) {
	windowHeightExtra = window.outerHeight - window.innerHeight;
}

if (mobile) {
	windowHeight = window.screen.availHeight; 
	windowHeightExtra = (window.screen.availHeight - window.innerHeight) / 2;
}

var positionParallax = function positionParallax(container, speed, parallax, elem) {
	var bgScroll = container.top / speed - windowHeightExtra;
	parallax[elem].style.top = bgScroll +40 + 'px';
};

var animateParallax = function animateParallax(parallax, speed) {
	for (var i = 0; parallax.length > i; i++) {
		var container = parallax[i].parentElement.parentElement.getBoundingClientRect();
		if (container.top + container.height >= 0 && container.top <= windowHeight) {
			positionParallax(container, speed, parallax, i);
		}
	}
};
var calculateHeight = function calculateHeight(parallax, speed) {
	for (var i = 0; parallax.length > i; i++) {
		var container = parallax[i].parentElement.parentElement.getBoundingClientRect();
		var containerTop = parallax[i].parentElement.parentElement.offsetTop;
		var elemOffsetTop = (windowHeight - container.height) / 2;
		var bgHeight = windowHeight > container.height + containerTop ? container.height + containerTop - containerTop / speed : container.height + (elemOffsetTop - elemOffsetTop / speed) * 2;
		parallax[i].style.height = bgHeight + windowHeightExtra * 2 + 'px';
		positionParallax(container, speed, parallax, i);
	}
};

var universalParallax = function universalParallax() {
	var up = function up(parallax, speed) {
		if (speed < 1) { speed = 1; }
		calculateHeight(parallax, speed);
		if (!mobile) {
			window.addEventListener('resize', function () {
				windowHeight = window.innerHeight;
				calculateHeight(parallax, speed);
			});
		}
		window.addEventListener('scroll', function () { animateParallax(parallax, speed); });
	};
	this.init = function (param) {
		if (typeof param === 'undefined') { param = {}; }
		param = {
			speed: typeof param.speed !== 'undefined' ? param.speed : 1.5,
			className: typeof param.className !== 'undefined' ? param.className : 'parallax'
		};
		var parallax = document.getElementsByClassName(param.className);

		for (var i = 0; parallax.length > i; i++) {
			var wrapper = document.createElement('div');
			parallax[i].parentNode.insertBefore(wrapper, parallax[i]);
			wrapper.appendChild(parallax[i]);
			var parallaxContainer = parallax[i].parentElement;
			parallaxContainer.className += 'parallax__container';

			if (window.getComputedStyle(parallaxContainer.parentElement, null).getPropertyValue('position') !== 'relative') {
				parallaxContainer.parentElement.style.position = 'relative';
			}

			var imgData = parallax[i].dataset.parallaxImage;
			if (typeof imgData !== 'undefined') {
				parallax[i].style.backgroundImage = 'url(' + imgData + ')';
				if (parallax[i].classList.length === 1 && parallax[i].classList[0] === 'parallax') {
					parallax[i].style.backgroundRepeat = 'no-repeat';
					parallax[i].style.backgroundPosition = 'center';
					parallax[i].style.backgroundSize = 'cover';
				}
			}
		};
		document.addEventListener('readystatechange', function (event) {
			if (event.target.readyState === 'complete') {
				up(parallax, param.speed);
			}
		});
	};
};


