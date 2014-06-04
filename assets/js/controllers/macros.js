app.controller('macroCtrl', ['$scope','$modal','alerts','csrf', function(scope, modal, alerts, csrf){


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
        scope.$emit("updateMacro", {macroId: macro.id, data:{
          name: form.name,
          description: form.description,
          inputs: macro.inputs,
          outputs: macro.outputs
        }})
      case "delete":
          scope.$emit("deleteMacro", {id: macro.id});
        break;
      case "view":
        scope.graph.setGraphView(graphModel.macros[macroName].id);
      }
      return form.name = form.description = '';
    });
  };

  scope.newMacro = function(name, descr, command){
    var res$, key;
    var data = {
      name: name,
      description: descr
    }
    var message = {
      data:{
        project: projId,
        data: data,
        type:'macro'
      },
      command: command,
      _csrf: csrf.csrf

    }

    io.socket.post('/macro/create/', message, function(data){
       console.log(data);
      if(data.alert){
        alerts.addAlert({type:'danger', msg: data.message});
      } else if(data.status == 500 && data.errors){
        data.errors.forEach(function(message){
          alerts.addAlert({type:'danger', msg: message})
        })
      }
      scope.$digest();
      if(data.macro){
        scope.graph.setGraphView(data.macro);
      }
    });
    //graphModel.macros[name] = shellParser.createMacro(name, descr, command);
    //res$ = [];
    //for (key in graphModel.macros) {
    //  res$.push(key);
    //}
    //graphModel.macroList = res$;
  };
}]);