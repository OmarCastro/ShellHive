"use strict";
var modalController = ["$scope", "$modalInstance", modalControllerFunction];
function modalControllerFunction($scope, $modalInstance) {
    var form = { name: '' };
    $scope.form = form;
    $scope.ok = function () {
        $modalInstance.close(form);
    };
}
function showModalFunction(modalservice) {
    var modalInstance = modalservice.open({
        backdrop: 'static',
        templateUrl: 'UserNameModal.html',
        controller: modalController
    });
    return modalInstance.result;
}
exports.showModal = showModalFunction;
