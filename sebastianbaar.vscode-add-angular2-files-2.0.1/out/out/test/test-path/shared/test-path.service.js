"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular/core");
require("rxjs/add/operator/map");
let TestPathService = class TestPathService {
    constructor(http) {
        this.http = http;
    }
    getList() {
        return this.http.get('/api/list').map(res => res.json());
    }
};
TestPathService = __decorate([
    core_1.Injectable()
], TestPathService);
exports.TestPathService = TestPathService;
//# sourceMappingURL=test-path.service.js.map