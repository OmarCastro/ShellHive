app.controller('macroCtrl', ['$scope','$modal', function(scope, modal){


  scope.newMacroModal = function(){
    var form = { name: '',  description: '',  command: ''  };
    var modalInstance = modal.open({
      templateUrl: 'myModalContent.html',
      controller: function($scope, $modalInstance){
        $scope.form = form;
        $scope.cancel = function(){
          return $modalInstance.dismiss('cancel');
        };
        $scope.ok = function(){
          $modalInstance.close(form);
        };
      }
    });
    return modalInstance.result.then(function(selectedItem){
      scope.newMacro(form.name, form.description, form.command);
      return form.name = form.description = '';
    });
  };


  scope.macroEditModal = function(macroName){
    var macro, form, modalInstance;
    var graphModel = scope.graphModel;
    macro = graphModel.macros[macroName];
    form = {
      name: macro.name,
      description: macro.description
    };
    modalInstance = modal.open({
      templateUrl: 'MacroEditModal.html',
      controller: function($scope, $modalInstance){
        $scope.form = form;
        $scope.cancel = function(){
          return $modalInstance.dismiss('cancel');
        };
        $scope.edit = function(){
          $modalInstance.close({ result: "edit" });
        };
        $scope['delete'] = function(){
          $modalInstance.close({ result: "delete" });
        };
        $scope.view = function(){
          $modalInstance.close({ result: "view" });
        };
      }
    });
    return modalInstance.result.then(function(selectedItem){
      switch (selectedItem.result) {
      case "edit":
        graphModel.macros[form.name] = macro;
        macro.name = form.name;
        macro.description = form.description;
      case "delete":
        delete graphModel.macros[macroName];
        graphModel.macroList = Object.keys(graphModel.macros)
        scope.$apply();
        break;
      case "view":
        scope.graph.setGraphView(graphModel.macros[macroName].id);
      }
      return form.name = form.description = '';
    });
  };

  scope.newMacro = function(name, descr, command){
    var res$, key;
    //graphModel.macros[name] = shellParser.createMacro(name, descr, command);
    //res$ = [];
    //for (key in graphModel.macros) {
    //  res$.push(key);
    //}
    //graphModel.macroList = res$;
  };
}]);