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
