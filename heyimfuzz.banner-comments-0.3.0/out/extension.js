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
const fs = require("fs");
const path = require("path");
const commentJson = require("comment-json");
const figlet = require("figlet");
const textUtils_1 = require("./textUtils");
/*
..######...##........#######..########.....###....##........######.
.##....##..##.......##.....##.##.....##...##.##...##.......##....##
.##........##.......##.....##.##.....##..##...##..##.......##......
.##...####.##.......##.....##.########..##.....##.##........######.
.##....##..##.......##.....##.##.....##.#########.##.............##
.##....##..##.......##.....##.##.....##.##.....##.##.......##....##
..######...########..#######..########..##.....##.########..######.
*/
const HEADER_TYPE = { H1: "h1", H2: "h2", H3: "h3" };
/*
..######...#######..##.....##.##.....##....###....##....##.########...######.
.##....##.##.....##.###...###.###...###...##.##...###...##.##.....##.##....##
.##.......##.....##.####.####.####.####..##...##..####..##.##.....##.##......
.##.......##.....##.##.###.##.##.###.##.##.....##.##.##.##.##.....##..######.
.##.......##.....##.##.....##.##.....##.#########.##..####.##.....##.......##
.##....##.##.....##.##.....##.##.....##.##.....##.##...###.##.....##.##....##
..######...#######..##.....##.##.....##.##.....##.##....##.########...######.
*/
/*
..####...#####...#####...##......##..##..........######..#####....####...##...##.
.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
.######..#####...#####...##........##............####....#####...##..##..##.#.##.
.##..##..##......##......##........##............##......##..##..##..##..##...##.
.##..##..##......##......######....##............##......##..##...####...##...##.
.................................................................................
.##......######...####...######.
.##........##....##........##...
.##........##.....####.....##...
.##........##........##....##...
.######..######...####.....##...
................................
*/
function applyFromList() {
    const editor = vscode.window.activeTextEditor;
    // An active editor session is required to apply banner comment.
    if (!editor) {
        return vscode.window.showErrorMessage("Banner-comments: No active editor (Open a file).");
    }
    let commentTags = getCommentTags(editor.document.languageId);
    let availableFigletfonts = figlet.fontsSync();
    let quickPickFigletFonts = availableFigletfonts.map((figletFontName) => {
        return {
            label: figletFontName,
            description: "Add the " + figletFontName + " font to favorites",
        };
    });
    vscode.window.showQuickPick(quickPickFigletFonts).then((_selectedPickerItem) => {
        if (!_selectedPickerItem)
            return;
        let config = vscode.workspace.getConfiguration("banner-comments");
        const figletConfig = {
            font: _selectedPickerItem.label,
            horizontalLayout: config.get("figlet.horizontalLayout"),
            verticalLayout: config.get("figlet.verticalLayout")
        };
        editor.edit((builder) => {
            editor.selections.forEach(_selection => replaceSelectionWithBanner(editor.document, builder, _selection, figletConfig, commentTags));
        });
    });
}
/*
..####...#####...#####...##......##..##..........######..#####....####...##...##.
.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
.######..#####...#####...##........##............####....#####...##..##..##.#.##.
.##..##..##......##......##........##............##......##..##..##..##..##...##.
.##..##..##......##......######....##............##......##..##...####...##...##.
.................................................................................
.##..##..######...####...#####...######..#####..
.##..##..##......##..##..##..##..##......##..##.
.######..####....######..##..##..####....#####..
.##..##..##......##..##..##..##..##......##..##.
.##..##..######..##..##..#####...######..##..##.
................................................
*/
function applyFromHeader(headerType) {
    const editor = vscode.window.activeTextEditor;
    // An active editor session is required to apply banner comment.
    if (!editor) {
        return vscode.window.showErrorMessage("Banner-comments: No active editor (Open a file).");
    }
    let config = vscode.workspace.getConfiguration("banner-comments");
    let commentTags = getCommentTags(editor.document.languageId);
    const figletConfig = {
        font: vscode.workspace.getConfiguration("banner-comments").get(headerType),
        horizontalLayout: config.get("figlet.horizontalLayout"),
        verticalLayout: config.get("figlet.verticalLayout")
    };
    editor.edit((builder) => {
        editor.selections.forEach(_selection => replaceSelectionWithBanner(editor.document, builder, _selection, figletConfig, commentTags));
    });
}
/*
..####...#####...#####...##......##..##..........######..#####....####...##...##.
.##..##..##..##..##..##..##.......####...........##......##..##..##..##..###.###.
.######..#####...#####...##........##............####....#####...##..##..##.#.##.
.##..##..##......##......##........##............##......##..##..##..##..##...##.
.##..##..##......##......######....##............##......##..##...####...##...##.
.................................................................................
.######...####...##..##...####...#####...######..######..######...####..
.##......##..##..##..##..##..##..##..##....##......##....##......##.....
.####....######..##..##..##..##..#####.....##......##....####.....####..
.##......##..##...####...##..##..##..##....##......##....##..........##.
.##......##..##....##.....####...##..##..######....##....######...####..
........................................................................
*/
function applyFromFavorite() {
    const editor = vscode.window.activeTextEditor;
    // An active editor session is required to apply banner comment.
    if (!editor) {
        return vscode.window.showErrorMessage("Banner-comments: No active editor (Open a file).");
    }
    let commentTags = getCommentTags(editor.document.languageId);
    getFavoriteFontFromUser((err, font) => {
        if (err) {
            vscode.window.showErrorMessage("Banner-comments: An error occured while getting a favorite font from user! See the logs for more information.");
            return console.error(err);
        }
        if (!font)
            return;
        let config = vscode.workspace.getConfiguration("banner-comments");
        const figletConfig = {
            font: font,
            horizontalLayout: config.get("figlet.horizontalLayout"),
            verticalLayout: config.get("figlet.verticalLayout")
        };
        editor.edit((builder) => {
            editor.selections.forEach(_selection => replaceSelectionWithBanner(editor.document, builder, _selection, figletConfig, commentTags));
        });
    });
}
/*
..####...######..######..........######...####...##..##..######.
.##......##........##............##......##..##..###.##....##...
..####...####......##............####....##..##..##.###....##...
.....##..##........##............##......##..##..##..##....##...
..####...######....##............##.......####...##..##....##...
................................................................
*/
function setHeaderFont(headerType) {
    var availableFigletfonts = figlet.fontsSync();
    var quickPickFigletFonts = availableFigletfonts.map((figletFontName) => {
        return {
            label: figletFontName,
            description: "Use the " + figletFontName + " font",
        };
    });
    vscode.window.showQuickPick(quickPickFigletFonts).then((_selectedPickerItem) => {
        if (!_selectedPickerItem)
            return;
        let config = vscode.workspace.getConfiguration("banner-comments");
        config.update(headerType, _selectedPickerItem.label, true);
        console.log(`Banner-comments: Updated font setting to '${_selectedPickerItem.label}'`);
    });
}
/*
..####...#####...#####...........######...####..
.##..##..##..##..##..##............##....##..##.
.######..##..##..##..##............##....##..##.
.##..##..##..##..##..##............##....##..##.
.##..##..#####...#####.............##.....####..
................................................
.######...####...##..##...####...#####...######..######..######.
.##......##..##..##..##..##..##..##..##....##......##....##.....
.####....######..##..##..##..##..#####.....##......##....####...
.##......##..##...####...##..##..##..##....##......##....##.....
.##......##..##....##.....####...##..##..######....##....######.
................................................................
*/
function addAFontToFavorites() {
    let availableFigletfonts = figlet.fontsSync();
    let quickPickFigletFonts = availableFigletfonts.map((figletFontName) => {
        return {
            label: figletFontName,
            description: "Add the " + figletFontName + " font to favorites",
        };
    });
    vscode.window.showQuickPick(quickPickFigletFonts).then((_selectedPickerItem) => {
        if (!_selectedPickerItem)
            return;
        let config = vscode.workspace.getConfiguration("banner-comments");
        let favorites = config.favorites;
        if (favorites.includes(_selectedPickerItem.label)) {
            vscode.window.showInformationMessage(`Banner-comments: Font '${_selectedPickerItem.label}' is already in favorites!`);
            return;
        }
        favorites.push(_selectedPickerItem.label);
        config.update("favorites", favorites, true);
        console.log(`Banner-comments: Added '${_selectedPickerItem.label}' font to favorites`);
    });
}
/*
.#####...######..##...##...####...##..##..######..........######..#####....####...##...##.
.##..##..##......###.###..##..##..##..##..##..............##......##..##..##..##..###.###.
.#####...####....##.#.##..##..##..##..##..####............####....#####...##..##..##.#.##.
.##..##..##......##...##..##..##...####...##..............##......##..##..##..##..##...##.
.##..##..######..##...##...####.....##....######..........##......##..##...####...##...##.
..........................................................................................
.######...####...##..##...####...#####...######..######..######...####..
.##......##..##..##..##..##..##..##..##....##......##....##......##.....
.####....######..##..##..##..##..#####.....##......##....####.....####..
.##......##..##...####...##..##..##..##....##......##....##..........##.
.##......##..##....##.....####...##..##..######....##....######...####..
........................................................................
*/
function removeFromFavorites() {
    let config = vscode.workspace.getConfiguration("banner-comments");
    let favorites = config.favorites;
    if (favorites.length == 0) {
        vscode.window.showErrorMessage("Banner-comments: The list of favorite fonts is empty, can't remove from empty list!");
        return;
    }
    getFavoriteFontFromUser((err, font) => {
        if (err) {
            vscode.window.showErrorMessage("Banner-comments: An error occured while getting a favorite font from user! See the logs for more information.");
            return console.error(err);
        }
        if (!font)
            return;
        if (!favorites.includes(font)) {
            vscode.window.showErrorMessage(`Banner-comments: Font '${font}' isn't in the list of favorites!`);
            return;
        }
        favorites.splice(favorites.indexOf(font), 1);
        config.update("favorites", favorites, true);
        console.log(`Banner-comments: Added '${font}' font to favorites`);
    });
}
/*
.########..#######...#######..##........######.
....##....##.....##.##.....##.##.......##....##
....##....##.....##.##.....##.##.......##......
....##....##.....##.##.....##.##........######.
....##....##.....##.##.....##.##.............##
....##....##.....##.##.....##.##.......##....##
....##.....#######...#######..########..######.
*/
function getCommentTags(languageId) {
    let commentTags = null;
    let langConfig = getLanguageConfig(languageId);
    if (!langConfig) {
        console.warn("Banner-comments: No matching vscode language extension found. No comment tag will be applied.");
    }
    else {
        commentTags = langConfig.comments;
    }
    return commentTags;
}
/*
..####...######..######..........######...####...##..##...####...#####...######..######..######.
.##......##........##............##......##..##..##..##..##..##..##..##....##......##....##.....
.##.###..####......##............####....######..##..##..##..##..#####.....##......##....####...
.##..##..##........##............##......##..##...####...##..##..##..##....##......##....##.....
..####...######....##............##......##..##....##.....####...##..##..######....##....######.
................................................................................................
.######..#####....####...##...##..........##..##...####...######..#####..
.##......##..##..##..##..###.###..........##..##..##......##......##..##.
.####....#####...##..##..##.#.##..........##..##...####...####....#####..
.##......##..##..##..##..##...##..........##..##......##..##......##..##.
.##......##..##...####...##...##...........####....####...######..##..##.
.........................................................................
*/
function getFavoriteFontFromUser(callback) {
    let favorites = vscode.workspace.getConfiguration("banner-comments").get("favorites");
    if (favorites.length == 0) {
        callback(new Error("The list of favorite fonts is empty, please add some using the command 'Add favorite font'"), null);
    }
    var quickPickFavorites = favorites.map((favoriteFigletFontName) => {
        return {
            label: favoriteFigletFontName,
            description: "Use the " + favoriteFigletFontName + " font",
        };
    });
    vscode.window.showQuickPick(quickPickFavorites).then((_selectedPickerItem) => {
        callback(null, _selectedPickerItem.label);
    });
}
/*
..####...######..######...........####....####...##..##..######..######...####..
.##......##........##............##..##..##..##..###.##..##........##....##.....
.##.###..####......##............##......##..##..##.###..####......##....##.###.
.##..##..##........##............##..##..##..##..##..##..##........##....##..##.
..####...######....##.............####....####...##..##..##......######...####..
................................................................................
*/
/*
 * Loops through the extensions to find the one containing the definition of the provided languageId.
 * Returns the content of the corresponding "language-configuration.json" or the equivalent file.
*/
function getLanguageConfig(languageId) {
    const excludedIds = ["plaintext"];
    // Provided language id not supported.
    if (excludedIds.includes(languageId)) {
        return console.error(`Provided language id: '${languageId}' not supported!`);
    }
    // Finding language config filepath.
    let configFilepath = null;
    for (const _ext of vscode.extensions.all) {
        if (_ext.id.startsWith("vscode.") &&
            _ext.packageJSON.contributes &&
            _ext.packageJSON.contributes.languages) {
            const languagePackages = _ext.packageJSON.contributes.languages;
            const packageLangData = languagePackages.find(_lang => (_lang.id === languageId));
            if (!!packageLangData) {
                configFilepath = path.join(_ext.extensionPath, packageLangData.configuration);
                break;
            }
        }
    }
    // Can't continue if no config file was found.
    if (!configFilepath || !fs.existsSync(configFilepath)) {
        return console.error(`No configuration file exists for the provided language id: '${languageId}'!`);
    }
    /**
     * unfortunatly, some of vscode's language config contains
     * comments in the json file, which breaks the default node parser ("xml" and "xsl" for example).
     * To resolve this problem, I had to use the `commentJson` library.
     */
    return commentJson.parse(fs.readFileSync(configFilepath, "utf8"));
}
/*
.#####...######..#####...##.......####....####...######.
.##..##..##......##..##..##......##..##..##..##..##.....
.#####...####....#####...##......######..##......####...
.##..##..##......##......##......##..##..##..##..##.....
.##..##..######..##......######..##..##...####...######.
........................................................
..####...######..##......######...####...######..######...####...##..##.
.##......##......##......##......##..##....##......##....##..##..###.##.
..####...####....##......####....##........##......##....##..##..##.###.
.....##..##......##......##......##..##....##......##....##..##..##..##.
..####...######..######..######...####.....##....######...####...##..##.
........................................................................
*/
/*
 * Replaces the provided selection with a figlet banner using the provided figlet config.
 * Formats the generated figlet banner using the provided commentTags.
*/
function replaceSelectionWithBanner(document, builder, selection, figletConfig, commentTags) {
    let indentation = textUtils_1.default.getSelectionIndentation(document, selection);
    let lines;
    let selectionText = document.getText(selection);
    // We don't process empty selection
    if (selectionText.length == 0)
        return;
    try {
        // Apply figlet on selection text.
        lines = figlet.textSync(selectionText, figletConfig).split("\n");
        // Format lines
        lines = textUtils_1.default.removeTrailingWhitespaces(lines);
        if (commentTags)
            lines = textUtils_1.default.wrapLinesWithComments(lines, commentTags);
        lines = textUtils_1.default.applyIndentationToLines(lines, indentation);
    }
    catch (err) {
        vscode.window.showErrorMessage("Banner-comments: " + err.message);
        return;
    }
    builder.replace(selection, lines.join("\n"));
}
/*
.########.##.....##.########.########.##....##..######..####..#######..##....##
.##........##...##.....##....##.......###...##.##....##..##..##.....##.###...##
.##.........##.##......##....##.......####..##.##........##..##.....##.####..##
.######......###.......##....######...##.##.##..######...##..##.....##.##.##.##
.##.........##.##......##....##.......##..####.......##..##..##.....##.##..####
.##........##...##.....##....##.......##...###.##....##..##..##.....##.##...###
.########.##.....##....##....########.##....##..######..####..#######..##....##
*/
/*
..####....####...######..######..##..##...####...######..######.
.##..##..##..##....##......##....##..##..##..##....##....##.....
.######..##........##......##....##..##..######....##....####...
.##..##..##..##....##......##.....####...##..##....##....##.....
.##..##...####.....##....######....##....##..##....##....######.
................................................................
*/
function activate(context) {
    context.subscriptions.push(
    /**
     * Banner-comment command to apply the font to selection.
     */
    vscode.commands.registerCommand("extension.bannerCommentApplyFromList", _ => applyFromList()), vscode.commands.registerCommand("extension.bannerCommentApplyH1", _ => applyFromHeader("h1")), vscode.commands.registerCommand("extension.bannerCommentApplyH2", _ => applyFromHeader("h2")), vscode.commands.registerCommand("extension.bannerCommentApplyH3", _ => applyFromHeader("h3")), vscode.commands.registerCommand("extension.bannerCommentApplyFavorite", _ => applyFromFavorite()), 
    /**
     * Banner-comment command to set the font and save it to the workspace configuration.
     */
    vscode.commands.registerCommand("extension.bannerCommentSetH1Font", _ => setHeaderFont("h1")), vscode.commands.registerCommand("extension.bannerCommentSetH2Font", _ => setHeaderFont("h2")), vscode.commands.registerCommand("extension.bannerCommentSetH3Font", _ => setHeaderFont("h3")), 
    /**
     * Banner-comment command to add a font to the list of favorites which saves into workspace configuration.
     */
    vscode.commands.registerCommand("extension.bannerCommentAddToFavorite", _ => addAFontToFavorites()), vscode.commands.registerCommand("extension.bannerCommentRemoveFromFavorite", _ => removeFromFavorites()));
}
exports.activate = activate;
/*
.#####...######...####....####...######..######..##..##...####...######..######.
.##..##..##......##..##..##..##....##......##....##..##..##..##....##....##.....
.##..##..####....######..##........##......##....##..##..######....##....####...
.##..##..##......##..##..##..##....##......##.....####...##..##....##....##.....
.#####...######..##..##...####.....##....######....##....##..##....##....######.
................................................................................
*/
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map