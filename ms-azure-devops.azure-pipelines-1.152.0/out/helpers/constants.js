"use strict";
/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
class Constants {
}
Constants.ExtensionName = 'azure-pipelines';
Constants.UserAgent = 'azure-pipelines-vscode-extension';
exports.Constants = Constants;
class CommandNames {
}
CommandNames.CommandPrefix = Constants.ExtensionName + ".";
CommandNames.DisplayCurrentSchemaFile = CommandNames.CommandPrefix + 'DisplayCurrentSchemaFile';
CommandNames.LoadLatestTaskSchema = CommandNames.CommandPrefix + 'LoadLatestTaskSchema';
CommandNames.PATUpdated = CommandNames.CommandPrefix + "PATUpdated";
CommandNames.Signin = CommandNames.CommandPrefix + 'Signin';
CommandNames.Signout = CommandNames.CommandPrefix + 'Signout';
exports.CommandNames = CommandNames;
class LogEvents {
}
LogEvents.SkippingDownloadLatestTasks = 'SkippingDownloadLatestTasks';
exports.LogEvents = LogEvents;
class LogMessages {
}
LogMessages.AccountRequiredToDownloadTasks = 'Account name is required to download tasks. Please set azure-pipelines.account setting.';
LogMessages.PatRequiredToDownloadTasks = 'PAT is required to download tasks. Please set using Signin command.';
exports.LogMessages = LogMessages;
//# sourceMappingURL=constants.js.map