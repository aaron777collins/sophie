import { createClient, MatrixClient, LoginFlow, LoginResponse, User } from 'matrix-js-sdk';

// Matrix authentication error types
export class MatrixAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MatrixAuthError';
  }
}

export class InvalidCredentialsError extends MatrixAuthError {
  constructor() {
    super('Invalid username or password');
  }
}

export class HomeserverUnavailableError extends MatrixAuthError {
  constructor(serverUrl: string) {
    super(`Matrix homeserver at ${serverUrl} is unavailable`);
  }
}

export interface MatrixSession {
  accessToken: string;
  userId: string;
  deviceId: string;
  homeserverUrl: string;
}

export interface MatrixUser {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Authenticate with Matrix homeserver using username and password
 * @param homeserverUrl Matrix homeserver URL
 * @param username User's Matrix username (e.g., @username:matrix.org)
 * @param password User's password
 * @returns Promise resolving to MatrixSession on successful login
 * @throws {InvalidCredentialsError} If login fails due to incorrect credentials
 * @throws {HomeserverUnavailableError} If homeserver cannot be reached
 */
export async function loginWithPassword(
  homeserverUrl: string, 
  username: string, 
  password: string
): Promise<MatrixSession> {
  try {
    // Create Matrix client with just the homeserver URL
    const client = createClient({ baseUrl: homeserverUrl });

    // Attempt login
    const loginResponse: LoginResponse = await client.login('m.login.password', {
      user: username,
      password: password,
      type: 'm.login.password'
    });

    // Validate login response
    if (!loginResponse.access_token) {
      throw new InvalidCredentialsError();
    }

    // Return session details
    return {
      accessToken: loginResponse.access_token,
      userId: loginResponse.user_id,
      deviceId: loginResponse.device_id,
      homeserverUrl: homeserverUrl
    };
  } catch (error) {
    // Distinguish between different error types
    if (error.errcode === 'M_FORBIDDEN') {
      throw new InvalidCredentialsError();
    }

    if (error.name === 'TypeError' || error.code === 'ENOTFOUND') {
      throw new HomeserverUnavailableError(homeserverUrl);
    }

    // Rethrow any other unexpected errors
    throw error;
  }
}

/**
 * Validate an existing Matrix session
 * @param homeserverUrl Matrix homeserver URL
 * @param accessToken Session access token to validate
 * @returns Promise resolving to MatrixUser if session is valid
 * @throws {MatrixAuthError} If session is invalid or cannot be validated
 */
export async function validateSession(
  homeserverUrl: string, 
  accessToken: string
): Promise<MatrixUser> {
  try {
    // Create Matrix client with the access token
    const client = createClient({
      baseUrl: homeserverUrl,
      accessToken: accessToken
    });

    // Attempt to get user profile
    const userProfile = await client.getProfileInfo(client.credentials.userId);

    // Return user details
    return {
      userId: client.credentials.userId,
      displayName: userProfile.displayname,
      avatarUrl: userProfile.avatar_url
    };
  } catch (error) {
    // Handle various authentication errors
    if (error.errcode === 'M_UNKNOWN_TOKEN') {
      throw new MatrixAuthError('Session token is invalid or expired');
    }

    if (error.name === 'TypeError' || error.code === 'ENOTFOUND') {
      throw new HomeserverUnavailableError(homeserverUrl);
    }

    // Rethrow any other unexpected errors
    throw error;
  }
}