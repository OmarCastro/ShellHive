/**
 * MacroController
 *
 * @description :: Server-side logic for managing macroes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
import * as passport from "passport"
import { CoreController } from "./CoreController"

declare var CollaborationService;
declare var GraphGeneratorService;
declare var User;
declare var Project;
declare var sails;
declare var Graph;
declare var parser;

class MacroController extends CoreController {
  create(req, res, next) {
    this._handleRequest(req, res, (req, res, options) => {
      var data = req.body.data;
      data.data.inputs = ["input"]
      data.data.outputs = ["output", "error"]
      if (parser.implementedCommands.indexOf(data.data.name) > -1) {
        return res.json({
          alert: true,
          message: "cannot create a macro with same name of a command (" + data.data.name + ")",
        })
      }

      data.project = req.socket.projectId
      var command = (req.body as any).command;
      Graph.find({ project: data.project, type: 'macro' }).exec(function (err, graphs: any[]) {
        if (err || !graphs) return next(err);
        let exsistingGraph = null
        for (const graph of graphs) {
          if (graph.data.name == data.data.name) {
            exsistingGraph = graph;
            break;
          }
        }
        if (exsistingGraph) {
          res.json({
            alert: true,
            message: "macro with same name already exists",
          })
        } else {
          Graph.create(data).exec(function (err, created) {
            if (err || !created) return next(err);
            CollaborationService.updateMacroList(req.socket);
            GraphGeneratorService.addToGraph(created.id, command, function () {
              res.json({
                message: "macro created",
                name: created.data.name,
                macro: created.id
              })
            }, true)
            sails.log('Created macro with name ' + created.name);
          });
        }
      })

    })
  }


  setData(req, res, next) {
    this._handleRequest(req, res, (req, res, options) => {
      var id = req.body.macroId;
      var data = req.body.data;
      Graph.findOne(id).exec(function (err, created) {
        if (err || !created) return next(err);
        created.data = data;
        created.save(function () {
          CollaborationService.updateMacroList(req.socket);
          res.json({
            message: "macro updated"
          })
        })
      });
    })
  }

  remove(req, res, next) {
    this._handleRequest(req, res, (req, res, options) => {
      var id = req.body.id;
      Graph.destroy(id).exec(function (err, removed) {
        if (err || !removed) return next(err);
        CollaborationService.updateMacroList(req.socket);
        res.json({
          message: "macro removed"
        })
      });
    })
  }


  removeInput(req, res, next) {
    this._handleRequest(req, res, (req, res, options) => {
      var userID = req.user.id;
      var id = req.body.macroId;
      var data = req.body.data;
      Graph.findOne(id).exec(function (err, created) {
        if (err || !created) return next(err);
        created.data = data;
        created.save(function () {
          CollaborationService.updateMacroList(req.socket);
          res.json({
            message: "macro updated"
          })
        })
      });
    })
  }


}

module.exports = new MacroController();

