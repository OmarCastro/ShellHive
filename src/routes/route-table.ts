import { Route, Method } from "./routes.model"


export class RouteTable {
    homePage = ()                              => new Route<void, string>(                                    Method.get  ,   '/'      )
    graphSubscription = ()                     => new Route<subscribeGraphRequest, subscribeGraphResponse>(   Method.get  ,   '/graph/subscribe'      )
    projectSubscription = ()                   => new Route<subscribeGraphRequest, subscribeProjectResponse>( Method.get  ,   '/project/subscribe'    )
    directoriesOfProject = (projectId: string) => new Route<void, any[]>(                                     Method.get  ,   '/directories/project/:projectId', {projectId}    )
    uploadToProject = (projectId: string)      => new Route<void,void>(                                       Method.get  ,   '/upload/:projectId',  {projectId}    )
    setUserName = ()                           => new Route<UserConfigRequest, void>(                         Method.post ,   '/project/setmyname'    )
    chat = ()                                  => new Route<ChatMessage, void>(                                    Method.post ,   '/project/chat'    )
}

export default new RouteTable();