"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const aws_1 = require("./aws");
function getDigitalOcean(options) {
    const region = options.region || "nyc3";
    const spacesEndpoint = new AWS.Endpoint(`${region}.digitaloceanspaces.com`);
    const digitalocean = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey
    });
    return new aws_1.AwsWrapper(digitalocean);
}
exports.getDigitalOcean = getDigitalOcean;
//# sourceMappingURL=digitalocean.js.map