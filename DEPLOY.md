# スマホでテストする方法

## 方法1: Vercel（推奨・最速）

### 必要なもの
- GitHubアカウント
- Vercelアカウント（GitHubで無料登録可能）
- Google Gemini APIキー

### 手順（所要時間: 5分）

#### 1. GitHubにコードをプッシュ（既に完了）
このリポジトリは既にGitHubにあります。

#### 2. Vercelでデプロイ

スマホのブラウザから：

1. **Vercelにアクセス**: https://vercel.com
2. **Sign Upをタップ** → "Continue with GitHub"でログイン
3. **"Add New"をタップ** → "Project"を選択
4. **リポジトリを選択**: `nanobanana_app`を探してImport
5. **環境変数を設定**:
   - クリックして"Environment Variables"を開く
   - Name: `GEMINI_API_KEY`
   - Value: あなたのGemini APIキー
   - "Add"をタップ
6. **Deployをタップ**

#### 3. 完了！
- 約2-3分でデプロイ完了
- `https://your-app-name.vercel.app`のようなURLが発行されます
- そのURLをスマホのブラウザで開くだけ！

## 方法2: Netlify（代替案）

### 手順

1. https://netlify.com にアクセス
2. "Sign up"をタップ → GitHubでログイン
3. "Add new site" → "Import an existing project"
4. GitHubを選択 → `nanobanana_app`を選択
5. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
6. Environment variables:
   - `GEMINI_API_KEY`: あなたのAPIキー
7. "Deploy site"をタップ

**注意**: フロントエンドのみデプロイされます。バックエンドは別途必要です。

## 方法3: Railway（フルスタック対応）

### 手順

1. https://railway.app にアクセス
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. リポジトリを選択
5. Environment Variables:
   - `GEMINI_API_KEY`: あなたのAPIキー
   - `PORT`: `5000`
6. Deploy

## 最も簡単なのはVercel！

Vercelが最もスマホでの操作に適していて、自動的に：
- フロントエンドをビルド
- バックエンドAPIを設定
- HTTPSで公開
- 世界中からアクセス可能なURLを発行

**今すぐ試してみてください！**

## トラブルシューティング

### Vercelデプロイエラー
- APIキーが正しく設定されているか確認
- リポジトリがpublicであることを確認
- Redeploy（再デプロイ）を試す

### APIが動かない
- Vercelのダッシュボードで環境変数を確認
- `GEMINI_API_KEY`が正しく設定されているか
- Functionsタブでエラーログを確認

## サポート

問題があれば、以下を確認してください：
- Vercel: https://vercel.com/docs
- Google Gemini API: https://makersuite.google.com
