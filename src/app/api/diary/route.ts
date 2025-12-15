import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { diaryEntrySchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const entries = await prisma.diaryEntry.findMany({
      where: {
        authorId: session.user.id,
        content: {
          contains: search,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.diaryEntry.count({
      where: {
        authorId: session.user.id,
        content: { contains: search },
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
    const session = await auth();
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
        content: parsed.data.content,
      },
      select: {
        id: true,
        content: true,
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
