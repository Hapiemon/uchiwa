import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const memoryLinkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memories = await prisma.memoryLink.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Memories GET error:', error);
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
    const parsed = memoryLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { title, url } = parsed.data;

    // 最大orderを取得して+1
    const maxOrder = await prisma.memoryLink.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const memory = await prisma.memoryLink.create({
      data: {
        title,
        url,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ memory });
  } catch (error) {
    console.error('Memory POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
