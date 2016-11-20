/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />

interface IRequestCallback<T>{
	(body: T)
}

interface ISailsSocket {
	get<T>(url: string, data?: Object)
	get<T>(url: string, cb?: IRequestCallback<T>)
	get<T>(url: string, data?: Object, cb?: IRequestCallback<T>)
	post<T>(url: string, data?: Object)
	post<T>(url: string, cb?: IRequestCallback<T>)
	post<T>(url: string, data?: Object, cb?: IRequestCallback<T>)
}

interface ISailsIOClientStatic extends SocketIOClientStatic{
	socket: ISailsSocket
}




export class SocketService {

	private static m_socket: SocketIOClient.Socket = io();

	public constructor(){}



	static get socketId(){
		return SocketService.m_socket.id
	}

	static get socket(): SocketIOClient.Socket{
		return SocketService.m_socket;
	}

	static get sailsSocket(): ISailsSocket{
		return (<ISailsIOClientStatic> io).socket
	}


}