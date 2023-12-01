'use strict';

const Chance = require('chance');
const chance = new Chance();
const SocketClient = require('../../server/lib/SocketClient');
const taskManagerName = 'Task Manager';
require('dotenv').config();
const PORT = process.env.PORT || 50002;
const serverUrl = `http://localhost:${PORT}/lifeOS`;

function createTask(projectId) {
    return {
        projectId,
        taskId: chance.guid(),
        taskName: chance.word(),
        dueDate: chance.date({ year: 2023 }).toISOString()
    };
}

function startTasksProcess() {
    const socketClient = new SocketClient(taskManagerName, serverUrl);

    setInterval(() => {
        const projectId = 'some-project-id';
        const task = createTask(projectId);
        console.log(`Task Manager: Adding new task ID: ${task.taskId} to project ID ${projectId}`);
        socketClient.publish('new-task', task);

        setTimeout(() => {
            console.log(`Task Manager: Marking task ID ${task.taskId} in project ID ${projectId} as completed!`);
            socketClient.publish('task-completed', { ...task, status: 'completed'});
        }, 5000)
    }, 10000)
}

module.exports = { startTasksProcess};