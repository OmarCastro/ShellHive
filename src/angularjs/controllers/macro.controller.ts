import * as app from "../app.module"
import { SocketService } from "../socket.service"
import { projectId } from "../utils"
import  * as newMacroModal  from "../modals/new-macro.modal"
import  * as alerts  from "../services/alerts"
import  * as csrf  from "../services/csrf"


app.controller('macroCtrl', ['$scope','$modal',alerts.serviceName, macroCtrlFunction]);


function macroCtrlFunction(scope, modal, alerts: alerts.IAlertService){


  scope.newMacroModal = function(){
    return newMacroModal.showModal(modal).then(function(form){
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
        project: projectId,
        data: data,
        type:'macro'
      },
      command: command,
      _csrf: csrf.CSRF.csrfToken

    }

    interface ICreateMacroResult{
      alert: boolean
      message: string
      status: number
      errors: string[]
      macro: any
    }

    SocketService.sailsSocket.post<ICreateMacroResult>('/macro/create/', message, function(data){
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
}

export = {init: function(){}}