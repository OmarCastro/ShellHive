import * as app from "../app.module"


interface TipScope extends angular.IScope{
    showTooltip: boolean
    status: {
        noTooltip: boolean
    }
}

app.directive("tip", [function(){
  return {
    restrict:"C",
    scope: true,
    link: function(scope:TipScope , element: JQuery, attr: angular.IAttributes){
      element.hover(
        function(){
            if(!scope.status.noTooltip){
                scope.$applyAsync("showTooltip = true");
            } 
        },
        function(){
          scope.$applyAsync("showTooltip = false");
        }
      )}
  };
}]); 