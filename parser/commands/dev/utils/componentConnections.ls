/**
ComponentConnections

this class saves the connections to the component
while its ID is not yet identified

*/
module.exports = class ComponentConnections
  (component) -> 
    @component = component
    @connectionsToInput = []
    @connectionsFromOutput = []

  addConnectionToInputPort: (port, otherNode) !->
    @connectionsToInput.push {
      startNode: otherNode.id,
      startPort: otherNode.port,
      endPort: port
    }

  addConnectionFromPort: (port, otherNode) !->
    @connectionsFromOutput.push {
      startPort: port,
      endNode: otherNode.id
      endPort: otherNode.port
    }

  addConnectionFromOutputPort: (otherNode) !->
    @addConnectionFromPort \output, otherNode

  addConnectionFromErrorPort: (otherNode) !->
    @addConnectionFromPort \error, otherNode

  addConnectionFromReturnCodePort: (otherNode) !->
    @addConnectionFromPort \retcode, otherNode

  toConnectionList: ->
    id = @component.id
    connections = [x <<< {startNode: id} for x in @connectionsFromOutput]
    connections ++= [x <<< {endNode: id} for x in @connectionsToInput]
    connections