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

// Matrix Server Discovery Types

export interface MatrixServerInfo {
  server_name: string;
  homeserver: string;
  description?: string;
  avatar_url?: string;
  user_count?: number;
  room_count?: number;
  country?: string;
  country_code?: string;
  state_list?: string[];
  tags?: string[];
  website?: string;
  matrix_id?: string;
  public?: boolean;
}

export interface ServerDiscoveryFilters {
  query?: string;
  category?: string;
  country?: string;
  minUsers?: number;
  maxUsers?: number;
  tags?: string[];
}

export interface ServerDiscoveryResponse {
  servers: MatrixServerInfo[];
  total: number;
  page: number;
  hasMore: boolean;
  categories?: string[];
}

export interface ServerHealthStatus {
  server: string;
  online: boolean;
  latency?: number;
  checkedAt: number;
}