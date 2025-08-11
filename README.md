# 🎲 DDD × イベント駆動アーキテクチャ 学習プロジェクト

TypeScriptでドメイン駆動設計（DDD）とイベント駆動アーキテクチャを実践的に学ぶために作成したガチャシステムです。

## 📚 学習目標

このプロジェクトを通じて以下の技術・設計手法を習得することを目標としました：

- **🏗️ ドメイン駆動設計（DDD）**の実践的な理解
- **⚡ イベント駆動アーキテクチャ**の設計と実装
- **🔒 TypeScript**による堅牢な型システムの活用
- **🧩 SOLID原則**に基づく保守性の高い設計
- **🎯 実際のビジネス要件**を満たすシステム設計

## 🛠️ 使用技術

- **言語**: TypeScript
- **実行環境**: Node.js
- **設計パターン**: DDD, イベント駆動, Repository, Factory
- **アーキテクチャ**: レイヤードアーキテクチャ

## 📖 学習の進め方

### 段階1: DDD基礎理解 ✅
- **値オブジェクト（Value Object）**の実装
- **エンティティ（Entity）**の設計
- **ドメインイベント**の概念理解

### 段階2: イベント駆動システム ✅
- **EventDispatcher**の実装
- **EventHandler**パターンの習得
- **非同期処理**と**エラーハンドリング**

### 段階3: 実践的システム設計 ✅
- **ビジネスロジック**の適切な配置
- **レイヤー間の責務分離**
- **拡張性**を考慮した設計

## 🎯 実装した機能

### 📦 ドメイン層
- **Rarity**: レアリティを表現する値オブジェクト
- **Player**: プレイヤー情報を管理するエンティティ  
- **GachaItem**: ガチャアイテムを表現するエンティティ
- **ドメインイベント**: ビジネス上重要な出来事をモデル化

### 🔄 アプリケーション層
- **EventHandler**: 各イベントに対する具体的な処理
- **GachaService**: ガチャ実行のビジネスロジック

### 🏗️ インフラ層
- **EventDispatcher**: イベントの配信と処理を管理

## 📈 学習成果

### 💡 DDD（ドメイン駆動設計）で学んだこと

#### **値オブジェクト vs エンティティの違い**
```typescript
// 値オブジェクト: 値が同じなら同じオブジェクト
const ssr1 = Rarity.create('SSR');
const ssr2 = Rarity.create('SSR');
ssr1.equals(ssr2); // true

// エンティティ: IDが同じなら同じオブジェクト
const item1 = new GachaItem('sword_001', '剣A', ssr1);
const item2 = new GachaItem('sword_001', '剣B', ssr1); // 名前が違っても
item1.equals(item2); // true (IDが同じ)
```

#### **不変性の重要性**
```typescript
// 値オブジェクトは作成後変更不可
const rarity = Rarity.create('SSR');
// rarity.value = 'UR'; // ❌ できない（readonly）

// エンティティも重要な値は保護
class Player {
  private readonly _id: string;  // IDは変更不可
  private _currency: number;     // 通貨は変更可能
}
```

#### **ドメインイベントの価値**
- ビジネス上重要な出来事をコードで表現
- システム間の疎結合を実現
- 監査ログとしても機能

### ⚡ イベント駆動アーキテクチャで学んだこと

#### **疎結合設計の利点**
```typescript
// ❌ 密結合（修正時に複数箇所に影響）
class Player {
  addItem(item: GachaItem): void {
    this._inventory.push(item);
    notificationService.send(...);    // 直接依存
    analyticsService.track(...);      // 直接依存
    achievementService.check(...);    // 直接依存
  }
}

// ✅ 疎結合（イベント経由で分離）
class Player {
  addItem(item: GachaItem): void {
    this._inventory.push(item);
    this.addEvent(new ItemObtainedEvent(...)); // イベント発行のみ
  }
}
```

#### **拡張性の向上**
新機能追加時に既存コードを一切変更せずに対応可能：
```typescript
// 新しいハンドラーを追加するだけ
dispatcher.subscribe('ItemObtained', new SocialShareHandler());
dispatcher.subscribe('ItemObtained', new RecommendationHandler());
```

### 🔧 TypeScriptで学んだこと

#### **高度な型システムの活用**
```typescript
// ジェネリクスによる型安全性
interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// 型ガードによる安全な型変換
if (event instanceof ItemObtainedEvent) {
  // ここではeventの型が自動的にItemObtainedEventになる
  console.log(event.itemName);
}
```

#### **readonly配列による安全性**
```typescript
get inventory(): readonly GachaItem[] {
  return [...this._inventory]; // 防御的コピー
}
```

## 🔍 学習過程で直面した課題

### 1. **値オブジェクトの設計**
**課題**: レアリティをstringで表現するか、クラスで表現するか
**解決**: 値オブジェクトとして実装し、ビジネスルールをカプセル化

### 2. **イベントの粒度**
**課題**: どの程度の変更でイベントを発行すべきか
**解決**: ビジネス上意味のある変更のみをイベント化

### 3. **型安全性の確保**
**課題**: `readonly`配列と通常配列の型エラー
**解決**: 適切な型定義と防御的コピーで解決

### 4. **エラーハンドリング**
**課題**: 複数のイベントハンドラーでエラーが発生した場合の処理
**解決**: Promise.allと個別のtry-catchで適切に分離

## 📊 プロジェクト統計

### 実装したクラス数
- **値オブジェクト**: 1個（Rarity）
- **エンティティ**: 2個（Player, GachaItem）
- **ドメインイベント**: 3個（GachaExecuted, ItemObtained, CurrencySpent）
- **イベントハンドラー**: 3個
- **インフラコンポーネント**: 1個（EventDispatcher）

### コード行数（概算）
- **ドメイン層**: ~400行
- **アプリケーション層**: ~300行
- **インフラ層**: ~150行
- **テスト・デモ**: ~200行
- **合計**: ~1050行

## 🚀 動作確認

### クイックスタート
```bash
# 依存関係をインストール
npm install

# デモを実行
npx ts-node src/gacha-system-demo.ts
```

### テスト実行
```bash
# 各コンポーネントの動作確認
npx ts-node src/test-rarity.ts
npx ts-node src/test-item-event.ts
```