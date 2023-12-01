'use strict';

class Queue {
    constructor() {
        this.messages = {};
    }

    addMessage(clientId, event, message) {
        if (!this.messages[clientId]) {
            this.messages[clientId] = {};
        }

        if (!this.messages[clientId][event]) {
            this.messages[clientId][event] = [];
        }

        this.messages[clientId][event].push(message);
    }

    getMessages(clientId, event) {
        return this.messages[clientId] ? this.messages[clientId][event] || [] : [];
    }

    acknoledgeMessage(clientId, event, messageId) {
        if (this.messages[clientId] && this.messages[clientId][event]) {
            this.messages[clientId][event] = this.messages[clientId][event].filter(
                (message) => message.id !== messageId
            );
        }
    }
}

module.exports = Queue; 