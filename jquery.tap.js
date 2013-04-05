;(function($, undefined) {
  var incrementalElementId = 0,
      mutex = 0,
      dpr = undefined !== window.devicePixelRatio ? window.devicePixelRatio : 1 ;

  $.fn.tap = function(threshold, callback) {
    if (typeof threshold === 'function') {
      callback = threshold;
      threshold = 20;
    }
    
    // calculate move treshold with device pixel ratio
    threshold = threshold * dpr;
    
    if ('ontouchstart' in window) {
      this.each(function() {
        
        var moveDistance = 0,
            touch = null,
            elementId = ++incrementalElementId,
            startPoint = null,
            touching = false,
            self = this,
            $self = $(this);

        $self.bind('touchstart', function(e) {
          if (mutex != 0) return;
          else mutex = elementId;

          touching = true;
          moveDistance = 0;

          if (e.originalEvent.touches && e.originalEvent.touches[0]) {
            touch = e.originalEvent.touches[0];
            startPoint = { x: touch.screenX, y: touch.screenY }
          }
        });

        $self.bind('touchend', function(e) {
          if (mutex == elementId) mutex = 0;
          if (!touching) return;
          touching = false;
          if (moveDistance < threshold) {
            callback.apply(self, [].slice.call(arguments));
          } else {
            $self.trigger('tap-failed');
          }
        });

        $self.bind('touchmove', function(e) {
          if (!touching) return;
          if (e.originalEvent.touches.length == 0 || startPoint === null) {
            return touching = false;
          }

          touch = e.originalEvent.touches[0];
          
          moveDistance = Math.sqrt(Math.pow(touch.screenX - startPoint.x, 2) +
                                   Math.pow(touch.screenY - startPoint.y, 2));

          if (moveDistance > threshold) {
            $self.trigger('exceed-tap-threshold');
            touching = false;
          }
        });

        $self.bind('touchcancel', function() {
          if (mutex == elementId) mutex = 0;
          touching = false;
          $self.trigger('tap-failed');
        })
      })
    } else {
      this.click(callback);
    }
    return this;
  }
})(jQuery);
