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

$ = require("./_init.js");


selectors = {
  \patternType 
  \match
}

# PATTERN TYPE SELECTORS

const patternTypeSelector =
  extendedRegex: "extended regexp"
  fixedStrings:  "fixed strings"
  basicRegex:    "basic regexp"
  perlRegex:     "perl regexp"

const patternTypeSelectorOption =
  (patternTypeSelector.extendedRegex): \E
  (patternTypeSelector.fixedStrings) : \F
  (patternTypeSelector.basicRegex)   : null
  (patternTypeSelector.perlRegex)    : \P





const matchSelector =
  default:    "default"
  wholeLine:  "whole line"
  wholeWord:  "whole word"

const matchSelectorOption =
  (matchSelector.default)  : null
  (matchSelector.wholeLine): \x
  (matchSelector.wholeWord): \w


SelectorOptions = 
  (selectors.patternType): patternTypeSelectorOption
  (selectors.match)      : matchSelectorOption


exports.VisualSelectorOptions =
  (selectors.patternType): [value for ,value of patternTypeSelector]
  (selectors.match)      : [value for ,value of matchSelector]


const flags = 
  ignore-case : "ignore case"
  invert-match : "invert match"

const flagOptions =
  "ignore case": \i
  "invert match": \v


optionsParser = 
  shortOptions:
    E  :  $.select  selectors.patternType, patternTypeSelector.extendedRegex
    F  :  $.select  selectors.patternType, patternTypeSelector.fixedStrings
    G  :  $.select  selectors.patternType, patternTypeSelector.basicRegex
    i  :  $.switchOn flags.ignore-case
    P  :  $.select  selectors.patternType, patternTypeSelector.perlRegex
    v  :  $.switchOn flags.invert-match
    x  :  $.select selectors.match, matchSelector.wholeLine
    w  :  $.selectIfUnselected selectors.match, matchSelector.wholeWord, matchSelector.wholeLine
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
  exec:"grep",
  flags:{-"ignore case",-"invert match"}
  selectors:
    (selectors.patternType): patternTypeSelector.basicRegex
    (selectors.match):       matchSelector.default
  pattern: null
  files:[]




exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData,{
    string: (component, str) ->
      if component.pattern is null
        component.pattern = str
      else
        component.files.push(str)
    })

exports.parseComponent = (componentData,visualData,componentIndex,mapOfParsedComponents,parseComponent) ->
  exec  = ["grep"]
  mapOfParsedComponents[componentData.id] = true
  flags = [flagOptions[key] for key, value of componentData.flags when value is true]

  for key, value of componentData.selectors
    flags.push that if SelectorOptions[key][value]?

  pattern = componentData.pattern
  if pattern 
    if pattern.indexOf(" ") >= 0
      pattern = "\"#pattern\""
  else
   pattern = "\"\"";

  flags = "-" + flags * '' if flags.length > 0
  files = for file in componentData.files
    if file instanceof Array
      subCommand = parseComponent(componentIndex[file.1],visualData,componentIndex,mapOfParsedComponents)
      "<(#subCommand)"
    else if file.indexOf(" ") >= 0 then "\"#file\"" else file
  (exec ++ flags ++ pattern ++ files) * ' '