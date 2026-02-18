import { env } from "@/lib/env";

export interface ClientConfig {
  homeserver: string;
  privateMode: boolean;
  inviteRequired: boolean;
}

export async function getClientConfig(): Promise<ClientConfig> {
  // Use environment variables for configuration
  const homeserver = env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL || 'https://matrix.org';
  const privateMode = env.NEXT_PUBLIC_MELO_PRIVATE_MODE === 'true';
  const inviteRequired = env.NEXT_PUBLIC_MATRIX_INVITE_REQUIRED === 'true';

  return {
    homeserver,
    privateMode,
    inviteRequired,
  };
}