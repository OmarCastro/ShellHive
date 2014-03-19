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
