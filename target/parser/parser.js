var parser = {};

var astBuilder = require('./ast-builder/ast-builder');

var GraphModule = require("../common/graph");
var Graph = GraphModule.Graph;
exports.Graph = Graph;
var Macro = GraphModule.Macro;
exports.Macro = Macro;
var GraphComponent = GraphModule.GraphComponent;
exports.GraphComponent = GraphComponent;
var MacroComponent = GraphModule.MacroComponent;
exports.MacroComponent = MacroComponent;
var Component = GraphModule.Component;
exports.Component = Component;
var Connection = GraphModule.Connection;
exports.Connection = Connection;
var FileComponent = GraphModule.FileComponent;
exports.FileComponent = FileComponent;
var CommandComponent = GraphModule.CommandComponent;
exports.CommandComponent = CommandComponent;
var IndexedGraph = GraphModule.IndexedGraph;
exports.IndexedGraph = IndexedGraph;

var parserCommand = {
    awk: require('./commands/awk'),
    cat: require('./commands/cat'),
    date: require('./commands/date'),
    ls: require('./commands/ls'),
    grep: require('./commands/grep'),
    bunzip2: require('./commands/bunzip2'),
    diff: require('./commands/diff'),
    bzcat: require('./commands/bzcat'),
    bzip2: require('./commands/bzip2'),
    compress: require('./commands/compress'),
    gzip: require('./commands/gzip'),
    gunzip: require('./commands/gunzip'),
    zcat: require('./commands/zcat'),
    head: require('./commands/head'),
    tail: require('./commands/tail'),
    tr: require('./commands/tr'),
    tee: require('./commands/tee')
};

var implementedCommands = [];

exports.VisualSelectorOptions = {};
for (var key in parserCommand) {
    implementedCommands.push(key);
    exports.VisualSelectorOptions[key] = parserCommand[key].VisualSelectorOptions;
}

function isImplemented(command) {
    return parserCommand[command] != null;
}
;

/**
* Parses the syntax of the command and
* transforms into an Abstract Syntax Tree
* @param command command
* @return the resulting AST
*/
function generateAST(command) {
    return astBuilder.parse(command);
}
exports.generateAST = generateAST;

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
    if (typeof tracker === "undefined") { tracker = { id: 0 }; }
    var LastCommandComponent, CommandComponent, exec, args, result_aux, result, comp, firstMainComponent;

    var graph = new exports.Graph();
    var components = graph.components;
    var connections = graph.connections;
    var firstMainComponent = null;
    LastCommandComponent = null;
    CommandComponent = null;
    for (var index = 0, _ref = ast, length = _ref.length; index < length; ++index) {
        var commandNode = _ref[index];
        exec = commandNode.exec, args = commandNode.args;
        var nodeParser = parserCommand[exec];
        if (nodeParser.parseCommand) {
            if (exec === 'tee') {
                return nodeParser.parseCommand(args, parser, tracker, LastCommandComponent, ast.slice(index + 1), firstMainComponent, components, connections);
            }
            result_aux = nodeParser.parseCommand(args, parser, tracker, LastCommandComponent);

            result = (result_aux instanceof Array) ? result_aux[1] : result_aux;

            components = components.concat(result.components);
            connections = connections.concat(result.connections);
            CommandComponent = result.firstMainComponent;
            if (LastCommandComponent) {
                comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
                var connection = new GraphModule.Connection(comp, 'output', CommandComponent, 'input');
                connections.push(connection);
            }
            LastCommandComponent = (result_aux instanceof Array) ? [result_aux[0], CommandComponent] : CommandComponent;
            if (index < 1) {
                firstMainComponent = CommandComponent;
            }
        }
    }

    graph.connections = connections;
    graph.components = components;
    graph.firstMainComponent = firstMainComponent;
    graph.counter = tracker.id;
    return graph;
}
exports.parseAST = parseAST;

/**
* parses the command
*/
function parseCommand(command) {
    return exports.parseAST(exports.generateAST(command));
}
exports.parseCommand = parseCommand;

function parseVisualData(VisualData) {
    var indexedComponentList, initialComponent;
    if (VisualData.components.length < 1) {
        return '';
    }
    indexedComponentList = new exports.IndexedGraph(VisualData);
    initialComponent = VisualData.firstMainComponent;
    if (!(initialComponent instanceof exports.CommandComponent)) {
        var ref = VisualData.components;
        for (var i = 0, len = ref.length; i < len; ++i) {
            if (ref[i] instanceof exports.CommandComponent) {
                initialComponent = ref[i];
                break;
            }
        }
    }
    return exports.parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
}
exports.parseVisualData = parseVisualData;

function parseComponent(component, visualData, componentIndex, mapOfParsedComponents) {
    switch (component.type) {
        case exports.CommandComponent.type:
            return parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents);
        case exports.MacroComponent.type:
            return exports.parseVisualData(component.macro);
    }
}
exports.parseComponent = parseComponent;

/**
find the first component to be parsed
*/
function findFirstComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents) {
    do {
        var isFirst = visualData.connections.every(function (connection) {
            if (connection.endComponent == currentComponent && connection.startPort === 'output' && connection.endPort === 'input' && mapOfParsedComponents[connection.startNode] !== true) {
                currentComponent = componentIndex.components[connection.startNode];
                return false;
            }
            return true;
        });
    } while(isFirst == false);
    return currentComponent;
}
exports.findFirstComponent = findFirstComponent;

/**
Parse visual data from Component
*/
function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents) {
    var commands = [];
    currentComponent = exports.findFirstComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
    var parsedCommand = exports.parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
    var parsedCommandIndex = commands.length;
    commands.push(parsedCommand);

    var outputs = [];
    var stdErrors = [];
    var exitCodes = [];

    visualData.connections.filter(function (connection) {
        return connection.startNode === currentComponent.id && mapOfParsedComponents[connection.endNode] !== true;
    }).forEach(function (connection) {
        var endNodeId = connection.endNode;
        var endNode = componentIndex.components[endNodeId];
        switch (connection.startPort) {
            case 'output':
                outputs.push(endNode);
                break;
            case 'error':
                stdErrors.push(endNode);
                break;
            case 'retcode':
                exitCodes.push(endNode);
                break;
        }
    });

    var parselist = function (list) {
        var result = [];
        for (var index = 0, length = list.length; index < length; ++index) {
            var component = list[index];
            if (component.type === exports.FileComponent.type)
                result.push(component.filename);
            else {
                result.push(exports.parseVisualDatafromComponent(component, visualData, componentIndex, mapOfParsedComponents));
            }
        }
        return result;
    };

    var nextcommands = parselist(outputs);
    var nextErrcommands = parselist(stdErrors);
    var nextExitcommands = parselist(exitCodes);

    var teeResultArray = function (components, compiledComponents) {
        var comm = ["tee"];
        compiledComponents.forEach(function (compiledComponent, index) {
            if (components[index].type === exports.FileComponent.type) {
                comm.push(compiledComponent);
            } else {
                comm.push(">((" + compiledComponent + ") &> /dev/null )");
            }
        });
        return comm;
    };

    function teeResult(components, compiledComponents) {
        return teeResultArray(components, compiledComponents).join(" ");
    }

    if (nextcommands.length > 1) {
        var comm = teeResultArray(outputs, nextcommands);
        comm.pop();
        commands.push(comm.join(" "));
        commands.push(nextcommands[nextcommands.length - 1]);
    } else if (nextcommands.length === 1) {
        if (outputs[0].type === exports.FileComponent.type) {
            commands[parsedCommandIndex] += " > " + outputs[0].filename;
        } else {
            commands.push(nextcommands[0]);
        }
    }

    if (nextErrcommands.length > 1) {
        comm = teeResult(stdErrors, nextErrcommands);
        commands[parsedCommandIndex] += " 2> >((" + comm + ") &> /dev/null )";
    } else if (nextErrcommands.length === 1) {
        if (stdErrors[0].type === exports.FileComponent.type) {
            commands[parsedCommandIndex] += " 2> " + stdErrors[0].filename;
        } else {
            commands[parsedCommandIndex] += " 2> >((" + nextErrcommands[0] + ") &> /dev/null )";
        }
    }

    if (nextExitcommands.length > 1) {
        comm = teeResult(exitCodes, nextExitcommands);
        commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + comm + " &> /dev/null)";
    } else if (nextExitcommands.length === 1) {
        if (exitCodes[0].type === exports.FileComponent.type) {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? > " + exitCodes[0].filename + "))";
        } else {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + nextExitcommands[0] + ") &> /dev/null)";
        }
    }

    return commands.join(" | ");
}
exports.parseVisualDatafromComponent = parseVisualDatafromComponent;

function createMacro(name, description, command, fromMacro) {
    if (fromMacro) {
        return exports.Macro.fromGraph(name, description, exports.cloneGraph(fromMacro));
    } else if (command) {
        return exports.Macro.fromGraph(name, description, exports.parseCommand(command));
    } else
        return new exports.Macro(name, description);
}
exports.createMacro = createMacro;
;

/**
Creates a component based on the first word of the content
if the first word contains dots, create a file
if the first word is a command creates a command component instead
*/
function createComponentDinamicText(text) {
    if (text === "") {
        return null;
    }
    var words = text.replace("\n", " ").split(" ");
    var firstWord = words[0];
    if (firstWord.indexOf(".") > -1) {
        return new exports.FileComponent(text);
    } else if (isImplemented(firstWord)) {
        return exports.parseCommand(text).components[0];
    } else
        return null;
}
exports.createComponentDinamicText = createComponentDinamicText;

function graphFromJson(json) {
    return exports.graphFromJsonObject(JSON.parse(json));
}
exports.graphFromJson = graphFromJson;

function graphFromJsonObject(jsonObj) {
    var newGraph = new exports.Graph();
    var componentMap = {};
    for (var i in jsonObj) {
        newGraph[i] = jsonObj[i];
    }
    var components = [];
    jsonObj.components.forEach(function cloneComponent(component) {
        var newComponent;
        switch (component.type) {
            case exports.CommandComponent.type:
                newComponent = new parserCommand[component.exec].componentClass;
                break;
            case exports.FileComponent.type:
                newComponent = new exports.FileComponent(component.filename);
                break;
        }

        /* istanbul ignore next */
        if (!newComponent) {
            return;
        }

        for (var i in component) {
            newComponent[i] = component[i];
        }
        componentMap[newComponent.id] = newComponent;
        components.push(newComponent);
    });
    newGraph.components = components;
    newGraph.connections = [];
    jsonObj.connections.forEach(function connectCreatedComponents(connection) {
        newGraph.connect(componentMap[connection.startNode], connection.startPort, componentMap[connection.endNode], connection.endPort);
    });
    newGraph.firstMainComponent = componentMap[newGraph.firstMainComponent];
    return newGraph;
}
exports.graphFromJsonObject = graphFromJsonObject;

function cloneGraph(graph) {
    var json = JSON.stringify(graph);
    return exports.graphFromJson(json);
}
exports.cloneGraph = cloneGraph;

parser.generateAST = exports.generateAST;
parser.parseAST = exports.parseAST;
parser.astBuilder = astBuilder;
parser.parseCommand = exports.parseCommand;
parser.parseComponent = exports.parseComponent;
parser.implementedCommands = implementedCommands;
parser.parseVisualData = exports.parseVisualData;
exports.parseGraph = exports.parseVisualData;
//# sourceMappingURL=parser.js.map
