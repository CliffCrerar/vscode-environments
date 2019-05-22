"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a wrapped uri containing the module name
 */
class ReadmeUri {
    /**
     * Creates an instance given it's components
     * @param rawUri a raw uri
     * @param moduleName a module name
     */
    constructor(rawUri, moduleName) {
        this._rawUri = rawUri;
        this._moduleName = moduleName;
    }
    /**
     * Creates an instance from a uri and a module name
     * @param uri the uri to include
     * @param moduleName the module name to include
     */
    static from(uri, moduleName) {
        // if we're using the method as described above
        if (moduleName) {
            return new ReadmeUri(uri, moduleName);
            // if we're using the method overload
        }
        else {
            const moduleName = uri.path.substr(uri.path.lastIndexOf(ReadmeUri.encodingSeparator) + 1);
            const decodedUri = uri.with({
                path: uri.path.substr(0, uri.path.lastIndexOf(ReadmeUri.encodingSeparator))
            });
            return new ReadmeUri(decodedUri, moduleName);
        }
    }
    /**
     * Encodes a module name and uri together
     * @returns {Uri} encoded uri
     */
    toEncodedUri() {
        return this._rawUri.with({
            path: `${this._rawUri.path}${ReadmeUri.encodingSeparator}${this._moduleName}`
        });
    }
    /**
     * @returns {Uri} the underlying uri
     */
    get rawUri() {
        return this._rawUri;
    }
    /**
     * @returns {string} the underlying module name
     */
    get moduleName() {
        return this._moduleName;
    }
}
/**
 * We use this for encoding and decoding
 *
 * using a / allows us to piggypack the markdown previewer behavior of showing the last slug
 * as the current tab title
 */
ReadmeUri.encodingSeparator = "/";
exports.ReadmeUri = ReadmeUri;
exports.overrideConfigurationSection = "nodeReadme.overrides";
//# sourceMappingURL=type-extensions.js.map