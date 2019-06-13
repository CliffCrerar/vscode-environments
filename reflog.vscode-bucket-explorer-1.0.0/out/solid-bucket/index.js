"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_1 = require("./providers/aws");
const s3compatible_1 = require("./providers/s3compatible");
const digitalocean_1 = require("./providers/digitalocean");
const wasabi_1 = require("./providers/wasabi");
const gcs_1 = require("./providers/gcs");
const azure_1 = require("./providers/azure");
const rackspace_1 = require("./providers/rackspace");
class SolidBucketError extends Error {
    constructor(data) {
        super(data.message);
        this.status = data.status;
    }
}
exports.SolidBucketError = SolidBucketError;
class SolidBucket {
    constructor(provider, options) {
        if (provider === "aws") {
            if (!options.accessKeyId || !options.secretAccessKey) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return aws_1.getAWS(options);
        }
        else if (provider === "digitalocean") {
            if (!options.accessKeyId || !options.secretAccessKey) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return digitalocean_1.getDigitalOcean(options);
        }
        else if (provider === "wasabi") {
            if (!options.accessKeyId || !options.secretAccessKey) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return wasabi_1.getWasabi(options);
        }
        else if (provider === "gcs") {
            if (!options.keyFilename) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return gcs_1.getGCS(options);
        }
        else if (provider === "azure") {
            if (!options.accountName || !options.accountKey) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return azure_1.getAZURE(options);
        }
        else if (provider === "rackspace") {
            if (!options.username || !options.apiKey) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return rackspace_1.getRACKSPACE(options);
        }
        if (provider === "s3compatible") {
            if (!options.accessKeyId ||
                !options.secretAccessKey ||
                !options.endpoint) {
                throw new SolidBucketError({
                    status: 400,
                    message: "Missing Auth options"
                });
            }
            return s3compatible_1.getS3Compatible(options);
        }
        else {
            throw new SolidBucketError({
                status: 400,
                message: "Missing Auth options"
            });
        }
    }
}
exports.SolidBucket = SolidBucket;
//# sourceMappingURL=index.js.map