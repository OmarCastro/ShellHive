(function(){
  var Component, CommandComponent;
  exports.Component = Component = (function(){
    Component.displayName = 'Component';
    var prototype = Component.prototype, constructor = Component;
    function Component(type){
      this.type = type;
      this.position = {
        x: 0,
        y: 0
      };
    }
    prototype.setId = function(id){
      this.id = id;
    };
    prototype.setPosition = function(x, y){
      var ref$;
      ref$ = this.position;
      ref$.x = x;
      ref$.y = y;
    };
    return Component;
  }());
  exports.Component.CommandComponent = CommandComponent = (function(superclass){
    var prototype = extend$((import$(CommandComponent, superclass).displayName = 'CommandComponent', CommandComponent), superclass).prototype, constructor = CommandComponent;
    function CommandComponent(){
      CommandComponent.superclass.call(this, 'command');
    }
    return CommandComponent;
  }(Component));
  exports.Component.FileComponent = CommandComponent = (function(superclass){
    var prototype = extend$((import$(CommandComponent, superclass).displayName = 'CommandComponent', CommandComponent), superclass).prototype, constructor = CommandComponent;
    function CommandComponent(){
      CommandComponent.superclass.call(this, 'file');
    }
    return CommandComponent;
  }(Component));
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
