"use strict";
function modalController(form) {
    return ["$scope", "$modalInstance", modalControllerFunction];
    function modalControllerFunction($scope, $modalInstance) {
        $scope.form = form;
        $scope.cancel = function () {
            return $modalInstance.dismiss('cancel');
        };
        $scope.edit = function () {
            $modalInstance.close({ result: "edit", form: $scope.form });
        };
        $scope['delete'] = function () {
            $modalInstance.close({ result: "delete", form: $scope.form });
        };
        $scope.view = function () {
            $modalInstance.close({ result: "view", form: $scope.form });
        };
    }
}
function showModalFunction(modalservice, macro) {
    var form = {
        name: macro.name,
        description: macro.description
    };
    var modalInstance = modalservice.open({
        templateUrl: 'myModalContent.html',
        controller: modalController(form)
    });
    return modalInstance.result;
}
exports.showModal = showModalFunction;
