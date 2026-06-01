/* ============================================================
   pattern-content.js
   全パターンのコンテンツデータ（C#コード・解説・クイズ）
   pattern.html が window.PATTERNS[id] を参照して描画する
   ============================================================ */
window.PATTERNS = {

/* ============================================================
   🎮 ゲームプログラミングパターン
   ============================================================ */

'game-loop': {
  name: 'Game Loop',
  nameJa: 'ゲームループ',
  category: 'game',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['ループ', 'フレーム', 'タイム', '物理', '固定タイムステップ'],
  summary: '入力処理・ゲーム状態の更新・画面描画を固定サイクルで繰り返す、ゲームの心臓部となるパターン。フレームレートを安定させ、物理演算の再現性を保証する。',

  problem: `
    <p>ゲームは「ループ」で動いています。しかし単純に <code>while(true)</code> で更新と描画を回すと、
    実行環境の処理速度に依存してしまいます。高性能マシンでは敵が猛スピードで動き、
    低性能マシンではスローモーションになります。</p>
    <p>また物理演算は固定の時間刻みで計算しないと、フレームレートによって衝突判定が変わるという
    致命的なバグが発生します。</p>`,

  solution: `
    <p><strong>固定タイムステップ（Fixed Timestep）</strong>で更新し、描画は補間（Interpolation）で滑らかにするのが定石です。</p>
    <ol>
      <li>前フレームからの経過時間を計測して <code>lag</code> に積算</li>
      <li><code>lag</code> が固定ステップ以上なら <code>Update()</code> を呼び続ける（追いつき処理）</li>
      <li><code>Render()</code> には残り <code>lag/step</code> の割合を渡して補間描画</li>
    </ol>`,

  diagram: `
┌─────────────────────────────────────────────┐
│                  Game Loop                   │
│                                             │
│  ┌──────────┐   ┌──────────┐  ┌──────────┐ │
│  │ProcessInput│→ │  Update  │→ │  Render  │ │
│  └──────────┘   └────┬─────┘  └──────────┘ │
│         ↑            │ 固定 Δt で繰り返し         │
│         └────────────┘                      │
└─────────────────────────────────────────────┘`,

  csharpCode: `using System;

public class GameLoop
{
    private bool _running;

    // 1秒あたり60回更新（物理・AI の固定ステップ）
    private const double TARGET_UPS = 60.0;
    private const double MS_PER_UPDATE = 1000.0 / TARGET_UPS;

    public void Start()
    {
        _running = true;
        double previous = GetTimeMs();
        double lag = 0.0;          // 追いつけていない時間の累積

        while (_running)
        {
            double current = GetTimeMs();
            double elapsed = current - previous;
            previous = current;
            lag += elapsed;

            // ── 入力 ─────────────────────────────────
            ProcessInput();

            // ── 更新（固定タイムステップ）────────────
            while (lag >= MS_PER_UPDATE)
            {
                Update(MS_PER_UPDATE / 1000.0);   // 秒単位のdeltaTimeを渡す
                lag -= MS_PER_UPDATE;
            }

            // ── 描画（補間で滑らか）──────────────────
            // lag/MS_PER_UPDATE = 0.0〜1.0: 次フレームへの進行割合
            Render(lag / MS_PER_UPDATE);
        }
    }

    public void Stop() => _running = false;

    private void ProcessInput()
    {
        // キーボード・ゲームパッドの入力をポーリング
        // 例: if (Input.GetKeyDown(Key.Escape)) Stop();
    }

    private void Update(double deltaTime)
    {
        // 物理演算・AI・ゲームロジックを固定Δtで更新
        // deltaTime は常に MS_PER_UPDATE/1000 = 0.01666...秒
    }

    private void Render(double interpolation)
    {
        // interpolation (0〜1) を使って位置を補間描画
        // 例: renderPos = prevPos + (currentPos - prevPos) * interpolation
    }

    private double GetTimeMs()
        => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
}`,

  unityCode: `// Unity では MonoBehaviour が Game Loop を内蔵している
// Update / FixedUpdate / LateUpdate がその各フェーズに対応

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float _speed = 5f;
    private Rigidbody _rb;

    private void Awake()
    {
        _rb = GetComponent<Rigidbody>();
    }

    // FixedUpdate = 固定タイムステップ更新（物理・移動に使う）
    // Time.fixedDeltaTime は常に一定（デフォルト 0.02 秒）
    private void FixedUpdate()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        _rb.MovePosition(_rb.position +
            new Vector3(h, 0f, v) * _speed * Time.fixedDeltaTime);
    }

    // Update = 描画フレームごとの更新（入力読み取りや UI に使う）
    // Time.deltaTime はフレームごとに変動する
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
            Application.Quit();
    }

    // LateUpdate = Update 後に実行（カメラ追従など）
    private void LateUpdate()
    {
        // カメラをプレイヤーに追従させるなど
    }
}`,

  pros: [
    '物理演算が実行環境に依存せず再現性が保てる',
    '固定Δtなので数値積分が安定する',
    '描画補間によりフレームレート以上の滑らかさを出せる',
    'マルチプレイヤーのロールバックや録画・再生の基盤になる',
  ],
  cons: [
    '実装がやや複雑（lag 変数や補間の計算が必要）',
    'Update を複数回呼ぶ可能性があり重い処理があるとフレーム落ちが連鎖する',
    'Unity 等のエンジンを使う場合は内蔵ループを使うので自前実装は不要',
  ],

  antipattern: `
    <p><strong>可変Δtだけで物理を回す</strong>のは危険です。
    <code>Update(Time.deltaTime)</code> で速度を足し込むと、
    フレームレートが不安定な環境では衝突抜けや挙動の差が生じます。
    物理・AI は必ず <strong>FixedUpdate</strong> か固定タイムステップで処理しましょう。</p>`,

  related: ['update-method', 'double-buffer', 'coroutine'],

  quiz: [
    {
      q: 'Game Loop で「固定タイムステップ」を使う主な理由は何ですか？',
      options: [
        '描画が速くなるから',
        '物理演算の再現性を保証するため',
        'CPU 使用率を下げるため',
        'コードが短くなるから',
      ],
      answer: 1,
      explanation: '物理演算は時間刻みが変わると結果が変わります。固定Δtにすることで環境によらず同じ挙動を保証できます。',
    },
    {
      q: 'Unity の FixedUpdate と Update の違いとして正しいのはどれですか？',
      options: [
        'FixedUpdate は描画フレームごと、Update は固定間隔で呼ばれる',
        'FixedUpdate は固定間隔（物理向き）、Update は描画フレームごとに呼ばれる',
        '両方とも描画フレームごとに呼ばれる',
        '違いはなく、好みで使い分ける',
      ],
      answer: 1,
      explanation: 'FixedUpdate は Time.fixedDeltaTime（デフォルト 0.02 秒）で固定的に呼ばれ、物理演算に適しています。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'update-method': {
  name: 'Update Method',
  nameJa: '更新メソッド',
  category: 'game',
  difficulty: 1,
  gameFrequency: 3,
  tags: ['フレーム', 'Update', 'MonoBehaviour', 'エンティティ'],
  summary: '各ゲームオブジェクトが自分の振る舞いをフレームごとに更新する Update メソッドを持ち、ゲームループから一斉に呼び出されるパターン。',

  problem: `
    <p>ゲームには多数の敵・アイテム・エフェクトが存在します。
    ゲームループ側に全エンティティの更新ロジックを書くと、
    追加・削除のたびにループコードを修正しなければなりません。</p>
    <p>「敵が増えたらゲームループを直す」という設計は、<strong>開放・閉鎖原則</strong>に違反します。</p>`,

  solution: `
    <p>各エンティティに <code>Update(float deltaTime)</code> メソッドを持たせ、
    ゲームループはエンティティリストを走査して一斉呼び出しするだけにします。
    新しい敵を追加してもゲームループは変更不要です。</p>`,

  diagram: `
GameLoop
  └─ foreach entity in _entities
        entity.Update(dt)

Entity (abstract)
  ├─ Enemy   : Update() → 移動・攻撃AI
  ├─ Bullet  : Update() → 弾道計算・当たり判定
  └─ Particle: Update() → フェードアウト`,

  csharpCode: `using System.Collections.Generic;

// ─── 基底クラス ───────────────────────────────────────────
public abstract class Entity
{
    public bool IsActive { get; protected set; } = true;

    // 毎フレーム呼ばれる（deltaTime は秒単位）
    public abstract void Update(float deltaTime);
}

// ─── 具体エンティティ ─────────────────────────────────────
public class Enemy : Entity
{
    private float _x, _y;
    private float _speed = 3f;

    public override void Update(float deltaTime)
    {
        // プレイヤーへ向かって移動（簡略版）
        _x += _speed * deltaTime;

        // 画面外に出たら非アクティブ化
        if (_x > 100f) IsActive = false;
    }
}

public class Bullet : Entity
{
    public float X { get; private set; }
    public float Y { get; private set; }
    private float _vx, _vy;

    public Bullet(float x, float y, float vx, float vy)
    {
        X = x; Y = y; _vx = vx; _vy = vy;
    }

    public override void Update(float deltaTime)
    {
        X += _vx * deltaTime;
        Y += _vy * deltaTime;

        if (X < 0 || X > 100 || Y < 0 || Y > 100)
            IsActive = false;
    }
}

// ─── ゲームループ側（エンティティを管理する） ────────────
public class World
{
    private readonly List<Entity> _entities = new();

    public void Add(Entity e) => _entities.Add(e);

    public void UpdateAll(float deltaTime)
    {
        // 全エンティティを更新
        foreach (var e in _entities)
            if (e.IsActive) e.Update(deltaTime);

        // 非アクティブなものをまとめて除去
        _entities.RemoveAll(e => !e.IsActive);
    }
}`,

  unityCode: `// Unity の MonoBehaviour.Update() がまさにこのパターン

public class Enemy : MonoBehaviour
{
    [SerializeField] private float _speed = 3f;
    private Transform _player;

    private void Start()
    {
        // ゲーム開始時にプレイヤーを探す
        _player = GameObject.FindWithTag("Player")?.transform;
    }

    // Unity が毎フレーム自動で呼び出す
    private void Update()
    {
        if (_player == null) return;

        // プレイヤーへ向かって移動
        Vector3 dir = (_player.position - transform.position).normalized;
        transform.position += dir * _speed * Time.deltaTime;
    }
}`,

  pros: [
    'エンティティの追加・削除がゲームループに影響しない',
    '各エンティティの振る舞いが自己完結し理解しやすい',
    'Unity など主要エンジンのアーキテクチャの基盤',
  ],
  cons: [
    '大量エンティティでは Update 呼び出しのオーバーヘッドが積み重なる',
    '依存関係のある更新順序の制御が必要になる場合がある',
    'データ局所性が低くキャッシュミスが起きやすい（→ECSで改善）',
  ],

  antipattern: `
    <p>全オブジェクトに重い処理を書くと Update 地獄になります。
    <strong>必要なフレームだけ処理する</strong>（スリープ・コルーチン）や
    <strong>ECS でデータを連続配置</strong>してキャッシュ効率を上げることを検討しましょう。</p>`,

  related: ['game-loop', 'component', 'ecs', 'coroutine'],

  quiz: [
    {
      q: 'Update Method パターンの主な目的は何ですか？',
      options: [
        '描画を高速化する',
        'エンティティの振る舞いをゲームループから分離する',
        'メモリを節約する',
        'ネットワーク通信を管理する',
      ],
      answer: 1,
      explanation: '各エンティティが自分の Update を持つことで、ゲームループはエンティティリストを走査するだけになり、追加・削除が容易になります。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'component': {
  name: 'Component',
  nameJa: 'コンポーネント',
  category: 'game',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['合成', 'ECS', 'Unity', 'GameObject', 'コンポジション'],
  summary: '機能を独立した「コンポーネント」として部品化し、オブジェクトに動的に取り付けることで継承の代わりに合成で振る舞いを構築する。Unity の根幹設計。',

  problem: `
    <p>ゲームオブジェクトの種類が増えると、継承ツリーが爆発します。
    「飛ぶ敵」「泳ぐ敵」「飛んで攻撃する敵」を表現するのに、
    すべての組み合わせのサブクラスを作るのは現実的ではありません。</p>
    <pre style="background:var(--bg3);padding:.75rem;border-radius:6px;font-size:.8rem">
// ❌ 継承で組み合わせを表現しようとすると…
Character → FlyingCharacter → FlyingAttackingCharacter
         → SwimmingCharacter → SwimmingAttackingCharacter
    </pre>`,

  solution: `
    <p>振る舞いをコンポーネントとして独立させ、GameObject はコンポーネントを
    アタッチするだけのコンテナにします。<strong>継承より合成（Composition over Inheritance）</strong>の原則です。</p>`,

  diagram: `
GameObject
 ├── TransformComponent  （位置・回転・スケール）
 ├── PhysicsComponent    （重力・衝突）
 ├── RenderComponent     （描画）
 ├── InputComponent      （入力受付）    ← プレイヤーのみ
 └── AIComponent         （AI行動）      ← 敵のみ

組み合わせで「プレイヤー」「敵」「障害物」が自由に作れる`,

  csharpCode: `using System;
using System.Collections.Generic;

// ─── コンポーネント基底 ───────────────────────────────────
public abstract class Component
{
    public GameObject Owner { get; internal set; }
    public virtual void Update(float deltaTime) { }
    public virtual void OnAttached() { }
}

// ─── GameObject（コンポーネントのコンテナ） ───────────────
public class GameObject
{
    private readonly Dictionary<Type, Component> _components = new();

    public T AddComponent<T>(T component) where T : Component
    {
        component.Owner = this;
        _components[typeof(T)] = component;
        component.OnAttached();
        return component;
    }

    public T GetComponent<T>() where T : Component
    {
        _components.TryGetValue(typeof(T), out var c);
        return c as T;
    }

    public bool TryGetComponent<T>(out T component) where T : Component
    {
        component = GetComponent<T>();
        return component != null;
    }

    public void Update(float deltaTime)
    {
        foreach (var c in _components.Values)
            c.Update(deltaTime);
    }
}

// ─── 具体コンポーネント ───────────────────────────────────
public class TransformComponent : Component
{
    public float X { get; set; }
    public float Y { get; set; }
    public float Rotation { get; set; }
}

public class PhysicsComponent : Component
{
    private float _vy;
    private const float Gravity = -9.8f;

    public override void Update(float deltaTime)
    {
        _vy += Gravity * deltaTime;
        var t = Owner.GetComponent<TransformComponent>();
        if (t != null) t.Y += _vy * deltaTime;
    }
}

public class RenderComponent : Component
{
    public string SpriteName { get; set; } = "default";

    public override void Update(float deltaTime)
    {
        var t = Owner.GetComponent<TransformComponent>();
        Console.WriteLine($"Render '{SpriteName}' at ({t?.X:F1}, {t?.Y:F1})");
    }
}

// ─── 使用例 ───────────────────────────────────────────────
public class ComponentExample
{
    public static void Run()
    {
        // プレイヤー = Transform + Physics + Render
        var player = new GameObject();
        player.AddComponent(new TransformComponent { X = 0, Y = 10 });
        player.AddComponent(new PhysicsComponent());
        player.AddComponent(new RenderComponent { SpriteName = "player" });

        player.Update(0.016f);  // 1フレーム更新
    }
}`,

  unityCode: `// Unity では AddComponent<T>() / GetComponent<T>() がそのまま使える

public class Enemy : MonoBehaviour
{
    private Rigidbody _rb;
    private Collider _col;

    private void Awake()
    {
        // コンポーネントを取得
        _rb  = GetComponent<Rigidbody>();
        _col = GetComponent<Collider>();
    }

    private void Start()
    {
        // 実行時にコンポーネントを動的追加
        var audio = gameObject.AddComponent<AudioSource>();
        audio.clip = Resources.Load<AudioClip>("Sounds/EnemyBGM");
    }
}

// ScriptableObject でコンポーネントの設定を外部データ化するパターン
[CreateAssetMenu(menuName = "Enemy/Stats")]
public class EnemyStats : ScriptableObject
{
    public float Speed = 3f;
    public int MaxHp = 100;
    public string SpriteName = "enemy_default";
}`,

  pros: [
    '継承ツリーが爆発しない（組み合わせで表現できる）',
    'コンポーネント単体でテスト可能',
    'Unity、Godot など主要エンジンの設計基盤',
    '実行時に動的アタッチ・デタッチが可能',
  ],
  cons: [
    'コンポーネント間の依存（GetComponent<T>）が暗黙的になりやすい',
    '多数コンポーネントを持つ GameObject のデバッグが複雑',
    'コンポーネント間通信の設計が必要',
  ],

  antipattern: `
    <p>コンポーネント同士が <code>GetComponent&lt;T&gt;()</code> で直接参照し合うと、
    コンポーネントの独立性が失われます。
    依存はなるべく <strong>イベント/Observer 経由</strong>か、
    <strong>依存注入</strong>で解決しましょう。</p>`,

  related: ['update-method', 'ecs', 'decorator', 'composite'],

  quiz: [
    {
      q: 'Component パターンが解決する主な問題は何ですか？',
      options: [
        'ネットワーク通信の複雑さ',
        '継承ツリーの爆発的な増加',
        'メモリの断片化',
        'マルチスレッドの競合',
      ],
      answer: 1,
      explanation: '多様なオブジェクト種類を継承で表現しようとするとクラス爆発が起きます。コンポーネントの合成で解決します。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'object-pool': {
  name: 'Object Pool',
  nameJa: 'オブジェクトプール',
  category: 'game',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['最適化', 'GC', '弾丸', 'エフェクト', 'パフォーマンス'],
  summary: '生成・破棄コストの高いオブジェクトを使い終わっても破棄せずプールに戻して再利用する。GC スパイクを防ぎ、弾丸・エフェクト・敵などの大量生成に不可欠。',

  problem: `
    <p>弾幕シューティングで弾を <code>new Bullet()</code> → <code>破棄</code> を繰り返すと、
    ヒープに大量のゴミが溜まり GC（ガベージコレクション）が発動します。
    GC が走った瞬間に処理が止まり、<strong>一瞬のカクつき（スパイク）</strong>が起きます。</p>`,

  solution: `
    <p>プールを用意し、「使い終わったオブジェクト」はプールに返却します。
    次に必要になったときはプールから取り出して再初期化するだけ。
    <code>new</code> も GC も最小限になります。</p>`,

  diagram: `
Client  ───Get()──→  ObjectPool  ──Pop──→  Bullet (再利用)
         ←─Return()─            ←─Push──  Bullet (使用済み)

Pool が空のとき: new Bullet() してプールに追加
Pool が満杯のとき: Return() を無視（または古いものを上書き）`,

  csharpCode: `using System.Collections.Generic;

// ─── 汎用オブジェクトプール ───────────────────────────────
public class ObjectPool<T> where T : class, IPoolable, new()
{
    private readonly Stack<T> _pool = new();
    private readonly int _maxSize;

    public int Count => _pool.Count;

    public ObjectPool(int initialSize = 10, int maxSize = 200)
    {
        _maxSize = maxSize;
        for (int i = 0; i < initialSize; i++)
            _pool.Push(new T());
    }

    // プールから取得（空なら新規生成）
    public T Get()
    {
        var obj = _pool.Count > 0 ? _pool.Pop() : new T();
        obj.OnSpawn();
        return obj;
    }

    // プールに返却
    public void Return(T obj)
    {
        obj.OnDespawn();
        if (_pool.Count < _maxSize)
            _pool.Push(obj);
        // 満杯なら obj は GC に任せる（最大数を超えないよう管理）
    }
}

// ─── プールで使うオブジェクトが実装するインターフェース ───
public interface IPoolable
{
    void OnSpawn();    // プールから取り出された時の初期化
    void OnDespawn();  // プールへ返却される時のリセット
}

// ─── 弾のクラス ───────────────────────────────────────────
public class Bullet : IPoolable
{
    public float X { get; private set; }
    public float Y { get; private set; }
    public float Vx { get; private set; }
    public float Vy { get; private set; }
    public bool IsActive { get; private set; }

    public void Init(float x, float y, float vx, float vy)
    {
        X = x; Y = y; Vx = vx; Vy = vy;
        IsActive = true;
    }

    public void Update(float dt)
    {
        X += Vx * dt;
        Y += Vy * dt;
    }

    public void OnSpawn()   { IsActive = true; }
    public void OnDespawn() { IsActive = false; X = Y = Vx = Vy = 0; }
}

// ─── 使用例 ───────────────────────────────────────────────
public class BulletManager
{
    private readonly ObjectPool<Bullet> _pool = new(initialSize: 64);
    private readonly List<Bullet> _active = new();

    // 弾を発射
    public void Fire(float x, float y, float angle, float speed)
    {
        var b = _pool.Get();
        b.Init(x, y,
            MathF.Cos(angle) * speed,
            MathF.Sin(angle) * speed);
        _active.Add(b);
    }

    public void UpdateAll(float dt)
    {
        for (int i = _active.Count - 1; i >= 0; i--)
        {
            var b = _active[i];
            b.Update(dt);

            // 画面外に出たらプールへ返却
            if (!IsOnScreen(b))
            {
                _pool.Return(b);
                _active.RemoveAt(i);
            }
        }
    }

    private bool IsOnScreen(Bullet b)
        => b.X >= 0 && b.X <= 800 && b.Y >= 0 && b.Y <= 600;
}`,

  unityCode: `// Unity 2021+ には UnityEngine.Pool が標準装備
using UnityEngine;
using UnityEngine.Pool;

public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet _prefab;
    [SerializeField] private int _defaultCapacity = 64;
    [SerializeField] private int _maxSize = 200;

    private IObjectPool<Bullet> _pool;

    private void Awake()
    {
        _pool = new ObjectPool<Bullet>(
            createFunc:    () => Instantiate(_prefab),
            actionOnGet:   b  => b.gameObject.SetActive(true),
            actionOnRelease: b => b.gameObject.SetActive(false),
            actionOnDestroy: b => Destroy(b.gameObject),
            defaultCapacity: _defaultCapacity,
            maxSize: _maxSize
        );
    }

    public void Fire(Vector3 position, Vector3 direction)
    {
        var b = _pool.Get();
        b.transform.position = position;
        b.Init(direction, _pool);   // 弾が画面外に出たら自分でReturnする
    }
}

// Bullet 側では使い終わったら自分でプールへ返す
public class Bullet : MonoBehaviour
{
    private IObjectPool<Bullet> _pool;
    private Vector3 _direction;
    [SerializeField] private float _speed = 10f;

    public void Init(Vector3 dir, IObjectPool<Bullet> pool)
    {
        _direction = dir;
        _pool = pool;
        Invoke(nameof(ReturnToPool), 3f);  // 3秒後に自動返却
    }

    private void Update()
    {
        transform.position += _direction * _speed * Time.deltaTime;
    }

    private void ReturnToPool()
    {
        CancelInvoke();
        _pool.Release(this);
    }
}`,

  pros: [
    'GC スパイクを防いでフレームレートを安定させる',
    'new / Destroy のコストを事実上ゼロにできる',
    '弾幕・エフェクト・パーティクルなどに絶大な効果',
    'Unity 2021+ は ObjectPool<T> が標準提供',
  ],
  cons: [
    'プールサイズの見積もりが必要（小さすぎると new が走る、大きすぎるとメモリ浪費）',
    'OnDespawn() でのリセット漏れがバグの温床になる',
    '参照を誰かが持ち続けると「返却済みオブジェクト」が変な動作をする',
  ],

  antipattern: `
    <p><strong>返却漏れ</strong>が最大の罠です。<code>Return()</code> を呼ばないと
    プールは枯渇し、最終的に <code>new</code> ばかり走るようになります。
    また <strong>返却後もそのオブジェクトへの参照を保持</strong>すると、
    別の処理が使い始めたオブジェクトを二重に触るバグが起きます。</p>`,

  related: ['flyweight', 'factory-method', 'disposable-raii'],

  quiz: [
    {
      q: 'Object Pool を使う主な目的はどれですか？',
      options: [
        'コードを短くする',
        'GC によるフレームドロップを防ぐ',
        'クラスの継承を減らす',
        'ネットワーク通信を最適化する',
      ],
      answer: 1,
      explanation: '頻繁な new/破棄によるヒープ汚染を防ぎ、GC スパイクによるフレーム落ちを回避するのが主目的です。',
    },
    {
      q: 'プールへ返却（Return）した後のオブジェクト参照の扱いとして正しいのは？',
      options: [
        '返却後も安全に参照できる',
        '返却後は参照をすぐに null にすべき',
        '返却後は自動で null になる',
        'どちらでもよい',
      ],
      answer: 1,
      explanation: '返却済みオブジェクトは次の Get() で別の処理に渡されます。参照を持ち続けると二重使用バグが発生します。',
    },
  ],
},


/* ============================================================
   ゲームパターン後半
   ============================================================ */

'type-object': {
  name: 'Type Object',
  nameJa: '型オブジェクト',
  category: 'game',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['データ駆動', 'マスタデータ', 'ScriptableObject', '種類'],
  summary: '「種類」をサブクラスではなくデータオブジェクトとして定義し、クラス爆発なしに多様なエンティティを生み出す。',

  problem: `<p>RPGの敵を「スライム」「ゴブリン」「ドラゴン」で表現するとき、
    それぞれをサブクラスにするとクラスが爆発します。
    しかも「炎ドラゴン」「氷ドラゴン」を追加するたびにエンジニアが必要になり、
    デザイナーが自由にデータを調整できません。</p>`,

  solution: `<p>「種類」を表す <strong>Type Object（テンプレートオブジェクト）</strong>を作り、
    インスタンスはそれへの参照を持つだけにします。
    新しい種類の追加はデータの追加だけで完結し、プログラマー不要でゲームデザイナーが行えます。</p>`,

  diagram: `
EnemyType (Type Object)
  ├── name: "Fire Dragon"
  ├── maxHp: 500
  ├── attack: 80
  └── element: Fire

Enemy (Instance)
  ├── _type → EnemyType  ← 共有
  ├── currentHp: 430
  └── position: (10, 5)

複数の Enemy が同じ EnemyType を共有 → メモリ節約`,

  csharpCode: `// ─── Type Object（種類のテンプレート） ───────────────────
public class EnemyType
{
    public string Name     { get; }
    public int    MaxHp    { get; }
    public int    Attack   { get; }
    public int    Defense  { get; }
    public string SpriteName { get; }

    public EnemyType(string name, int maxHp, int attack, int defense, string sprite)
    {
        Name = name; MaxHp = maxHp; Attack = attack;
        Defense = defense; SpriteName = sprite;
    }
}

// ─── インスタンス（Type を参照） ──────────────────────────
public class Enemy
{
    private readonly EnemyType _type;  // 種類への参照（共有）
    public int CurrentHp { get; private set; }
    public float X { get; set; }
    public float Y { get; set; }

    public string Name    => _type.Name;
    public int    MaxHp   => _type.MaxHp;
    public int    Attack  => _type.Attack;

    public Enemy(EnemyType type, float x, float y)
    {
        _type = type;
        CurrentHp = type.MaxHp;
        X = x; Y = y;
    }

    public void TakeDamage(int dmg)
    {
        int actual = Math.Max(0, dmg - _type.Defense);
        CurrentHp = Math.Max(0, CurrentHp - actual);
    }
}

// ─── 使用例（マスタデータの定義と生成） ─────────────────
public static class EnemyMaster
{
    // 通常はJSONやScriptableObjectから読み込む
    public static readonly EnemyType Slime  = new("スライム",  30,  5, 0, "slime");
    public static readonly EnemyType Goblin = new("ゴブリン", 60, 12, 3, "goblin");
    public static readonly EnemyType Dragon = new("ドラゴン",500, 80,20, "dragon");
}

// 敵を大量生成してもEnemyTypeは共有される
var enemies = new[]
{
    new Enemy(EnemyMaster.Slime,  0f, 0f),
    new Enemy(EnemyMaster.Slime, 10f, 0f),
    new Enemy(EnemyMaster.Goblin, 5f, 3f),
};`,

  unityCode: `// Unity では ScriptableObject が Type Object の役割を担う
[CreateAssetMenu(fileName = "EnemyType", menuName = "Game/EnemyType")]
public class EnemyTypeSO : ScriptableObject
{
    public string EnemyName;
    public int    MaxHp;
    public int    Attack;
    public int    Defense;
    public Sprite Icon;
    public AudioClip DeathSound;
}

// Enemy Prefab にアタッチし、Inspectorで種類を差し替えるだけ
public class Enemy : MonoBehaviour
{
    [SerializeField] private EnemyTypeSO _type;
    private int _currentHp;

    private void Start() => _currentHp = _type.MaxHp;

    public void TakeDamage(int dmg)
    {
        _currentHp -= Mathf.Max(0, dmg - _type.Defense);
        if (_currentHp <= 0) Die();
    }

    private void Die() => AudioSource.PlayClipAtPoint(_type.DeathSound, transform.position);
}`,

  pros: [
    'クラス爆発なしに多様な種類を表現できる',
    'データ変更にプログラマーが不要（デザイナーが調整可能）',
    'JSON/ScriptableObject から読み込めばランタイム変更も可能',
  ],
  cons: [
    '種類ごとに大きく異なる振る舞いはコードで表現しにくい',
    'Type と Instance の二層管理でやや複雑になる',
  ],

  antipattern: `<p>振る舞いの差異が大きい場合（「ドラゴンだけ飛行する」等）は
    Type Object だけでは対応できず、<strong>Strategy パターンと組み合わせる</strong>か、
    サブクラスが必要になります。データで表現できる範囲を見極めましょう。</p>`,

  related: ['prototype', 'flyweight', 'scriptable-object'],

  quiz: [
    {
      q: 'Type Object パターンの利点はどれですか？',
      options: [
        'スレッドセーフになる', 'クラス爆発を防ぎデータ駆動で種類を管理できる',
        'GCが減る', 'ネットワーク通信が速くなる',
      ],
      answer: 1,
      explanation: '種類をデータとして定義することで、プログラマーなしにデザイナーがゲームデータを変更できるようになります。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'service-locator': {
  name: 'Service Locator',
  nameJa: 'サービスロケーター',
  category: 'game',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['DI', 'AudioManager', 'Singleton代替', '中小規模向け'],
  summary: 'グローバルサービスをレジストリ経由で取得する。Singleton より柔軟だが依存が隠れる欠点もある中間的パターン。小〜中規模プロジェクト向けで、大規模では DI コンテナが本命。',

  problem: `<p>ゲーム全体で使う AudioManager を各クラスから参照したい。
    <code>AudioManager.Instance.Play("jump")</code> のような Singleton は
    コードが増えるにつれ依存が拡散し、テストが困難になります。</p>`,

  solution: `<p>ServiceLocator というレジストリにサービスを登録し、
    利用側は <code>ServiceLocator.Get&lt;IAudioService&gt;()</code> でインターフェース経由で取得します。
    テスト時はモック実装に差し替えるだけです。</p>`,

  csharpCode: `using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

// ─── インターフェース ──────────────────────────────────────
public interface IAudioService
{
    void Play(string clipName);
    void Stop();
    void SetVolume(float volume);
}

// ─── Service Locator（スレッドセーフ・ファクトリ対応版） ──
public static class ServiceLocator
{
    // ConcurrentDictionary でスレッドセーフを保証
    private static readonly ConcurrentDictionary<Type, object>       _instances = new();
    private static readonly ConcurrentDictionary<Type, Func<object>> _factories  = new();

    // ── インスタンス登録（即時） ──────────────────────────
    public static void Register<T>(T service, bool overwrite = false) where T : class
    {
        if (!overwrite && _instances.ContainsKey(typeof(T)))
            throw new InvalidOperationException(
                $"[ServiceLocator] {typeof(T).Name} は登録済みです。" +
                $" 上書きする場合は overwrite: true を指定してください。");

        _instances[typeof(T)] = service;
    }

    // ── ファクトリ登録（遅延初期化） ──────────────────────
    // 初めて Get<T>() された時点でファクトリを呼んでインスタンス生成
    public static void RegisterFactory<T>(Func<T> factory) where T : class
        => _factories[typeof(T)] = () => factory();

    // ── 取得 ──────────────────────────────────────────────
    public static T Get<T>() where T : class
    {
        // 1. インスタンスキャッシュを確認
        if (_instances.TryGetValue(typeof(T), out var cached))
            return (T)cached;

        // 2. ファクトリがあれば生成してキャッシュ
        if (_factories.TryGetValue(typeof(T), out var factory))
        {
            var instance = (T)factory();
            _instances[typeof(T)] = instance;  // 次回からキャッシュを返す
            return instance;
        }

        throw new InvalidOperationException(
            $"[ServiceLocator] {typeof(T).Name} が登録されていません。" +
            $" Register<T>() か RegisterFactory<T>() を先に呼んでください。");
    }

    // ── null を返す版（省略可能なサービス向け） ────────────
    public static T GetOrDefault<T>() where T : class
    {
        try { return Get<T>(); }
        catch { return null; }
    }

    // ── 登録解除・リセット（主にテスト用） ──────────────────
    public static void Unregister<T>() where T : class
    {
        _instances.TryRemove(typeof(T), out _);
        _factories.TryRemove(typeof(T), out _);
    }

    public static void Reset()
    {
        _instances.Clear();
        _factories.Clear();
    }
}

// ─── 実装クラス ───────────────────────────────────────────
public class AudioService : IAudioService
{
    public void Play(string clip)  => Console.WriteLine($"[Audio] Playing: {clip}");
    public void Stop()             => Console.WriteLine("[Audio] Stopped");
    public void SetVolume(float v) => Console.WriteLine($"[Audio] Volume: {v}");
}

// Null Object 実装（テスト・無音環境用）
public class NullAudioService : IAudioService
{
    public void Play(string clip)  { }
    public void Stop()             { }
    public void SetVolume(float v) { }
}

// ─── 登録パターンの例 ─────────────────────────────────────

// ① 即時登録
ServiceLocator.Register<IAudioService>(new AudioService());

// ② 遅延登録（初めて使われた時に生成）
ServiceLocator.RegisterFactory<IAudioService>(() => new AudioService());

// ③ 取得
ServiceLocator.Get<IAudioService>().Play("jump");

// ④ テスト時: Reset してモックに差し替え
ServiceLocator.Reset();
ServiceLocator.Register<IAudioService>(new NullAudioService());`,

  pros: [
    'Singleton と違いインターフェース経由なのでモック差し替えが容易',
    'グローバルアクセスを保ちつつ具体クラスへの依存を排除できる',
  ],
  cons: [
    '依存が実行時まで見えない（コンパイル時にエラーが出ない）',
    'どこでも呼べるためモジュール境界が曖昧になりやすい',
    'DI コンテナがあれば Service Locator は不要なことが多い',
  ],

  antipattern: `
    <p><strong>「依存が隠れる」問題：</strong>
    コンストラクタを見ても依存が分からず、中身を読まないと何に依存しているか不明になります。
    これは Mark Seemann などが「アンチパターン」と呼ぶ最大の理由です。</p>
    <p><strong>推奨使い分け：</strong></p>
    <ul style="margin:.5rem 0 0 1.25rem;font-size:.875rem;color:var(--text2)">
      <li>ゲームジャム・小規模 → Singleton でも許容範囲</li>
      <li>中規模 → Service Locator は「Singleton からの卒業」として有効</li>
      <li>中〜大規模 → <strong>Zenject / VContainer（DI コンテナ）が本命</strong></li>
    </ul>
    <p style="margin-top:.75rem">Register 忘れは実行時例外になります。<strong>Null Object</strong> と組み合わせてデフォルト実装を返すようにすると安全です。</p>`,

  related: ['singleton', 'dependency-injection', 'null-object'],
},

/* ─────────────────────────────────────────────────────────── */

'event-queue': {
  name: 'Event Queue',
  nameJa: 'イベントキュー',
  category: 'game',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['キュー', 'サウンド', '実績', '非同期', 'メッセージ'],
  summary: 'イベントをキューに積んで後で処理することで、発行と処理のタイミングを切り離す。Observer の「即時呼び出し」問題を解決する。',

  problem: `<p>Observer パターンで <code>OnDamage</code> を即座に発火すると、
    イベントハンドラー内でまた別のイベントが発火し、
    無限ループやスタックオーバーフローが起きる場合があります。
    サウンド再生も「同フレームに 10 個同時再生」を防ぎたいことがあります。</p>`,

  solution: `<p>イベントをキューに積んでおき、フレームの末尾（または専用のフェーズ）でまとめて処理します。
    発行側は「イベントを投げて終わり」、処理は後から行われます。</p>`,

  csharpCode: `using System.Collections.Generic;

// ─── イベントの種類 ───────────────────────────────────────
public enum GameEventType { Damage, Death, LevelUp, Achievement }

public readonly struct GameEvent
{
    public GameEventType Type  { get; }
    public object        Payload { get; }

    public GameEvent(GameEventType type, object payload = null)
    {
        Type = type; Payload = payload;
    }
}

// ─── イベントキュー ───────────────────────────────────────
public class EventQueue
{
    private readonly Queue<GameEvent> _queue = new();
    private readonly Dictionary<GameEventType, List<Action<GameEvent>>> _handlers = new();

    // イベントを発行（キューに積むだけ）
    public void Publish(GameEvent evt) => _queue.Enqueue(evt);

    // ハンドラー登録
    public void Subscribe(GameEventType type, Action<GameEvent> handler)
    {
        if (!_handlers.ContainsKey(type))
            _handlers[type] = new List<Action<GameEvent>>();
        _handlers[type].Add(handler);
    }

    // フレーム末尾でまとめて処理（ゲームループから呼ぶ）
    public void ProcessAll()
    {
        int limit = _queue.Count;  // 処理中に追加されたイベントは次フレームへ
        for (int i = 0; i < limit && _queue.Count > 0; i++)
        {
            var evt = _queue.Dequeue();
            if (_handlers.TryGetValue(evt.Type, out var list))
                foreach (var h in list) h(evt);
        }
    }
}

// ─── 使用例 ───────────────────────────────────────────────
var eq = new EventQueue();

// 実績システムが登録
eq.Subscribe(GameEventType.LevelUp, e =>
    Console.WriteLine("Achievement unlocked: Level Up!"));

// UIが登録
eq.Subscribe(GameEventType.Damage, e =>
    Console.WriteLine($"Showing damage: {e.Payload}"));

// ゲームロジックがイベントを発行（即座には処理されない）
eq.Publish(new GameEvent(GameEventType.Damage, 42));
eq.Publish(new GameEvent(GameEventType.LevelUp));

// フレーム末尾でまとめて処理
eq.ProcessAll();`,

  pros: [
    '発行と処理の時間を分離できる',
    '同フレームに大量発行されても処理を制御できる',
    '再帰的なイベント発火を防げる',
  ],
  cons: [
    '即時レスポンスが必要なイベントには不向き',
    'キューのサイズ管理が必要',
    '処理遅延のデバッグがやや難しい',
  ],

  antipattern: `<p>毎フレーム処理しないと <strong>キューが膨張</strong>します。
    また処理中に新しいイベントを追加する場合の無限ループに注意。
    <code>int limit = _queue.Count</code> のように処理上限を設けて現フレームのみ処理しましょう。</p>`,

  related: ['observer', 'pub-sub', 'command'],
},

/* ─────────────────────────────────────────────────────────── */

'dirty-flag': {
  name: 'Dirty Flag',
  nameJa: 'ダーティフラグ',
  category: 'game',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['最適化', 'Transform', 'キャッシュ', 'UI', '差分更新'],
  summary: '変更があった時だけ「ダーティ（汚れた）」フラグを立て、必要になった時だけ再計算することで無駄な演算を省く。',

  problem: `<p>シーングラフで親の座標が変わるたびに全子孫のワールド行列を再計算すると、
    変更のない子孫まで毎フレーム計算してしまい無駄が生じます。</p>`,

  solution: `<p>「変更されたか」を示すフラグ（Dirty Flag）を保持し、
    実際に値が必要になったときだけ再計算します。
    変更がない間は前回の結果を使い回します。</p>`,

  csharpCode: `public class Transform
{
    private float _localX, _localY;
    private float _worldX, _worldY;
    private bool  _isDirty = true;        // 初回は必ず計算
    private Transform _parent;

    public float LocalX
    {
        get => _localX;
        set { _localX = value; SetDirty(); }
    }
    public float LocalY
    {
        get => _localY;
        set { _localY = value; SetDirty(); }
    }

    // ワールド座標（必要になった時だけ計算）
    public float WorldX => GetWorldTransform().wx;
    public float WorldY => GetWorldTransform().wy;

    private void SetDirty()
    {
        _isDirty = true;
        // 子孫にも伝播（省略：実際は子リストを走査）
    }

    private (float wx, float wy) GetWorldTransform()
    {
        if (_isDirty)
        {
            if (_parent != null)
            {
                _worldX = _localX + _parent.WorldX;
                _worldY = _localY + _parent.WorldY;
            }
            else
            {
                _worldX = _localX;
                _worldY = _localY;
            }
            _isDirty = false;
        }
        return (_worldX, _worldY);
    }
}`,

  pros: [
    '変更がない間は再計算コストがゼロ',
    '深いシーングラフでも必要な部分だけ更新できる',
  ],
  cons: [
    'フラグの伝播（子孫へのダーティ伝搬）ロジックが必要',
    'フラグ更新漏れがサイレントバグになる',
  ],

  antipattern: `<p>ダーティフラグを毎フレームリセットしてしまうと効果がなくなります。
    また親のフラグを子孫に伝播し忘れると、子孫が古いキャッシュを使い続けるバグになります。</p>`,

  related: ['spatial-partition', 'component'],
},

/* ─────────────────────────────────────────────────────────── */

'spatial-partition': {
  name: 'Spatial Partition',
  nameJa: '空間分割',
  category: 'game',
  difficulty: 3,
  gameFrequency: 2,
  tags: ['当たり判定', 'AI', 'Quadtree', 'グリッド', '最適化'],
  summary: '空間をグリッドやツリーで分割してオブジェクトを整理し、近傍探索を O(n²) から O(log n) や O(1) に高速化する。',

  problem: `<p>1000体の敵の当たり判定をすべてのペアで検査すると 50万回の比較が必要です（O(n²)）。
    これを毎フレーム行うと処理が破綻します。</p>`,

  solution: `<p>空間をグリッドセルや四分木で分割し、
    各オブジェクトがどのセルに属するかを管理します。
    近傍探索は「同じまたは隣のセル内のオブジェクトのみ比較」で済みます。</p>`,

  csharpCode: `// ─── 固定グリッド方式（シンプルで高速） ─────────────────
public class SpatialGrid<T>
{
    private readonly float _cellSize;
    private readonly Dictionary<(int, int), List<T>> _cells = new();
    private readonly Func<T, (float x, float y)> _getPos;

    public SpatialGrid(float cellSize, Func<T, (float x, float y)> getPos)
    {
        _cellSize = cellSize;
        _getPos = getPos;
    }

    private (int cx, int cy) CellOf(float x, float y)
        => ((int)MathF.Floor(x / _cellSize), (int)MathF.Floor(y / _cellSize));

    public void Add(T obj)
    {
        var (x, y) = _getPos(obj);
        var key = CellOf(x, y);
        if (!_cells.ContainsKey(key)) _cells[key] = new();
        _cells[key].Add(obj);
    }

    public void Remove(T obj)
    {
        var (x, y) = _getPos(obj);
        var key = CellOf(x, y);
        _cells[key]?.Remove(obj);
    }

    // 半径 radius 以内のオブジェクトを取得
    public IEnumerable<T> QueryRadius(float x, float y, float radius)
    {
        int minCx = (int)MathF.Floor((x - radius) / _cellSize);
        int maxCx = (int)MathF.Floor((x + radius) / _cellSize);
        int minCy = (int)MathF.Floor((y - radius) / _cellSize);
        int maxCy = (int)MathF.Floor((y + radius) / _cellSize);

        for (int cx = minCx; cx <= maxCx; cx++)
        for (int cy = minCy; cy <= maxCy; cy++)
        {
            if (!_cells.TryGetValue((cx, cy), out var list)) continue;
            foreach (var obj in list)
            {
                var (ox, oy) = _getPos(obj);
                float dx = ox - x, dy = oy - y;
                if (dx * dx + dy * dy <= radius * radius)
                    yield return obj;
            }
        }
    }
}`,

  pros: [
    '近傍探索が大幅に高速化（O(n²) → ほぼ O(1)）',
    '当たり判定・AI索敵・音の伝播など広く使える',
  ],
  cons: [
    'セルサイズの調整が必要（小さすぎると管理オーバーヘッド、大きすぎると効果薄）',
    '動的オブジェクトは移動のたびにセルの更新が必要',
  ],

  antipattern: `<p>セルサイズをオブジェクトサイズより小さくするとオブジェクトが複数セルにまたがり管理が複雑化します。
    <strong>セルサイズは最大オブジェクト半径の2倍</strong>程度が目安です。</p>`,

  related: ['dirty-flag', 'data-locality'],
},

/* ─────────────────────────────────────────────────────────── */

'double-buffer': {
  name: 'Double Buffer',
  nameJa: 'ダブルバッファー',
  category: 'game',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['描画', 'フレームバッファ', 'ちらつき防止', 'スワップ'],
  summary: '書き込み用と読み取り用の2つのバッファを持ち、書き終えてからスワップすることで更新中の中間状態が見えないようにする。',

  problem: `<p>描画中の画面バッファに直接書き込むと、半完成の状態が1フレーム表示されてちらつきます。
    セルオートマトンでは自分を更新しながら隣を参照すると更新順序でバグが生じます。</p>`,

  solution: `<p>2つのバッファを用意します。一方（Back Buffer）に書き込み、
    もう一方（Front Buffer）を読み取ります。書き終えたらスワップするだけです。</p>`,

  csharpCode: `public class DoubleBuffer<T>
{
    private T[] _buffers;
    private int _current = 0;  // 現在の読み取りバッファのインデックス

    public DoubleBuffer(T front, T back)
    {
        _buffers = new[] { front, back };
    }

    public T ReadBuffer  => _buffers[_current];
    public T WriteBuffer => _buffers[1 - _current];

    // 書き終えたらスワップ（アトミックに切り替え）
    public void Swap() => _current = 1 - _current;
}

// ─── ライフゲーム（セルオートマトン）への適用 ────────────
public class GameOfLife
{
    private readonly int _w, _h;
    private readonly DoubleBuffer<bool[,]> _db;

    public GameOfLife(int w, int h)
    {
        _w = w; _h = h;
        _db = new DoubleBuffer<bool[,]>(new bool[w, h], new bool[w, h]);
    }

    public bool[,] CurrentGrid => _db.ReadBuffer;

    public void Step()
    {
        var src = _db.ReadBuffer;   // 読み取り専用
        var dst = _db.WriteBuffer;  // 書き込み専用

        for (int y = 0; y < _h; y++)
        for (int x = 0; x < _w; x++)
        {
            int neighbors = CountNeighbors(src, x, y);
            dst[x, y] = src[x, y]
                ? neighbors == 2 || neighbors == 3
                : neighbors == 3;
        }

        _db.Swap();  // 書き込んだバッファを一発切り替え
    }

    private int CountNeighbors(bool[,] g, int x, int y)
    {
        int count = 0;
        for (int dy = -1; dy <= 1; dy++)
        for (int dx = -1; dx <= 1; dx++)
        {
            if (dx == 0 && dy == 0) continue;
            int nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < _w && ny >= 0 && ny < _h && g[nx, ny])
                count++;
        }
        return count;
    }
}`,

  pros: [
    '更新中の中間状態がユーザーに見えない',
    'セルオートマトンなど「同時更新」が必要な処理で正確性を保てる',
  ],
  cons: [
    'メモリが2倍必要',
    'スワップのタイミング管理が必要',
  ],

  antipattern: `<p>スワップのタイミングが非同期になると <strong>ティアリング（画面の引き裂け）</strong>が起きます。
    スワップは必ず描画完了後に行いましょう。</p>`,

  related: ['game-loop'],
},

/* ─────────────────────────────────────────────────────────── */

'subclass-sandbox': {
  name: 'Subclass Sandbox',
  nameJa: 'サブクラスサンドボックス',
  category: 'game',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['スキル', '安全な継承', 'テンプレート', 'フック'],
  summary: '基底クラスが「安全な操作の集合」を protected メソッドとして提供し、派生クラスはその範囲内だけで振る舞いを定義する。',

  problem: `<p>スキルを実装するとき、派生クラスが直接 AudioManager や PhysicsEngine を参照すると
    依存が分散し、基盤コードの変更で全スキルが影響を受けます。</p>`,

  solution: `<p>基底クラスが「PlaySound」「SpawnEffect」「DealDamage」などの
    保護メソッドを用意します。派生クラスはそれだけを呼ぶことで、
    グローバルサービスへの直接依存を持ちません。</p>`,

  csharpCode: `// ─── Sandbox（基底クラスが安全な操作を提供） ────────────
public abstract class Skill
{
    private readonly AudioService _audio;
    private readonly EffectSystem _fx;

    protected Skill(AudioService audio, EffectSystem fx)
    {
        _audio = audio; _fx = fx;
    }

    // 派生クラスが呼べる「安全な操作」
    protected void PlaySound(string name)      => _audio.Play(name);
    protected void SpawnEffect(string name, float x, float y) => _fx.Spawn(name, x, y);
    protected void DealDamage(Enemy target, int amount) => target.TakeDamage(amount);
    protected void HealPlayer(Player player, int amount) => player.Heal(amount);

    // ── 派生クラスが実装する振る舞い ──────────────────────
    public abstract void Activate(Player caster, float x, float y);
}

// ─── 具体スキル（基底の操作だけを使う） ─────────────────
public class FireballSkill : Skill
{
    public FireballSkill(AudioService a, EffectSystem fx) : base(a, fx) { }

    public override void Activate(Player caster, float x, float y)
    {
        PlaySound("fireball_cast");
        SpawnEffect("fireball_projectile", x, y);
        // 範囲内の敵にダメージ（省略）
    }
}

public class HealSkill : Skill
{
    public HealSkill(AudioService a, EffectSystem fx) : base(a, fx) { }

    public override void Activate(Player caster, float x, float y)
    {
        PlaySound("heal_cast");
        SpawnEffect("heal_aura", caster.X, caster.Y);
        HealPlayer(caster, 50);
    }
}`,

  pros: [
    'スキル実装者は基底の操作だけ使えばよく、グローバル依存を持たない',
    'APIの変更が基底クラスに集中し、派生は影響を受けない',
  ],
  cons: [
    '基底クラスが肥大化しやすい',
    '操作が足りない場合に基底を修正するコストがかかる',
  ],

  antipattern: `<p>基底クラスに山のような protected メソッドが積み重なると「god base class」になります。
    操作をカテゴリ別に分割したり、<strong>Component や Strategy</strong> と組み合わせましょう。</p>`,

  related: ['template-method', 'component', 'strategy'],
},

/* ─────────────────────────────────────────────────────────── */

'bytecode': {
  name: 'Bytecode',
  nameJa: 'バイトコード',
  category: 'game',
  difficulty: 3,
  gameFrequency: 1,
  tags: ['VM', 'スクリプト', 'DSL', 'スキル', 'データ駆動'],
  summary: 'ゲームの振る舞い（スキル効果・AI行動）をバイト列として表現し、仮想マシン（VM）で実行することでデータとして管理・変更できるようにする。',

  problem: `<p>スキルの効果をすべてコードで書くと、スキルの追加・調整のたびにビルドが必要です。
    ゲームデザイナーが自由にスキルを作れるようにしたい。</p>`,

  solution: `<p>スキルの命令セットを独自バイトコードで定義し、VMがそれを解釈・実行します。
    スキルデータはファイルから読み込めるのでプログラマー不要で追加・変更できます。</p>`,

  csharpCode: `// ─── 命令セット ───────────────────────────────────────────
public enum Opcode : byte
{
    Literal  = 0x01,   // スタックに定数をプッシュ
    GetHp    = 0x02,   // 対象のHPをプッシュ
    SetHp    = 0x03,   // スタック頂からHPをセット
    Add      = 0x10,   // スタックから2つポップして加算しプッシュ
    Subtract = 0x11,
    PlaySound= 0x20,   // サウンド再生
    Halt     = 0xFF,
}

// ─── 仮想マシン ───────────────────────────────────────────
public class SkillVM
{
    private readonly Stack<int> _stack = new();
    private Creature _caster, _target;

    public void Execute(byte[] bytecode, Creature caster, Creature target)
    {
        _caster = caster; _target = target;
        _stack.Clear();
        int pc = 0;

        while (pc < bytecode.Length)
        {
            var op = (Opcode)bytecode[pc++];
            switch (op)
            {
                case Opcode.Literal:
                    _stack.Push(bytecode[pc++]);
                    break;
                case Opcode.GetHp:
                    _stack.Push(_target.Hp);
                    break;
                case Opcode.SetHp:
                    _target.Hp = _stack.Pop();
                    break;
                case Opcode.Subtract:
                    int b = _stack.Pop(), a = _stack.Pop();
                    _stack.Push(a - b);
                    break;
                case Opcode.Halt:
                    return;
            }
        }
    }
}

// ─── スキル「50ダメージを与える」のバイトコード ──────────
// GetHp → Literal(50) → Subtract → SetHp
var fireball = new byte[]
{
    (byte)Opcode.GetHp,
    (byte)Opcode.Literal, 50,
    (byte)Opcode.Subtract,
    (byte)Opcode.SetHp,
    (byte)Opcode.Halt,
};`,

  pros: [
    'スキル・AI をデータとして管理でき、エンジニア不要で追加可能',
    'サンドボックス実行でセキュリティを確保できる',
    'MOD やユーザー制作コンテンツのベースになる',
  ],
  cons: [
    'VM の設計・実装コストが高い',
    'デバッグが難しい',
    'スクリプト言語（Lua, Python）を組み込む方が現実的な場合も多い',
  ],

  antipattern: `<p>独自バイトコードを作る前に <strong>Lua や HScript などの既成スクリプト言語</strong>を検討しましょう。
    仮想マシンの設計・デバッグツール・エラー処理の整備は相当なコストです。</p>`,

  related: ['interpreter', 'type-object'],
},

/* ─────────────────────────────────────────────────────────── */

'data-locality': {
  name: 'Data Locality',
  nameJa: 'データ局所性',
  category: 'game',
  difficulty: 3,
  gameFrequency: 2,
  tags: ['ECS', '最適化', 'SOA', 'キャッシュ', 'DOTS'],
  summary: '関連データをメモリ上で連続配置（Structure of Arrays）してキャッシュヒット率を最大化し、更新処理を劇的に高速化する。ECS の根幹となる考え方。',

  problem: `<p>オブジェクト指向でオブジェクトをクラスで表現すると（AOS: Array of Structures）、
    「全オブジェクトの座標を更新」という処理でHPや名前などの不要データもキャッシュに乗り
    キャッシュミスが多発します。</p>`,

  solution: `<p>属性ごとに配列を持つ（SOA: Structure of Arrays）ことで、
    「座標だけ更新」する処理はすべての座標データが連続メモリに収まり
    キャッシュ効率が大幅に改善します。</p>`,

  diagram: `
AOS（Array of Structures）← キャッシュミスが多い
  [Entity0: x,y,hp,name] [Entity1: x,y,hp,name] ...
   ↑使うのはx,yだけなのにhp,nameもキャッシュに乗る

SOA（Structure of Arrays）← キャッシュ効率◎
  xs: [x0, x1, x2, x3, ...]   ← 座標だけ連続
  ys: [y0, y1, y2, y3, ...]
  hps:[hp0,hp1,hp2,hp3,...]`,

  csharpCode: `// ─── AOS（従来のオブジェクト指向） ── キャッシュ効率×
public class Entity
{
    public float X, Y;
    public int   Hp;
    public string Name;   // X,Y更新でもNameがキャッシュに乗る
}

// ─── SOA（データ局所性） ── キャッシュ効率◎
public class EntityWorld
{
    private float[] _xs;
    private float[] _ys;
    private int[]   _hps;
    private bool[]  _active;
    private int     _count;

    public EntityWorld(int capacity)
    {
        _xs     = new float[capacity];
        _ys     = new float[capacity];
        _hps    = new int[capacity];
        _active = new bool[capacity];
    }

    public int Add(float x, float y, int hp)
    {
        int id = _count++;
        _xs[id] = x; _ys[id] = y; _hps[id] = hp; _active[id] = true;
        return id;
    }

    // 全エンティティの移動 ── xs/ys の連続メモリを走査（高速）
    public void MoveAll(float dx, float dy)
    {
        for (int i = 0; i < _count; i++)
        {
            if (!_active[i]) continue;
            _xs[i] += dx;
            _ys[i] += dy;
        }
    }

    // 全エンティティのHP減少
    public void DamageAll(int dmg)
    {
        for (int i = 0; i < _count; i++)
        {
            if (!_active[i]) continue;
            _hps[i] = Math.Max(0, _hps[i] - dmg);
            if (_hps[i] == 0) _active[i] = false;
        }
    }
}`,

  unityCode: `// Unity DOTS (Data-Oriented Technology Stack) が SOA を徹底活用
// IComponentData は struct で値型 → 連続メモリに配置される

using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

// コンポーネントは struct（値型）で定義
public struct Velocity : IComponentData
{
    public float3 Value;
}

// システムが全エンティティの位置を一括更新（SIMD最適化も効く）
public partial class MoveSystem : SystemBase
{
    protected override void OnUpdate()
    {
        float dt = SystemAPI.Time.DeltaTime;

        // Entities.ForEach は内部でSOA的なメモリ配置を活用
        Entities.ForEach((ref LocalTransform transform, in Velocity vel) =>
        {
            transform.Position += vel.Value * dt;
        }).ScheduleParallel();
    }
}`,

  pros: [
    'キャッシュ効率が大幅に改善し10〜100倍の高速化も',
    'SIMD（並列演算命令）の恩恵を受けやすい',
    'Unity DOTS の基盤設計',
  ],
  cons: [
    '「エンティティID」で管理する設計に慣れが必要',
    'オブジェクト指向的な直感と相反する設計',
    '柔軟性より性能を優先する場面限定の最適化',
  ],

  antipattern: `<p>すべてにSOAを適用する必要はありません。
    <strong>プロファイラで実際にキャッシュミスが問題</strong>になっているパーティクル・パスファインディング等の
    ホットパスに限定して適用しましょう。</p>`,

  related: ['spatial-partition', 'ecs', 'component'],
},


/* ============================================================
   🔁 振る舞いパターン
   ============================================================ */

'state': {
  name: 'State',
  nameJa: 'ステート',
  category: 'behavioral',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['ステートマシン', 'キャラ', 'アニメーション', 'AI', 'FSM'],
  summary: 'オブジェクトの内部状態をクラスとして独立させ、状態ごとに振る舞いを切り替える。巨大な if/switch を排除し、状態追加を既存コードに触れずに行える。',

  problem: `
    <p>キャラクターの「待機・歩行・攻撃・ジャンプ・死亡」をひとつのクラスで管理すると、
    こういうコードになりがちです：</p>
    <pre style="background:var(--bg3);padding:.75rem;border-radius:6px;font-size:.8rem;overflow-x:auto">
void Update() {
    if (_state == "idle") {
        if (inputMove)  { _state = "walk"; PlayAnim("walk"); }
        if (inputJump)  { _state = "jump"; _vy = jumpForce; }
        if (inputAttack){ _state = "attack"; PlayAnim("attack"); }
    } else if (_state == "walk") {
        Move();
        if (!inputMove) { _state = "idle"; }
        if (inputJump)  { _state = "jump"; }
        // …どんどん増え続ける…
    }
}</pre>
    <p>状態が増えるたびに if 分岐が膨れ、バグの温床になります（<strong>条件地獄</strong>）。</p>`,

  solution: `
    <p>状態ごとに <strong>クラスを作り</strong>、そのクラスに「その状態のときの振る舞い」を持たせます。
    キャラクター本体は「現在の状態オブジェクト」への参照を持ち、処理を委譲するだけ。
    状態遷移は状態クラス自身が行います。</p>
    <p>新しい状態を追加しても既存の状態クラスに触れる必要がありません（<strong>開放・閉鎖原則</strong>）。</p>`,

  diagram: `
         ┌─────────────────────────────────┐
         │           Player                │
         │  _state: IPlayerState ─────────►│ IPlayerState
         │  ChangeState(newState)          │  + Enter(player)
         │  Update(dt) → _state.Update()  │  + Update(player, dt)
         └─────────────────────────────────┘  + Exit(player)
                                              + HandleInput(player, input)
                                                    ▲
                              ┌──────────┬──────────┴──────────┐
                         IdleState  WalkState  JumpState  AttackState`,

  csharpCode: `// ─── 状態インターフェース ────────────────────────────────
public interface IPlayerState
{
    void Enter(Player player);                          // 状態に入った瞬間
    void Update(Player player, float deltaTime);        // 毎フレーム
    void Exit(Player player);                           // 状態を抜ける瞬間
    void HandleInput(Player player, PlayerInput input); // 入力処理
}

// ─── 待機状態 ─────────────────────────────────────────────
public class IdleState : IPlayerState
{
    public void Enter(Player p)  => p.PlayAnimation("Idle");
    public void Exit(Player p)   { }
    public void Update(Player p, float dt) { }

    public void HandleInput(Player p, PlayerInput input)
    {
        if (input.MoveDir != 0)       p.ChangeState(new WalkState());
        else if (input.JumpPressed)   p.ChangeState(new JumpState());
        else if (input.AttackPressed) p.ChangeState(new AttackState());
    }
}

// ─── 歩行状態 ─────────────────────────────────────────────
public class WalkState : IPlayerState
{
    public void Enter(Player p)  => p.PlayAnimation("Walk");
    public void Exit(Player p)   { }

    public void Update(Player p, float dt)
        => p.Move(p.LastInput.MoveDir * p.Speed * dt);

    public void HandleInput(Player p, PlayerInput input)
    {
        if (input.MoveDir == 0)       p.ChangeState(new IdleState());
        else if (input.JumpPressed)   p.ChangeState(new JumpState());
        else if (input.AttackPressed) p.ChangeState(new AttackState());
    }
}

// ─── ジャンプ状態 ─────────────────────────────────────────
public class JumpState : IPlayerState
{
    private float _vy;
    private const float JumpForce = 8f;
    private const float Gravity   = -20f;

    public void Enter(Player p)
    {
        _vy = JumpForce;
        p.PlayAnimation("Jump");
    }
    public void Exit(Player p) { }

    public void Update(Player p, float dt)
    {
        _vy += Gravity * dt;
        p.MoveVertical(_vy * dt);

        if (p.IsGrounded)                 // 着地したら待機へ
            p.ChangeState(new IdleState());
    }

    public void HandleInput(Player p, PlayerInput input) { }
}

// ─── 攻撃状態 ─────────────────────────────────────────────
public class AttackState : IPlayerState
{
    private float _timer;
    private const float AttackDuration = 0.4f;

    public void Enter(Player p)
    {
        _timer = AttackDuration;
        p.PlayAnimation("Attack");
        p.DealDamage();                   // 攻撃判定
    }
    public void Exit(Player p) { }

    public void Update(Player p, float dt)
    {
        _timer -= dt;
        if (_timer <= 0f)
            p.ChangeState(new IdleState());  // 攻撃終了 → 待機
    }

    public void HandleInput(Player p, PlayerInput input) { }
}

// ─── プレイヤー本体 ───────────────────────────────────────
public class Player
{
    private IPlayerState _state;
    public PlayerInput LastInput { get; private set; }

    public float Speed      { get; } = 5f;
    public bool  IsGrounded { get; set; } = true;

    public Player()
    {
        _state = new IdleState();
        _state.Enter(this);
    }

    // 状態遷移（Exit → 切り替え → Enter）
    public void ChangeState(IPlayerState newState)
    {
        _state.Exit(this);
        _state = newState;
        _state.Enter(this);
    }

    public void Update(float deltaTime)
    {
        _state.Update(this, deltaTime);
    }

    public void HandleInput(PlayerInput input)
    {
        LastInput = input;
        _state.HandleInput(this, input);
    }

    // ── 基本操作（状態クラスから呼ばれる） ────────────────
    public void PlayAnimation(string name)    => Console.WriteLine($"Anim: {name}");
    public void Move(float dx)                => Console.WriteLine($"Move: {dx:F2}");
    public void MoveVertical(float dy)        { }
    public void DealDamage()                  => Console.WriteLine("Attack!");
}

// ─── 入力データ ───────────────────────────────────────────
public readonly struct PlayerInput
{
    public float MoveDir      { get; init; }  // -1 / 0 / +1
    public bool  JumpPressed  { get; init; }
    public bool  AttackPressed{ get; init; }
}`,

  unityCode: `// Unity での State パターン実装
// MonoBehaviour をベースにしたシンプルな例

public abstract class PlayerStateBase
{
    protected Player _player;
    public PlayerStateBase(Player p) { _player = p; }

    public virtual void Enter()  { }
    public virtual void Update() { }
    public virtual void Exit()   { }
}

public class Player : MonoBehaviour
{
    private PlayerStateBase _state;

    [SerializeField] private float _speed = 5f;
    [SerializeField] private Animator _animator;

    private Rigidbody2D _rb;

    private void Awake() => _rb = GetComponent<Rigidbody2D>();

    private void Start() => ChangeState(new IdlePlayerState(this, _animator));

    private void Update() => _state?.Update();

    public void ChangeState(PlayerStateBase next)
    {
        _state?.Exit();
        _state = next;
        _state?.Enter();
    }

    public void SetVelocity(Vector2 v) => _rb.linearVelocity = v;
    public bool IsGrounded()
    {
        // 簡易着地判定（RaycastやPhysics2D.Overlapなど）
        return Physics2D.Raycast(transform.position, Vector2.down, 0.1f);
    }
}

// ─── 待機状態 ─────────────────────────────────────────────
public class IdlePlayerState : PlayerStateBase
{
    private Animator _anim;
    public IdlePlayerState(Player p, Animator a) : base(p) { _anim = a; }

    public override void Enter()  => _anim.Play("Idle");
    public override void Update()
    {
        float h = Input.GetAxis("Horizontal");
        if (Mathf.Abs(h) > 0.1f)
            _player.ChangeState(new WalkPlayerState(_player, _anim));
        if (Input.GetButtonDown("Jump"))
            _player.ChangeState(new JumpPlayerState(_player, _anim));
    }
}

// WalkPlayerState / JumpPlayerState も同様に実装…`,

  pros: [
    '状態ごとのコードが独立し、可読性・保守性が大幅に向上',
    '新しい状態の追加が既存コードに影響しない（OCP）',
    '状態遷移のバグが局所化され見つけやすい',
    'アニメーター・AI・UI など広範に応用できる',
  ],
  cons: [
    '状態クラスの数が多いとファイルが増える',
    '状態間でデータ共有が必要な場合、設計に工夫が必要',
    'シンプルな2〜3状態なら if 文の方が素直な場合もある',
  ],

  antipattern: `
    <p><strong>状態クラス間で直接参照し合う</strong>と密結合になります。
    状態遷移は <code>player.ChangeState(new NextState())</code> のように
    <strong>コンテキスト（Player）経由</strong>で行うのが原則です。</p>
    <p>また Unity の <strong>Animator Controller</strong> は State パターンの視覚的な実装です。
    コードの State と Animator を二重管理しないよう設計を整理しましょう。</p>`,

  related: ['finite-state-machine', 'strategy', 'command'],

  quiz: [
    {
      q: 'State パターンで状態遷移はどこに書くべきですか？',
      options: [
        '状態クラスの中（または Player.ChangeState() 経由）',
        'ゲームループの switch 文の中',
        'どこでもよい',
        '専用の遷移マネージャークラスのみ',
      ],
      answer: 0,
      explanation: '状態クラス自身が「次の状態への遷移条件」を知り、コンテキスト（Player）の ChangeState() を呼ぶのが基本スタイルです。',
    },
    {
      q: 'State パターンが解決する主な問題は？',
      options: [
        'メモリの断片化',
        '状態が増えるにつれ肥大化する if/switch の条件地獄',
        'マルチスレッドの競合',
        'アセットの読み込み速度',
      ],
      answer: 1,
      explanation: '状態ごとにクラスを作ることで巨大な条件分岐を排除し、状態追加を既存コードへの影響なしに行えるようにします。',
    },
  ],
},


/* ============================================================
   振る舞いパターン（Observer〜Interpreter）
   ============================================================ */

'observer': {
  name: 'Observer',
  nameJa: 'オブザーバー',
  category: 'behavioral',
  difficulty: 1,
  gameFrequency: 3,
  tags: ['イベント', 'UI', '実績', '通知', '疎結合'],
  summary: '一対多の依存関係を定義し、あるオブジェクトの状態変化を購読者全員へ自動通知する。HP 変化→UI 更新、敵撃破→実績解除など疎結合なイベント連携の基本。',

  problem: `<p>プレイヤーの HP が変化したとき、ハートUI・ダメージ数値・実績システム・BGM変化など
    複数のオブジェクトに通知する必要があります。
    <code>Player</code> クラスが各システムを直接呼ぶと依存が爆発し、
    新しいシステムを追加するたびに <code>Player</code> を修正しなければなりません。</p>`,

  solution: `<p>Subject（通知元）は Observer のリストを持ちます。
    状態が変わったら <code>Notify()</code> でリストを走査して全員に通知するだけ。
    Observer の追加・削除は Subscribe/Unsubscribe で行い、
    Subject は Observer の具体的な型を知りません。</p>`,

  diagram: `
Subject (PlayerHealth)          Observer (Interface)
  _observers: List<IObserver>     OnNotify(event, value)
  Subscribe(o)                        ▲
  Unsubscribe(o)              ┌───────┴────────┐
  Notify(event, val)       HeartUI        AchievementSystem`,

  csharpCode: `using System;
using System.Collections.Generic;

// ─── Observer インターフェース ────────────────────────────
public interface IObserver<T>
{
    void OnNotify(T value);
}

// ─── 汎用 Subject（通知元の基底） ────────────────────────
public class Subject<T>
{
    private readonly List<IObserver<T>> _observers = new();

    public void Subscribe(IObserver<T> o)   => _observers.Add(o);
    public void Unsubscribe(IObserver<T> o) => _observers.Remove(o);

    protected void Notify(T value)
    {
        // ToArray() でコピーしてから走査 → 通知中の登録変更に対応
        foreach (var o in _observers.ToArray())
            o.OnNotify(value);
    }
}

// ─── プレイヤー HP（Subject） ─────────────────────────────
public class PlayerHealth : Subject<int>
{
    private int _hp;
    public int MaxHp { get; }

    public int Hp
    {
        get => _hp;
        private set
        {
            _hp = Math.Clamp(value, 0, MaxHp);
            Notify(_hp);           // 変化を全 Observer に通知
        }
    }

    public PlayerHealth(int maxHp) { MaxHp = maxHp; _hp = maxHp; }

    public void TakeDamage(int dmg) => Hp -= dmg;
    public void Heal(int amount)    => Hp += amount;
}

// ─── Observer たち ────────────────────────────────────────
public class HeartUI : IObserver<int>
{
    private readonly int _maxHp;
    public HeartUI(int maxHp) { _maxHp = maxHp; }

    public void OnNotify(int hp)
        => Console.WriteLine($"[HeartUI] ❤ {hp}/{_maxHp}");
}

public class DamageText : IObserver<int>
{
    private int _prevHp;
    public DamageText(int maxHp) { _prevHp = maxHp; }

    public void OnNotify(int hp)
    {
        int delta = hp - _prevHp;
        if (delta < 0) Console.WriteLine($"[DmgText] -{-delta}");
        _prevHp = hp;
    }
}

public class AchievementSystem : IObserver<int>
{
    public void OnNotify(int hp)
    {
        if (hp == 0) Console.WriteLine("[Achievement] 🏆 最後の一歩 解除！");
    }
}

// ─── 使用例 ───────────────────────────────────────────────
var health = new PlayerHealth(100);
health.Subscribe(new HeartUI(100));
health.Subscribe(new DamageText(100));
health.Subscribe(new AchievementSystem());

health.TakeDamage(30);  // HeartUI / DamageText に通知
health.TakeDamage(70);  // 全 Observer + Achievement 解除`,

  unityCode: `// Unity では C# の event / Action を使うのが一般的

public class PlayerHealth : MonoBehaviour
{
    [SerializeField] private int _maxHp = 100;
    private int _hp;

    // 購読者に型安全に通知できる event
    public event Action<int, int> OnHpChanged;  // (current, max)
    public event Action            OnDeath;

    private void Awake() => _hp = _maxHp;

    public void TakeDamage(int dmg)
    {
        _hp = Mathf.Max(0, _hp - dmg);
        OnHpChanged?.Invoke(_hp, _maxHp);   // null 条件演算子で安全呼び出し
        if (_hp == 0) OnDeath?.Invoke();
    }
}

// UI 側は OnEnable/OnDisable で必ず Subscribe/Unsubscribe する
public class HealthBar : MonoBehaviour
{
    [SerializeField] private Slider _slider;
    private PlayerHealth _health;

    private void Awake() => _health = FindObjectOfType<PlayerHealth>();

    private void OnEnable()  => _health.OnHpChanged += UpdateBar;
    private void OnDisable() => _health.OnHpChanged -= UpdateBar;   // 必須！

    private void UpdateBar(int cur, int max)
        => _slider.value = (float)cur / max;
}`,

  pros: [
    'Subject と Observer が疎結合で互いに具体型を知らない',
    '新しい Observer の追加がゼロコード変更で可能',
    '実績・統計・ログなどを後付けしやすい',
  ],
  cons: [
    'Unsubscribe 漏れでメモリリーク・意図しない通知が起きる',
    '通知の連鎖（Observer が Subject を変更する）で無限ループのリスク',
    '通知順序が保証されないためデバッグが難しい場合がある',
  ],

  antipattern: `<p>Unity で <code>OnEnable</code> で Subscribe して <code>OnDisable</code> で Unsubscribe しないと、
    非アクティブな GameObject が通知を受け続けてバグになります。
    Subscribe したら必ず対になる Unsubscribe を書く習慣をつけましょう。</p>
    <p>大規模な通知系には <strong>Event Queue</strong> や <strong>Pub/Sub</strong> への移行も検討してください。</p>`,

  related: ['event-queue', 'pub-sub', 'mediator'],

  quiz: [
    {
      q: 'Unity で OnEnable 時に Subscribe した場合、どこで Unsubscribe すべきですか？',
      options: ['OnDestroy', 'OnDisable', 'Update', 'どこでもよい'],
      answer: 1,
      explanation: 'OnEnable/OnDisable をペアにすることで、GameObject が非アクティブな間は通知を受け取らなくなり、意図しない動作を防げます。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'command': {
  name: 'Command',
  nameJa: 'コマンド',
  category: 'behavioral',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['Undo', 'リプレイ', '入力', 'キーバインド', 'マクロ'],
  summary: '処理をオブジェクトとしてカプセル化する。Undo/Redo・入力リバインド・マクロ録画・リプレイなどゲームで多用される強力なパターン。',

  problem: `<p>「Ctrl+Z で取り消せるようにして」「入力キーを自由に変更したい」
    「リプレイ機能を作りたい」——これらをバラバラに実装すると重複コードが爆発します。
    共通の問題は「<strong>やること</strong>」と「<strong>いつ・どのキーで</strong>」が混在していることです。</p>`,

  solution: `<p>「やること」をすべて <code>ICommand</code> として共通化します。
    <code>Execute()</code> で実行、<code>Undo()</code> で取り消し。
    入力層はどの Command を生成するかだけを決め、実行・Undo はコマンド自身に任せます。</p>`,

  diagram: `
InputHandler ─ Execute() ─→ ICommand ─→ MoveCommand
                             Undo()       AttackCommand
                                          SpellCommand
UndoStack: [cmd1, cmd2, cmd3] ← 実行済みコマンドを積む
 Undo() → stack.Pop().Undo()`,

  csharpCode: `// ─── Command インターフェース ────────────────────────────
public interface ICommand
{
    void Execute();
    void Undo();
}

// ─── 移動コマンド ──────────────────────────────────────────
public class MoveCommand : ICommand
{
    private readonly Actor _actor;
    private readonly float _dx, _dy;
    private float _prevX, _prevY;

    public MoveCommand(Actor actor, float dx, float dy)
    {
        _actor = actor; _dx = dx; _dy = dy;
    }

    public void Execute()
    {
        _prevX = _actor.X; _prevY = _actor.Y;   // 取り消し用に保存
        _actor.X += _dx;
        _actor.Y += _dy;
    }

    public void Undo()
    {
        _actor.X = _prevX;
        _actor.Y = _prevY;
    }
}

// ─── HP 回復コマンド ───────────────────────────────────────
public class HealCommand : ICommand
{
    private readonly Actor _actor;
    private readonly int _amount;
    private int _prevHp;

    public HealCommand(Actor actor, int amount)
    {
        _actor = actor; _amount = amount;
    }

    public void Execute() { _prevHp = _actor.Hp; _actor.Hp += _amount; }
    public void Undo()    { _actor.Hp = _prevHp; }
}

// ─── Undo/Redo スタック ───────────────────────────────────
public class CommandHistory
{
    private readonly Stack<ICommand> _undoStack = new();
    private readonly Stack<ICommand> _redoStack = new();

    public void Execute(ICommand cmd)
    {
        cmd.Execute();
        _undoStack.Push(cmd);
        _redoStack.Clear();   // 新しい操作でRedoスタックはリセット
    }

    public void Undo()
    {
        if (_undoStack.Count == 0) return;
        var cmd = _undoStack.Pop();
        cmd.Undo();
        _redoStack.Push(cmd);
    }

    public void Redo()
    {
        if (_redoStack.Count == 0) return;
        var cmd = _redoStack.Pop();
        cmd.Execute();
        _undoStack.Push(cmd);
    }
}

// ─── 入力リバインド（キーとコマンドを分離） ──────────────
public class InputHandler
{
    // キーとコマンドの対応を辞書で管理 → 実行時に変更可能
    private readonly Dictionary<string, Func<ICommand>> _bindings = new();

    public void Bind(string key, Func<ICommand> factory)
        => _bindings[key] = factory;

    public ICommand HandleInput(string key)
        => _bindings.TryGetValue(key, out var f) ? f() : null;
}

// ─── 使用例 ───────────────────────────────────────────────
var actor   = new Actor();
var history = new CommandHistory();
var input   = new InputHandler();

// キーバインド設定（後から変更可能）
input.Bind("W", () => new MoveCommand(actor,  0,  1));
input.Bind("S", () => new MoveCommand(actor,  0, -1));
input.Bind("H", () => new HealCommand(actor, 30));

var cmd = input.HandleInput("W");
if (cmd != null) history.Execute(cmd);

history.Undo();   // W キーの移動を取り消し
history.Redo();   // やり直し`,

  unityCode: `// Unity でのコマンドパターン（入力リバインド + リプレイ）

public interface IGameCommand
{
    void Execute();
    void Undo();
}

// リプレイ用：コマンドをフレーム番号と一緒に記録
[Serializable]
public struct RecordedCommand
{
    public int     Frame;
    public IGameCommand Command;
}

public class GameCommandSystem : MonoBehaviour
{
    private readonly CommandHistory _history = new();
    private readonly List<RecordedCommand> _replay = new();
    private int _frame;
    private bool _isReplaying;

    [SerializeField] private Player _player;

    private void Update()
    {
        if (_isReplaying) return;

        IGameCommand cmd = null;
        if (Input.GetKeyDown(KeyCode.W))
            cmd = new MoveCommand(_player, Vector3.forward);
        else if (Input.GetKeyDown(KeyCode.Z) && Input.GetKey(KeyCode.LeftControl))
            { _history.Undo(); return; }

        if (cmd != null)
        {
            _history.Execute(cmd);
            _replay.Add(new RecordedCommand { Frame = _frame, Command = cmd });
        }
        _frame++;
    }

    public void PlayReplay()
    {
        StartCoroutine(ReplayCoroutine());
    }

    private IEnumerator ReplayCoroutine()
    {
        _isReplaying = true;
        int f = 0;
        foreach (var rec in _replay)
        {
            while (f < rec.Frame) { f++; yield return null; }
            rec.Command.Execute();
        }
        _isReplaying = false;
    }
}`,

  pros: [
    'Undo/Redo・リプレイ・マクロをほぼ同じ仕組みで実現できる',
    '入力とアクションが分離されキーリバインドが容易',
    'コマンドをシリアライズすれば通信やセーブにも使える',
  ],
  cons: [
    'コマンドクラスが増えてファイル数が膨らむ',
    'Undo のためにすべての状態変化を記録する必要がある',
    '複雑な処理の Undo 実装は難しい（例：ランダム要素・副作用）',
  ],

  antipattern: `<p>Undo で「以前の状態に戻す」ために十分な情報を Execute 時に保存しないとバグになります。
    特に<strong>副作用（サウンド・パーティクル）を Undo でどう扱うか</strong>は事前に設計しましょう。
    また、コマンドが増えすぎる場合は <strong>Macro Command</strong>（コマンドのコマンド）でまとめると整理できます。</p>`,

  related: ['memento', 'strategy', 'event-queue'],

  quiz: [
    {
      q: 'Command パターンで Undo を実装するために Execute() で必ずすべきことは？',
      options: [
        '何もしなくてよい',
        '実行前の状態をコマンド自身に保存しておく',
        '別のコマンドを生成する',
        'スタックを自分でクリアする',
      ],
      answer: 1,
      explanation: 'Undo() で元に戻せるよう、Execute() 時点で変更前の値をコマンド内に記録しておく必要があります。',
    },
  ],
},

/* ─────────────────────────────────────────────────────────── */

'strategy': {
  name: 'Strategy',
  nameJa: 'ストラテジー',
  category: 'behavioral',
  difficulty: 1,
  gameFrequency: 3,
  tags: ['AI', 'アルゴリズム', '差し替え', '移動', '難易度'],
  summary: 'アルゴリズムをインターフェースとしてカプセル化し、実行時に差し替えられるようにする。AI の行動ロジック・ソート・移動方式などを柔軟に切り替えたいときの定石。',

  problem: `<p>敵の難易度（Easy/Normal/Hard）ごとに行動ロジックを <code>if</code> で分岐すると、
    難易度が増えるたびにクラスを修正しなければなりません。
    また「プレイヤーが近い時は突撃、遠い時は射撃」のような動的な切り替えも困難です。</p>`,

  solution: `<p>アルゴリズムを <code>IStrategy</code> インターフェースとして独立させ、
    コンテキスト（Enemy）は参照を持って委譲するだけにします。
    実行時に SetStrategy() で別のアルゴリズムに差し替えられます。</p>`,

  csharpCode: `// ─── 移動ストラテジー ────────────────────────────────────
public interface IMovementStrategy
{
    void Move(Enemy enemy, float deltaTime);
}

// ── 直線追跡 ───────────────────────────────────────────────
public class ChaseStrategy : IMovementStrategy
{
    public void Move(Enemy enemy, float deltaTime)
    {
        var dir = (enemy.Target.Position - enemy.Position).Normalized();
        enemy.Position += dir * enemy.Speed * deltaTime;
    }
}

// ── ランダム徘徊 ───────────────────────────────────────────
public class WanderStrategy : IMovementStrategy
{
    private float _timer;
    private Vector2 _dir = Vector2.Right;

    public void Move(Enemy enemy, float deltaTime)
    {
        _timer -= deltaTime;
        if (_timer <= 0f)
        {
            float angle = Random.Range(0f, MathF.PI * 2f);
            _dir = new Vector2(MathF.Cos(angle), MathF.Sin(angle));
            _timer = Random.Range(1f, 3f);
        }
        enemy.Position += _dir * enemy.Speed * 0.5f * deltaTime;
    }
}

// ── 安全距離を保ちながら移動 ───────────────────────────────
public class KeepDistanceStrategy : IMovementStrategy
{
    private const float SafeDist = 5f;

    public void Move(Enemy enemy, float deltaTime)
    {
        float dist = Vector2.Distance(enemy.Position, enemy.Target.Position);
        var dir    = (enemy.Target.Position - enemy.Position).Normalized();

        // 近すぎたら離れる、遠すぎたら近づく
        if      (dist < SafeDist - 0.5f) enemy.Position -= dir * enemy.Speed * deltaTime;
        else if (dist > SafeDist + 0.5f) enemy.Position += dir * enemy.Speed * deltaTime;
    }
}

// ─── コンテキスト（戦略を使う側） ────────────────────────
public class Enemy
{
    private IMovementStrategy _moveStrategy;

    public Vector2 Position { get; set; }
    public float   Speed    { get; } = 3f;
    public Player  Target   { get; set; }

    public Enemy(IMovementStrategy strategy) { _moveStrategy = strategy; }

    // 実行時にアルゴリズムを差し替え可能
    public void SetStrategy(IMovementStrategy strategy) => _moveStrategy = strategy;

    public void Update(float dt)
    {
        // 距離に応じてストラテジーを自動切り替え
        float dist = Vector2.Distance(Position, Target.Position);
        if      (dist < 3f)  SetStrategy(new KeepDistanceStrategy());
        else if (dist < 10f) SetStrategy(new ChaseStrategy());
        else                 SetStrategy(new WanderStrategy());

        _moveStrategy.Move(this, dt);
    }
}`,

  pros: [
    'アルゴリズムの追加・変更が既存コードに影響しない（OCP）',
    '実行時に動的切り替えができる',
    'State パターンと組み合わせて「状態ごとに戦略を変える」設計も可能',
  ],
  cons: [
    'クラス数が増える（アルゴリズムが少ない場合は過剰設計になりうる）',
    'コンテキストが内部状態を戦略に公開する必要が出る場合がある',
  ],

  antipattern: `<p>Strategy と State は似ていて混同しやすいですが、目的が違います。
    <strong>Strategy は「同じ目的の別アルゴリズム」</strong>（ソート方法・AI行動）を差し替えるもの。
    <strong>State は「状態に応じた振る舞い変化」</strong>を管理するもの。
    判断基準：遷移ロジックが必要なら State、単純な差し替えなら Strategy です。</p>`,

  related: ['state', 'command', 'template-method'],
},

/* ─────────────────────────────────────────────────────────── */

'template-method': {
  name: 'Template Method',
  nameJa: 'テンプレートメソッド',
  category: 'behavioral',
  difficulty: 1,
  gameFrequency: 2,
  tags: ['骨格', 'フック', 'ターン処理', 'ゲーム進行', '継承'],
  summary: '処理の「骨格」を基底クラスのメソッドで定義し、詳細のステップだけをサブクラスに委ねる。処理順序を保証しつつ一部だけカスタマイズしたいときに使う。',

  problem: `<p>RPG のターン制バトルで「ボス戦」「通常戦」「練習戦」など
    処理の順序は同じでも中身が微妙に違う場合、
    全クラスに同じ骨格をコピペすると変更に弱くなります。</p>`,

  solution: `<p>基底クラスで <code>Run()</code>（テンプレートメソッド）に全体の流れを定義します。
    各ステップを <code>protected virtual</code> メソッドにして、
    サブクラスがオーバーライドする箇所だけ変えられるようにします。</p>`,

  csharpCode: `public abstract class BattleScene
{
    // ─── テンプレートメソッド（処理の骨格・変更禁止） ─────
    public sealed void Run()
    {
        Setup();
        ShowIntro();

        while (!IsBattleOver())
        {
            PlayerTurn();
            if (IsBattleOver()) break;
            EnemyTurn();
        }

        ShowResult();
        Cleanup();
    }

    // ─── サブクラスが必ず実装するステップ ─────────────────
    protected abstract void PlayerTurn();
    protected abstract void EnemyTurn();
    protected abstract bool IsBattleOver();

    // ─── フック（オプションでオーバーライド可） ────────────
    protected virtual void Setup()      => Console.WriteLine("バトル準備");
    protected virtual void ShowIntro()  => Console.WriteLine("バトル開始！");
    protected virtual void ShowResult() => Console.WriteLine("バトル終了");
    protected virtual void Cleanup()    { }
}

// ─── 通常バトル ───────────────────────────────────────────
public class NormalBattle : BattleScene
{
    private int _turn;

    protected override void PlayerTurn()
    {
        Console.WriteLine($"[Turn {_turn}] プレイヤーの攻撃");
    }
    protected override void EnemyTurn()
    {
        Console.WriteLine($"[Turn {_turn++}] 敵の反撃");
    }
    protected override bool IsBattleOver() => _turn >= 3;
}

// ─── ボスバトル（イントロだけカスタマイズ） ──────────────
public class BossBattle : BattleScene
{
    private int _hp = 500;

    protected override void ShowIntro()
        => Console.WriteLine("🔥 ボスが現れた！BGM 変化…");

    protected override void PlayerTurn()
        => _hp -= 100;

    protected override void EnemyTurn()
        => Console.WriteLine("ボスの大技！");

    protected override bool IsBattleOver() => _hp <= 0;
}

// 使用
new BossBattle().Run();`,

  pros: [
    '処理の骨格が一か所に集まり流れを把握しやすい',
    '共通処理の変更が基底クラスだけで済む（DRY）',
    '「フック」で処理の挿入ポイントを提供できる',
  ],
  cons: [
    '継承ベースなので柔軟性が Strategy より低い',
    '骨格を変更するとすべてのサブクラスに影響する',
    'サブクラスが増えすぎると管理が複雑になる',
  ],

  antipattern: `<p>テンプレートメソッドを <code>virtual</code>（オーバーライド可能）にすると
    骨格が壊れます。骨格は必ず <strong><code>sealed</code></strong> にして
    変更を禁止しましょう。
    また「継承より合成」の観点では、Strategy パターンへの置き換えも検討してください。</p>`,

  related: ['strategy', 'subclass-sandbox'],
},

/* ─────────────────────────────────────────────────────────── */

'iterator': {
  name: 'Iterator',
  nameJa: 'イテレーター',
  category: 'behavioral',
  difficulty: 1,
  gameFrequency: 2,
  tags: ['走査', 'foreach', 'インベントリ', 'コレクション', 'yield'],
  summary: 'コレクションの内部構造を公開せずに、要素を順番に走査するインターフェースを提供する。C# では IEnumerable<T> / yield return が標準実装。',

  problem: `<p>インベントリ・スキルリスト・クエストログなど独自コレクションを
    外部から走査するとき、内部の配列やリストを直接公開すると実装変更が困難になります。</p>`,

  solution: `<p><code>IEnumerable&lt;T&gt;</code> を実装するか、
    <code>yield return</code> でイテレーターメソッドを書くだけで
    <code>foreach</code> 対応のコレクションが作れます。</p>`,

  csharpCode: `using System.Collections;
using System.Collections.Generic;

// ─── インベントリ（カスタムコレクション） ──────────────────
public class Inventory : IEnumerable<Item>
{
    private readonly List<Item> _items = new();
    private int _gold;

    public void Add(Item item)
    {
        if (_items.Count >= 20) throw new InvalidOperationException("インベントリが満杯です");
        _items.Add(item);
    }

    public bool Remove(Item item) => _items.Remove(item);

    // IEnumerable<T> の実装 → foreach が使えるようになる
    public IEnumerator<Item> GetEnumerator() => _items.GetEnumerator();
    IEnumerator IEnumerable.GetEnumerator()  => GetEnumerator();

    // 条件付き走査（yield return でフィルタリング）
    public IEnumerable<Item> GetByType(ItemType type)
    {
        foreach (var item in _items)
            if (item.Type == type)
                yield return item;  // 遅延評価で効率的
    }

    // 装備品だけを重い順に列挙
    public IEnumerable<Item> GetEquipmentHeaviest()
    {
        var equips = new List<Item>(_items);
        equips.Sort((a, b) => b.Weight.CompareTo(a.Weight));
        foreach (var e in equips) yield return e;
    }
}

// ─── 使用例 ───────────────────────────────────────────────
var inv = new Inventory();
inv.Add(new Item("剣",    ItemType.Weapon, 3.5f));
inv.Add(new Item("盾",    ItemType.Armor,  5.0f));
inv.Add(new Item("ポーション", ItemType.Consumable, 0.2f));

// 内部実装を知らなくても foreach で走査可能
foreach (var item in inv)
    Console.WriteLine(item.Name);

// 武器だけ列挙
foreach (var weapon in inv.GetByType(ItemType.Weapon))
    Console.WriteLine($"武器: {weapon.Name}");`,

  pros: [
    'コレクションの内部実装を隠蔽できる',
    'C# の foreach / LINQ と自然に統合できる',
    'yield return で遅延評価の効率的なイテレーターを簡単に作れる',
  ],
  cons: [
    '走査中にコレクションを変更すると例外になる',
    'インデックスアクセスが必要な場合は向いていない',
  ],

  antipattern: `<p>走査中に <code>_items.Remove()</code> などコレクションを変更すると
    <code>InvalidOperationException</code> が起きます。
    変更が必要なら <code>.ToList()</code> でコピーしてから走査するか、
    削除対象をリストに積んで走査後に一括削除しましょう。</p>`,

  related: ['composite', 'visitor'],
},

/* ─────────────────────────────────────────────────────────── */

'mediator': {
  name: 'Mediator',
  nameJa: 'メディエーター',
  category: 'behavioral',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['UIハブ', 'チャット', 'Event System', '疎結合', '仲介者'],
  summary: '多対多の依存関係を持つオブジェクト群の代わりに、中継者（Mediator）に全通信を集中させる。UI コンポーネント間の相互依存を排除するのに有効。',

  problem: `<p>キャラ選択画面でキャラ一覧・ステータス表示・決定ボタン・プレビュー画像が
    互いに直接参照し合うと、一つ変更するたびに全員への影響を確認する必要があります。
    N個のコンポーネントで最大 N*(N-1)/2 本の依存が生まれます。</p>`,

  solution: `<p>全コンポーネントは Mediator だけを知ります。
    「キャラを選択した」という通知を Mediator が受け取り、
    ステータス・プレビュー・ボタンを更新する責務を一手に引き受けます。</p>`,

  diagram: `
Without Mediator:  A ↔ B ↔ C ↔ D  (6本の依存)
With Mediator:     A → M ← B
                   C → M ← D  (全員 Mediator のみ)`,

  csharpCode: `// ─── Mediator インターフェース ───────────────────────────
public interface ICharacterSelectMediator
{
    void OnCharacterSelected(int index);
    void OnConfirmClicked();
}

// ─── Colleague（コンポーネント基底） ─────────────────────
public abstract class UIComponent
{
    protected ICharacterSelectMediator _mediator;
    public UIComponent(ICharacterSelectMediator mediator) { _mediator = mediator; }
}

// ─── 具体コンポーネント ───────────────────────────────────
public class CharacterList : UIComponent
{
    public CharacterList(ICharacterSelectMediator m) : base(m) { }

    public void SelectCharacter(int index)
    {
        Console.WriteLine($"[List] キャラ {index} 選択");
        _mediator.OnCharacterSelected(index);  // 自分で処理せず Mediator に通知
    }
}

public class StatusPanel : UIComponent
{
    public StatusPanel(ICharacterSelectMediator m) : base(m) { }

    public void ShowCharacter(int index)
        => Console.WriteLine($"[Status] キャラ {index} のステータス表示");
}

public class ConfirmButton : UIComponent
{
    public bool IsEnabled { get; private set; }
    public ConfirmButton(ICharacterSelectMediator m) : base(m) { IsEnabled = false; }

    public void SetEnabled(bool v)
    {
        IsEnabled = v;
        Console.WriteLine($"[Button] 決定ボタン {(v ? "有効" : "無効")}");
    }
    public void Click() { if (IsEnabled) _mediator.OnConfirmClicked(); }
}

// ─── 具体 Mediator（全コンポーネントを持つ） ─────────────
public class CharacterSelectMediator : ICharacterSelectMediator
{
    private CharacterList  _list;
    private StatusPanel    _status;
    private ConfirmButton  _button;
    private int            _selected = -1;

    public void SetComponents(CharacterList l, StatusPanel s, ConfirmButton b)
    {
        _list = l; _status = s; _button = b;
    }

    public void OnCharacterSelected(int index)
    {
        _selected = index;
        _status.ShowCharacter(index);   // Status を更新
        _button.SetEnabled(true);       // ボタンを有効化
    }

    public void OnConfirmClicked()
        => Console.WriteLine($"[Mediator] キャラ {_selected} で決定！");
}`,

  pros: [
    'コンポーネント間の直接依存がなくなり疎結合になる',
    'コンポーネントの追加・削除が他に影響しない',
    '通信ロジックが Mediator に集中するためデバッグしやすい',
  ],
  cons: [
    'Mediator 自体が肥大化しやすい（God Object になるリスク）',
    '全通信が Mediator を経由するためボトルネックになりうる',
  ],

  antipattern: `<p>Mediator に「どのコンポーネントをどう操作するか」を直接書きすぎると
    巨大な God Class になります。
    通知の配信だけを担う <strong>Observer/Event 型の軽量 Mediator</strong> に留めるか、
    規模が大きければ <strong>Pub/Sub（Message Bus）</strong> への移行を検討しましょう。</p>`,

  related: ['observer', 'facade', 'pub-sub'],
},

/* ─────────────────────────────────────────────────────────── */

'memento': {
  name: 'Memento',
  nameJa: 'メメント',
  category: 'behavioral',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['セーブ', 'ロード', 'Undo', 'チェックポイント', 'スナップショット'],
  summary: 'オブジェクトの内部状態をカプセル化したスナップショットとして保存し、あとで復元できるようにする。セーブ・ロード・チェックポイント・Undo の基盤。',

  problem: `<p>キャラクターの状態（HP・位置・レベル等）をセーブするとき、
    外部から内部フィールドに直接アクセスしてコピーするとカプセル化が崩れます。
    かといってすべての状態をパブリックにするのは設計として問題です。</p>`,

  solution: `<p>Originator（保存元）が <code>Save()</code> で自分の状態を
    Memento（スナップショット）オブジェクトとして作成します。
    Caretaker（セーブ管理）は Memento の中身を知らずに保持し、
    <code>Load(memento)</code> で Originator が自分自身を復元します。</p>`,

  csharpCode: `// ─── Memento（スナップショット・不変） ───────────────────
public sealed class PlayerMemento
{
    public float X       { get; }
    public float Y       { get; }
    public int   Hp      { get; }
    public int   Level   { get; }
    public int   Gold    { get; }
    public string SceneName { get; }

    // コンストラクタはパッケージ内のみ（外部からの改ざん防止）
    internal PlayerMemento(float x, float y, int hp, int level, int gold, string scene)
    {
        X = x; Y = y; Hp = hp; Level = level; Gold = gold; SceneName = scene;
    }
}

// ─── Originator（保存・復元の主体） ──────────────────────
public class Player
{
    public float  X     { get; set; }
    public float  Y     { get; set; }
    public int    Hp    { get; set; }
    public int    Level { get; set; }
    public int    Gold  { get; set; }
    public string Scene { get; set; } = "Field";

    // 現在状態をスナップショット化
    public PlayerMemento Save()
        => new(X, Y, Hp, Level, Gold, Scene);

    // スナップショットから自分を復元
    public void Load(PlayerMemento m)
    {
        X = m.X; Y = m.Y; Hp = m.Hp;
        Level = m.Level; Gold = m.Gold; Scene = m.SceneName;
    }
}

// ─── Caretaker（セーブデータ管理） ───────────────────────
public class SaveManager
{
    private readonly Dictionary<string, PlayerMemento> _slots = new();
    private readonly Stack<PlayerMemento> _checkpoints = new();

    public void SaveToSlot(string slot, Player player)
        => _slots[slot] = player.Save();

    public bool LoadFromSlot(string slot, Player player)
    {
        if (!_slots.TryGetValue(slot, out var m)) return false;
        player.Load(m);
        return true;
    }

    // チェックポイント（Undo 用）
    public void PushCheckpoint(Player player)
        => _checkpoints.Push(player.Save());

    public bool RestoreLastCheckpoint(Player player)
    {
        if (_checkpoints.Count == 0) return false;
        player.Load(_checkpoints.Pop());
        return true;
    }
}

// ─── 使用例 ───────────────────────────────────────────────
var player  = new Player { X = 10, Y = 5, Hp = 80, Level = 3, Gold = 200 };
var saveMgr = new SaveManager();

saveMgr.PushCheckpoint(player);   // チェックポイント保存
player.TakeDamage(50);            // ダメージを受ける
saveMgr.RestoreLastCheckpoint(player);  // チェックポイントに戻る`,

  pros: [
    'カプセル化を壊さずにオブジェクトの状態を保存できる',
    'チェックポイント・Undo・セーブスロットをシンプルに実装できる',
  ],
  cons: [
    '状態が大きいとスナップショットのメモリコストが高い',
    '参照型を含む状態は深いコピーが必要（浅いコピーのバグに注意）',
  ],

  antipattern: `<p>参照型（List, Dictionary, 他オブジェクトへの参照）を含む状態を
    Memento にコピーするとき、<strong>シャローコピーでは参照先が共有</strong>され
    ロード後にデータが壊れます。必ず<strong>ディープコピー</strong>か不変オブジェクトを使いましょう。</p>`,

  related: ['command', 'serialization'],
},

/* ─────────────────────────────────────────────────────────── */

'chain-of-responsibility': {
  name: 'Chain of Responsibility',
  nameJa: '責任の連鎖',
  category: 'behavioral',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['パイプライン', 'ダメージ計算', '入力処理', 'フィルター', 'ミドルウェア'],
  summary: 'リクエストをチェーン状に並んだハンドラーに順番に渡し、処理できるものが担当する。ダメージ計算パイプライン・入力処理・UI イベント伝播に有効。',

  problem: `<p>ダメージ計算に「防具軽減」「属性耐性」「バフ補正」「無敵判定」が絡むとき、
    これをすべて1つのメソッドに書くと巨大な if 地獄になります。
    しかも「毒耐性バフが追加されたとき」に既存コードを修正する必要があります。</p>`,

  solution: `<p>各処理を Handler クラスにして連結します。
    ダメージは先頭ハンドラーから渡され、各ハンドラーが処理して次へ渡すか、
    処理を打ち切るかを決めます。新しい処理の追加は Handler を作るだけです。</p>`,

  csharpCode: `// ─── Handler 基底 ────────────────────────────────────────
public abstract class DamageHandler
{
    private DamageHandler _next;

    public DamageHandler SetNext(DamageHandler next)
    {
        _next = next;
        return next;   // チェーン構築をメソッドチェーンで書けるよう返す
    }

    public virtual int Handle(DamageContext ctx)
        => _next?.Handle(ctx) ?? ctx.FinalDamage;
}

public class DamageContext
{
    public int    RawDamage   { get; set; }
    public int    FinalDamage { get; set; }
    public string Element     { get; set; }
    public bool   IsBlocked   { get; set; }
}

// ─── 各 Handler ───────────────────────────────────────────

// ① 無敵判定（打ち切り）
public class InvincibleHandler : DamageHandler
{
    private readonly bool _isInvincible;
    public InvincibleHandler(bool inv) { _isInvincible = inv; }

    public override int Handle(DamageContext ctx)
    {
        if (_isInvincible) { ctx.FinalDamage = 0; return 0; }  // チェーン打ち切り
        return base.Handle(ctx);
    }
}

// ② 属性耐性
public class ElementResistHandler : DamageHandler
{
    private readonly Dictionary<string, float> _resist;
    public ElementResistHandler(Dictionary<string, float> r) { _resist = r; }

    public override int Handle(DamageContext ctx)
    {
        if (_resist.TryGetValue(ctx.Element, out float rate))
            ctx.FinalDamage = (int)(ctx.FinalDamage * (1f - rate));
        return base.Handle(ctx);
    }
}

// ③ 防具軽減
public class ArmorHandler : DamageHandler
{
    private readonly int _defense;
    public ArmorHandler(int def) { _defense = def; }

    public override int Handle(DamageContext ctx)
    {
        ctx.FinalDamage = Math.Max(0, ctx.FinalDamage - _defense);
        return base.Handle(ctx);
    }
}

// ④ 最小ダメージ保証
public class MinDamageHandler : DamageHandler
{
    public override int Handle(DamageContext ctx)
    {
        if (ctx.FinalDamage == 0 && !ctx.IsBlocked) ctx.FinalDamage = 1;
        return base.Handle(ctx);
    }
}

// ─── チェーンの組み立てと使用 ────────────────────────────
var resist = new Dictionary<string, float> { ["Fire"] = 0.5f };

var chain = new InvincibleHandler(false);
chain.SetNext(new ElementResistHandler(resist))
     .SetNext(new ArmorHandler(10))
     .SetNext(new MinDamageHandler());

var ctx = new DamageContext { RawDamage = 100, FinalDamage = 100, Element = "Fire" };
int result = chain.Handle(ctx);
// 100 → Fire 50%軽減 → 50 → 防具-10 → 40 → 最小1保証 → 40`,

  pros: [
    '処理の追加・並び替えが既存コードへの影響なしに可能',
    'ハンドラー単体でテストできる',
    'ミドルウェアパターンとして汎用的に応用できる',
  ],
  cons: [
    'チェーンが長くなるとデバッグが難しい',
    'どの Handler が実際に処理したかが外部から分かりにくい',
    '処理がスルーされる（どのハンドラーも処理しない）可能性がある',
  ],

  antipattern: `<p>チェーンの末尾にデフォルトハンドラーを置き忘れると
    リクエストが<strong>どこにも処理されず消える</strong>バグが起きます。
    また無闇に長いチェーンは Observer や Command への置き換えを検討しましょう。</p>`,

  related: ['command', 'decorator', 'mediator'],
},

/* ─────────────────────────────────────────────────────────── */

'visitor': {
  name: 'Visitor',
  nameJa: 'ビジター',
  category: 'behavioral',
  difficulty: 3,
  gameFrequency: 1,
  tags: ['ダブルディスパッチ', 'シーングラフ', '操作追加', '型安全'],
  summary: 'オブジェクト構造を変えずに新しい操作を追加できるパターン。ダブルディスパッチを使い、クラスと操作を直交させる。',

  problem: `<p>シーン内の全オブジェクトに対して「描画」「物理更新」「シリアライズ」など
    複数の操作を後から追加したいとき、各クラスにメソッドを追加し続けると
    クラスが膨れ、開放・閉鎖原則に違反します。</p>`,

  solution: `<p>操作を Visitor クラスとして外部化します。
    各ノードは <code>Accept(visitor)</code> だけを持ち、
    <code>visitor.Visit(this)</code> を呼ぶことでダブルディスパッチが成立します。
    新しい操作は新しい Visitor クラスを追加するだけです。</p>`,

  csharpCode: `// ─── Visitor インターフェース ────────────────────────────
public interface ISceneVisitor
{
    void Visit(MeshNode node);
    void Visit(LightNode node);
    void Visit(CameraNode node);
}

// ─── ノード基底 ───────────────────────────────────────────
public abstract class SceneNode
{
    public string Name { get; set; }
    public abstract void Accept(ISceneVisitor visitor);
}

public class MeshNode : SceneNode
{
    public string MeshPath { get; set; }
    public override void Accept(ISceneVisitor v) => v.Visit(this);
}

public class LightNode : SceneNode
{
    public float Intensity { get; set; }
    public override void Accept(ISceneVisitor v) => v.Visit(this);
}

public class CameraNode : SceneNode
{
    public float Fov { get; set; }
    public override void Accept(ISceneVisitor v) => v.Visit(this);
}

// ─── 具体 Visitor（操作を外部化） ────────────────────────
public class RenderVisitor : ISceneVisitor
{
    public void Visit(MeshNode n)   => Console.WriteLine($"Render mesh: {n.MeshPath}");
    public void Visit(LightNode n)  => Console.WriteLine($"Apply light: {n.Intensity}");
    public void Visit(CameraNode n) => Console.WriteLine($"Set camera FOV: {n.Fov}");
}

public class SerializeVisitor : ISceneVisitor
{
    public void Visit(MeshNode n)   => Console.WriteLine($"{{type:mesh, path:{n.MeshPath}}}");
    public void Visit(LightNode n)  => Console.WriteLine($"{{type:light, intensity:{n.Intensity}}}");
    public void Visit(CameraNode n) => Console.WriteLine($"{{type:camera, fov:{n.Fov}}}");
}

// ─── 使用例 ───────────────────────────────────────────────
var scene = new List<SceneNode>
{
    new MeshNode  { Name = "Hero",  MeshPath = "hero.fbx" },
    new LightNode { Name = "Sun",   Intensity = 1.2f },
    new CameraNode{ Name = "Main",  Fov = 60f },
};

var renderer  = new RenderVisitor();
var serializer = new SerializeVisitor();

foreach (var node in scene) node.Accept(renderer);   // 全ノードを描画
foreach (var node in scene) node.Accept(serializer); // 全ノードをシリアライズ`,

  pros: [
    '新しい操作の追加がノードクラスを変更せずに行える',
    '型ごとの処理を Visitor にまとめて書けるため見通しがよい',
  ],
  cons: [
    '新しいノード型を追加すると全 Visitor の修正が必要',
    'ダブルディスパッチの仕組みが直感的でなく学習コストが高い',
    '実際のゲームでは Component + Dictionary<Type, Action> で代替できることが多い',
  ],

  antipattern: `<p>Visitor は「ノード型は安定しているが操作が増え続ける」ケースに向いています。
    逆に「ノード型がどんどん増える」なら Strategy や Component の方が適切です。
    また C# の <strong>パターンマッチング（<code>switch (node)</code>）</strong>で
    Visitor を代替できる場合も多いです。</p>`,

  related: ['composite', 'iterator', 'command'],
},

/* ─────────────────────────────────────────────────────────── */

'interpreter': {
  name: 'Interpreter',
  nameJa: 'インタープリター',
  category: 'behavioral',
  difficulty: 3,
  gameFrequency: 1,
  tags: ['DSL', 'スクリプト', '数式', 'パーサー', '構文木'],
  summary: '独自の「言語」の文法を表現した AST（抽象構文木）を構築し、各ノードが自分を解釈・実行することで式や文を評価するパターン。',

  problem: `<p>ゲーム内イベントを「If HP < 30% Then PlayBGM("danger")」のような
    簡単なスクリプトで記述できるようにしたい。
    しかし完全なスクリプトエンジンを作るほどではない場合に使います。</p>`,

  solution: `<p>文法の各要素をクラスで表現し、式ツリー（AST）を作ります。
    <code>Interpret(context)</code> を再帰的に呼ぶことで全体の値を評価します。</p>`,

  csharpCode: `// ─── コンテキスト（変数テーブル） ────────────────────────
public class Context
{
    private readonly Dictionary<string, int> _vars = new();
    public int  Get(string name)           => _vars[name];
    public void Set(string name, int value) => _vars[name] = value;
}

// ─── 式インターフェース ───────────────────────────────────
public interface IExpression
{
    int Interpret(Context ctx);
}

// ─── 終端式（リテラル・変数） ─────────────────────────────
public class NumberExpr : IExpression
{
    private readonly int _val;
    public NumberExpr(int v) { _val = v; }
    public int Interpret(Context ctx) => _val;
}

public class VariableExpr : IExpression
{
    private readonly string _name;
    public VariableExpr(string name) { _name = name; }
    public int Interpret(Context ctx) => ctx.Get(_name);
}

// ─── 非終端式（演算） ─────────────────────────────────────
public class AddExpr : IExpression
{
    private readonly IExpression _left, _right;
    public AddExpr(IExpression l, IExpression r) { _left = l; _right = r; }
    public int Interpret(Context ctx) => _left.Interpret(ctx) + _right.Interpret(ctx);
}

public class MultiplyExpr : IExpression
{
    private readonly IExpression _left, _right;
    public MultiplyExpr(IExpression l, IExpression r) { _left = l; _right = r; }
    public int Interpret(Context ctx) => _left.Interpret(ctx) * _right.Interpret(ctx);
}

// ─── 使用例: (hp + bonus) * multiplier ───────────────────
var ctx = new Context();
ctx.Set("hp", 80);
ctx.Set("bonus", 20);
ctx.Set("multiplier", 2);

// ASTを手動で組み立て
IExpression expr = new MultiplyExpr(
    new AddExpr(new VariableExpr("hp"), new VariableExpr("bonus")),
    new VariableExpr("multiplier")
);

int result = expr.Interpret(ctx);  // (80 + 20) * 2 = 200`,

  pros: [
    '文法が拡張しやすく、新しい式の追加がクラス追加で済む',
    '単純な DSL や設定スクリプトに向いている',
  ],
  cons: [
    '複雑な文法には向いていない（クラス数が爆発する）',
    'パーサー（文字列→AST の変換）は別途実装が必要',
    '実用的なスクリプト言語（Lua・HScript）の方が現実的なことが多い',
  ],

  antipattern: `<p>本格的なスクリプト言語が欲しい場合に Interpreter を自作するのは過大なコストです。
    <strong>MoonSharp（Lua for .NET）</strong>や <strong>CS-Script</strong> など
    既成の組み込みスクリプトエンジンを検討しましょう。
    また <strong>Bytecode パターン</strong>はより高パフォーマンスな代替です。</p>`,

  related: ['bytecode', 'visitor', 'composite'],
},


'pub-sub': {
  name: 'Pub/Sub (Message Bus)',
  nameJa: 'パブリッシュ・サブスクライブ',
  category: 'architecture',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['イベント', 'バス', '疎結合', 'サービス間', 'メッセージ'],
  summary: '発行者（Publisher）と購読者（Subscriber）を完全に切り離すメッセージ配信基盤。Observer はお互いを知っているが、Pub/Sub は Message Bus だけが仲介し双方は相手の存在すら知らない。',

  problem: `
    <p>Observer パターンでも疎結合は実現できますが、
    Subject は <code>Subscribe(observer)</code> を持つので
    <strong>Observer インターフェースには依存</strong>しています。</p>
    <p>ゲームが大規模になると「インベントリがアイテムを取得したら、
    実績システム・クエストシステム・UIが反応する」という状況で、
    <code>Inventory</code> がこれら全員を知っているのは不健全です。</p>
    <pre style="background:var(--bg3);padding:.75rem;border-radius:6px;font-size:.8rem;overflow-x:auto">
// Observer だと Subject が Observer の存在を知っている
inventory.Subscribe(achievementSystem);   // ← 直接依存
inventory.Subscribe(questSystem);
inventory.Subscribe(itemUI);</pre>`,

  solution: `
    <p>中央の <strong>MessageBus</strong> を用意します。
    発行者はバスに「メッセージを投げる」だけ。
    購読者はバスに「このメッセージに反応する」と登録するだけ。
    <strong>発行者と購読者はお互いの存在を知りません。</strong></p>
    <p>C# では<strong>メッセージ型をキー</strong>にすることで型安全なバスが作れます。</p>`,

  diagram: `
Observer パターン:
  Inventory ──Subscribe──▶ IAchievementObserver
            ──Subscribe──▶ IQuestObserver
            ──Subscribe──▶ IUIObserver
  ※ Inventory が全購読者の型に依存

Pub/Sub パターン:
  Inventory ──Publish(ItemPickedUpMsg)──▶ MessageBus ──▶ AchievementSystem
                                                    ──▶ QuestSystem
                                                    ──▶ ItemUI
  ※ Inventory は MessageBus だけを知る。受信側も互いを知らない。`,

  csharpCode: `using System;
using System.Collections.Generic;

// ─── メッセージの基底マーカー（任意） ───────────────────
public interface IMessage { }

// ─── ゲームで使うメッセージ型（データクラス） ────────────
public record ItemPickedUpMessage(string ItemId, int Count) : IMessage;
public record PlayerDiedMessage(string Cause)               : IMessage;
public record LevelUpMessage(int NewLevel)                  : IMessage;
public record EnemyKilledMessage(string EnemyId, int Exp)  : IMessage;

// ─── MessageBus（型安全・スレッドセーフ） ─────────────────
public sealed class MessageBus
{
    // シングルトンインスタンス（DIと組み合わせる場合は外部注入も可）
    public static readonly MessageBus Default = new();

    private readonly Dictionary<Type, List<Delegate>> _handlers = new();
    private readonly object _lock = new();

    // 購読
    public void Subscribe<T>(Action<T> handler) where T : IMessage
    {
        lock (_lock)
        {
            var key = typeof(T);
            if (!_handlers.ContainsKey(key)) _handlers[key] = new();
            _handlers[key].Add(handler);
        }
    }

    // 購読解除
    public void Unsubscribe<T>(Action<T> handler) where T : IMessage
    {
        lock (_lock)
        {
            if (_handlers.TryGetValue(typeof(T), out var list))
                list.Remove(handler);
        }
    }

    // 発行：購読者全員に配信
    public void Publish<T>(T message) where T : IMessage
    {
        List<Delegate> snapshot;
        lock (_lock)
        {
            if (!_handlers.TryGetValue(typeof(T), out var list)) return;
            snapshot = new List<Delegate>(list);   // ロック外で呼ぶためコピー
        }
        foreach (var handler in snapshot)
            ((Action<T>)handler)(message);
    }

    public void Clear() { lock (_lock) _handlers.Clear(); }
}

// ─── 発行側：Inventory（受信側を一切知らない） ────────────
public class Inventory
{
    private readonly MessageBus _bus;
    private readonly List<string> _items = new();

    public Inventory(MessageBus bus) { _bus = bus; }

    public void PickUp(string itemId, int count = 1)
    {
        _items.Add(itemId);
        _bus.Publish(new ItemPickedUpMessage(itemId, count)); // バスに投げるだけ
    }
}

// ─── 受信側：各システム（発行側を一切知らない） ───────────
public class AchievementSystem
{
    public AchievementSystem(MessageBus bus)
    {
        bus.Subscribe<ItemPickedUpMessage>(OnItemPickedUp);
        bus.Subscribe<EnemyKilledMessage>(OnEnemyKilled);
    }

    private void OnItemPickedUp(ItemPickedUpMessage msg)
        => Console.WriteLine($"[Achievement] アイテム取得チェック: {msg.ItemId}");

    private void OnEnemyKilled(EnemyKilledMessage msg)
        => Console.WriteLine($"[Achievement] 撃破チェック: {msg.EnemyId}");
}

public class QuestSystem
{
    public QuestSystem(MessageBus bus)
    {
        bus.Subscribe<ItemPickedUpMessage>(OnItemPickedUp);
        bus.Subscribe<EnemyKilledMessage>(OnEnemyKilled);
    }

    private void OnItemPickedUp(ItemPickedUpMessage msg)
        => Console.WriteLine($"[Quest] アイテム収集進捗更新: {msg.ItemId} x{msg.Count}");

    private void OnEnemyKilled(EnemyKilledMessage msg)
        => Console.WriteLine($"[Quest] 討伐クエスト進捗 +{msg.Exp}exp");
}

// ─── 使用例 ───────────────────────────────────────────────
var bus = MessageBus.Default;

var inv      = new Inventory(bus);
var achieve  = new AchievementSystem(bus);
var quest    = new QuestSystem(bus);

inv.PickUp("IronSword");
// → [Achievement] アイテム取得チェック: IronSword
// → [Quest] アイテム収集進捗更新: IronSword x1

bus.Publish(new EnemyKilledMessage("Goblin", 30));
// → [Achievement] 撃破チェック: Goblin
// → [Quest] 討伐クエスト進捗 +30exp`,

  unityCode: `// Unity での Pub/Sub：ScriptableObject をバスとして使う方法
// （VContainer / Zenject の MessagePipe も同じ考え方）

// ─── ScriptableObject ベースの型安全イベントチャンネル ──
[CreateAssetMenu(menuName = "Events/ItemPickedUp")]
public class ItemPickedUpEvent : ScriptableObject
{
    private readonly List<Action<string, int>> _listeners = new();

    public void Subscribe(Action<string, int> l)   => _listeners.Add(l);
    public void Unsubscribe(Action<string, int> l) => _listeners.Remove(l);

    public void Raise(string itemId, int count)
    {
        foreach (var l in _listeners.ToArray()) l(itemId, count);
    }
}

// ─── 発行側（Inventory）──────────────────────────────────
public class Inventory : MonoBehaviour
{
    // Inspector でイベントチャンネルをアサインするだけ
    [SerializeField] private ItemPickedUpEvent _itemPickedUpEvent;

    public void PickUp(string itemId)
    {
        _itemPickedUpEvent.Raise(itemId, 1);  // チャンネルに投げるだけ
    }
}

// ─── 受信側（Achievement）────────────────────────────────
public class AchievementSystem : MonoBehaviour
{
    [SerializeField] private ItemPickedUpEvent _itemPickedUpEvent;

    private void OnEnable()  => _itemPickedUpEvent.Subscribe(OnItemPickedUp);
    private void OnDisable() => _itemPickedUpEvent.Unsubscribe(OnItemPickedUp);

    private void OnItemPickedUp(string itemId, int count)
        => Debug.Log($"Achievement: {itemId} を {count} 個取得");
}`,

  pros: [
    '発行者・購読者がお互いを完全に知らない（Observer より疎結合）',
    '新しいシステムの追加が既存コードへの影響ゼロ',
    'モジュール・DLC・プラグインの追加に強い',
    '型安全なメッセージで Pub/Sub 特有の「stringly-typed」問題を解消できる',
  ],
  cons: [
    'イベントの流れがコードから追いにくくなる（デバッグが難しい）',
    '誰がどのメッセージを受けているか把握しにくい',
    '購読解除漏れでメモリリークが起きる',
    'パフォーマンスクリティカルなホットパスには不向き',
  ],

  antipattern: `
    <p><strong>Observer との使い分け：</strong></p>
    <ul style="margin:.5rem 0 0 1.25rem;font-size:.875rem;color:var(--text2)">
      <li>同一モジュール内の通知 → <strong>Observer / C# event</strong> で十分</li>
      <li>モジュール間・システム間の通知 → <strong>Pub/Sub</strong> が適切</li>
    </ul>
    <p style="margin-top:.75rem">
    「すべてを Pub/Sub に置き換える」と処理の追跡が困難になります。
    ローカルな依存には素直に直接呼び出しやObserverを使いましょう。
    また大量のメッセージ型が増えすぎたら、カテゴリごとにバスを分割するか
    <strong>Event Queue</strong> と組み合わせて処理を非同期化すると整理できます。</p>`,

  related: ['observer', 'event-queue', 'mediator'],

  quiz: [
    {
      q: 'Pub/Sub が Observer より疎結合な理由はどれですか？',
      options: [
        'インターフェースを使っているから',
        '発行者と購読者がお互いの存在を知らず MessageBus だけを通じて通信するから',
        'メッセージが非同期で届くから',
        'クラスの数が少ないから',
      ],
      answer: 1,
      explanation: 'Observer は Subject が Observer リストを持つため互いを知っています。Pub/Sub は MessageBus が唯一の仲介者で、発行者・購読者は互いに完全に独立しています。',
    },
    {
      q: '同じモジュール内のオブジェクト間通知に Pub/Sub を使うことの問題点は？',
      options: [
        '速度が遅すぎる',
        '過剰設計になりイベントの流れが追いにくくなる',
        'スレッドセーフでない',
        'C# では使えない',
      ],
      answer: 1,
      explanation: 'Pub/Sub はモジュール間の疎結合に真価を発揮します。同一モジュール内では Observer や直接呼び出しの方がシンプルで追跡しやすいです。',
    },
  ],
},


/* ============================================================
   🧱 GoF 構造パターン（Structural）
   ============================================================ */

// ─────────────────────────────────────────────
'adapter': {
  name: 'Adapter',
  nameJa: 'アダプター',
  category: 'structural',
  difficulty: 1,
  gameFrequency: 2,
  tags: ['ラッパー', '互換性', 'インターフェース変換', '外部ライブラリ'],
  summary: '互換性のないインターフェースを持つクラスを、クライアントが期待するインターフェースに変換する。外部ライブラリや既存コードを「そのまま」使えるようにするラッパー。',

  problem: `
    <p>物理エンジン・音声ライブラリ・ネットワーク SDK など、外部コードのインターフェースは
    自分のゲームが期待する形と違うことがほとんどです。</p>
    <pre><code>// 外部の音声ライブラリ（変更できない）
class ExternalAudio {
    public void PlaySound(string filePath, float vol) { ... }
    public void StopAllSounds() { ... }
}

// ゲーム側が期待するインターフェース
interface IAudioService {
    void Play(string clipName);
    void Stop(string clipName);
}</code></pre>
    <p>インターフェースが合わず、ゲームコード中に外部ライブラリ固有の呼び出しが散在すると
    ライブラリ変更時に全体を修正しなければなりません。</p>`,

  solution: `
    <p><strong>アダプタークラス</strong>を挟んで、外部インターフェースをゲームが期待する形に変換します。</p>
    <ul>
      <li>ゲームコードは <code>IAudioService</code> だけを知る</li>
      <li>ライブラリを差し替えるときはアダプターだけを書き換えればよい</li>
      <li>テスト時はモックアダプターに差し替え可能</li>
    </ul>`,

  diagram: `classDiagram
    class Client {
      +Shoot()
    }
    class IAudioService {
      <<interface>>
      +Play(clipName)
      +Stop(clipName)
    }
    class ExternalAudioAdapter {
      -lib : ExternalAudio
      +Play(clipName)
      +Stop(clipName)
    }
    class ExternalAudio {
      +PlaySound(filePath, vol)
      +StopAllSounds()
    }
    Client --> IAudioService : uses
    IAudioService <|.. ExternalAudioAdapter : implements
    ExternalAudioAdapter --> ExternalAudio : wraps`,

  csharpCode: `// ── 既存の（変更できない）外部ライブラリ ──────────────────
public class ExternalAudio
{
    public void PlaySound(string filePath, float volume)
        => Console.WriteLine($"[Ext] Play {filePath} vol={volume}");

    public void StopAllSounds()
        => Console.WriteLine("[Ext] Stop all");
}

// ── ゲームが期待するインターフェース ───────────────────────
public interface IAudioService
{
    void Play(string clipName);
    void Stop(string clipName);
}

// ── アダプター：外部ライブラリを IAudioService に変換 ──────
public class ExternalAudioAdapter : IAudioService
{
    private readonly ExternalAudio _lib;
    private readonly string _basePath;

    public ExternalAudioAdapter(ExternalAudio lib, string basePath = "sounds/")
    {
        _lib = lib;
        _basePath = basePath;
    }

    public void Play(string clipName)
        => _lib.PlaySound(_basePath + clipName + ".wav", 1.0f);

    public void Stop(string clipName)
        => _lib.StopAllSounds();   // 外部ライブラリが個別停止非対応の例
}

// ── ゲームコード（IAudioService しか知らない）─────────────
public class Player
{
    private readonly IAudioService _audio;

    public Player(IAudioService audio) => _audio = audio;

    public void Shoot()
    {
        Console.WriteLine("Player shoots!");
        _audio.Play("shoot");
    }
}

// ── 使用例 ────────────────────────────────────────────────
var adapter = new ExternalAudioAdapter(new ExternalAudio());
var player  = new Player(adapter);
player.Shoot();
// Player shoots!
// [Ext] Play sounds/shoot.wav vol=1`,

  unityCode: `// Unity での Adapter 活用例：
// Addressables/Resources など複数のロード方式をアダプターで吸収する

using UnityEngine;

// ── ゲームが依存するインターフェース ────────────────────────
public interface IAssetLoader
{
    AudioClip LoadClip(string key);
}

// ── Resources.Load アダプター ────────────────────────────
public class ResourcesLoader : IAssetLoader
{
    public AudioClip LoadClip(string key)
        => Resources.Load<AudioClip>("Sounds/" + key);
}

// ── Addressables アダプター（将来の差し替え用） ───────────
// public class AddressablesLoader : IAssetLoader
// {
//     public AudioClip LoadClip(string key)
//         => Addressables.LoadAssetAsync<AudioClip>(key).WaitForCompletion();
// }

// ── 使う側のコンポーネント ───────────────────────────────
public class AudioManager : MonoBehaviour
{
    [SerializeField] private AudioSource _source;

    private IAssetLoader _loader;

    void Awake()
    {
        // Resources 版を使う。Addressables 版に変えても AudioManager は触らない
        _loader = new ResourcesLoader();
    }

    public void Play(string clipName)
    {
        var clip = _loader.LoadClip(clipName);
        if (clip != null) _source.PlayOneShot(clip);
    }
}`,

  pros: [
    '既存クラスを変更せずに再利用できる（OCP 準拠）',
    '外部ライブラリへの依存を一箇所に集約できる',
    'テスト時にモックアダプターに差し替えやすい',
    'ライブラリ変更の影響範囲がアダプタークラスのみに限定される',
  ],
  cons: [
    '単純な変換でもクラスが1つ増える',
    '変換ロジックが複雑になると Facade パターンとの使い分けが難しくなる',
    '多段アダプター（アダプターのアダプター）は混乱の元',
  ],
  antipattern: `
    <p>アダプターの中に変換以外のビジネスロジックを書くと保守が困難になります。
    アダプターは「インターフェースの変換だけ」に徹し、ロジックはそれぞれのクラスに置きましょう。
    複数の外部システムをまとめて扱いたい場合は <strong>Facade</strong> を使ってください。</p>`,
  related: ['facade', 'decorator', 'proxy'],
  quiz: [
    {
      q: 'Adapter パターンの主な目的はどれですか？',
      options: [
        'オブジェクトの生成方法を隠蔽する',
        '互換性のないインターフェースを変換して再利用する',
        'オブジェクトへのアクセスを制御する',
        'アルゴリズムを交換可能にする',
      ],
      answer: 1,
      explanation: 'Adapter はクライアントが期待するインターフェースに合わせて既存クラスを「変換」するパターンです。',
    },
    {
      q: 'ゲーム開発で Adapter が最も活躍する場面はどれですか？',
      options: [
        'NPCの行動を毎フレーム更新する',
        '物理・音声・入力などの外部ライブラリをゲームコードから切り離す',
        '大量の弾丸オブジェクトを効率よく使い回す',
        'セーブデータをファイルに書き込む',
      ],
      answer: 1,
      explanation: '外部ライブラリのAPIを IAudioService などの自前インターフェースに変換することで、ライブラリ交換の影響をアダプター1クラスに封じ込められます。',
    },
  ],
},

// ─────────────────────────────────────────────
'bridge': {
  name: 'Bridge',
  nameJa: 'ブリッジ',
  category: 'structural',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['抽象', '実装', '分離', 'プラットフォーム', '継承爆発'],
  summary: '抽象（何をするか）と実装（どうやるか）を独立して変化させられるよう橋渡しする。継承ツリーの爆発的増加を防ぎ、プラットフォーム対応などに威力を発揮する。',

  problem: `
    <p>「武器の種類」と「武器のレンダリング方法（PC/Mobile）」を組み合わせたい場合、
    継承で対応すると組み合わせ爆発が起きます。</p>
    <pre><code>class SwordPC   : Weapon { }
class SwordMobile : Weapon { }
class BowPC     : Weapon { }
class BowMobile : Weapon { }
// 武器 × プラットフォーム = クラス数が掛け算で増える</code></pre>`,

  solution: `
    <p>「武器」という<strong>抽象レイヤー</strong>と「レンダラー」という<strong>実装レイヤー</strong>を
    別の継承ツリーに分け、抽象側が実装への参照（ブリッジ）を持ちます。</p>
    <ul>
      <li>武器の追加 → <code>Weapon</code> を継承するだけ</li>
      <li>プラットフォームの追加 → <code>IRenderer</code> を実装するだけ</li>
      <li>組み合わせは実行時にコンストラクタで注入</li>
    </ul>`,

  diagram: `classDiagram
    class Weapon {
      <<abstract>>
      -renderer : IRenderer
      +MoveTo(x, y)
      +Attack()
    }
    class Sword {
      +Attack()
    }
    class Bow {
      +Attack()
    }
    class IRenderer {
      <<interface>>
      +Draw(name, pos)
    }
    class PCRenderer {
      +Draw(name, pos)
    }
    class MobileRenderer {
      +Draw(name, pos)
    }
    Weapon <|-- Sword : extends
    Weapon <|-- Bow : extends
    Weapon o-- IRenderer : bridge
    IRenderer <|.. PCRenderer : implements
    IRenderer <|.. MobileRenderer : implements`,

  csharpCode: `// ── 実装レイヤー（Implementor）──────────────────────────
public interface IRenderer
{
    void Draw(string weaponName, (float x, float y) pos);
}

public class PCRenderer : IRenderer
{
    public void Draw(string name, (float x, float y) pos)
        => Console.WriteLine($"[PC  ] 高解像度で {name} を ({pos.x:F0},{pos.y:F0}) に描画");
}

public class MobileRenderer : IRenderer
{
    public void Draw(string name, (float x, float y) pos)
        => Console.WriteLine($"[Mobile] 省電力レンダリングで {name} を ({pos.x:F0},{pos.y:F0}) に描画");
}

// ── 抽象レイヤー（Abstraction）───────────────────────────
public abstract class Weapon
{
    protected readonly IRenderer _renderer;
    protected (float x, float y) Position;

    protected Weapon(IRenderer renderer) => _renderer = renderer;

    public abstract void Attack();
    public void MoveTo(float x, float y) => Position = (x, y);
}

public class Sword : Weapon
{
    public Sword(IRenderer renderer) : base(renderer) { }

    public override void Attack()
    {
        Console.WriteLine("Sword: 斬撃！");
        _renderer.Draw("Sword", Position);
    }
}

public class Bow : Weapon
{
    public Bow(IRenderer renderer) : base(renderer) { }

    public override void Attack()
    {
        Console.WriteLine("Bow: 矢を放つ！");
        _renderer.Draw("Bow", Position);
    }
}

// ── 使用例：組み合わせは実行時に決まる ─────────────────────
IRenderer renderer = new PCRenderer();          // PC 向け

Weapon sword = new Sword(renderer);
sword.MoveTo(100, 200);
sword.Attack();
// Sword: 斬撃！
// [PC  ] 高解像度で Sword を (100,200) に描画

Weapon bow = new Bow(new MobileRenderer());     // モバイル向け
bow.MoveTo(50, 80);
bow.Attack();
// Bow: 矢を放つ！
// [Mobile] 省電力レンダリングで Bow を (50,80) に描画`,

  unityCode: `// Unity での Bridge 活用例：
// レンダリングバックエンド（URP/HDRP/Legacy）の差異を吸収する

using UnityEngine;

// ── レンダリング実装インターフェース ─────────────────────
public interface IParticleRenderer
{
    void Spawn(string effectName, Vector3 position);
}

public class URPParticleRenderer : IParticleRenderer
{
    public void Spawn(string effectName, Vector3 position)
    {
        var prefab = Resources.Load<GameObject>($"Effects/URP/{effectName}");
        if (prefab) Object.Instantiate(prefab, position, Quaternion.identity);
        Debug.Log($"[URP] Spawned {effectName} at {position}");
    }
}

public class LegacyParticleRenderer : IParticleRenderer
{
    public void Spawn(string effectName, Vector3 position)
    {
        var prefab = Resources.Load<GameObject>($"Effects/Legacy/{effectName}");
        if (prefab) Object.Instantiate(prefab, position, Quaternion.identity);
        Debug.Log($"[Legacy] Spawned {effectName} at {position}");
    }
}

// ── 抽象：エフェクト種別 ──────────────────────────────
public abstract class VisualEffect
{
    protected readonly IParticleRenderer _renderer;
    protected VisualEffect(IParticleRenderer renderer) => _renderer = renderer;
    public abstract void Play(Vector3 position);
}

public class ExplosionEffect : VisualEffect
{
    public ExplosionEffect(IParticleRenderer r) : base(r) { }
    public override void Play(Vector3 pos)
    {
        Debug.Log("Explosion triggered!");
        _renderer.Spawn("explosion_01", pos);
    }
}

// ── GameManager などで組み合わせを注入 ─────────────────
public class EffectManager : MonoBehaviour
{
    private VisualEffect _hitEffect;

    void Start()
    {
        // GraphicsSettings などから判定して実装を切り替え
        IParticleRenderer renderer = new URPParticleRenderer();
        _hitEffect = new ExplosionEffect(renderer);
    }

    public void PlayExplosion(Vector3 pos) => _hitEffect.Play(pos);
}`,

  pros: [
    '抽象と実装を独立して拡張でき、継承ツリーの爆発を防ぐ',
    '実行時にレンダラーや実装を差し替えられる（Strategy に近い柔軟性）',
    'プラットフォーム固有コードを実装側に閉じ込められる',
  ],
  cons: [
    'コードが複数レイヤーに分かれるため、初見で追いにくい',
    '抽象と実装が密結合な場合は過剰設計になる',
    '小規模では Adapter だけで十分なことが多い',
  ],
  antipattern: `
    <p>「あとで分岐が増えるかも」という予測で先行して Bridge を導入するのはやり過ぎです。
    現時点で「Aの種類」×「Bの種類」が実際に掛け算になっているときに使いましょう。
    単純な実装の差し替えなら <strong>Strategy</strong> パターンで十分です。</p>`,
  related: ['adapter', 'strategy', 'abstract-factory'],
  quiz: [
    {
      q: 'Bridge パターンが「継承爆発」を防ぐ仕組みはどれですか？',
      options: [
        'すべてのクラスをひとつに統合する',
        '抽象と実装を別の継承ツリーに分けてコンポジションで繋ぐ',
        'テンプレートメソッドで共通処理を基底に移す',
        'インターフェースをなくして動的ディスパッチを使う',
      ],
      answer: 1,
      explanation: '抽象（何をするか）と実装（どうするか）を別ツリーに分け、橋渡し（ブリッジ）の参照で繋ぐことで、組み合わせ数がクラス数の和になります（掛け算ではなく）。',
    },
  ],
},

// ─────────────────────────────────────────────
'composite': {
  name: 'Composite',
  nameJa: 'コンポジット',
  category: 'structural',
  difficulty: 2,
  gameFrequency: 3,
  tags: ['ツリー', '階層', 'シーングラフ', 'UI', '再帰'],
  summary: '個々のオブジェクトとそのグループ（コンテナ）を同一インターフェースで扱う。シーングラフ・UIツリー・スキルシステムなど、ゲームのあらゆる階層構造に使われる。',

  problem: `
    <p>ゲームのシーンは親子関係のツリー構造です。「ノード一つ」と「子を持つノード」を
    別々に扱うと、操作するたびに <code>if (node is Group) { ... }</code> の分岐が必要になります。</p>
    <pre><code>// 扱いにくい例
void Update(Node node) {
    if (node is GroupNode g) {
        foreach (var child in g.Children) Update(child);
    } else {
        node.Update();  // 葉ノード
    }
}</code></pre>`,

  solution: `
    <p>葉（Leaf）とコンテナ（Composite）に<strong>同じインターフェース</strong>を持たせ、
    コンテナは子の集合に対して再帰的に同じ操作を委譲します。
    呼び出し側はツリーの深さを意識せずに操作できます。</p>`,

  diagram: `classDiagram
    class SceneNode {
      <<abstract>>
      +Name : string
      +Update(dt)
      +Render(depth)
    }
    class MeshNode {
      +Update(dt)
      +Render(depth)
    }
    class GroupNode {
      -children : List~SceneNode~
      +Add(node)
      +Remove(node)
      +Update(dt)
      +Render(depth)
    }
    SceneNode <|-- MeshNode : extends
    SceneNode <|-- GroupNode : extends
    GroupNode o-- SceneNode : children (recursive)`,

  csharpCode: `// ── コンポーネントインターフェース ──────────────────────
public abstract class SceneNode
{
    public string Name { get; }
    protected SceneNode(string name) => Name = name;

    public abstract void Update(float dt);
    public abstract void Render(int depth = 0);
}

// ── 葉ノード（Leaf）─────────────────────────────────────
public class MeshNode : SceneNode
{
    public MeshNode(string name) : base(name) { }

    public override void Update(float dt)
        => Console.WriteLine($"  MeshNode [{Name}] 物理更新 dt={dt:F3}");

    public override void Render(int depth = 0)
        => Console.WriteLine($"{new string(' ', depth * 2)}📦 Mesh: {Name}");
}

// ── 複合ノード（Composite）──────────────────────────────
public class GroupNode : SceneNode
{
    private readonly List<SceneNode> _children = new();

    public GroupNode(string name) : base(name) { }

    public void Add(SceneNode node) => _children.Add(node);
    public void Remove(SceneNode node) => _children.Remove(node);

    public override void Update(float dt)
    {
        Console.WriteLine($"Group [{Name}] Update →");
        foreach (var child in _children) child.Update(dt);   // 再帰委譲
    }

    public override void Render(int depth = 0)
    {
        Console.WriteLine($"{new string(' ', depth * 2)}📁 Group: {Name}");
        foreach (var child in _children) child.Render(depth + 1);
    }
}

// ── 使用例：シーングラフの構築 ─────────────────────────
var root = new GroupNode("Scene");

var player = new GroupNode("Player");
player.Add(new MeshNode("Body"));
player.Add(new MeshNode("Sword"));

var enemy = new MeshNode("Enemy");

root.Add(player);
root.Add(enemy);

Console.WriteLine("=== Render ===");
root.Render();
// 📁 Group: Scene
//   📁 Group: Player
//     📦 Mesh: Body
//     📦 Mesh: Sword
//   📦 Mesh: Enemy

Console.WriteLine("\n=== Update ===");
root.Update(0.016f);  // 全ノードが再帰的に更新される`,

  unityCode: `// Unity は GameObject / Transform がまさに Composite パターンの実装。
// ここではスキルツリーの例を示します。

using System.Collections.Generic;
using UnityEngine;

// ── スキルコンポーネント基底 ─────────────────────────────
public abstract class SkillNode
{
    public string SkillName { get; }
    protected SkillNode(string name) => SkillName = name;

    public abstract float GetDamageBonus();
    public abstract void PrintTree(int depth = 0);
}

// ── 単体スキル（葉）──────────────────────────────────────
public class SingleSkill : SkillNode
{
    private readonly float _bonus;
    public SingleSkill(string name, float bonus) : base(name) => _bonus = bonus;

    public override float GetDamageBonus() => _bonus;
    public override void PrintTree(int depth)
        => Debug.Log($"{new string('-', depth * 2)}⚔️ {SkillName}: +{_bonus}");
}

// ── スキルセット（複合）──────────────────────────────────
public class SkillSet : SkillNode
{
    private readonly List<SkillNode> _skills = new();
    public SkillSet(string name) : base(name) { }

    public void Add(SkillNode s) => _skills.Add(s);

    // 子スキル全体のボーナス合計を再帰計算
    public override float GetDamageBonus()
    {
        float total = 0;
        foreach (var s in _skills) total += s.GetDamageBonus();
        return total;
    }

    public override void PrintTree(int depth = 0)
    {
        Debug.Log($"{new string('-', depth * 2)}📚 {SkillName}");
        foreach (var s in _skills) s.PrintTree(depth + 1);
    }
}

// ── 使用例 ───────────────────────────────────────────────
public class SkillManager : MonoBehaviour
{
    void Start()
    {
        var warrior = new SkillSet("Warrior Skills");
        var basic   = new SkillSet("Basic");
        basic.Add(new SingleSkill("Strike",       5f));
        basic.Add(new SingleSkill("Heavy Strike", 10f));

        var advanced = new SkillSet("Advanced");
        advanced.Add(new SingleSkill("Whirlwind", 20f));

        warrior.Add(basic);
        warrior.Add(advanced);
        warrior.Add(new SingleSkill("Battle Cry", 3f));

        warrior.PrintTree();
        Debug.Log($"Total damage bonus: {warrior.GetDamageBonus()}");  // 38
    }
}`,

  pros: [
    '葉とコンテナを同一インターフェースで扱えるため呼び出し側がシンプル',
    '再帰的な木構造を自然に表現できる',
    '新しい種類のノードを追加しても既存コードに影響しない（OCP）',
  ],
  cons: [
    '葉にしか意味のない操作（子の追加など）をインターフェースに載せると型安全性が下がる',
    '深いツリーで再帰が深くなるとスタックオーバーフローのリスク',
    '単純な一覧管理に使うと過剰設計',
  ],
  antipattern: `
    <p>コンテナのみが持つべき操作（Add・Remove）を基底インターフェースに入れると、
    葉ノードに「実装できない操作」が生まれます。
    アクセスを型チェックで分岐させるくらいなら、最初から Composite を使わない方がマシです。</p>`,
  related: ['decorator', 'visitor', 'iterator', 'component'],
  quiz: [
    {
      q: 'Composite パターンの本質的な特徴はどれですか？',
      options: [
        '葉とコンテナに同じインターフェースを持たせ、再帰的に操作を委譲する',
        '子クラスを動的にインスタンス化するファクトリを提供する',
        'オブジェクトの状態変化をすべての購読者に通知する',
        'アルゴリズムの各ステップを個別に差し替えられるようにする',
      ],
      answer: 0,
      explanation: '葉（個）とコンテナ（グループ）に共通インターフェースを持たせ、コンテナが子に再帰的に処理を委譲するのが Composite の本質です。',
    },
    {
      q: 'Unity の Transform 階層は Composite パターンですか？',
      options: [
        'いいえ。Transform は Singleton パターンである',
        'はい。親 Transform はその子 Transform を再帰的に管理する',
        'いいえ。Transform は Observer パターンを使っている',
        'はい。ただし葉ノードのみで構成されている',
      ],
      answer: 1,
      explanation: 'Unity の Transform は親が子を持ち、SetParent で階層化できます。これはまさに Composite パターンの実装例です。',
    },
  ],
},

// ─────────────────────────────────────────────
'decorator': {
  name: 'Decorator',
  nameJa: 'デコレーター',
  category: 'structural',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['ラッパー', '動的拡張', 'バフ', 'アビリティ', '継承代替'],
  summary: 'オブジェクトを「ラッパー」でくるんで機能を動的に付加する。クラスを変更せず、継承を使わずに振る舞いを重ね掛けできる。バフ・装備・エフェクト合成に最適。',

  problem: `
    <p>キャラクターに「炎属性付加」「ダメージ2倍」「吸血」などのバフを自由に組み合わせて
    掛けたい場合、継承で表現すると組み合わせ爆発が起きます。</p>
    <pre><code>class Sword { }
class FlameSword      : Sword { }
class DoubleSword     : Sword { }
class FlameDoubleSword : Sword { }  // 爆発！</code></pre>`,

  solution: `
    <p>各バフを「同じインターフェースを持つラッパー」として実装し、
    コンストラクタに本体を渡してネストします。
    呼び出し側から見ると、何重にラップされていても同じ <code>IWeapon</code> です。</p>`,

  diagram: `classDiagram
    class IWeapon {
      <<interface>>
      +GetDamage() float
      +GetName() string
    }
    class Sword {
      +GetDamage() float
      +GetName() string
    }
    class WeaponDecorator {
      <<abstract>>
      -wrapped : IWeapon
      +GetDamage() float
      +GetName() string
    }
    class FlameDecorator {
      -bonus : float
      +GetDamage() float
      +GetName() string
    }
    class DoubleStrikeDecorator {
      +GetDamage() float
      +GetName() string
    }
    class LifestealDecorator {
      +GetDamage() float
      +GetLifesteal() float
    }
    IWeapon <|.. Sword : implements
    IWeapon <|.. WeaponDecorator : implements
    WeaponDecorator o-- IWeapon : wraps
    WeaponDecorator <|-- FlameDecorator : extends
    WeaponDecorator <|-- DoubleStrikeDecorator : extends
    WeaponDecorator <|-- LifestealDecorator : extends`,

  csharpCode: `// ── コンポーネントインターフェース ──────────────────────
public interface IWeapon
{
    float GetDamage();
    string GetName();
}

// ── 具体コンポーネント（Leaf）───────────────────────────
public class Sword : IWeapon
{
    public float  GetDamage() => 10f;
    public string GetName()   => "Sword";
}

// ── デコレーター基底 ─────────────────────────────────────
public abstract class WeaponDecorator : IWeapon
{
    protected readonly IWeapon _wrapped;
    protected WeaponDecorator(IWeapon weapon) => _wrapped = weapon;

    public virtual float  GetDamage() => _wrapped.GetDamage();
    public virtual string GetName()   => _wrapped.GetName();
}

// ── 具体デコレーター：炎属性 ─────────────────────────────
public class FlameDecorator : WeaponDecorator
{
    private readonly float _bonus;
    public FlameDecorator(IWeapon weapon, float bonus = 5f)
        : base(weapon) => _bonus = bonus;

    public override float  GetDamage() => base.GetDamage() + _bonus;
    public override string GetName()   => base.GetName() + " [Flame]";
}

// ── 具体デコレーター：ダメージ2倍 ───────────────────────
public class DoubleStrikeDecorator : WeaponDecorator
{
    public DoubleStrikeDecorator(IWeapon weapon) : base(weapon) { }

    public override float  GetDamage() => base.GetDamage() * 2f;
    public override string GetName()   => base.GetName() + " [×2]";
}

// ── 具体デコレーター：吸血 ──────────────────────────────
public class LifestealDecorator : WeaponDecorator
{
    public LifestealDecorator(IWeapon weapon) : base(weapon) { }

    public override float  GetDamage() => base.GetDamage();
    public override string GetName()   => base.GetName() + " [吸血]";

    public float GetLifesteal() => base.GetDamage() * 0.2f;  // 20% 吸血
}

// ── 使用例：動的に重ね掛け ──────────────────────────────
IWeapon sword = new Sword();
Console.WriteLine($"{sword.GetName()} : {sword.GetDamage()} dmg");
// Sword : 10 dmg

IWeapon flamed = new FlameDecorator(sword);
Console.WriteLine($"{flamed.GetName()} : {flamed.GetDamage()} dmg");
// Sword [Flame] : 15 dmg

IWeapon ultimate = new DoubleStrikeDecorator(new FlameDecorator(new Sword()));
Console.WriteLine($"{ultimate.GetName()} : {ultimate.GetDamage()} dmg");
// Sword [Flame] [×2] : 30 dmg`,

  unityCode: `// Unity での Decorator 活用例：スキル・ステータスへのバフ重ね掛け

using System.Collections.Generic;
using UnityEngine;

public interface IAttack
{
    float Execute(GameObject target);
}

public class BasicAttack : IAttack
{
    public float Execute(GameObject target)
    {
        Debug.Log($"通常攻撃 → {target.name}");
        return 10f;
    }
}

// ── バフデコレーター基底 ──────────────────────────────────
public abstract class AttackDecorator : IAttack
{
    protected readonly IAttack _inner;
    protected AttackDecorator(IAttack inner) => _inner = inner;
    public abstract float Execute(GameObject target);
}

// ── 属性付加 ─────────────────────────────────────────────
public class ElementalBuff : AttackDecorator
{
    private readonly string _element;
    private readonly float  _bonusPct;

    public ElementalBuff(IAttack inner, string element, float bonusPct)
        : base(inner) { _element = element; _bonusPct = bonusPct; }

    public override float Execute(GameObject target)
    {
        float dmg = _inner.Execute(target);
        float bonus = dmg * _bonusPct;
        Debug.Log($"  + {_element}属性 +{bonus:F1}");
        return dmg + bonus;
    }
}

// ── クリティカル ─────────────────────────────────────────
public class CriticalHit : AttackDecorator
{
    public CriticalHit(IAttack inner) : base(inner) { }

    public override float Execute(GameObject target)
    {
        float dmg = _inner.Execute(target) * 2f;
        Debug.Log($"  CRITICAL! ×2 → {dmg}");
        return dmg;
    }
}

// ── 使用例 ───────────────────────────────────────────────
public class BattleTest : MonoBehaviour
{
    void Start()
    {
        var enemy = new GameObject("Slime");

        // 炎属性 + クリティカルを重ね掛け
        IAttack attack = new CriticalHit(
                           new ElementalBuff(
                             new BasicAttack(), "炎", 0.5f));

        float damage = attack.Execute(enemy);
        Debug.Log($"最終ダメージ: {damage}");  // 通常10 + 炎5 = 15 → クリ ×2 = 30
    }
}`,

  pros: [
    '継承を使わず動的に機能を追加・除去できる',
    '単一責任の原則：各デコレーターは1つの責務だけを持つ',
    'バフの組み合わせが自由自在で、クラス数が線形に増えるだけ',
  ],
  cons: [
    '多重ラップで構造が複雑になりデバッグしにくい',
    '特定の具体型に依存するコードとの相性が悪い（キャストが必要になる）',
    '順番依存の場合（A→B と B→A で結果が変わる）は設計に注意が必要',
  ],
  antipattern: `
    <p>デコレーターをネストしすぎると「どこで何が起きているか」が追えなくなります。
    4〜5層を超えるようなら、<strong>バフリスト＋合算計算</strong>のようなデータ駆動アプローチが
    有効です（例: RPGのステータス計算）。順番依存が強い場合は Chain of Responsibility を検討してください。</p>`,
  related: ['composite', 'strategy', 'chain-of-responsibility'],
  quiz: [
    {
      q: 'Decorator パターンが継承より優れている点はどれですか？',
      options: [
        'メモリ使用量が減る',
        '実行時に動的に機能を追加・除去でき、組み合わせが自由',
        'コードの行数が減る',
        '型安全性が高くなる',
      ],
      answer: 1,
      explanation: '継承は静的（コンパイル時）ですが Decorator は実行時に任意のラッパーを重ねられます。組み合わせ数がクラス数の積ではなく和で済む点が最大の利点です。',
    },
  ],
},

// ─────────────────────────────────────────────
'facade': {
  name: 'Facade',
  nameJa: 'ファサード',
  category: 'structural',
  difficulty: 1,
  gameFrequency: 3,
  tags: ['シンプル化', 'サブシステム', 'API設計', 'ゲームマネージャー'],
  summary: '複数のサブシステムへのアクセスを、シンプルな単一インターフェースで覆い隠す。GameManager や AudioManager など「窓口を一本化する」どこのゲームにも登場するパターン。',

  problem: `
    <p>ゲームの「サウンド再生」ひとつとっても、実際は多くのサブシステムが絡みます。</p>
    <pre><code>// Facade なし：呼び出し元が複雑な手順を知っている
var clip = resourceLoader.Load("shoot");
var source = audioPool.GetFreeSource();
source.clip = clip;
source.volume = volumeManager.GetSFXVolume();
mixer.ApplySettings(source);
source.Play();</code></pre>
    <p>すべての呼び出し箇所で同じ手順を書くことになり、変更に弱くなります。</p>`,

  solution: `
    <p>複雑な手順を <code>AudioFacade.Play("shoot")</code> のような
    シンプルなメソッドにまとめます。
    サブシステムの変更は Facade 内部だけに閉じ込められます。</p>`,

  diagram: `classDiagram
    class Client {
      +someGameLogic()
    }
    class AudioFacade {
      +Play(clipName)
      +SetSFXVolume(vol)
      +StopAll()
    }
    class ResourceLoader {
      +Load(name) string
    }
    class AudioPool {
      +GetFreeSource() int
    }
    class VolumeManager {
      +SFX : float
      +BGM : float
      +SetSFX(vol)
    }
    class AudioMixer {
      +Apply(sourceId, volume)
    }
    Client --> AudioFacade : simple call
    AudioFacade --> ResourceLoader
    AudioFacade --> AudioPool
    AudioFacade --> VolumeManager
    AudioFacade --> AudioMixer`,

  csharpCode: `// ── サブシステム群（それぞれ複雑な内部を持つ）──────────
public class ResourceLoader
{
    public string Load(string name)
    {
        Console.WriteLine($"  [Loader] '{name}' をロード");
        return $"clip:{name}";
    }
}

public class AudioPool
{
    private int _nextId = 1;
    public int GetFreeSource()
    {
        Console.WriteLine($"  [Pool] ソースID {_nextId} を確保");
        return _nextId++;
    }
}

public class VolumeManager
{
    public float SFX { get; private set; } = 0.8f;
    public float BGM { get; private set; } = 0.5f;
    public void SetSFX(float v) { SFX = v; Console.WriteLine($"  [Volume] SFX = {v}"); }
}

public class AudioMixer
{
    public void Apply(int sourceId, float volume)
        => Console.WriteLine($"  [Mixer] ソース{sourceId} に vol={volume} 適用");
}

// ── Facade：「音を鳴らす」という操作をひとつにまとめる ──
public class AudioFacade
{
    private readonly ResourceLoader _loader  = new();
    private readonly AudioPool      _pool    = new();
    private readonly VolumeManager  _volume  = new();
    private readonly AudioMixer     _mixer   = new();

    public void Play(string clipName)
    {
        Console.WriteLine($"[AudioFacade] Play: {clipName}");
        var clip   = _loader.Load(clipName);
        int src    = _pool.GetFreeSource();
        _mixer.Apply(src, _volume.SFX);
        Console.WriteLine($"  → 再生: {clip} (src={src})");
    }

    public void SetSFXVolume(float vol) => _volume.SetSFX(vol);

    public void StopAll() => Console.WriteLine("[AudioFacade] 全停止");
}

// ── 呼び出し側：Facade だけを知ればよい ─────────────────
var audio = new AudioFacade();
audio.Play("shoot");
// [AudioFacade] Play: shoot
//   [Loader] 'shoot' をロード
//   [Pool] ソースID 1 を確保
//   [Mixer] ソース1 に vol=0.8 適用
//   → 再生: clip:shoot (src=1)

audio.Play("explosion");
audio.SetSFXVolume(0.5f);`,

  unityCode: `// Unity での Facade 活用例：ゲームの初期化・遷移を一本化する

using UnityEngine;
using UnityEngine.SceneManagement;

// ── サブシステム（各マネージャー）───────────────────────
public class SaveSystem
{
    public void SaveProgress(string key, int value)
        => PlayerPrefs.SetInt(key, value);
    public int LoadProgress(string key, int def = 0)
        => PlayerPrefs.GetInt(key, def);
}

public class Analytics
{
    public void Track(string eventName)
        => Debug.Log($"[Analytics] {eventName}");
}

public class FadeScreen
{
    public System.Collections.IEnumerator FadeOut(float dur)
    {
        yield return new UnityEngine.WaitForSeconds(dur);
        Debug.Log("[Fade] FadeOut 完了");
    }
}

// ── GameFacade：ゲーム操作の窓口 ─────────────────────────
public class GameFacade : MonoBehaviour
{
    private SaveSystem _save       = new();
    private Analytics  _analytics  = new();
    private FadeScreen _fade       = new();

    // ゲームオーバー処理：複数サブシステムを順番に呼ぶだけ
    public void GameOver(int score)
    {
        _save.SaveProgress("high_score", score);
        _analytics.Track("game_over");
        StartCoroutine(LoadMenuAfterFade());
    }

    private System.Collections.IEnumerator LoadMenuAfterFade()
    {
        yield return StartCoroutine(_fade.FadeOut(0.5f));
        SceneManager.LoadScene("MainMenu");
    }

    // ゲーム開始処理
    public void StartGame(string sceneName)
    {
        _analytics.Track("game_start");
        SceneManager.LoadScene(sceneName);
    }
}`,

  pros: [
    '呼び出し側が複雑なサブシステムを知らずに済む（情報隠蔽）',
    'サブシステムの変更影響が Facade 内に閉じ込められる',
    'コードの可読性と再利用性が大幅に上がる',
    'ゲームでは GameManager・AudioManager・UIManager が典型例',
  ],
  cons: [
    'Facade 自体が「神クラス」化するリスクがある',
    'Facade を通さないとサブシステムを細かく制御できない',
    '完全な隠蔽は難しく、特殊ケースで Facade を破って直接呼ぶことも出てくる',
  ],
  antipattern: `
    <p>Facade がすべての機能を抱え込み、1000行を超える「神クラス」になるのはアンチパターンです。
    Facade は「頻繁に使う操作の窓口」に限定し、細かい制御はサブシステムを直接使えるように
    しておくのが健全な設計です。</p>`,
  related: ['adapter', 'mediator', 'service-locator'],
  quiz: [
    {
      q: 'Facade パターンの主な目的はどれですか？',
      options: [
        '同じオブジェクトを複数作成せずに共有する',
        '複数のサブシステムをシンプルな単一インターフェースで覆う',
        'オブジェクトの状態変化を他に通知する',
        'アルゴリズムをステップに分解して差し替えられるようにする',
      ],
      answer: 1,
      explanation: 'Facade は「窓口を一本化して複雑さを隠す」パターンです。GameManager や AudioManager がその典型例です。',
    },
    {
      q: 'Facade のアンチパターンとして正しいものはどれですか？',
      options: [
        'Facade を複数のクラスに分割する',
        'Facade が神クラス化しすべてのロジックを抱え込む',
        'サブシステムを直接利用できるようにしておく',
        'Facade に対してインターフェースを定義する',
      ],
      answer: 1,
      explanation: 'Facade は「窓口」であって「全機能の実装場所」ではありません。肥大化したらサブシステムへの責務分散を検討しましょう。',
    },
  ],
},

// ─────────────────────────────────────────────
'flyweight': {
  name: 'Flyweight',
  nameJa: 'フライウェイト',
  category: 'structural',
  difficulty: 3,
  gameFrequency: 3,
  tags: ['メモリ最適化', '共有', '大量オブジェクト', 'インスタンス化コスト', 'キャッシュ'],
  summary: '多数のオブジェクトに共通する状態（内部状態）を共有することでメモリを節約する。弾丸・木・パーティクルなど同じ外見の大量オブジェクトに必須の最適化パターン。',

  problem: `
    <p>10,000発の弾丸を管理するとき、各弾丸がテクスチャ・メッシュ・エフェクト設定などを
    個別に持つと膨大なメモリを消費します。</p>
    <pre><code>// 毎回コピーされる例（1オブジェクト = 数MB）
class Bullet {
    Texture2D texture;    // 重い！全弾丸で共有すべき
    Mesh mesh;            // 重い！全弾丸で共有すべき
    float speed;          // 軽い（個別で OK）
    Vector3 position;     // 個別（外部状態）
}</code></pre>`,

  solution: `
    <p>「変わらない共有データ（内部状態 = Intrinsic）」と「個々に異なるデータ（外部状態 = Extrinsic）」を分離します。
    <code>BulletType</code>（テクスチャ・速度・ダメージ）を共有し、位置・向きは外部に持ちます。</p>`,

  diagram: `classDiagram
    class BulletTypeRegistry {
      -cache : Dictionary~string, BulletType~
      +GetOrCreate(key, speed, damage) BulletType
      +CachedCount : int
    }
    class BulletType {
      <<Flyweight - 内部状態>>
      +TextureName : string
      +Speed : float
      +Damage : int
      +Draw(pos, dir)
    }
    class Bullet {
      <<Context - 外部状態>>
      +Position : Vector2
      +Direction : Vector2
      -type : BulletType
      +Update(dt)
      +Draw()
    }
    BulletTypeRegistry --> BulletType : creates or reuses
    Bullet --> BulletType : shared reference`,

  csharpCode: `// ── Flyweight（内部状態：共有される不変データ）──────────
public class BulletType
{
    public string TextureName { get; }
    public float  Speed       { get; }
    public int    Damage      { get; }

    public BulletType(string texture, float speed, int damage)
    {
        TextureName = texture;
        Speed       = speed;
        Damage      = damage;
        Console.WriteLine($"  [BulletType] 作成: {texture}");  // 実際は1回しか呼ばれない
    }

    public void Draw((float x, float y) pos, (float dx, float dy) dir)
        => Console.WriteLine($"  Draw [{TextureName}] pos=({pos.x:F0},{pos.y:F0}) dir=({dir.dx:F1},{dir.dy:F1})");
}

// ── Flyweight Factory：共有インスタンスを管理 ──────────────
public class BulletTypeRegistry
{
    private readonly Dictionary<string, BulletType> _cache = new();

    public BulletType GetOrCreate(string key, float speed, int damage)
    {
        if (!_cache.TryGetValue(key, out var type))
        {
            type = new BulletType(key, speed, damage);
            _cache[key] = type;
        }
        return type;
    }

    public int CachedCount => _cache.Count;
}

// ── Context（外部状態：個々に異なるデータ）────────────────
public class Bullet
{
    public (float x, float y) Position;
    public (float dx, float dy) Direction;
    private readonly BulletType _type;  // 共有参照

    public Bullet(BulletType type, (float x, float y) pos, (float dx, float dy) dir)
    {
        _type     = type;
        Position  = pos;
        Direction = dir;
    }

    public void Update(float dt)
    {
        Position = (Position.x + Direction.dx * _type.Speed * dt,
                    Position.y + Direction.dy * _type.Speed * dt);
    }

    public void Draw() => _type.Draw(Position, Direction);
}

// ── 使用例：10,000発でも BulletType は3種類しか作られない ──
var registry = new BulletTypeRegistry();

// BulletType は3種類だけ作成される
var normalType = registry.GetOrCreate("bullet_normal", 300f, 10);
var fireType   = registry.GetOrCreate("bullet_fire",   200f, 20);
var _          = registry.GetOrCreate("bullet_normal", 300f, 10); // キャッシュから返る

Console.WriteLine($"BulletType キャッシュ数: {registry.CachedCount}"); // 2

// 弾丸は1万発でも、BulletType の参照は共有
var bullets = new List<Bullet>();
var rng = new Random(42);
for (int i = 0; i < 10000; i++)
{
    var type = (i % 3 == 0) ? fireType : normalType;
    bullets.Add(new Bullet(type,
        ((float)rng.NextDouble() * 800, (float)rng.NextDouble() * 600),
        ((float)(rng.NextDouble() * 2 - 1), 1f)));
}

Console.WriteLine($"弾丸数: {bullets.Count}, BulletType 種類: {registry.CachedCount}");
// 弾丸数: 10000, BulletType 種類: 2`,

  unityCode: `// Unity での Flyweight：Mesh / Material を共有してドローコールを削減

using System.Collections.Generic;
using UnityEngine;

// ── 共有データ（Flyweight）─────────────────────────────────
[CreateAssetMenu(fileName = "EnemyType", menuName = "Game/EnemyType")]
public class EnemyTypeSO : ScriptableObject
{
    public string TypeName;
    public Mesh   SharedMesh;
    public Material SharedMaterial;
    public float  MaxHp;
    public float  MoveSpeed;
    // テクスチャ・メッシュ・パラメータを全インスタンスで共有
}

// ── 外部状態（Context）────────────────────────────────────
public class EnemyInstance : MonoBehaviour
{
    [HideInInspector] public EnemyTypeSO Type;  // 共有参照
    public float CurrentHp;                     // 個別状態
    public Vector3 Velocity;                    // 個別状態

    public void Init(EnemyTypeSO type)
    {
        Type = type;
        CurrentHp = type.MaxHp;
        GetComponent<MeshFilter>().sharedMesh = type.SharedMesh;
        GetComponent<MeshRenderer>().sharedMaterial = type.SharedMaterial;
        // sharedMesh / sharedMaterial → GPU上でも共有 = ドローコール削減
    }

    void Update()
    {
        transform.position += Velocity * Type.MoveSpeed * Time.deltaTime;
    }
}

// ── EnemySpawner ───────────────────────────────────────────
public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private EnemyTypeSO[] _types;
    [SerializeField] private GameObject    _prefab;

    public void Spawn(int typeIndex, Vector3 pos)
    {
        var go  = Instantiate(_prefab, pos, Quaternion.identity);
        var enemy = go.GetComponent<EnemyInstance>();
        enemy.Init(_types[typeIndex]);  // 型データは共有
    }
}`,

  pros: [
    '大量の同種オブジェクトのメモリ使用量を劇的に削減できる',
    'ScriptableObject と相性が良く、Unity で自然に使えるパターン',
    'GPU Instancing / DrawMeshInstanced と組み合わせるとさらに高速化できる',
  ],
  cons: [
    '内部状態と外部状態の分離設計が複雑になることがある',
    '外部状態を毎回引数で渡す必要があり、コード量が増える場合がある',
    'マルチスレッド環境での共有状態の変更には注意が必要',
  ],
  antipattern: `
    <p>Flyweight は「大量かつ同種のオブジェクト」があって初めて効果があります。
    数十個程度であれば通常のオブジェクト管理で十分です。
    また、共有している BulletType を誤って変更してしまうと全インスタンスに影響が出ます。
    共有オブジェクトは必ず <strong>不変（readonly / sealed）</strong>にしてください。</p>`,
  related: ['object-pool', 'prototype', 'data-locality'],
  quiz: [
    {
      q: 'Flyweight パターンで「内部状態（Intrinsic）」に分類すべきデータはどれですか？',
      options: [
        '弾丸の現在位置',
        '弾丸の飛翔方向',
        '弾丸の種類ごとのテクスチャ・速度',
        '弾丸が最後にヒットした敵',
      ],
      answer: 2,
      explanation: '内部状態は「全インスタンスで共有できる不変データ」です。テクスチャや速度は弾丸の種類ごとに固定なので共有できます。位置・方向は弾丸ごとに異なるので外部状態です。',
    },
    {
      q: 'Unity の ScriptableObject と Flyweight の関係として正しいものはどれですか？',
      options: [
        '無関係。ScriptableObject は MonoBehaviour の代替品にすぎない',
        'ScriptableObject は共有の不変データを保持するのに適しており Flyweight の実装として使える',
        'ScriptableObject は Singleton パターンの実装のみに使う',
        'ScriptableObject を使うと Flyweight より遅くなる',
      ],
      answer: 1,
      explanation: 'ScriptableObject はアセットとして共有参照でき、sharedMesh / sharedMaterial のように GPU リソースも共有できるため、Flyweight の内部状態の格納先として非常に適しています。',
    },
  ],
},

// ─────────────────────────────────────────────
'proxy': {
  name: 'Proxy',
  nameJa: 'プロキシ',
  category: 'structural',
  difficulty: 2,
  gameFrequency: 2,
  tags: ['遅延ロード', 'キャッシュ', 'アクセス制御', 'ロギング', 'ネットワーク'],
  summary: '本物のオブジェクトと同じインターフェースを持つ代理人を挟み、アクセス制御・遅延初期化・キャッシュ・ロギングを透過的に追加する。',

  problem: `
    <p>巨大なリソース（テクスチャ・音声・AIモジュール）を起動直後から全部メモリに載せると
    ロード時間が増え、使われないリソースが無駄になります。
    また、ネットワーク越しのオブジェクト操作にローカルと同じコードを使いたい場面もあります。</p>`,

  solution: `
    <p>本物のオブジェクトと<strong>同じインターフェース</strong>を持つ Proxy を挟み、
    最初にアクセスされたときだけ本物を生成（Lazy Init）します。
    ロギングやアクセス制御もここに透過的に追加できます。</p>`,

  diagram: `classDiagram
    class Client {
      +useTexture()
    }
    class ITexture {
      <<interface>>
      +Width : int
      +Height : int
      +GetPixels() string[]
    }
    class RealTexture {
      +Width : int
      +Height : int
      +GetPixels() string[]
    }
    class LazyTextureProxy {
      -real : RealTexture
      +Width : int
      +Height : int
      +GetPixels() string[]
    }
    class LoggingTextureProxy {
      -inner : ITexture
      -accessCount : int
      +GetPixels() string[]
    }
    Client --> ITexture : uses
    ITexture <|.. RealTexture : implements
    ITexture <|.. LazyTextureProxy : implements
    ITexture <|.. LoggingTextureProxy : implements
    LazyTextureProxy --> RealTexture : lazy init on first access
    LoggingTextureProxy --> ITexture : wraps any ITexture`,

  csharpCode: `// ── 共通インターフェース ─────────────────────────────────
public interface ITexture
{
    int Width   { get; }
    int Height  { get; }
    string[] GetPixels();  // 重い操作の代表として
}

// ── 本物のオブジェクト（重い・遅い）────────────────────────
public class RealTexture : ITexture
{
    public int Width  { get; }
    public int Height { get; }
    private readonly string[] _pixels;

    public RealTexture(string fileName, int w, int h)
    {
        Width = w; Height = h;
        Console.WriteLine($"  [RealTexture] '{fileName}' をディスクからロード中… (重い処理)");
        System.Threading.Thread.Sleep(100);  // ロードの模擬
        _pixels = new string[w * h];
        Array.Fill(_pixels, "#FFFFFF");
        Console.WriteLine($"  [RealTexture] ロード完了 {w}x{h}");
    }

    public string[] GetPixels() => _pixels;
}

// ── Proxy 1: 遅延初期化（Lazy Proxy）────────────────────────
public class LazyTextureProxy : ITexture
{
    private readonly string _fileName;
    private readonly int    _w, _h;
    private RealTexture?    _real;

    public int Width  => _w;
    public int Height => _h;

    public LazyTextureProxy(string fileName, int w, int h)
    {
        _fileName = fileName; _w = w; _h = h;
        Console.WriteLine($"  [LazyProxy] '{fileName}' の Proxy 作成（まだロードしない）");
    }

    public string[] GetPixels()
    {
        _real ??= new RealTexture(_fileName, _w, _h);  // 初回のみロード
        return _real.GetPixels();
    }
}

// ── Proxy 2: ロギング Proxy ──────────────────────────────────
public class LoggingTextureProxy : ITexture
{
    private readonly ITexture _inner;
    private int _accessCount;

    public int Width  => _inner.Width;
    public int Height => _inner.Height;

    public LoggingTextureProxy(ITexture inner) => _inner = inner;

    public string[] GetPixels()
    {
        _accessCount++;
        Console.WriteLine($"  [LogProxy] GetPixels 呼び出し #{_accessCount}");
        var result = _inner.GetPixels();
        Console.WriteLine($"  [LogProxy] 返却: {result.Length} ピクセル");
        return result;
    }
}

// ── 使用例 ────────────────────────────────────────────────────
Console.WriteLine("=== Proxy 生成（ロードなし）===");
ITexture tex = new LazyTextureProxy("background.png", 1920, 1080);

Console.WriteLine("\n=== 初回アクセス（ここでロード）===");
_ = tex.GetPixels();

Console.WriteLine("\n=== 2回目（キャッシュ済み）===");
_ = tex.GetPixels();

Console.WriteLine("\n=== ロギング Proxy でラップ ===");
ITexture logged = new LoggingTextureProxy(tex);
_ = logged.GetPixels();`,

  unityCode: `// Unity での Proxy 活用例：
// リモートプレイヤーをローカルと同じインターフェースで操作する（Remote Proxy）

using UnityEngine;

// ── 共通インターフェース ──────────────────────────────────
public interface IPlayer
{
    string PlayerName { get; }
    void MoveTo(Vector3 position);
    void TakeDamage(int amount);
}

// ── ローカルプレイヤー（本物）────────────────────────────
public class LocalPlayer : MonoBehaviour, IPlayer
{
    public string PlayerName => "LocalPlayer";

    public void MoveTo(Vector3 position)
    {
        transform.position = position;
        Debug.Log($"[Local] {PlayerName} → {position}");
    }

    public void TakeDamage(int amount)
    {
        Debug.Log($"[Local] {PlayerName} が {amount} ダメージ");
        // HP 計算など
    }
}

// ── リモートプレイヤー Proxy（ネットワーク越しに操作）──────
public class RemotePlayerProxy : IPlayer
{
    public string PlayerName { get; }
    private Vector3 _lastPos;

    // 実際は NetworkManager 経由でメッセージを送る
    public RemotePlayerProxy(string name) => PlayerName = name;

    public void MoveTo(Vector3 position)
    {
        _lastPos = position;
        Debug.Log($"[Proxy] {PlayerName} の移動をサーバーへ送信: {position}");
        // NetworkManager.Send(new MovePacket { PlayerName, position });
    }

    public void TakeDamage(int amount)
    {
        Debug.Log($"[Proxy] {PlayerName} のダメージをサーバーへ通知: {amount}");
        // NetworkManager.Send(new DamagePacket { PlayerName, amount });
    }
}

// ── ゲームロジック：ローカルもリモートも同じ型で扱う ──────
public class GameLogic : MonoBehaviour
{
    private IPlayer[] _allPlayers;

    void Start()
    {
        _allPlayers = new IPlayer[]
        {
            FindObjectOfType<LocalPlayer>(),         // 本物
            new RemotePlayerProxy("RemotePlayer_A"), // Proxy
            new RemotePlayerProxy("RemotePlayer_B"), // Proxy
        };
    }

    public void DamageAll(int amount)
    {
        foreach (var p in _allPlayers)
            p.TakeDamage(amount);  // ローカルもリモートも同じ呼び出し
    }
}`,

  pros: [
    '遅延初期化でロード時間を短縮できる',
    'クライアントコードを変えずにアクセス制御・ロギング・キャッシュを追加できる',
    'Remote Proxy でネットワーク越しのオブジェクトをローカルのように扱える',
  ],
  cons: [
    'リクエストが Proxy を経由するため僅かなオーバーヘッドがある',
    '多重 Proxy（遅延 + ロギング + キャッシュ）は Decorator との使い分けが曖昧になる',
    '本物オブジェクトの生成タイミングが分かりにくくなる',
  ],
  antipattern: `
    <p>すべてのクラスに「念のため Proxy」を挟むのはやり過ぎです。
    実際に遅延初期化・アクセス制御・リモートアクセスが必要な場合に限定しましょう。
    単なる機能追加なら <strong>Decorator</strong>、インターフェース変換なら <strong>Adapter</strong> を使う方が意図が明確です。</p>`,
  related: ['adapter', 'decorator', 'facade'],
  quiz: [
    {
      q: 'Lazy Proxy が解決する問題は何ですか？',
      options: [
        '複数のサブシステムを単一のインターフェースにまとめる',
        '重いオブジェクトの生成を、実際に使われるまで遅らせる',
        'オブジェクトに動的に機能を追加する',
        '互換性のないインターフェースを変換する',
      ],
      answer: 1,
      explanation: 'Lazy Proxy は最初のアクセス時だけ本物を生成することで、不要なロードを避けて起動時間を短縮します。',
    },
    {
      q: 'Proxy と Decorator の主な違いはどれですか？',
      options: [
        'Proxy はパフォーマンス向上専用で Decorator は機能追加専用',
        'Proxy はアクセス制御・遅延初期化が目的で Decorator は振る舞いの追加が目的',
        'Proxy はインターフェースを変更するが Decorator は変更しない',
        '違いはなく、同じパターンの別名である',
      ],
      answer: 1,
      explanation: 'Proxy は本物オブジェクトへのアクセスをコントロールすることが目的。Decorator は機能（振る舞い）を動的に追加することが目的です。構造は似ていますが意図が異なります。',
    },
  ],
},

}; // window.PATTERNS 閉じ括弧




