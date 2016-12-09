import * as app from "../app.module"

interface IParameterFieldAttributes extends angular.IAttributes {
  type: string
}

interface IParameterFieldScope extends angular.IScope {
  data: any
}

app.directive("parameterField", ['$timeout', function($timeout){
  return {
    scope: true,
    link: function(scope:IParameterFieldScope, element, attr: IParameterFieldAttributes){
      if (attr.type === 'radio' || attr.type === 'checkbox') return;

      function sendUpdate (){
        scope.$emit('updateComponent',scope.data)
      }
      let promise;

      element.bind('keyup', function() {
        $timeout.cancel(promise);
        promise = $timeout(sendUpdate, 500);        
      });

      element.bind('blur', function() {
        $timeout.cancel(promise);
        scope.$applyAsync(sendUpdate);         
      });
    }
  };
}]);
