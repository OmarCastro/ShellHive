

export class Iterator{
  public index:number = 0;
  public argList:any[];
  public length:number;
  public current:any;

  public constructor(ArgList:any[]){
    this.argList = ArgList;
    this.length = ArgList.length;
    this.current = ArgList[0];
  }

  public hasNext(){ return this.index !== this.length }
  public next(){return this.current = this.argList[this.index++] }
  public rest(){return this.argList.slice(this.index) }
}