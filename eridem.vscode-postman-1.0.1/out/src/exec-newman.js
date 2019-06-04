"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const toolbar_1 = require("./toolbar");
const output_1 = require("./output");
const formating_1 = require("./formating");
let _latestFolder = null;
let _isNewFolder = false;
let toolbar;
let output;
function execNewman(opts, toolbarItem, config) {
    const newman = require('newman');
    toolbar = new toolbar_1.Toolbar(toolbarItem, config);
    output = new output_1.Output(vscode.window.createOutputChannel('Postman Results'), config);
    _latestFolder = null;
    _isNewFolder = false;
    // Show or hide info message
    if (config.showRunInfoMessage) {
        vscode.window.showInformationMessage('Postman tests are loading. You can see the progress in the OUTPUT window.');
    }
    // Messages on toolbar
    output.appendText(`Preparing tests...${formating_1.Symbol.HORIZONTAL_LINE}`);
    toolbar.changeText(`Preparing tests...`);
    // Preparing options
    let newmanOptions = {
        collection: require(opts.collection),
        environment: opts.environment ? require(opts.environment) : null,
        folder: opts.folder,
        delayRequest: opts.delay,
        iterationCount: opts.iteractions,
        iterationData: opts.data,
        reporters: null,
        reporter: null
    };
    // Save results using a template
    if (config.showResultsInNewDocument) {
        let resultsFilePath = path.join(config.resultsFileDir, './vscode-postman-results/results-' + new Date().toISOString().replace(/[-|:|Z|\.]/gi, '_').replace(/T/gi, '-') + '.yml');
        newmanOptions.reporters = ['html'];
        newmanOptions.reporter = { html: { export: resultsFilePath, template: path.join(__dirname, '../../html-templates', 'template.hbs') } };
    }
    newman.run(newmanOptions)
        .on('beforeItem', function (err, args) {
        if (_latestFolder !== args.item.__parent.__parent.name) {
            _latestFolder = args.item.__parent.__parent.name;
            output.appendText('\n' + formating_1.Space.FOLDER_PADDING + formating_1.Symbol.FOLDER_ICON + _latestFolder);
            _isNewFolder = true;
        }
    })
        .on('beforeRequest', function (err, args) {
        if (err) {
            toolbar.changeText('There was an error getting request.');
            output.appendText('There was an error getting request.');
        }
        else {
            toolbar.changeText('Running: ' + args.item.name);
            output.appendText((_isNewFolder ? '' : '\n') + formating_1.Space.REQUEST_PADDING + formating_1.Symbol.REQUEST_ICON + args.item.name);
        }
        _isNewFolder = false;
    })
        .on('request', function (err, args) {
        if (err) {
            toolbar.changeText('There was an error getting request.');
        }
        else {
            let request = args.request;
            let response = args.response;
            let url = request.url;
            var size = response && response.size();
            size = size && (size.header || 0) + (size.body || 0) || 0;
            let message = `${request.method} ${url.protocol}://${url.host.join(".")}/${url.path.join('/')} [${response.code} ${response.status}, ${size}B, ${response.responseTime}ms]`;
            output.appendText(formating_1.Space.REQUEST_URL_PADDING + message);
        }
    })
        .on('assertion', function (err, o) {
        let passed = !err;
        // print each test assertions
        let message = (passed ? formating_1.Symbol.PASS_ICON : formating_1.Symbol.FAIL_ICON) + o.assertion;
        output.appendText(formating_1.Space.TEST_PADDING + message);
    })
        .on('done', function (err, summary) {
        // Results on toolbar and output
        let stats = summary.run.stats;
        let duration = (summary.run.timings.completed - summary.run.timings.started) / 1000;
        let message = `Duration: ${duration}sec | Iterations: ${stats.iterations.total} | Tests: ${stats.tests.total} | Assertions failed: ${stats.assertions.failed}`;
        toolbar.changeText(message);
        output.appendText(`${formating_1.Symbol.HORIZONTAL_LINE}${message}`);
        // Open automatically new document with results
        if (config.showResultsInNewDocument) {
            vscode.workspace.openTextDocument(vscode.Uri.file(newmanOptions.reporter.html.export)).then(doc => {
                vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
            });
        }
    })
        .on('beforeIteration', function (err, args) {
        output.appendText(formating_1.Space.ITERACTION_PADDING + formating_1.Symbol.ITERACTION_ICON + "Iteraction " + (args.cursor.iteration + 1));
    });
}
exports.execNewman = execNewman;
//# sourceMappingURL=exec-newman.js.map