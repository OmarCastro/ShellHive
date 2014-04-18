(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/home/omar/thesis/flownix/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/home/omar/thesis/flownix/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2}],4:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Graph = (function () {
    function Graph(components, connections, firstMainComponent) {
        if (typeof components === "undefined") { components = []; }
        if (typeof connections === "undefined") { connections = []; }
        if (typeof firstMainComponent === "undefined") { firstMainComponent = null; }
        this.components = components;
        this.connections = connections;
        this.firstMainComponent = firstMainComponent;
    }
    Graph.prototype.toJSON = function () {
        var jsonObj = {};
        jsonObj.components = this.components;
        jsonObj.connections = this.connections;
        jsonObj.firstMainComponent = this.firstMainComponent;
        return JSON.stringify(jsonObj);
    };

    Graph.prototype.expands = function (other) {
        this.components.concat(other.components);
        this.connections.concat(other.connections);
    };

    Graph.prototype.concatComponents = function (components) {
        this.components.concat(components);
    };
    Graph.prototype.concatConnections = function (connections) {
        this.connections.concat(connections);
    };
    return Graph;
})();
exports.Graph = Graph;

var IndexedGraph = (function () {
    function IndexedGraph(graph) {
        this.components = {};
        this.inputConnections = {};
        this.outputConnections = {};
        var components = this.components;
        var outputConnections = this.outputConnections;
        var inputConnections = this.inputConnections;

        graph.components.forEach(function (component) {
            components[component.id] = component;
        });
        graph.connections.forEach(function (connection) {
            outputConnections[connection.startNode] = connection;
            inputConnections[connection.endNode] = connection;
        });
    }
    return IndexedGraph;
})();
exports.IndexedGraph = IndexedGraph;

var Component = (function () {
    function Component() {
        this.position = { x: 0, y: 0 };
        this.id = 0;
    }
    return Component;
})();
exports.Component = Component;

var CommandComponent = (function (_super) {
    __extends(CommandComponent, _super);
    function CommandComponent() {
        _super.apply(this, arguments);
    }
    return CommandComponent;
})(Component);
exports.CommandComponent = CommandComponent;

var FileComponent = (function (_super) {
    __extends(FileComponent, _super);
    function FileComponent(filename) {
        _super.call(this);
        this.type = "file";
        this.filename = filename;
    }
    return FileComponent;
})(Component);
exports.FileComponent = FileComponent;

var GraphComponent = (function (_super) {
    __extends(GraphComponent, _super);
    function GraphComponent(name, description) {
        _super.call(this);
        this.type = "macro";
        this.entryComponent = null;
        this.exitComponent = null;
        this.counter = 0;
        this.components = [];
        this.connections = [];
        this.name = name;
        this.description = description;
    }
    GraphComponent.prototype.setGraphData = function (graphData) {
        this.components = graphData.components;
        this.connections = graphData.connections;
        this.entryComponent = graphData.firstMainComponent;
    };
    return GraphComponent;
})(Component);
exports.GraphComponent = GraphComponent;

var Connection = (function () {
    function Connection(startComponent, startPort, endComponent, endPort) {
        this.startComponent = startComponent;
        this.startPort = startPort;
        this.endComponent = endComponent;
        this.endPort = endPort;
    }
    Connection.prototype.toJSON = function () {
        return JSON.stringify({
            startNode: this.startComponent.id,
            startPort: this.startPort,
            endNode: this.endComponent.id,
            endPort: this.endPort
        });
    };
    return Connection;
})();
exports.Connection = Connection;

var Boundary = (function () {
    function Boundary(left, rigth, top, bottom, components) {
        if (typeof left === "undefined") { left = 0; }
        if (typeof rigth === "undefined") { rigth = 0; }
        if (typeof top === "undefined") { top = 0; }
        if (typeof bottom === "undefined") { bottom = 0; }
        if (typeof components === "undefined") { components = null; }
        this.left = left;
        this.rigth = rigth;
        this.top = top;
        this.bottom = bottom;
        this.components = components;
    }
    Boundary.createFromXY = function (x, y, component) {
        var bottom;
        if (component.type === "file") {
            bottom = y + 100;
        } else {
            bottom = y + 350;
        }
        return new this(x, x, y, bottom, [component]);
    };

    Boundary.createFromPoint = function (point, component) {
        return this.createFromXY(point.x, point.y, component);
    };

    Boundary.createFromComponent = function (component) {
        return this.createFromPoint(component.position, component);
    };

    Boundary.createFromComponents = function (components) {
        if (components.length === 0) {
            return null;
        }
        var boundary = this.createFromComponent(components[0]);
        for (var i = 1, len = components.length; i < len; ++i) {
            boundary.extend(this.createFromComponent(components[i]));
        }
        return boundary;
    };

    Boundary.prototype.extend = function (boundary2) {
        this.left = Math.min(boundary2.left, this.left);
        this.rigth = Math.max(boundary2.rigth, this.rigth);
        this.top = Math.min(boundary2.top, this.top);
        this.bottom = Math.max(boundary2.bottom, this.bottom);
        this.components = this.components.concat(boundary2.components);
    };

    Boundary.translate = function (boundary, x, y) {
        if (typeof y === "undefined") { y = 0; }
        boundary.left += x;
        boundary.rigth += x;
        boundary.top += y;
        boundary.bottom += y;
        boundary.components.forEach(function (component) {
            var position = component.position;
            position.x += x;
            position.y += y;
        });
    };

    Boundary.prototype.translateXY = function (x, y) {
        if (typeof y === "undefined") { y = 0; }
        Boundary.translate(this, x, y);
    };
    Boundary.getBoundaries = function (components) {
        return Boundary.createFromComponents(components);
    };

    Boundary.arrangeLayout = function (boundaries) {
        var maxX = 0;
        var prevBound = null;
        var components = [];
        boundaries.forEach(function (boundary) {
            maxX = Math.max(boundary.rigth, maxX);
            components = components.concat(boundary.components);
        });

        boundaries.forEach(function (boundary) {
            var translateX = maxX - boundary.rigth;
            var translateY = prevBound ? prevBound.bottom - boundary.top : 0;
            boundary.translateXY(translateX, translateY);
            prevBound = boundary;
        });

        var x = 0, y = 0, bottom = 350;

        if (boundaries.length) {
            x = maxX + 450;
            y = Math.max((prevBound.bottom - 350) / 2, 0);
            bottom = Math.max(prevBound.bottom, 350);
        }
        return [new Boundary(0, x, 0, bottom, components), { x: x, y: y }];
    };
    return Boundary;
})();
exports.Boundary = Boundary;
//# sourceMappingURL=graph.js.map

},{}],5:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var astBuilder = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"unixcode":3,"commandline":4,"EOF":5,"|":6,"command":7,"auxcommand":8,"argsWithCommSub":9,"exec":10,"aux_commandline":11,"aux_command":12,"aux_auxcommand":13,"args":14,"s`":15,"`":16,">(":17,")":18,"<(":19,">":20,"str":21,"2>":22,"&>":23,"<":24,"2>&1":25,"USTR":26,"STR":27,"STR2":28,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"|",15:"s`",16:"`",17:">(",18:")",19:"<(",20:">",22:"2>",23:"&>",24:"<",25:"2>&1",26:"USTR",27:"STR",28:"STR2"},
productions_: [0,[3,2],[4,3],[4,1],[7,1],[8,2],[8,1],[11,3],[11,1],[12,1],[13,2],[13,1],[9,1],[9,3],[14,3],[14,3],[14,2],[14,2],[14,2],[14,2],[14,1],[14,1],[10,1],[21,1],[21,1],[21,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1]; 
break;
case 2:$$[$0-2].push(_$[$0]);this.$ = $$[$0-2];
break;
case 3:this.$ = [$$[$0]];
break;
case 4:this._$.exec = $$[$0].exec;this._$.args = $$[$0].args; this.$ = this._$
break;
case 5:$$[$0-1].args.push($$[$0]);this.$ = $$[$0-1];
break;
case 6:this.$ = {exec: $$[$0], args:[]};
break;
case 7:$$[$0-2].push($$[$0]);this.$ = $$[$0-2];
break;
case 8:this.$ = [$$[$0]];
break;
case 9:this._$.exec = $$[$0].exec;this._$.args = $$[$0].args; this.$ = this._$
break;
case 10:$$[$0-1].args.push($$[$0]);this.$ = $$[$0-1];
break;
case 11:this.$ = {exec: $$[$0], args:[]};
break;
case 13:this.$ = ["commandSubstitution",$$[$0-1]];
break;
case 14:this.$ = ["outToProcess",$$[$0-1]];
break;
case 15:this.$ = ["inFromProcess",$$[$0-1]];
break;
case 16:this.$ = ["outTo",$$[$0]];
break;
case 17:this.$ = ["errTo",$$[$0]];
break;
case 18:this.$ = ["out&errTo",$$[$0]];
break;
case 19:this.$ = ["inFrom",$$[$0]];
break;
case 20:this.$ = ["errToOut"];
break;
case 23:this.$ = yytext.replace(/\\/g,"")
break;
case 24:this.$ = yytext.slice(1,-1).replace(/\\\"/g,'"')
break;
case 25:this.$ = yytext.slice(1,-1).replace(/\\\'/g,"'")
break;
}
},
table: [{3:1,4:2,7:3,8:4,10:5,21:6,26:[1,7],27:[1,8],28:[1,9]},{1:[3]},{5:[1,10],6:[1,11]},{5:[2,3],6:[2,3],9:12,14:13,15:[1,14],17:[1,15],18:[2,3],19:[1,16],20:[1,17],21:22,22:[1,18],23:[1,19],24:[1,20],25:[1,21],26:[1,7],27:[1,8],28:[1,9]},{5:[2,4],6:[2,4],15:[2,4],17:[2,4],18:[2,4],19:[2,4],20:[2,4],22:[2,4],23:[2,4],24:[2,4],25:[2,4],26:[2,4],27:[2,4],28:[2,4]},{5:[2,6],6:[2,6],15:[2,6],17:[2,6],18:[2,6],19:[2,6],20:[2,6],22:[2,6],23:[2,6],24:[2,6],25:[2,6],26:[2,6],27:[2,6],28:[2,6]},{5:[2,22],6:[2,22],15:[2,22],16:[2,22],17:[2,22],18:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],24:[2,22],25:[2,22],26:[2,22],27:[2,22],28:[2,22]},{5:[2,23],6:[2,23],15:[2,23],16:[2,23],17:[2,23],18:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],24:[2,23],25:[2,23],26:[2,23],27:[2,23],28:[2,23]},{5:[2,24],6:[2,24],15:[2,24],16:[2,24],17:[2,24],18:[2,24],19:[2,24],20:[2,24],22:[2,24],23:[2,24],24:[2,24],25:[2,24],26:[2,24],27:[2,24],28:[2,24]},{5:[2,25],6:[2,25],15:[2,25],16:[2,25],17:[2,25],18:[2,25],19:[2,25],20:[2,25],22:[2,25],23:[2,25],24:[2,25],25:[2,25],26:[2,25],27:[2,25],28:[2,25]},{1:[2,1]},{7:23,8:4,10:5,21:6,26:[1,7],27:[1,8],28:[1,9]},{5:[2,5],6:[2,5],15:[2,5],17:[2,5],18:[2,5],19:[2,5],20:[2,5],22:[2,5],23:[2,5],24:[2,5],25:[2,5],26:[2,5],27:[2,5],28:[2,5]},{5:[2,12],6:[2,12],15:[2,12],17:[2,12],18:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],24:[2,12],25:[2,12],26:[2,12],27:[2,12],28:[2,12]},{10:27,11:24,12:25,13:26,21:6,26:[1,7],27:[1,8],28:[1,9]},{4:28,7:3,8:4,10:5,21:6,26:[1,7],27:[1,8],28:[1,9]},{4:29,7:3,8:4,10:5,21:6,26:[1,7],27:[1,8],28:[1,9]},{21:30,26:[1,7],27:[1,8],28:[1,9]},{21:31,26:[1,7],27:[1,8],28:[1,9]},{21:32,26:[1,7],27:[1,8],28:[1,9]},{21:33,26:[1,7],27:[1,8],28:[1,9]},{5:[2,20],6:[2,20],15:[2,20],16:[2,20],17:[2,20],18:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],24:[2,20],25:[2,20],26:[2,20],27:[2,20],28:[2,20]},{5:[2,21],6:[2,21],15:[2,21],16:[2,21],17:[2,21],18:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],24:[2,21],25:[2,21],26:[2,21],27:[2,21],28:[2,21]},{5:[2,2],6:[2,2],9:12,14:13,15:[1,14],17:[1,15],18:[2,2],19:[1,16],20:[1,17],21:22,22:[1,18],23:[1,19],24:[1,20],25:[1,21],26:[1,7],27:[1,8],28:[1,9]},{6:[1,35],16:[1,34]},{6:[2,8],14:36,16:[2,8],17:[1,15],19:[1,16],20:[1,17],21:22,22:[1,18],23:[1,19],24:[1,20],25:[1,21],26:[1,7],27:[1,8],28:[1,9]},{6:[2,9],16:[2,9],17:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],24:[2,9],25:[2,9],26:[2,9],27:[2,9],28:[2,9]},{6:[2,11],16:[2,11],17:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],24:[2,11],25:[2,11],26:[2,11],27:[2,11],28:[2,11]},{6:[1,11],18:[1,37]},{6:[1,11],18:[1,38]},{5:[2,16],6:[2,16],15:[2,16],16:[2,16],17:[2,16],18:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],24:[2,16],25:[2,16],26:[2,16],27:[2,16],28:[2,16]},{5:[2,17],6:[2,17],15:[2,17],16:[2,17],17:[2,17],18:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],24:[2,17],25:[2,17],26:[2,17],27:[2,17],28:[2,17]},{5:[2,18],6:[2,18],15:[2,18],16:[2,18],17:[2,18],18:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],24:[2,18],25:[2,18],26:[2,18],27:[2,18],28:[2,18]},{5:[2,19],6:[2,19],15:[2,19],16:[2,19],17:[2,19],18:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],24:[2,19],25:[2,19],26:[2,19],27:[2,19],28:[2,19]},{5:[2,13],6:[2,13],15:[2,13],17:[2,13],18:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],24:[2,13],25:[2,13],26:[2,13],27:[2,13],28:[2,13]},{10:27,12:39,13:26,21:6,26:[1,7],27:[1,8],28:[1,9]},{6:[2,10],16:[2,10],17:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],24:[2,10],25:[2,10],26:[2,10],27:[2,10],28:[2,10]},{5:[2,14],6:[2,14],15:[2,14],16:[2,14],17:[2,14],18:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],24:[2,14],25:[2,14],26:[2,14],27:[2,14],28:[2,14]},{5:[2,15],6:[2,15],15:[2,15],16:[2,15],17:[2,15],18:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],24:[2,15],25:[2,15],26:[2,15],27:[2,15],28:[2,15]},{6:[2,7],14:36,16:[2,7],17:[1,15],19:[1,16],20:[1,17],21:22,22:[1,18],23:[1,19],24:[1,20],25:[1,21],26:[1,7],27:[1,8],28:[1,9]}],
defaultActions: {10:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 23
break;
case 1:return 25
break;
case 2:return 22
break;
case 3:return 17
break;
case 4:return 19
break;
case 5:return 24
break;
case 6:return 20
break;
case 7:return '('
break;
case 8:return 18
break;
case 9:return 15
break;
case 10:return 16
break;
case 11:return 27
break;
case 12:return 28
break;
case 13:return 26
break;
case 14:return 6
break;
case 15:return 5
break;
case 16:/*ignore*/
break;
case 17:return 'INVALID'
break;
}
},
rules: [/^(?:&>)/,/^(?:2>&1\b)/,/^(?:2>)/,/^(?:>\()/,/^(?:<\()/,/^(?:<)/,/^(?:>)/,/^(?:\()/,/^(?:\))/,/^(?:\s`)/,/^(?:`)/,/^(?:"(\\.|[^\"])*")/,/^(?:'(\\.|[^\'])*')/,/^(?:([^\|\ \n\(\)\>\<\`$]|(\\[\ \(\)<>]))+)/,/^(?:\|)/,/^(?:$)/,/^(?:\s+)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = astBuilder;
exports.Parser = astBuilder.Parser;
exports.parse = function () { return astBuilder.parse.apply(astBuilder, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require("/home/omar/thesis/flownix/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/home/omar/thesis/flownix/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2,"fs":1,"path":3}],6:[function(require,module,exports){
//# sourceMappingURL=_graphlayout.js.map

},{}],7:[function(require,module,exports){
var parseFlagsAndSelectors, join$ = [].join;

var optionsParser = require("../utils/optionsParser");
var ComponentConnections = require("../utils/componentConnections");

var GraphModule = require("../../common/graph");
var Boundary = GraphModule.Boundary;

var FileComponent = GraphModule.FileComponent;

var Iterator = (function () {
    function Iterator(ArgList) {
        this.index = 0;
        this.argList = ArgList;
        this.length = ArgList.length;
        this.current = ArgList[0];
    }
    Iterator.prototype.hasNext = function () {
        return this.index !== this.length;
    };
    Iterator.prototype.next = function () {
        return this.current = this.argList[this.index++];
    };
    Iterator.prototype.rest = function () {
        return this.argList.slice(this.index);
    };
    return Iterator;
})();


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
    }
}
exports.typeOf = typeOf;

function addFileComponent(componentData, connections, filename, id) {
    var newComponent = new FileComponent(filename);
    newComponent.id = id;

    connections.addConnectionToInputPort("file" + (componentData.files.length), {
        id: id,
        port: 'output'
    });

    componentData.files.push(filename);
    return newComponent;
}
;

function commonParseCommand(optionsParserData, defaultComponentData, argNodeParsing) {
    return function (argsNode, parser, tracker, previousCommand) {
        var componentData, stdoutRedirection, stderrRedirection, result, iter, argNode, newComponent, inputPort, subresult, ref$, y;
        componentData = defaultComponentData();

        var boundaries = [];
        if (previousCommand) {
            if (previousCommand instanceof Array) {
                boundaries.push(previousCommand[0]);
            } else {
                boundaries.push(Boundary.createFromComponent(previousCommand));
            }
        }
        var connections = new ComponentConnections(componentData);
        result = {
            components: [componentData],
            connections: [],
            mainComponent: componentData
        };
        iter = new Iterator(argsNode);
        while (argNode = iter.next()) {
            switch (exports.typeOf(argNode)) {
                case 'shortOptions':
                    optionsParser.parseShortOptions(optionsParserData, componentData, iter);
                    break;
                case 'longOption':
                    optionsParser.parseLongOptions(optionsParserData, componentData, iter);
                    break;
                case 'string':
                    if (argNodeParsing && argNodeParsing.string) {
                        argNodeParsing.string(componentData, argNode);
                    } else {
                        newComponent = addFileComponent(componentData, connections, argNode, tracker.id++);
                        result.components.push(newComponent);
                        boundaries.push(Boundary.createFromComponent(newComponent));
                    }
                    break;
                case 'inFromProcess':
                    subresult = parser.parseAST(argNode[1], tracker);
                    boundaries.push(Boundary.createFromComponents(subresult.components));
                    result.components = result.components.concat(subresult.components);
                    result.connections = result.connections.concat(subresult.connections);
                    inputPort = "file" + componentData.files.length;
                    connections.addConnectionToInputPort(inputPort, {
                        id: tracker.id - 1,
                        port: 'output'
                    });
                    componentData.files.push(["pipe", tracker.id - 1]);
                    break;
                case 'outTo':
                    newComponent = new FileComponent(argNode[1]);
                    newComponent.id = tracker.id;
                    connections.addConnectionFromOutputPort({
                        id: tracker.id,
                        port: 'input'
                    });
                    tracker.id++;
                    result.components.push(newComponent);
                    stdoutRedirection = newComponent;
                    break;
                case 'errTo':
                    console.log('errTo!!');
                    newComponent = new FileComponent(argNode[1]);
                    newComponent.id = tracker.id;
                    connections.addConnectionFromErrorPort({
                        id: tracker.id,
                        port: 'input'
                    });
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
        result.connections = result.connections.concat(connections.toConnectionList());
        tracker.id++;
        return [bbox[0], result];
    };
}
exports.commonParseCommand = commonParseCommand;
;

parseFlagsAndSelectors = function (component, options) {
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
            if (!flag) {
                throw [key, "doesn't exist in ", flagOptions].join('');
            } else if (flag[0] !== '-') {
                sFlags.push(flag);
            } else {
                lFlags.push(flag);
            }
        }
    }

    if (component.selectors) {
        for (key in selectors = component.selectors) {
            value = selectors[key];
            var optionValue = selectorOptions[key][value.name];
            if (optionValue != null) {
                if (!optionValue) {
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
        return sFlags.join(' ');
    } else
        return "";
};

function commonParseComponent(flagOptions, selectorOptions, parameterOptions, beforeJoin) {
    var options;
    options = {
        flagOptions: flagOptions,
        selectorOptions: selectorOptions,
        parameterOptions: parameterOptions
    };
    return function (component, visualData, componentIndex, mapOfParsedComponents, parseComponent) {
        var exec, flags, parameters, res$, key, ref$, value, files, i$, len$, file, subCommand;
        exec = [component.exec];
        mapOfParsedComponents[component.id] = true;
        flags = parseFlagsAndSelectors(component, options);
        res$ = [];
        for (key in ref$ = component.parameters) {
            value = ref$[key];
            if (value) {
                if (value.indexOf(" ") >= 0) {
                    res$.push("\"-" + parameterOptions[key] + value + "\"");
                } else {
                    res$.push("-" + parameterOptions[key] + value);
                }
            }
        }
        parameters = res$;
        if (component.files) {
            res$ = [];
            for (i$ = 0, len$ = (ref$ = component.files).length; i$ < len$; ++i$) {
                file = ref$[i$];
                if (file instanceof Array) {
                    subCommand = parseComponent(componentIndex[file[1]], visualData, componentIndex, mapOfParsedComponents);
                    res$.push("<(" + subCommand + ")");
                } else if (file.indexOf(" ") >= 0) {
                    res$.push("\"" + file + "\"");
                } else {
                    res$.push(file);
                }
            }
            files = res$;
        } else {
            files = [];
        }
        if (parameters.length > 0) {
            parameters = join$.call(parameters, ' ');
        }
        if (beforeJoin) {
            return beforeJoin(component, exec, flags, files, parameters);
        } else {
            return join$.call(exec.concat(flags, parameters, files), ' ');
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

},{"../../common/graph":4,"../utils/componentConnections":26,"../utils/optionsParser":27}],8:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var config = {
    parameters: {
        separator: {
            name: 'field separator',
            option: 'F',
            type: "string",
            description: "filter entries by anything other than the content",
            defaultValue: ""
        }
    }
};
var awkData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        F: $.setParameter(config.parameters.separator.name)
    },
    longOptions: {
        "field-separator": $.sameAs('F')
    }
};
$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "awk",
        parameters: awkData.componentParameters,
        script: ""
    };
}

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        component.script = str;
    }
});

exports.parseComponent = common.commonParseComponent(awkData.flagOptions, awkData.selectorOptions, awkData.parameterOptions, function (component, exec, flags, files, parameters) {
    var script = component.script.replace('\"', "\\\"");
    if (script) {
        script = (/^[\n\ ]+$/.test(script)) ? '"' + script + '"' : '""';
    }
    exec.concat(parameters, script).join(' ');
});

exports.VisualSelectorOptions = awkData.visualSelectorOptions;
//# sourceMappingURL=awk.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],9:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    action: {
        name: 'action',
        description: 'action of the algorithm',
        options: {
            compress: {
                name: 'compress',
                option: 'z',
                description: 'compress the received data'
            },
            decompress: {
                name: 'decompress',
                option: null,
                description: 'decompress the received data'
            }
        }
    }
};

var actionOptions = selectors.action.options;

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    test: {
        name: "test",
        option: 't',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    small: {
        name: "small",
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    d: $.select(selectors.action.name, actionOptions.decompress.name),
    z: $.select(selectors.action.name, actionOptions.compress.name),
    k: $.switchOn(flags.keep.name),
    f: $.switchOn(flags.force.name),
    t: $.switchOn(flags.test.name),
    c: $.switchOn(flags.stdout.name),
    q: $.switchOn(flags.quiet.name),
    v: $.switchOn(flags.verbose.name),
    s: $.switchOn(flags.small.name),
    1: $.ignore,
    2: $.ignore,
    3: $.ignore,
    4: $.ignore,
    5: $.ignore,
    6: $.ignore,
    7: $.ignore,
    8: $.ignore,
    9: $.ignore
};

var longOptions = {
    'decompress': $.sameAs('d'),
    'compress': $.sameAs('z'),
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'stdout': $.sameAs('c'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v'),
    'small': $.sameAs('s'),
    'fast': $.sameAs('1'),
    'best': $.sameAs('9')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    var componentFlags = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    return {
        type: 'command',
        exec: "bunzip2",
        flags: componentFlags,
        selectors: {
            action: selectors.action.options.decompress.name
        },
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=bunzip2.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],10:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    action: {
        name: 'action',
        description: 'action of the algorithm',
        options: {
            compress: {
                name: 'compress',
                option: null,
                description: 'compress the received data'
            },
            decompress: {
                name: 'decompress',
                option: 'd',
                description: 'decompress the received data'
            }
        }
    }
};

var actionOptions = selectors.action.options;

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    test: {
        name: "test",
        option: 't',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
        active: true
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    small: {
        name: "small",
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    d: $.select(selectors.action.name, actionOptions.decompress.name),
    z: $.select(selectors.action.name, actionOptions.compress.name),
    k: $.switchOn(flags.keep.name),
    f: $.switchOn(flags.force.name),
    t: $.switchOn(flags.test.name),
    c: $.switchOn(flags.stdout.name),
    q: $.switchOn(flags.quiet.name),
    v: $.switchOn(flags.verbose.name),
    s: $.switchOn(flags.small.name),
    1: $.ignore,
    2: $.ignore,
    3: $.ignore,
    4: $.ignore,
    5: $.ignore,
    6: $.ignore,
    7: $.ignore,
    8: $.ignore,
    9: $.ignore
};

var longOptions = {
    'decompress': $.sameAs('d'),
    'compress': $.sameAs('z'),
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'stdout': $.sameAs('c'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v'),
    'small': $.sameAs('s'),
    'fast': $.sameAs('1'),
    'best': $.sameAs('9')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    var componentFlags = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    return {
        type: 'command',
        exec: "bzcat",
        flags: componentFlags,
        selectors: {
            action: selectors.action.options.decompress.name
        },
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=bzcat.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],11:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    action: {
        name: 'action',
        description: 'action of the algorithm',
        options: {
            compress: {
                name: 'compress',
                option: null,
                description: 'compress the received data'
            },
            decompress: {
                name: 'decompress',
                option: 'd',
                description: 'decompress the received data'
            }
        }
    }
};

var actionOptions = selectors.action.options;

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    test: {
        name: "test",
        option: 't',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    small: {
        name: "small",
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    d: $.select(selectors.action.name, actionOptions.decompress.name),
    z: $.select(selectors.action.name, actionOptions.compress.name),
    k: $.switchOn(flags.keep.name),
    f: $.switchOn(flags.force.name),
    t: $.switchOn(flags.test.name),
    c: $.switchOn(flags.stdout.name),
    q: $.switchOn(flags.quiet.name),
    v: $.switchOn(flags.verbose.name),
    s: $.switchOn(flags.small.name),
    1: $.ignore,
    2: $.ignore,
    3: $.ignore,
    4: $.ignore,
    5: $.ignore,
    6: $.ignore,
    7: $.ignore,
    8: $.ignore,
    9: $.ignore
};

var longOptions = {
    'decompress': $.sameAs('d'),
    'compress': $.sameAs('z'),
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'stdout': $.sameAs('c'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v'),
    'small': $.sameAs('s'),
    'fast': $.sameAs('1'),
    'best': $.sameAs('9')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    var componentFlags = {};
    var componentSelectors = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) {
            continue;
        }
        var value = selectors[key];
        for (var optionName in value.options) {
            var option = value.options[optionName];
            if (option.default) {
                console.log(key);
                var valueObj = {
                    name: option.name,
                    type: option.type
                };
                if (option.defaultValue) {
                    valueObj['value'] = option.defaultValue;
                }
                componentSelectors[value.name] = valueObj;
                console.info("componentSelectors ", componentSelectors);
                break;
            }
        }
    }

    return {
        type: 'command',
        exec: "bzip2",
        flags: componentFlags,
        selectors: {
            action: selectors.action.options.compress.name
        },
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=bzip2.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],12:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    lineNumber: {
        name: 'line number',
        description: 'action to print if line numbers on the output',
        options: {
            noprint: {
                name: 'do not print',
                option: null,
                description: 'do not print line numbers',
                default: true
            },
            allLines: {
                name: 'print all lines',
                option: 'n',
                description: 'print line numbers on all lines'
            },
            nonEmpty: {
                name: 'print all lines',
                option: 'b',
                description: 'print line numbers on non empty lines'
            }
        }
    }
};

var flags = {
    tabs: {
        name: "show tabs",
        option: 'T',
        description: "print TAB characters like ^I",
        active: false
    },
    ends: {
        name: "show ends",
        option: 'E',
        description: "print $ after each line",
        active: false
    },
    nonPrint: {
        name: "show non-printing",
        option: 'v',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    sblanks: {
        name: "squeeze blank",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        A: $.switchOn(flags.nonPrint, flags.tabs, flags.ends),
        e: $.switchOn(flags.nonPrint, flags.ends),
        T: $.switchOn(flags.tabs),
        v: $.switchOn(flags.nonPrint),
        E: $.switchOn(flags.ends),
        s: $.switchOn(flags.sblanks),
        t: $.switchOn(flags.nonPrint, flags.tabs),
        b: $.select(selectors.lineNumber, selectors.lineNumber.options.nonEmpty),
        n: $.selectIfUnselected(selectors.lineNumber, selectors.lineNumber.options.allLines, selectors.lineNumber.options.nonEmpty)
    },
    longOptions: {
        "show-all": $.sameAs('A'),
        "number-nonblank": $.sameAs('b'),
        "show-ends": $.sameAs('E'),
        "number": $.sameAs('n'),
        "squeeze-blank": $.sameAs('s'),
        "show-tabs": $.sameAs('T'),
        "show-nonprinting": $.sameAs('v')
    }
};
$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "cat",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=cat.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],13:[function(require,module,exports){
/*
 -d   If given, decompression is done instead.
 -c   Write output on stdout, don't remove original.
 -b   Parameter limits the max number of bits/code.
 -f   Forces output file to be generated, even if one already.
      exists, and even if no space is saved by compressing.
      If -f is not used, the user will be prompted if stdin is.
      a tty, otherwise, the output file will not be overwritten.
 -v   Write compression statistics.
 -V   Output vesion and compile options.
 -r   Recursive. If a filename is a directory, descend

*/
var $, parserModule, common, flags, flagOptions, selectorOptions, optionsParser, defaultComponentData;
$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");
flags = {
  force: 'force',
  decompress: 'decompress',
  stdout: 'stdout',
  statistics: 'statistics',
  'recursive': 'recursive'
};
flagOptions = {
  'force': 'f',
  'decompress': 'd',
  'stdout': 'c',
  'statistics': 'v',
  'recursive': 'r'
};
selectorOptions = {};
exports.VisualSelectorOptions = {};
$.setblocksize = function(size){
  return function(Component){
    return Component.blockSize = size;
  };
};
optionsParser = {
  shortOptions: {
    d: $.switchOn(flags.decompress),
    f: $.switchOn(flags.force),
    c: $.switchOn(flags.stdout),
    v: $.switchOn(flags.statistics),
    r: $.switchOn(flags.recursive)
  }
};
$.generate(optionsParser);
defaultComponentData = function(){
  return {
    type: 'command',
    exec: "compress",
    flags: {
      "decompress": false,
      "force": false,
      "stdout": false,
      "statistics": false,
      "recursive": false
    },
    files: []
  };
};
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(flagOptions, selectorOptions);
},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],14:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    format: {
        name: "format",
        description: "select attribute to sort",
        options: {
            normal: {
                name: 'normal',
                option: null,
                description: 'do not print line numbers',
                default: true
            },
            RCS: {
                name: 'RCS',
                option: 'n',
                description: 'print line numbers on all lines'
            },
            edScript: {
                name: 'ed script',
                option: 'e',
                description: 'print line numbers on non empty lines'
            }
        }
    }
};

var flags = {
    ignoreCase: {
        name: "ignore case",
        option: 'i',
        description: "print TAB characters like ^I",
        active: false
    },
    ignoreBlankLines: {
        name: "ignore blank lines",
        option: 'B',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    ignoreSpaceChange: {
        name: "ignore space change",
        option: 'b',
        description: "suppress repeated empty output lines",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        b: $.switchOn(flags.ignoreSpaceChange),
        B: $.switchOn(flags.ignoreBlankLines),
        i: $.switchOn(flags.ignoreCase),
        q: $.ignore,
        e: $.select(selectors.format, selectors.format.options.edScript),
        n: $.select(selectors.format, selectors.format.options.RCS)
    },
    longOptions: {
        "normal": $.select(selectors.format, selectors.format.options.normal),
        "ed": $.select(selectors.format, selectors.format.options.edScript),
        "rcs": $.select(selectors.format, selectors.format.options.RCS),
        "ignore-blank-lines": $.sameAs('B'),
        "ignore-space-change": $.sameAs('b'),
        "ignore-case": $.sameAs('i'),
        "brief": $.sameAs('q')
    }
};

$.generate(optionsParser);

function defaultComponentData() {
    console.log("imiokijiuh");

    return {
        type: 'command',
        exec: "diff",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=diff.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],15:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    patternType: {
        name: "pattern type",
        description: "define the pattern to filter",
        options: {
            extRegex: {
                name: "extended regexp",
                option: "E",
                type: 'option',
                description: 'use pattern as an extended regular expression'
            },
            fixedStrings: {
                name: "fixed strings",
                option: "F",
                type: 'option',
                description: 'use pattern as a set of expressions separated by lines'
            },
            basicRegex: {
                name: "basic regexp",
                option: null,
                type: 'option',
                description: 'use pattern as a basic regular expression',
                default: true
            }
        }
    },
    match: {
        name: "match",
        description: "",
        options: {
            default: {
                name: "default",
                option: null,
                type: 'option',
                description: 'do not force the pattern to filter complete words or lines',
                default: true
            },
            word: {
                name: "whole word",
                option: "F",
                type: 'option',
                description: 'force the pattern to filter complete words'
            },
            line: {
                name: "whole line",
                option: null,
                type: 'option',
                description: 'force the pattern to filter complete lines'
            }
        }
    }
};

var flags = {
    ignoreCase: {
        name: "ignore case",
        option: 'T',
        description: "print TAB characters like ^I",
        active: false
    },
    invertMatch: {
        name: "invert match",
        option: 'E',
        description: "print $ after each line",
        active: false
    }
};

var optionsParser = {
    shortOptions: {
        E: $.select(selectors.patternType, selectors.patternType.options.extRegex),
        F: $.select(selectors.patternType, selectors.patternType.options.fixedStrings),
        G: $.select(selectors.patternType, selectors.patternType.options.basicRegex),
        i: $.switchOn(flags.ignoreCase),
        v: $.switchOn(flags.invertMatch),
        x: $.select(selectors.match, selectors.match.options.line),
        w: $.selectIfUnselected(selectors.match.name, selectors.match.options.word.name, selectors.match.options.line.name),
        y: $.switchOn(flags.ignoreCase)
    },
    longOptions: {
        "extended-regexp": $.sameAs("E"),
        "fixed-strings": $.sameAs("F"),
        "basic-regexp": $.sameAs("G"),
        "perl-regexp": $.sameAs("P"),
        "ignore-case": $.sameAs("i"),
        "invert-match": $.sameAs("v"),
        "word-regexp": $.sameAs("w"),
        "line-regexp": $.sameAs("x")
    }
};
$.generate(optionsParser);

var config = {
    selectors: selectors,
    flags: flags
};

var grepCommandData = new parserModule.ParserData(config);

function defaultComponentData() {
    var componentFlags = {};
    var componentSelectors = {};

    for (var key in flags) {
        var value = flags[key];
        componentFlags[value.name] = value.active;
    }

    for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) {
            continue;
        }
        var value = selectors[key];
        for (var optionName in value.options) {
            var option = value.options[optionName];
            if (option.default) {
                console.log(key);
                var valueObj = {
                    name: option.name,
                    type: option.type
                };
                if (option.defaultValue) {
                    valueObj['value'] = option.defaultValue;
                }
                componentSelectors[value.name] = valueObj;
                console.info("componentSelectors ", componentSelectors);
                break;
            }
        }
    }

    return {
        type: 'command',
        exec: "grep",
        flags: componentFlags,
        selectors: componentSelectors,
        pattern: null,
        files: []
    };
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
    string: function (component, str) {
        if (component.pattern == null) {
            component.pattern = str;
        } else {
            component.files.push(str);
        }
    }
});

exports.parseComponent = common.commonParseComponent(grepCommandData.flagOptions, grepCommandData.selectorOptions, null, function (component, exec, flags, files) {
    var pattern = component.pattern;
    if (pattern) {
        pattern = (pattern.indexOf(" ") >= 0) ? '"' + pattern + '"' : pattern;
    }
    if (pattern && files.length) {
        return exec.concat(flags, pattern, files).join(' ');
    } else if (pattern) {
        return exec.concat(flags, pattern, files).join(' ');
    } else if (files.length) {
        return exec.concat(flags, '""', files).join(' ');
    } else
        return exec.concat(flags).join(' ');
});

exports.VisualSelectorOptions = grepCommandData.visualSelectorOptions;
//# sourceMappingURL=grep.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],16:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    }
};

var config = {
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    k: $.switchOn(flags.keep),
    f: $.switchOn(flags.force),
    q: $.switchOn(flags.quiet),
    v: $.switchOn(flags.verbose),
    r: $.switchOn(flags.recursive)
};

var longOptions = {
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "gunzip",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=gunzip.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],17:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    ratio: {
        name: 'ratio',
        description: 'compress ratio of the algorithm',
        options: {
            1: {
                name: '1 - fast',
                option: '1',
                description: 'compress the received data'
            },
            2: {
                name: '2',
                option: '2',
                description: 'decompress the received data'
            },
            3: {
                name: '3',
                option: '3',
                description: 'decompress the received data'
            },
            4: {
                name: '4',
                option: '4',
                description: 'decompress the received data'
            },
            5: {
                name: '5',
                option: '5',
                description: 'decompress the received data'
            },
            6: {
                name: '6',
                option: '6',
                description: 'decompress the received data',
                default: true
            },
            7: {
                name: '7',
                option: '7',
                description: 'decompress the received data'
            },
            8: {
                name: '8',
                option: '8',
                description: 'decompress the received data'
            },
            9: {
                name: '9 - best',
                option: '9',
                description: 'decompress the received data'
            }
        }
    }
};

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    test: {
        name: "test",
        option: 't',
        description: "test compressed file integrity",
        active: false
    },
    stdout: {
        name: "stdout",
        option: 'c',
        description: "output to standard out",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    small: {
        name: "small",
        option: 's',
        description: "use less memory (at most 2500k)",
        active: false
    }
};

var config = {
    selectors: selectors,
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    k: $.switchOn(flags.keep),
    f: $.switchOn(flags.force),
    t: $.switchOn(flags.test),
    c: $.switchOn(flags.stdout),
    q: $.switchOn(flags.quiet),
    v: $.switchOn(flags.verbose),
    r: $.switchOn(flags.recursive),
    s: $.switchOn(flags.small),
    1: $.select(selectors.ratio, selectors.ratio.options[1]),
    2: $.select(selectors.ratio, selectors.ratio.options[2]),
    3: $.select(selectors.ratio, selectors.ratio.options[3]),
    4: $.select(selectors.ratio, selectors.ratio.options[4]),
    5: $.select(selectors.ratio, selectors.ratio.options[5]),
    6: $.select(selectors.ratio, selectors.ratio.options[6]),
    7: $.select(selectors.ratio, selectors.ratio.options[7]),
    8: $.select(selectors.ratio, selectors.ratio.options[8]),
    9: $.select(selectors.ratio, selectors.ratio.options[9])
};

var longOptions = {
    'decompress': $.sameAs('d'),
    'compress': $.sameAs('z'),
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'stdout': $.sameAs('c'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v'),
    'small': $.sameAs('s'),
    'fast': $.sameAs('1'),
    'best': $.sameAs('9')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "gzip",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=gzip.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],18:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    showHeaders: {
        name: 'show headers',
        description: 'show headers with file name',
        options: {
            default: {
                name: 'default',
                type: 'option',
                option: null,
                description: 'default: show headers only if tailing multiple files',
                default: true
            },
            always: {
                name: 'always',
                option: "v",
                type: 'option',
                description: 'always show headers'
            },
            never: {
                name: 'never',
                type: 'option',
                option: "v",
                description: 'no not show headers'
            }
        }
    },
    NumOf: {
        name: 'first',
        description: 'define if first number of lines or bytes',
        options: {
            lines: {
                name: 'lines',
                type: 'numeric parameter',
                option: "n",
                default: true,
                defaultValue: 10
            },
            bytes: {
                name: 'bytes',
                type: 'numeric parameter',
                option: "b",
                defaultValue: 10
            }
        }
    }
};

var config = {
    selectors: selectors
};

var headData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        q: $.select(selectors.showHeaders.name, selectors.showHeaders.options.never.name),
        v: $.select(selectors.showHeaders.name, selectors.showHeaders.options.always.name),
        n: $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.lines.name),
        b: $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.bytes.name)
    },
    longOptions: {
        quiet: $.sameAs("q"),
        silent: $.sameAs("q"),
        verbose: $.sameAs("v")
    }
};

$.generate(optionsParser);

var defaultComponentData = function () {
    var componentSelectors = {};
    for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) {
            continue;
        }
        var value = selectors[key];
        for (var optionName in value.options) {
            var option = value.options[optionName];
            if (option.default) {
                console.log(key);
                var valueObj = {
                    name: option.name,
                    type: option.type
                };
                if (option.defaultValue) {
                    valueObj['value'] = option.defaultValue;
                }
                componentSelectors[value.name] = valueObj;
                break;
            }
        }
    }

    return {
        type: 'command',
        exec: 'head',
        flags: {},
        selectors: componentSelectors,
        files: []
    };
};

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(headData.flagOptions, headData.selectorOptions);
exports.VisualSelectorOptions = headData.visualSelectorOptions;
//# sourceMappingURL=head.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],19:[function(require,module,exports){
var $ = require("../utils/optionsParser");

var parserModule = require("../utils/parserData");

var common = require("./_init");

var selectors = {
    sort: {
        name: "sort",
        description: "select attribute to sort",
        options: {
            name: {
                name: 'name',
                option: null,
                type: 'option',
                description: 'sort entries by name',
                default: true
            },
            noSort: {
                name: "do not sort",
                option: "U",
                type: 'option',
                description: 'do not sort'
            },
            extension: {
                name: "extension",
                option: "X",
                type: 'option',
                description: 'always show headers'
            },
            size: {
                name: "size",
                option: "S",
                type: 'option',
                description: 'always show headers'
            },
            time: {
                name: "time",
                option: "v",
                type: 'option',
                description: 'always show headers'
            },
            version: {
                name: "version",
                option: "v",
                type: 'option',
                description: 'always show headers'
            }
        }
    },
    format: {
        name: "format",
        description: "select attribute to sort",
        options: {
            default: {
                name: 'default',
                option: null,
                type: 'option',
                description: 'always show headers',
                default: true
            },
            commas: {
                name: "commas",
                option: "m",
                type: 'option',
                description: 'always show headers'
            },
            long: {
                name: "long",
                option: "l",
                type: 'option',
                description: 'always show headers'
            }
        }
    },
    show: {
        name: "show",
        description: "select attribute to sort",
        options: {
            default: {
                name: 'default',
                option: null,
                type: 'option',
                description: 'always show headers',
                default: true
            },
            all: {
                name: "all",
                option: "a",
                type: 'option',
                description: 'always show headers'
            },
            almostAll: {
                name: "almost all",
                option: "A",
                type: 'option',
                description: 'always show headers'
            }
        }
    },
    indicatorStyle: {
        name: "indicator style",
        description: "select attribute to sort",
        options: {
            none: {
                name: 'none',
                option: null,
                type: 'option',
                description: 'always show headers',
                default: true
            },
            slash: {
                name: "slash",
                option: "p",
                type: 'option',
                description: 'always show headers'
            },
            classify: {
                name: "classify",
                option: "F",
                type: 'option',
                description: 'always show headers'
            },
            fileType: {
                name: "file type",
                option: "--file-type",
                type: 'option',
                description: 'always show headers'
            }
        }
    },
    timeStyle: {
        name: "time style",
        description: "select attribute to sort",
        options: {
            full_ISO: {
                name: 'full-iso',
                option: '--time-style=full-iso',
                type: 'option',
                description: 'always show headers'
            },
            long_ISO: {
                name: "long-iso",
                option: "--time-style=long-iso",
                type: 'option',
                description: 'always show headers'
            },
            ISO: {
                name: "iso",
                option: "--time-style=long-iso",
                type: 'option',
                description: 'always show headers'
            },
            locale: {
                name: "locale",
                option: null,
                type: 'option',
                description: 'always show headers',
                default: true
            },
            format: {
                name: "format",
                option: null,
                type: 'parameter',
                defaultValue: '',
                description: 'always show headers'
            }
        }
    },
    quotingStyle: {
        name: "quoting style",
        description: "select attribute to sort",
        options: {
            literal: {
                name: 'literal',
                option: null,
                type: 'option',
                description: 'always show headers',
                default: true
            },
            locale: {
                name: "locale",
                option: "--quoting-style=locale",
                type: 'option',
                description: 'always show headers'
            },
            shell: {
                name: "shell",
                option: "--quoting-style=shell",
                type: 'option',
                description: 'always show headers'
            },
            shellAlways: {
                name: "shell-always",
                option: "--quoting-style=shell-always",
                type: 'option',
                description: 'always show headers'
            },
            c: {
                name: "c",
                option: "--quoting-style=c",
                type: 'option',
                description: 'always show headers'
            },
            escape: {
                name: "escape",
                option: "--quoting-style=escape",
                type: 'option',
                description: 'always show headers'
            }
        }
    }
};

var flags = {
    reverse: {
        name: "reverse",
        option: 'T',
        description: "print TAB characters like ^I",
        active: false
    },
    context: {
        name: "context",
        option: 'E',
        description: "print $ after each line",
        active: false
    },
    inode: {
        name: "inode",
        option: 'v',
        description: "use ^ and M- notation, except for LFD and TAB",
        active: false
    },
    humanReadable: {
        name: "human readable",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    },
    ignoreBackups: {
        name: "ignore backups",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    },
    noPrintOwner: {
        name: "do not list owner",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    },
    noPrintGroup: {
        name: "do not list group",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    },
    numericID: {
        name: "numeric ID",
        option: 's',
        description: "suppress repeated empty output lines",
        active: false
    }
};

var parameters = {
    ignore: {
        name: 'ignore',
        option: 'I',
        type: "string",
        description: "filter entries by anything other than the content",
        defaultValue: ""
    }
};

var optionsParser = {
    shortOptions: {
        a: $.select(selectors.show, selectors.show.options.all),
        A: $.select(selectors.show, selectors.show.options.almostAll),
        b: $.select(selectors.quotingStyle, selectors.quotingStyle.options.escape),
        B: $.switchOn(flags.ignoreBackups),
        c: $.ignore,
        C: $.ignore,
        d: $.ignore,
        D: $.ignore,
        f: $.ignore,
        F: $.select(selectors.indicatorStyle, selectors.indicatorStyle.options.classify),
        g: $.switchOn(flags.noPrintOwner),
        G: $.switchOn(flags.noPrintGroup),
        h: $.switchOn(flags.humanReadable),
        H: $.ignore,
        i: $.ignore,
        I: $.setParameter(parameters.ignore.name),
        k: $.ignore,
        l: $.select(selectors.format, selectors.format.options.long),
        L: $.ignore,
        m: $.select(selectors.format, selectors.format.options.commas),
        n: $.switchOn(flags.numericID),
        N: $.ignore,
        o: $.ignore,
        p: $.select(selectors.indicatorStyle, selectors.indicatorStyle.options.slash),
        q: $.ignore,
        Q: $.ignore,
        r: $.switchOn(flags.reverse),
        R: $.ignore,
        s: $.ignore,
        S: $.select(selectors.sort, selectors.sort.options.size),
        t: $.select(selectors.sort, selectors.sort.options.time),
        T: $.ignore,
        u: $.ignore,
        U: $.select(selectors.sort, selectors.sort.options.noSort),
        v: $.select(selectors.sort, selectors.sort.options.extension),
        w: $.ignore,
        x: $.ignore,
        X: $.select(selectors.sort, selectors.sort.options.size),
        Z: $.switchOn(flags.context),
        1: $.ignore
    },
    longOptions: {
        "all": $.sameAs('a'),
        "almost-all": $.sameAs('A'),
        "escape": $.sameAs('b'),
        "directory": $.sameAs('d'),
        "classify": $.sameAs('F'),
        "no-group": $.sameAs('G'),
        "human-readable": $.sameAs('h'),
        "inode": $.sameAs('i'),
        "kibibytes": $.sameAs('k'),
        "dereference": $.sameAs('l'),
        "numeric-uid-gid": $.sameAs('n'),
        "literal": $.sameAs('N'),
        "indicator-style=slash": $.sameAs('p'),
        "hide-control-chars": $.sameAs('q'),
        "quote-name": $.sameAs('Q'),
        "reverse": $.sameAs('r'),
        "recursive": $.sameAs('R'),
        "size": $.sameAs('S'),
        "context": $.sameAs('Z')
    }
};
$.generate(optionsParser);

var config = {
    selectors: selectors,
    flags: flags,
    parameters: parameters
};

var lsCommandData = new parserModule.ParserData(config);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "ls",
        flags: lsCommandData.componentFlags,
        selectors: lsCommandData.componentSelectors,
        parameters: lsCommandData.componentParameters,
        files: []
    };
}
;

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(lsCommandData.flagOptions, lsCommandData.selectorOptions, lsCommandData.parameterOptions);
exports.VisualSelectorOptions = lsCommandData.visualSelectorOptions;
//# sourceMappingURL=ls.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],20:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var selectors = {
    showHeaders: {
        name: 'show headers',
        description: 'show headers with file name',
        options: {
            default: {
                name: 'default',
                type: 'option',
                option: null,
                description: 'default: show headers only if tailing multiple files',
                default: true
            },
            always: {
                name: 'always',
                option: "v",
                type: 'option',
                description: 'always show headers'
            },
            never: {
                name: 'never',
                type: 'option',
                option: "v",
                description: 'no not show headers'
            }
        }
    },
    NumOf: {
        name: 'last',
        description: 'define if last number of lines or bytes',
        options: {
            lines: {
                name: 'lines',
                type: 'numeric parameter',
                option: "n",
                default: true,
                defaultValue: 10
            },
            bytes: {
                name: 'bytes',
                type: 'numeric parameter',
                option: "b",
                defaultValue: 10
            }
        }
    }
};

var config = {
    selectors: selectors
};

var tailData = new parserModule.ParserData(config);

var optionsParser = {
    shortOptions: {
        q: $.select(selectors.showHeaders.name, selectors.showHeaders.options.never.name),
        v: $.select(selectors.showHeaders.name, selectors.showHeaders.options.always.name),
        n: $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.lines.name),
        b: $.selectParameter(selectors.NumOf.name, selectors.NumOf.options.bytes.name)
    },
    longOptions: {
        quiet: $.sameAs("q"),
        silent: $.sameAs("q"),
        verbose: $.sameAs("v")
    }
};

$.generate(optionsParser);

var defaultComponentData = function () {
    var componentSelectors = {};
    for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) {
            continue;
        }
        var value = selectors[key];
        for (var optionName in value.options) {
            var option = value.options[optionName];
            if (option.default) {
                console.log(key);
                var valueObj = {
                    name: option.name,
                    type: option.type
                };
                if (option.defaultValue) {
                    valueObj['value'] = option.defaultValue;
                }
                componentSelectors[value.name] = valueObj;
                break;
            }
        }
    }

    return {
        type: 'command',
        exec: 'tail',
        flags: {},
        selectors: componentSelectors,
        files: []
    };
};

exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(tailData.flagOptions, tailData.selectorOptions);
exports.VisualSelectorOptions = tailData.visualSelectorOptions;
//# sourceMappingURL=tail.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],21:[function(require,module,exports){
var $, Boundary;
$ = require("./_init.js");
Boundary = require("./_graphlayout");

function arrangeLayout(previousCommand, boundaries) {
    var maxX, minY, prevBound, components, translateX, i$, len$, boundary, translateY, x, y;
    maxX = 0;
    minY = previousCommand.position.y - (boundaries.length - 1) * 250;
    if (minY < 0) {
        previousCommand.position.y -= minY;
        minY = 0;
    }
    prevBound = null;
    components = [];
    translateX = previousCommand.position.x + 500;
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
        boundary = boundaries[i$];
        translateY = prevBound ? prevBound.bottom - boundary.top : minY;
        boundary.translateXY(translateX, translateY);
        prevBound = boundary;
    }
    x = (function () {
        switch (boundaries.length) {
            case 0:
                return 0;
            default:
                return maxX + 500;
        }
    }());
    return y = (function () {
        switch (boundaries.length) {
            case 0:
                return 0;
            case 1:
                return prevBound.bottom;
            default:
                return prevBound.bottom;
        }
    }());
}
function connector(parser, previousCommand, result, boundaries, tracker) {
    return function (commandList) {
        var subresult, i$, ref$, len$, sub;
        subresult = parser.parseAST(commandList, tracker);
        boundaries.push(Boundary.fromComponents(subresult.components));
        for (i$ = 0, len$ = (ref$ = subresult.components).length; i$ < len$; ++i$) {
            sub = ref$[i$];
            result.components.push(sub);
        }
        for (i$ = 0, len$ = (ref$ = subresult.connections).length; i$ < len$; ++i$) {
            sub = ref$[i$];
            result.connections.push(sub);
        }
        result.connections.push({
            startNode: previousCommand.id,
            startPort: 'output',
            endNode: subresult.firstMainComponent,
            endPort: 'input'
        });
    };
}
exports.parseCommand = function (argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections) {
    var boundaries, result, connectTo, i$, len$, argNode;
    boundaries = [];
    result = {
        firstMainComponent: firstMainComponent,
        components: components,
        connections: connections
    };
    if (previousCommand instanceof Array) {
        previousCommand = previousCommand[1];
    }
    connectTo = connector(parser, previousCommand, result, boundaries, tracker);
    for (i$ = 0, len$ = argsNode.length; i$ < len$; ++i$) {
        argNode = argsNode[i$];
        switch ($.typeOf(argNode)) {
            case 'outToProcess':
                connectTo(argNode[1]);
        }
    }
    if (nextcommands.length) {
        connectTo(nextcommands);
    }
    arrangeLayout(previousCommand, boundaries);
    result.counter = tracker.id;
    return result;
};
//# sourceMappingURL=tee.js.map

},{"./_graphlayout":6,"./_init.js":7}],22:[function(require,module,exports){
/*  -c, -C, --complement usa o complemento de SET1
  -d, --delete apaga caracteres em SET1, não traduz
  -s, --squeeze-repeats substitui cada sequência de entrada de um caractere repetido
                            que esteja listado em SET1 com uma única ocorrência
                            deste caractere
  -t, --truncate-set1 primeiro truncar SET1 para tamanho do SET2
      --help     exibir esta ajuda e sair
      --version  mostrar a informação de versão e sair

SETs são especificados como cadeias de caracteres. A maioria
auro-representa-se. Sequências interpretadas são:

  \NNN            carácter com valor octal NNN (1 a 3 dígitos octais)
  \\              backslash (barra invertida)
  \a              BEL audível
  \b              backspace (espaço atrás)
  \f              form feed
  \n              nova linha
  \r              return (enter)
  \t              tab horizontal
  \v              tab vertical
  CAR1-CAR2       todos os caracteres de CAR1 a CAR2 por ordem crescente
  [CAR*]          em SET2, cópias de CAR até tamanho de SET1
  [CAR*REP]       REP cópias de CAR, REP octal se começar por 0
  [:alnum:]       todas as letras e dígitos
  [:alpha:]       todas as letras                                                                                                                                                               
  [:blank:]       todos os espaços brancos horizontais                                                                                                                                          
  [:cntrl:]       todos os caracteres de controlo                                                                                                                                               
  [:digit:]       todos os dígitos                                                                                                                                                              
  [:graph:]       todos os caracteres mostráveis, excluindo space (espaço)                                                                                                                      
  [:lower:]       todas as letras minúsculas                                                                                                                                                    
  [:print:]       todos os caracteres mostráveis, incluindo space (espaço)                                                                                                                      
  [:punct:]       todos os caracteres de pontuação                                                                                                                                              
  [:space:]       todos os espaços brancos horizontais e verticais                                                                                                                              
  [:upper:]       todas as letras maiúsculas                                                                                                                                                    
  [:xdigit:]      todos os dígitos hexadecimais                                                                                                                                                 
  [=CAR=]         todos os caracteres equivalentes a CAR  
*/
var $, parserModule, common, flags, selectorOptions, flagOptions, optionsParser, defaultComponentData, join$ = [].join;
$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");
flags = {
  'complement': 'complement',
  'delete': 'delete',
  squeeze: "squeeze repeats",
  truncate: "truncate set1"
};
selectorOptions = {};
exports.VisualSelectorOptions = {};
flagOptions = {
  'complement': 'c',
  'delete': 'd',
  "squeeze repeats": 's',
  "truncate set1": 't'
};
optionsParser = {
  shortOptions: {
    c: $.switchOn(flags.complement),
    C: $.switchOn(flags.complement),
    d: $.switchOn(flags['delete']),
    s: $.switchOn(flags.squeeze),
    t: $.switchOn(flags.truncate)
  },
  longOptions: {
    'complement': $.sameAs('c'),
    'delete': $.sameAs('d'),
    'squeeze-repeats': $.sameAs('s'),
    'truncate-set1': $.sameAs('t')
  }
};
$.generate(optionsParser);
defaultComponentData = function(){
  return {
    type: 'command',
    exec: 'tr',
    flags: {
      "complement": false,
      "delete": false,
      "squeeze repeats": false,
      "truncate set1": false
    },
    set1: "",
    set2: ""
  };
};
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData, {
  string: function(component, str){
    var set1, set2;
    if (set1 === "") {
      set1 = str;
    } else {
      set2 = str;
    }
  }
});
exports.parseComponent = common.commonParseComponent(flagOptions, selectorOptions, null, function(component, exec, flags, files){
  var set1, set2;
  set1 = component.set1, set2 = component.set2;
  return join$.call(exec.concat(flags, set1, set2), ' ');
});
},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],23:[function(require,module,exports){
var $ = require("../utils/optionsParser");
var parserModule = require("../utils/parserData");
var common = require("./_init");

var flags = {
    keep: {
        name: "keep files",
        option: 'k',
        description: "keep (don't delete) input files",
        active: false
    },
    force: {
        name: "force",
        option: 'f',
        description: "overwrite existing output files",
        active: false
    },
    quiet: {
        name: "quiet",
        option: 'q',
        description: "suppress noncritical error messages",
        active: false
    },
    verbose: {
        name: "verbose",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    },
    recursive: {
        name: "recursive",
        option: 'v',
        description: "overwrite existing output files",
        active: false
    }
};

var config = {
    flags: flags
};

var bzipData = new parserModule.ParserData(config);

var shortOptions = {
    k: $.switchOn(flags.keep),
    f: $.switchOn(flags.force),
    q: $.switchOn(flags.quiet),
    v: $.switchOn(flags.verbose),
    r: $.switchOn(flags.recursive)
};

var longOptions = {
    'keep': $.sameAs('k'),
    'force': $.sameAs('f'),
    'test': $.sameAs('t'),
    'quiet': $.sameAs('q'),
    'verbose': $.sameAs('v')
};

var optionsParser = {
    shortOptions: shortOptions,
    longOptions: longOptions
};

$.generate(optionsParser);

function defaultComponentData() {
    return {
        type: 'command',
        exec: "zcat",
        flags: bzipData.componentFlags,
        selectors: bzipData.componentSelectors,
        files: []
    };
}
;
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
exports.VisualSelectorOptions = bzipData.visualSelectorOptions;
//# sourceMappingURL=zcat.js.map

},{"../utils/optionsParser":27,"../utils/parserData":28,"./_init":7}],24:[function(require,module,exports){
var parser = {};

var astBuilder = require('./ast-builder/ast-builder');

var GraphModule = require("../common/graph");
var Graph = GraphModule.Graph;
var GraphComponent = GraphModule.GraphComponent;

var parserCommand = {
    awk: require('./commands/awk'),
    cat: require('./commands/cat'),
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
var VisualSelectorOptions = {};
for (var key in parserCommand) {
    implementedCommands.push(key);
    VisualSelectorOptions[key] = parserCommand[key].VisualSelectorOptions;
}

function isImplemented(command) {
    return parserCommand[command] != null;
}
;

function generateAST(command) {
    return astBuilder.parse(command);
}

function parseAST(ast, tracker) {
    if (typeof tracker === "undefined") { tracker = { id: 0 }; }
    var components, connections, LastCommandComponent, CommandComponent, exec, args, nodeParser, result_aux, result, comp, firstMainComponent;

    var graph = new Graph();

    components = [];
    connections = [];
    var firstMainComponent = null;
    LastCommandComponent = null;
    CommandComponent = null;
    for (var index = 0, _ref = ast, length = _ref.length; index < length; ++index) {
        var commandNode = _ref[index];
        exec = commandNode.exec, args = commandNode.args;
        nodeParser = parserCommand[exec];
        if (nodeParser.parseCommand) {
            if (exec === 'tee') {
                return nodeParser.parseCommand(args, parser, tracker, LastCommandComponent, ast.slice(index + 1), firstMainComponent, components, connections);
            }
            result_aux = nodeParser.parseCommand(args, parser, tracker, LastCommandComponent);
            result = null;
            if (result_aux instanceof Array) {
                result = result_aux[1];
            } else {
                result = result_aux;
            }
            components = components.concat(result.components);
            connections = connections.concat(result.connections);
            CommandComponent = result.mainComponent;
            if (LastCommandComponent) {
                comp = LastCommandComponent instanceof Array ? LastCommandComponent[1] : LastCommandComponent;
                connections.push({
                    startNode: comp.id,
                    startPort: 'output',
                    endNode: CommandComponent.id,
                    endPort: 'input'
                });
            }
            if (result_aux instanceof Array) {
                LastCommandComponent = [result_aux[0], CommandComponent];
            } else {
                LastCommandComponent = CommandComponent;
            }
            if (CommandComponent === void 8) {
                "mi";
            }
            if (index < 1) {
                firstMainComponent = CommandComponent.id;
            }
        }
    }
    return {
        firstMainComponent: firstMainComponent,
        counter: tracker.id,
        components: components,
        connections: connections
    };
}

function parseCommand(command) {
    return parseAST(generateAST(command));
}

function indexComponents(visualData) {
    var result = {};
    for (var i = 0, _ref = visualData.components, length = _ref.length; i < length; ++i) {
        var value = _ref[i];
        result[value.id] = value;
    }
    return result;
}
;

function parseVisualData(VisualData) {
    var indexedComponentList, initialComponent;
    if (VisualData.components.length < 1) {
        return '';
    }
    indexedComponentList = indexComponents(VisualData);
    initialComponent = indexedComponentList[VisualData.firstMainComponent];
    if (!initialComponent) {
        return '';
    }
    return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
}
function parseComponent(component, visualData, componentIndex, mapOfParsedComponents) {
    switch (component.type) {
        case 'command':
            return parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents, parseVisualDatafromComponent);
        case 'subgraph':
            return compileMacro(component.macro);
        default:
            return '';
    }
}
function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents) {
    var isFirst, i$, ref$, len$, connection, parsedCommand, parsedCommandIndex, endNodeId, j$, ref1$, len1$, component, endNode, comm, to$, i, command;
    var commands = [];
    do {
        isFirst = true;

        for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
            connection = ref$[i$];
            if (connection.endNode === currentComponent.id && connection.startPort === 'output' && connection.endPort === 'input' && mapOfParsedComponents[connection.startNode] !== true) {
                isFirst = false;
                currentComponent = componentIndex[connection.startNode];
                break;
            }
        }
    } while(isFirst = false);

    parsedCommand = parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents);
    parsedCommandIndex = commands.length;
    commands.push(parsedCommand);

    var outputs = [];
    var stdErrors = [];
    var exitCodes = [];

    visualData.connections.filter(function (connection) {
        return connection.startNode === currentComponent.id && mapOfParsedComponents[connection.endNode] !== true;
    }).forEach(function (connection) {
        endNodeId = connection.endNode;
        endNode = componentIndex[endNodeId];
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
            if (component.type === "file")
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
            if (components[index].type) {
                comm.push(compiledComponent);
            } else {
                comm.push(">((" + compiledComponent + ") &> /dev/null )");
            }
        });
        return comm;
    };

    var teeResult = function (components, compiledComponents) {
        return teeResultArray(components, compiledComponents).join(" ");
    };

    if (nextcommands.length > 1) {
        comm = teeResultArray(outputs, nextcommands);
        comm.pop();
        commands.push(comm.join(" "));
        commands.push(nextcommands[nextcommands.length - 1]);
    } else if (nextcommands.length === 1) {
        if (outputs[0].type === 'file') {
            commands[parsedCommandIndex] += " > " + outputs[0].filename;
        } else {
            commands.push(nextcommands[0]);
        }
    }

    if (nextErrcommands.length > 1) {
        comm = teeResult(outputs, nextcommands);
        commands[parsedCommandIndex] += " 2> >((" + comm + ") &> /dev/null )";
    } else if (nextErrcommands.length === 1) {
        if (stdErrors[0].type === 'file') {
            commands[parsedCommandIndex] += " 2> " + stdErrors[0].filename;
        } else {
            commands[parsedCommandIndex] += " 2> >((" + nextErrcommands[0] + ") &> /dev/null )";
        }
    }

    if (nextExitcommands.length > 1) {
        comm = teeResult(outputs, nextcommands);
        commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + comm + " &> /dev/null)";
    } else if (nextExitcommands.length === 1) {
        if (exitCodes[0].type === 'file') {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? > " + exitCodes[0].filename + ")";
        } else {
            commands[parsedCommandIndex] = "(" + commands[parsedCommandIndex] + "; (echo $? | " + nextExitcommands[0] + ") &> /dev/null)";
        }
    }

    return commands.join(" | ");
}

function createMacro(name, description, command, fromMacro) {
    if (fromMacro) {
        var result = JSON.parse(JSON.stringify(fromMacro));
        result.name = name;
        result.description = description;
        return result;
    }
    var macroData = new GraphComponent(name, description);
    if (command) {
        macroData.setGraphData(parseCommand(command));
    }
    return macroData;
}
;

function compileMacro(macro) {
    var indexedComponentList, initialComponent;
    console.log("compling Macro");
    if (macro.entryComponent === null) {
        throw "no component defined as Macro Entry";
    }
    indexedComponentList = indexComponents(macro);
    initialComponent = indexedComponentList[macro.entryComponent];
    return parseVisualDatafromComponent(initialComponent, macro.VisualData, indexedComponentList, {});
}

parser.generateAST = exports.generateAST = generateAST;
parser.parseAST = exports.parseAST = parseAST;
parser.astBuilder = exports.astBuilder = astBuilder;
parser.parseCommand = exports.parseCommand = parseCommand;
parser.parseComponent = exports.parseComponent = parseComponent;
parser.implementedCommands = exports.implementedCommands = implementedCommands;
parser.parseVisualData = exports.parseVisualData = parseVisualData;

exports.createMacro = createMacro;
exports.VisualSelectorOptions = VisualSelectorOptions;
//# sourceMappingURL=parser.js.map

},{"../common/graph":4,"./ast-builder/ast-builder":5,"./commands/awk":8,"./commands/bunzip2":9,"./commands/bzcat":10,"./commands/bzip2":11,"./commands/cat":12,"./commands/compress":13,"./commands/diff":14,"./commands/grep":15,"./commands/gunzip":16,"./commands/gzip":17,"./commands/head":18,"./commands/ls":19,"./commands/tail":20,"./commands/tee":21,"./commands/tr":22,"./commands/zcat":23}],25:[function(require,module,exports){
(function (val) {
    val.shellParser = require("./parser");
})(window);
//# sourceMappingURL=shellParser.js.map

},{"./parser":24}],26:[function(require,module,exports){
var ComponentConnections = (function () {
    function ComponentConnections(component) {
        this.component = component;
        this.connectionsToInput = [];
        this.connectionsFromOutput = [];
    }
    ComponentConnections.prototype.addConnectionToInputPort = function (port, otherNode) {
        this.connectionsToInput.push({
            startNode: otherNode.id,
            startPort: otherNode.port,
            endPort: port
        });
    };

    ComponentConnections.prototype.addConnectionFromPort = function (port, otherNode) {
        this.connectionsToInput.push({
            startPort: port,
            endNode: otherNode.id,
            endPort: otherNode.port
        });
    };

    ComponentConnections.prototype.addConnectionFromOutputPort = function (otherNode) {
        this.addConnectionFromPort("output", otherNode);
    };

    ComponentConnections.prototype.addConnectionFromErrorPort = function (otherNode) {
        this.addConnectionFromPort("error", otherNode);
    };

    ComponentConnections.prototype.addConnectionFromReturnCodePort = function (otherNode) {
        this.addConnectionFromPort("retcode", otherNode);
    };

    ComponentConnections.prototype.toConnectionList = function () {
        var id = this.component.id;
        return this.connectionsFromOutput.map(function (connection) {
            connection.startNode = id;
            return connection;
        }).concat(this.connectionsToInput.map(function (connection) {
            connection.endNode = id;
            return connection;
        }));
    };
    return ComponentConnections;
})();

module.exports = ComponentConnections;
//# sourceMappingURL=componentConnections.js.map

},{}],27:[function(require,module,exports){
var Iterator = (function () {
    function Iterator(ArgList) {
        this.index = 0;
        this.argList = ArgList;
        this.length = ArgList.length;
        this.current = ArgList[0];
    }
    Iterator.prototype.hasNext = function () {
        return this.index !== this.length;
    };
    Iterator.prototype.next = function () {
        return this.current = this.argList[this.index++];
    };
    Iterator.prototype.rest = function () {
        return this.argList.slice(this.index);
    };
    return Iterator;
})();

function parseShortOptions(options, componentData, argsNodeIterator) {
    var option, shortOptions = options.shortOptions, iter = new Iterator(argsNodeIterator.current.slice(1));
    while (option = iter.next()) {
        var arg = shortOptions[option];
        if (arg && arg(componentData, argsNodeIterator, iter)) {
            break;
        }
    }
}
exports.parseShortOptions = parseShortOptions;

exports.parseLongOptions = function (options, componentData, argsNodeIterator) {
    var longOptions, optionStr, indexOfSep, iter, optionKey, arg;
    longOptions = options.longOptions;
    optionStr = argsNodeIterator.current.slice(2);
    indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
        iter = new Iterator(optionStr);
        iter.index = indexOfSep + 1;
        optionKey = optionStr.slice(0, indexOfSep);
        arg = longOptions[optionKey];
        if (!arg) {
            arg = longOptions[optionStr];
        }
        if (arg) {
            return arg(componentData, argsNodeIterator, iter);
        }
    } else {
        arg = longOptions[optionStr];
        if (arg) {
            return arg(componentData);
        }
    }
};

exports.switchOn = function () {
    var flags = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        flags[_i] = arguments[_i + 0];
    }
    flags = flags.map(function (flag) {
        return (flag.name) ? flag.name : flag;
    });
    return function (Component, state, substate) {
        flags.forEach(function (flag) {
            Component.flags[flag] = true;
        });
        return false;
    };
};

exports.setParameter = function (param) {
    var paramFn = function (Component, state, substate) {
        var hasNext, parameter;
        hasNext = substate.hasNext();
        parameter = hasNext ? substate.rest() : state.next();
        Component.parameters[param] = parameter;
        return true;
    };
    paramFn;
    paramFn.ptype = 'param';
    paramFn.param = param;
    return paramFn;
};


function select(key, value) {
    if (key.name) {
        key = key.name;
    }
    if (value.name) {
        value = value.name;
    }
    return function (Component) {
        Component.selectors[key] = {
            type: "option",
            name: value
        };
    };
}
exports.select = select;
;

function ignore() {
}
exports.ignore = ignore;
;

exports.selectParameter = function (key, value) {
    var paramFn = function (Component, state, substate) {
        var parameselectParameterter;
        parameselectParameterter = substate.hasNext() ? substate.rest() : state.next();
        Component.selectors[key] = {
            parameterName: value,
            parameterValue: parameselectParameterter
        };
        return true;
    };
    paramFn;
    paramFn.ptype = 'param';
    return paramFn;
};

exports.selectIfUnselected = function (key, value) {
    var selections = [];
    for (var _i = 0; _i < (arguments.length - 2); _i++) {
        selections[_i] = arguments[_i + 2];
    }
    return function (Component) {
        var selectorValue = Component.selectors[key];
        if (selections.every(function (value) {
            return selectorValue !== value;
        })) {
            Component.selectors[key] = value;
        } else {
            return false;
        }
    };
};

exports.sameAs = function (option) {
    return ['same', option];
};

function generateSelectors(options) {
    var selectors = {};
    var selectorType = {};
    var selectorOptions = {};
    var VisualSelectorOptions = {};
    var subkey;
    var key;
    var subkeys;
    for (key in options) {
        subkeys = options[key];
        selectors[key] = key;
        var keySelectorType = selectorType[key] = {};
        var keySelectorOption = selectorOptions[key] = {};
        var VisualSelectorOption = VisualSelectorOptions[key] = [];
        for (subkey in subkeys) {
            var value = subkeys[subkey];
            keySelectorType[subkey.replace(" ", "_")] = subkey;
            keySelectorOption[subkey] = value;
            VisualSelectorOption.push(value);
        }
    }
    return {
        selectors: selectors,
        selectorType: selectorType,
        selectorOptions: selectorOptions,
        VisualSelectorOptions: VisualSelectorOptions
    };
}
exports.generateSelectors = generateSelectors;
;

function generate(parser) {
    var key, val;
    var longOptions = parser.longOptions, shortOptions = parser.shortOptions;
    for (key in longOptions) {
        val = longOptions[key];
        if (val[0] === 'same') {
            longOptions[key] = shortOptions[val[1]];
        }
    }
}
exports.generate = generate;
//# sourceMappingURL=optionsParser.js.map

},{}],28:[function(require,module,exports){
var ParserData = (function () {
    function ParserData(config) {
        if (typeof config === "undefined") { config = {}; }
        this.selectors = {};
        this.selectorOptions = {};
        this.visualSelectorOptions = {};
        this.parameterOptions = {};
        this.shortOptions = {};
        this.longOptions = {};
        this.flagOptions = {};
        this.setFlags(config.flags);
        this.setParameters(config.parameters);
        this.setSelector(config.selectors);
    }
    ParserData.prototype.setFlags = function (flags) {
        if (typeof flags === "undefined") { flags = {}; }
        this.flags = flags;
        var flagOptions = (this.flagOptions = {});
        for (var key in flags) {
            var value = flags[key];
            flagOptions[value.name] = value.option;
        }
    };

    ParserData.prototype.setParameters = function (parameters) {
        if (typeof parameters === "undefined") { parameters = {}; }
        this.parameters = parameters;
        var parameterOptions = this.parameterOptions;
        for (var key in parameters) {
            var value = parameters[key];
            parameterOptions[value.name] = value.option;
        }
    };

    ParserData.prototype.setSelector = function (selectorData) {
        if (typeof selectorData === "undefined") { selectorData = {}; }
        this.selectorData = selectorData;
        var selectors = this.selectors;
        var selectorOptions = this.selectorOptions;
        var visualSelectorOptions = this.visualSelectorOptions;
        var regexToReplace = / /g;

        for (var key in selectorData) {
            var subkeys = selectorData[key];
            var keySelector = selectors[subkeys.name] = {};
            var keySelectorOption = selectorOptions[subkeys.name] = {};
            var VisualSelectorOption = visualSelectorOptions[subkeys.name] = [];

            for (var subkey in subkeys.options) {
                var value = subkeys.options[subkey];
                keySelector[value.name] = value;
                keySelectorOption[value.name] = value.option;
                VisualSelectorOption.push(value.name);
            }
        }

        visualSelectorOptions.$selector = selectors;
        visualSelectorOptions.$changeToValue = function (currSelector, key, value) {
            var toChange = selectors[key][value];
            currSelector.name = toChange.name;
            currSelector.type = toChange.type;
            if (currSelector.value && toChange.type === "option") {
                delete currSelector.value;
            } else if (!currSelector.value && toChange.type !== "option" && toChange.defaultValue) {
                currSelector.value = toChange.defaultValue;
            }
        };
        return this;
    };

    ParserData.prototype.setShortOptions = function (options) {
        this.shortOptions = options;
    };

    ParserData.prototype.setLongOptions = function (options) {
        this.longOptions = options;
    };

    Object.defineProperty(ParserData.prototype, "componentFlags", {
        get: function () {
            var componentFlags = {};
            var flags = this.flags;
            for (var key in flags) {
                var value = flags[key];
                componentFlags[value.name] = value.active;
            }
            return componentFlags;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(ParserData.prototype, "componentSelectors", {
        get: function () {
            var componentSelectors = {};
            var selectorData = this.selectorData;
            for (var key in selectorData) {
                var value = selectorData[key];
                for (var optionName in value.options) {
                    var option = value.options[optionName];
                    if (option.default) {
                        console.log(key);
                        var valueObj = {
                            name: option.name,
                            type: option.type
                        };
                        if (option.defaultValue) {
                            valueObj['value'] = option.defaultValue;
                        }
                        componentSelectors[value.name] = valueObj;
                        break;
                    }
                }
            }
            return componentSelectors;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(ParserData.prototype, "componentParameters", {
        get: function () {
            var componentParameters = {};
            var parameters = this.parameters;
            for (var key in parameters) {
                var value = parameters[key];
                componentParameters[value.name] = value.defaultValue || "";
            }
            return componentParameters;
        },
        enumerable: true,
        configurable: true
    });
    return ParserData;
})();
exports.ParserData = ParserData;

(function (SelectorOptionType) {
    SelectorOptionType[SelectorOptionType["OPTION"] = 0] = "OPTION";
    SelectorOptionType[SelectorOptionType["PARAMETER"] = 1] = "PARAMETER";
    SelectorOptionType[SelectorOptionType["NUMERIC_PARAMETER"] = 2] = "NUMERIC_PARAMETER";
})(exports.SelectorOptionType || (exports.SelectorOptionType = {}));
var SelectorOptionType = exports.SelectorOptionType;
//# sourceMappingURL=parserData.js.map

},{}]},{},[25])