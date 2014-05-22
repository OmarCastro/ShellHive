app.directive("parameterField", ['$timeout', function($timeout){
  return {
    scope: true,
    link: function(scope, element, attr){
      if (attr.type === 'radio' || attr.type === 'checkbox') return;

      function sendUpdate (){
        scope.$emit('updateComponent',scope.data)
      }
      var promise = $timeout(function() {console.log("yay!!")}, 1000);

      element.bind('change', function() {
        promise = $timeout(sendUpdate, 400);        
      });
      element.bind('blur', function() {
        $timeout.cancel(promise);
        scope.$apply(sendUpdate);         
      });
    }
  };
}]);
