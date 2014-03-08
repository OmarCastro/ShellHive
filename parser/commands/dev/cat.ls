$ = require("./_init.js");

const selectors =
  lineNum : "line number"

const lineNumberSelector = 
  none:"do not print"
  all:"print all lines"
  nonEmpty:"print non-empty lines"

const lineNumberSelectorOption =
  "do not print": null
  "print all lines": \n
  "print non-empty lines":\b 


const selectorsOptions =
  (selectors.lineNum): lineNumberSelectorOption

exports.VisualSelectorOptions =
  (selectors.lineNum): [value for ,value of lineNumberSelector]

const flags =
  tabs:"show tabs"
  ends:"show ends"
  nonPrint:"show non-printing"
  sblanks:"squeeze blanks"

const flagOptions =
  "show non-printing": \v
  "show tabs": \T,
  "show ends": \E,
  "squeeze blanks": \s





const optionsParser = 
  shortOptions:
    A: $.switchOn(flags.nonPrint,flags.tabs,flags.ends)
    e: $.switchOn(flags.nonPrint,flags.ends)
    T: $.switchOn(flags.tabs)
    v: $.switchOn(flags.nonPrint)
    E: $.switchOn(flags.ends)
    s: $.switchOn(flags.sblanks)
    t: $.switchOn(flags.nonPrint,flags.tabs)
    b: $.select(selectors.lineNum,lineNumberSelector.nonEmpty)
    n: $.selectIfUnselected(selectors.lineNum,lineNumberSelector.all,lineNumberSelector.nonEmpty)
  longOptions:
    "show-all":         $.sameAs \A
    "number-nonblank":  $.sameAs \b
    "show-ends":        $.sameAs \E
    "number":           $.sameAs \n
    "squeeze-blank":    $.sameAs \s
    "show-tabs":        $.sameAs \T
    "show-nonprinting": $.sameAs \v


$.generate(optionsParser)

defaultComponentData = ->
  exec:"cat"
  flags:
    "show non-printing":false,
    "show ends":false,
    "show tabs":false,
    "squeeze blanks":false
  selectors:
    (selectors.lineNum): lineNumberSelector.none
  files:[] 

exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData)
exports.parseComponent = $.commonParseComponent(flagOptions,selectorsOptions)



