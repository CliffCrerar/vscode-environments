'use strict';
//const EXIT_CODE_OK = 0;
const EXIT_CODE_WARNING = 1;
const EXIT_CODE_ERROR = 2;
/**
 * Result
 */
export class TidyResult {
    constructor(value, error, exitCode) {
        this.value = value;
        if (error) {
            this.error = new Error(error);
        }
        this.isError = exitCode === EXIT_CODE_ERROR;
        this.isWarning = exitCode === EXIT_CODE_WARNING;
    }
}
export default TidyResult;
//# sourceMappingURL=tidyresult.js.map