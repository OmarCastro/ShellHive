import { Component } from "./component.class"


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