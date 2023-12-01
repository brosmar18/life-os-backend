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
        deadline: chance.date({ year: 2023}).toISOString()
    };
}

function startProjectProcess() {
    const socketClient = new SocketClient(projectName, serverUrl);

    // creates new project at setInterval 
    setInterval(() => {
        const project = createProject();
        console.log(`Project Manager: Creating new project ID: ${project.projectId}`);
        socketClient.publish('new-project', project);
    }, 5000);
}

module.exports = {startProjectProcess};