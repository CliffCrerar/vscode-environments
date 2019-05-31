'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const StashNode_1 = require("./StashNode");
class default_1 {
    constructor(config) {
        this.config = config;
    }
    /**
     * Generates a node name.
     *
     * @param node The node to be used as base
     */
    getName(node) {
        switch (node.type) {
            case StashNode_1.NodeType.Repository:
                return this.parseRepositoryLabel(node, this.config.settings.repositoryFormat);
            case StashNode_1.NodeType.Stash:
                return this.parseStashLabel(node, this.config.settings.stashFormat);
            case StashNode_1.NodeType.Deleted:
            case StashNode_1.NodeType.IndexAdded:
            case StashNode_1.NodeType.Modified:
            case StashNode_1.NodeType.Untracked:
                return this.parseFileLabel(node, this.config.settings.fileFormat);
        }
    }
    /**
     * Generates a node tooltip.
     *
     * @param node The node to be used as base
     */
    getTooltip(node) {
        switch (node.type) {
            case StashNode_1.NodeType.Repository:
                return this.parseRepositoryLabel(node, this.config.settings.repositoryTooltipFormat);
            case StashNode_1.NodeType.Stash:
                return this.parseStashLabel(node, this.config.settings.stashTooltipFormat);
            case StashNode_1.NodeType.Deleted:
            case StashNode_1.NodeType.IndexAdded:
            case StashNode_1.NodeType.Modified:
            case StashNode_1.NodeType.Untracked:
                return this.parseFileLabel(node, this.config.settings.fileTooltipFormat);
        }
    }
    /**
     * Generates a repository label.
     *
     * @param repositoryNode The node to be used as base
     */
    parseRepositoryLabel(repositoryNode, template) {
        return template
            .replace('${name}', repositoryNode.name)
            .replace('${directory}', path.basename(repositoryNode.path))
            .replace('${path}', repositoryNode.path);
    }
    /**
     * Generates a stash item label.
     *
     * @param stashNode The node to be used as base
     */
    parseStashLabel(stashNode, template) {
        return template
            .replace('${index}', stashNode.index.toString())
            .replace('${branch}', this.getStashBranch(stashNode))
            .replace('${description}', this.getStashDescription(stashNode))
            .replace('${date}', stashNode.date);
    }
    /**
     * Generates a stashed file label.
     *
     * @param fileNode The node to be used as base
     */
    parseFileLabel(fileNode, template) {
        return template
            .replace('${filename}', path.basename(fileNode.name))
            .replace('${filepath}', `${path.dirname(fileNode.name)}/`)
            .replace('${type}', this.getTypeLabel(fileNode));
    }
    /**
     * Generates the diff document title name.
     *
     * @param fileNode the file node to be shown
     * @param hint     the hint reference to know file origin
     */
    getDiffTitle(fileNode, hint) {
        return this.config.settings.diffTitleFormat
            .replace('${filename}', path.basename(fileNode.name))
            .replace('${filepath}', `${path.dirname(fileNode.name)}/`)
            .replace('${date}', fileNode.date)
            .replace('${stashIndex}', fileNode.parent.index)
            .replace('${description}', this.getStashDescription(fileNode.parent))
            .replace('${branch}', this.getStashBranch(fileNode.parent))
            .replace('${type}', this.getTypeLabel(fileNode))
            .replace('${hint}', this.getHint(fileNode, hint));
    }
    /**
     * Gets the stash description.
     *
     * @param stashNode the source node
     */
    getStashDescription(stashNode) {
        return stashNode.name.substring(stashNode.name.indexOf(':') + 2);
    }
    /**
     * Gets the stash branch.
     *
     * @param stashNode the source node
     */
    getStashBranch(stashNode) {
        return stashNode.name.indexOf('WIP on ') === 0
            ? stashNode.name.substring(7, stashNode.name.indexOf(':'))
            : stashNode.name.substring(3, stashNode.name.indexOf(':'));
    }
    /**
     * Gets a label for the file node type.
     *
     * @param fileNode the source node
     */
    getTypeLabel(fileNode) {
        switch (fileNode.type) {
            case StashNode_1.NodeType.Untracked: return 'Untracked';
            case StashNode_1.NodeType.IndexAdded: return 'Index Added';
            case StashNode_1.NodeType.Modified: return 'Modified';
            case StashNode_1.NodeType.Deleted: return 'Deleted';
            default: return 'Other';
        }
    }
    /**
     * Generates a hint for the file node title.
     *
     * @param fileNode the source node
     */
    getHint(fileNode, fromStash) {
        const type = this.getTypeLabel(fileNode).toLowerCase();
        const reference = fromStash ? 'original' : 'actual';
        const values = fromStash
            ? { l: reference, r: type }
            : { l: type, r: reference };
        return `${values.l} ⟷ ${values.r}`;
    }
}
exports.default = default_1;
//# sourceMappingURL=StashLabels.js.map