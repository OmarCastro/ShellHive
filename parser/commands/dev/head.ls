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


$ = require("./_init.js");

flags = {}

parameters = {
  \lines
  \bytes
}

parameterOptions = {
  \lines : \n
  \bytes : \b
}

const selectors =
  showHeaders : "show headers"

const showHeadersSelector = 
  default:\default
  always: \always
  never: \never

const showHeadersSelectorOption =
  default: null
  always: \v
  never: \q

const selectorOptions = 
  (selectors.showHeaders): showHeadersSelectorOption

exports.VisualSelectorOptions =
  (selectors.showHeaders): [value for ,value of showHeadersSelector]

const flagOptions = {}


optionsParser = 
  shortOptions:
    q  :  $.select selectors.showHeaders, showHeadersSelector.never
    v  :  $.select selectors.showHeaders, showHeadersSelector.always
  longOptions:
    \quiet :   $.sameAs \q
    \silent :  $.sameAs \q
    \verbose : $.sameAs \v


$.generate(optionsParser)


defaultComponentData = ->
  type:\command
  exec: \head,
  flags:{}
  selectors:
    (selectors.showHeaders): showHeadersSelector.default
  files:[]


exports.parseCommand   = $.commonParseCommand(optionsParser,defaultComponentData)

exports.parseComponent = $.commonParseComponent flagOptions,selectorOptions, parameterOptions