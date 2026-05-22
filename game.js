// ========================================
// 商品データ（10種）
// ★変更：market → baseMarket + range に変更
// range は変動幅（0.35 = ±35%）
// ========================================
const allProducts = [
  { name: "中古スマホ",     desc: "2年前のフラッグシップ、傷なし美品",   baseMarket: 35000,  range: 0.35, hint: "数万円くらい？" },
  { name: "骨董の壺",       desc: "江戸末期？出所不明の焼き物",           baseMarket: 120000, range: 0.40, hint: "数十万円くらい？" },
  { name: "レトロゲーム機", desc: "30年前の名機、箱・説明書あり",         baseMarket: 18000,  range: 0.35, hint: "数万円くらい？" },
  { name: "高級メロン",     desc: "北海道産、糖度16度以上の逸品",         baseMarket: 8000,   range: 0.30, hint: "数千円くらい？" },
  { name: "高級抹茶",       desc: "京都宇治産、100g缶入り",               baseMarket: 5000,   range: 0.30, hint: "数千円くらい？" },
  { name: "ヴィンテージ時計",desc: "スイス製、動作確認済み",              baseMarket: 200000, range: 0.40, hint: "十数万〜数十万円？" },
  { name: "高級ウイスキー", desc: "20年熟成、未開封",                     baseMarket: 45000,  range: 0.35, hint: "数万円くらい？" },
  { name: "古地図",         desc: "明治時代の東京、状態良好",             baseMarket: 80000,  range: 0.40, hint: "数万〜十数万円？" },
  { name: "レコード盤",     desc: "60年代ジャズ、初回プレス",             baseMarket: 25000,  range: 0.35, hint: "数万円くらい？" },
  { name: "鉄道模型",       desc: "蒸気機関車、限定品",                   baseMarket: 60000,  range: 0.35, hint: "数万円くらい？" },
];

// ========================================
// ゲームの状態を管理する変数
// ★変更：products（今回使う3商品）を追加
// ========================================
let products     = [];  // ★変更：ランダムに選ばれた3商品を入れる配列
let currentRound = 0;
let totalScore   = 0;
let isFailed     = false;
let roundDone    = false;


// ========================================
// ★変更：配列をシャッフルする関数
// Fisher-Yates法：末尾から順にランダムな位置と入れ替える
// ========================================
function shuffle(array) {
  // 元の配列を壊さないようにコピーする
  const arr = array.slice();

  // 末尾のインデックスから0まで順番に処理する
  for (let i = arr.length - 1; i > 0; i--) {
    // 0以上i以下のランダムな整数を作る
    const j = Math.floor(Math.random() * (i + 1));

    // arr[i] と arr[j] を入れ替える
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}


// ========================================
// ★変更：実際の相場金額を計算する関数
// baseMarket ± range の範囲でランダムに決める
// ========================================
function calcMarket(baseMarket, range) {
  // 変動幅の最大値（例：35000 × 0.35 = 12250）
  const maxVariation = baseMarket * range;

  // -maxVariation 〜 +maxVariation のランダムな値
  // Math.random() は 0以上1未満の小数を返す
  const variation = maxVariation * 2 * Math.random() - maxVariation;

  // 基準値に増減を足して、100円単位に丸める
  return Math.round((baseMarket + variation) / 100) * 100;
}


// ========================================
// 画面を切り替える（変更なし）
// ========================================
function showScreen(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(function(screen) {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}


// ========================================
// ゲームを開始する
// ★変更：商品をランダムに3種選び、相場金額を確定させる
// ========================================
function startGame() {
  currentRound = 0;
  totalScore   = 0;
  isFailed     = false;

  // ★変更：allProducts をシャッフルして先頭3つを取り出す
  const shuffled = shuffle(allProducts);
  const selected = shuffled.slice(0, 3);

  // ★変更：選んだ3商品それぞれの実際の相場金額を計算して確定する
  // market プロパティとして追加する
  products = selected.map(function(p) {
    return {
      name:   p.name,
      desc:   p.desc,
      hint:   p.hint,
      market: calcMarket(p.baseMarket, p.range)  // ★変更：ここで相場確定
    };
  });

  showScreen('screen-game');
  showProduct();
}


// ========================================
// 商品を画面に表示する（変更なし）
// ========================================
function showProduct() {
  roundDone = false;

  const product = products[currentRound];

  document.getElementById('round-label').textContent =
    'ラウンド ' + (currentRound + 1) + ' / ' + products.length;
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-desc').textContent = product.desc;
  document.getElementById('product-hint').textContent = product.hint;
  document.getElementById('reaction-text').textContent = '金額を提示してください';
  document.getElementById('error-msg').textContent = '';
  document.getElementById('price-input').value = '';

  document.getElementById('input-area').style.display = 'block';
  document.getElementById('next-area').style.display = 'none';
}


// ========================================
// 金額を提示する（変更なし）
// ========================================
function propose() {
  if (roundDone) return;

  const inputValue = document.getElementById('price-input').value;
  const price      = parseInt(inputValue);

  if (inputValue === '' || isNaN(price) || price <= 0) {
    document.getElementById('error-msg').textContent =
      '正しい金額を入力してください（1以上の整数）';
    return;
  }

  document.getElementById('error-msg').textContent = '';

  const market = products[currentRound].market;
  const result = getReaction(price, market);

  document.getElementById('reaction-text').textContent = result.message;

  if (result.outcome === '決裂') {
    isFailed = true;
    endGame();

  } else if (result.outcome === '成立') {
    totalScore += market - price;
    roundDone = true;
    document.getElementById('input-area').style.display = 'none';
    document.getElementById('next-area').style.display = 'block';

  } else {
    document.getElementById('price-input').value = '';
  }
}


// ========================================
// まっちゃんの反応を決める（変更なし）
// ========================================
function getReaction(price, market) {
  const ratio = price / market;

  if (ratio < 0.5) {
    return { outcome: '決裂', message: 'なめとんか！そんな値段、話にならへんわ！帰れ！（交渉決裂）' };
  } else if (ratio < 0.8) {
    return { outcome: '継続', message: 'ちょっと待ってや。そんな安い値段あり得へんやろ。もうちょい出せへんの？' };
  } else if (ratio < 1.1) {
    return { outcome: '成立', message: 'まあ…しゃーないな。ほな、その値段で手打ちにしたるわ。（取引成立）' };
  } else if (ratio < 1.5) {
    return { outcome: '成立', message: 'おお、ええ値段やないか！ほな買うたるわ！（取引成立）' };
  } else if (ratio < 2.0) {
    return { outcome: '成立', message: '…ふふ。兄ちゃん、ええ値段つけてくれるやんか。（取引成立）' };
  } else {
    return { outcome: '成立', message: 'ちょ、兄ちゃん…そんな値段でええんか？大丈夫？（取引成立）' };
  }
}


// ========================================
// 次のラウンドへ進む（変更なし）
// ========================================
function nextRound() {
  currentRound++;
  if (currentRound >= products.length) {
    endGame();
  } else {
    showProduct();
  }
}


// ========================================
// ゲーム終了・結果を表示する（変更なし）
// ========================================
function endGame() {
  showScreen('screen-result');

  if (isFailed) {
    document.getElementById('result-text').textContent = '交渉決裂！失格です…';
    document.getElementById('result-score').textContent = 'スコア：0点';
    return;
  }

  let rank = '';
  if      (totalScore >= 80000) rank = '🏆 敏腕バイヤー！';
  else if (totalScore >= 40000) rank = '⭐ 中堅バイヤー';
  else if (totalScore >= 0)     rank = '🆙 新米バイヤー';
  else                          rank = '💸 損してもうた…';

  document.getElementById('result-text').textContent = '全3商品の交渉が完了！';
  document.getElementById('result-score').textContent =
    '合計スコア：' + totalScore.toLocaleString() + '円　' + rank;
}