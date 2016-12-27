export enum Method{
    get, post, put, delete
}

export class Route<Input, Output> {
    public readonly url;
    public readonly methodName: string;
    public constructor(
        public readonly method: Method,
        public readonly route_url: string,
        public readonly params: {[s: string]: string} = {}
    ) {
        this.url = route_url.replace(/\/:([a-zA-Z][a-zA-Z0-9]*)/g,(substr, group1) => "/" + params[group1])
        this.methodName = Method[this.method];
    }
}