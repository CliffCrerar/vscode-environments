"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const languageclient = require("vscode-languageclient");
// TODO: I think we can remove this class. Make it simpler?
class SchemaAssociationService {
    constructor(extensionPath) {
        this.schemaFilePath = vscode.Uri.file(path.join(extensionPath, './service-schema.json')).toString();
    }
    getSchemaAssociation() {
        return { '*': [this.schemaFilePath] };
    }
}
exports.SchemaAssociationService = SchemaAssociationService;
// TODO: Do we need this?
var SchemaAssociationNotification;
(function (SchemaAssociationNotification) {
    SchemaAssociationNotification.type = new languageclient.NotificationType('json/schemaAssociations');
})(SchemaAssociationNotification = exports.SchemaAssociationNotification || (exports.SchemaAssociationNotification = {}));
//# sourceMappingURL=schema-association-service.js.map