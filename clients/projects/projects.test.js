jest.mock('socket.io-client', () => {
    return jest.fn().mockImplementation(() => {
      return {
        emit: jest.fn(),
        on: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        close: jest.fn(),
      };
    });
});

const { startProjectProcess } = require('./handler');
const io = require('socket.io-client');

describe('Project Manager Handler', () => {
    let mockSocket;

    beforeEach(() => {
      io.mockClear();
      mockSocket = { emit: jest.fn(), on: jest.fn() };
      io.mockReturnValue(mockSocket);
      jest.spyOn(console, 'log'); 
      jest.useFakeTimers();
      startProjectProcess();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    it('should set up subscriptions and start creating projects', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('new-task', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('task-completed', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('project-completed', expect.any(Function));

      jest.advanceTimersByTime(30000);
      expect(mockSocket.emit).toHaveBeenCalledWith('new-project', expect.objectContaining({ projectId: expect.any(String) }));
    });

    it('should log new-task messages correctly', () => {
      const testPayload = { taskId: 'T-1', projectId: 'P-1' };
      const newTaskCallback = mockSocket.on.mock.calls.find(call => call[0] === 'new-task')[1];
      newTaskCallback(testPayload);
      expect(console.log).toHaveBeenCalledWith(`Project Manager: Task ID ${testPayload.taskId} added to Project ID ${testPayload.projectId}`);
    });

    it('should log task-completed and project-completed messages correctly', () => {
      const testPayloadTask = { taskId: 'T-1', projectId: 'P-1' };
      const taskCompletedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'task-completed')[1];
      taskCompletedCallback(testPayloadTask);
      expect(console.log).toHaveBeenCalledWith(`Project Manager: Task ID ${testPayloadTask.taskId} in Project ID ${testPayloadTask.projectId} completed`);

      const testPayloadProject = { projectId: 'P-1' };
      const projectCompletedCallback = mockSocket.on.mock.calls.find(call => call[0] === 'project-completed')[1];
      projectCompletedCallback(testPayloadProject);
      expect(console.log).toHaveBeenCalledWith(`Project Manager: Project ID ${testPayloadProject.projectId} completed`);
    });
});
