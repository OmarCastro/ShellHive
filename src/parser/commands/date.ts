import {parserModule, $, CommandComponent, common, sanitizer}  from "./_common.imports";

var config = {
  parameters:{
    date:{
      name:'date',
      option: 'd',
      type: "string",
      description:"filter entries by anything other than the content",
      defaultValue: ""
    }
  },
  flags:{
    utc:{
      name: "UTC",
      option: 'u',
      longOption:['utc','universal'],
      description: "overwrite existing output files",
      active: false
    }
  }
}
var dateData = new parserModule.ParserData(config);

var optionsParser = $.optionParserFromConfig(config);
optionsParser.shortOptions['d'] =  $.setParameter(config.parameters.date.name)
optionsParser.longOptions['date'] =  optionsParser.shortOptions['d']


export class DateComponent extends CommandComponent {
  public exec:string = "date"
}

function defaultComponentData(){
  var component = new DateComponent();
  component.flags = dateData.componentFlags  
  component.parameters = dateData.componentParameters  
  return component;
};

export var parseCommand = common.commonParseCommand(optionsParser,defaultComponentData,{
  string: (component, str)=>{component.parameters.date = str} 
})
export var parseComponent = common.commonParseComponent(dateData.flagOptions, dateData.selectorOptions,dateData.parameterOptions)
export var VisualSelectorOptions = dateData.visualSelectorOptions;
export var componentClass = DateComponent


/*DESCRIPTION
       Display the current time in the given FORMAT, or set the system date.

       -d, --date=STRING
              display time described by STRING, not 'now'

       -f, --file=DATEFILE
              like --date once for each line of DATEFILE

       -I[TIMESPEC], --iso-8601[=TIMESPEC]
              output date/time in ISO 8601 format.  TIMESPEC='date' for date only (the default), 'hours', 'minutes', 'seconds', or 'ns' for date and time to the indicated precision.

       -r, --reference=FILE
              display the last modification time of FILE

       -R, --rfc-2822
              output date and time in RFC 2822 format.  Example: Mon, 07 Aug 2006 12:34:56 -0600

       --rfc-3339=TIMESPEC
              output date and time in RFC 3339 format.  TIMESPEC='date', 'seconds', or 'ns' for date and time to the indicated precision.  Date and time components are separated by a sin‐
              gle space: 2006-08-07 12:34:56-06:00

       -s, --set=STRING
              set time described by STRING

       -u, --utc, --universal
              print or set Coordinated Universal Time

       --help display this help and exit

       --version
              output version information and exit
*/