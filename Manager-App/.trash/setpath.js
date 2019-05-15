const os = require("os");
const cp = require("child_process");
console.log(cp);
const fs = require("fs");
//console.log(os);
//console.log('os: ', os.platform());
const path = require("path");
const process = require("process");
console.log("process: ", process);
//console.log('path: ', path.win32.basename());
const thisDir = __dirname;
const dfnAppend = process.argv[2] || "/";
const vscodeConfigPath =
	process.argv[3] ||
	"/Applications/Visual Studio Code.app/Contents/Resources/app";
const fileToAmend = process.argv[4] || "product.json";

console.log("dfnAppend: ", dfnAppend);
console.log("fileToAmendName: ", fileToAmend);
console.log("vscodeConfigPath: ", vscodeConfigPath);

function appropriateFileAppend(splitter, oFname, fnameApp) {
	return `${oFname.split(splitter)[0]}${splitter === "/" ? "/" : "\\"}${fnameApp}`;
}

function changeVsCodeDataFolder(dfn, cpath, fta) {
	const ptf = path.join(cpath, fta);

	const fileObject = JSON.parse(fs.readFileSync(ptf, "utf8"));
	console.log("fileObject: ", fileObject.dataFolderName);
	// evaluate name
	const propName = fileObject.dataFolderName;
	if (propName.includes("/")) {
		console.log("run file eval for mac");
		if (`.vscode/${dfn}` == fileObject.dataFolderName) {
			console.log("Extentions path not need changing");
			return;
		}
		fileObject.dataFolderName = appropriateFileAppend("/", propName, dfn);
	} else if (propName.includes("\\")) {
		console.log("Implement file eval for win");
	} else {
		fileObject.dataFolderName = path.join(fileObject.dataFolderName, dfn);
	}
	console.log("ptf: ", ptf);
	console.log("STOPPED");
	const testVar = fs.writeFileSync(ptf, JSON.stringify(fileObject), "utf8");
	console.log("testVar: ", testVar);
	console.log("STOPPED");
}
console.log("STOPPED");
const msg = () => console.log("process completed");
Promise.resolve(
	changeVsCodeDataFolder(dfnAppend, vscodeConfigPath, fileToAmend)
).then(() => msg());

// /Users/cliff/.vscode/extensions

// /Applications/Visual Studio Code.app/Contents/Resources/app
