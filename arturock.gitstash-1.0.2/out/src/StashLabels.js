'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const StashNode_1 = require("./StashNode");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    /**
     * Generates a stash item name.
     *
     * @param node The node to be used as base
     */
    getEntryName(node) {
        return this.parseItemLabel(node, this.config.settings.entryFormat);
    }
    /**
     * Generates a stash item tooltip.
     *
     * @param node The node to be used as base
     */
    getEntryTooltip(node) {
        return this.parseItemLabel(node, this.config.settings.entryTooltipFormat);
    }
    /**
     * Generates a stash item label.
     *
     * @param node The node to be used as base
     */
    parseItemLabel(node, template) {
        return template
            .replace('${index}', node.index.toString())
            .replace('${branch}', this.getEntryBranch(node))
            .replace('${description}', this.getEntryDescription(node))
            .replace('${date}', node.date);
    }
    /**
     * Generates a stashed file name.
     *
     * @param node The node to be used as base
     */
    getFileName(node) {
        return this.parseFileLabel(node, this.config.settings.fileFormat);
    }
    /**
     * Generates a stashed file tooltip.
     *
     * @param node The node to be used as base
     */
    getFileTooltip(node) {
        return this.parseFileLabel(node, this.config.settings.fileTooltipFormat);
    }
    /**
     * Generates a stashed file label.
     *
     * @param node The node to be used as base
     */
    parseFileLabel(node, template) {
        return template
            .replace('${filename}', path.basename(node.name))
            .replace('${filepath}', `${path.dirname(node.name)}/`)
            .replace('${type}', this.getTypeLabel(node));
    }
    /**
     * Generates the diff document title name.
     *
     * @param node the file node to be shown
     */
    getDiffTitle(node) {
        return this.config.settings.diffTitleFormat
            .replace('${filename}', path.basename(node.name))
            .replace('${filepath}', `${path.dirname(node.name)}/`)
            .replace('${date}', node.date)
            .replace('${stashIndex}', node.parent.index)
            .replace('${description}', this.getEntryDescription(node.parent))
            .replace('${branch}', this.getEntryBranch(node.parent))
            .replace('${type}', this.getTypeLabel(node));
    }
    /**
     * Gets the node entry branch.
     *
     * @param node the source node
     */
    getEntryBranch(node) {
        return node.name.indexOf('WIP on ') === 0
            ? node.name.substring(7, node.name.indexOf(':'))
            : node.name.substring(3, node.name.indexOf(':'));
    }
    /**
     * Gets the node entry description.
     *
     * @param node the source node
     */
    getEntryDescription(node) {
        return node.name.substring(node.name.indexOf(':') + 2);
    }
    /**
     * Gets a label for the node type.
     *
     * @param node the source node
     */
    getTypeLabel(node) {
        switch (node.type) {
            case StashNode_1.NodeType.Untracked: return 'Untracked';
            case StashNode_1.NodeType.IndexAdded: return 'Index Added';
            case StashNode_1.NodeType.Modified: return 'Modified';
            case StashNode_1.NodeType.Deleted: return 'Deleted';
            default: return 'Other';
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=StashLabels.js.map