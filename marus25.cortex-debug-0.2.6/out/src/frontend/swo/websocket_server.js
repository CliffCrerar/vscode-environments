"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require('ws');
const RingBuffer = require('ringbufferjs');
class SWOSocketServer {
    constructor(serverPort, graphs) {
        this.graphs = graphs;
        this.messageBuffer = new RingBuffer(250000);
        this.currentStatus = 'stopped';
        this.processors = [];
        this.socket = new WebSocket.Server({ port: serverPort });
        this.socket.on('connection', this.connected.bind(this));
    }
    connected(client) {
        client.on('message', (message) => this.message(client, message));
        client.send(JSON.stringify({ type: 'configure', graphs: this.graphs, status: this.currentStatus }));
    }
    chunk(array, size) {
        const results = [];
        while (array.length) {
            results.push(array.splice(0, size));
        }
        return results;
    }
    message(client, message) {
        const msg = JSON.parse(message);
        if (msg.history) {
            const hm = this.messageBuffer.peekN(this.messageBuffer.size());
            const chunks = this.chunk(hm, 500);
            chunks.forEach((chunk, idx) => {
                setTimeout(() => {
                    client.send(JSON.stringify({
                        type: 'history',
                        messages: chunk
                    }));
                }, idx * 5);
            });
        }
    }
    registerProcessor(processor) {
        processor.on('message', this.broadcastMessage.bind(this));
        this.processors.push(processor);
    }
    broadcastMessage(message) {
        const encoded = JSON.stringify(message);
        this.socket.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(encoded);
            }
        });
        this.messageBuffer.enq(message);
    }
    dispose() {
        this.socket.close();
    }
}
exports.SWOSocketServer = SWOSocketServer;
//# sourceMappingURL=websocket_server.js.map