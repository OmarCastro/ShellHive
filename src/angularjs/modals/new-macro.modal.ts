
var modalController = ["$scope", "$modalInstance", modalControllerFunction]

function modalControllerFunction($scope, $modalInstance){
	var form = { name: '',  description: '',  command: ''  };
  $scope.form = form;
  $scope.cancel = function(){
    return $modalInstance.dismiss('cancel');
  };
  $scope.ok = function(){
    $modalInstance.close(form);
  };
}


function showModalFunction(modalservice){
  var modalInstance = modalservice.open({
    templateUrl: 'myModalContent.html',
    controller: modalController
  });
  return modalInstance.result;
}

export var showModal = showModalFunction