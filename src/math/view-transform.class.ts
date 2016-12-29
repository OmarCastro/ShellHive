/**
 * ViewTransform class
 * 
 * A simplified version of the tranformation matrix of a scene, since 
 * for all necessary features, the scale and translate operations are enough.
 * 
 * The affline matrix used for the transformation is:
 * 
 *   [ scale     0        x  ] 
 *   [ 0        scale     y  ]
 *   [ 0          0       1  ]
 * 
 * this matrix is the result of the following transformations
 *   scale by {scale} then translate by {x} and {y}
 *
 */
export class ViewTransform {
    constructor(
        public x = 0,
        public y = 0,
        private _scale = 1,
    ){}

    get scale(){return this._scale}
    set scale(scaleAmmount: number){ this._scale = scaleAmmount }
    get cssTransform(){ return `translate(${this.x}px, ${this.y}px) scale(${this.scale})` }

    translateByPoint(point: IPoint){
        this.translate(point.x, point.y);
    }

    translate(x: number, y: number){
        this.x += x
        this.y += y
    }

    /**
     * apply the tranformation of the point with the transformation matrix
     */
    transformCoordinates(x: number, y: number): IPoint{
            return {
                x: x * this._scale + this.x,
                y: y * this._scale + this.y
            };
        }

    /**
     * apply the inverse tranformation the point the transformation matrix
     */
    inverseTransformCoordinates(x: number, y: number): IPoint{
        return {
            x: (x - this.x) / this._scale,
            y: (y - this.y) / this._scale
          };
    }

    transformPoint(point: IPoint){
        return this.transformCoordinates(point.x, point.y);
    }

}