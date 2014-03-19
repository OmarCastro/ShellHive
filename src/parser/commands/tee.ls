$ = require("./_init.js");

/**
  Arranges the nodes using a hierarchical layout
*/
function arrangeLayout(previousCommand,boundaries)
  maxX = 0
  minY = previousCommand.position.y - (boundaries.length-1) * 250
  if minY < 0
    previousCommand.position.y -= minY
    minY = 0 
  prevBound = null
  components = []
  for boundary in boundaries
    $.translateBoundary boundary, previousCommand.position.x + 500, 
      if prevBound then prevBound.bottom - boundary.top else minY
    prevBound = boundary
    components = components ++ boundary.components

  x = switch boundaries.length
    | 0 => 0
    | _ => maxX + 500
  y = switch boundaries.length
    | 0 => 0
    | 1 => prevBound.bottom
    | _ => (prevBound.bottom)



function connector(parser,previousCommand,result, boundaries, tracker)
  return (commandList) !->
      subresult = parser.parseAST(commandList, tracker)
      boundaries.push $.getBoundaries subresult.components
      for sub in subresult.components
        result.components.push sub
      for sub in subresult.connections
        result.connections.push sub
      result.connections.push {
        startNode: previousCommand.id,
        startPort: \output,
        endNode: subresult.firstMainComponent
        endPort: \input
      }


exports.parseCommand = (argsNode, parser, tracker,previousCommand, nextcommands, firstMainComponent, components, connections) ->
  boundaries = []
  result = {firstMainComponent, components,connections}
  if previousCommand instanceof Array
    previousCommand = previousCommand.1

  connectTo = connector(parser,previousCommand,result, boundaries, tracker)

  for argNode in argsNode
    switch $.typeOf argNode
    | \outToProcess => connectTo(argNode[1])

  connectTo(nextcommands) if nextcommands.length
  arrangeLayout(previousCommand,boundaries)
  result.counter = tracker.id
  result
