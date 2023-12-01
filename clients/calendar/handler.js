'use strict';

const SocketClient = require('../../server/lib/SocketClient');
const calendarName = 'Calendar Manager';
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const serverUrl = `http://localhost:${PORT}/lifeOS`;

function startCalendarProcess() {
    const deadlines = {};

    const socketClient = new SocketClient(calendarName, serverUrl);

    function addDeadline(type, id, deadline) {
        deadlines[id] = deadline;
        console.log(`[Calendar Manager] ${type} Deadline for ID ${id} set for ${deadline}`);
    }

    function removeDeadline(type, id) {
        if (deadlines[id]) {
            delete deadlines[id];
            console.log(`[Calendar Manager] ${type} Deadline removed for ID ${id}`);
        }
    }

    socketClient.subscribe('new-project', (payload) => {
        addDeadline('Project', payload.projectId, payload.deadline);
    });

    socketClient.subscribe('new-task', (payload) => {
        if (payload.deadline) {
            addDeadline('Task', payload.taskId, payload.deadline);
        } else {
            console.log(`[Calendar Manager] Received new task without due date: ID - ${payload.taskId}`);
        }
    });

    socketClient.subscribe('task-completed', (payload) => {
        removeDeadline('Task', payload.taskId);
    });

    socketClient.subscribe('project-completed', (payload) => {
        removeDeadline('Project', payload.projectId);
    });

    console.log('[Calendar Manager] Started');
}

module.exports = { startCalendarProcess };
