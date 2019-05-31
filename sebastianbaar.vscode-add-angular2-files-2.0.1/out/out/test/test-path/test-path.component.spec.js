"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@angular/core/testing");
const http_1 = require("@angular/http");
const Observable_1 = require("rxjs/Observable");
require("rxjs/Rx");
const test_path_component_1 = require("./test-path.component");
const test_path_service_1 = require("./shared/test-path.service");
describe('a test-path component', () => {
    let component;
    // register all needed dependencies
    beforeEach(() => {
        testing_1.TestBed.configureTestingModule({
            imports: [http_1.HttpModule],
            providers: [
                { provide: test_path_service_1.TestPathService, useClass: MockTestPathService },
                test_path_component_1.TestPathComponent
            ]
        });
    });
    // instantiation through framework injection
    beforeEach(testing_1.inject([test_path_component_1.TestPathComponent], (TestPathComponent) => {
        component = TestPathComponent;
    }));
    it('should have an instance', () => {
        expect(component).toBeDefined();
    });
});
// Mock of the original test-path service
class MockTestPathService extends test_path_service_1.TestPathService {
    getList() {
        return Observable_1.Observable.from([{ id: 1, name: 'One' }, { id: 2, name: 'Two' }]);
    }
}
//# sourceMappingURL=test-path.component.spec.js.map