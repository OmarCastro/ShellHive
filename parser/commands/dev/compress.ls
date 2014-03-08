
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

$ = require("./_init.js");


selectors = {
  \action
}

actionSelector =
  \compress
  \decompress



flags = {
  force : \force
  stdout : \stdout
  statistics: \statistics
  \recursive
}

$.setblocksize = (size) -> (Component) ->
    Component.block-size = size

optionsParser = 
  shortOptions:
    d  :  $.select  selectors.action, actionSelector.decompress
    f  :  $.switchOn flags.force
    c  :  $.switchOn flags.stdout
    v  :  $.switchOn flags.statistics
    r  :  $.switchOn flags.recursive

$.generate(optionsParser)

  

defaultComponentData = ->
  exec:"compress",
  flags:{-"force",-"stdout",-"statistics",-"recursive"}
  selectors:
    action: actionSelector.compress
  files: []


exports.parseCommand = $.commonParseCommand(optionsParser,defaultComponentData)

