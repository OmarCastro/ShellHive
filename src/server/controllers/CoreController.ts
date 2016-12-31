import * as express from "express"
import * as passport from "passport"
import * as CircularJSON from "circular-json"
import * as  _str from "underscore.string"
import * as  _ from "lodash"
export class CoreController {

        /**
         * Clean the name of a method to avoid anything bad.
         *
         * @param method
         * @returns {*}
         * @private
         */
        private _cleanMethodName(method: string): string{
            return _str.capitalize(method.replace('_', ''));
        }


        /**
         * Acts as a requests workflow handler to automatically call magic methods such as "__before".
         * Used to call magic methods before the targeted methods is called.
         * Bind some data as well, like the current controller and action name.
         *
         * @param req       Request.
         * @param res       Response.
         * @param callback  Function to execute.
         * @param options   Object that contains options.
         *          controller  Controller      Child controller class. (static)
         *
         */
        protected _handleRequest(req: CoreController.Request, res: CoreController.Response, callback: CoreController.HandleRequestCallback, options: any = {}): void {
            // Extract information from the child. req.target is sails < 0.10 compatible, req.options is sails >0.10 compatible.
            options.controller = req.target && req.target.controller ? req.target.controller : req.options.controller;
            options.action = req.target && req.target.action ? req.target.action : req.options.action;

            // Check that the dedicated method has a __before magic method in the current controller.
            if(this['__before' + this._cleanMethodName(options.action)]){
                // Custom before method is available. Call it. Remove underscores by security. (Protected/private methods)
                this['__before' + this._cleanMethodName(options.action)](req, res, callback, options);
            }else{
                // By default, always call the global magic method.
                this.__beforeEach(req, res, callback, options);
            }
}



        /**
         * Automatically triggered before each called method.
         * Allow to execute some code that will be executed by all methods of all controllers.
         *
         * @param req       Request.
         * @param res       Response.
         * @param callback  Function to execute.
         * @param options   Object that contains options.
         * @private
         */
        private __beforeEach(req, res, callback: any, options: any = {}){
            // Default user.
            if(!req.session.user){
                req.session.user = {
                    // Ensure that we always know if the user is logged in or not and what is default access is.
                    connected: false,
                };
            }

            // Add debug information.
            // TODO Use express middleware instead...
            console.log('-------------------- start -------------------', 'debug');
            console.log('Url: ' + req.method + ' ' + req.baseUrl + req._parsedUrl.href, 'debug');

            if(!_.isEmpty(req.body)){
                console.log('Parameters: ' + JSON.stringify(req.body), 'debug');
            }

            console.log('Options: ' + CircularJSON.stringify(options), 'debug');
            console.log('Route: ' + req.route.method + ' => ' + req.path + ' (' + req.route.regexp + ')', 'debug');

            if(typeof req.headers.cookie !== "undefined"){
                console.log('Cookies: ' + req.headers.cookie, 'debug');
            }

            if(typeof req.headers['user-agent'] !== "undefined"){
                console.log('User agent: ' + req.headers['user-agent'], 'debug');
            }

            console.log('Session: ' + JSON.stringify(req.session), 'debug');
            console.log('---------------------------------------', 'debug');

            // Once we have done the stuff common to all methods, execute the actual callback.
            callback(req, res, options);
        }
  
}



export module CoreController {
  export interface Request extends Express.Request {
    session: any
    target: any
    options: any
    socket: any
    body: any
    params: any
    file: (param: string) => any
    param: (param: string) => any
  }

  export interface Response extends express.Response {
      view: (params: any) => any
      /**
       * throws a 500 server error to the client
       */
      serverError: (error: any) => any
      /**
       * throws a 404 not found to the client
       */
      notFound: () => any
  }

  export interface HandleRequestCallback{
    (req: Request, res: Response, options: any) : void
  }
}
