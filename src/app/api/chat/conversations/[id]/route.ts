import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 参加者チェック
    const isParticipant = conversation.participants.some(
      (p) => p.userId === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
