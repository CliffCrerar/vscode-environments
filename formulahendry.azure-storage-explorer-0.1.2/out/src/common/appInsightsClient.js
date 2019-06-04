"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appInsights = require("applicationinsights");
const utility_1 = require("./utility");
class AppInsightsClient {
    static sendEvent(eventName, properties) {
        if (this._enableTelemetry) {
            this._client.trackEvent(eventName, properties);
        }
    }
}
AppInsightsClient._client = appInsights.getClient("59e02958-e856-422b-97c0-caf495a4194d");
AppInsightsClient._enableTelemetry = utility_1.Utility.getConfiguration().get("enableTelemetry");
exports.AppInsightsClient = AppInsightsClient;
//# sourceMappingURL=appInsightsClient.js.map