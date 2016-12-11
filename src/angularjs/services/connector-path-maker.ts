
export enum pathModes{
    bezier, squared
}

function doubleParamCall(command: string, param1: Point)
function doubleParamCall(command: string, param1: number, param2: number)
function doubleParamCall(command: string, param1: Point|number, param2?: number){
    if(param2 == null){
        const point = param1 as Point
        param2 = point.y
        param1 = point.x
    } 
    return [command,param1,param2].join(" ");
}

function M(x: Point)
function M(x: number, y: number)
function M(x: any, y?:number){
    return doubleParamCall("M", x,y)
}

function L(x: Point)
function L(x: number, y: number)
function L(x: any, y?:number){
   return doubleParamCall("L", x,y)
}

function H(x: number){
    return `H ${x}`;
}

function C(...points: Point[]){
    const txt = points.map(p => `${p.x},${p.y}`).join(" ");
    return `C ${txt}`;
}



export class ConnectorPathMaker {

    private static makeBezierPath(start: Point, end: Point){
        const {x:x1, y:y1} = start
        const {x:x2, y:y2} = end
        const xp1 = (x2 - x1) / 4;
        const xp2 = (x2 - x1) / 2;
        const xp4 = (x2 - x1);
        return [M(start), H(x1 + .5*xp1), C({x: x1 + xp2, y:y1 }, {x: x1 + xp2, y:y2 }, {x: x1 + xp4, y:y2 })].join(" ")
    }

    private static makeLinePath(start: Point, end: Point){
        const {x:x1, y:y1} = start
        const {x:x2, y:y2} = end
        const dist = 10;
        return [M(start), H(x1 + dist), L({x: x2 - dist, y:y2 }), H(x2)].join(" ")
    }

    static makePath(start: Point, end: Point, mode?: pathModes){
        switch(mode){
            case pathModes.bezier: return ConnectorPathMaker.makeBezierPath(start, end);
            case pathModes.squared: return ConnectorPathMaker.makeLinePath(start, end);
            default: return ConnectorPathMaker.makeLinePath(start, end);

        }
    }    
}