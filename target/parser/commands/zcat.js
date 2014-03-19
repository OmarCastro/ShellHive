/*

  -c, --stdout      write on standard output, keep original files unchanged
  -d, --decompress  decompress
  -f, --force       force overwrite of output file and compress links
  -h, --help        give this help
  -k, --keep        keep (don't delete) input files
  -l, --list        list compressed file contents
  -n, --no-name     do not save or restore the original name and time stamp
  -N, --name        save or restore the original name and time stamp
  -q, --quiet       suppress all warnings
  -r, --recursive   operate recursively on directories
  -S, --suffix=SUF  use suffix SUF on compressed files                                        
  -t, --test        test compressed file integrity                                            
  -v, --verbose     verbose mode                                                                

*/
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, defaultComponentData;
  $ = require("./_init.js");
  flags = {
    keepFiles: "keep files",
    force: 'force',
    test: 'test',
    quiet: 'quiet',
    verbose: 'verbose',
    recursive: 'recursive'
  };
  selectorOptions = {};
  exports.VisualSelectorOptions = {};
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'quiet': 'q',
    'verbose': 'v',
    'recursive': 'r'
  };
  optionsParser = {
    shortOptions: {
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose)
    },
    longOptions: {
      'keep': $.sameAs('k'),
      'force': $.sameAs('f'),
      'test': $.sameAs('t'),
      'quiet': $.sameAs('q'),
      'verbose': $.sameAs('v')
    }
  };
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "zcat",
      flags: {
        "keep files": false,
        "force": false,
        "test": false,
        "quiet": false,
        "verbose": false,
        "recursive": false
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);
