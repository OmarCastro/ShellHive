
import { Route, method } from "../../routes/routes.model"
import { SocketService } from "../socket.service"
import { CSRF } from "../services/csrf"
import RouteTable from "../../routes/route-table"
export const routeTable = RouteTable

class TransactionHandler<Input, Output>{

    public reponseHandlers: ((data: Output) => void)[] = []
    public errorHandlers: (() => void)[] = []

    handleReponses(data: Output) { this.reponseHandlers.forEach(handler => handler(data)) }
    handleErrors() { this.errorHandlers.forEach(handler => handler()) }

}

class Transaction<Input, Output>{
    constructor(
        private handlers: TransactionHandler<Input, Output>,
        public readonly payload: Input,
        public readonly routeUsed: Route<Input, Output>
    ) { }

    onResponse(responseHandler: (data: Output) => void) {
        this.handlers.reponseHandlers.push(responseHandler)
    }

    onError(responseHandler: () => void) {
        this.handlers.reponseHandlers.push(responseHandler)
    }
}

interface SendInputParams<Input, Output>{
    payload?: Input,
    useRoute: Route<Input, Output>
}

class Network {
    fetch<Output>(route: Route<void, Output>):Transaction<void, Output>{
        return this.send({useRoute: route});
    }

    send<Input, Output>(params: SendInputParams<Input, Output>):Transaction<Input, Output>  {

        const payload = params.payload
        const useRoute = params.useRoute
        const handlers = new TransactionHandler<Input, Output>()
        const transaction = new Transaction<Input, Output>(handlers, payload, useRoute);

        switch (useRoute.method) {
            case method.get: SocketService.sailsSocket.get(useRoute.url, payload, handlers.handleReponses.bind(handlers))
            case method.post: {
                CSRF.getToken((token)=>{
                    (payload as any)._csrf = (payload as any)._csrf || token
                    SocketService.sailsSocket.post(useRoute.url, payload, handlers.handleReponses.bind(handlers))
                });
                
            }
        }

        return transaction;
    }
}

export default new Network()
