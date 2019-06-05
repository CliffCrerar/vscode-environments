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
const config_1 = require("../config");
const common_1 = require("../utils/common");
const keytar = common_1.getNodeModule('keytar');
let _authenticationToken = null;
function setAuthenticationToken(token) {
    _authenticationToken = token;
    if (keytar) {
        if (token) {
            keytar.setPassword('vscode-now', 'now.token', token);
        }
        else {
            keytar.deletePassword('vscode-now', 'now.token');
        }
    }
}
exports.setAuthenticationToken = setAuthenticationToken;
function getAuthenticationToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let token;
        if (keytar) {
            token = yield keytar.getPassword('vscode-now', 'now.token');
            if (token) {
                _authenticationToken = token;
            }
        }
        return _authenticationToken;
    });
}
exports.getAuthenticationToken = getAuthenticationToken;
function requestLogin(email, tokenName) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield common_1.request('POST', config_1.default.ENDPOINTS.REGISTRATION, false, { email, tokenName });
        return response;
    });
}
exports.requestLogin = requestLogin;
function verifyLogin(email, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield common_1.request('GET', config_1.default.ENDPOINTS.VERIFY, false, null, { email, token });
        return response.token;
    });
}
exports.verifyLogin = verifyLogin;
//# sourceMappingURL=authentication.js.map