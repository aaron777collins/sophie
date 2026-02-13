import { createClient, MatrixClient, LoginFlow, LoginResponse, User } from 'matrix-js-sdk';

// Matrix authentication error types
export class MatrixAuthError extends Error {
  public readonly errorCode?: string;
  public readonly homeserverUrl?: string;

  constructor(message: string, errorCode?: string, homeserverUrl?: string) {
    super(message);
    this.name = 'MatrixAuthError';
    this.errorCode = errorCode;
    this.homeserverUrl = homeserverUrl;
  }
}

export class InvalidCredentialsError extends MatrixAuthError {
  constructor(homeserverUrl: string) {
    super('Invalid username or password', 'M_FORBIDDEN', homeserverUrl);
  }
}

export class HomeserverUnavailableError extends MatrixAuthError {
  constructor(serverUrl: string, originalError?: Error) {
    super(
      `Matrix homeserver at ${serverUrl} is unavailable`, 
      'M_HOMESERVER_UNAVAILABLE', 
      serverUrl
    );

    // Attach original error for debugging
    if (originalError) {
      this.cause = originalError;
    }
  }
}

export class SessionValidationError extends MatrixAuthError {
  constructor(homeserverUrl: string, errorCode?: string) {
    super(
      'Failed to validate session', 
      errorCode || 'M_UNKNOWN_TOKEN', 
      homeserverUrl
    );
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
 * Validate Matrix homeserver URL
 * @throws {HomeserverUnavailableError} if URL is invalid
 */
function validateHomeserverUrl(homeserverUrl: string): void {
  // Basic URL validation
  if (!homeserverUrl) {
    throw new HomeserverUnavailableError('(empty URL)', 
      new Error('Homeserver URL cannot be empty'));
  }

  try {
    new URL(homeserverUrl);
  } catch (error) {
    throw new HomeserverUnavailableError(homeserverUrl, error instanceof Error ? error : undefined);
  }
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
  // Validate homeserver URL first
  validateHomeserverUrl(homeserverUrl);

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
      throw new InvalidCredentialsError(homeserverUrl);
    }

    // Return session details
    return {
      accessToken: loginResponse.access_token,
      userId: loginResponse.user_id,
      deviceId: loginResponse.device_id,
      homeserverUrl: homeserverUrl
    };
  } catch (err) {
    const error = err as { errcode?: string; message?: string; name?: string; code?: string };
    // Distinguish between different error types
    if (error.errcode === 'M_FORBIDDEN' || error.message?.includes('Invalid credentials')) {
      throw new InvalidCredentialsError(homeserverUrl);
    }

    // Network-related or connection errors
    if (error.name === 'TypeError' || error.code === 'ENOTFOUND') {
      throw new HomeserverUnavailableError(homeserverUrl, err instanceof Error ? err : undefined);
    }

    // If an existing MatrixAuthError, re-throw
    if (err instanceof MatrixAuthError) {
      throw err;
    }

    // Wrap other unexpected errors
    throw new MatrixAuthError(
      error.message || 'Unexpected error during login', 
      'M_UNKNOWN_ERROR', 
      homeserverUrl
    );
  }
}

/**
 * Validate an existing Matrix session
 * @param homeserverUrl Matrix homeserver URL
 * @param accessToken Session access token to validate
 * @returns Promise resolving to MatrixUser if session is valid
 * @throws {SessionValidationError} If session is invalid or cannot be validated
 */
export async function validateSession(
  homeserverUrl: string, 
  accessToken: string
): Promise<MatrixUser> {
  // Validate homeserver URL first
  validateHomeserverUrl(homeserverUrl);

  try {
    // Create Matrix client with the access token
    const client = createClient({
      baseUrl: homeserverUrl,
      accessToken: accessToken
    });

    // Validate access token by fetching own user profile
    const whoami = await client.whoami();

    // Ensure whoami returns a valid user ID
    if (!whoami.user_id) {
      throw new SessionValidationError(homeserverUrl, 'M_INVALID_USER');
    }

    // Attempt to get user profile
    const userProfile = await client.getProfileInfo(whoami.user_id);

    // Return user details
    return {
      userId: whoami.user_id,
      displayName: userProfile.displayname,
      avatarUrl: userProfile.avatar_url
    };
  } catch (err) {
    const error = err as { errcode?: string; message?: string; name?: string; code?: string };
    // Handle various authentication errors
    if (error.errcode === 'M_UNKNOWN_TOKEN' || 
        error.message?.includes('Invalid access token')) {
      throw new SessionValidationError(homeserverUrl, 'M_UNKNOWN_TOKEN');
    }

    // Network-related errors
    if (error.name === 'TypeError' || error.code === 'ENOTFOUND') {
      throw new HomeserverUnavailableError(homeserverUrl, err instanceof Error ? err : undefined);
    }

    // If an existing MatrixAuthError, re-throw
    if (err instanceof MatrixAuthError) {
      throw err;
    }

    // Wrap other unexpected errors
    throw new SessionValidationError(
      homeserverUrl, 
      'M_UNKNOWN_ERROR'
    );
  }
}