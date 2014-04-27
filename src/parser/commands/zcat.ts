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
import GraphModule = require("../../common/graph");

var flags = {
  keep: {
    name: "keep files",
    option: 'k',
    longOption: 'keep',
    description: "keep (don't delete) input files",
    active: false
  },
  force:{
    name: "force",
    option: 'f',
    longOption: 'force',
    description: "overwrite existing output files",
    active: false
  },
  quiet: {
    name: "quiet",
    option: 'q',
    longOption: 'quiet',
    description: "suppress noncritical error messages",
    active: false
  },
  verbose:{
    name: "verbose",
    option: 'v',
    longOption: 'verbose',
    description: "overwrite existing output files",    
    active: false
  },
  recursive:{
    name: "recursive",
    longOption: 'recursive',
    option: 'v',
    description: "overwrite existing output files",    
    active: false
  }
}

var config:parserModule.Config = {
  flags:flags
}

var optionsParser = $.optionParserFromConfig(config)
var zcatData = new parserModule.ParserData(config);

export class ZcatComponent extends GraphModule.CommandComponent {
  public exec:string = "zcat"
  public files: any[] = []
}


function defaultComponentData(){
  var component = new ZcatComponent();
  component.selectors = zcatData.componentSelectors
  component.flags = zcatData.componentFlags
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(zcatData.flagOptions, zcatData.selectorOptions);
export var VisualSelectorOptions = zcatData.visualSelectorOptions;
export var componentClass = ZcatComponent
