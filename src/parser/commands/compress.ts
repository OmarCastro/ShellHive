import {parserModule, $, CommandComponent, common, sanitizer}  from "./_common.imports";

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

var flags = {
  // keep: {
  //   name: "keep files",
  //   option: 'k',
  //   description: "keep (don't delete) input files",
  //   active: false
  // },
  force:{
    name: "force",
    option: 'f',
    description: "overwrite existing output files",
    active: false
  },
  decompress:{
    name: "decompress",
    option: 'd',
    description: "decompress instead of compress",
    active: false
  },
  stdout: {
    name: "stdout",
    option: 'c',
    description: "output to standard out",
    active: false
  },
  // quiet: {
  //   name: "quiet",
  //   option: 'q',
  //   longOption: 'quiet',
  //   description: "suppress noncritical error messages",
  //   active: false
  // },
  statistics:{
    name: "statistics",
    option: 'v',
    description: "overwrite existing output files",    
    active: false
  },
  recursive:{
    name: "recursive",
    option: 'r',
    description: "Recursive. If a filename is a directory, descend",    
    active: false
  },
}


var config:parserModule.Config = {
  flags:flags
}



var gzipData = new parserModule.ParserData(config);
var optionsParser = $.optionParserFromConfig(config)

export class CompressComponent extends CommandComponent {
  public exec:string = "compress"
  public files: any[] = []
}


function defaultComponentData(){
  var component = new CompressComponent();
  component.selectors = gzipData.componentSelectors
  component.flags = gzipData.componentFlags
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(gzipData.flagOptions, gzipData.selectorOptions);
export var VisualSelectorOptions = gzipData.visualSelectorOptions;
export var componentClass = CompressComponent
