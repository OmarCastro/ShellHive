import {ParserData, Config, $, CommandComponent, common, sanitizer}  from "./_common.imports";

var parameters = {
    set1:{
      name:'set1',
      option: null,
      type: "string",
      description:"URL of the application",
      defaultValue: ""
    },
    set2:{
      name:'set2',
      option: null,
      type: "numeric parameter",
      description:"Maximum  time  in  seconds that you allow the whole operation to take",
      defaultValue: ""
    }
}

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

var config:Config = {
  flags:flags,
  parameters: parameters
}



var bzipData = new ParserData(config);


var optionsParser = $.optionParserFromConfig(config);

var shortOptions = optionsParser.shortOptions
shortOptions['C'] = $.switchOn(flags.complement);


export class TrComponent extends CommandComponent {
  public exec:string = "tr"
}


function defaultComponentData(){
  var component = new TrComponent();
  component.selectors = bzipData.componentSelectors
  component.parameters = bzipData.componentParameters
  component.flags = bzipData.componentFlags
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData,{
    string: (component, str)=>{
        if(component.parameters.set1 == ""){component.parameters.set1 = str} else{component.parameters.set2 = str};
    }
  });
export var parseComponent = common.commonParseComponent(bzipData.flagOptions, bzipData.selectorOptions, bzipData.parameterOptions);
export var VisualSelectorOptions = bzipData.visualSelectorOptions;
export var componentClass = TrComponent
