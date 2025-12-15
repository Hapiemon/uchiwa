import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { anniversarySchema } from '@/lib/validation';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anniversary = await prisma.anniversary.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        title: true,
        date: true,
        repeatInterval: true,
        notes: true,
        createdAt: true,
      },
    });

    if (!anniversary) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (anniversary.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ anniversary });
  } catch (error) {
    console.error('Anniversary GET error:', error);
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
    const session = await auth();
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

    const anniversary = await prisma.anniversary.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!anniversary) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (anniversary.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.anniversary.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ anniversary: updated });
  } catch (error) {
    console.error('Anniversary PUT error:', error);
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const anniversary = await prisma.anniversary.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!anniversary) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (anniversary.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.anniversary.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Anniversary DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
