(function(){
  var Boundary, getBoundaries;
  Boundary = (function(){
    Boundary.displayName = 'Boundary';
    var prototype = Boundary.prototype, constructor = Boundary;
    function Boundary(left, rigth, top, bottom, component){
      left == null && (left = 0);
      rigth == null && (rigth = 0);
      top == null && (top = 0);
      bottom == null && (bottom = 0);
      if (component.type === 'file') {
        bottom += 100;
      } else {
        bottom += 350;
      }
      this.left = left;
      this.rigth = rigth;
      this.top = top;
      this.bottom = bottom;
      this.components = [component];
    }
    Boundary.fromXY = function(x, y, component){
      return new this(x, x, y, y, component);
    };
    Boundary.fromPoint = function(point, component){
      return this.fromXY(point.x, point.y, component);
    };
    Boundary.fromComponent = function(component){
      return this.fromPoint(component.position, component);
    };
    Boundary.fromComponents = function(components){
      var boundary, i$, to$, i;
      if (components.length === 0) {
        return null;
      }
      boundary = this.fromComponent(components[0]);
      for (i$ = 1, to$ = components.length - 1; i$ <= to$; ++i$) {
        i = i$;
        boundary.extend(this.fromComponent(components[i]));
      }
      return boundary;
    };
    prototype.extendXY = function(x, y){
      var x$;
      x$ = this;
      if (x < boundary.left) {
        x$.left = x;
      }
      if (x > boundary.rigth) {
        x$.rigth = x;
      }
      if (y < boundary.top) {
        x$.top = y;
      }
      if (y > boundary.bottom) {
        x$.bottom = y;
      }
    };
    prototype.extend = function(boundary2){
      var x$;
      x$ = this;
      if (boundary2.left < this.left) {
        x$.left = boundary2.left;
      }
      if (boundary2.rigth > this.rigth) {
        x$.rigth = boundary2.rigth;
      }
      if (boundary2.top < this.top) {
        x$.top = boundary2.top;
      }
      if (boundary2.bottom > this.bottom) {
        x$.bottom = boundary2.bottom;
      }
      x$.components = x$.components.concat(boundary2.components);
    };
    Boundary.translate = function(boundary, x, y){
      var x$, i$, ref$, len$, comp, y$, results$ = [];
      y == null && (y = 0);
      x$ = boundary;
      x$.left += x;
      x$.rigth += x;
      x$.top += y;
      x$.bottom += y;
      for (i$ = 0, len$ = (ref$ = boundary.components).length; i$ < len$; ++i$) {
        comp = ref$[i$];
        y$ = comp.position;
        y$.x += x;
        y$.y += y;
        results$.push(y$);
      }
      return results$;
    };
    prototype.translate = function(x, y){
      y == null && (y = 0);
      Boundary.translate(this, x, y);
    };
    return Boundary;
  }());
  getBoundaries = function(components){
    return Boundary.fromComponents(components);
  };
  function arrangeLayout(boundaries){
    var maxX, prevBound, components, i$, len$, boundary, translateX, translateY, x, y, bottom;
    maxX = 0;
    prevBound = null;
    components = [];
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      if (boundary) {
        maxX = Math.max(boundary.rigth, maxX);
        components = components.concat(boundary.components);
      }
    }
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      if (boundary) {
        translateX = maxX - boundary.rigth;
        translateY = prevBound ? prevBound.bottom - boundary.top : 0;
        Boundary.translate(boundary, translateX, translateY);
        prevBound = boundary;
      }
    }
    if (boundaries.length) {
      x = maxX + 450;
      y = Math.max((prevBound.bottom - 350) / 2, 0);
      bottom = Math.max(prevBound.bottom, 350);
    } else {
      x = 0;
      y = 0;
      bottom = 350;
    }
    return [
      {
        left: 0,
        rigth: x,
        top: 0,
        bottom: bottom,
        components: components
      }, {
        x: x,
        y: y
      }
    ];
  }
  exports.getBoundaries = getBoundaries;
  exports.arrangeLayout = arrangeLayout;
  exports.translateBoundary = Boundary.translate;
}).call(this);
