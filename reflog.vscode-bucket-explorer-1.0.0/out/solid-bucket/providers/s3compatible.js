"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const aws_1 = require("./aws");
function getS3Compatible(options) {
    const endpoint = new AWS.Endpoint(options.endpoint);
    const s3Compatible = new AWS.S3({
        endpoint: endpoint,
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
    });
    return new aws_1.AwsWrapper(s3Compatible);
}
exports.getS3Compatible = getS3Compatible;
//# sourceMappingURL=s3compatible.js.map