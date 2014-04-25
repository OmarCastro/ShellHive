var optionsParser = require("../utils/optionsParser");
var Iterator = optionsParser.Iterator;

var GraphModule = require("../../common/graph");
var Boundary = GraphModule.Boundary;
var Graph = GraphModule.Graph;
var Connection = GraphModule.Connection;

var FileComponent = GraphModule.FileComponent;


function typeOf(arg) {
    if (typeof arg === 'string' && arg.length > 0) {
        if (arg[0] === '-' && arg.length > 1) {
            if (arg[1] === '-') {
                return 'longOption';
            } else
                return 'shortOptions';
        } else {
            return 'string';
        }
    } else if (arg instanceof Array) {
        return arg[0];
    } else
        return 'string';
}
exports.typeOf = typeOf;

/*getComponentById = function(visualData, id){
var i$, ref$, len$, x;
for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
x = ref$[i$];
if (x.id === id) {
return x;
}
}
return null;
};*/
/**
Adds a file component to the
*/
function addFileComponent(componentData, connections, filename, id) {
    var newComponent = new FileComponent(filename);
    newComponent.id = id;

    var inputPort = "file" + (componentData.files.length);
    connections.push(new Connection(newComponent, 'output', componentData, inputPort));

    componentData.files.push(filename);
    return newComponent;
}
exports.addFileComponent = addFileComponent;
;

/*var commonNodeParsing = {
string: function(options){
return addFileComponent(options, options.iterator.current);
},
shortOptions: function(options){
return addFileComponent(options, options.iterator.current);
},
longOption: function(options){
return addFileComponent(options, options.iterator.current);
}
};*/
function commonParseCommand(optionsParserData, defaultComponentData, argNodeParsing) {
    return function (argsNode, parser, tracker, previousCommand) {
        var stdoutRedirection, stderrRedirection, argNode, newComponent, inputPort, subresult, ref$, y;
        var componentData = defaultComponentData();

        var boundaries = [];
        if (previousCommand) {
            boundaries.push(previousCommand[0]);
        }
        var result = new Graph();
        result.components = [componentData];

        result.firstMainComponent = componentData;
        var iter = new Iterator(argsNode);
        while (iter.hasNext()) {
            var argNode = iter.next();
            switch (exports.typeOf(argNode)) {
                case 'shortOptions':
                    optionsParser.parseShortOptions(optionsParserData, componentData, iter);
                    break;
                case 'longOption':
                    optionsParser.parseLongOptions(optionsParserData, componentData, iter);
                    break;
                case 'string':
                    var addfile = true;
                    if (argNodeParsing && argNodeParsing.string) {
                        addfile = argNodeParsing.string(componentData, argNode) == "continue";
                    }
                    if (addfile) {
                        newComponent = exports.addFileComponent(componentData, result.connections, argNode, tracker.id++);
                        result.components.push(newComponent);
                        boundaries.push(Boundary.createFromComponent(newComponent));
                    }
                    break;

                case 'inFromProcess':
                    subresult = parser.parseAST(argNode[1], tracker);
                    boundaries.push(Boundary.createFromComponents(subresult.components));
                    result.expands(subresult);
                    inputPort = "file" + componentData.files.length;

                    var subComponents = subresult.components;
                    for (var i = subComponents.length - 1; i >= 0; i--) {
                        if (subComponents[i].id == tracker.id - 1) {
                            result.connections.push(new Connection(subComponents[i], 'output', componentData, inputPort));
                            break;
                        }
                    }

                    componentData.files.push(["pipe", tracker.id - 1]);

                    break;
                case 'outTo':
                    newComponent = new FileComponent(argNode[1]);
                    newComponent.id = tracker.id;
                    result.connections.push(new Connection(componentData, 'output', newComponent, 'input'));

                    tracker.id++;
                    result.components.push(newComponent);
                    stdoutRedirection = newComponent;
                    break;
                case 'errTo':
                    newComponent = new FileComponent(argNode[1]);
                    newComponent.id = tracker.id;
                    result.connections.push(new Connection(componentData, 'error', newComponent, 'input'));
                    tracker.id++;
                    result.components.push(newComponent);
                    stderrRedirection = newComponent;
            }
        }
        var bbox = Boundary.arrangeLayout(boundaries);
        componentData.position = bbox[1];
        componentData.id = tracker.id;
        if (stdoutRedirection) {
            var position = stdoutRedirection.position;
            position.x = bbox[1].x + 400;
            position.y = bbox[1].y;
        }
        if (stderrRedirection) {
            y = stdoutRedirection ? 100 : 0;
            stderrRedirection.position = {
                x: bbox[1].x + 400,
                y: bbox[1].y + y
            };
        }

        //result.connections = result.connections.concat(connections.toConnectionList());
        tracker.id++;
        return [bbox[0], result];
    };
}
exports.commonParseCommand = commonParseCommand;
;

function parseFlagsAndSelectors(component, options) {
    var key, selectors, value, flag, flags, that, val;
    var flagOptions = options.flagOptions;
    var selectorOptions = options.selectorOptions;
    var sFlags = [];
    var lFlags = [];
    var resultSFlags;
    var resultLFlags;

    for (key in flags = component.flags) {
        value = flags[key];
        if (value) {
            flag = flagOptions[key];

            /* istanbul ignore if */ if (!flag) {
                throw [key, "doesn't exist in ", flagOptions].join('');
            } else
                sFlags.push(flag);
        }
    }

    if (component.selectors) {
        for (key in selectors = component.selectors) {
            value = selectors[key];
            var optionValue = selectorOptions[key][value.name];
            if (optionValue != null) {
                /* istanbul ignore if */ if (!optionValue) {
                    throw [key, ".", value, "doesn't exist in ", selectorOptions].join('');
                } else if (optionValue[0] !== '-') {
                    sFlags.push(optionValue);
                } else {
                    lFlags.push(optionValue);
                }
            }
        }
    }

    var containsSFlags = sFlags.length > 0;
    var containsLFlags = lFlags.length > 0;

    if (containsSFlags && containsLFlags) {
        return "-" + sFlags.join('') + " " + lFlags.join(' ');
    } else if (containsSFlags) {
        return "-" + sFlags.join('');
    } else if (containsLFlags) {
        return lFlags.join(' ');
    } else
        return "";
}
;

function commonParseComponent(flagOptions, selectorOptions, parameterOptions, beforeJoin) {
    var options;
    options = {
        flagOptions: flagOptions,
        selectorOptions: selectorOptions,
        parameterOptions: parameterOptions
    };

    return function (component, visualData, componentIndex, mapOfParsedComponents, parseComponent) {
        var exec = [component.exec];
        mapOfParsedComponents[component.id] = true;
        var flags = parseFlagsAndSelectors(component, options);
        var parameters = [];
        var Componentparameters = component.parameters;

        for (var key in Componentparameters) {
            var value = Componentparameters[key];
            if (value) {
                var result = "-" + parameterOptions[key] + value;
                if (value.indexOf(" ") >= 0) {
                    result = '"' + result + '"';
                }
                parameters.push(result);
            }
        }

        var files = !component.files ? [] : component.files.map(function (file) {
            if (file instanceof Array) {
                var subCommand = parseComponent(componentIndex[file[1]], visualData, componentIndex, mapOfParsedComponents);
                return "<(" + subCommand + ")";
            } else if (file.indexOf(" ") >= 0) {
                return '"' + file + '"';
            } else
                return file;
        });

        if (parameters.length > 0) {
            parameters = parameters.join(' ');
        }
        if (beforeJoin) {
            return beforeJoin(component, exec, flags, files, parameters);
        } else {
            return exec.concat(flags, parameters, files).join(' ');
        }
    };
}
exports.commonParseComponent = commonParseComponent;
;

exports.select = optionsParser.select;
exports.sameAs = optionsParser.sameAs;
exports.switchOn = optionsParser.switchOn;
exports.select = optionsParser.select;
//# sourceMappingURL=_init.js.map
