'use strict';

const SocketClient = require('../../server/lib/SocketClient');
const calendarName = 'Calendar Manager';
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const serverUrl = `http://localhost:${PORT}/lifeOS`;

class CalendarManager {
    constructor() {
        this.deadlines = {}; 
        this.socketClient = new SocketClient(calendarName, serverUrl);
        this.subscribeToEvents();
    }

    addDeadline(id, deadline) {
        this.deadlines[id] = deadline;
        console.log(`Calendar Manager: Deadline for ${id} set for ${deadline}`);
    }

    removeDeadline(id) {
        if (this.deadlines[id]) {
            delete this.deadlines[id];
            console.log(`Calendar Manager: Deadline removed for ${id}`);
        }
    }

    subscribeToEvents() {
        this.socketClient.subscribe('new-project', (payload) => {
            this.addDeadline(payload.projectId, payload.deadline);
        });

        this.socketClient.subscribe('new-task', (payload) => {
            this.addDeadline(payload.taskId, payload.dueDate);
        });

        this.socketClient.subscribe('task-completed', (payload) => {
            this.removeDeadline(payload.taskId);
        });

        this.socketClient.subscribe('project-completed', (payload) => {
            this.removeDeadline(payload.projectId);
        });
    }
}

function startCalendarProcess() {
    new CalendarManager();
}

module.exports = { startCalendarProcess };
