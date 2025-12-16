import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { anniversarySchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anniversaries = await prisma.anniversary.findMany({
      orderBy: { date: 'asc' },
      select: {
        id: true,
        title: true,
        date: true,
        repeatInterval: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ anniversaries });
  } catch (error) {
    console.error('Anniversaries GET error:', error);
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
    const parsed = anniversarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const anniversary = await prisma.anniversary.create({
      data: {
        userId: null,
        title: parsed.data.title,
        date: new Date(parsed.data.date),
        repeatInterval: parsed.data.repeatInterval,
        notes: parsed.data.notes,
      },
      select: {
        id: true,
        title: true,
        date: true,
        repeatInterval: true,
        notes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ anniversary }, { status: 201 });
  } catch (error) {
    console.error('Anniversaries POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
