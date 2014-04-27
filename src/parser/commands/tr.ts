
import $ = require("../utils/optionsParser");
import GraphModule = require("../../common/graph");
import parserModule = require("../utils/parserData");
import common = require("./_init");




var flags = {
  complement: {
    name: "complement",
    option: 'c',
    longOption: 'show-tabs',
    description: "use SET1 complemet",
    active: false
  },
  delete:{
    name: "delete",
    option: 'd',
    longOption: 'delete',
    description: "delete characters in SET1, do not translate",
    active: false
  },
  squeeze:{
    name: "squeeze repeats",
    option: 's',
    longOption: 'squeeze-repeats',
    description: "replace each input sequence of a repeated character that is  listed  in  SET1 with a single occurrence of that character",
    active: false
  },
  truncate: {
    name: "truncate set1",
    option: 't',
    longOption: 'truncate-set1',
    description: "suppress repeated empty output lines",
    active: false
  },
}

var config:parserModule.Config = {
  flags:flags
}



var bzipData = new parserModule.ParserData(config);


var optionsParser = $.optionParserFromConfig(config);

var shortOptions = optionsParser.shortOptions
shortOptions['C'] = $.switchOn(flags.complement);


export class TrComponent extends GraphModule.CommandComponent {
  public exec:string = "tr"
  public set1:string = ""
  public set2:string = ""
}


function defaultComponentData(){
  var component = new TrComponent();
  component.selectors = bzipData.componentSelectors
  component.flags = bzipData.componentFlags
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData,{
    string: (component, str)=>{
        if(component.set1 == ""){component.set1 = str} else{component.set2 = str};
    }
  });
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions, bzipData.parameterOptions,
  (component,exec,flags,files) => {    
    return exec.concat(flags, component.set1, component.set2).join(' ');
  }

  );
export var VisualSelectorOptions = bzipData.visualSelectorOptions;
export var componentClass = TrComponent
