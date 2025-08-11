// src/gacha-system-demo.ts
// DDD × イベント駆動開発の完全なガチャシステムデモ

import { Player } from './domain/entities/Player';
import { GachaItem } from './domain/entities/GachaItem';
import { Rarity } from './domain/value-objects/Rarity';
import { EventDispatcher } from './infrastructure/events/EventDispatcher';
import { GachaExecutedHandler } from './application/handlers/GachaExecutedHandler';
import { ItemObtainedHandler } from './application/handlers/ItemObtainedHandler';
import { GachaExecutedEvent } from './domain/events/GachaExecutedEvent';
import { ItemObtainedEvent } from './domain/events/ItemObtainedEvent';
import { CurrencySpentEvent } from './domain/events/CurrencySpentEvent';

/**
 * シンプルなガチャマシンシミュレーター
 * 実際のプロダクションではより複雑な確率計算を行う
 */
class SimpleGachaMachine {
  private readonly gachaPool: Array<{
    id: string;
    name: string;
    rarity: Rarity;
    weight: number; // 重み（高いほど出やすい）
  }> = [];

  constructor() {
    this.initializeGachaPool();
  }

  /**
   * ガチャプールを初期化
   */
  private initializeGachaPool(): void {
    // ノーマル (50%)
    this.gachaPool.push(
      { id: 'potion_001', name: 'HP回復薬', rarity: Rarity.create('N'), weight: 25 },
      { id: 'bread_001', name: '硬いパン', rarity: Rarity.create('N'), weight: 25 }
    );

    // レア (30%)
    this.gachaPool.push(
      { id: 'sword_001', name: '鋼の剣', rarity: Rarity.create('R'), weight: 15 },
      { id: 'shield_001', name: '鉄の盾', rarity: Rarity.create('R'), weight: 15 }
    );

    // スーパーレア (15%)
    this.gachaPool.push(
      { id: 'bow_001', name: 'エルフの弓', rarity: Rarity.create('SR'), weight: 8 },
      { id: 'staff_001', name: '賢者の杖', rarity: Rarity.create('SR'), weight: 7 }
    );

    // スーパースペシャルレア (4%)
    this.gachaPool.push(
      { id: 'sword_002', name: 'エクスカリバー', rarity: Rarity.create('SSR'), weight: 4 }
    );

    // ウルトラレア (1%)
    this.gachaPool.push(
      { id: 'sword_999', name: '神々の剣', rarity: Rarity.create('UR'), weight: 1 }
    );
  }

  /**
   * ガチャを1回実行
   */
  draw(): GachaItem {
    const totalWeight = this.gachaPool.reduce((sum, item) => sum + item.weight, 0);
    const randomValue = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const poolItem of this.gachaPool) {
      currentWeight += poolItem.weight;
      if (randomValue <= currentWeight) {
        return new GachaItem(
          poolItem.id,
          poolItem.name,
          poolItem.rarity,
          this.generateDescription(poolItem.rarity)
        );
      }
    }
    
    // フォールバック（通常は到達しない）
    const fallback = this.gachaPool[0];
    return new GachaItem(fallback.id, fallback.name, fallback.rarity);
  }

  /**
   * アイテムの説明文を生成
   */
  private generateDescription(rarity: Rarity): string {
    switch (rarity.value) {
      case 'UR': return '神話級の力を秘めた伝説の武器。世界を変える力を持つ。';
      case 'SSR': return '英雄が愛用したとされる名器。卓越した性能を誇る。';
      case 'SR': return '熟練の職人が心血を注いで作り上げた逸品。';
      case 'R': return '品質の良い装備。冒険者に愛用されている。';
      case 'N': return '一般的なアイテム。基本的な用途に適している。';
      default: return '謎に包まれたアイテム。';
    }
  }

  /**
   * ガチャプールの情報を表示
   */
  showGachaRates(): void {
    console.log('🎰 ガチャ排出率:');
    const totalWeight = this.gachaPool.reduce((sum, item) => sum + item.weight, 0);
    
    this.gachaPool.forEach(item => {
      const rate = (item.weight / totalWeight * 100).toFixed(1);
      console.log(`  ${item.name} [${item.rarity.value}]: ${rate}%`);
    });
  }
}

/**
 * ガチャサービス
 * ガチャの実行とイベント発行を管理
 */
class GachaService {
  constructor(
    private gachaMachine: SimpleGachaMachine
  ) {}

  /**
   * 単発ガチャを実行
   */
  async executeSingleGacha(player: Player): Promise<GachaItem> {
    const gachaCost = 100;
    
    console.log(`\n🎯 ${player.playerName}が単発ガチャを実行します！`);
    
    // 1. コスト支払い
    if (!player.canAffordGacha(gachaCost)) {
      throw new Error(`残高不足です。必要: ${gachaCost}, 残高: ${player.gachaCurrency}`);
    }
    
    player.spendCurrency(gachaCost, 'gacha');
    
    // 2. ガチャ実行イベント発行
    const gachaEvent = new GachaExecutedEvent(player.id, gachaCost, 'single');
    player.addEvent(gachaEvent);
    
    // 3. アイテム抽選
    const drawnItem = this.gachaMachine.draw();
    
    // 4. アイテム追加とイベント発行
    const isFirstTime = !player.hasItem(drawnItem);
    
    if (!isFirstTime) {
      console.log(`⚠️ 重複アイテム「${drawnItem.name}」を獲得しました`);
      // 重複の場合は売却価格を還元
      const sellPrice = this.calculateSellPrice(drawnItem.rarity);
      player.addCurrency(sellPrice);
    } else {
      player.addItem(drawnItem);
    }
    
    // 5. アイテム獲得イベント発行
    const itemEvent = new ItemObtainedEvent(
      player.id,
      drawnItem.id,
      drawnItem.name,
      drawnItem.rarity.value,
      isFirstTime
    );
    player.addEvent(itemEvent);
    
    return drawnItem;
  }

  /**
   * 重複アイテムの売却価格を計算
   */
  private calculateSellPrice(rarity: Rarity): number {
    const priceMap = {
      'N': 10,
      'R': 50,
      'SR': 200,
      'SSR': 1000,
      'UR': 5000
    };
    return priceMap[rarity.value as keyof typeof priceMap] || 0;
  }
}

/**
 * メインデモ実行関数
 */
async function runGachaSystemDemo(): Promise<void> {
  console.log('🎮 === DDD × イベント駆動 ガチャシステムデモ開始 === 🎮\n');

  // 1. システム初期化
  const eventDispatcher = new EventDispatcher();
  const gachaMachine = new SimpleGachaMachine();
  const gachaService = new GachaService(gachaMachine);

  // 2. イベントハンドラー登録
  console.log('⚙️ イベントハンドラーを登録中...');
  eventDispatcher.subscribe('GachaExecuted', new GachaExecutedHandler());
  eventDispatcher.subscribe('ItemObtained', new ItemObtainedHandler());
  
  eventDispatcher.showRegisteredHandlers();

  // 3. ガチャ排出率表示
  gachaMachine.showGachaRates();

  // 4. プレイヤー作成
  const player = new Player('player_001', 'タロウ', 2000);
  console.log(`\n👤 プレイヤー作成: ${player}`);

  // 5. ガチャを複数回実行
  console.log('\n🎲 ガチャシミュレーション開始！\n');
  
  const results: GachaItem[] = [];
  
  for (let i = 1; i <= 5; i++) {
    try {
      console.log(`${'='.repeat(50)}`);
      console.log(`🎯 第${i}回ガチャ`);
      console.log(`${'='.repeat(50)}`);
      
      // ガチャ実行
      const result = await gachaService.executeSingleGacha(player);
      results.push(result);
      
      // イベント処理
      console.log('\n📨 イベント処理開始...');
      await eventDispatcher.dispatchEntityEvents(player);
      
      // プレイヤー状況表示
      console.log(`\n💰 ${player}`);
      console.log(`📦 インベントリ: ${player.inventory.length}アイテム`);
      
      // 少し間を空ける
      await sleep(1000);
      
    } catch (error) {
      console.error(`❌ ガチャ実行エラー:`, error);
      break;
    }
  }

  // 6. 最終結果表示
  console.log('\n' + '='.repeat(60));
  console.log('🏁 ガチャシミュレーション結果');
  console.log('='.repeat(60));
  
  console.log(`\n👤 最終プレイヤー状況: ${player}`);
  
  console.log('\n📊 獲得アイテム一覧:');
  results.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} [${item.rarity.value}] - ${item.rarity.displayName}`);
  });
  
  console.log('\n📈 レアリティ別獲得数:');
  const rarityCount = results.reduce((count, item) => {
    const rarity = item.rarity.value;
    count[rarity] = (count[rarity] || 0) + 1;
    return count;
  }, {} as Record<string, number>);
  
  Object.entries(rarityCount).forEach(([rarity, count]) => {
    console.log(`  ${rarity}: ${count}個`);
  });
  
  console.log('\n📚 所持アイテム (重複除外):');
  player.inventory.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} [${item.rarity.value}]`);
  });

  console.log('\n🎊 === ガチャシステムデモ完了 === 🎊');
}

/**
 * 待機用ユーティリティ関数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// デモ実行
if (require.main === module) {
  runGachaSystemDemo().catch(error => {
    console.error('💥 デモ実行エラー:', error);
    process.exit(1);
  });
}