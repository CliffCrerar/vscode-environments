"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
.########..########..#######..##.....##.####.########..########
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.##.....##.##.......##.....##.##.....##..##..##.....##.##......
.########..######...##.....##.##.....##..##..########..######..
.##...##...##.......##..##.##.##.....##..##..##...##...##......
.##....##..##.......##....##..##.....##..##..##....##..##......
.##.....##.########..#####.##..#######..####.##.....##.########
*/
const vscode = require("vscode");
/*
.########.########.##.....##.########
....##....##........##...##.....##...
....##....##.........##.##......##...
....##....######......###.......##...
....##....##.........##.##......##...
....##....##........##...##.....##...
....##....########.##.....##....##...
.##.....##.########.####.##........######.
.##.....##....##.....##..##.......##....##
.##.....##....##.....##..##.......##......
.##.....##....##.....##..##........######.
.##.....##....##.....##..##.............##
.##.....##....##.....##..##.......##....##
..#######.....##....####.########..######.
*/
class TextUtils {
    static removeTrailingWhitespaces(lines) {
        return lines.map(_line => TextUtils.removeTrailingWhitespace(_line));
    }
    static removeTrailingWhitespace(line) {
        return line.replace(/\s+$/, '');
    }
    static wrapLinesWithComments(lines, commentTags) {
        if (commentTags.blockComment) {
            // Insert first tag in front
            lines.unshift(commentTags.blockComment[0]);
            // Insert second tag in back
            lines.push(commentTags.blockComment[1]);
            ;
        }
        else if (commentTags.lineComment) {
            // Prefix each line with lineComment tag
            lines.map(_line => commentTags.lineComment + _line);
        }
        return lines;
    }
    static applyIndentationToLine(line, indentation) {
        return indentation + line;
    }
    static applyIndentationToLines(lines, indentation) {
        return lines.map((_line, index) => (index > 0 && _line.length > 0) ?
            TextUtils.applyIndentationToLine(_line, indentation) :
            _line);
    }
    static getSelectionIndentation(document, selection) {
        return document.getText(new vscode.Range(selection.start.translate(0, -selection.start.character), selection.start));
    }
}
exports.default = TextUtils;
//# sourceMappingURL=textUtils.js.map