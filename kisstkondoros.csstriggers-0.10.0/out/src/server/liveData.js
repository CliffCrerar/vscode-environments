"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const csstriggers_1 = require("./csstriggers");
function fetchCssTriggers() {
    return new Promise((resolve, reject) => {
        https
            .get("https://raw.githubusercontent.com/GoogleChromeLabs/css-triggers/master/data/data.json", response => {
            var body = "";
            response.setEncoding("utf8");
            response.on("data", function (d) {
                body += d;
            });
            response.on("end", function () {
                var parsed = JSON.parse(body);
                Object.keys(parsed.data).forEach(key => {
                    csstriggers_1.cssTriggers.data[key] = parsed.data[key];
                });
                resolveMissingValues(csstriggers_1.cssTriggers.data);
                resolve(csstriggers_1.cssTriggers);
            });
        })
            .on("error", function (e) {
            console.log("Got error while fetching css triggers data from github: " + e.message);
            resolveMissingValues(csstriggers_1.cssTriggers.data);
            resolve(csstriggers_1.cssTriggers);
        });
    });
}
exports.fetchCssTriggers = fetchCssTriggers;
function resolveMissingValues(data) {
    data["margin"] = data["margin-left"];
    data["padding"] = data["padding-left"];
    data["border"] = data["border-left-width"];
    data["border-radius"] = data["border"];
    data["border-color"] = data["border-left-color"];
    data["border-style"] = data["border-left-style"];
    data["border-width"] = data["border-left-width"];
    data["outline"] = data["outline-width"];
    data["overflow"] = data["overflow-x"];
    data["background"] = data["background-color"];
}
//# sourceMappingURL=liveData.js.map