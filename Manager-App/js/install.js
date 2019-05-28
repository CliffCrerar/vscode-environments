const spawn = require("child_process").spawnSync,
	path = require("path"),
	process = require("process");

var stdOut;
var stdErr;
module.exports = function (extList, dir) {
<<<<<<< HEAD:js/install.js
	const extInstallationFormat = formatForInstall(extList);
	let instCnt = extInstallationFormat.length,
		errors = 0,
		installed = 0,
		notInstalled = [],
		instMeta = { errors, installed, notInstalled };
	runChildProcessCommand("--extensions-dir", dir, null, null, instMeta);
	extInstallationFormat.forEach((ext, idx) => {
		runChildProcessCommand(
			"--install-extension",
			ext,
			idx,
			instCnt,
			instMeta
		);
	});
	console.log(instMeta);
=======
  const extInstallationFormat = formatForInstall(extList);
  let instCnt = extInstallationFormat.length,
    errors = 0,
    installed = 0,
    notInstalled = [],
    instMeta = { errors, installed, notInstalled };
  runChildProcessCommand("--extensions-dir", dir, null, null, instMeta);
  extInstallationFormat.forEach((ext, idx) => {
    runChildProcessCommand(
      "--install-extension",
      ext,
      idx,
      instCnt,
      instMeta
    );
  });
  console.log(instMeta);
>>>>>>> 9e37b7d7caf69a4e10921b66e17f6862a376b048:Manager-App/js/install.js
};

function formatForInstall(extList) {
	//console.log('extList: ', extList);
	return extList.map(ext => `${ext.publisher}.${ext.name}`);
}
function runChildProcessCommand(
	option,
	param,
	thisInsCount,
	totalInstall,
	{ errors, installed, notInstalled }
) {
	const isInstall = option === "--install-extension";
	isInstall &&
		console.log(
			"|---------------------START INSTALLATION---------------------------|"
		);
	isInstall && console.log("|> ", `${thisInsCount + 1} of ${totalInstall}`);
	isInstall && console.log("|> ", param);

	return spawn(
		"code",
		[option, param],
		{
			cwd: process.cwd(),
			detached: false,
			stdio: "inherit",
			encoding: "utf8"
		},
		(err, stdout, stderr) => {
			if (err) {
				isInstall &&
					console.log("######################################################");
				isInstall &&
					console.error("#### ERROR Installing: ", param, "STACK:", err);
				isInstall &&
					console.log("######################################################");
				stdOut = Buffer.aloc(stdout);
				stderr = Buffer.aloc(stderr);
				errors++;
				isInstall && notInstalled.push(param);
				isInstall &&
					console.log(
						"|-------------------------ERROR END-------------------------------|"
					);
			} else {
				stdOut = Buffer.aloc(stdout);
				stderr = Buffer.aloc(stderr);
				isInstall && installed++;
				isInstall &&
					console.log(
						"|---------------------------COMPLETE------------------------------|"
					);
			}
		}
	);
}
