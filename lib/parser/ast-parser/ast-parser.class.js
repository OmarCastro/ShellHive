"use strict";
var graph_1 = require("../../graph");
var _supported_commands_1 = require("../commands/_supported_commands");
var parser_1 = require("../parser");
/**
 * Parses the Abstract Syntax Tree
 * and transforms it to a graph representation format
 * that can be used in the visual application
 *
 * @param ast - the Abstract Syntax Tree
 * @param tracker - and tracker the tracks the id of a component
 * @return the visual representation of the object
 */
function parseAST(ast, tracker) {
    if (tracker === void 0) { tracker = { id: 0 }; }
    var graph = new graph_1.Graph();
    var components = graph.components;
    var connections = graph.connections;
    var firstMainComponent = null;
    var LastCommandComponent = null;
    ast.forEach(function (commandNode, index) {
        var exec = commandNode.exec;
        var args = commandNode.args;
        var nodeParser = _supported_commands_1.parserCommand[exec];
        if (nodeParser.parseCommand) {
            if (exec === 'tee') {
                return nodeParser.parseCommand(args, parser_1.parser, tracker, LastCommandComponent, ast.slice(index + 1), firstMainComponent, components, connections);
            }
            var result_aux = nodeParser.parseCommand(args, parser_1.parser, tracker, LastCommandComponent);
            var result = (result_aux instanceof Array) ? result_aux[1] : result_aux;
            components.push.apply(components, result.components);
            connections.push.apply(connections, result.connections);
            var CommandComponent = result.firstMainComponent;
            if (LastCommandComponent) {
                var comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
                var connection = new graph_1.Connection(comp, 'output', CommandComponent, 'input');
                connections.push(connection);
            }
            LastCommandComponent = (result_aux instanceof Array) ? [result_aux[0], CommandComponent] : CommandComponent;
            if (index < 1) {
                firstMainComponent = CommandComponent;
            }
        }
    });
    graph.connections = connections;
    graph.components = components;
    graph.firstMainComponent = firstMainComponent;
    graph.counter = tracker.id;
    return graph;
}
exports.parseAST = parseAST;
