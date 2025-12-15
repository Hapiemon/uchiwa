# 🎀 Uchiwa - カップル向けWebアプリ

可愛いパステルカラーのWebアプリケーション。彼女へのサプライズプレゼント。日記、記念日、チャット機能を備えています。

## 🌟 主要機能

- **📔 日記機能**: テキストのみの日記の作成・編集・削除・一覧・検索（作者のみ表示）
- **🔐 ログイン/プロフィール**: Email/Password認証、プロフィール編集（名前・ニックネーム・アイコン・自己紹介・タイムゾーン）
- **📅 記念日**: 日付登録、繰り返し設定（なし/年次）、D-Dayカウントダウン表示
- **💬 リアルタイムチャット**: 1対1チャット、既読表示、オンライン状態、入力中インジケーター

## 🛠 テックスタック

- **フロントエンド**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS (パステルテーマ)
- **バックエンド**: Next.js Route Handlers, Socket.IO (WebSocket)
- **DB**: MySQL 8, Prisma ORM
- **認証**: NextAuth.js v5 + Credentials Provider
- **バリデーション**: Zod
- **状態管理**: React Query
- **テスト**: Vitest, Playwright
- **デプロイ**: Docker Compose, Nginx, Let's Encrypt

## 📦 セットアップ (ローカル開発)

### 前提条件
- Node.js >= 20
- Docker & Docker Compose (デプロイ用)
- MySQL 8.0 (ローカル)

### インストール

```bash
# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集してNEXTAUTH_SECRET、DATABASE_URLを設定
```

### データベースセットアップ

```bash
# Prismaマイグレーションを実行
npx prisma migrate dev --name init

# (オプション) サンプルデータをシード
npm run prisma:seed
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

**テストユーザー** (シード後):
- Email: alice@example.com
- Password: password123

## 🧪 テスト

### ユニットテスト (Vitest)

```bash
npm run test
npm run test:ui  # UIダッシュボード表示
```

### E2Eテスト (Playwright)

```bash
# 開発サーバーが起動していることを確認
npm run test:e2e
npm run test:e2e:ui  # ブラウザダッシュボード表示
```

## 🚀 デプロイ (OCI Free Tier)

詳細は `DEPLOY.md` を参照してください。

## 📁 ディレクトリ構成

```
uchiwa/
├── src/
│   ├── app/              # Next.js 14 App Router
│   │   ├── api/          # API Route Handlers
│   │   ├── chat/         # チャットページ
│   │   ├── diary/        # 日記ページ
│   │   ├── anniversaries/ # 記念日ページ
│   │   ├── profile/      # プロフィール
│   │   └── layout.tsx    # ルートレイアウト
│   ├── components/       # React コンポーネント
│   ├── lib/              # ユーティリティ、DB、認証
│   ├── styles/           # グローバルスタイル
│   └── types/            # TypeScript型定義
├── prisma/
│   ├── schema.prisma     # DB スキーマ
│   └── seed.ts           # シードスクリプト
├── docker/
│   └── Dockerfile        # Next.js本番用
├── nginx/
│   └── nginx.conf        # Nginx設定
└── docker-compose.yml    # Docker Compose設定
```

## 🎨 UI/UX

- **パステルカラー**: ピンク #FFB6D9, ラベンダー #E6D9FF, ミント #B6FFDC
- **モバイルファースト**: iPhone 幅優先の設計
- **アクセシビリティ**: キーボード操作、コントラスト対応、aria属性
- **やさしいモーション**: fade-in, slide-up, pulse-soft

## 🔒 セキュリティ

- **入力検証**: すべての入力をZodで検証
- **認可**: Session-based、自リソースのみ操作可
- **パスワード**: bcryptでハッシング (salt=12)
- **レート制限**: 認証エンドポイント (5req/min)、メッセージ (10req/min)
- **HTTPS/HSTS**: Let's Encrypt + Nginx HSTS
- **CSRF**: NextAuth.jsが自動処理
- **セキュリティヘッダ**: X-Frame-Options, X-Content-Type-Options等

## 📝 ライセンス

MIT

## 💝 特別な一言

このアプリケーションは、大切な人と思い出を共有するために作られました。
楽しい時間を過ごしてください！ 💕

---

**作成日**: 2025年12月15日
