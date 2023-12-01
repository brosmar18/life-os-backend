// projects/handler.js
'use strict';

const Chance = require('chance');
const chance = new Chance();
const SocketClient = require('../../server/lib/SocketClient');
const projectName = 'Project Manager';
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const serverUrl = `http://localhost:${PORT}/lifeOS`;

function createProject() {
    return {
        projectId: chance.guid(),
        name: chance.word(),
        description: chance.sentence(),
        deadline: chance.date({ year: 2023 }).toISOString()
    };
}

function startProjectProcess() {
    const socketClient = new SocketClient(projectName, serverUrl);

    // Subscribe to new-task event
    socketClient.subscribe('new-task', (payload) => {
        console.log(`Project Manager: Task ID ${payload.taskId} added to Project ID ${payload.projectId}`);
    });

    // Subscribe to task-completed event
    socketClient.subscribe('task-completed', (payload) => {
        console.log(`Project Manager: Task ID ${payload.taskId} in Project ID ${payload.projectId} completed`);
    });

    socketClient.subscribe('project-completed', (payload) => {
        console.log(`Project Manager: Project ID ${payload.projectId} completed`);
    });

    // Creates new project at setInterval 
    setInterval(() => {
        const project = createProject();
        console.log(`Project Manager: Creating new project ID: ${project.projectId}`);
        socketClient.publish('new-project', project);
    }, 15000);
}

module.exports = { startProjectProcess };
