declare namespace jsmodels {


    interface IGraphData extends dbmodels.IGraph {
        macroList: any[]
        macros: {[s: string]: any}
    }

}