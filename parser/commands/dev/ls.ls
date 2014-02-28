$ = require("./_init.js");


selectors = {
  \sort
  \format
  \show
  indicator-style:  "indicator style"
  time-style:  "time style"
  quoting-style:  "quoting style"
}

sortSelector = { 
  \name
  \noSort: "do not sort"
  \extension
  \size
  \time
  \version
}

formatSelector = {
  \default
  \commas
  \verbose
}

indicatorStyleSelector = {
  \none,\slash,\classify,
  fileType: "file type"
}

timeStyleSelector = {
  full-iso: \full-iso
  long-iso: \long-iso
  \iso
  \locale
  \format
}

quotingStyleSelector = {
  \literal, \locale, \shell,
  shell-always:"shell-always",
  \c,\escape
}

showSelector = {
  \all,
  almost-all:\almost-all
  \accept
  \except
}

exports.VisualSelectorOptions =
  sort: [value for ,value of sortSelector]
  format: [value for ,value of formatSelector]
  "indicator style": [value for ,value of indicatorStyleSelector]
  "time style": [value for ,value of timeStyleSelector]
  "quoting style": [value for ,value of quotingStyleSelector]
  show: [value for ,value of showSelector]



flags = {
  \reverse
  \context
  ignore-backups: "ignore backups"
  no-print-owner: "do not print owner"
  no-print-group: "do not print group"
}



optionsParser = 
  shortOptions:
    a  :  $.select selectors.show, showSelector.all
    A  :  $.select selectors.show, showSelector.almost-all
    b  :  $.select selectors.quoting-style,  quotingStyleSelector.escape 
    B  :  $.switchOn flags.ignore-backups
    c  :  $.switchOn! 
    C  :  $.justAccept! 
    d  :  $.switchOn!
    D  :  $.justAccept! 
    f  :  $.switchOn! 
    F  :  $.select  selectors.indicator-style, indicatorStyleSelector.classify
    g  :  $.switchOn flags.no-print-owner
    G  :  $.switchOn flags.no-print-group
    h  :  $.switchOn! 
    H  :  $.switchOn! 
    i  :  $.switchOn!
    I  :  $.setParameter \ignore  
    k  :  $.switchOn! 
    l  :  $.select   selectors.format, formatSelector.verbose
    L  :  $.switchOn! 
    m  :  $.select   selectors.format, formatSelector.commas
    n  :  $.switchOn! 
    N  :  $.switchOn! 
    o  :  $.switchOn! 
    p  :  $.select  selectors.indicator-style, indicatorStyleSelector.slash
    q  :  $.switchOn! 
    Q  :  $.switchOn! 
    r  :  $.switchOn flags.reverse
    R  :  $.switchOn! 
    s  :  $.switchOn! 
    S  :  $.select   selectors.sort, sortSelector.size
    t  :  $.select   selectors.sort, sortSelector.time
    T  :  $.switchOn! 
    u  :  $.switchOn! 
    U  :  $.select   selectors.sort, sortSelector.noSort
    v  :  $.select   selectors.sort, sortSelector.extension
    w  :  $.switchOn! 
    x  :  $.switchOn! 
    X  :  $.select   selectors.sort, sortSelector.size
    Z  :  $.switchOn flags.context
    \1 :  $.switchOn!
  longOptions:
    \all :                   $.sameAs \a
    \almost-all :            $.sameAs \A
    \escape :                $.sameAs \b
    \directory :             $.sameAs \d
    \classify :              $.sameAs \F
    \no-group :              $.sameAs \G
    \human-readable :        $.sameAs \h
    \inode :                 $.sameAs \i
    \kibibytes :             $.sameAs \k
    \dereference :           $.sameAs \l
    \numeric-uid-gid :       $.sameAs \n
    \literal :               $.sameAs \N
    \indicator-style=slash : $.sameAs \p
    \hide-control-chars :    $.sameAs \q
    \quote-name :            $.sameAs \Q
    \reverse :               $.sameAs \r
    \recursive :             $.sameAs \R
    \size :                  $.sameAs \S
    \context :               $.sameAs \Z

$.generate(optionsParser)

  

defaultComponentData = ->
  exec:"ls",
  flags:{-"reverse",-"do not list owner",-"do not list group",-"numeric ID",-"inode"}
  selectors:
    "indicator style": indicatorStyleSelector.none
    "time style":      timeStyleSelector.locale
    "quoting style":   quotingStyleSelector.literal
    "format":          formatSelector.default
    "sort"  :          sortSelector.name
  parameters:
    "ignore" : ""
  files:[]



exports.parseCommand = (argsNode, parser, tracker, previousCommand) ->
  componentData = defaultComponentData!
  translate = {
    x: if previousCommand
       then previousCommand.position.x
       else 0
    y: if previousCommand
       then previousCommand.position.y
       else 0
  }
  boundaries = {x1:0,x2:0,y1:0,y2:0}
  connectionsToPush = []

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
      connectionsToPush.push({startNode: tracker.id-1, startPort: \output, endPort: "file#index"})
      translate.y += boundaries.y2 + 300
  componentData
    ..position = {x: translate.x + 300; y: (translate.y - 300) / 2}
    ..id = tracker.id

  for c in connectionsToPush
    result.connections.push({startNode:c.startNode, startPort:c.startPort
      ,endNode: tracker.id,endPort:c.endPort}) 

  tracker.id++ 
  result
