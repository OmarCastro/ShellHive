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
var $, parserModule, common, flags, flagOptions, selectorOptions, optionsParser, defaultComponentData;
$ = require("../utils/optionsParser");
parserModule = require("../utils/parserData");
common = require("./_init");
flags = {
  force: 'force',
  decompress: 'decompress',
  stdout: 'stdout',
  statistics: 'statistics',
  'recursive': 'recursive'
};
flagOptions = {
  'force': 'f',
  'decompress': 'd',
  'stdout': 'c',
  'statistics': 'v',
  'recursive': 'r'
};
selectorOptions = {};
exports.VisualSelectorOptions = {};
$.setblocksize = function(size){
  return function(Component){
    return Component.blockSize = size;
  };
};
optionsParser = {
  shortOptions: {
    d: $.switchOn(flags.decompress),
    f: $.switchOn(flags.force),
    c: $.switchOn(flags.stdout),
    v: $.switchOn(flags.statistics),
    r: $.switchOn(flags.recursive)
  }
};
$.generate(optionsParser);
defaultComponentData = function(){
  return {
    type: 'command',
    exec: "compress",
    flags: {
      "decompress": false,
      "force": false,
      "stdout": false,
      "statistics": false,
      "recursive": false
    },
    files: []
  };
};
exports.parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
exports.parseComponent = common.commonParseComponent(flagOptions, selectorOptions);