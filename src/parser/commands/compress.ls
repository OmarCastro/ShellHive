
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

$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init")

flags = {
  force : \force
  decompress: \decompress
  stdout : \stdout
  statistics: \statistics
  \recursive
}

const flagOptions = {
  \force : \f
  \decompress : \d
  \stdout : \c
  \statistics : \v
  \recursive : \r
}

const selectorOptions = {}
exports.VisualSelectorOptions = {}

$.setblocksize = (size) -> (Component) ->
    Component.block-size = size

optionsParser = 
  shortOptions:
    d  :  $.switchOn flags.decompress
    f  :  $.switchOn flags.force
    c  :  $.switchOn flags.stdout
    v  :  $.switchOn flags.statistics
    r  :  $.switchOn flags.recursive

$.generate(optionsParser)


defaultComponentData = ->
  type:\command
  exec:"compress",
  flags:{-"decompress",-"force",-"stdout",-"statistics",-"recursive"}
  files: []


exports.parseCommand = common.commonParseCommand(optionsParser,defaultComponentData)
exports.parseComponent = common.commonParseComponent(flagOptions,selectorOptions)

