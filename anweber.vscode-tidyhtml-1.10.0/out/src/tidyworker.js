'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const childprocess = require("child_process");
const tidyresult_1 = require("./tidyresult");
/**
 * handle child_process to spawn tidy
 */
class TidyWorker {
    constructor(tidyExec, options) {
        this.tidyExec = tidyExec;
        this.options = options;
        this.options.tidyMark = false;
        this.options.forceOutput = true;
        this.options.quiet = false;
    }
    /**
     * convert json to command line arguments
     * @param  {object} options json object to convert
     * @return {array} command line arguments
     */
    parseOptions(options) {
        options = options || {};
        let args = [];
        const toHyphens = (str) => {
            return str.replace(/([A-Z])/g, function (_m, w) {
                return '-' + w.toLowerCase();
            });
        };
        for (let opt in options) {
            if (opt) {
                args.push('--' + toHyphens(opt));
                switch (typeof options[opt]) {
                    case 'string':
                    case 'number':
                        args.push(options[opt]);
                        break;
                    case 'boolean':
                        args.push(options[opt] ? 'yes' : 'no');
                        break;
                    default:
                        console.log('unknown option type: ' + typeof options[opt]);
                }
            }
        }
        return args;
    }
    /**
     * format text with tidy
     * @param  {string} text content for formatting
     * @return {Promise} promise
     */
    formatAsync(text) {
        return new Promise((resolve, reject) => {
            try {
                const args = this.parseOptions(this.options);
                if (this.traceLogging) {
                    console.info(`spawn: ${this.tidyExec} ${args}`);
                }
                const worker = childprocess.spawn(this.tidyExec, args);
                let formattedText = '';
                let error = '';
                worker.stdout.on('data', (data) => {
                    formattedText += data;
                });
                worker.stderr.on('data', (data) => {
                    if (this.traceLogging) {
                        console.info(`spawn error: ${JSON.stringify(data)}`);
                    }
                    error += data;
                });
                worker.on('exit', (code) => {
                    resolve(new tidyresult_1.TidyResult(formattedText, error, code));
                });
                worker.stdin.end(text);
            }
            catch (err) {
                reject(new Error(err));
            }
        });
    }
}
exports.TidyWorker = TidyWorker;
exports.default = TidyWorker;
//# sourceMappingURL=tidyworker.js.map