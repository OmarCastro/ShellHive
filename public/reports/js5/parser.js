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
},{"/home/omar/thesis/flownix/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2,"fs":1,"path":3}],5:[function(require,module,exports){
(function(){
  var Boundary, getBoundaries;
  Boundary = (function(){
    Boundary.displayName = 'Boundary';
    var prototype = Boundary.prototype, constructor = Boundary;
    function Boundary(left, rigth, top, bottom, component){
      left == null && (left = 0);
      rigth == null && (rigth = 0);
      top == null && (top = 0);
      bottom == null && (bottom = 0);
      if (component.type === 'file') {
        bottom += 100;
      } else {
        bottom += 350;
      }
      this.left = left;
      this.rigth = rigth;
      this.top = top;
      this.bottom = bottom;
      this.components = [component];
    }
    Boundary.fromXY = function(x, y, component){
      return new this(x, x, y, y, component);
    };
    Boundary.fromPoint = function(point, component){
      return this.fromXY(point.x, point.y, component);
    };
    Boundary.fromComponent = function(component){
      return this.fromPoint(component.position, component);
    };
    Boundary.fromComponents = function(components){
      var boundary, i$, to$, i;
      if (components.length === 0) {
        return null;
      }
      boundary = this.fromComponent(components[0]);
      for (i$ = 1, to$ = components.length - 1; i$ <= to$; ++i$) {
        i = i$;
        boundary.extend(this.fromComponent(components[i]));
      }
      return boundary;
    };
    prototype.extendXY = function(x, y){
      var x$;
      x$ = this;
      if (x < boundary.left) {
        x$.left = x;
      }
      if (x > boundary.rigth) {
        x$.rigth = x;
      }
      if (y < boundary.top) {
        x$.top = y;
      }
      if (y > boundary.bottom) {
        x$.bottom = y;
      }
    };
    prototype.extend = function(boundary2){
      var x$;
      x$ = this;
      if (boundary2.left < this.left) {
        x$.left = boundary2.left;
      }
      if (boundary2.rigth > this.rigth) {
        x$.rigth = boundary2.rigth;
      }
      if (boundary2.top < this.top) {
        x$.top = boundary2.top;
      }
      if (boundary2.bottom > this.bottom) {
        x$.bottom = boundary2.bottom;
      }
      x$.components = x$.components.concat(boundary2.components);
    };
    Boundary.translate = function(boundary, x, y){
      var x$, i$, ref$, len$, comp, y$, results$ = [];
      y == null && (y = 0);
      x$ = boundary;
      x$.left += x;
      x$.rigth += x;
      x$.top += y;
      x$.bottom += y;
      for (i$ = 0, len$ = (ref$ = boundary.components).length; i$ < len$; ++i$) {
        comp = ref$[i$];
        y$ = comp.position;
        y$.x += x;
        y$.y += y;
        results$.push(y$);
      }
      return results$;
    };
    prototype.translate = function(x, y){
      y == null && (y = 0);
      Boundary.translate(this, x, y);
    };
    return Boundary;
  }());
  getBoundaries = function(components){
    return Boundary.fromComponents(components);
  };
  function arrangeLayout(boundaries){
    var maxX, prevBound, components, i$, len$, boundary, translateX, translateY, x, y, bottom;
    maxX = 0;
    prevBound = null;
    components = [];
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      if (boundary) {
        maxX = Math.max(boundary.rigth, maxX);
        components = components.concat(boundary.components);
      }
    }
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      if (boundary) {
        translateX = maxX - boundary.rigth;
        translateY = prevBound ? prevBound.bottom - boundary.top : 0;
        Boundary.translate(boundary, translateX, translateY);
        prevBound = boundary;
      }
    }
    if (boundaries.length) {
      x = maxX + 450;
      y = Math.max((prevBound.bottom - 350) / 2, 0);
      bottom = Math.max(prevBound.bottom, 350);
    } else {
      x = 0;
      y = 0;
      bottom = 350;
    }
    return [
      {
        left: 0,
        rigth: x,
        top: 0,
        bottom: bottom,
        components: components
      }, {
        x: x,
        y: y
      }
    ];
  }
  exports.getBoundaries = getBoundaries;
  exports.arrangeLayout = arrangeLayout;
  exports.translateBoundary = Boundary.translate;
}).call(this);

},{}],6:[function(require,module,exports){
(function(){
  var Boundaries, ComponentConnections, optionsParser, Iterator, justAccept, getComponentById, addFileComponent, commonNodeParsing, commonParseCommand, parseFlagsAndSelectors, commonParseComponent, join$ = [].join;
  Boundaries = require("./_graphlayout");
  ComponentConnections = require("../utils/componentConnections");
  optionsParser = require("../utils/optionsParser");
  exports.Iterator = Iterator = (function(){
    Iterator.displayName = 'Iterator';
    var prototype = Iterator.prototype, constructor = Iterator;
    function Iterator(ArgList){
      this.index = 0;
      this.argList = ArgList;
      this.length = ArgList.length;
      this.current = ArgList[0];
    }
    prototype.hasNext = function(){
      return this.index !== this.length;
    };
    prototype.next = function(){
      return this.current = this.argList[this.index++];
    };
    prototype.rest = function(){
      return this.argList.slice(this.index);
    };
    return Iterator;
  }());
  /**
    gets the type of argument Nodes
  
    the possible types are:
      argument - a single argument
      shortOptions - a list of options e.g -{options}
      longOption - a long option e.g --{option}
      inFromProccess - a link to a file(pipe) to read
      outToProccess - a link to a file(pipe) to write
  
    @returns {string} the type os argument
  */
  function typeOf(arg){
    if (typeof arg === 'string' && arg.length > 0) {
      if (arg[0] === '-' && arg.length > 1) {
        if (arg[1] === '-') {
          return 'longOption';
        }
        return 'shortOptions';
      } else {
        return 'string';
      }
    }
    if (arg instanceof Array) {
      return arg[0];
    }
  }
  justAccept = function(){
    return function(){};
  };
  function generate(parser){
    var longOptions, shortOptions, key, val, results$ = [];
    longOptions = parser.longOptions, shortOptions = parser.shortOptions;
    for (key in longOptions) {
      val = longOptions[key];
      if (val[0] === 'same') {
        results$.push(longOptions[key] = shortOptions[val[1]]);
      }
    }
    return results$;
  }
  getComponentById = function(visualData, id){
    var i$, ref$, len$, x;
    for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (x.id === id) {
        return x;
      }
    }
    return null;
  };
  addFileComponent = function(options, filename){
    var componentData, connectionsToPush, tracker, newComponent;
    componentData = options.componentData, connectionsToPush = options.connectionsToPush, tracker = options.tracker;
    componentData.files.push(argNode);
    newComponent = {
      type: 'file',
      filename: argNode,
      id: tracker.id,
      position: {
        x: 0,
        y: 0
      }
    };
    return connectionsToPush.push({
      startNode: tracker.id,
      startPort: 'output',
      endPort: "file" + (componentData.files.length - 1)
    });
  };
  commonNodeParsing = {
    string: function(options){
      return addFileComponent(options, options.iterator.current);
    },
    shortOptions: function(options){
      return addFileComponent(options, options.iterator.current);
    },
    longOption: function(options){
      return addFileComponent(options, options.iterator.current);
    }
  };
  commonParseCommand = function(optionsParserData, defaultComponentData, argNodeParsing){
    return function(argsNode, parser, tracker, previousCommand){
      var componentData, boundaries, connections, stdoutRedirection, stderrRedirection, result, iter, argNode, newComponent, inputPort, subresult, x$, bbox, y$, ref$, y;
      componentData = defaultComponentData();
      boundaries = [];
      if (previousCommand) {
        if (previousCommand instanceof Array) {
          boundaries.push(previousCommand[0]);
        } else {
          boundaries.push[Boundaries.getBoundaries([previousCommand])];
        }
      }
      connections = new ComponentConnections(componentData);
      stdoutRedirection = null;
      stderrRedirection = null;
      result = {
        components: [componentData],
        connections: [],
        mainComponent: componentData
      };
      iter = new Iterator(argsNode);
      while (argNode = iter.next()) {
        switch (typeOf(argNode)) {
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
            newComponent = {
              type: 'file',
              filename: argNode,
              id: tracker.id,
              position: {
                x: 0,
                y: 0
              }
            };
            inputPort = "file" + componentData.files.length;
            componentData.files.push(argNode);
            connections.addConnectionToInputPort(inputPort, {
              id: tracker.id,
              port: 'output'
            });
            tracker.id++;
            result.components.push(newComponent);
            boundaries.push(Boundaries.getBoundaries([newComponent]));
          }
          break;
        case 'inFromProcess':
          subresult = parser.parseAST(argNode[1], tracker);
          boundaries.push(Boundaries.getBoundaries(subresult.components));
          x$ = result;
          x$.components = x$.components.concat(subresult.components);
          x$.connections = x$.connections.concat(subresult.connections);
          inputPort = "file" + componentData.files.length;
          connections.addConnectionToInputPort(inputPort, {
            id: tracker.id - 1,
            port: 'output'
          });
          componentData.files.push(["pipe", tracker.id - 1]);
          break;
        case 'outTo':
          newComponent = {
            type: 'file',
            filename: argNode[1],
            id: tracker.id,
            position: {
              x: 0,
              y: 0
            }
          };
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
          newComponent = {
            type: 'file',
            filename: argNode[1],
            id: tracker.id,
            position: {
              x: 0,
              y: 0
            }
          };
          connections.addConnectionFromErrorPort({
            id: tracker.id,
            port: 'input'
          });
          tracker.id++;
          result.components.push(newComponent);
          stderrRedirection = newComponent;
        }
      }
      bbox = Boundaries.arrangeLayout(boundaries);
      y$ = componentData;
      y$.position = bbox[1];
      y$.id = tracker.id;
      if (stdoutRedirection) {
        stdoutRedirection.position = (ref$ = clone$(bbox[1]), ref$.x = bbox[1].x + 400, ref$);
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
  };
  parseFlagsAndSelectors = function(component, options){
    var flagOptions, selectorOptions, sFlags, lFlags, key, ref$, value, flag, that, val;
    flagOptions = options.flagOptions, selectorOptions = options.selectorOptions;
    sFlags = [];
    lFlags = [];
    for (key in ref$ = component.flags) {
      value = ref$[key];
      if (value) {
        flag = flagOptions[key];
        if (flag[0] !== '-') {
          sFlags.push(flag);
        } else {
          lFlags.push(flag);
        }
      }
    }
    if (component.selectors) {
      for (key in ref$ = component.selectors) {
        value = ref$[key];
        if ((that = selectorOptions[key][value]) != null) {
          val = that;
          if (val[0] !== '-') {
            sFlags.push(val);
          } else {
            lFlags.push(val);
          }
        }
      }
    }
    if (sFlags.length > 0) {
      sFlags = "-" + join$.call(sFlags, '');
    }
    if (lFlags.length > 0) {
      if (lFlags.length > 0) {
        sFlags += " ";
      }
      sFlags += join$.call(lFlags, ' ');
    }
    return sFlags;
  };
  commonParseComponent = function(flagOptions, selectorOptions, parameterOptions, beforeJoin){
    var options;
    options = {
      flagOptions: flagOptions,
      selectorOptions: selectorOptions,
      parameterOptions: parameterOptions
    };
    return function(component, visualData, componentIndex, mapOfParsedComponents, parseComponent){
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
      if (parameters.length > 0) {
        parameters = join$.call(parameters, ' ');
      }
      if (beforeJoin) {
        return beforeJoin(component, exec, flags, files, parameters);
      } else {
        return join$.call(exec.concat(flags, parameters, files), ' ');
      }
    };
  };
  import$(exports, optionsParser);
  import$(exports, Boundaries);
  exports.typeOf = typeOf;
  exports.justAccept = justAccept;
  exports.generate = generate;
  exports.commonParseCommand = commonParseCommand;
  exports.commonParseComponent = commonParseComponent;
  exports.getComponentById = getComponentById;
  function clone$(it){
    function fun(){} fun.prototype = it;
    return new fun;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

},{"../utils/componentConnections":24,"../utils/optionsParser":25,"./_graphlayout":5}],7:[function(require,module,exports){
/*
-f arqprog              --file=arqprog
-F fs                   --field-separator=fs
-v var=val              --assign=var=val
*/
(function(){
  var $, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  optionsParser = {
    shortOptions: {
      F: $.setParameter("field separator")
    },
    longOptions: {
      'field-separator': $.sameAs('F')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "awk",
      parameters: {
        "field separator": " "
      },
      script: ""
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData, {
    string: function(component, str){
      return component.script = str;
    }
  });
}).call(this);

},{"./_init.js":6}],8:[function(require,module,exports){
/*
-d --decompress     force decompression
-z --compress       force compression
-k --keep           keep (don't delete) input files
-f --force          overwrite existing output files
-t --test           test compressed file integrity
-c --stdout         output to standard out
-q --quiet          suppress noncritical error messages
-v --verbose        be verbose (a 2nd -v gives more)
-s --small          use less memory (at most 2500k)
-1 .. -9            set block size to 100k .. 900k
--fast              alias for -1
--best              alias for -9
*/
(function(){
  var $, selectors, actionSelector, actionSelectorOption, flags, selectorOptions, ref$, value, flagOptions, optionsParser, i$, i, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    'action': 'action'
  };
  actionSelector = {
    'compress': 'compress',
    'decompress': 'decompress'
  };
  actionSelectorOption = {
    'compress': 'z',
    'decompress': null
  };
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    stdout: 'stdout',
    quiet: 'quiet',
    verbose: 'verbose',
    small: 'small'
  };
  selectorOptions = (ref$ = {}, ref$[selectors.action] = actionSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.action] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = actionSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'test': 'test',
    'stdout': 'c',
    'quiet': 'q',
    'verbose': 'v',
    'small': 's'
  };
  $.setblocksize = function(size){
    return function(Component){
      return Component.blockSize = size;
    };
  };
  optionsParser = {
    shortOptions: {
      d: $.select(selectors.action, actionSelector.decompress),
      z: $.select(selectors.action, actionSelector.compress),
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      c: $.switchOn(flags.stdout),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose),
      s: $.switchOn(flags.small)
    },
    longOptions: {
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
    }
  };
  for (i$ = '1'; i$ <= '9'; ++i$) {
    i = i$;
    optionsParser.shortOptions[i] = $.setblocksize(i);
  }
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "bunzip2",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "stdout": false,
        "quiet": false,
        "verbose": false,
        "small": false
      },
      selectors: {
        action: actionSelector.decompress
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],9:[function(require,module,exports){
/*
-d --decompress     force decompression
-z --compress       force compression
-k --keep           keep (don't delete) input files
-f --force          overwrite existing output files
-t --test           test compressed file integrity
-c --stdout         output to standard out
-q --quiet          suppress noncritical error messages
-v --verbose        be verbose (a 2nd -v gives more)
-s --small          use less memory (at most 2500k)
-1 .. -9            set block size to 100k .. 900k
--fast              alias for -1
--best              alias for -9
*/
(function(){
  var $, selectors, actionSelector, actionSelectorOption, flags, selectorOptions, ref$, value, flagOptions, optionsParser, i$, i, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    'action': 'action'
  };
  actionSelector = {
    'compress': 'compress',
    'decompress': 'decompress'
  };
  actionSelectorOption = {
    'compress': 'z',
    'decompress': null
  };
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    stdout: 'stdout',
    quiet: 'quiet',
    verbose: 'verbose',
    small: 'small'
  };
  selectorOptions = (ref$ = {}, ref$[selectors.action] = actionSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.action] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = actionSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'test': 'test',
    'stdout': 'c',
    'quiet': 'q',
    'verbose': 'v',
    'small': 's'
  };
  $.setblocksize = function(size){
    return function(Component){
      return Component.blockSize = size;
    };
  };
  optionsParser = {
    shortOptions: {
      d: $.select(selectors.action, actionSelector.decompress),
      z: $.select(selectors.action, actionSelector.compress),
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      c: $.switchOn(flags.stdout),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose),
      s: $.switchOn(flags.small)
    },
    longOptions: {
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
    }
  };
  for (i$ = '1'; i$ <= '9'; ++i$) {
    i = i$;
    optionsParser.shortOptions[i] = $.setblocksize(i);
  }
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "bzcat",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "stdout": true,
        "quiet": false,
        "verbose": false,
        "small": false
      },
      selectors: {
        action: actionSelector.decompress
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],10:[function(require,module,exports){
/*
-d --decompress     force decompression
-z --compress       force compression
-k --keep           keep (don't delete) input files
-f --force          overwrite existing output files
-t --test           test compressed file integrity
-c --stdout         output to standard out
-q --quiet          suppress noncritical error messages
-v --verbose        be verbose (a 2nd -v gives more)
-s --small          use less memory (at most 2500k)
-1 .. -9            set block size to 100k .. 900k
--fast              alias for -1
--best              alias for -9
*/
(function(){
  var $, selectors, actionSelector, actionSelectorOption, flags, selectorOptions, ref$, value, flagOptions, optionsParser, i$, i, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    'action': 'action'
  };
  actionSelector = {
    'compress': 'compress',
    'decompress': 'decompress'
  };
  actionSelectorOption = {
    'compress': null,
    'decompress': 'd'
  };
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    stdout: 'stdout',
    quiet: 'quiet',
    verbose: 'verbose',
    small: 'small'
  };
  selectorOptions = (ref$ = {}, ref$[selectors.action] = actionSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.action] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = actionSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'test': 'test',
    'stdout': 'c',
    'quiet': 'q',
    'verbose': 'v',
    'small': 's'
  };
  $.setblocksize = function(size){
    return function(Component){
      return Component.blockSize = size;
    };
  };
  optionsParser = {
    shortOptions: {
      d: $.select(selectors.action, actionSelector.decompress),
      z: $.select(selectors.action, actionSelector.compress),
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      c: $.switchOn(flags.stdout),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose),
      s: $.switchOn(flags.small)
    },
    longOptions: {
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
    }
  };
  for (i$ = '1'; i$ <= '9'; ++i$) {
    i = i$;
    optionsParser.shortOptions[i] = $.setblocksize(i);
  }
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "bzip2",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "stdout": false,
        "quiet": false,
        "verbose": false,
        "small": false
      },
      selectors: {
        action: actionSelector.compress
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],11:[function(require,module,exports){
(function(){
  var $, selectors, lineNumberSelector, lineNumberSelectorOption, selectorsOptions, ref$, value, flags, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    lineNum: "line number"
  };
  lineNumberSelector = {
    none: "do not print",
    all: "print all lines",
    nonEmpty: "print non-empty lines"
  };
  lineNumberSelectorOption = {
    "do not print": null,
    "print all lines": 'n',
    "print non-empty lines": 'b'
  };
  selectorsOptions = (ref$ = {}, ref$[selectors.lineNum] = lineNumberSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.lineNum] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = lineNumberSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flags = {
    tabs: "show tabs",
    ends: "show ends",
    nonPrint: "show non-printing",
    sblanks: "squeeze blanks"
  };
  flagOptions = {
    "show non-printing": 'v',
    "show tabs": 'T',
    "show ends": 'E',
    "squeeze blanks": 's'
  };
  optionsParser = {
    shortOptions: {
      A: $.switchOn(flags.nonPrint, flags.tabs, flags.ends),
      e: $.switchOn(flags.nonPrint, flags.ends),
      T: $.switchOn(flags.tabs),
      v: $.switchOn(flags.nonPrint),
      E: $.switchOn(flags.ends),
      s: $.switchOn(flags.sblanks),
      t: $.switchOn(flags.nonPrint, flags.tabs),
      b: $.select(selectors.lineNum, lineNumberSelector.nonEmpty),
      n: $.selectIfUnselected(selectors.lineNum, lineNumberSelector.all, lineNumberSelector.nonEmpty)
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
  defaultComponentData = function(){
    var ref$;
    return {
      type: 'command',
      exec: "cat",
      flags: {
        "show non-printing": false,
        "show ends": false,
        "show tabs": false,
        "squeeze blanks": false
      },
      selectors: (ref$ = {}, ref$[selectors.lineNum] = lineNumberSelector.none, ref$),
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorsOptions);
}).call(this);

},{"./_init.js":6}],12:[function(require,module,exports){
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
(function(){
  var $, flags, flagOptions, selectorOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
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
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],13:[function(require,module,exports){
/*
grep:
  Matcher Selection:
    arguments:
      - ["E","--extended-regexp","Interpret PATTERN as an extended regular expression"]
      - ["F","--fixed-strings","Interpret PATTERN as a list of fixed strings, separated by newlines, any of which is to be matched."]
      - ["G","--basic-regexp","Interpret PATTERN as a basic regular expression (BRE, see below).  This is the default."]
      - ["P","--perl-regexp","display $ at end of each line"]
  Matching Control:
    arguments:
        - ["e PATTERN","--regexp=PATTERN","Use PATTERN as the pattern.  This can be used to specify multiple search patterns, or to protect a pattern beginning with a hyphen (-)."]
        - ["f FILE","--file=FILE","Obtain patterns from FILE, one per line.  The empty file contains zero patterns, and therefore matches nothing."]
        - ["i","--ignore-case","Ignore case distinctions in both the PATTERN and the input files."]
        - ["v","--invert-match","Invert the sense of matching, to select non-matching lines."]
        - ["w","--word-regexp"," Select only those lines containing matches that form whole words.  The test is that the matching substring must either be at the beginning of the line, or preceded by a non-
              word constituent character.  Similarly, it must be either at the end of the line or followed by a non-word constituent character.  Word-constituent characters  are  letters,
              digits, and the underscore."]
        - ["x","--line-regexp","Select only those matches that exactly match the whole line."]

*/
(function(){
  var $, selectors, patternTypeSelector, patternTypeSelectorOption, ref$, matchSelector, matchSelectorOption, selectorOptions, value, flags, flagOptions, optionsParser, defaultComponentData, join$ = [].join;
  $ = require("./_init.js");
  selectors = {
    'patternType': 'patternType',
    'match': 'match'
  };
  patternTypeSelector = {
    extendedRegex: "extended regexp",
    fixedStrings: "fixed strings",
    basicRegex: "basic regexp",
    perlRegex: "perl regexp"
  };
  patternTypeSelectorOption = (ref$ = {}, ref$[patternTypeSelector.extendedRegex] = 'E', ref$[patternTypeSelector.fixedStrings] = 'F', ref$[patternTypeSelector.basicRegex] = null, ref$[patternTypeSelector.perlRegex] = 'P', ref$);
  matchSelector = {
    'default': "default",
    wholeLine: "whole line",
    wholeWord: "whole word"
  };
  matchSelectorOption = (ref$ = {}, ref$[matchSelector['default']] = null, ref$[matchSelector.wholeLine] = 'x', ref$[matchSelector.wholeWord] = 'w', ref$);
  selectorOptions = (ref$ = {}, ref$[selectors.patternType] = patternTypeSelectorOption, ref$[selectors.match] = matchSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.patternType] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = patternTypeSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$[selectors.match] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = matchSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flags = {
    ignoreCase: "ignore case",
    invertMatch: "invert match"
  };
  flagOptions = {
    "ignore case": 'i',
    "invert match": 'v'
  };
  optionsParser = {
    shortOptions: {
      E: $.select(selectors.patternType, patternTypeSelector.extendedRegex),
      F: $.select(selectors.patternType, patternTypeSelector.fixedStrings),
      G: $.select(selectors.patternType, patternTypeSelector.basicRegex),
      i: $.switchOn(flags.ignoreCase),
      P: $.select(selectors.patternType, patternTypeSelector.perlRegex),
      v: $.switchOn(flags.invertMatch),
      x: $.select(selectors.match, matchSelector.wholeLine),
      w: $.selectIfUnselected(selectors.match, matchSelector.wholeWord, matchSelector.wholeLine),
      y: $.switchOn(flags.ignoreCase)
    },
    longOptions: {
      'extended-regexp': $.sameAs('E'),
      'fixed-strings': $.sameAs('F'),
      'basic-regexp': $.sameAs('G'),
      'perl-regexp': $.sameAs('P'),
      'ignore-case': $.sameAs('i'),
      'invert-match': $.sameAs('v'),
      'word-regexp': $.sameAs('w'),
      'line-regexp': $.sameAs('x')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    var ref$;
    return {
      type: 'command',
      exec: "grep",
      flags: {
        "ignore case": false,
        "invert match": false
      },
      selectors: (ref$ = {}, ref$[selectors.patternType] = patternTypeSelector.basicRegex, ref$[selectors.match] = matchSelector['default'], ref$),
      pattern: null,
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData, {
    string: function(component, str){
      if (component.pattern === null) {
        return component.pattern = str;
      } else {
        return component.files.push(str);
      }
    }
  });
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions, null, function(component, exec, flags, files){
    var pattern;
    pattern = component.pattern;
    if (pattern) {
      if (pattern.indexOf(" ") >= 0) {
        pattern = "\"" + pattern + "\"";
      }
    } else {
      pattern = "\"\"";
    }
    return join$.call(exec.concat(flags, pattern, files), ' ');
  });
}).call(this);

},{"./_init.js":6}],14:[function(require,module,exports){
/*

  -c, --stdout      write on standard output, keep original files unchanged
  -d, --decompress  decompress
  -f, --force       force overwrite of output file and compress links
  -h, --help        give this help
  -k, --keep        keep (don't delete) input files
  -l, --list        list compressed file contents
  -n, --no-name     do not save or restore the original name and time stamp
  -N, --name        save or restore the original name and time stamp
  -q, --quiet       suppress all warnings
  -r, --recursive   operate recursively on directories
  -S, --suffix=SUF  use suffix SUF on compressed files                                        
  -t, --test        test compressed file integrity                                            
  -v, --verbose     verbose mode                                                                                                                       


*/
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    quiet: 'quiet',
    verbose: 'verbose',
    recursive: 'recursive'
  };
  selectorOptions = {};
  exports.VisualSelectorOptions = {};
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'quiet': 'q',
    'verbose': 'v',
    'recursive': 'r'
  };
  optionsParser = {
    shortOptions: {
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose)
    },
    longOptions: {
      'keep': $.sameAs('k'),
      'force': $.sameAs('f'),
      'test': $.sameAs('t'),
      'quiet': $.sameAs('q'),
      'verbose': $.sameAs('v')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "gunzip",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "quiet": false,
        "verbose": false,
        "recursive": false
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],15:[function(require,module,exports){
/*

  -c, --stdout      write on standard output, keep original files unchanged
  -d, --decompress  decompress
  -f, --force       force overwrite of output file and compress links
  -h, --help        give this help
  -k, --keep        keep (don't delete) input files
  -l, --list        list compressed file contents
  -n, --no-name     do not save or restore the original name and time stamp
  -N, --name        save or restore the original name and time stamp
  -q, --quiet       suppress all warnings
  -r, --recursive   operate recursively on directories
  -S, --suffix=SUF  use suffix SUF on compressed files                                        
  -t, --test        test compressed file integrity                                            
  -v, --verbose     verbose mode                                                              
  -1, --fast        compress faster                                                           
  -9, --best        compress better                                                           
  --rsyncable       Make rsync-friendly archive    


*/
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, i$, i, defaultComponentData;
  $ = require("./_init.js");
  flags = {
    keepFiles: "keep files",
    decompress: 'decompress',
    force: 'force',
    test: 'test',
    stdout: 'stdout',
    quiet: 'quiet',
    verbose: 'verbose',
    recursive: 'recursive',
    small: 'small'
  };
  selectorOptions = {};
  exports.VisualSelectorOptions = {};
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'decompress': 'd',
    'stdout': 'c',
    'quiet': 'q',
    'test': 't',
    'verbose': 'v',
    'recursive': 'r',
    'small': 's'
  };
  $.setblocksize = function(size){
    return function(Component){
      return Component.blockSize = size;
    };
  };
  optionsParser = {
    shortOptions: {
      d: $.switchOn(flags.decompress),
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      c: $.switchOn(flags.stdout),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose),
      r: $.switchOn(flags.recursive),
      s: $.switchOn(flags.small)
    },
    longOptions: [
      {
        'decompress': $.sameAs('d'),
        'compress': $.sameAs('z'),
        'keep': $.sameAs('k'),
        'force': $.sameAs('f'),
        'test': $.sameAs('t'),
        'stdout': $.sameAs('c'),
        'quiet': $.sameAs('q'),
        'verbose': $.sameAs('v'),
        'small': $.sameAs('s')
      }, 'recursive:', $.sameAs('r'), {
        'fast': $.sameAs('1'),
        'best': $.sameAs('9')
      }
    ]
  };
  for (i$ = '1'; i$ <= '9'; ++i$) {
    i = i$;
    optionsParser.shortOptions[i] = $.setblocksize(i);
  }
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "gzip",
      flags: {
        "decompress": false,
        "keep files": false,
        "force": false,
        "test": false,
        "stdout": false,
        "quiet": false,
        "verbose": false,
        "small": false,
        "recursive": false
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],16:[function(require,module,exports){
/*

  -c, --bytes=[-]K         print the first K bytes of each file;
                             with the leading '-', print all but the last
                             K bytes of each file
  -n, --lines=[-]K         print the first K lines instead of the first 10;
                             with the leading '-', print all but the last
                             K lines of each file
  -q, --quiet, --silent    nuncar mostrar cabeçalhos com nomes de ficheiros
  -v, --verbose            mostrar sempre cabeçalhos com nomes de ficheiros

*/
(function(){
  var $, flags, parameters, parameterOptions, selectors, showHeadersSelector, showHeadersSelectorOption, selectorOptions, ref$, value, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  flags = {};
  parameters = {
    'lines': 'lines',
    'bytes': 'bytes'
  };
  parameterOptions = {
    'lines': 'n',
    'bytes': 'b'
  };
  selectors = {
    showHeaders: "show headers"
  };
  showHeadersSelector = {
    'default': 'default',
    always: 'always',
    never: 'never'
  };
  showHeadersSelectorOption = {
    'default': null,
    always: 'v',
    never: 'q'
  };
  selectorOptions = (ref$ = {}, ref$[selectors.showHeaders] = showHeadersSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.showHeaders] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = showHeadersSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flagOptions = {};
  optionsParser = {
    shortOptions: {
      q: $.select(selectors.showHeaders, showHeadersSelector.never),
      v: $.select(selectors.showHeaders, showHeadersSelector.always)
    },
    longOptions: {
      'quiet': $.sameAs('q'),
      'silent': $.sameAs('q'),
      'verbose': $.sameAs('v')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    var ref$;
    return {
      type: 'command',
      exec: 'head',
      flags: {},
      selectors: (ref$ = {}, ref$[selectors.showHeaders] = showHeadersSelector['default'], ref$),
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions, parameterOptions);
}).call(this);

},{"./_init.js":6}],17:[function(require,module,exports){
(function(){
  var $, selectors, sortSelector, formatSelector, indicatorStyleSelector, timeStyleSelector, quotingStyleSelector, showSelector, sortSelectorOption, formatSelectorOption, indicatorStyleSelectorOption, timeStyleSelectorOption, quotingStyleSelectorOption, showSelectorOption, selectorOptions, value, flags, flagOptions, parameters, parameterOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    'sort': 'sort',
    'format': 'format',
    'show': 'show',
    indicatorStyle: "indicator style",
    timeStyle: "time style",
    quotingStyle: "quoting style"
  };
  sortSelector = {
    'name': 'name',
    'noSort': "do not sort",
    'extension': 'extension',
    'size': 'size',
    'time': 'time',
    'version': 'version'
  };
  formatSelector = {
    'default': 'default',
    'commas': 'commas',
    'long': 'long'
  };
  indicatorStyleSelector = {
    'none': 'none',
    'slash': 'slash',
    'classify': 'classify',
    fileType: "file type"
  };
  timeStyleSelector = {
    fullIso: 'full-iso',
    longIso: 'long-iso',
    'iso': 'iso',
    'locale': 'locale',
    'format': 'format'
  };
  quotingStyleSelector = {
    'literal': 'literal',
    'locale': 'locale',
    'shell': 'shell',
    shellAlways: "shell-always",
    'c': 'c',
    'escape': 'escape'
  };
  showSelector = {
    'all': 'all',
    almostAll: 'almost-all',
    'default': 'default'
  };
  sortSelectorOption = {
    'name': null,
    "do not sort": 'U',
    'extension': 'X',
    'size': 'S',
    'time': 't',
    'version': 'v'
  };
  formatSelectorOption = {
    'default': null,
    'commas': 'm',
    'long': 'l'
  };
  indicatorStyleSelectorOption = {
    'none': null,
    'slash': 'p',
    'classify': 'F',
    'fileType': "--file-type"
  };
  timeStyleSelectorOption = {
    'full-iso': "--time-style=full-iso",
    'long-iso': "--time-style=long-iso",
    'iso': "--time-style=iso",
    'locale': "--time-style=locale"
  };
  quotingStyleSelectorOption = {
    'literal': "--quoting-style=literal",
    'locale': "--quoting-style=locale",
    'shell': "--quoting-style=shell",
    'shell-always': "--quoting-style=shell-always",
    'c': "--quoting-style=c",
    'escape': "--quoting-style=escape"
  };
  showSelectorOption = {
    'default': null,
    all: 'a',
    almostAll: 'A'
  };
  selectorOptions = {
    sort: sortSelectorOption,
    format: formatSelectorOption,
    "indicator style": indicatorStyleSelectorOption,
    "time style": timeStyleSelectorOption,
    "quoting style": quotingStyleSelectorOption,
    show: showSelectorOption
  };
  exports.VisualSelectorOptions = {
    sort: (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = sortSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }()),
    format: (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = formatSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }()),
    "indicator style": (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = indicatorStyleSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }()),
    "time style": (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = timeStyleSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }()),
    "quoting style": (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = quotingStyleSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }()),
    show: (function(){
      var i$, ref$, results$ = [];
      for (i$ in ref$ = showSelector) {
        value = ref$[i$];
        results$.push(value);
      }
      return results$;
    }())
  };
  flags = {
    'reverse': 'reverse',
    'context': 'context',
    'inode': 'inode',
    humanReadable: "human readable",
    ignoreBackups: "ignore backups",
    noPrintOwner: "do not list owner",
    noPrintGroup: "do not list group",
    numericId: "numeric ID"
  };
  flagOptions = {
    'reverse': 'r',
    'context': 'Z',
    "human readable": 'h',
    "ignore backups": 'B',
    "do not list owner": 'g',
    "do not list group": 'G',
    "numeric ID": 'n',
    'inode': 'i'
  };
  parameters = {
    'ignore': 'ignore'
  };
  parameterOptions = {
    'ignore': 'I'
  };
  optionsParser = {
    shortOptions: {
      a: $.select(selectors.show, showSelector.all),
      A: $.select(selectors.show, showSelector.almostAll),
      b: $.select(selectors.quotingStyle, quotingStyleSelector.escape),
      B: $.switchOn(flags.ignoreBackups),
      c: $.switchOn(),
      C: $.justAccept(),
      d: $.switchOn(),
      D: $.justAccept(),
      f: $.switchOn(),
      F: $.select(selectors.indicatorStyle, indicatorStyleSelector.classify),
      g: $.switchOn(flags.noPrintOwner),
      G: $.switchOn(flags.noPrintGroup),
      h: $.switchOn(flags.humanReadable),
      H: $.switchOn(),
      i: $.switchOn,
      I: $.setParameter('ignore'),
      k: $.switchOn(),
      l: $.select(selectors.format, formatSelector.long),
      L: $.switchOn(),
      m: $.select(selectors.format, formatSelector.commas),
      n: $.switchOn(flags.numericId),
      N: $.switchOn(),
      o: $.switchOn(),
      p: $.select(selectors.indicatorStyle, indicatorStyleSelector.slash),
      q: $.switchOn(),
      Q: $.switchOn(),
      r: $.switchOn(flags.reverse),
      R: $.switchOn(),
      s: $.switchOn(),
      S: $.select(selectors.sort, sortSelector.size),
      t: $.select(selectors.sort, sortSelector.time),
      T: $.switchOn(),
      u: $.switchOn(),
      U: $.select(selectors.sort, sortSelector.noSort),
      v: $.select(selectors.sort, sortSelector.extension),
      w: $.switchOn(),
      x: $.switchOn(),
      X: $.select(selectors.sort, sortSelector.size),
      Z: $.switchOn(flags.context),
      '1': $.switchOn()
    },
    longOptions: {
      'all': $.sameAs('a'),
      'almost-all': $.sameAs('A'),
      'escape': $.sameAs('b'),
      'directory': $.sameAs('d'),
      'classify': $.sameAs('F'),
      'no-group': $.sameAs('G'),
      'human-readable': $.sameAs('h'),
      'inode': $.sameAs('i'),
      'kibibytes': $.sameAs('k'),
      'dereference': $.sameAs('l'),
      'numeric-uid-gid': $.sameAs('n'),
      'literal': $.sameAs('N'),
      'indicator-style=slash': $.sameAs('p'),
      'hide-control-chars': $.sameAs('q'),
      'quote-name': $.sameAs('Q'),
      'reverse': $.sameAs('r'),
      'recursive': $.sameAs('R'),
      'size': $.sameAs('S'),
      'context': $.sameAs('Z')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "ls",
      flags: {
        "reverse": false,
        "do not list owner": false,
        "do not list group": false,
        "numeric ID": false,
        "inode": false,
        "human readable": false
      },
      selectors: {
        "indicator style": indicatorStyleSelector.none,
        "time style": timeStyleSelector.locale,
        "quoting style": quotingStyleSelector.literal,
        "format": formatSelector['default'],
        "sort": sortSelector.name,
        "show": showSelector['default']
      },
      parameters: {
        "ignore": ""
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions, parameterOptions);
}).call(this);

},{"./_init.js":6}],18:[function(require,module,exports){
/*

  -c, --bytes=[-]K         print the first K bytes of each file;
                             with the leading '-', print all but the last
                             K bytes of each file
  -n, --lines=[-]K         print the first K lines instead of the first 10;
                             with the leading '-', print all but the last
                             K lines of each file
  -q, --quiet, --silent    nuncar mostrar cabeçalhos com nomes de ficheiros
  -v, --verbose            mostrar sempre cabeçalhos com nomes de ficheiros

*/
(function(){
  var $, flags, parameters, parameterOptions, selectors, showHeadersSelector, showHeadersSelectorOption, selectorOptions, ref$, value, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  flags = {};
  parameters = {
    'lines': 'lines',
    'bytes': 'bytes'
  };
  parameterOptions = {
    'lines': 'n',
    'bytes': 'b'
  };
  selectors = {
    showHeaders: "show headers"
  };
  showHeadersSelector = {
    'default': 'default',
    always: 'always',
    never: 'never'
  };
  showHeadersSelectorOption = {
    'default': null,
    always: 'v',
    never: 'q'
  };
  selectorOptions = (ref$ = {}, ref$[selectors.showHeaders] = showHeadersSelectorOption, ref$);
  exports.VisualSelectorOptions = (ref$ = {}, ref$[selectors.showHeaders] = (function(){
    var i$, ref$, results$ = [];
    for (i$ in ref$ = showHeadersSelector) {
      value = ref$[i$];
      results$.push(value);
    }
    return results$;
  }()), ref$);
  flagOptions = {};
  optionsParser = {
    shortOptions: {
      q: $.select(selectors.showHeaders, showHeadersSelector.never),
      v: $.select(selectors.showHeaders, showHeadersSelector.always)
    },
    longOptions: {
      'quiet': $.sameAs('q'),
      'silent': $.sameAs('q'),
      'verbose': $.sameAs('v')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    var ref$;
    return {
      type: 'command',
      exec: 'tail',
      flags: {},
      selectors: (ref$ = {}, ref$[selectors.showHeaders] = showHeadersSelector['default'], ref$),
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions, parameterOptions);
}).call(this);

},{"./_init.js":6}],19:[function(require,module,exports){
(function(){
  var $;
  $ = require("./_init.js");
  /**
    Arranges the nodes using a hierarchical layout
  */
  function arrangeLayout(previousCommand, boundaries){
    var maxX, minY, prevBound, components, i$, len$, boundary, x, y;
    maxX = 0;
    minY = previousCommand.position.y - (boundaries.length - 1) * 250;
    if (minY < 0) {
      previousCommand.position.y -= minY;
      minY = 0;
    }
    prevBound = null;
    components = [];
    for (i$ = 0, len$ = boundaries.length; i$ < len$; ++i$) {
      boundary = boundaries[i$];
      $.translateBoundary(boundary, previousCommand.position.x + 500, prevBound ? prevBound.bottom - boundary.top : minY);
      prevBound = boundary;
      components = components.concat(boundary.components);
    }
    x = (function(){
      switch (boundaries.length) {
      case 0:
        return 0;
      default:
        return maxX + 500;
      }
    }());
    return y = (function(){
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
  function connector(parser, previousCommand, result, boundaries, tracker){
    return function(commandList){
      var subresult, i$, ref$, len$, sub;
      subresult = parser.parseAST(commandList, tracker);
      boundaries.push($.getBoundaries(subresult.components));
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
  exports.parseCommand = function(argsNode, parser, tracker, previousCommand, nextcommands, firstMainComponent, components, connections){
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
}).call(this);

},{"./_init.js":6}],20:[function(require,module,exports){
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
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, defaultComponentData, join$ = [].join;
  $ = require("./_init.js");
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
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData, {
    string: function(component, str){
      var set1, set2;
      if (set1 === "") {
        set1 = str;
      } else {
        set2 = str;
      }
    }
  });
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions, null, function(component, exec, flags, files){
    var set1, set2;
    set1 = component.set1, set2 = component.set2;
    return join$.call(exec.concat(flags, set1, set2), ' ');
  });
}).call(this);

},{"./_init.js":6}],21:[function(require,module,exports){
/*

  -c, --stdout      write on standard output, keep original files unchanged
  -d, --decompress  decompress
  -f, --force       force overwrite of output file and compress links
  -h, --help        give this help
  -k, --keep        keep (don't delete) input files
  -l, --list        list compressed file contents
  -n, --no-name     do not save or restore the original name and time stamp
  -N, --name        save or restore the original name and time stamp
  -q, --quiet       suppress all warnings
  -r, --recursive   operate recursively on directories
  -S, --suffix=SUF  use suffix SUF on compressed files                                        
  -t, --test        test compressed file integrity                                            
  -v, --verbose     verbose mode                                                                

*/
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    quiet: 'quiet',
    verbose: 'verbose',
    recursive: 'recursive'
  };
  selectorOptions = {};
  exports.VisualSelectorOptions = {};
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'quiet': 'q',
    'verbose': 'v',
    'recursive': 'r'
  };
  optionsParser = {
    shortOptions: {
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose)
    },
    longOptions: {
      'keep': $.sameAs('k'),
      'force': $.sameAs('f'),
      'test': $.sameAs('t'),
      'quiet': $.sameAs('q'),
      'verbose': $.sameAs('v')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "zcat",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "quiet": false,
        "verbose": false,
        "recursive": false
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);

},{"./_init.js":6}],22:[function(require,module,exports){
(function(){
  var parser, astBuilder, parserCommand, implementedCommands, res$, key, VisualSelectorOptions, isImplemented, indexComponents, createMacro, join$ = [].join;
  parser = {};
  astBuilder = require('./ast-builder/ast-builder');
  parserCommand = {
    awk: require('./commands/awk'),
    cat: require('./commands/cat'),
    ls: require('./commands/ls'),
    grep: require('./commands/grep'),
    bunzip2: require('./commands/bunzip2'),
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
  res$ = [];
  for (key in parserCommand) {
    if (key !== 'tee') {
      res$.push(key);
    }
  }
  implementedCommands = res$;
  VisualSelectorOptions = {
    cat: parserCommand.cat.VisualSelectorOptions,
    grep: parserCommand.grep.VisualSelectorOptions,
    ls: parserCommand.ls.VisualSelectorOptions,
    bunzip2: parserCommand.gzip.VisualSelectorOptions,
    bzcat: parserCommand.gzip.VisualSelectorOptions,
    bzip2: parserCommand.gzip.VisualSelectorOptions,
    gzip: parserCommand.gzip.VisualSelectorOptions,
    gunzip: parserCommand.gzip.VisualSelectorOptions,
    zcat: parserCommand.gzip.VisualSelectorOptions,
    head: parserCommand.head.VisualSelectorOptions,
    tail: parserCommand.tail.VisualSelectorOptions,
    compress: parserCommand.compress.VisualSelectorOptions
  };
  function getPositionBoundaries(components){
    var xs, ys, xe, ye, i$, len$, component, position, px, py, xy;
    xs = components[0].position.x;
    ys = components[0].position.y;
    xe = xs;
    ye = ye;
    for (i$ = 0, len$ = components.length; i$ < len$; ++i$) {
      component = components[i$];
      position = component.position;
      px = position.x;
      py = position.y;
      if (px < xs) {
        xs = px;
      }
      if (px < xy) {
        xy = py;
      }
      if (px > xe) {
        xe = px;
      }
      if (px > xe) {
        xe = py;
      }
    }
    return {
      xs: xs,
      ys: ys,
      xe: xe,
      ye: ye
    };
  }
  isImplemented = function(command){
    return parserCommand.command != null;
  };
  /**
   * Parses the syntax of the command and
   * transforms into an Abstract Syntax Tree
   * @param command command
   * @return the resulting AST
   */
  function generateAST(command){
    return astBuilder.parse(command);
  }
  /**
   * Parses the Abstract Syntax Tree
   * and transforms it to a graph representation format
   * that can be used in the visual application
   *
   * @param ast - the Abstract Syntax Tree
   * @param tracker - and tracker the tracks the id of a component
   * @returns the visual representation of the object
   */
  function parseAST(ast, tracker){
    var components, connections, LastCommandComponent, CommandComponent, i$, len$, index, commandNode, exec, args, nodeParser, result_aux, result, comp, firstMainComponent;
    components = [];
    connections = [];
    ({
      firstMainComponent: null
    });
    LastCommandComponent = null;
    CommandComponent = null;
    tracker == null && (tracker = {
      id: 0,
      x: 0,
      y: 0
    });
    for (i$ = 0, len$ = ast.length; i$ < len$; ++i$) {
      index = i$;
      commandNode = ast[i$];
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
  /**
   * parses the command
   */
  function parseCommand(command){
    return parseAST(generateAST(command));
  }
  /**
   * Creates an index of the components
   */
  indexComponents = function(visualData){
    var i$, ref$, len$, comp, results$ = {};
    for (i$ = 0, len$ = (ref$ = visualData.components).length; i$ < len$; ++i$) {
      comp = ref$[i$];
      results$[comp.id] = comp;
    }
    return results$;
  };
  function parseVisualData(VisualData){
    var indexedComponentList, initialComponent;
    if (VisualData.components.length < 1) {
      return '';
    }
    indexedComponentList = indexComponents(VisualData);
    initialComponent = indexedComponentList[VisualData.firstMainComponent];
    if (initialComponent === null) {
      return;
    }
    return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
  }
  function parseComponent(component, visualData, componentIndex, mapOfParsedComponents){
    switch (component.type) {
    case 'command':
      return parserCommand[component.exec].parseComponent(component, visualData, componentIndex, mapOfParsedComponents, parseVisualDatafromComponent);
    case 'subgraph':
      return '';
    default:
      return '';
    }
  }
  function parseVisualDatafromComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents){
    var commands, isFirst, i$, ref$, len$, connection, outputs, res$, endNodeId, j$, ref1$, len1$, component, endNode, nextcommands, comm, to$, i;
    commands = [];
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
    } while (isFirst = false);
    commands.push(parseComponent(currentComponent, visualData, componentIndex, mapOfParsedComponents));
    res$ = [];
    for (i$ = 0, len$ = (ref$ = visualData.connections).length; i$ < len$; ++i$) {
      connection = ref$[i$];
      if (connection.startNode === currentComponent.id && connection.startPort === 'output' && mapOfParsedComponents[connection.endNode] !== true) {
        endNodeId = connection.endNode;
        for (j$ = 0, len1$ = (ref1$ = visualData.components).length; j$ < len1$; ++j$) {
          component = ref1$[j$];
          if (component.id === endNodeId) {
            endNode = component;
            break;
          }
        }
        res$.push(endNode);
      }
    }
    outputs = res$;
    res$ = [];
    for (i$ = 0, len$ = outputs.length; i$ < len$; ++i$) {
      component = outputs[i$];
      res$.push(parseVisualDatafromComponent(component, visualData, componentIndex, mapOfParsedComponents));
    }
    nextcommands = res$;
    if (nextcommands.length > 1) {
      comm = "tee";
      for (i$ = 0, to$ = nextcommands.length - 2; i$ <= to$; ++i$) {
        i = i$;
        comm += " >(" + nextcommands[i] + ")";
      }
      commands.push(comm);
      commands.push(nextcommands[nextcommands.length - 1]);
    } else if (nextcommands.length === 1) {
      commands.push(nextcommands[0]);
    }
    return join$.call(commands, " | ");
  }
  createMacro = function(name, description, fromMacro){
    var x$, macroData;
    if (fromMacro) {
      x$ = macroData = JSON.parse(JSON.stringify(fromMacro));
      x$.name = name;
      x$.description = description;
      return x$;
    } else {
      return macroData = {
        name: name,
        description: description,
        entryComponent: null,
        exitComponent: null,
        counter: 0,
        components: [],
        connections: []
      };
    }
  };
  function compileMacro(macro){
    var indexedComponentList, initialComponent;
    if (macro.entryComponent === null) {
      throw "no component defined as Macro Entry";
    }
    if (macro.exitComponent === null) {
      throw "no component defined as Macro Exit";
    }
    indexedComponentList = indexComponents(macro);
    initialComponent = indexedComponentList[macro.entryComponent];
    return parseVisualDatafromComponent(initialComponent, VisualData, indexedComponentList, {});
  }
  parser.generateAST = generateAST;
  parser.parseAST = parseAST;
  parser.astBuilder = astBuilder;
  parser.parseCommand = parseCommand;
  parser.parseComponent = parseComponent;
  parser.implementedCommands = implementedCommands;
  parser.parseVisualData = parseVisualData;
  exports.generateAST = generateAST;
  exports.parseAST = parseAST;
  exports.astBuilder = astBuilder;
  exports.parseCommand = parseCommand;
  exports.parseComponent = parseComponent;
  exports.implementedCommands = implementedCommands;
  exports.parseVisualData = parseVisualData;
  exports.createMacro = createMacro;
  exports.VisualSelectorOptions = VisualSelectorOptions;
}).call(this);

},{"./ast-builder/ast-builder":4,"./commands/awk":7,"./commands/bunzip2":8,"./commands/bzcat":9,"./commands/bzip2":10,"./commands/cat":11,"./commands/compress":12,"./commands/grep":13,"./commands/gunzip":14,"./commands/gzip":15,"./commands/head":16,"./commands/ls":17,"./commands/tail":18,"./commands/tee":19,"./commands/tr":20,"./commands/zcat":21}],23:[function(require,module,exports){
shellParser = require("./parser.js");
},{"./parser.js":22}],24:[function(require,module,exports){
/**
ComponentConnections

this class saves the connections to the component
while its ID is not yet identified

*/
(function(){
  var ComponentConnections;
  module.exports = ComponentConnections = (function(){
    ComponentConnections.displayName = 'ComponentConnections';
    var prototype = ComponentConnections.prototype, constructor = ComponentConnections;
    function ComponentConnections(component){
      this.component = component;
      this.connectionsToInput = [];
      this.connectionsFromOutput = [];
    }
    prototype.addConnectionToInputPort = function(port, otherNode){
      this.connectionsToInput.push({
        startNode: otherNode.id,
        startPort: otherNode.port,
        endPort: port
      });
    };
    prototype.addConnectionFromPort = function(port, otherNode){
      this.connectionsFromOutput.push({
        startPort: port,
        endNode: otherNode.id,
        endPort: otherNode.port
      });
    };
    prototype.addConnectionFromOutputPort = function(otherNode){
      this.addConnectionFromPort('output', otherNode);
    };
    prototype.addConnectionFromErrorPort = function(otherNode){
      this.addConnectionFromPort('error', otherNode);
    };
    prototype.addConnectionFromReturnCodePort = function(otherNode){
      this.addConnectionFromPort('retcode', otherNode);
    };
    prototype.toConnectionList = function(){
      var id, connections, res$, i$, ref$, len$, x;
      id = this.component.id;
      res$ = [];
      for (i$ = 0, len$ = (ref$ = this.connectionsFromOutput).length; i$ < len$; ++i$) {
        x = ref$[i$];
        res$.push((x.startNode = id, x));
      }
      connections = res$;
      connections = connections.concat((function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = this.connectionsToInput).length; i$ < len$; ++i$) {
          x = ref$[i$];
          results$.push((x.endNode = id, x));
        }
        return results$;
      }.call(this)));
      return connections;
    };
    return ComponentConnections;
  }());
}).call(this);

},{}],25:[function(require,module,exports){
(function(){
  var Iterator, parseShortOptions, parseLongOptions, switchOn, setParameter, select, selectParameter, selectIfUnselected, sameAs, slice$ = [].slice;
  Iterator = (function(){
    Iterator.displayName = 'Iterator';
    var prototype = Iterator.prototype, constructor = Iterator;
    function Iterator(ArgList){
      this.index = 0;
      this.argList = ArgList;
      this.length = ArgList.length;
      this.current = ArgList[0];
    }
    prototype.hasNext = function(){
      return this.index !== this.length;
    };
    prototype.next = function(){
      return this.current = this.argList[this.index++];
    };
    prototype.rest = function(){
      return this.argList.slice(this.index);
    };
    return Iterator;
  }());
  parseShortOptions = function(options, componentData, argsNodeIterator){
    var shortOptions, iter, option, arg, results$ = [];
    shortOptions = options.shortOptions;
    iter = new Iterator(argsNodeIterator.current.slice(1));
    while (option = iter.next()) {
      arg = shortOptions[option];
      if (arg && arg(componentData, argsNodeIterator, iter)) {
        break;
      }
    }
    return results$;
  };
  parseLongOptions = function(options, componentData, argsNodeIterator){
    var longOptions, optionStr, indexOfSep, x$, iter, optionKey, arg;
    longOptions = options.longOptions;
    optionStr = argsNodeIterator.current.slice(2);
    indexOfSep = optionStr.indexOf('=');
    if (indexOfSep > -1) {
      x$ = iter = new Iterator(optionStr);
      x$.index = indexOfSep + 1;
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
  /**
    enables flags (flags)
    @returns a boolean indicating 
    that the rest of the argument was used 
  */
  switchOn = function(){
    var flags;
    flags = slice$.call(arguments);
    return function(Component){
      var i$, ref$, len$, flag;
      for (i$ = 0, len$ = (ref$ = flags).length; i$ < len$; ++i$) {
        flag = ref$[i$];
        Component.flags[flag] = true;
      }
      return false;
    };
  };
  /**
    set parameter (param)
    @returns a boolean indicating 
    that the rest of the argument was used 
  */
  setParameter = function(param){
    var paramFn, x$;
    paramFn = function(Component, state, substate){
      var hasNext, parameter;
      hasNext = substate.hasNext();
      parameter = hasNext
        ? substate.rest()
        : state.next();
      Component.parameters[param] = parameter;
      return true;
    };
    x$ = paramFn;
    x$.ptype = 'param';
    x$.param = param;
    return x$;
  };
  /**
    set the selector _key_ with the value _value_
  */
  select = function(key, value){
    return function(Component){
      Component.selectors[key] = value;
    };
  };
  selectParameter = function(key, value){
    var paramFn, x$;
    paramFn = function(Component, state, substate){
      var parameselectParameterter;
      parameselectParameterter = substate.hasNext()
        ? substate.rest()
        : state.next();
      Component.selectors[key] = [value, parameter];
      return true;
    };
    x$ = paramFn;
    x$.ptype = 'param';
    x$.param = param;
    return x$;
  };
  selectIfUnselected = function(key, value){
    var selections;
    selections = slice$.call(arguments, 2);
    return function(Component){
      var selectorValue, i$, ref$, len$, selection;
      selectorValue = Component.selectors[key];
      for (i$ = 0, len$ = (ref$ = selections).length; i$ < len$; ++i$) {
        selection = ref$[i$];
        if (selectorValue === selection) {
          return false;
        }
      }
      Component.selectors[key] = value;
    };
  };
  sameAs = function(option){
    return ['same', option];
  };
  exports.parseShortOptions = parseShortOptions;
  exports.parseLongOptions = parseLongOptions;
  exports.switchOn = switchOn;
  exports.setParameter = setParameter;
  exports.select = select;
  exports.selectParameter = selectParameter;
  exports.selectIfUnselected = selectIfUnselected;
  exports.sameAs = sameAs;
}).call(this);

},{}]},{},[23])