declare namespace graph {

    interface IComponent {
        readonly type: string
        position: IPoint
        readonly id: number
        data?: any
    }

    interface IConnectionJSON {
        startNode: number
        startPort: string
        endNode: number
        endPort: string
    }

    interface IConnection {
        readonly id: string;

        startComponent: IComponent,
        startPort: string,
        endComponent: IComponent,
        endPort: string
        readonly startNode: number
        readonly endNode: number
        readonly toJSON: () => IConnectionJSON

    }

    interface IGraphJSON {
        components: IComponent[],
        connections: IConnection[],
    }

    interface IGraph {
        components: IComponent[]
        connections: IConnection[]
        firstMainComponent: IComponent | null
        counter: number
        readonly toJSON: () => IGraphJSON
        readonly containsComponent: (target: IComponent) => boolean
        /**
            removes the component of the graph and returns the connections related to it
        */
        readonly removeComponent: (component: IComponent) => IConnection[]
        readonly connect: (startComponent: IComponent, outputPort: string, endComponent: IComponent, inputPort: string) => void
        /**
            expands with other graph
        */
        readonly expand: (other: IGraph) => void
        readonly concatComponents: (components: IComponent[]) => void
        readonly concatConnections: (components: IConnection[]) => void
    }
}


