// src/application/handlers/ItemObtainedHandler.ts

import { EventHandler } from '../../domain/events/EventHandler';
import { ItemObtainedEvent } from '../../domain/events/ItemObtainedEvent';

/**
 * アイテム獲得イベントを処理するハンドラー
 * 演出制御、通知送信、図鑑登録、統計更新などを行う
 */
export class ItemObtainedHandler implements EventHandler<ItemObtainedEvent> {

  /**
   * アイテム獲得イベントを処理する
   * 
   * @param event アイテム獲得イベント
   */
  async handle(event: ItemObtainedEvent): Promise<void> {
    console.log('🎁 アイテム獲得イベントを処理中...');
    
    try {
      // 1. レアリティに応じた演出
      await this.triggerAnimation(event);
      
      // 2. 図鑑登録（初回のみ）
      if (event.isFirstTime) {
        await this.registerToCollection(event);
      }
      
      // 3. 通知送信
      await this.sendNotification(event);
      
      // 4. 統計更新
      await this.updateStatistics(event);
      
      console.log('✅ アイテム獲得イベントの処理が完了しました');
      
    } catch (error) {
      console.error('❌ アイテム獲得イベントの処理でエラーが発生:', error);
      throw error;
    }
  }

  /**
   * レアリティに応じた演出を実行する
   */
  private async triggerAnimation(event: ItemObtainedEvent): Promise<void> {
    const importance = event.getImportanceLevel();
    
    if (event.isUltraRare()) {
      console.log('🌈✨ ウルトラレア演出: 虹色のオーラが輝いています！');
      await this.playSound('ultra_rare_fanfare');
      await this.showSpecialEffect('rainbow_explosion');
    } else if (event.isRareItem()) {
      console.log('⭐✨ レアアイテム演出: 金色の光が舞っています！');
      await this.playSound('rare_chime');
      await this.showSpecialEffect('gold_sparkle');
    } else {
      console.log('✨ 通常演出: キラキラ光っています');
      await this.showSpecialEffect('normal_glow');
    }
    
    console.log(`🎬 演出レベル: ${importance}/10`);
  }

  /**
   * アイテムを図鑑に登録する（初回獲得時のみ）
   */
  private async registerToCollection(event: ItemObtainedEvent): Promise<void> {
    console.log(`📚 図鑑に新アイテムを登録: ${event.itemName} [${event.rarity}]`);
    
    // 図鑑エントリの作成
    const collectionEntry = {
      itemId: event.itemId,
      itemName: event.itemName,
      rarity: event.rarity,
      firstObtainedDate: event.occurredOn,
      playerId: event.playerId
    };
    
    // 実際のプロダクションではデータベースに保存
    this.addToPlayerCollection(event.playerId, collectionEntry);
    
    // 図鑑完成度チェック
    await this.checkCollectionMilestones(event.playerId, event.rarity);
  }

  /**
   * プレイヤーに通知を送信する
   */
  private async sendNotification(event: ItemObtainedEvent): Promise<void> {
    const importance = event.getImportanceLevel();
    
    // 重要度が高いアイテムのみプッシュ通知
    if (importance >= 8) {
      console.log('📱 プッシュ通知送信: 超レアアイテム獲得！');
      await this.sendPushNotification({
        playerId: event.playerId,
        title: 'レアアイテム獲得！',
        message: `${event.rarity}「${event.itemName}」を獲得しました！`,
        priority: 'high'
      });
    }
    
    // ゲーム内通知は常に表示
    console.log(`💬 ゲーム内通知: ${event.getDescription()}`);
  }

  /**
   * アイテム獲得統計を更新する
   */
  private async updateStatistics(event: ItemObtainedEvent): Promise<void> {
    const stats = this.getOrCreatePlayerStats(event.playerId);
    
    // 総獲得数更新
    stats.totalItemsObtained++;
    
    // レアリティ別統計更新
    stats.rarityBreakdown[event.rarity] = (stats.rarityBreakdown[event.rarity] || 0) + 1;
    
    // 初回獲得数
    if (event.isFirstTime) {
      stats.uniqueItemsObtained++;
    }
    
    console.log(`📊 ${event.playerId}の統計更新:`);
    console.log(`  総獲得数: ${stats.totalItemsObtained}`);
    console.log(`  ユニーク数: ${stats.uniqueItemsObtained}`);
    console.log(`  ${event.rarity}獲得数: ${stats.rarityBreakdown[event.rarity]}`);
  }

  /**
   * 演出効果を表示する（シミュレーション）
   */
  private async showSpecialEffect(effectType: string): Promise<void> {
    console.log(`🎨 特殊効果実行: ${effectType}`);
    // 実際のプロダクションではアニメーションライブラリを使用
    await this.sleep(100); // アニメーション時間のシミュレーション
  }

  /**
   * 効果音を再生する（シミュレーション）
   */
  private async playSound(soundType: string): Promise<void> {
    console.log(`🔊 効果音再生: ${soundType}`);
    // 実際のプロダクションでは音声ライブラリを使用
  }

  /**
   * プッシュ通知を送信する（シミュレーション）
   */
  private async sendPushNotification(notification: any): Promise<void> {
    console.log(`📧 プッシュ通知送信:`, notification);
    // 実際のプロダクションでは通知サービスAPIを使用
  }

  /**
   * 図鑑のマイルストーンをチェックする
   */
  private async checkCollectionMilestones(playerId: string, rarity: string): Promise<void> {
    const collection = this.getPlayerCollection(playerId);
    const rarityCount = collection.filter(item => item.rarity === rarity).length;
    
    // マイルストーンチェック
    const milestones = [1, 5, 10, 25, 50, 100];
    if (milestones.includes(rarityCount)) {
      console.log(`🏆 図鑑マイルストーン達成: ${rarity}レアリティ ${rarityCount}種類コンプリート！`);
    }
  }

  /**
   * プレイヤーの統計情報を取得または作成
   */
  private getOrCreatePlayerStats(playerId: string): PlayerItemStats {
    if (!ItemObtainedHandler.playerStatsCache.has(playerId)) {
      ItemObtainedHandler.playerStatsCache.set(playerId, {
        totalItemsObtained: 0,
        uniqueItemsObtained: 0,
        rarityBreakdown: {}
      });
    }
    return ItemObtainedHandler.playerStatsCache.get(playerId)!;
  }

  /**
   * プレイヤーの図鑑を取得
   */
  private getPlayerCollection(playerId: string): CollectionEntry[] {
    return ItemObtainedHandler.playerCollectionCache.get(playerId) || [];
  }

  /**
   * プレイヤーの図鑑にアイテムを追加
   */
  private addToPlayerCollection(playerId: string, entry: CollectionEntry): void {
    if (!ItemObtainedHandler.playerCollectionCache.has(playerId)) {
      ItemObtainedHandler.playerCollectionCache.set(playerId, []);
    }
    ItemObtainedHandler.playerCollectionCache.get(playerId)!.push(entry);
  }

  /**
   * 待機用のユーティリティ関数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 統計情報のメモリキャッシュ
  private static playerStatsCache = new Map<string, PlayerItemStats>();
  private static playerCollectionCache = new Map<string, CollectionEntry[]>();
}

/**
 * プレイヤーのアイテム統計情報
 */
interface PlayerItemStats {
  totalItemsObtained: number;
  uniqueItemsObtained: number;
  rarityBreakdown: Record<string, number>;
}

/**
 * 図鑑エントリ
 */
interface CollectionEntry {
  itemId: string;
  itemName: string;
  rarity: string;
  firstObtainedDate: Date;
  playerId: string;
}
