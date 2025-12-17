import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  notificationEmails: z.array(z.string().email()).optional(),
  emailNotificationsEnabled: z.boolean().optional(),
});

// GET: 現在のメール通知設定を取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        notificationEmails: true,
        emailNotificationsEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: メール通知設定を更新
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (parsed.data.notificationEmails !== undefined) {
      updateData.notificationEmails = parsed.data.notificationEmails;
    }
    if (parsed.data.emailNotificationsEnabled !== undefined) {
      updateData.emailNotificationsEnabled =
        parsed.data.emailNotificationsEnabled;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        notificationEmails: true,
        emailNotificationsEnabled: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
