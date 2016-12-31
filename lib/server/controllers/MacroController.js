"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CoreController_1 = require("./CoreController");
var MacroController = (function (_super) {
    __extends(MacroController, _super);
    function MacroController() {
        return _super.apply(this, arguments) || this;
    }
    MacroController.prototype.create = function (req, res, next) {
        this._handleRequest(req, res, function (req, res, options) {
            var data = req.body.data;
            data.data.inputs = ["input"];
            data.data.outputs = ["output", "error"];
            if (parser.implementedCommands.indexOf(data.data.name) > -1) {
                return res.json({
                    alert: true,
                    message: "cannot create a macro with same name of a command (" + data.data.name + ")",
                });
            }
            data.project = req.socket.projectId;
            var command = req.body.command;
            Graph.find({ project: data.project, type: 'macro' }).exec(function (err, graphs) {
                if (err || !graphs)
                    return next(err);
                var exsistingGraph = null;
                for (var _i = 0, graphs_1 = graphs; _i < graphs_1.length; _i++) {
                    var graph = graphs_1[_i];
                    if (graph.data.name == data.data.name) {
                        exsistingGraph = graph;
                        break;
                    }
                }
                if (exsistingGraph) {
                    res.json({
                        alert: true,
                        message: "macro with same name already exists",
                    });
                }
                else {
                    Graph.create(data).exec(function (err, created) {
                        if (err || !created)
                            return next(err);
                        CollaborationService.updateMacroList(req.socket);
                        GraphGeneratorService.addToGraph(created.id, command, function () {
                            res.json({
                                message: "macro created",
                                name: created.data.name,
                                macro: created.id
                            });
                        }, true);
                        sails.log('Created macro with name ' + created.name);
                    });
                }
            });
        });
    };
    MacroController.prototype.setData = function (req, res, next) {
        this._handleRequest(req, res, function (req, res, options) {
            var id = req.body.macroId;
            var data = req.body.data;
            Graph.findOne(id).exec(function (err, created) {
                if (err || !created)
                    return next(err);
                created.data = data;
                created.save(function () {
                    CollaborationService.updateMacroList(req.socket);
                    res.json({
                        message: "macro updated"
                    });
                });
            });
        });
    };
    MacroController.prototype.remove = function (req, res, next) {
        this._handleRequest(req, res, function (req, res, options) {
            var id = req.body.id;
            Graph.destroy(id).exec(function (err, removed) {
                if (err || !removed)
                    return next(err);
                CollaborationService.updateMacroList(req.socket);
                res.json({
                    message: "macro removed"
                });
            });
        });
    };
    MacroController.prototype.removeInput = function (req, res, next) {
        this._handleRequest(req, res, function (req, res, options) {
            var userID = req.user.id;
            var id = req.body.macroId;
            var data = req.body.data;
            Graph.findOne(id).exec(function (err, created) {
                if (err || !created)
                    return next(err);
                created.data = data;
                created.save(function () {
                    CollaborationService.updateMacroList(req.socket);
                    res.json({
                        message: "macro updated"
                    });
                });
            });
        });
    };
    return MacroController;
}(CoreController_1.CoreController));
module.exports = new MacroController();
