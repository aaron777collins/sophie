// Matrix Reaction Type Definition

export interface MatrixReaction {
  emoji: string;
  users: string[]; // Matrix user IDs who reacted
}

export interface MatrixMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  reactions?: MatrixReaction[];
}