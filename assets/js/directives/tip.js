app.directive("tip", ['$timeout', function($timeout){
  return {
    restrict:"C",
    scope: true,
    link: function(scope, element, attr){
      element.hover(
        function(){ if(!scope.status.noTooltip){scope.showTooltip = true; scope.$digest()} },
        function(){ if(scope.showTooltip){scope.showTooltip = false; scope.$digest()} }
      )}
  };
}]);
