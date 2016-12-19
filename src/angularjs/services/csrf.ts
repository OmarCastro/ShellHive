import * as app from "../app.module"
import { SocketService } from "../socket.service"



console.log("SocketService.sailsSocket.get csrfToken")

SocketService.sailsSocket.get('/csrfToken', function(data){
  console.log("csrfToken data: %o", data)
  CSRF.csrfToken = data._csrf;
  console.log("csrfToken set: %o", data._csrf)
  CSRF.waitingToken.forEach((cb) => cb(CSRF.csrfToken));
});
      
export class CSRF {
	
	static csrfToken: string = null
	static waitingToken: any[] = []

	static getToken(fn: (token: string) => any){
		if(CSRF.csrfToken == null){
			CSRF.waitingToken.push(fn);
		} else {
			fn(CSRF.csrfToken);
		}
  }
  static printget(reqdata){
    CSRF.getToken((data) => {
      SocketService.sailsSocket.post('/graph/action', {message:reqdata,_csrf:CSRF.csrfToken}, function(data){
        //console.log(data);
      });
    });
  }
}