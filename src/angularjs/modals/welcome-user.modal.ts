import * as app from "../app.module"

const modalController = ["$scope", "$modalInstance", modalControllerFunction]

interface IModalResult {
  name: string;
}


function modalControllerFunction($scope, $modalInstance){
  const form: IModalResult = { name: '' };
  $scope.form = form;
  $scope.ok = function(){
    $modalInstance.close(form);
  };
}


function showModalFunction(modalservice) : angular.IPromise<IModalResult>{
  debugger;
  const modalInstance = modalservice.open({
      backdrop: 'static',
    templateUrl: 'UserNameModal.html',
    controller: modalController
  });
  return modalInstance.result;
}

export const showModal = showModalFunction