"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const prettyprint_1 = require("./prettyprint");
const commander = require("commander");
let program = commander.option('-i --inplace', 'edit the files in place')
    .parse(process.argv);
let inplace = !!program['inplace'] || false;
let changed = 0;
program.args.forEach((file) => {
    let fileName = file;
    if (!fileName.startsWith('/')) {
        fileName = path.resolve(process.cwd(), fileName);
    }
    if (inplace) {
        console.log('processing', file);
    }
    let source = fs.readFileSync(fileName).toString();
    let pretty = prettyprint_1.format(source);
    if (pretty != source) {
        changed++;
    }
    if (inplace) {
        fs.writeFileSync(fileName, pretty);
    }
    else {
        process.stdout.write(pretty);
    }
});
if (inplace) {
    console.log(changed + ' file' + (changed == 1 ? '' : 's') + ' files changed');
    let skipped = program.args.length - changed;
    console.log(skipped + ' file' + (skipped == 1 ? '' : 's') + ' files unchanged');
}
//# sourceMappingURL=cliformat.js.map