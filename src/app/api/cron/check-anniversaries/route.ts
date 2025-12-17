import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

// GitHub Actionsからの認証用シークレット
const CRON_SECRET =
  process.env.CRON_SECRET || "your-secret-key-change-in-production";

// メール送信元アドレス（環境変数で切り替え可能）
const FROM_EMAIL = process.env.RESEND_FROM || "onboarding@resend.dev";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use JST (Asia/Tokyo) for date calculation
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const jstDateStr = formatter.format(today);
    const [year, month, day] = jstDateStr.split('/').map(Number);

    console.log(`[DEBUG] Server current date (UTC): ${today.toISOString()}`);
    console.log(`[DEBUG] JST current date: ${year}-${month}-${day}`);
    console.log(`[DEBUG] Checking for year: ${year}, month: ${month}, day: ${day}`);

    // 記念日は月日のみで比較（年は無視）
    const anniversariesToday = await prisma.anniversary.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        notes: true,
      },
    });

    console.log(`[DEBUG] Total anniversaries in DB: ${anniversariesToday.length}`);

    // 月日が一致する記念日をフィルター
    const filteredAnniversaries = anniversariesToday.filter((ann) => {
      const annDate = new Date(ann.date);
      const annMonth = annDate.getUTCMonth() + 1;
      const annDay = annDate.getUTCDate();
      
      const isMatch = annMonth === month && annDay === day;
      console.log(`[DEBUG] Anniversary: ${ann.title}, DB date: ${ann.date}, Match: ${isMatch} (month: ${annMonth}/${month}, day: ${annDay}/${day})`);
      
      return isMatch;
    });

    // メール通知を有効にしている全ユーザーを取得
    const usersWithNotifications = await prisma.user.findMany({
      where: {
        emailNotificationsEnabled: true,
        notificationEmails: {
          isEmpty: false,
        },
      },
      select: {
        id: true,
        name: true,
        notificationEmails: true,
        emailNotificationsEnabled: true,
      },
    });

    const results = [];

    console.log(`Found ${filteredAnniversaries.length} anniversaries today`);
    console.log(`Found ${usersWithNotifications.length} users with notifications enabled`);

    // 記念日がない場合は終了
    if (filteredAnniversaries.length === 0) {
      return NextResponse.json({
        success: true,
        date: today.toISOString(),
        checked: 0,
        sent: 0,
        failed: 0,
        results: [],
        message: "No anniversaries today",
      });
    }

    // 通知を有効にしているユーザーがいない場合は終了
    if (usersWithNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        date: today.toISOString(),
        checked: filteredAnniversaries.length,
        sent: 0,
        failed: 0,
        results: [],
        message: "No users with notifications enabled",
      });
    }

    // 各ユーザーに今日の記念日をメール送信
    for (const user of usersWithNotifications) {
      console.log(`\n=== Sending to user: ${user.name} ===`);
      console.log(`User emails: ${user.notificationEmails.join(", ")}`);

      // 記念日リストを生成
      const anniversaryList = filteredAnniversaries
        .map(
          (ann) => `
        <li style="margin-bottom: 15px;">
          <strong style="color: #ec4899; font-size: 16px;">${ann.title}</strong>
          ${ann.notes ? `<p style="margin: 5px 0 0 0; color: #6b7280;">${ann.notes}</p>` : ""}
        </li>
      `
        )
        .join("");

      try {
        // メール送信
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: user.notificationEmails,
          subject: `🎉 今日は記念日です！（${anniversariesToday.length}件）`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #ec4899;">🎉 記念日のお知らせ</h1>
              <p>こんにちは、${user.name}さん</p>
              <p style="font-size: 18px; font-weight: bold; color: #ec4899; margin-top: 20px;">
                今日は${anniversariesToday.length}件の記念日です！
              </p>
              <ul style="list-style: none; padding: 0; margin: 20px 0;">
                ${anniversaryList}
              </ul>
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
            status: "error",
            error: error.message,
          });
        } else {
          console.log(
            `✅ Email sent to ${user.notificationEmails.join(", ")}`
          );
          results.push({
            userId: user.id,
            status: "sent",
            emailId: data?.id,
            anniversaryCount: anniversariesToday.length,
          });
        }
      } catch (emailError: any) {
        console.error(`Error sending email to ${user.name}:`, emailError);
        results.push({
          userId: user.id,
          status: "error",
          error: emailError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      anniversariesFound: filteredAnniversaries.length,
      usersNotified: usersWithNotifications.length,
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
