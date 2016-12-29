
import { Route, Method } from "../../routes/routes.model"
import { SocketService, JWR, JWRError } from "../socket.service"
import { CSRF } from "../services/csrf"
import RouteTable from "../../routes/route-table"
export const routeTable = RouteTable

/**
 * TransactionHandler class
 * @description Responsible for handling transaction event
 * @type Input - data type that is sent from the client
 * @type Output - data type expected to receive as a response from the server
 */
class TransactionHandler<Input, Output>{

    public reponseHandlers: ((data: Output) => void)[] = []
    public errorHandlers: ((error: any, statusCode: number) => void)[] = []
    public transaction: Transaction<Input, Output>

    /**
     * Default error handler. Simply prints to the console, it is not a good idea to fail silently
     */
    private defaultErrorHandler<Input, Output>(error: JWRError, statusCode: number){
        console.warn("received error %o on transaction %o", error, this.transaction);
    }

    handleReponses(data: Output) {
        this.reponseHandlers.forEach(handler => handler(data))
        this.reponseHandlers = [];
    }

    handleErrors(error: JWRError, statusCode: number) {
        if( this.errorHandlers.length <= 0 ){ this.defaultErrorHandler(error,statusCode);  }
        else { this.errorHandlers.forEach(handler => handler(error, statusCode)); }
        
    }

}

/**
 * Transaction class
 * @description Representation of a Transaction
 * @type Input - data type that is sent from the client
 * @type Output - data type expected to receive as a response from the server
 */
class Transaction<Input, Output>{
    constructor(
        private handlers: TransactionHandler<Input, Output>,
        public readonly payload: Input,
        public readonly routeUsed: Route<Input, Output>
    ) { handlers.transaction = this }

    onResponse(responseHandler: (data: Output) => void) {
        this.handlers.reponseHandlers.push(responseHandler)
    }

    onError(responseHandler: (error: JWRError, statusCode: number) => void) {
        this.handlers.errorHandlers.push(responseHandler);
    }
}

/**
 * SendInputParams interface
 * @description data type to be used as argument for the Network::send() method
 * @type Input - data type that is sent from the client
 * @type Output - data type expected to receive as a response from the server
 */
interface SendInputParams<Input, Output> {
    payload?: Input,
    useRoute: Route<Input, Output>
}

function handlerFor<Input, Output>(handler: TransactionHandler<Input, Output>) {
    return function (data: Output, jwr: JWR<Output>) {
        if (jwr.error != null) {
            handler.handleErrors(jwr.error, jwr.statusCode)
        } else {
            handler.handleReponses(data);
        }
    }
}

/**
 * Network class
 * @description Reponsible for the communication between the client and network
 */
class Network {
    /**
     * syntatic sugar for send({useRoute: <arg1>});
     */
    fetch<Output>(route: Route<void, Output>): Transaction<void, Output> {
        return this.send({ useRoute: route });
    }

    /**
     * creates a transaction between the client and the server
     */
    send<Input, Output>(params: SendInputParams<Input, Output>): Transaction<Input, Output> {

        const payload = params.payload
        const useRoute = params.useRoute
        const handlers = new TransactionHandler<Input, Output>()
        const transaction = new Transaction<Input, Output>(handlers, payload, useRoute);

        switch (useRoute.method) {
            case Method.get:
                SocketService.sailsSocket.get(useRoute.url, payload, handlerFor(handlers));
                break;
            case Method.post:
            case Method.put:
            case Method.delete: {
                if (!payload) {
                    SocketService.sailsSocket.post(useRoute.url, payload, handlerFor(handlers));
                } else {
                    CSRF.getToken((token) => {
                        (payload as any)._csrf = (payload as any)._csrf || token
                        SocketService.sailsSocket.post(useRoute.url, payload, handlerFor(handlers));
                    });
                }
            }
            break;
            
        }

        return transaction;
    }
}

export default new Network()
