export class Component implements graph.IComponent{
  public static type:string = "abrstract component"
  public type:string
  public position:Point = {x: 0, y: 0}
  public id:number = 0
  public data?:any
}