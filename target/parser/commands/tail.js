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
