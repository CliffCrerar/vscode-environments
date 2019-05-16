"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELECTION_ANCHOR = '$a605add6-6288-4061-8727-c878c27e0d20$';
function extractSelectionAnchor(source) {
    const selectionPos = source.indexOf(exports.SELECTION_ANCHOR);
    source = source.replace(exports.SELECTION_ANCHOR, '');
    return {
        source,
        selection: {
            anchor: selectionPos,
            active: selectionPos
        }
    };
}
exports.extractSelectionAnchor = extractSelectionAnchor;
//# sourceMappingURL=extractSelectionAnchor.js.map