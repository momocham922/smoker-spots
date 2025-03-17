#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ヘッダーを表示
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}     喫煙所マップ ネイティブビルド      ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 引数の確認
PLATFORM=$1
BUILD_PROFILE=$2

if [ -z "$PLATFORM" ]; then
  echo -e "${YELLOW}ビルドするプラットフォームを指定してください:${NC}"
  echo "  ios     - iOS用にビルド"
  echo "  android - Android用にビルド"
  echo "  all     - 両方のプラットフォーム用にビルド"
  echo ""
  echo -e "${YELLOW}使用例:${NC}"
  echo "  ./build-native.sh ios preview"
  echo "  ./build-native.sh android preview"
  echo "  ./build-native.sh all preview"
  exit 1
fi

if [ -z "$BUILD_PROFILE" ]; then
  echo -e "${YELLOW}ビルドプロファイルを指定してください:${NC}"
  echo "  development - 開発用ビルド"
  echo "  preview     - プレビュー用ビルド"
  echo "  production  - 本番用ビルド"
  exit 1
fi

# 依存関係のインストール
echo -e "${GREEN}依存関係をインストールしています...${NC}"
npm install

# EASログイン確認
echo -e "${GREEN}EASログイン状態を確認しています...${NC}"
npx eas whoami || npx eas login

# EASプロジェクトの初期化
echo -e "${GREEN}EASプロジェクトを初期化しています...${NC}"
npx eas build:configure

# ビルド関数
build_platform() {
  local platform=$1
  local profile=$2
  
  echo -e "${GREEN}${platform}用の${profile}ビルドを開始します...${NC}"
  
  if [ "$platform" = "ios" ]; then
    npx eas build --platform ios --profile $profile --non-interactive
  elif [ "$platform" = "android" ]; then
    npx eas build --platform android --profile $profile --non-interactive
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}${platform}用の${profile}ビルドが完了しました！${NC}"
  else
    echo -e "${RED}${platform}用の${profile}ビルドに失敗しました。${NC}"
    exit 1
  fi
}

# 指定されたプラットフォームに基づいてビルド
if [ "$PLATFORM" = "ios" ]; then
  build_platform "ios" $BUILD_PROFILE
elif [ "$PLATFORM" = "android" ]; then
  build_platform "android" $BUILD_PROFILE
elif [ "$PLATFORM" = "all" ]; then
  build_platform "ios" $BUILD_PROFILE
  build_platform "android" $BUILD_PROFILE
else
  echo -e "${RED}無効なプラットフォームです: $PLATFORM${NC}"
  echo "有効なオプション: ios, android, all"
  exit 1
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}ビルドプロセスが完了しました！${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "${YELLOW}ビルドされたアプリは Expo ダッシュボードで確認できます:${NC}"
echo "https://expo.dev/accounts/[your-username]/projects/smoker-spots/builds"
echo ""
echo -e "${YELLOW}実機でテストするには:${NC}"
echo "1. Expo Go アプリをインストール"
echo "2. QRコードをスキャン"
echo "3. アプリをインストール"
echo ""