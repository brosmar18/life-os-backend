'use strict';

const { Server } = require('socket.io');
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const server = new Server();
const lifeOS = server.of('/lifeOS');
const Queue = require('./lib/queue');
const messageQueue = new Queue();

const projectTasks = {};

lifeOS.on('connection', (socket) => {
    console.log(`[Server] Client Connected: Socket ID - ${socket.id}`);

    socket.on('join', (room) => {
        console.log(`[Server] Socket ${socket.id} joined room: ${room}`);
        socket.join(room);
    });

    // Project created
    socket.on('new-project', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-project', payload);
        console.log(`[Server] New Project Created: ID - ${payload.projectId}, Name - ${payload.name}`);
        socket.broadcast.emit('new-project', payload);

        // Initialize task tracking for the new project
        projectTasks[payload.projectId] = { total: 0, completed: 0 };
    });

    // Task added to project
    socket.on('new-task', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-task', payload);
        console.log(`[Server] New Task Added: ID - ${payload.taskId}, Name - ${payload.taskName}, to Project ID - ${payload.projectId}`);
        socket.to(payload.projectId).emit('new-task', payload);

        if (projectTasks[payload.projectId]) {
            projectTasks[payload.projectId].total++;
        }
    });

    // Task marked as completed
    socket.on('task-completed', (payload) => {
        messageQueue.addMessage(payload.projectId, 'task-completed', payload);
        console.log(`[Server] Task Completed: ID - ${payload.taskId}, Name - ${payload.taskName}, in Project ID - ${payload.projectId}`);
        socket.to(payload.projectId).emit('task-completed', payload);

        if (projectTasks[payload.projectId]) {
            projectTasks[payload.projectId].completed++;
            if (projectTasks[payload.projectId].completed === projectTasks[payload.projectId].total) {
                console.log(`[Server] Project Completed: ID - ${payload.projectId}`);
                lifeOS.emit('project-completed', { projectId: payload.projectId });
            }
        }
    });

    // Schedule an event
    socket.on('new-event', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-event', payload);
        console.log(`[Server] New Event Scheduled: ID - ${payload.eventId}, for Project ID - ${payload.projectId}`);
        socket.to(payload.projectId).emit('new-event', payload);
    });

    socket.on('received', ({ clientId, event, messageId}) => {
        messageQueue.acknowledgeMessage(clientId, event, messageId);
    });

    socket.on('getAll', ({ clientId, event}) => {
        const messages = messageQueue.getMessages(clientId, event);
        messages.forEach((message) => {
            socket.emit(event, message);
        });
    });
});

server.listen(PORT, () => {
    console.log(`[Server] Life OS Server is up and running on port ${PORT}`);
});
