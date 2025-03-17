#!/bin/bash

# 色の定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ヘッダーを表示
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}        喫煙所マップ 実行スクリプト       ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 引数の確認
PLATFORM=$1

# 依存関係のインストール
echo -e "${GREEN}依存関係をインストールしています...${NC}"
npm install

# 実行関数
run_app() {
  local platform=$1
  
  if [ -z "$platform" ]; then
    echo -e "${GREEN}Expoを起動しています...${NC}"
    npx expo start
  elif [ "$platform" = "android" ]; then
    echo -e "${GREEN}Android用にExpoを起動しています...${NC}"
    npx expo start --android
  elif [ "$platform" = "ios" ]; then
    echo -e "${GREEN}iOS用にExpoを起動しています...${NC}"
    npx expo start --ios
  elif [ "$platform" = "web" ]; then
    echo -e "${GREEN}Web用にExpoを起動しています...${NC}"
    npx expo start --web
  else
    echo -e "${RED}無効なプラットフォームです: $platform${NC}"
    echo "有効なオプション: android, ios, web"
    exit 1
  fi
}

# 指定されたプラットフォームに基づいて実行
run_app $PLATFORM

echo ""
echo -e "${YELLOW}アプリを終了するには Ctrl+C を押してください${NC}"
echo ""