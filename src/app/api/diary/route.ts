import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { diaryEntrySchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const entries = await prisma.diaryEntry.findMany({
      where: {
        OR: [
          { content: { contains: search } },
          { title: { contains: search } }
        ],
      },
      orderBy: { date: 'desc' },
      skip,
      take,
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

    const total = await prisma.diaryEntry.count({
      where: {
        OR: [
          { content: { contains: search } },
          { title: { contains: search } }
        ],
      },
    });

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error('Diary GET error:', error);
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
    const parsed = diaryEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        authorId: session.user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        date: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Diary POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
