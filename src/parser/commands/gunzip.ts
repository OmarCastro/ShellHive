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

import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("./_init");



var flags = {
  keep: {
    name: "keep files",
    option: 'k',
    description: "keep (don't delete) input files",
    active: false
  },
  force:{
    name: "force",
    option: 'f',
    description: "overwrite existing output files",
    active: false
  },
  quiet: {
    name: "quiet",
    option: 'q',
    description: "suppress noncritical error messages",
    active: false
  },
  verbose:{
    name: "verbose",
    option: 'v',
    description: "overwrite existing output files",    
    active: false
  },
  recursive:{
    name: "recursive",
    option: 'v',
    description: "overwrite existing output files",    
    active: false
  },
}


var config:parserModule.Config = {
  flags:flags
}



var bzipData = new parserModule.ParserData(config);



var shortOptions = {
  k: $.switchOn(flags.keep),
  f: $.switchOn(flags.force),
  q: $.switchOn(flags.quiet),
  v: $.switchOn(flags.verbose),
  r: $.switchOn(flags.recursive)
}

var longOptions = {
  'keep': $.sameAs('k'),
  'force': $.sameAs('f'),
  'test': $.sameAs('t'),
  'quiet': $.sameAs('q'),
  'verbose': $.sameAs('v'),
}



var optionsParser = {
  shortOptions: shortOptions,
  longOptions: longOptions
};


$.generate(optionsParser);

function defaultComponentData(){
  return {
    type: 'command',
    exec: "gunzip",
    flags: bzipData.componentFlags,
    selectors: bzipData.componentSelectors,
    files: []
  };
};
export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions);
export var VisualSelectorOptions = bzipData.visualSelectorOptions;
