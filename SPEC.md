# デザインパターン学習サイト 仕様書

## 1. 概要

### 1.1 目的
デザインパターンを体系的に学べる Web サイトを構築する。サンプルコードはすべて **C#** で記述し、特に **ゲーム制作（Unity を含む）で実用的なパターン** を優先的に扱いつつ、世界標準（GoF 23 パターンなど）を網羅する。

### 1.2 ターゲットユーザー
- C# を学習中〜中級のゲームプログラマー
- Unity でコードを書いているが設計に自信がない人
- GoF パターンを実務・ゲーム文脈で理解し直したい人

### 1.3 コンセプト
- 「**いつ・なぜ使うか**」を最重視。理論より実践。
- すべてのパターンに **ゲームでのユースケース** と **動く C# サンプル** を付ける。
- 各ページは「概要 → 問題 → 解決 → コード → ゲームでの応用 → アンチパターン/注意点 → 関連パターン」の一貫した構成。

---

## 2. 取り扱うデザインパターン一覧

### 2.1 ゲームプログラミングパターン（最優先・独立カテゴリ）
Robert Nystrom『Game Programming Patterns』をベースに、ゲーム特有のパターンを扱う。

| パターン | 概要 | ゲームでの代表例 |
|---|---|---|
| Game Loop | 入力・更新・描画を回し続ける中心ループ | すべてのゲームの心臓部 |
| Update Method | 各オブジェクトを毎フレーム更新 | `MonoBehaviour.Update()` |
| Component | 振る舞いを部品として合成 | Unity の GameObject + Component |
| Object Pool | オブジェクトを使い回し GC/生成コストを削減 | 弾丸・敵・エフェクト |
| Type Object | データ駆動で「種類」を定義 | 敵・アイテムのマスターデータ |
| Service Locator | グローバルサービスへの参照を取得 | AudioManager, SaveSystem |
| Event Queue | イベントを溜めて後で処理 | サウンド・実績・通知 |
| Dirty Flag | 変更があった時だけ再計算 | Transform 行列, UI 再描画 |
| Spatial Partition | 空間分割で近傍探索を高速化 | 当たり判定, AI 索敵 |
| Double Buffer | 状態を二重化し描画と更新を分離 | 画面・セルオートマトン |
| Subclass Sandbox | 基底が提供する操作で派生を安全に拡張 | スキル・必殺技の定義 |
| Bytecode | スクリプトを VM で実行しデータ化 | スキル/AI スクリプト |
| Data Locality | キャッシュ効率重視のデータ配置 | ECS, パーティクル |

### 2.2 生成に関するパターン（Creational / GoF）
| パターン | ゲームでの代表例 |
|---|---|
| Singleton | GameManager, AudioManager（使いすぎ注意の解説付き） |
| Factory Method | 敵・弾の生成 |
| Abstract Factory | プラットフォーム別 UI、ステージ別アセット一式 |
| Builder | キャラクター生成、ダンジョン生成、ダイアログ構築 |
| Prototype | 敵テンプレートの複製生成 |

### 2.3 構造に関するパターン（Structural / GoF）
| パターン | ゲームでの代表例 |
|---|---|
| Adapter | サードパーティ SDK / 旧 API のラップ |
| Bridge | プラットフォーム別入力・描画の分離 |
| Composite | UI ツリー、シーングラフ、スキルツリー |
| Decorator | バフ/デバフ、武器エンチャント |
| Facade | 複雑なサブシステムの簡易窓口（SaveSystem 等） |
| Flyweight | タイル・草・木など大量オブジェクトの共有 |
| Proxy | 遅延ロード、アセットの仮参照、ネットワーク代理 |

### 2.4 振る舞いに関するパターン（Behavioral / GoF）
| パターン | ゲームでの代表例 |
|---|---|
| Strategy | AI の行動アルゴリズム差し替え |
| Observer | 体力変化 → UI 更新、実績解除 |
| State | キャラクター状態（待機/歩行/攻撃）、ステートマシン |
| Command | 入力のリバインド、リプレイ、Undo/Redo |
| Template Method | ターン処理の骨組み |
| Iterator | インベントリ走査 |
| Mediator | UI コンポーネント間の仲介 |
| Memento | セーブ/ロード、チェックポイント |
| Chain of Responsibility | ダメージ計算パイプライン、入力処理 |
| Visitor | シーングラフへの操作適用 |
| Interpreter | 簡易スクリプト/数式の解釈 |

### 2.5 ゲーム AI / 意思決定パターン（ゲーム重点・全採用）
| パターン | 概要 | 代表例 |
|---|---|---|
| Finite State Machine (FSM) | 状態遷移の管理（State の実践版） | 敵 AI の基本 |
| Hierarchical State Machine | 状態を階層化 | 複雑なキャラ制御 |
| Behavior Tree | 振る舞いをツリーで構成 | 現代 AAA の AI 標準 |
| Blackboard | 共有データ領域で AI 間連携 | 分隊 AI、知識共有 |
| GOAP | 目標から行動を逆算 | F.E.A.R. の AI |
| Utility AI | 各行動を評価値で選択 | The Sims 系 |
| Steering Behaviors | 操舵で群れ・追跡を表現 | Boids、群衆 |
| Pathfinding (A*) | 経路探索 | マップ移動全般 |

### 2.6 ネットワーク / マルチプレイヤー（ゲーム重点・全採用）
| パターン | 概要 |
|---|---|
| Client-Server | 権威サーバー型構成 |
| Snapshot Interpolation | 受信状態を補間表示 |
| Client-Side Prediction | 入力を先行予測 |
| Server Reconciliation | 予測のズレを補正 |
| Lockstep | 入力同期で決定論的進行（RTS） |
| Rollback Netcode | 巻き戻し再計算（格ゲー標準） |

### 2.7 並行 / 非同期 / 最適化（ゲーム重点・全採用）
| パターン | 概要 |
|---|---|
| Job System / Task Parallelism | 処理を並列ジョブ化（DOTS Jobs） |
| Producer-Consumer | 生産と消費をキューで分離 |
| Thread Pool | スレッドを使い回す |
| Async/Await (Future/Promise) | 非同期結果の表現 |
| Frame-based Coroutine | フレームをまたぐ処理（Unity Coroutine） |
| Lazy Initialization | 必要時に初期化 |

### 2.8 データ / 永続化（代表のみ厳選）
| パターン | 概要 |
|---|---|
| Repository | データアクセスの抽象化 |
| Serialization | セーブデータの直列化 |
| ScriptableObject (Unity) | データ資産としての設定保持 |
| Event Sourcing | 状態を「イベントの履歴」で表現 |

### 2.9 アーキテクチャ / 設計原則（代表のみ厳選）
| パターン | 概要 |
|---|---|
| MVC / MVP / MVVM | UI とロジックの分離 |
| ECS (Entity Component System) | データ指向設計、DOTS の基礎 |
| Dependency Injection (+Container) | 依存の注入とテスト容易性（Zenject/VContainer） |
| Clean Architecture | 依存を内向きに保つ層構造 |
| Pub/Sub (Message Bus) | 疎結合なメッセージ配信 |
| Plugin / Module | 機能を差し替え可能に |

### 2.10 関数型 / 汎用パターン（代表のみ厳選）
| パターン | 概要 |
|---|---|
| Null Object | 「何もしない」オブジェクトで null 回避 |
| Result / Option | 成功・失敗、有無を型で安全に表現 |
| Immutable Object | 不変オブジェクト |
| Disposable / RAII | 確実なリソース解放（using） |

> 合計: ゲームパターン 13 + ゲーム AI 8 + ネットワーク 6 + 並行 6 + GoF 23 + データ 4 + アーキテクチャ 6 + 関数型/汎用 4 = **約 70 パターン**。GoF を完全網羅しつつ、ゲーム制作の実戦パターンを厚くカバーする。

---

## 3. サイト構成 / 画面設計

### 3.1 ページ一覧
1. **トップ（ホーム）**
   - サイトの目的、対象者、学習の進め方
   - カテゴリへの導線（カード）
   - 「ゲームでよく使う Top 10」ショートカット
2. **カテゴリ一覧ページ**（10 カテゴリ: ゲーム / ゲームAI / ネットワーク / 並行 / 生成 / 構造 / 振る舞い / データ / アーキテクチャ / 関数型）
   - 各カテゴリのパターンをカード/リスト表示
3. **パターン詳細ページ**（パターンごとに 1 ページ）
4. **パターン早見表（チートシート）**
   - 全パターンを 1 ページで俯瞰、目的から逆引き
5. **用語集**
   - 結合度、凝集度、ポリモーフィズム等の前提用語
6. **学習ロードマップ**
   - 初心者→中級者の推奨学習順

### 3.2 パターン詳細ページの統一テンプレート
各詳細ページは以下のセクションを必ず持つ:
1. **一言で言うと**（1〜2 文）
2. **分類 / 難易度 / ゲーム頻出度**（バッジ表示）
3. **どんな問題を解決するか**（Before のつらいコード例）
4. **解決のアイデア**（クラス図 or 概念図）
5. **C# 基本サンプル**（GoF 的な純粋実装）
6. **ゲームでの応用例**（Unity 寄りの実用コード）
7. **メリット / デメリット**
8. **アンチパターン・使いすぎ注意**
9. **関連パターン**（相互リンク）
10. **理解度チェック**（簡単な小クイズ 2〜3 問・任意）

### 3.3 共通 UI
- ヘッダー: ロゴ、カテゴリナビ、検索ボックス
- サイドバー: パターン一覧（カテゴリ別アコーディオン、現在地ハイライト）
- コードブロック: シンタックスハイライト + コピーボタン
- フッター: 参考文献、ライセンス
- ダークモード対応（ゲーム開発者向けにデフォルト dark）
- レスポンシブ（PC 優先、スマホでも閲覧可）

---

## 4. 技術仕様

### 4.1 方針
- **静的サイト**として構築（サーバー不要、GitHub Pages 等で公開可能）。
- ビルド不要で動く構成を基本とし、保守の容易さを優先。

### 4.2 技術スタック（案 A: シンプル / 推奨）
- HTML + CSS + バニラ JavaScript
- シンタックスハイライト: **highlight.js**（C# 対応、CDN 読み込み）
- 検索: クライアントサイドの簡易全文検索（JSON インデックス）
- パターンデータは `data/patterns.json` に集約し、JS でページ生成 or 各 HTML に展開

### 4.3 技術スタック（案 B: 拡張）
- 静的サイトジェネレーター（Astro / VitePress / Docusaurus 等）
- Markdown でコンテンツ管理、ビルドして静的出力
- 検索・ナビ・ダークモードが標準装備

> **確定: 案 A（バニラ HTML/CSS/JS）を採用。** 学習用かつ依存を増やさず、コードの透明性を保つため。案 B は規模拡大時に移行検討。

### 4.4 ディレクトリ構成（案 A）
```
design-pattern-learning/
├── index.html                # トップ
├── cheatsheet.html           # 早見表
├── glossary.html             # 用語集
├── roadmap.html              # 学習ロードマップ
├── patterns/                 # 各パターン詳細ページ
│   ├── singleton.html
│   ├── object-pool.html
│   └── ...
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js           # ナビ・ダークモード・検索
│   │   └── search-index.json
│   └── img/                  # 図版（クラス図など）
├── data/
│   └── patterns.json         # パターンメタデータ（一覧/検索/相互リンク用）
└── SPEC.md
```

### 4.5 パターンデータのスキーマ（patterns.json）
```jsonc
{
  "id": "object-pool",
  "name": "Object Pool",
  "nameJa": "オブジェクトプール",
  "category": "game",          // game | game-ai | network | concurrency | creational | structural | behavioral | data | architecture | functional
  "summary": "生成コストの高いオブジェクトを使い回す。",
  "difficulty": 2,              // 1-3
  "gameFrequency": 3,           // 1-3 ゲームでの出現頻度
  "tags": ["最適化", "GC", "弾幕"],
  "related": ["flyweight", "factory-method"],
  "url": "patterns/object-pool.html"
}
```

---

## 5. コンテンツ品質基準

- サンプルコードは **コンパイル可能なレベル**で記述（疑似コードにしない）。
- **確定方針: 純 C# 実装を中心に据え、各パターンに Unity 応用例を併記**。Unity 依存コードは「Unity 例」と明記し、純 C# 例と分ける。
- 各コードに **コメントで意図** を記述。
- Before/After（パターン適用前後）の対比を入れる。
- 専門用語は初出時にリンク or 注釈。
- 図版は最低限テキスト/ASCII 図でも可、可能なら SVG。

---

## 6. 開発フェーズ計画

| フェーズ | 内容 | 成果物 |
|---|---|---|
| P0 | 仕様確定・デザイン方針決定 | 本 SPEC |
| P1 | 共通基盤構築 | レイアウト、CSS、ナビ、ダークモード、トップページ |
| P2 | データ駆動の仕組み | patterns.json、一覧/検索/サイドバー |
| P3 | パターン詳細の雛形 + 代表 3 パターン | テンプレHTML, Singleton / Object Pool / State |
| P4 | ゲームパターン全 13 本 | game カテゴリ完成 |
| P5 | GoF 23 本 | creational/structural/behavioral 完成 |
| P6 | アーキテクチャ補足 + 早見表/用語集/ロードマップ | 全コンテンツ完成 |
| P7 | 仕上げ | レスポンシブ調整、クイズ、リンク検査、公開 |

---

## 7. 非対象（スコープ外）
- 動画・アニメーション教材
- ユーザー登録・進捗保存（将来検討）
- 多言語対応（まずは日本語のみ）
- バックエンド/DB

---

## 8. 参考文献
- Erich Gamma ほか『デザインパターン（GoF 本）』
- Robert Nystrom『Game Programming Patterns』(gameprogrammingpatterns.com)
- Microsoft .NET ドキュメント（C# コーディング規約）
- refactoring.guru（パターン解説の構成参考）
```
