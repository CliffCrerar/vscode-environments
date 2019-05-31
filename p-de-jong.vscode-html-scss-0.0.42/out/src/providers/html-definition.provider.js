"use strict";
const vscode = require("vscode");
class HTMLDefinitionProvider {
    constructor() {
        this.htmlTags = [
            'html', 'head', 'body',
            'script', 'style',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'div', 'p', 'a', 'img', 'span', 'strong', 'em',
            'table', 'thead', 'tbody', 'th', 'tr', 'td',
            'ul', 'li', 'ol', 'dl', 'dt', 'dd',
            'form', 'input', 'label', 'button',
            'class', 'id', 'src', 'href',
            'click', 'mousemove',
        ];
    }
    provideDefinition(document, position, token) {
        return new Promise((resolve, reject) => {
            let range = document.getWordRangeAtPosition(position);
            let word = document.getText(range);
            let wordType = 0; // 0: property, 1: function
            // check word as function or property.
            if (this.htmlTags.findIndex(tag => tag === word.toLowerCase()) >= 0) {
                // console.log(`${word} is html tag.`);
                resolve();
            }
            // if next character is '(', so word is function
            if (document.getText(new vscode.Range(range.end, range.end.translate(0, 1))) === '(') {
                wordType = 1;
            }
            // console.log(`wordType: ${wordType}`);
            let pattern;
            if (wordType === 0) {
                pattern = `^\\s*(private\\s+)?(${word})|^\\s*(public\\s+)?(${word})|^\\s*(protected\\s+)?(${word})`;
            }
            else {
                pattern = `^\\s*(private\\s+)?(${word})\\(.*\\)|^\\s*(public\\s+)?(${word})\\(.*\\)|^\\s*(protected\\s+)?(${word})\\(.*\\)`;
            }
            let rgx = new RegExp(pattern);
            // find function|property in ts
            let htmlFile = document.fileName;
            let fileNameWithoutExtension = htmlFile.slice(0, htmlFile.lastIndexOf('.'));
            let tsFile = fileNameWithoutExtension + '.ts';
            let tsUri = vscode.Uri.file(tsFile);
            let enterClass = false;
            vscode.workspace.openTextDocument(tsFile).then((tsDoc) => {
                let lineCount = tsDoc.lineCount;
                for (var li = 0; li < tsDoc.lineCount; li++) {
                    let line = tsDoc.lineAt(li);
                    if (line.isEmptyOrWhitespace) {
                        continue;
                    }
                    if (!enterClass) {
                        if (line.text.match(/\s+class\s+/)) {
                            enterClass = true;
                        }
                        continue;
                    }
                    let m = line.text.match(rgx);
                    if (m && m.length > 0) {
                        let pos = line.text.indexOf(word);
                        resolve(new vscode.Location(tsUri, new vscode.Position(li, pos)));
                    }
                }
                resolve();
            });
        });
    }
}
//# sourceMappingURL=html-definition.provider.js.map