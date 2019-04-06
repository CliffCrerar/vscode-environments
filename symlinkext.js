/* ---------------------------------------------------------------------------------------- */
// DEFINE PROCEDURE PARAMS
const projectExtensions /* DEFINE THE PROJECT IN THE .vscode FOLDER */ = 'react';
const initPath = '/Users/cliff/.vscode/extensions';
const symlinkto = projectExtensions + '/extensions';
/* ---------------------------------------------------------------------------------------- */
// IMPORT NODE MODS REQUIRED TO COMPLETE PROCEDURE
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
/* ---------------------------------------------------------------------------------------- */
/* PROCEDURE VARIABLES */
const linkFromExt = fs.readdirSync(initPath); // get dir to link from
const linkToExt = fs.readdirSync(path.join(initPath, '../', symlinkto)); // dir to link to
const ignore = ['.DS_Store']; // objects to ignore
const existingLinks = []; // Array of existing links
// Validation Report variables
let sysObjCheck = 0;
let sysObjIgnored = 0;
let sysObjDir = 0;
let linksValid = 0;
let unlinked = 0;
let unlinkErr = 0;
// Link action report variables
let linksCreated = 0;
let linkCreationErr = 0;
/* ---------------------------------------------------------------------------------------- */
/* VALIDATION */
function validateLinks() {
	linkToExt.forEach((dir, i) => {
		sysObjCheck++;
		if (ignore.includes(dir)) {
			console.log('dir: ', dir);
			console.log(`MESSAGE: operation is ignoring ${dir}`);
			sysObjIgnored++;
			return;
		}
		const pathToCheck = path.join(initPath, '../', symlinkto, dir);
		const isLink = fs.lstatSync(pathToCheck).isSymbolicLink();
		if (!isLink) {
			sysObjDir++;
			return;
		}
		if (isLink && linkFromExt.includes(dir)) {
			existingLinks.push(dir);
			linksValid++;
		} else {
			fs.unlink(pathToCheck, (err) => {
				if (err) {
					console.log('Error occured while unlinking', dir, ' ERROR: ', err);
					unlinkErr++;
				}
			});
			unlinked++;
		}
	});
}
/* ----------------------------------------------------------------------------------------*/
/* CREATE NEW LINKS */
function creatLinks() {
	linkFromExt.forEach(link => {
		//console.log('link: ', link);
		if (
			ignore.includes(link) ||
			existingLinks.includes(link)
		) { return; }// go to next iteration if file to ignore or existing link.
		const linkPathOrigin = path.join(initPath, link);
		// console.log('linkPathOrigin: ', linkPathOrigin);
		const linkPathDest = path.join(initPath, '../', symlinkto, link);
		//console.log('linkPathDest: ', linkPathDest);
		const linkCommand = `ln -s ${linkPathOrigin} ${linkPathDest}`;
		//console.log('linkCommand: ', linkCommand);
		let linkErr;
		//console.log(existingLinks.length);
		if (!existingLinks.includes(link)) {
			cp.exec(linkCommand, err => {
				if (err) {
					console.log('ERROR creating link for', link, err);
					linkErr = err
					linkCreationErr++;
				}
			});
			linksCreated++;
		}
	})
}
Promise.resolve(validateLinks()).then(() => creatLinks()).then(() => report());
/* ----------------------------------------------------------------------------------------*/
/** Operation report */
function report() {
	console.log(' ');
	console.log('-------------------------------------------------------------');
	console.log(' ');
	console.log('##  OBJECT VALIDATION REPORT');
	console.log(' ');
	console.log('    -Object validated:', sysObjCheck);
	console.log('    -Object ignored:', sysObjIgnored);
	console.log('    -Object directories:', sysObjDir);
	console.log('    -Object valid links:', linksValid);
	console.log('    -Object unlinked:', unlinked);
	console.log('    -Object unlink errors:', unlinkErr);
	console.log(' ');
	console.log('##  OBJECT LINK REPORT');
	console.log('    -Objects linked:', linksCreated);
	console.log('    -Object link errors:', linkCreationErr);
	console.log(' ');
	console.log('-------------------------------------------------------------');
}


