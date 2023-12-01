const { startTasksProcess } = require('./handler');
const io = require('socket.io-client');

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


describe('Task Manager Handler', () => {
    let mockSocket;

    beforeEach(() => {
      io.mockClear();
      mockSocket = { emit: jest.fn(), on: jest.fn() };
      io.mockReturnValue(mockSocket);
      jest.spyOn(console, 'log'); 
      jest.useFakeTimers();
      startTasksProcess();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.useRealTimers();
    });

    it('should set up subscription to new-project and start emitting tasks', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('new-project', expect.any(Function));

      
      const newProjectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'new-project')[1];
      newProjectCallback({ projectId: 'P-1' });

      jest.advanceTimersByTime(20000);
      expect(mockSocket.emit).toHaveBeenCalledWith('new-task', expect.objectContaining({ projectId: 'P-1', taskId: expect.any(String) }));
    });

    it('should mark task as completed after a delay', () => {
      
      const newProjectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'new-project')[1];
      newProjectCallback({ projectId: 'P-1' });

      jest.advanceTimersByTime(20000);
      jest.advanceTimersByTime(10000); 
      expect(mockSocket.emit).toHaveBeenCalledWith('task-completed', expect.objectContaining({ projectId: 'P-1', taskId: expect.any(String), status: 'completed' }));
    });
});
