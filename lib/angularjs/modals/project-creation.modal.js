"use strict";
var modalController = ["$scope", "$modalInstance", modalControllerFunction];
function modalControllerFunction($scope, $modalInstance) {
    var form = { command: '' };
    $scope.form = form;
    $scope.ok = function () {
        $modalInstance.close(form);
    };
}
function showModalFunction(modalservice) {
    var modalInstance = modalservice.open({
        backdrop: 'static',
        templateUrl: 'projectCreationModal.html',
        controller: modalController
    });
    return modalInstance.result;
}
exports.showModal = showModalFunction;
