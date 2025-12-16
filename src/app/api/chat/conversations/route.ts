import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createConversationSchema = z.object({
  userIds: z.array(z.string()).min(1),
  title: z.string().nullable().optional(),
  isDirect: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
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
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { userIds, title, isDirect } = parsed.data;

    // 参加者のIDリストを作成（自分+選択したユーザー）
    const participantIds = [session.user.id, ...userIds];

    // 既存の会話をチェック（同じメンバー構成のチャットルームが既に存在するか）
    const existingConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });

    // 参加者が完全に一致するチャットルームを検索
    const duplicateConversation = existingConversations.find((conv) => {
      const convParticipantIds = conv.participants.map((p) => p.userId).sort();
      const newParticipantIds = [...participantIds].sort();
      
      return (
        convParticipantIds.length === newParticipantIds.length &&
        convParticipantIds.every((id, index) => id === newParticipantIds[index])
      );
    });

    if (duplicateConversation) {
      return NextResponse.json(
        { error: '選択されたメンバーのチャットルームが既にあります。' },
        { status: 409 }
      );
    }

    // 新しい会話を作成
    const conversation = await prisma.conversation.create({
      data: {
        isDirect,
        title: isDirect ? null : title,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
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

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Conversation POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
