import * as app from "../app.module"

const modalController = ["$scope", "$modalInstance", modalControllerFunction]

interface IModalResult {
  name: string;
  description: string;
  command: string;
}


function modalControllerFunction($scope, $modalInstance){
	const form: IModalResult = { name: '',  description: '',  command: ''  };
  $scope.form = form;
  $scope.cancel = function(){
    return $modalInstance.dismiss('cancel');
  };
  $scope.ok = function(){
    $modalInstance.close(form);
  };
}


function showModalFunction(modalservice) : angular.IPromise<IModalResult>{
  const modalInstance = modalservice.open({
    templateUrl: 'myModalContent.html',
    controller: modalController
  });
  return modalInstance.result;
}

export const showModal = showModalFunction