# Repository Guidelines

このリポジトリで作業する際の最小限の指針です。Expo Router を使った React
Native/TypeScript プロジェクトを前提にしています。

## プロジェクト構成

- `app/`：画面とファイルベースルーティングの中心。`app/_layout.tsx` と
  `app/(tabs)/_layout.tsx` でタブ構成を定義し、`app/(tabs)/*` や `app/exercise`
  などに各画面を配置。
- `components/`：再利用コンポーネント置き場。状態はできるだけ親から props で渡す。
- `constants/` `context/` `hooks/`
  `data/`：定数、グローバル状態、カスタムフック、静的データを整理。
- `assets/`：画像・フォント等。`app.json` で必要な場合は設定を追加。
- `scripts/reset-project.js`：スターターを初期化する補助スクリプト。

## ビルド・開発・テスト

- 依存インストール: `npm install`
- 開発サーバー: `npm run start`（QR/エミュレータ/ブラウザ選択）
- Android/iOS/Web: `npm run android` / `npm run ios` / `npm run web`
- Lint: `npm run lint`
- Lint 自動修正: `npm run lint:fix`
- フォーマットチェック: `npm run format`
- フォーマット自動修正: `npm run format:fix`
- テンプレ初期化: `npm run reset-project`（現在の `app/` を `app-example/`
  へ退避し空ディレクトリを作成）
- 現状自動テストは未整備。画面変更時は実機/エミュレータで主要フローを手動確認し、テスト追加時は README/本ガイドにコマンドを追記する。

## コーディングスタイルと命名

- TypeScript/React。2 スペースインデント、関数コンポーネント優先。状態管理は必要最小限の Context/Hook に閉じ込める。
- ESLint は `eslint-config-expo`（flat）採用。警告は放置しない。`dist/*`
  は無視対象。
- コンポーネントはパスカルケース、フックは
  `useFoo`、ユーティリティはキャメルケース。共通型は `types.ts` か近接する
  `types` ファイルへ集約。
- 副作用は `useEffect`
  で明示し、非同期処理はエラーハンドリングとタイムアウトを検討。

## テスト方針

- 追加する場合は Jest/React Testing Library を想定し、`*.test.ts(x)`
  で振る舞いを検証。外部入出力はモックし、失敗パスも必ずカバー。
- CI 未設定のため、ローカルでテストと Lint を必ず実行してから共有。

## コミットと PR

- コミットメッセージは Conventional Commits（例: `feat: add workout timer`,
  `fix: handle offline mode`）。1 コミット 1 トピック。
- PR では概要・動機・確認手順を記載し、UI 変更はスクリーンショット/動画を添付。関連 Issue をリンク。
- マージ前に `npm run lint` と手動確認（主要画面の起動とナビゲーション）を実施。

## 作業後チェック

- 実装後は `npm run lint` と `npm run format` を実行し、エラーが出た場合は `npm run lint:fix` と `npm run format:fix` を順に流す。
- 依存やスクリプトを追加した場合は本手順を更新する。

## セキュリティ・設定

- API キーやシークレットは環境変数で管理し、`.gitignore`
  に含める。公開キーでも無制限スコープを避ける。
- 依存追加は必要最小限にし、ライセンスとサイズを確認。不要になったら削除する。
