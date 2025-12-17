import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// GitHub Actionsからの認証用シークレット
const CRON_SECRET =
  process.env.CRON_SECRET || "your-secret-key-change-in-production";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // 今日が記念日のユーザーを取得
    const anniversariesToday = await prisma.anniversary.findMany({
      where: {
        OR: [
          // 記念日が今日
          {
            date: {
              gte: new Date(currentYear, currentMonth - 1, currentDay, 0, 0, 0),
              lt: new Date(
                currentYear,
                currentMonth - 1,
                currentDay + 1,
                0,
                0,
                0
              ),
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            notificationEmails: true,
            emailNotificationsEnabled: true,
          },
        },
      },
    });

    const results = [];

    console.log(`Found ${anniversariesToday.length} anniversaries today`);

    for (const anniversary of anniversariesToday) {
      const user = anniversary.user;

      console.log(`Checking anniversary: ${anniversary.title} for user:`, {
        userId: user?.id,
        userName: user?.name,
        emailNotificationsEnabled: user?.emailNotificationsEnabled,
        notificationEmails: user?.notificationEmails,
      });

      // ユーザーが存在するかチェック
      if (!user) {
        console.warn(`User not found for anniversary ${anniversary.id}`);
        continue;
      }

      // メール通知が有効で、通知先メールアドレスが設定されているか確認
      if (
        !user.emailNotificationsEnabled ||
        !user.notificationEmails ||
        user.notificationEmails.length === 0
      ) {
        console.log(
          `Skipping: emailNotificationsEnabled=${
            user.emailNotificationsEnabled
          }, notificationEmails=${user.notificationEmails?.length || 0}`
        );
        continue;
      }

      console.log(`Sending email to: ${user.notificationEmails.join(", ")}`);

      try {
        // メール送信（複数の宛先に送信）
        const { data, error } = await resend.emails.send({
          from: "onboarding@resend.dev", // Resend無料プラン用。本番運用時は自分のドメインに変更
          to: user.notificationEmails,
          subject: `🎉 今日は「${anniversary.title}」の日です！`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #ec4899;">🎉 記念日のお知らせ</h1>
              <p>こんにちは、${user.name}さん</p>
              <p style="font-size: 18px; font-weight: bold; color: #ec4899;">
                今日は「${anniversary.title}」の日です！
              </p>
              ${
                anniversary.notes
                  ? `<p>${anniversary.notes}</p>`
                  : ""
              }
              <p style="margin-top: 30px;">
                素敵な一日をお過ごしください💖
              </p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                このメールは https://ohayo.site から自動送信されています。
              </p>
            </div>
          `,
        });

        if (error) {
          console.error(
            `Failed to send email to ${user.notificationEmails.join(", ")}:`,
            error
          );
          results.push({
            userId: user.id,
            anniversaryId: anniversary.id,
            status: "error",
            error: error.message,
          });
        } else {
          console.log(
            `Email sent to ${user.notificationEmails.join(
              ", "
            )} for anniversary: ${anniversary.title}`
          );
          results.push({
            userId: user.id,
            anniversaryId: anniversary.id,
            status: "sent",
            emailId: data?.id,
          });
        }
      } catch (emailError: any) {
        console.error(`Error sending email:`, emailError);
        results.push({
          userId: user.id,
          anniversaryId: anniversary.id,
          status: "error",
          error: emailError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      checked: anniversariesToday.length,
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "error").length,
      results,
    });
  } catch (error: any) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
