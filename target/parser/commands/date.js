(function(){
  var $, selectors, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  selectors = {
    'format': 'format',
    'match': 'match'
  };
  optionsParser = {
    shortOptions: {
      d: $.setParameter("date"),
      f: $.setParameter("file"),
      I: $.selectParameter('format', "ISO-8601")
    },
    longOptions: {
      'field-separator': $.sameAs('d')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      exec: "date",
      parameters: {
        "date": "now",
        "file": ""
      },
      parameterSelectors: {
        format: null
      },
      script: ""
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData, {
    string: function(component, str){
      return component.script = str;
    }
  });
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
}).call(this);
