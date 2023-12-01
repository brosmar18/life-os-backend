'use strict';

const io = require('socket.io-client');

class SocketClient {
    constructor(clientId, serverUrl) {
        this.clientId = clientId;
        this.socket = io(serverUrl);
        this.socket.on('connect', () => {
            console.log(`${this.clientId} connected to server`);
            this.socket.emit('join', this.clientId);
        });
    }

    publish(event, payload) {
        this.socket.emit(event, payload);
    }

    subscribe(event, callback) {
        this.socket.on(event, callback);
    }
}

module.exports = SocketClient;