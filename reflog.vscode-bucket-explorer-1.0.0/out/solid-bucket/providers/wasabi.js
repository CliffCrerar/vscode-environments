"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const aws_1 = require("./aws");
function getWasabi(options) {
    const wasabiEndpoint = new AWS.Endpoint("s3.wasabisys.com");
    const wasabi = new AWS.S3({
        endpoint: wasabiEndpoint,
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
    });
    return new aws_1.AwsWrapper(wasabi);
}
exports.getWasabi = getWasabi;
//# sourceMappingURL=wasabi.js.map