import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { diaryEntrySchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        authorId: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
        },
        editors: {
          select: {
            user: {
              select: {
                id: true,
                displayName: true,
                name: true,
              },
            },
            editedAt: true,
          },
          orderBy: {
            editedAt: 'desc',
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Diary GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = diaryEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const entry = await prisma.diaryEntry.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // 作成者以外が編集する場合、編集者として記録
    const isAuthor = entry.authorId === session.user.id;

    const updated = await prisma.diaryEntry.update({
      where: { id: params.id },
      data: { 
        title: parsed.data.title,
        content: parsed.data.content,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
        editors: !isAuthor ? {
          upsert: {
            where: {
              diaryEntryId_userId: {
                diaryEntryId: params.id,
                userId: session.user.id,
              },
            },
            create: {
              userId: session.user.id,
            },
            update: {
              editedAt: new Date(),
            },
          },
        } : undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
        },
        editors: {
          select: {
            user: {
              select: {
                id: true,
                displayName: true,
                name: true,
              },
            },
            editedAt: true,
          },
          orderBy: {
            editedAt: 'desc',
          },
        },
      },
    });

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error('Diary PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.diaryEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Diary DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
