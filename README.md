# 🎮 ゲームプログラマーのためのデザインパターン大全

C# サンプルとゲームでの実例付き。GoF 23パターンからゲームAI・ネットワークまで **70パターン** を網羅した学習サイトです。

![Static Site](https://img.shields.io/badge/Static_Site-HTML%2FCSS%2FJS-blue)
![Patterns](https://img.shields.io/badge/Patterns-70-green)
![Lang](https://img.shields.io/badge/Sample_Code-C%23-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 特徴

- **C# サンプルコード** — すべてのパターンに動くコードを掲載
- **Unity 応用例** — ゲームエンジンでの実践的な使い方を併記
- **ゲームでのユースケース** — 「いつ・なぜ使うか」を重視した解説
- **理解度チェッククイズ** — 読んだだけで終わらない確認問題
- **ダークモード標準** — ゲーム開発者向けのUI
- **ビルド不要** — HTML/CSS/JS のみ。ブラウザで開くだけで動く

## 📚 収録パターン一覧

### 🎮 ゲームプログラミングパターン（13本）
| パターン | 概要 |
|---|---|
| Game Loop | 固定タイムステップの入力・更新・描画ループ |
| Update Method | 各オブジェクトが自分をフレームごとに更新 |
| Component | 振る舞いを部品として合成（Unity の根幹） |
| Object Pool | GC・生成コストを削減する使い回し機構 |
| Type Object | データ駆動で「種類」を定義しクラス爆発を防ぐ |
| Service Locator | グローバルサービスをレジストリ経由で取得 |
| Event Queue | イベントを溜めて後で処理しタイミングを分離 |
| Dirty Flag | 変更時だけ再計算して CPU を節約 |
| Spatial Partition | 空間分割で近傍探索を高速化 |
| Double Buffer | 更新と描画を二重バッファで分離 |
| Subclass Sandbox | 基底の操作集合で派生を安全に拡張 |
| Bytecode | VM でスクリプトをデータとして実行 |
| Data Locality | SOA でキャッシュ効率を最大化（ECS の基礎） |

### 🤖 ゲームAIパターン（8本）
FSM / 階層型FSM / Behavior Tree / Blackboard / GOAP / Utility AI / Steering Behaviors / A* Pathfinding

### 🌐 ネットワーク（6本）
Client-Server / Snapshot Interpolation / Client-Side Prediction / Server Reconciliation / Lockstep / Rollback Netcode

### ⚙️ 並行・非同期（6本）
Job System / Producer-Consumer / Thread Pool / Async/Await / Coroutine / Lazy Initialization

### 🏗 GoF 生成パターン（5本）
Singleton / Factory Method / Abstract Factory / Builder / Prototype

### 🧱 GoF 構造パターン（7本）
Adapter / Bridge / Composite / Decorator / Facade / Flyweight / Proxy

### 🔁 GoF 振る舞いパターン（11本）
State / Observer / Command / Strategy / Template Method / Iterator / Mediator / Memento / Chain of Responsibility / Visitor / Interpreter

### 💾 データ・永続化（4本）
Repository / Serialization / ScriptableObject / Event Sourcing

### 🏛 アーキテクチャ（6本）
MVC/MVP/MVVM / ECS / Dependency Injection / Clean Architecture / **Pub/Sub (Message Bus)** / Plugin・Module

### 🧮 関数型・汎用（4本）
Null Object / Result・Option / Immutable Object / Disposable・RAII

## 🚀 使い方

### ローカルで開く

```bash
git clone https://github.com/harumas/design-pattern-learning.git
cd design-pattern-learning

# ブラウザで index.html を直接開くか、ローカルサーバーを起動
python3 -m http.server 8080
# → http://localhost:8080 をブラウザで開く
```

### パターン詳細ページへ直接アクセス

```
pattern.html?id=object-pool
pattern.html?id=state
pattern.html?id=observer
pattern.html?id=behavior-tree
```

## 📄 各パターンページの構成

1. **一言で言うと** — 1〜2文の要約と難易度・ゲーム頻出度
2. **どんな問題を解決するか** — Before のつらいコード例
3. **解決のアイデア** — テキストと ASCII クラス図
4. **C# サンプルコード** — 動くコード（C# 基本実装 / Unity 応用例 タブ切り替え）
5. **メリット・デメリット**
6. **アンチパターン・注意点**
7. **関連パターン** — クリックで移動可能なチップ
8. **理解度チェック** — 2〜3問のクイズ

## 🛠 技術スタック

| 技術 | 用途 |
|---|---|
| HTML / CSS / JavaScript | UI・レイアウト・ナビゲーション |
| [highlight.js](https://highlightjs.org/) | C# シンタックスハイライト |
| `data/patterns.json` | 全パターンのメタデータ・検索インデックス |
| `assets/js/pattern-content.js` | 全パターンのコンテンツ（解説・コード・クイズ） |

ビルドツール・フレームワーク・依存パッケージは **ゼロ**。GitHub Pages にそのままデプロイ可能です。

## 🌍 GitHub Pages でのデプロイ

1. リポジトリの **Settings → Pages**
2. Source を `Deploy from a branch` → `main` / `/ (root)` に設定
3. 保存すると `https://<username>.github.io/design-pattern-learning/` で公開

## 📖 参考文献

- Robert Nystrom 『[Game Programming Patterns](https://gameprogrammingpatterns.com)』
- Erich Gamma ほか 『デザインパターン — 再利用可能なオブジェクト指向ソフトウェアの要素』
- [Refactoring.Guru — Design Patterns](https://refactoring.guru/design-patterns)
- Microsoft .NET ドキュメント（C# コーディング規約）

## 📝 ライセンス

MIT License — サンプルコードは自由に使用・改変・商用利用できます。
