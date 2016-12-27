/**
 * AuthController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var passport = require("passport");
var CoreController_1 = require("./CoreController");
var AuthController = (function (_super) {
    __extends(AuthController, _super);
    function AuthController() {
        return _super.apply(this, arguments) || this;
    }
    /**
     * Authenticate the user
     *
     */
    AuthController.prototype.login = function (req, res) {
        this._handleRequest(req, res, function (req, res, options) {
            passport.authenticate('local', function (err, user, info) {
                if (err || !user)
                    return res.redirect('/');
                req.login(user, function (err) {
                    /* istanbul ignore next : should not happen anyway */
                    if (err)
                        res.redirect('/');
                    req.session.user = user;
                    res.redirect("/user/show/" + user.id);
                });
            });
        });
    };
    AuthController.prototype.logout = function (req, res) {
        this._handleRequest(req, res, function (req, res, options) {
            req.logout();
            req.session.user = null;
            res.redirect("/");
        });
    };
    return AuthController;
}(CoreController_1.CoreController));
module.exports = new AuthController();
