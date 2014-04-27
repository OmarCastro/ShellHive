export class Graph{
	public constructor(
	public components:Component[] = [],
	public connections:Connection[] = [],
	public firstMainComponent:Component = null,
  public counter:number = 0
	){}
	/**
		transforms to JSON, JSON.stringify() will 
		call this function if it exists
	*/
	public toJSON(){
		return {
      components: this.components,
      connections: this.connections,
    }
	}

  public connect(startComponent:Component, outputPort:string, endComponent:Component, inputPort:string){
    var connection = new Connection(startComponent,outputPort,endComponent,inputPort)
    this.connections.push(connection);
  }

	/*
		expands with other graph
	*/
	public expands(other:Graph){
		this.concatComponents(other.components)
		this.concatConnections(other.connections)
	}

	public concatComponents(components){ this.components = this.components.concat(components) }
  public concatConnections(connections){this.connections =  this.connections.concat(connections) }
}

export class IndexedGraph{
	public components:{[s:number]:Component} = {}
	public inputConnections:any  = {}
	public outputConnections:any = {}

	public constructor(graph:Graph){
		var components = this.components
		var outputConnections = this.outputConnections
		var inputConnections = this.inputConnections
		
		graph.components.forEach(component => {
			components[component.id] = component
		});
		graph.connections.forEach(connection => {
			outputConnections[connection.startNode] = connection
			inputConnections[connection.endNode] = connection
		});
	}
}


export class Macro extends Graph { 
  constructor(
    public name:string,
    public description:string
  ){super()}



  public static fromGraph(name:string, description:string, graphData:Graph):Macro{
    var newmacro = new Macro(name,description);
    newmacro.components = graphData.components
    newmacro.connections = graphData.connections
    return newmacro;
  }
}

//============= COMPONENTS ===========


export class Component{
  public static type:string = "abrstract component"
  public type:string
  public position:any = {x: 0, y: 0}
  public id:number = 0
}

/**
	A command component
*/
export class CommandComponent extends Component{
    public static type:string = "command"
    public type:string = CommandComponent.type
    public flags:any
    public selectors:any
    public parameters:any
    public exec:string = null
    public files:any[]
}
/**
	A file component
*/
export class FileComponent extends Component{
    public static type:string = "file"
    public type:string = FileComponent.type
    public filename:string

    public constructor(filename:string){
    	super();
    	this.filename = filename;
    }

}

/**
	A macro Component
*/
export class GraphComponent extends Component{
    public static type:string = "graph"
    public type:string = GraphComponent.type

    public entryComponent:Component = null
    public exitComponent:Component = null
    public counter: number = 0
    public components:any[] = []
    public connections:any[] = []

    constructor(
      public name:string,
      public description:string
    ){super();}

    public setGraphData(graphData:Graph){
        this.components = graphData.components
        this.connections = graphData.connections
        this.entryComponent = graphData.firstMainComponent
    }
}

/**
  A macro Component
*/
export class MacroComponent extends Component{
    public static type:string = "macro"
    public type:string = MacroComponent.type

    constructor(
      public macro:Macro
    ){super();}

}

//========   ==========

export class Connection{
	public constructor(
		public startComponent:Component,
		public startPort:string,
		public endComponent:Component,
		public endPort:string
		){}

  public get startNode():number{return this.startComponent.id;}
  public get endNode():number{return this.endComponent.id;}

	public toJSON(){
		return {
			startNode: this.startNode,
			startPort: this.startPort,
			endNode: this.endComponent.id,
			endPort: this.endPort
		}
	}

}


//========   ==========


export class Boundary{
  public constructor(
    public left:number,
    public rigth:number,
    public top:number,
    public bottom:number,
    public components:Component[]
  ){}

  public static createFromXY(x:number, y:number, component:Component){
    var bottom:number;
    if(component.type === "file"){
      bottom = y + 100
    }
    else{ bottom = y + 350 }
    return new this(x,x,y,bottom,[component]);
  }

  public static createFromPoint(point:{x:number; y:number}, component:Component){
    return this.createFromXY(point.x,point.y,component);
  }

  public static createFromComponent(component:Component){
    return this.createFromPoint(component.position,component);
  }

  public static createFromComponents(components:Component[]){
    if(components.length === 0){ return null; }
    var boundary = this.createFromComponent(components[0])
    for(var i = 1,len = components.length; i < len; ++i){
      boundary.extend(this.createFromComponent(components[i]))
    }
    return boundary;
  }

  public extend(boundary2: Boundary){
      this.left   = Math.min(boundary2.left   ,this.left)
      this.rigth  = Math.max(boundary2.rigth  ,this.rigth)
      this.top    = Math.min(boundary2.top    ,this.top)
      this.bottom = Math.max(boundary2.bottom ,this.bottom)
      this.components = this.components.concat(boundary2.components);
  } 


  public static translate(boundary:Boundary,x:number,y:number){
    boundary.left   += x
    boundary.rigth  += x
    boundary.top    += y
    boundary.bottom += y
    boundary.components.forEach(component => {
      var position = component.position;
      position.x += x
      position.y += y
    });
  }

  public translateXY(x, y = 0){ Boundary.translate(this,x,y) }
  /**
  arranges the layout
  */
  public static arrangeLayout(boundaries:Boundary[]):any[]{
    var maxX:number = 0
    var prevBound = null
    var components:any[] = []
    boundaries.forEach(boundary => {
      maxX = Math.max(boundary.rigth, maxX)
      components = components.concat(boundary.components)
    });

    boundaries.forEach(boundary => {
      var translateX = maxX - boundary.rigth
      var translateY = prevBound ? prevBound.bottom - boundary.top : 0
      boundary.translateXY(translateX,translateY)
      prevBound = boundary
    });

    var x = 0, y = 0, bottom = 350;
    
    if(boundaries.length){
      x = maxX + 450
      y = Math.max((prevBound.bottom - 350) / 2, 0)
      bottom = Math.max(prevBound.bottom,350)
    }
    return [new Boundary(0,x,0,bottom,components),{x:x,y:y}]
  }
}