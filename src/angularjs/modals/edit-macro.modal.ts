import * as app from "../app.module"


interface IForm {
  name: string;
  description: string;
}

interface IModalResult {
  result: "edit" | "delete" | "view";
  form: IForm
}

function modalController(form: IForm){

  return ["$scope", "$modalInstance", modalControllerFunction]
  function modalControllerFunction($scope, $modalInstance){
  $scope.form = form;
  $scope.cancel = function(){
    return $modalInstance.dismiss('cancel');
  };
  $scope.edit = function(){
    $modalInstance.close({ result: "edit", form: $scope.form });
  };
  $scope['delete'] = function(){
    $modalInstance.close({ result: "delete", form: $scope.form  });
  };
  $scope.view = function(){
    $modalInstance.close({ result: "view", form: $scope.form });
  };
}

}


function showModalFunction(modalservice, macro) : angular.IPromise<IModalResult>{
  const form: IForm = {
      name: macro.name,
      description: macro.description
    };

  const modalInstance = modalservice.open({
    templateUrl: 'myModalContent.html',
    controller: modalController(form)
  });
  return modalInstance.result;
}

export const showModal = showModalFunction