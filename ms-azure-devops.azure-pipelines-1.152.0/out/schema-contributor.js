"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("./logger");
const vscode_uri_1 = require("vscode-uri");
// TODO: Add tests for this class.
// TODO: Can we just get rid of this class?
class SchemaContributor {
    constructor() {
        this._customSchemaContributors = {};
    }
    /**
     * Register a custom schema provider
     *
     * @param {string} the provider's name
     * @param requestSchema the requestSchema function
     * @param requestSchemaContent the requestSchemaContent function
     * @returns {boolean}
     */
    registerContributor(schema, requestSchema, requestSchemaContent) {
        if (this._customSchemaContributors[schema]) {
            return false;
        }
        if (!requestSchema) {
            throw new Error("Illegal parameter for requestSchema.");
        }
        this._customSchemaContributors[schema] = {
            requestSchema,
            requestSchemaContent
        };
        return true;
    }
    // TODO: Rewrite comments.
    /**
     * Call requestSchema for each provider and find the first one who reports he can provide the schema.
     *
     * @param {string} resource
     * @returns {string} the schema uri
     */
    requestCustomSchema(resource) {
        // TODO: This is what gets called on every request(I think), it's looking at the cached schema files. I think here is where we want to periodically
        //       check what's on the server. The code in schema-association-service.getSchemaAssociation()
        // Check relationship with result of getSchemaAssociationFromYamlValidationNode. Does this load the files specified there? Make sure this code is needed.
        for (let customKey of Object.keys(this._customSchemaContributors)) {
            const contributor = this._customSchemaContributors[customKey];
            const uri = contributor.requestSchema(resource);
            if (uri) {
                return uri;
            }
            else {
                logger.log(`Uri NOT found for resource (${resource})`);
            }
        }
        throw `Unable to find custom schema for resource: '${resource}'`;
    }
    // TODO: Rewrite comments.
    /**
     * Call requestCustomSchemaContent for named provider and get the schema content.
     *
     * @param {string} uri the schema uri returned from requestSchema.
     * @returns {string} the schema content
     */
    requestCustomSchemaContent(uri) {
        console.log('requestCustomSchemaContent');
        if (uri) {
            let _uri = vscode_uri_1.default.parse(uri);
            if (_uri.scheme && this._customSchemaContributors[_uri.scheme] &&
                this._customSchemaContributors[_uri.scheme].requestSchemaContent) {
                return this._customSchemaContributors[_uri.scheme].requestSchemaContent(uri);
            }
        }
        throw `Unable to find custom schema content for uri: '${uri}'`;
    }
}
// global instance
// TODO: Do this differently... why not instantiate? Static? Something else.
const schemaContributor = new SchemaContributor();
exports.schemaContributor = schemaContributor;
//schemaContributor.registerContributor("", "", "");
exports.CUSTOM_SCHEMA_REQUEST = 'custom/schema/request';
exports.CUSTOM_CONTENT_REQUEST = 'custom/schema/content';
//# sourceMappingURL=schema-contributor.js.map