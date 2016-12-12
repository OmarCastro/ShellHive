declare namespace dbmodels {
    interface BaseModel{
        readonly createdAt: string
        readonly updatedAt: string
        readonly id: number

    }

    interface IGraphData {
        name?: string
        id?: number
    }

    interface IGraph extends graph.IGraphJSON, BaseModel {
        type: string
        data: IGraphData
    }

    interface IComponent extends graph.IComponent, BaseModel {
        graph: number
    }
    
}