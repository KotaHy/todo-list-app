# Todo List App

カレンダー形式でタスクを管理できるWebアプリケーションです。

![アプリ画面](https://github.com/user-attachments/assets/1fbe434e-3028-4f29-8697-ad360ec26b02)

## 機能

- **ログイン / ログアウト** — JWT セッション管理による認証
- **カレンダー表示** — 年月単位でタスクを一覧表示
- **タスク管理** — タスクの作成・削除・メモ記入
- **ユーザー管理** — ユーザー登録・プロフィール編集（ユーザー名・パスワード変更）
- **管理者機能** — 他ユーザーのタスク検索・閲覧（ID=1 のユーザーが管理者）

## 技術スタック

| カテゴリ | 使用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| UI | Material UI (MUI) v7 / Tailwind CSS v4 |
| データベース | Supabase (PostgreSQL) |
| 認証 | JWT (jose) / パスワードハッシュ (bcryptjs) |
| デプロイ | Vercel |

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd todo-list-app
npm install
```

### 2. 環境変数を設定

`.env.local` を作成し、以下の変数を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase Service Role Key>
JWT_SECRET=<32文字以上のランダムな文字列>
```

Supabase のキーはプロジェクトの **Settings > API** から取得できます。

### 3. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

## ページ構成

| パス | 説明 |
|---|---|
| `/login` | ログイン画面 |
| `/top` | カレンダー（メイン画面） |
| `/top/user-tasks` | ユーザー別タスク検索（管理者のみ） |
| `/users` | ユーザー一覧 |
| `/users/[id]/edit` | プロフィール編集 |

## API エンドポイント

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/login` | ログイン |
| POST | `/api/logout` | ログアウト |
| GET | `/api/tasks?year=&month=` | タスク一覧取得 |
| POST | `/api/tasks` | タスク作成 |
| DELETE | `/api/tasks?id=` | タスク削除 |
| GET | `/api/users` | ユーザー一覧取得 |
| POST | `/api/users` | ユーザー登録 |
| PUT | `/api/users` | ユーザー情報更新 |

## デプロイ

Vercel へのデプロイは[こちらのガイド](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。上記の環境変数を Vercel のプロジェクト設定にも追加してください。
