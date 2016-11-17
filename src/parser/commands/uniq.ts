import {parserModule, $, CommandComponent, common, sanitizer}  from "./_common.imports";



/*
-c, --count
              

       -d, --repeated
              only print duplicate lines

       -D, --all-repeated[=delimit-method]
              print  all  duplicate  lines  delimit-method={none(default),prepend,separate}
              Delimiting is done with blank lines

       -f, --skip-fields=N
              avoid comparing the first N fields

       -i, --ignore-case
              ignore differences in case when comparing

       -s, --skip-chars=N
              avoid comparing the first N characters

       -u, --unique
              only print unique lines

       -z, --zero-terminated
              end lines with 0 byte, not newline

       -w, --check-chars=N
              compare no more than N characters in lines



*/

var flags = {
  count: {
    name: "count",
    option: 'c',
    longOption: 'count',
    description: "prefix lines by the number of occurrences",
    active: false
  },
  ignoreCase:{
    name: "ignore case",
    option: 'd',
    longOption: 'delete',
    description: "delete characters in SET1, do not translate",
    active: false
  }
}

var config:parserModule.Config = {
  flags:flags,
}



var uniqData = new parserModule.ParserData(config);


var optionsParser = $.optionParserFromConfig(config);

var shortOptions = optionsParser.shortOptions


export class UniqComponent extends CommandComponent {
  public exec:string = "uniq"
}


function defaultComponentData(){
  var component = new UniqComponent();
  component.selectors = uniqData.componentSelectors
  component.flags = uniqData.componentFlags
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser, defaultComponentData);
export var parseComponent = common.commonParseComponent(uniqData.flagOptions, uniqData.selectorOptions, uniqData.parameterOptions);
export var VisualSelectorOptions = uniqData.visualSelectorOptions;
export var componentClass = UniqComponent
