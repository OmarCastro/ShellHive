declare interface Point{
    x:number, y:number
}

declare interface IPoint{
    x:number, y:number
}


declare interface IViewBox {
    topLeft: IPoint
    bottomRight: IPoint
}