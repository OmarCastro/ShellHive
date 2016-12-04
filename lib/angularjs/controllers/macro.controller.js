"use strict";
var app = require("../app.module");
var socket_service_1 = require("../socket.service");
var utils_1 = require("../utils");
var newMacroModal = require("../modals/new-macro.modal");
var editMacroModal = require("../modals/edit-macro.modal");
var alerts = require("../services/alerts");
var csrf = require("../services/csrf");
app.controller('macroCtrl', ['$scope', '$modal', alerts.serviceName, macroCtrlFunction]);
function macroCtrlFunction(scope, modal, alerts) {
    scope.newMacroModal = function () {
        return newMacroModal.showModal(modal).then(function (form) {
            scope.newMacro(form.name, form.description, form.command);
            return form.name = form.description = '';
        });
    };
    scope.macroEditModal = function (macroName) {
        var graphModel = scope.graphModel;
        var macro = graphModel.macros[macroName];
        editMacroModal.showModal(modal, macro).then(function (selectedItem) {
            switch (selectedItem.result) {
                case "edit":
                    scope.$emit("updateMacro", { macroId: macro.id, data: {
                            name: selectedItem.form.name,
                            description: selectedItem.form.description,
                            inputs: macro.inputs,
                            outputs: macro.outputs
                        } });
                    break;
                case "delete":
                    scope.$emit("deleteMacro", { id: macro.id });
                    break;
                case "view":
                    scope.graph.setGraphView(graphModel.macros[macroName].id);
            }
        });
    };
    scope.newMacro = function (name, descr, command) {
        var data = {
            name: name,
            description: descr
        };
        var message = {
            data: {
                project: utils_1.projectId,
                data: data,
                type: 'macro'
            },
            command: command,
            _csrf: csrf.CSRF.csrfToken
        };
        socket_service_1.SocketService.sailsSocket.post('/macro/create/', message, function (data) {
            console.log(data);
            if (data.alert) {
                alerts.addAlert({ type: 'danger', msg: data.message });
            }
            else if (data.status == 500 && data.errors) {
                data.errors.forEach(function (message) {
                    alerts.addAlert({ type: 'danger', msg: message });
                });
            }
            scope.$digest();
            if (data.macro) {
                scope.graph.setGraphView(data.macro);
            }
        });
        //graphModel.macros[name] = shellParser.createMacro(name, descr, command);
        //const res$ = [];
        //for (let key in graphModel.macros) {
        //  res$.push(key);
        //}
        //graphModel.macroList = res$;
    };
}
