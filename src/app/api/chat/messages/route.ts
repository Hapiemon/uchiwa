import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { messageSchema } from '@/lib/validation';
import { prisma } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '20');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        senderId: true,
        content: true,
        readAt: true,
        createdAt: true,
        sender: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Messages GET error:', error);
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

    // Rate limit: 10 messages per minute per user
    const limitResult = rateLimit(`msg:${session.user.id}`, 10, 60000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    // Verify participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parsed.data.conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: parsed.data.conversationId,
        senderId: session.user.id,
        content: parsed.data.content,
      },
      select: {
        id: true,
        senderId: true,
        content: true,
        readAt: true,
        createdAt: true,
        sender: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
