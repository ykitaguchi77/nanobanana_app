# Nanobanana Web App

Google Gemini AIを使用したチャットアプリケーションです。

## 🚀 スマホですぐに試す

**最速でスマホでテストしたい方は [DEPLOY.md](DEPLOY.md) をご覧ください！**

Vercelを使えば5分でスマホからアクセス可能なURLが発行されます：
1. https://vercel.com でGitHubアカウントでログイン
2. このリポジトリをImport
3. 環境変数 `GEMINI_API_KEY` を設定
4. Deploy → 完了！

## 機能

- 🤖 **AIプロンプトアシスタント** - 画像生成に最適なプロンプトを提案
- 🎨 **画像生成機能** - テキストから画像を生成（Pollinations.ai + Imagen API対応）
- 💬 リアルタイム会話履歴の管理
- 📝 プロンプト作成ベストプラクティスを内蔵
- 📱 モダンなUIデザイン（React + Tailwind CSS）
- 🔌 RESTful APIバックエンド（Node.js + Express）
- 📲 モバイル対応レスポンシブデザイン
- 🌐 ネットワーク経由でスマホからアクセス可能

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

## 使い方

### AIプロンプトアシスタント（チャット機能）
Nanobananaは画像生成プロンプト作成の専門アシスタントです！

1. **アイデアを伝える**
   - 「バナナのキャラクターを描きたい」
   - 「夕日の風景が欲しい」
   - 「未来都市のイラスト」
   など、ざっくりとしたアイデアでOK

2. **AIが最適なプロンプトを提案**
   - 具体的で詳細なプロンプトに変換
   - スタイル、構図、照明などを含めて提案
   - 複数のバリエーションも提示

3. **提案されたプロンプトをコピー**
   - AIの提案をそのまま使うか、アレンジ

4. **画像生成ボタンをタップ**
   - 🎨ボタンで高品質な画像を生成

### 直接画像生成
1. 画像の説明を入力（例：「青い空とバナナの絵」「夕日に輝く海」）
2. 「🎨 画像生成」ボタンをタップ
3. AIが画像を生成して表示します

### プロンプト作成のコツ
詳細は [prompt-guide.md](prompt-guide.md) を参照

**基本テンプレート：**
```
[主題] + [詳細] + [スタイル] + [構図] + [照明] + [雰囲気]
```

**良い例：**
```
笑顔の黄色いバナナのキャラクター、大きな目、
カートゥーンスタイル、正面から、柔らかい照明、
楽しい雰囲気、高品質
```

**チャットで聞くと更に良い：**
```
ユーザー: 「バナナのキャラクターを描きたいです」
AI: 「以下のプロンプトはいかがでしょうか：
     "笑顔の黄色いバナナのキャラクター、大きな目と手足、
      カートゥーンスタイル、白い背景、柔らかい照明、
      楽しくフレンドリーな雰囲気、高品質、鮮やかな色彩"

     このプロンプトを🎨画像生成ボタンでお試しください！」
```

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
