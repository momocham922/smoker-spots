#!/bin/bash

# Firestoreにspotsコレクションを作成し、モックデータを登録するスクリプト

# プロジェクトID
PROJECT_ID="smoker-spots-app"

# サンプルデータ1
echo "サンプルデータ1を登録中..."
gcloud firestore documents create projects/$PROJECT_ID/databases/(default)/documents/spots/sample1 \
  --data='{
    "title": "東京駅八重洲口喫煙所",
    "description": "東京駅八重洲口近くの屋外喫煙所です。屋根付きで雨の日も安心です。座席も完備されており、ゆっくりとタバコを楽しむことができます。駅から徒歩2分の便利な場所にあります。",
    "location": {
      "latitude": 35.681236,
      "longitude": 139.768149
    },
    "rating": 4.2,
    "facilities": {
      "hasRoof": true,
      "hasSeating": true,
      "hasVendingMachine": true,
      "isIndoor": false
    },
    "businessHours": {
      "isOpen24Hours": true
    },
    "createdBy": "admin",
    "createdAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

# サンプルデータ2
echo "サンプルデータ2を登録中..."
gcloud firestore documents create projects/$PROJECT_ID/databases/(default)/documents/spots/sample2 \
  --data='{
    "title": "新宿駅東口喫煙所",
    "description": "新宿駅東口近くの屋外喫煙所です。多くの喫煙者で賑わっています。",
    "location": {
      "latitude": 35.690921,
      "longitude": 139.702776
    },
    "rating": 3.8,
    "facilities": {
      "hasRoof": true,
      "hasSeating": false,
      "hasVendingMachine": false,
      "isIndoor": false
    },
    "businessHours": {
      "isOpen24Hours": false,
      "openingTime": "7:00",
      "closingTime": "23:00"
    },
    "createdBy": "admin",
    "createdAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

# サンプルデータ3
echo "サンプルデータ3を登録中..."
gcloud firestore documents create projects/$PROJECT_ID/databases/(default)/documents/spots/sample3 \
  --data='{
    "title": "渋谷駅ハチ公前喫煙所",
    "description": "渋谷のランドマーク近くにある喫煙所です。観光客にも人気です。",
    "location": {
      "latitude": 35.658517,
      "longitude": 139.701334
    },
    "rating": 4.0,
    "facilities": {
      "hasRoof": true,
      "hasSeating": true,
      "hasVendingMachine": true,
      "isIndoor": false
    },
    "businessHours": {
      "isOpen24Hours": true
    },
    "createdBy": "admin",
    "createdAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"__type__": "timestamp", "value": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }'

echo "Firestoreの初期化が完了しました！"