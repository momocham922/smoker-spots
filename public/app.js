// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBab6xodw-6bYn1x6UJDRk7W2wITCAnSwc",
  authDomain: "smoker-spots-app.firebaseapp.com",
  projectId: "smoker-spots-app",
  storageBucket: "smoker-spots-app.firebasestorage.app",
  messagingSenderId: "689889531515",
  appId: "1:689889531515:web:07eff45c9aabd34a0234de",
  measurementId: "G-JK214ZN8TS"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// サンプル喫煙所データ
const sampleSpots = [
  {
    id: '1',
    title: '東京駅八重洲口喫煙所',
    description: '東京駅八重洲口近くの屋外喫煙所です。屋根付きで雨の日も安心です。',
    location: { lat: 35.681236, lng: 139.768149 },
    rating: 4.2,
    facilities: {
      hasRoof: true,
      hasSeating: true,
      hasVendingMachine: true,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: true
    }
  },
  {
    id: '2',
    title: '新宿駅東口喫煙所',
    description: '新宿駅東口近くの屋外喫煙所です。座席があり、ゆっくりできます。',
    location: { lat: 35.690921, lng: 139.702776 },
    rating: 3.8,
    facilities: {
      hasRoof: true,
      hasSeating: true,
      hasVendingMachine: false,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: false,
      openingTime: '7:00',
      closingTime: '23:00'
    }
  },
  {
    id: '3',
    title: '渋谷駅ハチ公前喫煙所',
    description: '渋谷駅ハチ公前の屋外喫煙所です。人通りが多いエリアにあります。',
    location: { lat: 35.658517, lng: 139.701334 },
    rating: 3.5,
    facilities: {
      hasRoof: true,
      hasSeating: false,
      hasVendingMachine: true,
      isIndoor: false
    },
    businessHours: {
      isOpen24Hours: false,
      openingTime: '6:00',
      closingTime: '24:00'
    }
  }
];

// グローバル変数
let map;
let markers = [];
let currentPosition;
let rootElement;

// 現在地を取得する関数（グローバルスコープで定義）
function getCurrentLocation() {
  console.log('Getting current location...');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Current position found:', currentPosition);
        
        // 現在地にマーカーを追加
        try {
          // 現在地マーカーのオプション
          const markerOptions = {
            position: currentPosition,
            map: map,
            title: '現在地',
            zIndex: 100, // 他のマーカーより前面に表示
            animation: google.maps.Animation.DROP
          };
          
          // カスタムアイコンを設定
          markerOptions.icon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3
          };
          
          // マーカーを作成
          const marker = new google.maps.Marker(markerOptions);
          console.log('Current location marker added');
          
          // 現在地の周りに円を追加して視認性を高める
          const circle = new google.maps.Circle({
            map: map,
            radius: 100, // メートル単位
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            strokeColor: '#4285F4',
            strokeOpacity: 0.5,
            strokeWeight: 2,
            center: currentPosition
          });
        } catch (error) {
          console.error('Failed to add current location marker:', error);
        }
        
        // 地図の中心を現在地に設定
        map.setCenter(currentPosition);
        map.setZoom(15);
      },
      function(error) {
        console.error('位置情報の取得に失敗しました:', error);
      }
    );
  } else {
    console.error('このブラウザは位置情報をサポートしていません');
  }
}

// 喫煙所をマップに追加する関数（グローバルスコープで定義）
function addSpotsToMap(spots) {
  console.log('Adding spots to map:', spots);
  
  // 既存のマーカーをクリア
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
  
  // マップが初期化されているか確認
  if (!map) {
    console.error('Map not initialized yet');
    return;
  }
  
  // 喫煙所マーカーを追加
  spots.forEach(function(spot, index) {
    console.log(`Adding marker for spot ${index + 1}:`, spot.title);
    
    // マーカーオプションを設定
    const markerOptions = {
      position: spot.location,
      map: map,
      title: spot.title,
      animation: google.maps.Animation.DROP,
      zIndex: 10
    };
    
    // カスタムアイコンを設定
    const iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    try {
      markerOptions.icon = {
        url: iconUrl,
        scaledSize: new google.maps.Size(40, 40), // より大きく表示
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40)
      };
    } catch (error) {
      console.warn('Failed to set custom icon:', error);
    }
    
    // マーカーを作成
    const marker = new google.maps.Marker(markerOptions);
    
    // マーカーをクリックしたときの情報ウィンドウ
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="info-window">
          <h3>${spot.title}</h3>
          <p class="info-description">${spot.description}</p>
          
          <div class="info-rating">
            <span class="rating-stars">
              ${Array(Math.floor(spot.rating)).fill('<i class="material-icons">star</i>').join('')}
              ${spot.rating % 1 >= 0.5 ? '<i class="material-icons">star_half</i>' : ''}
              ${Array(5 - Math.ceil(spot.rating)).fill('<i class="material-icons">star_border</i>').join('')}
            </span>
            <span class="rating-value">${spot.rating}</span>
          </div>
          
          <div class="info-facilities">
            <div class="facility ${spot.facilities.hasRoof ? 'active' : ''}">
              <i class="material-icons">${spot.facilities.hasRoof ? 'check_circle' : 'cancel'}</i>
              <span>屋根</span>
            </div>
            <div class="facility ${spot.facilities.hasSeating ? 'active' : ''}">
              <i class="material-icons">${spot.facilities.hasSeating ? 'check_circle' : 'cancel'}</i>
              <span>座席</span>
            </div>
            <div class="facility ${spot.facilities.hasVendingMachine ? 'active' : ''}">
              <i class="material-icons">${spot.facilities.hasVendingMachine ? 'check_circle' : 'cancel'}</i>
              <span>自販機</span>
            </div>
            <div class="facility ${spot.facilities.isIndoor ? 'active' : ''}">
              <i class="material-icons">${spot.facilities.isIndoor ? 'check_circle' : 'cancel'}</i>
              <span>${spot.facilities.isIndoor ? '屋内' : '屋外'}</span>
            </div>
          </div>
          
          <div class="info-hours">
            <i class="material-icons">access_time</i>
            <span>${spot.businessHours.isOpen24Hours ? '24時間営業' :
              `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`}</span>
          </div>
          
          <div class="info-actions">
            <button class="info-button" onclick="navigateToSpot(${spot.location.lat}, ${spot.location.lng})">
              <i class="material-icons">directions</i> 経路
            </button>
            <button class="info-button" onclick="saveSpot('${spot.id}')">
              <i class="material-icons">bookmark</i> 保存
            </button>
            <button class="info-button" onclick="shareSpot('${spot.id}')">
              <i class="material-icons">share</i> 共有
            </button>
          </div>
        </div>
      `
    });
    
    // マーカーのクリックイベント
    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });
    
    markers.push(marker);
  });
}

// 経路案内機能
function navigateToSpot(lat, lng) {
  if (currentPosition) {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentPosition.lat},${currentPosition.lng}&destination=${lat},${lng}&travelmode=walking`;
    window.open(url, '_blank');
  } else {
    alert('現在地が取得できていません。位置情報の許可を確認してください。');
  }
}

// スポットを保存する機能
function saveSpot(spotId) {
  // Firebaseに保存する処理（実装例）
  const user = auth.currentUser;
  if (user) {
    db.collection('users').doc(user.uid).collection('savedSpots').doc(spotId).set({
      savedAt: new Date(),
      spotId: spotId
    })
    .then(() => {
      alert('スポットを保存しました');
    })
    .catch((error) => {
      console.error('スポットの保存に失敗しました:', error);
      alert('スポットの保存に失敗しました');
    });
  } else {
    alert('スポットを保存するにはログインが必要です');
  }
}

// スポットを共有する機能
function shareSpot(spotId) {
  const spot = sampleSpots.find(s => s.id === spotId);
  if (spot) {
    const shareText = `${spot.title} - スモーカースポットで見つけた喫煙所\nhttps://smoker-spots-app.web.app/spot/${spotId}`;
    
    // Web Share APIが利用可能な場合
    if (navigator.share) {
      navigator.share({
        title: spot.title,
        text: spot.description,
        url: `https://smoker-spots-app.web.app/spot/${spotId}`
      })
      .catch(error => console.error('共有に失敗しました:', error));
    } else {
      // クリップボードにコピー
      navigator.clipboard.writeText(shareText)
        .then(() => alert('共有リンクをクリップボードにコピーしました'))
        .catch(() => alert(shareText));
    }
  }
}

// グローバルスコープでinitMap関数を定義（Google Maps APIのコールバック用）
function initMap() {
  console.log('Google Maps API loaded successfully');
  
  try {
    // ログイン済みの場合のみ地図を初期化
    if (rootElement && rootElement.querySelector('#map')) {
      console.log('Map container found, initializing map...');
      
      // 東京駅を中心に地図を初期化
      const tokyo = { lat: 35.681236, lng: 139.768149 };
      
      // マップ要素のサイズを確認
      const mapElement = document.getElementById('map');
      console.log('Map element dimensions:', mapElement.offsetWidth, 'x', mapElement.offsetHeight);
      
      // 地図のオプションを設定
      const mapOptions = {
        center: tokyo,
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy' // モバイルでのジェスチャー操作を改善
      };
      
      // 地図を初期化
      map = new google.maps.Map(mapElement, mapOptions);
      
      // 地図の読み込みイベントをリッスン
      google.maps.event.addListenerOnce(map, 'idle', function() {
        console.log('Map fully loaded and ready');
        
        // マップが完全に読み込まれた後に実行
        setTimeout(function() {
          // 現在地を取得
          getCurrentLocation();
          
          // サンプル喫煙所をマップに追加
          addSpotsToMap(sampleSpots);
          
          console.log('Map initialization complete with markers');
        }, 500);
      });
    } else {
      console.warn('Map container not found or not ready yet');
    }
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {
  rootElement = document.getElementById('root');
  
  // ログイン状態を監視
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // ログイン済みの場合
      renderDashboard(user);
    } else {
      // 未ログインの場合
      renderLoginForm();
    }
  });
  
  // ログインフォームをレンダリング
  function renderLoginForm() {
    rootElement.innerHTML = `
      <div class="container">
        <header>
          <h1>スモーカースポット</h1>
          <p>喫煙所を簡単に探せるアプリ</p>
        </header>
        
        <div class="content fade-in">
          <div class="card">
            <h2>ログイン</h2>
            <div id="error-message" class="error"></div>
            <form id="login-form" class="login-form">
              <div class="form-group">
                <label for="email">メールアドレス</label>
                <input type="email" id="email" placeholder="example@email.com" required />
              </div>
              <div class="form-group">
                <label for="password">パスワード</label>
                <input type="password" id="password" placeholder="パスワードを入力" required />
              </div>
              <button type="submit" class="primary-button">
                <i class="material-icons" style="font-size: 18px; margin-right: 8px;">login</i>
                ログイン
              </button>
              <button type="button" id="register-button" class="secondary-button">
                <i class="material-icons" style="font-size: 18px; margin-right: 8px;">person_add</i>
                新規登録
              </button>
            </form>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 スモーカースポット</p>
        </div>
      </div>
    `;
    
    // ログインフォームのイベントリスナー
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('error-message');
      
      // ログインボタンを無効化
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'ログイン中...';
      
      auth.signInWithEmailAndPassword(email, password)
        .catch(function(error) {
          errorMessage.textContent = 'ログインに失敗しました: ' + error.message;
          submitButton.disabled = false;
          submitButton.textContent = 'ログイン';
        });
    });
    
    // 新規登録ボタンのイベントリスナー
    document.getElementById('register-button').addEventListener('click', function() {
      renderRegisterForm();
    });
  }
  
  // 登録フォームをレンダリング
  function renderRegisterForm() {
    rootElement.innerHTML = `
      <div class="container">
        <header>
          <h1>スモーカースポット</h1>
          <p>喫煙所を簡単に探せるアプリ</p>
        </header>
        
        <div class="content fade-in">
          <div class="card">
            <h2>アカウント登録</h2>
            <div id="error-message" class="error"></div>
            <form id="register-form" class="login-form">
              <div class="form-group">
                <label for="email">メールアドレス</label>
                <input type="email" id="email" placeholder="example@email.com" required />
              </div>
              <div class="form-group">
                <label for="password">パスワード</label>
                <input type="password" id="password" placeholder="8文字以上のパスワード" required />
              </div>
              <div class="form-group">
                <label for="password-confirm">パスワード（確認）</label>
                <input type="password" id="password-confirm" placeholder="パスワードを再入力" required />
              </div>
              <button type="submit" class="primary-button">
                <i class="material-icons" style="font-size: 18px; margin-right: 8px;">how_reg</i>
                登録する
              </button>
              <button type="button" id="login-button" class="secondary-button">
                <i class="material-icons" style="font-size: 18px; margin-right: 8px;">arrow_back</i>
                ログイン画面に戻る
              </button>
            </form>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 スモーカースポット</p>
        </div>
      </div>
    `;
    
    // 登録フォームのイベントリスナー
    document.getElementById('register-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      const errorMessage = document.getElementById('error-message');
      
      if (password !== passwordConfirm) {
        errorMessage.textContent = 'パスワードが一致しません';
        return;
      }
      
      // 登録ボタンを無効化
      const submitButton = this.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = '登録中...';
      
      auth.createUserWithEmailAndPassword(email, password)
        .catch(function(error) {
          errorMessage.textContent = 'アカウント作成に失敗しました: ' + error.message;
          submitButton.disabled = false;
          submitButton.textContent = '登録';
        });
    });
    
    // ログインボタンのイベントリスナー
    document.getElementById('login-button').addEventListener('click', function() {
      renderLoginForm();
    });
  }
  
  // ダッシュボードをレンダリング
  function renderDashboard(user) {
    rootElement.innerHTML = `
      <div class="app-container">
        <div class="status-bar">
          <div class="status-bar-left">
            <i class="material-icons">signal_cellular_alt</i>
            <span>4G</span>
          </div>
          <div class="status-bar-right">
            <span>14:30</span>
            <i class="material-icons">bluetooth</i>
            <i class="material-icons">wifi</i>
            <div class="battery-level"></div>
          </div>
        </div>
        
        <header>
          <h1><i class="material-icons">smoking_rooms</i>スモーカースポット</h1>
          <p>あなたの近くの喫煙所を見つけよう</p>
          
          <div class="header-actions">
            <div class="header-search">
              <i class="material-icons">search</i>
              <input type="text" placeholder="喫煙所を検索">
            </div>
            <div class="header-buttons">
              <div class="header-button" id="filter-button">
                <i class="material-icons">filter_list</i>
              </div>
              <div class="header-button" id="notification-button">
                <i class="material-icons">notifications</i>
              </div>
            </div>
          </div>
        </header>
        
        <div class="content" id="content-container">
          <div id="content-map">
            <div class="map-header">
              <h2>喫煙所マップ</h2>
              <button id="current-location-button" class="icon-button">
                <i class="material-icons">my_location</i>
              </button>
            </div>
            <div class="map-container" id="map"></div>
          </div>
          
          <div id="content-spots" style="display: none;">
            <div class="list-header">
              <h2>喫煙所一覧</h2>
              <div class="search-box">
                <i class="material-icons">search</i>
                <input type="text" id="search-input" placeholder="喫煙所を検索">
              </div>
            </div>
            <div class="spot-list" id="spot-list">
              <!-- 喫煙所リストはJavaScriptで動的に生成 -->
            </div>
          </div>
          
          <div id="content-favorites" style="display: none;">
            <div class="list-header">
              <h2>お気に入り</h2>
              <div class="search-box">
                <i class="material-icons">search</i>
                <input type="text" id="favorites-search-input" placeholder="お気に入りを検索">
              </div>
            </div>
            <div class="spot-list" id="favorites-list">
              <!-- お気に入りリストはJavaScriptで動的に生成 -->
              <div class="empty-state" id="empty-favorites">
                <i class="material-icons">bookmark_border</i>
                <p>お気に入りの喫煙所がありません</p>
                <button class="secondary-button" id="browse-spots-button">
                  <i class="material-icons">explore</i>
                  喫煙所を探す
                </button>
              </div>
            </div>
          </div>
          
          <div id="content-profile" style="display: none;">
            <div class="profile-header">
              <h2>プロフィール</h2>
            </div>
            <div class="profile-content">
              <div class="profile-avatar">
                <i class="material-icons">account_circle</i>
              </div>
              <div class="profile-info">
                <p><strong>メールアドレス:</strong> ${user.email}</p>
                <p><strong>ユーザーID:</strong> ${user.uid.substring(0, 8)}...</p>
                <p><strong>アカウント作成日:</strong> ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
              </div>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">投稿</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">レビュー</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">お気に入り</span>
                </div>
              </div>
              
              <button id="logout-button" class="primary-button">
                <i class="material-icons">exit_to_app</i>
                ログアウト
              </button>
            </div>
          </div>
        </div>
        
        <div class="tabs">
          <div class="tab active" id="tab-map">
            <i class="material-icons">map</i>
            <span>地図</span>
          </div>
          <div class="tab" id="tab-spots">
            <i class="material-icons">list</i>
            <span>一覧</span>
          </div>
          <div class="tab" id="tab-favorites">
            <i class="material-icons">bookmark</i>
            <span>お気に入り</span>
          </div>
          <div class="tab" id="tab-profile">
            <i class="material-icons">person</i>
            <span>プロフィール</span>
          </div>
        </div>
        
        <div class="fab" id="add-spot-button">
          <i class="material-icons">add</i>
        </div>
      </div>
    `;
    
    // タブのイベントリスナー
    document.getElementById('tab-map').addEventListener('click', function() {
      showTab('map');
    });
    
    document.getElementById('tab-spots').addEventListener('click', function() {
      showTab('spots');
    });
    
    document.getElementById('tab-favorites').addEventListener('click', function() {
      showTab('favorites');
      renderFavoritesList(); // お気に入りリストを表示
    });
    
    document.getElementById('tab-profile').addEventListener('click', function() {
      showTab('profile');
    });
    
    // 喫煙所を探すボタンのイベントリスナー
    document.getElementById('browse-spots-button')?.addEventListener('click', function() {
      showTab('spots');
    });
    
    // フィルターボタンのイベントリスナー
    document.getElementById('filter-button').addEventListener('click', function() {
      showFilterDialog();
    });
    
    // 通知ボタンのイベントリスナー
    document.getElementById('notification-button').addEventListener('click', function() {
      showNotifications();
    });
    
    // ログアウトボタンのイベントリスナー
    document.getElementById('logout-button').addEventListener('click', function() {
      auth.signOut();
    });
    
    // 現在地ボタンのイベントリスナー
    document.getElementById('current-location-button').addEventListener('click', function() {
      if (currentPosition) {
        map.setCenter(currentPosition);
        map.setZoom(15);
      } else {
        getCurrentLocation();
      }
    });
    
    // 喫煙所追加ボタンのイベントリスナー
    document.getElementById('add-spot-button').addEventListener('click', function() {
      alert('喫煙所追加機能は開発中です。');
    });
    
    // 喫煙所リストの表示
    renderSpotList();
    
    // Google Maps APIが既に読み込まれている場合は手動でinitMap関数を呼び出す
    if (typeof google !== 'undefined' && google.maps) {
      initMap();
    }
    
    // タブを切り替える関数
    function showTab(tabName) {
      // すべてのタブを非アクティブにする
      document.querySelectorAll('.tab').forEach(function(tab) {
        tab.classList.remove('active');
      });
      
      // すべてのコンテンツを非表示にする
      document.getElementById('content-map').style.display = 'none';
      document.getElementById('content-spots').style.display = 'none';
      document.getElementById('content-favorites').style.display = 'none';
      document.getElementById('content-profile').style.display = 'none';
      
      // 選択されたタブをアクティブにする
      document.getElementById('tab-' + tabName).classList.add('active');
      
      // 選択されたコンテンツを表示する
      document.getElementById('content-' + tabName).style.display = 'block';
      
      // 地図タブが選択された場合、地図をリサイズ
      if (tabName === 'map' && map) {
        // 少し遅延させてリサイズを実行（DOMの更新後に実行するため）
        setTimeout(function() {
          google.maps.event.trigger(map, 'resize');
          
          // 地図の中心を再設定
          if (currentPosition) {
            map.setCenter(currentPosition);
          } else {
            // 東京駅を中心に設定
            map.setCenter({ lat: 35.681236, lng: 139.768149 });
          }
          
          console.log('Map resized after tab change');
        }, 100);
      }
    }
  }
  
  // 地図の初期化関数はグローバルスコープで定義されています
  
  // グローバルスコープで定義された getCurrentLocation 関数を使用
  
  // お気に入りリストを表示する関数
  function renderFavoritesList() {
    const user = auth.currentUser;
    const favoritesList = document.getElementById('favorites-list');
    const emptyState = document.getElementById('empty-favorites');
    
    if (!user || !favoritesList) return;
    
    // お気に入りリストをクリア（空の状態メッセージは残す）
    Array.from(favoritesList.children).forEach(child => {
      if (child.id !== 'empty-favorites') {
        child.remove();
      }
    });
    
    // Firebaseからお気に入りを取得
    db.collection('users').doc(user.uid).collection('savedSpots').get()
      .then(snapshot => {
        if (snapshot.empty) {
          // お気に入りがない場合は空の状態を表示
          if (emptyState) emptyState.style.display = 'flex';
          return;
        }
        
        // お気に入りがある場合は空の状態を非表示
        if (emptyState) emptyState.style.display = 'none';
        
        // お気に入りの喫煙所IDを取得
        const favoriteIds = snapshot.docs.map(doc => doc.data().spotId);
        
        // サンプルデータからお気に入りの喫煙所を検索
        const favoriteSpots = sampleSpots.filter(spot => favoriteIds.includes(spot.id));
        
        // お気に入りリストを表示
        favoriteSpots.forEach((spot, index) => {
          const spotElement = document.createElement('div');
          spotElement.className = 'spot-item';
          spotElement.style.animationDelay = `${index * 0.1}s`;
          
          // 営業時間の表示形式を整える
          const hoursText = spot.businessHours.isOpen24Hours
            ? '24時間営業'
            : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`;
          
          spotElement.innerHTML = `
            <div class="spot-item-content">
              <h3>${spot.title}</h3>
              <p>${spot.description}</p>
              
              <div class="spot-item-details">
                <div class="spot-rating">
                  <i class="material-icons">star</i>
                  <span>${spot.rating}</span>
                </div>
                <div class="spot-facilities">
                  ${spot.facilities.hasRoof ? '<i class="material-icons" title="屋根あり">roofing</i>' : ''}
                  ${spot.facilities.hasSeating ? '<i class="material-icons" title="座席あり">chair</i>' : ''}
                  ${spot.facilities.hasVendingMachine ? '<i class="material-icons" title="自販機あり">local_drink</i>' : ''}
                  ${spot.facilities.isIndoor ? '<i class="material-icons" title="屋内">home</i>' :
                    '<i class="material-icons" title="屋外">outdoor_grill</i>'}
                </div>
              </div>
              
              <div class="spot-hours">
                <i class="material-icons">access_time</i>
                <span>${hoursText}</span>
              </div>
              
              <div class="spot-actions">
                <button class="icon-button" onclick="navigateToSpot(${spot.location.lat}, ${spot.location.lng})">
                  <i class="material-icons">directions</i>
                </button>
                <button class="icon-button" onclick="removeFavorite('${spot.id}')">
                  <i class="material-icons">bookmark_remove</i>
                </button>
              </div>
            </div>
          `;
          
          // 喫煙所アイテムのクリックイベント
          spotElement.addEventListener('click', function(e) {
            // ボタンクリックの場合は伝播を止める
            if (e.target.closest('.spot-actions')) {
              e.stopPropagation();
              return;
            }
            
            // 地図タブに切り替え
            showTab('map');
            
            // 対応するマーカーの位置に地図を移動
            map.setCenter(spot.location);
            map.setZoom(17);
            
            // マーカーをクリックして情報ウィンドウを表示
            google.maps.event.trigger(markers[sampleSpots.indexOf(spot)], 'click');
          });
          
          favoritesList.appendChild(spotElement);
        });
      })
      .catch(error => {
        console.error('お気に入りの取得に失敗しました:', error);
        if (emptyState) {
          emptyState.innerHTML = `
            <i class="material-icons">error_outline</i>
            <p>お気に入りの読み込みに失敗しました</p>
            <button class="secondary-button" onclick="renderFavoritesList()">
              <i class="material-icons">refresh</i>
              再読み込み
            </button>
          `;
          emptyState.style.display = 'flex';
        }
      });
  }
  
  // お気に入りから削除する関数
  function removeFavorite(spotId) {
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('users').doc(user.uid).collection('savedSpots').doc(spotId).delete()
      .then(() => {
        alert('お気に入りから削除しました');
        renderFavoritesList(); // リストを更新
      })
      .catch(error => {
        console.error('お気に入りの削除に失敗しました:', error);
        alert('お気に入りの削除に失敗しました');
      });
  }
  
  // フィルターダイアログを表示する関数
  function showFilterDialog() {
    // モーダルダイアログを作成
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>フィルター設定</h2>
          <button class="close-button" id="close-filter-modal">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body">
          <div class="filter-section">
            <h3>施設</h3>
            <div class="filter-options">
              <label class="filter-option">
                <input type="checkbox" id="filter-roof" checked>
                <span>屋根あり</span>
              </label>
              <label class="filter-option">
                <input type="checkbox" id="filter-seating" checked>
                <span>座席あり</span>
              </label>
              <label class="filter-option">
                <input type="checkbox" id="filter-vending" checked>
                <span>自販機あり</span>
              </label>
              <label class="filter-option">
                <input type="checkbox" id="filter-indoor" checked>
                <span>屋内</span>
              </label>
              <label class="filter-option">
                <input type="checkbox" id="filter-outdoor" checked>
                <span>屋外</span>
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3>営業時間</h3>
            <div class="filter-options">
              <label class="filter-option">
                <input type="checkbox" id="filter-24h" checked>
                <span>24時間営業</span>
              </label>
              <label class="filter-option">
                <input type="checkbox" id="filter-daytime" checked>
                <span>日中営業</span>
              </label>
            </div>
          </div>
          
          <div class="filter-section">
            <h3>評価</h3>
            <div class="rating-slider">
              <span>最低評価: <span id="rating-value">3.0</span></span>
              <input type="range" id="rating-slider" min="1" max="5" step="0.5" value="3">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" id="reset-filter">リセット</button>
          <button class="primary-button" id="apply-filter">適用</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // スライダーの値を表示
    const slider = document.getElementById('rating-slider');
    const ratingValue = document.getElementById('rating-value');
    slider.addEventListener('input', function() {
      ratingValue.textContent = this.value;
    });
    
    // 閉じるボタンのイベントリスナー
    document.getElementById('close-filter-modal').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // リセットボタンのイベントリスナー
    document.getElementById('reset-filter').addEventListener('click', function() {
      document.querySelectorAll('.filter-option input').forEach(input => {
        input.checked = true;
      });
      slider.value = 3;
      ratingValue.textContent = '3.0';
    });
    
    // 適用ボタンのイベントリスナー
    document.getElementById('apply-filter').addEventListener('click', function() {
      // フィルター条件を取得
      const filters = {
        hasRoof: document.getElementById('filter-roof').checked,
        hasSeating: document.getElementById('filter-seating').checked,
        hasVendingMachine: document.getElementById('filter-vending').checked,
        isIndoor: document.getElementById('filter-indoor').checked,
        isOutdoor: document.getElementById('filter-outdoor').checked,
        is24Hours: document.getElementById('filter-24h').checked,
        isDaytime: document.getElementById('filter-daytime').checked,
        minRating: parseFloat(slider.value)
      };
      
      // フィルターを適用
      applyFilters(filters);
      
      // モーダルを閉じる
      document.body.removeChild(modal);
    });
    
    // モーダル外をクリックしたら閉じる
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  // フィルターを適用する関数
  function applyFilters(filters) {
    // フィルター条件に合う喫煙所を検索
    const filteredSpots = sampleSpots.filter(spot => {
      // 評価でフィルター
      if (spot.rating < filters.minRating) return false;
      
      // 施設でフィルター
      if (spot.facilities.hasRoof && !filters.hasRoof) return false;
      if (spot.facilities.hasSeating && !filters.hasSeating) return false;
      if (spot.facilities.hasVendingMachine && !filters.hasVendingMachine) return false;
      if (spot.facilities.isIndoor && !filters.isIndoor) return false;
      if (!spot.facilities.isIndoor && !filters.isOutdoor) return false;
      
      // 営業時間でフィルター
      if (spot.businessHours.isOpen24Hours && !filters.is24Hours) return false;
      if (!spot.businessHours.isOpen24Hours && !filters.isDaytime) return false;
      
      return true;
    });
    
    // フィルター結果を表示
    addSpotsToMap(filteredSpots);
    
    // スポットリストも更新
    const spotListElement = document.getElementById('spot-list');
    if (spotListElement) {
      spotListElement.innerHTML = '';
      
      if (filteredSpots.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
          <i class="material-icons">search_off</i>
          <p>条件に一致する喫煙所が見つかりませんでした</p>
          <button class="secondary-button" id="reset-filter-button">
            <i class="material-icons">refresh</i>
            フィルターをリセット
          </button>
        `;
        spotListElement.appendChild(emptyMessage);
        
        // リセットボタンのイベントリスナー
        document.getElementById('reset-filter-button').addEventListener('click', function() {
          addSpotsToMap(sampleSpots);
          renderSpotList();
        });
      } else {
        filteredSpots.forEach((spot, index) => {
          const spotElement = document.createElement('div');
          spotElement.className = 'spot-item';
          spotElement.style.animationDelay = `${index * 0.1}s`;
          
          // 営業時間の表示形式を整える
          const hoursText = spot.businessHours.isOpen24Hours
            ? '24時間営業'
            : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`;
          
          spotElement.innerHTML = `
            <div class="spot-item-content">
              <h3>${spot.title}</h3>
              <p>${spot.description}</p>
              
              <div class="spot-item-details">
                <div class="spot-rating">
                  <i class="material-icons">star</i>
                  <span>${spot.rating}</span>
                </div>
                <div class="spot-facilities">
                  ${spot.facilities.hasRoof ? '<i class="material-icons" title="屋根あり">roofing</i>' : ''}
                  ${spot.facilities.hasSeating ? '<i class="material-icons" title="座席あり">chair</i>' : ''}
                  ${spot.facilities.hasVendingMachine ? '<i class="material-icons" title="自販機あり">local_drink</i>' : ''}
                  ${spot.facilities.isIndoor ? '<i class="material-icons" title="屋内">home</i>' :
                    '<i class="material-icons" title="屋外">outdoor_grill</i>'}
                </div>
              </div>
              
              <div class="spot-hours">
                <i class="material-icons">access_time</i>
                <span>${hoursText}</span>
              </div>
            </div>
          `;
          
          // 喫煙所アイテムのクリックイベント
          spotElement.addEventListener('click', function() {
            // 地図タブに切り替え
            showTab('map');
            
            // 対応するマーカーの位置に地図を移動
            map.setCenter(spot.location);
            map.setZoom(17);
            
            // マーカーをクリックして情報ウィンドウを表示
            google.maps.event.trigger(markers[filteredSpots.indexOf(spot)], 'click');
          });
          
          spotListElement.appendChild(spotElement);
        });
      }
    }
    
    // フィルター適用メッセージを表示
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="material-icons">filter_list</i>
      <span>フィルターを適用しました (${filteredSpots.length}件)</span>
    `;
    document.body.appendChild(toast);
    
    // 3秒後にトーストを消す
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
  
  // 通知を表示する関数
  function showNotifications() {
    // モーダルダイアログを作成
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>通知</h2>
          <button class="close-button" id="close-notification-modal">
            <i class="material-icons">close</i>
          </button>
        </div>
        <div class="modal-body">
          <div class="notification-list">
            <div class="notification-item">
              <div class="notification-icon">
                <i class="material-icons">info</i>
              </div>
              <div class="notification-content">
                <h3>アプリへようこそ！</h3>
                <p>スモーカースポットへようこそ。喫煙所を簡単に探せるアプリです。</p>
                <span class="notification-time">たった今</span>
              </div>
            </div>
            <div class="notification-item">
              <div class="notification-icon">
                <i class="material-icons">place</i>
              </div>
              <div class="notification-content">
                <h3>近くに新しい喫煙所があります</h3>
                <p>あなたの近くに新しい喫煙所が追加されました。チェックしてみましょう。</p>
                <span class="notification-time">1時間前</span>
              </div>
            </div>
            <div class="notification-item">
              <div class="notification-icon">
                <i class="material-icons">update</i>
              </div>
              <div class="notification-content">
                <h3>アプリがアップデートされました</h3>
                <p>新機能が追加されました。詳細はプロフィールページでご確認ください。</p>
                <span class="notification-time">1日前</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button" id="mark-all-read">すべて既読にする</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 閉じるボタンのイベントリスナー
    document.getElementById('close-notification-modal').addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // すべて既読にするボタンのイベントリスナー
    document.getElementById('mark-all-read').addEventListener('click', function() {
      document.querySelectorAll('.notification-item').forEach(item => {
        item.classList.add('read');
      });
      
      // トーストメッセージを表示
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = `
        <i class="material-icons">done_all</i>
        <span>すべての通知を既読にしました</span>
      `;
      document.body.appendChild(toast);
      
      // 3秒後にトーストを消す
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
      
      // モーダルを閉じる
      document.body.removeChild(modal);
    });
    
    // モーダル外をクリックしたら閉じる
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  // 喫煙所をマップに追加
  function addSpotsToMap(spots) {
    console.log('Adding spots to map:', spots);
    
    // 既存のマーカーをクリア
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];
    
    // マップが初期化されているか確認
    if (!map) {
      console.error('Map not initialized yet');
      return;
    }
    
    // 喫煙所マーカーを追加
    spots.forEach(function(spot, index) {
      console.log(`Adding marker for spot ${index + 1}:`, spot.title);
      
      // マーカーオプションを設定
      const markerOptions = {
        position: spot.location,
        map: map,
        title: spot.title,
        animation: google.maps.Animation.DROP,
        zIndex: 10
      };
      
      // カスタムアイコンを設定
      const iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      try {
        markerOptions.icon = {
          url: iconUrl,
          scaledSize: new google.maps.Size(40, 40), // より大きく表示
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 40)
        };
      } catch (error) {
        console.warn('Failed to set custom icon:', error);
      }
      
      // マーカーを作成
      const marker = new google.maps.Marker(markerOptions);
      
      // マーカーをクリックしたときの情報ウィンドウ
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="info-window">
            <h3>${spot.title}</h3>
            <p class="info-description">${spot.description}</p>
            
            <div class="info-rating">
              <span class="rating-stars">
                ${Array(Math.floor(spot.rating)).fill('<i class="material-icons">star</i>').join('')}
                ${spot.rating % 1 >= 0.5 ? '<i class="material-icons">star_half</i>' : ''}
                ${Array(5 - Math.ceil(spot.rating)).fill('<i class="material-icons">star_border</i>').join('')}
              </span>
              <span class="rating-value">${spot.rating}</span>
            </div>
            
            <div class="info-facilities">
              <div class="facility ${spot.facilities.hasRoof ? 'active' : ''}">
                <i class="material-icons">${spot.facilities.hasRoof ? 'check_circle' : 'cancel'}</i>
                <span>屋根</span>
              </div>
              <div class="facility ${spot.facilities.hasSeating ? 'active' : ''}">
                <i class="material-icons">${spot.facilities.hasSeating ? 'check_circle' : 'cancel'}</i>
                <span>座席</span>
              </div>
              <div class="facility ${spot.facilities.hasVendingMachine ? 'active' : ''}">
                <i class="material-icons">${spot.facilities.hasVendingMachine ? 'check_circle' : 'cancel'}</i>
                <span>自販機</span>
              </div>
              <div class="facility ${spot.facilities.isIndoor ? 'active' : ''}">
                <i class="material-icons">${spot.facilities.isIndoor ? 'check_circle' : 'cancel'}</i>
                <span>${spot.facilities.isIndoor ? '屋内' : '屋外'}</span>
              </div>
            </div>
            
            <div class="info-hours">
              <i class="material-icons">access_time</i>
              <span>${spot.businessHours.isOpen24Hours ? '24時間営業' :
                `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`}</span>
            </div>
          </div>
        `
      });
      
      // マーカーのクリックイベント
      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
      
      markers.push(marker);
    });
  }
  
  // 喫煙所リストの表示
  function renderSpotList() {
    const spotListElement = document.getElementById('spot-list');
    if (!spotListElement) return;
    
    spotListElement.innerHTML = '';
    
    sampleSpots.forEach(function(spot, index) {
      const spotElement = document.createElement('div');
      spotElement.className = 'spot-item';
      spotElement.style.animationDelay = `${index * 0.1}s`;
      
      // 営業時間の表示形式を整える
      const hoursText = spot.businessHours.isOpen24Hours
        ? '24時間営業'
        : `${spot.businessHours.openingTime}〜${spot.businessHours.closingTime}`;
      
      spotElement.innerHTML = `
        <div class="spot-item-content">
          <h3>${spot.title}</h3>
          <p>${spot.description}</p>
          
          <div class="spot-item-details">
            <div class="spot-rating">
              <i class="material-icons">star</i>
              <span>${spot.rating}</span>
            </div>
            <div class="spot-facilities">
              ${spot.facilities.hasRoof ? '<i class="material-icons" title="屋根あり">roofing</i>' : ''}
              ${spot.facilities.hasSeating ? '<i class="material-icons" title="座席あり">chair</i>' : ''}
              ${spot.facilities.hasVendingMachine ? '<i class="material-icons" title="自販機あり">local_drink</i>' : ''}
              ${spot.facilities.isIndoor ? '<i class="material-icons" title="屋内">home</i>' :
                '<i class="material-icons" title="屋外">outdoor_grill</i>'}
            </div>
          </div>
          
          <div class="spot-hours">
            <i class="material-icons">access_time</i>
            <span>${hoursText}</span>
          </div>
        </div>
      `;
      
      // 喫煙所アイテムのクリックイベント
      spotElement.addEventListener('click', function() {
        // 地図タブに切り替え
        showTab('map');
        
        // 対応するマーカーの位置に地図を移動
        map.setCenter(spot.location);
        map.setZoom(17);
        
        // マーカーをクリックして情報ウィンドウを表示
        google.maps.event.trigger(markers[sampleSpots.indexOf(spot)], 'click');
      });
      
      spotListElement.appendChild(spotElement);
    });
  }
});