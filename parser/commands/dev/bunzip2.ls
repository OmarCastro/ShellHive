
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

$ = require("./_init.js");


selectors = {
  \action
}

actionSelector = {
  \compress
  \decompress
}

const actionSelectorOption =
  \compress : \z
  \decompress : null

flags = {
  keepFiles : "keep files"
  force : \force
  test : \test
  stdout : \stdout
  quiet: \quiet
  verbose: \verbose
  small: \small
}

const selectorOptions =
  (selectors.action): actionSelectorOption

exports.VisualSelectorOptions =
  (selectors.action): [value for ,value of actionSelector]

const flagOptions =
  "keep files": \k
  \force      : \f
  \test       : \test
  \stdout     : \c
  \quiet      : \q
  \verbose    : \v
  \small      : \s

$.setblocksize = (size) -> (Component) ->
    Component.block-size = size

optionsParser = 
  shortOptions:
    d  :  $.select  selectors.action, actionSelector.decompress
    z  :  $.select  selectors.action, actionSelector.compress
    k  :  $.switchOn flags.keepFiles
    f  :  $.switchOn flags.force
    t  :  $.switchOn flags.test
    c  :  $.switchOn flags.stdout
    q  :  $.switchOn flags.quiet
    v  :  $.switchOn flags.verbose
    s  :  $.switchOn flags.small
  longOptions:
    \decompress : $.sameAs \d
    \compress :   $.sameAs \z
    \keep :       $.sameAs \k
    \force :      $.sameAs \f
    \test :       $.sameAs \t
    \stdout :     $.sameAs \c
    \quiet :      $.sameAs \q
    \verbose :    $.sameAs \v
    \small :      $.sameAs \s
    \fast :       $.sameAs \1
    \best :       $.sameAs \9

for i from \1 to \9
  optionsParser.shortOptions[i] = $.setblocksize(i)

$.generate(optionsParser)

  

defaultComponentData = ->
  type:\command
  exec:"bunzip2",
  flags:{-"keep files",-"force",-"test",-"stdout",-"quiet",-"verbose",-"small"}
  selectors:
    action: actionSelector.decompress
  files: []


exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData)
exports.parseComponent = $.commonParseComponent(flagOptions,selectorOptions)