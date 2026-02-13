import { TypingService } from './TypingService';
import { MatrixClient } from 'matrix-js-sdk';

describe('TypingService', () => {
  let mockMatrixClient: jest.Mocked<MatrixClient>;
  let typingService: TypingService;
  const testRoomId = '!testroom:example.com';

  beforeEach(() => {
    mockMatrixClient = {
      sendTyping: jest.fn(),
    } as unknown as jest.Mocked<MatrixClient>;

    typingService = new TypingService(mockMatrixClient);
  });

  test('should send typing start event when input has text', () => {
    typingService.startTyping(testRoomId);

    expect(mockMatrixClient.sendTyping).toHaveBeenCalledWith(
      testRoomId, 
      true, 
      5000
    );
  });

  test('should send typing stop event when input is empty', () => {
    typingService.stopTyping(testRoomId);

    expect(mockMatrixClient.sendTyping).toHaveBeenCalledWith(
      testRoomId, 
      false
    );
  });

  test('should rate limit typing events', () => {
    // Send typing start multiple times quickly
    typingService.startTyping(testRoomId);
    typingService.startTyping(testRoomId);
    typingService.startTyping(testRoomId);

    // Only the first call should actually send the typing event
    expect(mockMatrixClient.sendTyping).toHaveBeenCalledTimes(1);
  });

  test('should clear typing timeout when stopping typing', () => {
    jest.useFakeTimers();

    typingService.startTyping(testRoomId);
    
    // Fast forward past the typing timeout
    jest.advanceTimersByTime(6000);

    typingService.stopTyping(testRoomId);

    expect(mockMatrixClient.sendTyping).toHaveBeenCalledWith(
      testRoomId, 
      false
    );

    jest.useRealTimers();
  });
});