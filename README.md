# Nanobanana Web App

Google Gemini AIを使用したチャットアプリケーションです。

## 機能

- Gemini 2.0 Flash Expモデルを使用したAIチャット
- リアルタイム会話履歴の管理
- モダンなUIデザイン（React + Tailwind CSS）
- RESTful APIバックエンド（Node.js + Express）
- モバイル対応レスポンシブデザイン
- ネットワーク経由でスマホからアクセス可能

## 技術スタック

### フロントエンド
- React 18
- Vite
- Tailwind CSS
- Axios

### バックエンド
- Node.js
- Express
- Google Generative AI SDK
- CORS対応

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Google Gemini API キー

### 1. Google Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを作成
3. APIキーをコピー

### 2. インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd nanobanana_app

# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install
```

### 3. 環境変数の設定

```bash
# backendディレクトリに.envファイルを作成
cd backend
cp .env.example .env

# .envファイルを編集してAPIキーを設定
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. アプリケーションの起動

#### 簡単な起動方法（推奨）

```bash
# ルートディレクトリで実行
./start.sh
```

このスクリプトは：
- 依存関係が未インストールの場合は自動でインストール
- バックエンドとフロントエンドを同時に起動
- モバイルアクセス用のIPアドレスを表示

#### 手動起動

ターミナル1（バックエンド）:
```bash
cd backend
npm run dev
```

ターミナル2（フロントエンド）:
```bash
cd frontend
npm run dev
```

#### アクセス方法

**PCから：**
- http://localhost:3000

**スマホから：**
1. PCとスマホが同じWi-Fiネットワークに接続されていることを確認
2. PCのローカルIPアドレスを確認（start.shが自動で表示します）
3. スマホのブラウザで `http://<PCのIPアドレス>:3000` にアクセス
4. 例：`http://192.168.1.100:3000`

#### 本番ビルド

```bash
# フロントエンドのビルド
cd frontend
npm run build

# バックエンドの起動
cd ../backend
npm start
```

## API エンドポイント

### POST /api/chat
チャットメッセージを送信

リクエスト:
```json
{
  "message": "こんにちは",
  "history": [
    {"role": "user", "content": "以前のメッセージ"},
    {"role": "assistant", "content": "以前の応答"}
  ]
}
```

レスポンス:
```json
{
  "response": "AIからの応答"
}
```

### GET /api/health
サーバーのヘルスチェック

レスポンス:
```json
{
  "status": "ok",
  "model": "gemini-2.0-flash-exp"
}
```

## プロジェクト構造

```
nanobanana_app/
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   │   └── ChatInterface.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/               # Node.jsバックエンド
│   ├── server.js         # Expressサーバー
│   ├── package.json
│   └── .env.example
└── README.md
```

## トラブルシューティング

### APIキーエラー
- `.env`ファイルが正しく設定されているか確認
- APIキーが有効か確認
- バックエンドサーバーを再起動

### ポートが使用中
- 別のアプリケーションがポート3000または5000を使用していないか確認
- `.env`ファイルでPORTを変更可能

### CORS エラー
- バックエンドサーバーが起動しているか確認
- vite.config.jsのプロキシ設定を確認

### スマホからアクセスできない
- PCとスマホが同じWi-Fiネットワークに接続されているか確認
- PCのファイアウォールがポート3000をブロックしていないか確認
- IPアドレスが正しいか確認（`hostname -I` または `ipconfig` / `ifconfig`）
- ブラウザのキャッシュをクリアして再試行

### 依存関係のインストールエラー
- Node.jsのバージョンが18以上であることを確認
- `node_modules`フォルダを削除して再インストール
```bash
rm -rf frontend/node_modules backend/node_modules
npm run install:all
```

## ライセンス

MIT
