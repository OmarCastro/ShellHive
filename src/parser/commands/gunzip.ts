import {ParserData, Config, $, CommandComponent, common, sanitizer}  from "./_common.imports";


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


var config:Config = {
  flags:flags
}


var optionsParser = $.optionParserFromConfig(config)
var gunzipData = new ParserData(config);

;

export class GunzipComponent extends CommandComponent {
  public exec:string = "gunzip"
  public files: any[] = []
}


function defaultComponentData(){
  var component = new GunzipComponent();
  component.selectors = gunzipData.componentSelectors
  component.flags = gunzipData.componentFlags
  return component;
};
export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(gunzipData.flagOptions, gunzipData.selectorOptions);
export var VisualSelectorOptions = gunzipData.visualSelectorOptions;
export var componentClass = GunzipComponent
