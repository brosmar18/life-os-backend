const { startCalendarProcess } = require('./handler');
const io = require('socket.io-client');

jest.mock('socket.io-client');

describe('Calendar Manager Handler', () => {
    let mockOn;

    beforeEach(() => {
        mockOn = jest.fn();
        io.mockImplementation(() => {
            return {
                on: mockOn,
                emit: jest.fn(),
            };
        });

        mockSocket = io();
        jest.spyOn(console, 'log').mockImplementation();
        startCalendarProcess();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should set up subscriptions to new-project, new-task, task-completed, and project-completed', () => {
        expect(mockOn).toHaveBeenCalledWith('new-project', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('new-task', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('task-completed', expect.any(Function));
        expect(mockOn).toHaveBeenCalledWith('project-completed', expect.any(Function));
    });

    it('should log correctly when a new project deadline is added', () => {
        const testPayload = { projectId: 'P-1', deadline: '2023-01-01' };
        const newProjectCallback = mockOn.mock.calls.find(call => call[0] === 'new-project')[1];
        newProjectCallback(testPayload);
        expect(console.log).toHaveBeenCalledWith(`[Calendar Manager] Project Deadline for ID ${testPayload.projectId} set for ${testPayload.deadline}`);
    });

    it('should log correctly when a new task deadline is added', () => {
        const testPayload = { taskId: 'T-1', deadline: '2023-01-02' };
        const newTaskCallback = mockOn.mock.calls.find(call => call[0] === 'new-task')[1];
        newTaskCallback(testPayload);
        expect(console.log).toHaveBeenCalledWith(`[Calendar Manager] Task Deadline for ID ${testPayload.taskId} set for ${testPayload.deadline}`);
    });

    it('should log a message when receiving a new task without a due date', () => {
        const testPayload = { taskId: 'T-1' };
        const newTaskCallback = mockOn.mock.calls.find(call => call[0] === 'new-task')[1];
        newTaskCallback(testPayload);
        expect(console.log).toHaveBeenCalledWith(`[Calendar Manager] Received new task without due date: ID - ${testPayload.taskId}`);
    });

    it('should log correctly when a task deadline is removed', () => {

        const testTaskPayload = { taskId: 'T-1', deadline: '2023-01-02' };
        const newTaskCallback = mockOn.mock.calls.find(call => call[0] === 'new-task')[1];
        newTaskCallback(testTaskPayload);


        const taskCompletedPayload = { taskId: 'T-1' };
        const taskCompletedCallback = mockOn.mock.calls.find(call => call[0] === 'task-completed')[1];
        taskCompletedCallback(taskCompletedPayload);

        expect(console.log).toHaveBeenCalledWith(`[Calendar Manager] Task Deadline removed for ID ${taskCompletedPayload.taskId}`);
    });

    it('should log correctly when a project deadline is removed', () => {

        const testProjectPayload = { projectId: 'P-1', deadline: '2023-01-01' };
        const newProjectCallback = mockOn.mock.calls.find(call => call[0] === 'new-project')[1];
        newProjectCallback(testProjectPayload);


        const projectCompletedPayload = { projectId: 'P-1' };
        const projectCompletedCallback = mockOn.mock.calls.find(call => call[0] === 'project-completed')[1];
        projectCompletedCallback(projectCompletedPayload);

        expect(console.log).toHaveBeenCalledWith(`[Calendar Manager] Project Deadline removed for ID ${projectCompletedPayload.projectId}`);
    });
});
