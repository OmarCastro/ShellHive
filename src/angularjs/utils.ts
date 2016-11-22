export const pathArray = window["pathArray"] = window.location.pathname.split( '/' );
export const projectId = window["projId"] = pathArray[pathArray.length - 1];
