/**
ComponentConnections

this class saves the connections to the component
while its ID is not yet identified

*/
class ComponentConnections{
  public connectionsToInput:any[] = []
  public connectionsFromOutput:any[] = []

  public constructor(public component:any){ }

  public addConnectionToInputPort(port:string, otherNode){
    this.connectionsToInput.push({
      startNode: otherNode.id,
      startPort: otherNode.port,
      endPort: port
    });
  }

  public addConnectionFromPort(port:string, otherNode){
    this.connectionsToInput.push({
      startPort: port,
      endNode: otherNode.id,
      endPort: otherNode.port
    });
  }

  public addConnectionFromOutputPort(otherNode){
    this.addConnectionFromPort("output", otherNode)
  }

    public addConnectionFromErrorPort(otherNode){
    this.addConnectionFromPort("error", otherNode)
  }

    public addConnectionFromReturnCodePort(otherNode){
    this.addConnectionFromPort("retcode", otherNode)
  }

  public toConnectionList(){
    var id = this.component.id
    return this.connectionsFromOutput.map(connection => {
      connection.startNode = id
      return connection;
    }).concat(this.connectionsToInput.map(connection => {
       connection.endNode = id
      return connection;
    }));

  }
}

export = ComponentConnections