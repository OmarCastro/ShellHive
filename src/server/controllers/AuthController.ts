/**
 * AuthController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

import * as express from "express"
import * as passport from "passport"
import { CoreController } from "./CoreController"



class AuthController extends CoreController {
  
  login(req, res) { this._handleRequest(req,res,(req, res, options) => {

    passport.authenticate('local', function(err, user, info){
      if (err || !user) return res.redirect('/')

      req.login(user, function(err){
        /* istanbul ignore next : should not happen anyway */
        if (err) res.redirect('/');
        req.session.user = user;
        res.redirect("/user/show/"+user.id);
      });
    })
  })}

  logout(req, res){ this._handleRequest(req,res,(req, res, options) => {
     req.logout();
     req.session.user = null;
     res.redirect("/");
  })}
  
}

module.exports = new AuthController();
