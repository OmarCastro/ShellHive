
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

$ = require("./_init.js");


selectors = {
  \action
}

actionSelector = {
  \compress
  \decompress
}


flags = {
  keepFiles : "keep files"
  force : \force
  test : \test
  stdout : \stdout
  quiet: \quiet
  verbose: \verbose
  recursive: \recursive
  small: \small
}

$.setblocksize = (size) -> (Component) ->
    Component.block-size = size

optionsParser = 
  shortOptions:
    d  :  $.select  selectors.action, actionSelector.decompress
    z  :  $.select  selectors.action, actionSelector.compress
    k  :  $.switchOn flags.keepFiles
    f  :  $.switchOn flags.force
    t  :  $.switchOn flags.test
    c  :  $.switchOn flags.stdout
    q  :  $.switchOn flags.quiet
    v  :  $.switchOn flags.verbose
    s  :  $.switchOn flags.small
  longOptions:
    \decompress : $.sameAs \d
    \compress :   $.sameAs \z
    \keep :       $.sameAs \k
    \force :      $.sameAs \f
    \test :       $.sameAs \t
    \stdout :     $.sameAs \c
    \quiet :      $.sameAs \q
    \verbose :    $.sameAs \v
    \small :      $.sameAs \s
    \fast :       $.sameAs \1
    \best :       $.sameAs \9

for i from \1 to \9
  optionsParser.shortOptions[i] = $.setblocksize(i)

$.generate(optionsParser)

  

defaultComponentData = ->
  exec:"gzip",
  flags:{-"keep files",-"force",-"test",-"stdout",-"quiet",-"verbose",-"small",-"recursive"}
  selectors:
    action: actionSelector.compress
  files: []


exports.parseCommand = (argsNode, parser, tracker, previousCommand) ->
  componentData = defaultComponentData!
    ..id = tracker.id
  tracker.id++ 

  translate = {x:0,y:0}
  boundaries = {x1:0,x2:0,y1:0,y2:0}

  result = {components:[componentData],connections:[]}
  iter = new $.Iterator argsNode
  while argNode = iter.next!
    switch $.typeOf argNode
    case \shortOptions
      $.parseShortOptions(optionsParser.shortOptions,componentData,iter)
    case \longOption
      arg = optionsParser.longOptions[argNode.slice(2)];
      arg componentData if arg
    case \string
      componentData.files.push(argNode)
    case \inFromProcess
      subresult = parser.parseAST(argNode[1], tracker)
      boundaries
        ..x1 = subresult.components[0].position.x
        ..x2 = boundaries.x1
        ..y1 = subresult.components[0].position.y
        ..y2 = boundaries.y1
      for sub in subresult.components
        position = sub.position
        translate.x = position.x if translate.x < position.x
        boundaries.y2 = position.y if boundaries.y2 < position.y
        position.y += translate.y

        result.components.push sub
      for sub in subresult.connections
        result.connections.push sub
      componentData.files.push("");
      result.connections.push({startNode: tracker.id-1, startPort: \output, endNode: componentData.id, endPort: "file#index"})
      translate.y += boundaries.y2 + 300

  componentData.position = {x: translate.x + 300; y: (translate.y - 300) / 2}
  result