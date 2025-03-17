# 喫煙所マップ（Smoker Spots）

喫煙所マップは、近くの喫煙所を簡単に見つけることができるモバイルアプリです。React NativeとFirebaseを使用して構築されており、ユーザーは地図上で喫煙所を探したり、詳細情報を確認したり、お気に入りに登録したりすることができます。

## 機能

- 地図上で喫煙所を表示
- 現在地周辺の喫煙所を検索
- 喫煙所の詳細情報（設備、営業時間など）を表示
- お気に入りの喫煙所を保存
- 新しい喫煙所を追加
- ユーザー認証（ログイン/登録）

## スクリーンショット

![スプラッシュ画面](./docs/screenshots/splash.png)
![マップ画面](./docs/screenshots/map.png)
![リスト画面](./docs/screenshots/list.png)
![詳細画面](./docs/screenshots/detail.png)

## 技術スタック

- [React Native](https://reactnative.dev/) - クロスプラットフォームモバイルアプリ開発フレームワーク
- [Expo](https://expo.dev/) - React Nativeアプリ開発ツール
- [Firebase](https://firebase.google.com/) - バックエンドサービス（認証、データベース）
- [React Navigation](https://reactnavigation.org/) - ナビゲーション
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) - 地図表示
- [React Native Paper](https://callstack.github.io/react-native-paper/) - UIコンポーネント

## 開発環境のセットアップ

### 前提条件

- Node.js (v14以上)
- npm または yarn
- Expo CLI
- Firebase アカウント

### インストール

1. リポジトリをクローン:

```bash
git clone https://github.com/yourusername/smoker-spots.git
cd smoker-spots
```

2. 依存関係をインストール:

```bash
npm install
```

3. Firebaseプロジェクトを設定:
   - [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
   - Firebaseの設定情報を`src/firebase-config.ts`に追加

4. アプリを起動:

```bash
npm start
```

## ネイティブアプリのビルド

### EAS CLIのインストール

```bash
npm install -g eas-cli
```

### ビルドの実行

開発用ビルド:

```bash
./build-native.sh ios development
./build-native.sh android development
```

プレビュー用ビルド:

```bash
./build-native.sh ios preview
./build-native.sh android preview
```

本番用ビルド:

```bash
./build-native.sh ios production
./build-native.sh android production
```

両方のプラットフォーム用にビルド:

```bash
./build-native.sh all preview
```

## 実機でのテスト

詳細な手順については、[テスト手順ドキュメント](./docs/TESTING.md)を参照してください。

簡単な手順:

1. Expo Goアプリをインストール:
   - [iOS App Store](https://apps.apple.com/app/apple-store/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. QRコードをスキャンしてアプリを開く

3. ビルド版をテストする場合は、EASダッシュボードからアプリをインストール

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 連絡先

質問や提案がある場合は、[issues](https://github.com/yourusername/smoker-spots/issues)を作成するか、以下の連絡先までご連絡ください:

- メール: your.email@example.com
- Twitter: [@yourusername](https://twitter.com/yourusername)