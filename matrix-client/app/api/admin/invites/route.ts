import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes - in production, use a database
let invites: {
  id: string;
  code: string;
  matrixId: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
  notes?: string;
  createdBy: string;
  usedAt?: string;
  usedBy?: string;
}[] = [
  {
    id: '1',
    code: '1708203600_abc123def4567890',
    matrixId: '@alice:matrix.org',
    createdAt: '2024-02-17T18:00:00Z',
    expiresAt: '2024-02-24T18:00:00Z',
    status: 'active',
    notes: 'Invite for Alice from team demo',
    createdBy: '@admin:matrix.org'
  },
  {
    id: '2',
    code: '1708117200_xyz789abc1234567',
    matrixId: '@bob:example.com',
    createdAt: '2024-02-16T18:00:00Z',
    expiresAt: '2024-02-23T18:00:00Z',
    status: 'used',
    notes: 'Invite for Bob - developer',
    createdBy: '@admin:matrix.org',
    usedAt: '2024-02-16T20:30:00Z',
    usedBy: '@bob:example.com'
  },
  {
    id: '3',
    code: '1707944400_def456ghi7890123',
    matrixId: '@charlie:homeserver.com',
    createdAt: '2024-02-14T18:00:00Z',
    expiresAt: '2024-02-16T18:00:00Z',
    status: 'expired',
    notes: 'Test invite - expired',
    createdBy: '@admin:matrix.org'
  }
];

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await authenticateAdmin(request);
    
    // Update expired status
    const now = new Date().toISOString();
    invites.forEach(invite => {
      if (invite.status === 'active' && invite.expiresAt < now) {
        invite.status = 'expired';
      }
    });

    return NextResponse.json({ invites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await authenticateAdmin(request);
    
    const { matrixId, expiresIn, notes } = await request.json();

    if (!matrixId) {
      return NextResponse.json({ error: 'Matrix ID is required' }, { status: 400 });
    }

    // Generate invite code with timestamp and random string
    const timestamp = Math.floor(Date.now() / 1000);
    const randomString = Math.random().toString(36).substring(2, 18);
    const code = `${timestamp}_${randomString}`;

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (expiresIn || 7 * 24 * 60 * 60 * 1000)); // Default 7 days

    const newInvite = {
      id: Date.now().toString(),
      code,
      matrixId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active' as const,
      notes,
      createdBy: '@admin:matrix.org' // TODO: Get from authenticated user
    };

    invites.unshift(newInvite);

    return NextResponse.json({ invite: newInvite });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await authenticateAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 });
    }

    const inviteIndex = invites.findIndex(invite => invite.id === inviteId);
    if (inviteIndex === -1) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Mark as expired instead of deleting
    invites[inviteIndex].status = 'expired';

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking invite:', error);
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 });
  }
}