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
  -1, --fast        compress faster                                                           
  -9, --best        compress better                                                           
  --rsyncable       Make rsync-friendly archive    


*/
(function(){
  var $, flags, selectorOptions, flagOptions, optionsParser, i$, i, defaultComponentData;
  $ = require("./_init.js");
  flags = {
    keepFiles: "keep files",
    decompress: 'decompress',
    force: 'force',
    test: 'test',
    stdout: 'stdout',
    quiet: 'quiet',
    verbose: 'verbose',
    recursive: 'recursive',
    small: 'small'
  };
  selectorOptions = {};
  exports.VisualSelectorOptions = {};
  flagOptions = {
    "keep files": 'k',
    'force': 'f',
    'decompress': 'd',
    'stdout': 'c',
    'quiet': 'q',
    'test': 't',
    'verbose': 'v',
    'recursive': 'r',
    'small': 's'
  };
  $.setblocksize = function(size){
    return function(Component){
      return Component.blockSize = size;
    };
  };
  optionsParser = {
    shortOptions: {
      d: $.switchOn(flags.decompress),
      k: $.switchOn(flags.keepFiles),
      f: $.switchOn(flags.force),
      t: $.switchOn(flags.test),
      c: $.switchOn(flags.stdout),
      q: $.switchOn(flags.quiet),
      v: $.switchOn(flags.verbose),
      r: $.switchOn(flags.recursive),
      s: $.switchOn(flags.small)
    },
    longOptions: [
      {
        'decompress': $.sameAs('d'),
        'compress': $.sameAs('z'),
        'keep': $.sameAs('k'),
        'force': $.sameAs('f'),
        'test': $.sameAs('t'),
        'stdout': $.sameAs('c'),
        'quiet': $.sameAs('q'),
        'verbose': $.sameAs('v'),
        'small': $.sameAs('s')
      }, 'recursive:', $.sameAs('r'), {
        'fast': $.sameAs('1'),
        'best': $.sameAs('9')
      }
    ]
  };
  for (i$ = '1'; i$ <= '9'; ++i$) {
    i = i$;
    optionsParser.shortOptions[i] = $.setblocksize(i);
  }
  $.generate(optionsParser);
  defaultComponentData = function(){
    return {
      type: 'command',
      exec: "gzip",
      flags: {
        "decompress": false,
        "keep files": false,
        "force": false,
        "test": false,
        "stdout": false,
        "quiet": false,
        "verbose": false,
        "small": false,
        "recursive": false
      },
      files: []
    };
  };
  exports.parseCommand = $.commonParseCommand(optionsParser, defaultComponentData);
  exports.parseComponent = $.commonParseComponent(flagOptions, selectorOptions);
}).call(this);
