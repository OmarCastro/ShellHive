import * as app from "../../app.module"

interface ElementScope extends angular.IScope {
    scopedElement: JQuery
}

app.directive("elscope", () => ({
    link: function (scope: ElementScope, element) {
        scope.scopedElement = element;
    }
}));