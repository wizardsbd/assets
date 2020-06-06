
$(function(){
	var intervalId;
	var angleDataIndex = 1;
	var prevAngle = {x : 0, y : 0};
	var preFace = "front";
	var lastRot = [];
	var anglesArr = [{
				x: 0, y : 0, face:"front" /*from*/
			},{
				x: 90, y : 0 , face:"bottom" /*bottom*/
			},{
				x: -90, y : 0, face:"top" /*top*/
			},{
				x: 0, y : 90 , face:"left" /*left*/
			}];
    var el = document.createElement('div'),
        transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
        transformProp = support(transformProps),
        transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
        transitionDurationProp = support(transitionDuration);

    function support(props) {
        for(var i = 0, l = props.length; i < l; i++) {
            if(typeof el.style[props[i]] !== "undefined") {
                return props[i];
            }
        }
    }

    var mouse = {
            start : {}
        },
        touch = document.ontouchmove !== undefined,
        viewport = {
            x: 0,
            y: 0,
            el: $('.cube')[0],
            move: function(coords) {
                if(coords) {
                    if(typeof coords.x === "number") this.x = coords.x;
                    if(typeof coords.y === "number") this.y = coords.y;
                }

                this.el.style[transformProp] = "scale(0.7) translateZ(-150px) rotateX("+this.x+"deg) rotateY("+this.y+"deg)";
            },
            reset: function() {
                this.move({x: 0, y: 0});
            }
        };

    viewport.duration = function() {
        var d = touch ? 50 : 500;
        viewport.el.style[transitionDurationProp] = d + "ms";
        return d;
    }();

    $(document).keydown(function(evt) {
        switch(evt.keyCode)
        {
            case 37: // left
                viewport.move({y: viewport.y - 90});
                break;

            case 38: // up
                evt.preventDefault();
                viewport.move({x: viewport.x + 90});
                break;

            case 39: // right
                viewport.move({y: viewport.y + 90});
                break;

            case 40: // down
                evt.preventDefault();
                viewport.move({x: viewport.x - 90});
                break;

            case 27: //esc
                viewport.reset();
                break;

            default:
                break;
        };
    })
	$('.wrapper').bind('mousedown touchstart', function(evt) {
        delete mouse.last;
        if($(evt.target).is('a, iframe')) {
            return true;
        }
		lastRot = [];
		clearInterval(intervalId);
			
        evt.originalEvent.touches ? evt = evt.originalEvent.touches[0] : null;
        mouse.start.x = evt.pageX;
        mouse.start.y = evt.pageY;
		viewport.el.style[transformProp] = "scale(0.7) translateZ(-150px) rotateX("+viewport.x+"deg) rotateY("+viewport.y+"deg)";
        $(".wrapper").bind('mousemove touchmove', function(event) {
            // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
            //if((!touch || !(event.originalEvent && event.originalEvent.touches.length > 1))) {
                event.preventDefault();
                // Get touch co-ords
                event.originalEvent.touches ? event = event.originalEvent.touches[0] : null;
                $('.viewport').trigger('move-viewport', {x: event.pageX, y: event.pageY});
            //}
        });

        $(document).bind('mouseup touchend', function () {
            $(".wrapper").unbind('mousemove touchmove');
			var snapX = getNearestSnap(viewport.x);
			var snapY = getNearestSnap(viewport.y);
			console.info("1",snapX, snapY);
			var coords = properRotation(snapX, snapY);
			viewport.el.style[transitionDurationProp] = "500ms";
			viewport.el.style[transformProp] = "scale(1) translateZ(-150px) rotateX("+coords.x+"deg) rotateY("+coords.y+"deg)";
			viewport.x = coords.x;
			viewport.y = coords.y;
			prevAngle = coords;
			startRandomRotation();
        });
    });

    $('.viewport').bind('move-viewport', function(evt, movedMouse) {
				
        // Reduce movement on touch screens
        var movementScaleFactor = touch ? 2 : 2;

        if (!mouse.last) {
            mouse.last = mouse.start;
        } else {
            if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
                mouse.start.x = mouse.last.x;
            }
            if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
                mouse.start.y = mouse.last.y;
            }
        }
		
        viewport.move({
            x: viewport.x + parseInt((mouse.start.y - movedMouse.y)/movementScaleFactor),
            y: viewport.y - parseInt((mouse.start.x - movedMouse.x)/movementScaleFactor)
        });
		console.info("mo",viewport.x, viewport.y)
		if(Math.abs(viewport.x) >= 45 && lastRot.indexOf("UPDOWN")==-1){
			lastRot.push("UPDOWN");
		}
		if(Math.abs(viewport.y) >= 45 && lastRot.indexOf("LEFTRIGHT")==-1){
			lastRot.push("LEFTRIGHT");
		}
		console.info("mo", lastRot)
        mouse.last.x = movedMouse.x;
        mouse.last.y = movedMouse.y;

        function forward(v1, v2) {
            return v1 >= v2 ? true : false;
        }
    });
    startRandomRotation();
	
	function startRandomRotation(){
		clearInterval(intervalId);
		intervalId = setInterval(function(){
			
			var newX = anglesArr[angleDataIndex].x;
			var newY = anglesArr[angleDataIndex].y;
			
			
			viewport.el.style[transitionDurationProp] = "500ms";
			viewport.el.style[transformProp] = "scale(0.7) translateZ(-150px) rotateX("+newX+"deg) rotateY("+newY+"deg)";
			setTimeout(function(){
				viewport.el.style[transitionDurationProp] = "400ms";
				viewport.el.style[transformProp] = "scale(1) translateZ(-150px) rotateX("+newX+"deg) rotateY("+newY+"deg)";
				viewport.x = newX
				viewport.y = newY
				setTimeout(function(){
					angleDataIndex++;
					if(angleDataIndex>=anglesArr.length){
						angleDataIndex = 0;
					}
				}, 400);
			}, 500);
		}, 3000);
	}
	
	function properRotation(_x,_y){
		var coords = {x:_x,y:_y};
		
		if(_x == prevAngle.x && _y==prevAngle.y){
			return coords;
		}
		
		
		var isXNeg = _x < 0 ? -1 : 1;
		var isYNeg = _y < 0 ? -1 : 1;
		var factorX = _x/90;
		var factorY = _y/90;
		var diffX = (_x < 0 ? factorX+4 : factorX)%4;
		var diffY = (_y < 0 ? factorY+4 : factorY)%4;
		var face = "front";
		console.info("2",_x, _y, diffX, diffY);
		if(prevAngle.x == coords.x && prevAngle.y != coords.y){
			if(diffY == 0){
				face = "front"; 
			} else if(diffY == 1){
				face = "right";
			} else if(diffY == 2){
				face = "back";
			} else if(diffY == 3){
				face = "left";
			}
		} else if(prevAngle.y == coords.y && prevAngle.x != coords.x){
			if(diffX == 0){
				face = "front"; 
			} else if(diffX == 1){
				face = "bottom";
			} else if(diffX == 2){
				face = "back";
			} else if(diffX == 3){
				face = "top";
			}
		} else {
			if(lastRot[lastRot.length-1]=="LEFTRIGHT"){
				if(diffY == 0){
					face = "front"; 
				} else if(diffY == 1){
					face = "right";
				} else if(diffY == 2){
					face = "back";
				} else if(diffY == 3){
					face = "left";
				}
			}else if(lastRot[lastRot.length-1]=="UPDOWN"){
				if(diffX == 0){
					face = "front"; 
				} else if(diffX == 1){
					face = "bottom";
				} else if(diffX == 2){
					face = "back";
				} else if(diffX == 3){
					face = "top";
				}
			}
		}
		
		
		switch(face){
			case "top":
				coords.x = -90;
				coords.y = 0;
			break;
			case "front":
				coords.x = 0;
				coords.y = 0;
			break;
			case "right":
				coords.x = 0;
				coords.y = 90;
			break;
			case "back":
				coords.x = 0;
				coords.y = 180;
			break;
			case "left":
				coords.x = 0;
				coords.y = -90;
			break;
			case "bottom":
				coords.x = 90;
				coords.y = 0;
			break;
		}
		preFace = face;
		console.info("3",face);
		return coords;
	}
});


function getNearestSnap(angle){
	var nearestSnapDiff = Math.abs(angle%90);
	var nearestSnap = nearestSnapDiff;
	var nearestSnapAngle = 0;
	
	if(nearestSnapDiff > 45){
		nearestSnap = 90 - nearestSnapDiff;
		nearestSnapAngle = angle + nearestSnap;
		if(angle < 0){
			nearestSnapAngle = angle - nearestSnap;
		}
	} else {
		nearestSnapAngle = angle - nearestSnap;
		if(angle < 0){
			nearestSnapAngle = angle + nearestSnap;
		}
	}
	
	return nearestSnapAngle;
}


var swipe_start = document.querySelector("html body");
var swipe_start_icon_div = document.querySelector(".swipe_start");

 swipe_start.addEventListener("click",swipe_start_func);
 swipe_start.addEventListener("touchmove",swipe_start_func);
 swipe_start.addEventListener("touchstart",swipe_start_func);

 function swipe_start_func(){
 	swipe_start_icon_div.style.display="none";
 	swipe_start_icon_div.style.zIndex = "-100";
 }

