import { Component } from "../graph/component" 


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
      x = maxX + 350
      y = Math.max((prevBound.bottom - 350) / 2, 0)
      bottom = Math.max(prevBound.bottom,350)
    }
    return [new Boundary(0,x,0,bottom,components),{x:x,y:y}]
  }
}