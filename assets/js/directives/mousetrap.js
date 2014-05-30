app.directive("mousetrap", ['$compile', function($compile){
  return {
    scope: true,
    link: function(scope, element, attr){
      var shorcuts = attr.mousetrap;
      var htmlbuttons = shorcuts.split("+").map(function(key){
        return "<kbd>"+key+"</kbd>"
      }).join("+");

      //var el = $compile( '<span class="badge" tooltip-placement="right" tooltip-html-unsafe="'+htmlbuttons+'">?</span>' )( scope );

      element.append('<div class="small align-right">'+htmlbuttons+'</div>');
      Mousetrap.bind(attr.mousetrap.toLowerCase(), function(){
        element.trigger("click");
      })


      //  Mousetrap.bind("ctrl+shift+up", function(){scope.$apply(scope.collapseAll)});
      //  Mousetrap.bind("alt+a", function(){scope.$apply(scope.collapseAll)});
      //  Mousetrap.bind("alt+s", function(){scope.$apply(scope.toggleShell)});
      //  Mousetrap.bind("ctrl+shift+down", function(){scope.$apply(scope.uncollapseAll)});
    }
  };
}]);
