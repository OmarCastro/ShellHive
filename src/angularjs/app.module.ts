import * as angular from "angular";
import * as ngAnimate from "angular-animate";
import * as angularUi from "angular-ui-bootstrap";
import * as angularUiLayout from "angular-ui-layout";

const ModuleDeclaration = angular.module('app', [angularUi as string, ngAnimate, angularUiLayout]);
window["app"] = ModuleDeclaration
window["angular"] = angular



// Support AMD require
export = ModuleDeclaration;

