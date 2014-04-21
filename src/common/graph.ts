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
	public toJSON():string{
		var jsonObj:any = {}
		jsonObj.components = this.components
		jsonObj.connections = this.connections
		jsonObj.firstMainComponent = this.firstMainComponent
		return JSON.stringify(jsonObj);
	}

	/*
		expands with other graph
	*/
	public expands(other:Graph){
		this.components.concat(other.components)
		this.connections.concat(other.connections)
	}

	public concatComponents(components){ this.components.concat(components) }
    public concatConnections(connections){ this.connections.concat(connections) }
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

//============= COMPONENTS ===========

export class Component{
  public type:string
  public position:any = {x: 0, y: 0}
  public id:number = 0
}

/**
	A command component
*/
export class CommandComponent extends Component{
    public type:string = "command"
    public flags:any
    public selectors:any
    public exec:string
}
/**
	A file component
*/
export class FileComponent extends Component{
    public type:string = "file"
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
    public type:string = "macro"
    public name:string
    public description:string
    public entryComponent:number = null
    public exitComponent:number = null
    public counter: number = 0
    public components:any[] = []
    public connections:any[] = []

    public constructor(name:string,description:string){
    	super();
    	this.name = name;
    	this.description = description;
    }

    public setGraphData(graphData:any){
        this.components = graphData.components
        this.connections = graphData.connections
        this.entryComponent = graphData.firstMainComponent
    }
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

	public toJSON():string{
		return JSON.stringify({
			startNode: this.startNode,
			startPort: this.startPort,
			endNode: this.endComponent.id,
			endPort: this.endPort
		})
	}

}


//========   ==========


export class Boundary{
  public constructor(
    public left:number = 0,
    public rigth:number = 0,
    public top:number = 0,
    public bottom:number = 0,
    public components:Component[] = null){}

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
    if(components.length === 0){
      return null;
    }
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


  public static translate(boundary:Boundary,x:number,y:number = 0){
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
  public static getBoundaries(components){ return Boundary.createFromComponents(components) }

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