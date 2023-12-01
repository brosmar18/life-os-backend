'use strict';

const { Server } = require('socket.io');
require('dotenv').config();
const PORT = process.env.PORT || 5002;
const server = new Server();
const lifeOS = server.of('/lifeOS');
const Queue = require('./lib/queue');
const messageQueue = new Queue();

lifeOS.on('connection', (socket) => {
    console.log(`Client Connected: ${socket.id}`);

    socket.on('join', (room) => {
        console.log(`Socket ${socket.id} joined room ${room}`);
        socket.join(room);
    });

    // project created. 
    socket.on('new-project', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-project', payload);
        console.log(`New Project Created: Project ID ${payload.projectId}`);
        socket.broadcast.emit('new-project', payload);
    });

    // task added to project. 
    socket.on('new-task', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-task', payload);
        console.log(`New Task Added: Task ID ${payload.taskId} in Project ID ${payload.projectId}`);
        socket.to(payload.projectId).emit('new-task', payload);
    });

    // task marked as completed.
    socket.on('task-completed', (payload) => {
        messageQueue.addMessage(payload.projectId, 'task-completed', payload);
        console.log(`Task Completed: Task ID ${payload.taskId} in Project ID ${payload.projectId}`);
        socket.to(payload.projectId).emit('task-completed', payload);
    });

    // schedule an event. 
    socket.on('new-event', (payload) => {
        messageQueue.addMessage(payload.projectId, 'new-event', payload);
        console.log(`New Event Scheduled: Event ID ${payload.eventId} for Project ID ${payload.projectId}`);
        socket.to(payload.projectId).emit('new-event', payload);
    });

    socket.on('received', ({ clientId, event, messageId}) => {
        messageQueue.acknoledgeMessage(clientId, event, messageId);
    });

    socket.on('getAll', ({ clientId, event}) => {
        const messages = messageQueue.getMessages(clientId, event);
        messages.forEach((message) => {
            socket.emit(event, message);
        });
    });
});

server.listen(PORT, () => {
  console.log(`Life OS Server is up and running on port ${PORT}`);
});
