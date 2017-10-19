"use strict";
/**
 * AuthController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var passport = require("passport");
var CoreController_1 = require("./CoreController");
var AuthController = (function (_super) {
    __extends(AuthController, _super);
    function AuthController() {
        return _super !== null && _super.apply(this, arguments) || this;
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
