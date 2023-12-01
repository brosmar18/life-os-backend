// tasks/handler.js
'use strict';

const Chance = require('chance');
const chance = new Chance();
const SocketClient = require('../../server/lib/SocketClient');
const taskManagerName = 'Task Manager';
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const serverUrl = `http://localhost:${PORT}/lifeOS`;

let projectIds = [];
let taskCounter = 0;

function createTask(projectId) {
    taskCounter++
    const taskId = `T-${taskCounter}`;
    return {
        projectId,
        taskId,
        taskName: chance.word(),
        deadline: chance.date({string: true})
    };
}


function startTasksProcess() {
    const socketClient = new SocketClient(taskManagerName, serverUrl);
    // Verify the serverUrl includes the namespace
    console.log(`Connecting to server at: ${serverUrl}`);


    socketClient.subscribe('new-project', (payload) => {
        projectIds.push(payload.projectId);
        console.log(`Task Manager: New Project ID ${payload.projectId} added to the list`);
    });

    setInterval(() => {

        if (projectIds.length > 0) {
            const projectId = projectIds[0];
            const task = createTask(projectId);
            console.log(`Task Manager: Adding new task ID: ${task.taskId} to project ID ${projectId}`);
            socketClient.publish('new-task', task);

            setTimeout(() => {
                console.log(`Task Manager: Marking task ID ${task.taskId} in project ID ${projectId} as completed!`);
                socketClient.publish('task-completed', { ...task, status: 'completed' });
            }, 10000);
        }
    }, 20000);
}

module.exports = { startTasksProcess };
