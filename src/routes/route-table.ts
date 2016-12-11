import { Route, method } from "./routes.model"
import { subscribeProjectResponse, subscribeGraphResponse, subscribeGraphRequest } from "./routes-graph.interfaces"
import { UserConfigRequest } from "./routes-user.interfaces"


export class RouteTable {
    homePage = ()                              => new Route<void, string>(                                    method.get  ,   '/'      )
    graphSubscription = ()                     => new Route<subscribeGraphRequest, subscribeGraphResponse>(   method.get  ,   '/graph/subscribe'      )
    projectSubscription = ()                   => new Route<subscribeGraphRequest, subscribeProjectResponse>( method.get  ,   '/project/subscribe'    )
    directoriesOfProject = (projectId: string) => new Route<void, any[]>(                                     method.get  ,   '/directories/project/:projectId', {projectId}    )
    uploadToProject = (projectId: string)      => new Route<void,void>(                                       method.get  ,   '/upload/:projectId',  {projectId}    )
    setUserName = ()                           => new Route<UserConfigRequest, void>(                         method.post ,   '/project/setmyname'    )
}

export default new RouteTable();