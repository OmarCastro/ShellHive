"use strict";
var angular = require("angular");
var ngAnimate = require("angular-animate");
var ModuleDeclaration = angular.module('app', ['ui.bootstrap', ngAnimate, 'ui.layout']);
window["app"] = ModuleDeclaration;
window["angular"] = angular;
module.exports = ModuleDeclaration;
