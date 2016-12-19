/**
 * Responsible for showing the transformation of a scene
 */
export class ViewTransform {
    constructor(
        private translateX = 0,
        private translateY = 0,
        private _scale = 1,
    ){}

    translate(x: number, y: number){
        this.translateX += x
        this.translateY += y
    }

    get x(){return this.translateX}
    get y(){return this.translateY}
    get scaleAmount(){return this._scale}

    translateByPoint(point: IPoint){
        this.translate(point.x, point.y);
    }

    transformCoordinates(x: number, y: number){
        return {
            x: (x - this.translateX) / this._scale,
            y: (y - this.translateY) / this._scale
          };
    }

    transformPoint(point: IPoint){
        return this.transformCoordinates(point.x, point.y);
    }

}