# 📧 記念日メール通知機能

記念日の通知をメールで受け取れる機能を実装しました！

## ✨ 機能概要

- 📅 記念日当日の午前9時（日本時間）に自動でメール通知
- ⚙️ `/settings` ページから通知先メールアドレスを設定可能
- 🔔 通知のON/OFF切り替え
- 🔒 セキュアなAPI認証（GitHub ActionsとAPI間）

## 🛠️ セットアップ手順

### 1. Resend APIキーの取得

1. [Resend](https://resend.com/)にサインアップ
2. Dashboard > API Keys で新しいキーを作成
3. キーをコピー

### 2. 環境変数の設定

#### ローカル開発（.env）

```bash
RESEND_API_KEY=re_xxxxxxxxxx
CRON_SECRET=your-cron-secret-for-testing
```

#### Vercel（本番環境）

Vercel Dashboard > Settings > Environment Variables:

```bash
RESEND_API_KEY=re_xxxxxxxxxx
CRON_SECRET=<openssl rand -base64 32で生成>
```

### 3. GitHub Secretsの設定

GitHubリポジトリ > Settings > Secrets and variables > Actions:

```bash
CRON_SECRET=<Vercelと同じ値>
APP_URL=https://your-app.vercel.app
```

### 4. ドメイン認証（本番のみ）

Resendで独自ドメインを認証（無料プランでも可能）:
1. Resend Console > Domains
2. ドメインを追加してDNSレコードを設定
3. `/api/cron/check-anniversaries`の`from`を`notifications@your-domain.com`に変更

**テスト用:** `onboarding@resend.dev`が使えます（制限あり）

## 📖 使い方

### ユーザー側

1. `/settings` にアクセス
2. 「メール通知」タブを開く
3. 通知を有効化し、メールアドレスを入力
4. 「設定を保存」をクリック

### 管理者側（テスト）

ローカルでCronジョブをテスト:

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/check-anniversaries
```

## 🔄 動作の仕組み

1. **GitHub Actions** が毎日午前9時（JST）に実行
2. `/api/cron/check-anniversaries` にリクエスト
3. その日が記念日のユーザーを検索
4. メール通知が有効なユーザーにResend経由でメール送信

## 📁 ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── check-anniversaries/
│   │   │       └── route.ts          # 記念日チェック＆メール送信
│   │   └── settings/
│   │       └── notification-email/
│   │           └── route.ts          # メール設定のCRUD
│   └── settings/
│       └── page.tsx                  # メール通知設定UI
├── prisma/
│   └── schema.prisma                 # notificationEmail フィールド追加
└── .github/
    └── workflows/
        └── daily-reminder.yml        # 毎日9時に実行
```

## 🚨 トラブルシューティング

### メールが届かない

1. Vercelの環境変数を確認
2. GitHub Secretsを確認
3. `/settings`で通知が有効か確認
4. Resendダッシュボードでログを確認

### GitHub Actionsが動かない

1. `.github/workflows/daily-reminder.yml`が正しくコミットされているか確認
2. GitHub Secretsが設定されているか確認
3. Actions タブでワークフローの実行履歴を確認

### ローカルテストでエラー

1. `.env`に`RESEND_API_KEY`と`CRON_SECRET`が設定されているか確認
2. `npm run dev`を再起動

## 📊 制限事項

- **Resend無料プラン:** 月3,000通まで
- **GitHub Actions:** 月2,000分まで（このワークフローは数秒で完了）
- **通知時間:** 毎日午前9時（JST）固定

## 🔜 今後の拡張案

- [ ] 通知タイミングのカスタマイズ（3日前、1週間前など）
- [ ] メールテンプレートのカスタマイズ
- [ ] 複数の通知先アドレス
- [ ] SMS通知（Twilio連携）

---

詳しいセットアップは [VERCEL_SETUP.md](./VERCEL_SETUP.md) を参照してください。
