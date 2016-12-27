/// <reference path="../../node_modules/@types/socket.io-client/index.d.ts" />

export interface JWRError{
	status: number,
	message: string
}

/**
 * The JWR (JSON WebSocket Response) received from a Sails server.
 *
 * @api public
 * @param  {Object}  responseCtx
 *         => :body
 *         => :statusCode
 *         => :headers
 */
export interface JWR<Output> {
	body: Output
	error?: JWRError
	statusCode: number
	headers: any
}

interface JWRCallback<T> {
	(body: T, jwr: JWR<T>)
}

interface ISailsSocket {
	get<T>(url: string, data?: Object)
	get<T>(url: string, cb?: JWRCallback<T>)
	get<T>(url: string, data?: Object, cb?: JWRCallback<T>)
	post<T>(url: string, data?: Object)
	post<T>(url: string, cb?: JWRCallback<T>)
	post<T>(url: string, data?: Object, cb?: JWRCallback<T>)
}

interface ISailsIOClientStatic extends SocketIOClientStatic {
	socket: ISailsSocket
}

export class SocketService {

	private static m_socket: SocketIOClient.Socket = io();
	public constructor() { }

	static get socketId() {
		return SocketService.m_socket.id
	}

	static get socket(): SocketIOClient.Socket {
		return SocketService.m_socket;
	}

	static get sailsSocket(): ISailsSocket {
		return (<ISailsIOClientStatic>io).socket
	}
}