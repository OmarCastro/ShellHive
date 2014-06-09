import $ = require("../utils/optionsParser");
import parserModule = require("../utils/parserData");
import common = require("../utils/init");
import GraphModule = require("../../common/graph");
import SelectorInfo = parserModule.SelectorInfo;




var selectors = {
  sort:{
    name:"sort",
    description:"select attribute to sort",
    options:{
      name:{
        name:'name',
        option: null,
        type:'option',
        description:'sort entries by name',
        default: true
      },
      noSort:{
        name:"do not sort",
        option: "U",
        type:'option',
        description:'do not sort'
      },
      extension:{
        name:"extension",
        option: "X",
        type:'option',
        description:'always show headers'
      },
      size:{
        name:"size",
        option: "S",
        type:'option',
        description:'always show headers'
      },
      time:{
        name:"time",
        option: "v",
        type:'option',
        description:'always show headers'
      },
      version:{
        name:"version",
        option: "v",
        type:'option',
        description:'always show headers'
      }
    }
  },
  format:{
    name:"format",
    description:"select attribute to sort",
    options:{
      default:{
        name:'default',
        option: null,
        type:'option',
        description:'always show headers',
        default: true
      },
      commas:{
        name:"commas",
        option: "m",
        type:'option',
        description:'always show headers'
      },
      long:{
        name:"long",
        option: "l",
        type:'option',
        description:'always show headers'
      }
    }      
  },
  show:{
    name:"show",
    description:"select attribute to sort",
    options:{
      default:{
        name:'default',
        option: null,
        type:'option',
        description:'always show headers',
        default: true
      },
      all:{
        name:"all",
        option: "a",
        type:'option',
        description:'always show headers'
      },
      almostAll:{
        name:"almost all",
        option: "A",
        type:'option',
        description:'always show headers'
      },
    }      
  },
  indicatorStyle:{
    name:"indicator style",
    description:"select attribute to sort",
    options:{
      none:{
        name:'none',
        option: null,
        type:'option',
        description:'always show headers',
        default: true
      },
      slash:{
        name:"slash",
        option: "p",
        type:'option',
        description:'always show headers'
      },
      classify:{
        name:"classify",
        option: "F",
        type:'option',
        description:'always show headers'
      },
      fileType:{
        name:"file type",
        option: "--file-type",
        type:'option',
        description:'always show headers'
      }
    }      
  },
  timeStyle:{
    name:"time style",
    description:"select attribute to sort",
    options:{
      full_ISO:{
        name:'full-iso',
        option: '--time-style=full-iso',
        type:'option',
        description:'always show headers'
      },
      long_ISO:{
        name:"long-iso",
        option: "--time-style=long-iso",
        type:'option',
        description:'always show headers'
      },
      ISO:{
        name:"iso",
        option: "--time-style=long-iso",
        type:'option',
        description:'always show headers'
      },
      locale:{
        name:"locale",
        option: null,
        type:'option',
        description:'always show headers',
        default: true
      },
      format:{
        name:"format",
        option: null,
        type:'parameter',
        defaultValue: '',
        description:'always show headers'
      }
    }      
  },
  quotingStyle:{
    name:"quoting style",
    description:"select attribute to sort",
    options:{
      literal:{
        name:'literal',
        option:  null,
        type:'option',
        description:'always show headers',
        default: true
      },
      locale:{
        name:"locale",
        option: "--quoting-style=locale",
        type:'option',
        description:'always show headers'
      },
      shell:{
        name:"shell",
        option: "--quoting-style=shell",
        type:'option',
        description:'always show headers'
      },
      shellAlways:{
        name:"shell-always",
        option: "--quoting-style=shell-always",
        type:'option',
        description:'always show headers'
      },
      c:{
        name:"c",
        option: "--quoting-style=c",
        type:'option',
        description:'always show headers'
      },
      escape:{
        name:"escape",
        option: "--quoting-style=escape",
        type:'option',
        description:'always show headers'
      }
    }      
  }
}

var flags = {
  reverse: {
    name: "reverse",
    option: 'T',
    description: "print TAB characters like ^I",
    active: false
  },
  context:{
    name: "context",
    option: 'Z',
    description: "print $ after each line",
    active: false
  },
  inode:{
    name: "inode",
    option: 'v',
    description: "use ^ and M- notation, except for LFD and TAB",
    active: false
  },
  humanReadable: {
    name: "human readable",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  },
  ignoreBackups: {
    name: "ignore backups",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  },
  noPrintOwner: {
    name: "do not list owner",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  },
  noPrintGroup: {
    name: "do not list group",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  },
  numericID: {
    name: "numeric ID",
    option: 's',
    description: "suppress repeated empty output lines",
    active: false
  }
}


var parameters = {
  ignore:{
    name:'ignore',
    option: 'I',
    type: "string",
    description:"filter entries by anything other than the content",
    defaultValue: ""
  }
}

var config:parserModule.Config = {
  selectors:selectors,
  flags:flags,
  parameters:parameters,
}

var optionsParser = $.optionParserFromConfig(config)
var shortOptions = optionsParser.shortOptions;

function extend(option, additional){
  for(var i in additional){
    option[i] = additional[i]
  }
}

extend(optionsParser.shortOptions, {
  c  :  $.ignore ,
  C  :  $.ignore,
  d  :  $.ignore,
  D  :  $.ignore ,
  f  :  $.ignore ,
  H  :  $.ignore ,
  i  :  $.ignore ,
  I  :  $.setParameter(parameters.ignore.name),
  k  :  $.ignore  ,
  L  :  $.ignore,
  N  :  $.ignore  ,
  o  :  $.ignore  ,
  q  :  $.ignore  ,
  Q  :  $.ignore  ,
  R  :  $.ignore  ,
  s  :  $.ignore  ,
  T  :  $.ignore  ,
  u  :  $.ignore  ,
  w  :  $.ignore  ,
  x  :  $.ignore  ,
  1 :  $.ignore
});

extend(optionsParser.longOptions, {
  "all" :                   $.sameAs('a'),
  "almost-all" :            $.sameAs('A'),
  "escape" :                $.sameAs('b'),
  "directory" :             $.sameAs('d'),
  "classify" :              $.sameAs('F'),
  "no-group" :              $.sameAs('G'),
  "human-readable" :        $.sameAs('h'),
  "inode" :                 $.sameAs('i'),
  "kibibytes" :             $.sameAs('k'),
  "dereference" :           $.sameAs('l'),
  "numeric-uid-gid" :       $.sameAs('n'),
  "literal" :               $.sameAs('N'),
  "indicator-style=slash" : $.sameAs('p'),
  "hide-control-chars" :    $.sameAs('q'),
  "quote-name" :            $.sameAs('Q'),
  "reverse" :               $.sameAs('r'),
  "recursive" :             $.sameAs('R'),
  "size" :                  $.sameAs('S'),
  "context" :               $.sameAs('Z')
});

$.generate(optionsParser);




var lsCommandData = new parserModule.ParserData(config);


export class LsComponent extends GraphModule.CommandComponent {
  public exec:string = "ls"
  public files: any[] = []
}


function defaultComponentData(){
  var component = new LsComponent();
  component.selectors = lsCommandData.componentSelectors
  component.flags = lsCommandData.componentFlags
  component.parameters = lsCommandData.componentParameters
  return component;
};



export var parseCommand = common.commonParseCommand(optionsParser,defaultComponentData)
export var parseComponent = common.commonParseComponent(lsCommandData.flagOptions,lsCommandData.selectorOptions,lsCommandData.parameterOptions)
export var VisualSelectorOptions = lsCommandData.visualSelectorOptions;
export var componentClass = LsComponent
