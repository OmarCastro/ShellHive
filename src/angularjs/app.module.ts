import * as angular from "angular";
import * as ngAnimate from "angular-animate";

var ModuleDeclaration = angular.module('app', ['ui.bootstrap',ngAnimate, 'ui.layout']);
window["app"] = ModuleDeclaration
window["angular"] = angular



// Support AMD require
export = ModuleDeclaration;

