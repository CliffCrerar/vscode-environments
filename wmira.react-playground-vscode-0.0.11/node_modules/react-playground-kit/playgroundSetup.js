"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var createEntry = exports.createEntry = function createEntry(entryPath) {

    return "\n        import React from 'react';\n        import ReactDom from 'react-dom';\n        import Playground from 'react-playground-kit';\n        import * as module from '" + entryPath + "';\n\n        ReactDom.render(React.createElement(Playground, { module }), document.getElementById('app'));\n    ";
};

var createHtmlContainer = exports.createHtmlContainer = function createHtmlContainer(path) {
    return "<html>\n        <header>\n            <style>\n                body, html, div {\n                    margin: 0;\n                    padding: 0;\n                    width: 100%;\n                    height: 100%;\n                    overflow: hidden;\n                    background-color: #fff;\n                }\n            </style>\n        </header>\n        <body>\n            <div id='app'></div>\n            <script src='file:///" + path + "/bundle.js'></script>\n        </body>\n    </html>\n    ";
};