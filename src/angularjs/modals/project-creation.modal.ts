import * as app from "../app.module"

const modalController = ["$scope", "$modalInstance", modalControllerFunction]

interface IModalResult {
  command: string;
}


function modalControllerFunction($scope, $modalInstance){
  const form: IModalResult = { command: '' };
  $scope.form = form;
  $scope.ok = function(){
    $modalInstance.close(form);
  };
}

function showModalFunction(modalservice) : angular.IPromise<IModalResult>{
  const modalInstance = modalservice.open({
      backdrop: 'static',
    templateUrl: 'projectCreationModal.html',
    controller: modalController
  });
  return modalInstance.result;
}

export const showModal = showModalFunction