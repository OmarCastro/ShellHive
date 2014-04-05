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

$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");



val = $.generateSelectors({
  \patternType :
    "extended regexp" : \E
    "fixed strings" : \F
    "basic regexp" : null 
    #"perl regexp": \P
  \match :
    \default : null
    "whole line" : \x
    "whole word" : \w

});

selectors = val.selectors
selectorOptions = val.selectorOptions
patternTypeSelector = val.selectorType['patternType']
patternTypeSelectorOption = selectorOptions['patternType']
matchSelector = val.selectorType['match']
matchSelectorOption = selectorOptions['match']
exports.VisualSelectorOptions = val.VisualSelectorOptions

const flags = 
  ignore-case : "ignore case"
  invert-match : "invert match"

const flagOptions =
  "ignore case": \i
  "invert match": \v


optionsParser = 
  shortOptions:
    E  :  $.select  selectors.patternType, "extended regexp"
    F  :  $.select  selectors.patternType, "fixed strings"
    G  :  $.select  selectors.patternType, "basic regexp"
    i  :  $.switchOn flags.ignore-case
    #P  :  $.select  selectors.patternType, patternTypeSelector.perlRegex
    v  :  $.switchOn flags.invert-match
    x  :  $.select selectors.match, "whole line"
    w  :  $.selectIfUnselected selectors.match, "whole word", "whole line"
    y  :  $.switchOn flags.ignore-case
  longOptions:
    \extended-regexp : $.sameAs \E
    \fixed-strings :   $.sameAs \F
    \basic-regexp :    $.sameAs \G
    \perl-regexp :     $.sameAs \P
    \ignore-case :     $.sameAs \i
    \invert-match :    $.sameAs \v
    \word-regexp :     $.sameAs \w
    \line-regexp :     $.sameAs \x

$.generate(optionsParser)

  

defaultComponentData = ->
  type:\command
  exec:"grep",
  flags:{-"ignore case",-"invert match"}
  selectors:
    \patternType : patternTypeSelector.basicRegex
    \match :       matchSelector.default
  pattern: null
  files:[]




exports.parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) ->
      if component.pattern is null
        component.pattern = str
      else
        component.files.push(str)
    })

exports.parseComponent = common.commonParseComponent flagOptions,selectorOptions, null, (component,exec,flags,files) ->
  pattern = component.pattern
  if pattern 
    if pattern.indexOf(" ") >= 0
      pattern = "\"#pattern\""
  else
    pattern = "\"\"";
  (exec ++ flags ++ pattern ++ files) * ' '