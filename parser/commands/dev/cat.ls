$ = require("./_init.js");

const selectors =
  lineNum : "line number"

const lineNumberSelector = 
  none:"do not print"
  all:"print all lines"
  nonEmpty:"print non-empty lines"

const lineNumberSelectorOption =
  "do not print": null
  "print all lines": \n
  "print non-empty lines":\b 

exports.VisualSelectorOptions =
  (selectors.lineNum): [value for ,value of lineNumberSelector]

const flags =
  tabs:"show tabs"
  ends:"show ends"
  nonPrint:"show non-printing"
  sblanks:"squeeze blanks"

const flagOptions =
  "show non-printing": \v
  "show tabs": \T,
  "show ends": \E,
  "squeeze blanks": \s





const optionsParser = 
  shortOptions:
    A: $.switchOn(flags.nonPrint,flags.tabs,flags.ends)
    e: $.switchOn(flags.nonPrint,flags.ends)
    T: $.switchOn(flags.tabs)
    v: $.switchOn(flags.nonPrint)
    E: $.switchOn(flags.ends)
    s: $.switchOn(flags.sblanks)
    t: $.switchOn(flags.nonPrint,flags.tabs)
    b: $.select(selectors.lineNum,lineNumberSelector.nonEmpty)
    n: $.selectIfUnselected(selectors.lineNum,lineNumberSelector.all,lineNumberSelector.nonEmpty)
  longOptions:
    "show-all":         $.sameAs \A
    "number-nonblank":  $.sameAs \b
    "show-ends":        $.sameAs \E
    "number":           $.sameAs \n
    "squeeze-blank":    $.sameAs \s
    "show-tabs":        $.sameAs \T
    "show-nonprinting": $.sameAs \v


$.generate(optionsParser)


defaultComponentData = ->
  exec:"cat"
  flags:
    "show non-printing":false,
    "show ends":false,
    "show tabs":false,
    "squeeze blanks":false
  selectors:
    (selectors.lineNum): lineNumberSelector.none
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
      $.parseLongOptions(optionsParser.longOptions,componentData,iter)
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
      connectionsToPush.push({
        startNode: tracker.id-1,
        startPort: \output,
        endPort: "file#{componentData.files.length - 1}"})
      translate.y += boundaries.y2 + 300
    



  componentData
    ..position = {x: translate.x + 300; y: (translate.y - 300) / 2}
    ..id = tracker.id

  for c in connectionsToPush
    result.connections.push({startNode:c.startNode, startPort:c.startPort
      ,endNode: tracker.id,endPort:c.endPort}) 

  tracker.id++ 
  result


exports.parseComponent = (componentData) ->
  exec = ["cat"]
  flags = []
  for key, value of componentData.flags 
    flags.push(flagOptions[key]) if value is true
  selector = lineNumberSelectorOption[componentData.selectors["print line number"]];
  flags.push selector if selector != null
  flags = "-" + flags * '' if flags.length > 0
  files = for file in componentData.files
    if file.indexOf(" ") >= 0 then "\"#file\"" else file
  (exec ++ flags ++ files) * ' '



