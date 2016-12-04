"use strict";
exports.parser = {};
var astBuilder = require('./ast-builder/ast-builder');
var graph_1 = require("../graph");
var sanitizer = require("./utils/sanitizer");
exports.parserCommand = {
    awk: require('./commands/awk'),
    cat: require('./commands/cat'),
    curl: require('./commands/curl'),
    date: require('./commands/date'),
    diff: require('./commands/diff'),
    echo: require('./commands/echo'),
    bunzip2: require('./commands/bunzip2'),
    bzcat: require('./commands/bzcat'),
    bzip2: require('./commands/bzip2'),
    grep: require('./commands/grep'),
    ls: require('./commands/ls'),
    //compress: require('./commands/compress'),
    sort: require('./commands/sort'),
    gzip: require('./commands/gzip'),
    gunzip: require('./commands/gunzip'),
    zcat: require('./commands/zcat'),
    head: require('./commands/head'),
    tail: require('./commands/tail'),
    tr: require('./commands/tr'),
    tee: require('./commands/tee'),
    uniq: require('./commands/uniq'),
    wc: require('./commands/wc'),
};
exports.implementedCommands = [];
exports.VisualSelectorOptions = {};
for (var key in exports.parserCommand) {
    exports.implementedCommands.push(key);
    exports.VisualSelectorOptions[key] = exports.parserCommand[key].VisualSelectorOptions;
}
function isImplemented(command) {
    return exports.parserCommand[command] != null;
}
exports.isImplemented = isImplemented;
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
    if (tracker === void 0) { tracker = { id: 0 }; }
    var LastCommandComponent, CommandComponent, exec, args, result_aux, result, comp, firstMainComponent;
    var graph = new graph_1.Graph();
    var components = graph.components;
    var connections = graph.connections;
    var firstMainComponent = null;
    LastCommandComponent = null;
    CommandComponent = null;
    for (var index = 0, _ref = ast, length = _ref.length; index < length; ++index) {
        var commandNode = _ref[index];
        exec = commandNode.exec, args = commandNode.args;
        var nodeParser = exports.parserCommand[exec];
        if (nodeParser.parseCommand) {
            if (exec === 'tee') {
                return nodeParser.parseCommand(args, exports.parser, tracker, LastCommandComponent, ast.slice(index + 1), firstMainComponent, components, connections);
            }
            result_aux = nodeParser.parseCommand(args, exports.parser, tracker, LastCommandComponent);
            result = (result_aux instanceof Array) ? result_aux[1] : result_aux;
            components = components.concat(result.components);
            connections = connections.concat(result.connections);
            CommandComponent = result.firstMainComponent;
            if (LastCommandComponent) {
                comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
                var connection = new graph_1.Connection(comp, 'output', CommandComponent, 'input');
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
    return parseAST(generateAST(command));
}
exports.parseCommand = parseCommand;
////////// NEW COMMAND GENERATOR ////////////////
//
// The old command generator used to create commans without creating fifos
// since it became difficult to generate code to join inputs and to
// allow macros to have multiple ports, the old code has been discontinued
//
function aux_parseVisualDataExperimental(VisualData, fifoPrepend) {
    fifoPrepend = fifoPrepend || "/tmp/fifo-";
    var fifos = [];
    var redirect = {};
    var commands = [];
    var retOutputs = [];
    var IndexedGraph = {
        inConnectedComponent: {},
        outConnectedComponent: {}
    };
    VisualData.components.forEach(function (component) {
        IndexedGraph.inConnectedComponent[component.id] = {
            list: [],
            byPortList: {}
        };
        IndexedGraph.outConnectedComponent[component.id] = {
            list: [],
            byPortList: {}
        };
    });
    VisualData.connections.forEach(function (connection) {
        var sNode = IndexedGraph.outConnectedComponent[connection.startNode];
        sNode.list.push(connection);
        var sPortList = sNode.byPortList[connection.startPort];
        if (sPortList instanceof Array) {
            sPortList.push(connection);
        }
        else {
            sNode.byPortList[connection.startPort] = [connection];
        }
        var eNode = IndexedGraph.inConnectedComponent[connection.endNode];
        eNode.list.push(connection);
        var ePortList = eNode.byPortList[connection.endPort];
        if (ePortList instanceof Array) {
            ePortList.push(connection);
        }
        else {
            eNode.byPortList[connection.endPort] = [connection];
        }
    });
    VisualData.components.forEach(function (component) {
        var portList = IndexedGraph.inConnectedComponent[component.id];
        var byPortList = portList.byPortList;
        var keys = Object.keys(byPortList);
        if (portList.list.length == 1 && keys[0] == "input" && component.type != graph_1.MacroComponent.type) {
            if (!component["files"] || component["files"].length == 0) {
                var prevNodeId = portList.list[0].startNode;
                var prevPortList = IndexedGraph.outConnectedComponent[prevNodeId];
                if (prevPortList.list.length == 1 && prevPortList.byPortList["output"]) {
                    if (component.type == graph_1.CommandComponent.type) {
                        redirect[component.id] = {
                            "as": "pipe",
                            "command": exports.parserCommand[component["exec"]].parseComponent(component, {}, {}, {}),
                            "commandIndex": null
                        };
                        return;
                    }
                    else if (component.type == graph_1.FileComponent.type) {
                        redirect[component.id] = {
                            "as": "overwrite",
                            "file": component["filename"],
                        };
                        return;
                    }
                }
            }
        }
        keys.forEach(function (port) {
            var connections = byPortList[port];
            if (connections.length > 1) {
                for (var i = connections.length - 1; i >= 0; i--) {
                    var fifo = port + "-" + i;
                    connections[i].endPort = fifo;
                    fifos.push(fifoPrepend + component.id + "-" + fifo);
                }
            }
            else
                fifos.push(fifoPrepend + component.id + "-" + port);
        });
        redirect[component.id] = { "as": "fifo" };
    });
    VisualData.components.forEach(function (component) {
        var afterCommand = "";
        var outConnection = IndexedGraph.outConnectedComponent[component.id];
        var outConnections = outConnection.list;
        var inConnection = IndexedGraph.inConnectedComponent[component.id];
        var inByPort = inConnection.byPortList;
        var len = outConnections.length;
        var componentRedirect = redirect[component.id];
        function appendSingleOutput(parsedExec, output) {
            if (redirect[output.endNode]["as"] == "pipe") {
                parsedExec += " | " + redirect[output.endNode].command;
                redirect[output.endNode].commandIndex =
                    (componentRedirect["as"] == "pipe" && componentRedirect.commandIndex != null)
                        ? componentRedirect.commandIndex : commands.length;
            }
            else if (redirect[output.endNode]["as"] == "overwrite") {
                parsedExec += " > " + redirect[output.endNode].file;
            }
            else {
                parsedExec += " > "
                    + fifoPrepend + output.endNode + "-" + output.endPort;
            }
            return parsedExec;
        }
        switch (component.type) {
            case graph_1.CommandComponent.type:
                var outputs = outConnection.byPortList["output"];
                var errors = outConnection.byPortList["error"];
                var retcodes = outConnection.byPortList["retcode"];
                if (component["files"]) {
                    var files = component["files"];
                    component["files"] = files.map(function (file, idx) {
                        var connections = inByPort["file" + idx];
                        if (!connections) {
                            return "-";
                        }
                        else if (connections.length > 1) {
                            var fifo = fifoPrepend + component.id + "-file" + idx;
                            commands.push("find " + fifo + "-* | xargs grep -h --line-buffered ^ > " + fifo);
                            return fifo;
                        }
                        else
                            return fifoPrepend + component.id + "-file" + idx;
                    });
                }
                var parsedExec = exports.parserCommand[component["exec"]].parseComponent(component, {}, {}, {});
                if (errors && errors.length) {
                    if (errors.length > 1) {
                        var newfifo = fifoPrepend + component.id + "-stderr";
                        fifos.push(newfifo);
                        var len = errors.length - 1;
                        var newcommand = "tee < " + newfifo;
                        for (var i = 0; i < len; ++i) {
                            var value = errors[i];
                            newcommand += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                        }
                        newcommand += " > " + fifoPrepend + errors[len].endNode + "-" + errors[len].endPort;
                        parsedExec += " 2> " + newfifo;
                        commands.push(newcommand);
                    }
                    else {
                        parsedExec += " 2> "
                            + fifoPrepend + errors[0].endNode
                            + "-" + errors[0].endPort;
                    }
                }
                if (outputs && outputs.length) {
                    if (outputs.length > 1) {
                        var len = outputs.length - 1;
                        parsedExec += " | tee";
                        for (var i = 0; i < len; ++i) {
                            var value = outputs[i];
                            parsedExec += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                        }
                        parsedExec += " > " + fifoPrepend + outputs[len].endNode + "-" + outputs[len].endPort;
                    }
                    else {
                        parsedExec = appendSingleOutput(parsedExec, outputs[0]);
                    }
                }
                if (retcodes && retcodes.length) {
                    var newcommand = "; echo $?";
                    var len = retcodes.length - 1;
                    if (len > 0) {
                        newcommand += " | tee";
                        for (var i = 0; i < len; ++i) {
                            var value = retcodes[i];
                            newcommand += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                        }
                    }
                    newcommand += " > " + fifoPrepend + retcodes[len].endNode + "-" + retcodes[len].endPort;
                    parsedExec = "(" + parsedExec + newcommand + ")";
                }
                if (inByPort["input"] && componentRedirect["as"] !== "pipe") {
                    var fifo = fifoPrepend + component.id + "-input";
                    var len = inByPort["input"].length;
                    if (len > 1) {
                        parsedExec = "find " + fifo + "-* | xargs -P" + len + " grep -h --line-buffered ^ | " + parsedExec;
                    }
                    else if (parsedExec.indexOf(" ") < 0) {
                        parsedExec += " < " + fifo;
                    }
                    else {
                        parsedExec = parsedExec.replace(" ", " < " + fifo + " ");
                    }
                }
                if (componentRedirect["as"] == "pipe") {
                    if (componentRedirect.commandIndex !== null) {
                        console.log("commands::", commands);
                        console.log("componentRedirect::", componentRedirect.commandIndex);
                        console.log("parsedExec::", parsedExec);
                        var split = commands[componentRedirect.commandIndex].split(" | ");
                        split[split.length - 1] = parsedExec;
                        commands[componentRedirect.commandIndex] = split.join(" | ");
                    }
                    componentRedirect.command = parsedExec;
                }
                else {
                    commands.push(parsedExec);
                }
                return;
            case graph_1.MacroComponent.type:
                var result = aux_parseVisualDataExperimental(component["macro"], fifoPrepend + component.id + "-");
                fifos = fifos.concat(result.fifos);
                commands = commands.concat(result.commands);
                if (result.outputs) {
                    result.outputs.forEach(function (output) {
                        var command = "tee < " + output.fifo;
                        var connections = outConnection.byPortList[output.port];
                        if (connections && connections.length) {
                            var len = connections.length - 1;
                            for (var i = 0; i < len; ++i) {
                                var value = connections[i];
                                command += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                            }
                            command += " > " + fifoPrepend + connections[len].endNode + "-" + connections[len].endPort;
                        }
                        commands.push(command);
                    });
                }
                return;
            case graph_1.FileComponent.type:
                if (componentRedirect["as"] == "overwrite")
                    return;
                var filename = sanitizer.sanitizeArgument(component["filename"]);
                if (inByPort["input"]) {
                    var fifo = fifoPrepend + component.id + "-input";
                    var len = inByPort["input"].length;
                    if (len > 1) {
                        commands.push("find " + fifo + "-* | xargs -P" + len + " grep -h --line-buffered ^ >  " + filename);
                    }
                    else
                        commands.push("cat " + fifo + " > " + filename);
                }
                else if (inByPort["append"]) {
                    var fifo = fifoPrepend + component.id + "-append";
                    var len = inByPort["append"].length;
                    if (len > 1) {
                        commands.push("find " + fifo + "-* | xargs -P" + len + " grep -h --line-buffered ^ >>  " + filename);
                    }
                    else
                        commands.push("cat " + fifo + " >> " + filename);
                }
                else if (outConnections && outConnections.length > 0) {
                    parsedExec = "pv -f " + filename;
                    var len = outConnections.length - 1;
                    if (len > 0) {
                        parsedExec += " | tee";
                        for (var i = 0; i < len; ++i) {
                            var value = outConnections[i];
                            parsedExec += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                        }
                    }
                    parsedExec = appendSingleOutput(parsedExec, outConnections[len]);
                    commands.push(parsedExec);
                }
                return;
            case "input":
                component["ports"].forEach(function (port, index) {
                    var portName = "macroIn" + index;
                    var connections = outConnection.byPortList[portName];
                    var command = "tee < " + fifoPrepend + portName;
                    if (connections && connections.length) {
                        var len = connections.length - 1;
                        if (len > 0) {
                            for (var i = 0; i < len; ++i) {
                                var value = connections[i];
                                command += " " + fifoPrepend + value.endNode + "-" + value.endPort;
                            }
                        }
                        else {
                            command += " > " + fifoPrepend + connections[len].endNode + "-" + connections[len].endPort;
                        }
                    }
                    else {
                        command += " > /dev/null";
                    }
                    commands.push(command);
                });
                return;
            case "output":
                component["ports"].forEach(function (port, index) {
                    var portName = "macroOut" + index;
                    var newFifo = fifoPrepend + portName;
                    var fifo = fifoPrepend + component.id + "-" + portName;
                    fifos.push(newFifo);
                    retOutputs.push({ fifo: newFifo, port: portName });
                    var connections = inConnection.byPortList[portName];
                    if (connections && connections.length) {
                        var len = connections.length;
                        if (len > 1) {
                            commands.push("find " + fifo + "-* | xargs -P" + len + " grep -h --line-buffered ^ > " + newFifo);
                        }
                        else {
                            commands.push("cat " + fifo + " > " + newFifo);
                        }
                    }
                    else {
                        commands.push("echo '' > " + newFifo);
                    }
                });
                return;
        }
    });
    return {
        fifos: fifos,
        commands: commands,
        outputs: retOutputs
    };
}
exports.aux_parseVisualDataExperimental = aux_parseVisualDataExperimental;
function parseVisualDataExperimental(VisualData, fifoPrepend) {
    var escapeSingleQuote = function (commandString) { return commandString.split("'").join("'\"'\"'"); };
    var result = aux_parseVisualDataExperimental(VisualData, fifoPrepend);
    var result_commands = result.commands.map(function (command) { return "echo '" + escapeSingleQuote(command) + "' >> /tmp/sHiveExec.sh"; });
    var timeoutCommand = "timeout 10 parallel < /tmp/sHiveExec.sh -uj " + result_commands.length + " --halt 2";
    var real_commands, pretty_printed_commands;
    if (result.fifos.length < 1) {
        real_commands = result_commands.concat([timeoutCommand]).join("\n");
        if (result.commands.length <= 1) {
            pretty_printed_commands = result.commands[0];
        }
        else {
            pretty_printed_commands = result.commands.map(function (c) { return c + " &"; }).join("\n");
        }
    }
    else {
        var mkfifos = ["mkfifo"].concat(result.fifos).join(" ");
        real_commands = [mkfifos].concat(result_commands, [timeoutCommand]).join("\n");
        pretty_printed_commands = [mkfifos].concat(result.commands.map(function (c) { return c + " &"; })).join("\n");
    }
    return {
        commands: real_commands,
        pretty: pretty_printed_commands
    };
}
exports.parseVisualDataExperimental = parseVisualDataExperimental;
////////// END NEW COMMAND GENERATOR ////////////////
////////// OLD COMMAND GENERATOR ////////////////
//
// This generator used to create commans without creating fifos
// since it became difficult to generate code to join inputs and to
// allow macros to have multiple ports, this code has been discontinued
//
// TODO: remove old generator code after removing related tests;
function parseVisualData(VisualData) {
    if (VisualData.components.filter(function (component) { return component.type == graph_1.CommandComponent.type; }).length < 1) {
        return '';
    }
    var indexedComponentList = new graph_1.IndexedGraph(VisualData);
    var initialComponent = VisualData.firstMainComponent;
    if (!(initialComponent instanceof graph_1.CommandComponent)) {
        var ref = VisualData.components;
        for (var i = 0, len = ref.length; i < len; ++i) {
            if (ref[i].type == graph_1.CommandComponent.type) {
                initialComponent = ref[i];
                break;
            }
        }
    }
    return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
}
exports.parseVisualData = parseVisualData;
function parseComponent(component, visualData, componentIndex, mapOfParsedComponents) {
    switch (component.type) {
        case graph_1.CommandComponent.type:
            return exports.parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents);
        case graph_1.MacroComponent.type:
            return exports.parseGraph(component.macro);
    }
}
exports.parseComponent = parseComponent;
/**
  find the first component to be parsed
*/
function findFirstComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents) {
    do {
        var isFirst = visualData.connections.every(function (connection) {
            if (connection.endComponent == currentComponent
                && connection.startPort === 'output'
                && connection.endPort === 'input'
                && mapOfParsedComponents[connection.startNode] !== true) {
                currentComponent = componentIndex.components[connection.startNode];
                return false;
            }
            return true;
        });
    } while (isFirst == false);
    return currentComponent;
}
exports.findFirstComponent = findFirstComponent;
/**
  Parse visual data from Component
*/
function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents) {
    var commands = [];
    currentComponent = findFirstComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
    var parsedCommand = parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
    var parsedCommandIndex = commands.length;
    commands.push(parsedCommand);
    var outputs = [];
    var stdErrors = [];
    var exitCodes = [];
    visualData.connections.filter(function (connection) {
        return connection.startNode === currentComponent.id
            && mapOfParsedComponents[connection.endNode] !== true;
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
            if (component.type === graph_1.FileComponent.type)
                result.push(component.filename);
            else {
                result.push(parseVisualDatafromComponent(component, visualData, componentIndex, mapOfParsedComponents));
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
            if (components[index].type === graph_1.FileComponent.type) {
                comm.push(compiledComponent);
            }
            else {
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
    }
    else if (nextcommands.length === 1) {
        if (outputs[0].type === graph_1.FileComponent.type) {
            commands[parsedCommandIndex] += " > " + outputs[0].filename;
        }
        else {
            commands.push(nextcommands[0]);
        }
    }
    if (nextErrcommands.length > 1) {
        comm = teeResult(stdErrors, nextErrcommands);
        commands[parsedCommandIndex] += " 2> >((" + comm + ") &> /dev/null )";
    }
    else if (nextErrcommands.length === 1) {
        if (stdErrors[0].type === graph_1.FileComponent.type) {
            commands[parsedCommandIndex] += " 2> " + stdErrors[0].filename;
        }
        else {
            commands[parsedCommandIndex] += " 2> >((" + nextErrcommands[0] + ") &> /dev/null )";
        }
    }
    if (nextExitcommands.length > 1) {
        comm = teeResult(exitCodes, nextExitcommands);
        commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + comm + " &> /dev/null)";
    }
    else if (nextExitcommands.length === 1) {
        if (exitCodes[0].type === graph_1.FileComponent.type) {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? > " + exitCodes[0].filename + "))";
        }
        else {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + nextExitcommands[0] + ") &> /dev/null)";
        }
    }
    return commands.join(" | ");
}
exports.parseVisualDatafromComponent = parseVisualDatafromComponent;
////////// END OLD COMMAND GENERATOR ////////////////
function createMacro(name, description, command, fromMacro) {
    if (fromMacro) {
        return graph_1.Macro.fromGraph(name, description, cloneGraph(fromMacro));
    }
    else if (command) {
        return graph_1.Macro.fromGraph(name, description, parseCommand(command));
    }
    else
        return new graph_1.Macro(name, description);
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
        return new graph_1.FileComponent(text);
    }
    else if (isImplemented(firstWord)) {
        return parseCommand(text).components[0];
    }
    else
        return null;
}
exports.createComponentDinamicText = createComponentDinamicText;
function graphFromJson(json) {
    return graphFromJsonObject(JSON.parse(json));
}
exports.graphFromJson = graphFromJson;
function graphFromJsonObject(jsonObj) {
    var newGraph = new graph_1.Graph();
    var componentMap = {};
    for (var i in jsonObj) {
        newGraph[i] = jsonObj[i];
    }
    var components = [];
    jsonObj.components.forEach(function cloneComponent(component) {
        var newComponent;
        switch (component.type) {
            case graph_1.CommandComponent.type:
                newComponent = new exports.parserCommand[component.exec].componentClass;
                break;
            case graph_1.FileComponent.type:
                newComponent = new graph_1.FileComponent(component.filename);
                break;
            case graph_1.MacroComponent.type:
                var subgraph = graphFromJsonObject(component.macro);
                console.log(subgraph.components);
                console.log(subgraph.connections);
                newComponent = new graph_1.MacroComponent(subgraph);
            case "input":
            case "output":
                newComponent = component;
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
    return graphFromJson(json);
}
exports.cloneGraph = cloneGraph;
exports.parser.generateAST = generateAST;
exports.parser.parseAST = parseAST;
exports.parser.astBuilder = astBuilder;
exports.parser.parseCommand = parseCommand;
exports.parser.parseComponent = parseComponent;
exports.parser.implementedCommands = exports.implementedCommands;
exports.parser.parseVisualData = parseVisualData;
exports.parseGraph = parseVisualData;
