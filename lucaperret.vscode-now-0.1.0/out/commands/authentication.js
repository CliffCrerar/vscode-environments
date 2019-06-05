"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const authentication_1 = require("../utils/authentication");
function logout() {
    authentication_1.setAuthenticationToken(null);
    vscode.window.showInformationMessage('You have been correctly logout to ▲ZEIT now.');
}
exports.logout = logout;
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = yield vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Email' });
        if (email) {
            const tokenName = yield vscode.window.showInputBox({ ignoreFocusOut: true, prompt: 'Token name' });
            if (tokenName) {
                try {
                    const registration = yield authentication_1.requestLogin(email, tokenName);
                    yield vscode.window.showInformationMessage(`We sent an email to ${email},\n\nVerify that the provided security code matches the following text: ${registration.securityCode}.\n\nClick OK when you have verified your email...`, { modal: true });
                    const authenticationToken = yield authentication_1.verifyLogin(email, registration.token);
                    authentication_1.setAuthenticationToken(authenticationToken);
                    vscode.window.showInformationMessage('You have been correctly authenticated to ▲ZEIT now.');
                    return Promise.resolve(authenticationToken);
                }
                catch (error) {
                    vscode.window.showErrorMessage('Login error: ' + error.message);
                }
            }
            else {
                throw new Error('Token name is required');
            }
        }
        else {
            throw new Error('Email is required');
        }
        return Promise.reject(new Error('An error has occurred'));
    });
}
exports.login = login;
function setToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = yield vscode.window.showInputBox({ ignoreFocusOut: true, password: true, prompt: 'Token' });
        if (token) {
            authentication_1.setAuthenticationToken(token);
            vscode.window.showInformationMessage('You have been correctly authenticated to ▲ZEIT now.');
            return Promise.resolve(token);
        }
        return Promise.reject(new Error('An error has occurred'));
    });
}
exports.setToken = setToken;
//# sourceMappingURL=authentication.js.map