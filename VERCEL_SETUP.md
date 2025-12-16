# Neon + Vercel セットアップ手順

## 1. Neon でデータベースを作成

1. [Neon Console](https://console.neon.tech/) にアクセス
2. 「Create Project」をクリック
3. プロジェクト名を入力（例: `uchiwa`）
4. リージョンを選択（推奨: AWS Tokyo ap-northeast-1）
5. PostgreSQL バージョン: 最新（デフォルト）
6. 「Create Project」をクリック

## 2. 接続文字列を取得

1. Neon Console > プロジェクト > Dashboard
2. 「Connection Details」セクションで「Connection string」をコピー
3. 形式: `postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require`

## 3. Vercel に環境変数を設定

Vercel Dashboard > Settings > Environment Variables で以下を追加：

```bash
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=ランダムな32文字以上の文字列
NEXTAUTH_URL=https://your-app.vercel.app
NODE_ENV=production
```

**NEXTAUTH_SECRET の生成:**

```bash
openssl rand -base64 32
```

**重要:** 全ての環境（Production, Preview, Development）にチェックを入れる

## 4. ビルド設定

Vercel は自動的に検出しますが、必要に応じて：

### Build Command

```
prisma generate && next build
```

### Install Command

```
npm install
```

## 5. デプロイとマイグレーション

### 初回デプロイ

```bash
git add .
git commit -m "Configure for Neon database"
git push
```

### マイグレーション実行

**方法 1: Vercel CLI（推奨）**

```bash
# Vercel CLIインストール
npm i -g vercel

# ログイン
vercel login

# 環境変数を取得
vercel env pull .env.local

# マイグレーション実行
npx prisma migrate deploy

# 初期データ投入（必要な場合）
npx prisma db seed
```

**方法 2: ローカルから直接**

```bash
# .env.localを編集してNeonのDATABASE_URLを設定
# その後
npx prisma migrate deploy
```

## 6. 動作確認

1. デプロイされた URL にアクセス
2. `/register` でアカウント作成
3. ログイン確認
4. 各機能の動作確認

## Neon の利点

- ✅ 無料枠が充実（0.5GB、10 プロジェクト）
- ✅ 自動スケーリング
- ✅ ブランチ機能（開発環境を簡単に作成）
- ✅ サーバーレス対応
- ✅ バックアップ自動作成

## トラブルシューティング

### SSL 接続エラー

接続文字列に `?sslmode=require` が含まれているか確認

### タイムアウトエラー

Neon Console で「Compute」タブを確認し、データベースがアクティブか確認

### マイグレーションエラー

```bash
# スキーマを強制プッシュ（開発初期のみ）
npx prisma db push --force-reset
```

### 接続プールエラー

Neon は接続プールに対応しているので、通常は問題ありません

## 参考リンク

- [Neon Documentation](https://neon.tech/docs)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/database/neon)
