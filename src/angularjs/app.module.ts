import * as angular from "angular";
import * as ngAnimate from "angular-animate";

const ModuleDeclaration = angular.module('app', ['ui.bootstrap',ngAnimate, 'ui.layout']);
window["app"] = ModuleDeclaration
window["angular"] = angular



// Support AMD require
export = ModuleDeclaration;

