'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * A writable stream implementation that stores data into a buffer.
 */
class BufferStream extends stream_1.Writable {
    constructor() {
        super(...arguments);
        this.chunks = [];
    }
    _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        callback();
    }
    getBuffer() {
        return this.chunks.length ? Buffer.concat(this.chunks) : new Buffer(0);
    }
}
exports.default = BufferStream;
//# sourceMappingURL=BufferStream.js.map