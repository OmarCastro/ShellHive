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
