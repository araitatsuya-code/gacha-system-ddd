// src/application/handlers/GachaExecutedHandler.ts

import { EventHandler } from '../../domain/events/EventHandler';
import { GachaExecutedEvent } from '../../domain/events/GachaExecutedEvent';

/**
 * ガチャ実行イベントを処理するハンドラー
 * ログ出力、統計更新、実績解除などを行う
 */
export class GachaExecutedHandler implements EventHandler<GachaExecutedEvent> {
  
  /**
   * ガチャ実行イベントを処理する
   * 
   * @param event ガチャ実行イベント
   */
  async handle(event: GachaExecutedEvent): Promise<void> {
    console.log('🎲 ガチャ実行イベントを処理中...');
    
    try {
      // 1. ログ出力
      await this.logGachaExecution(event);
      
      // 2. 統計情報の更新
      await this.updateStatistics(event);
      
      // 3. 実績チェック
      await this.checkAchievements(event);
      
      console.log('✅ ガチャ実行イベントの処理が完了しました');
      
    } catch (error) {
      console.error('❌ ガチャ実行イベントの処理でエラーが発生:', error);
      throw error;
    }
  }

  /**
   * ガチャ実行のログを出力する
   */
  private async logGachaExecution(event: GachaExecutedEvent): Promise<void> {
    const logMessage = [
      `[GACHA_EXECUTED]`,
      `Player: ${event.playerId}`,
      `Type: ${event.executionType}`,
      `Cost: ${event.gachaCost}`,
      `Time: ${event.occurredOn.toISOString()}`
    ].join(' | ');
    
    console.log(logMessage);
    
    // 実際のプロダクションでは外部ログサービスに送信
    // await externalLogger.info('gacha_executed', event.getEventData());
  }

  /**
   * ガチャ統計情報を更新する
   */
  private async updateStatistics(event: GachaExecutedEvent): Promise<void> {
    // シンプルなメモリ統計（実際はデータベースやRedisを使用）
    const stats = this.getOrCreatePlayerStats(event.playerId);
    
    stats.totalGachaExecutions++;
    stats.totalSpent += event.gachaCost;
    
    if (event.executionType === 'ten_pull') {
      stats.tenPullCount++;
    } else {
      stats.singlePullCount++;
    }
    
    console.log(`📊 ${event.playerId}の統計更新: 実行回数${stats.totalGachaExecutions}, 消費${stats.totalSpent}`);
  }

  /**
   * 実績をチェックして解除する
   */
  private async checkAchievements(event: GachaExecutedEvent): Promise<void> {
    const stats = this.getOrCreatePlayerStats(event.playerId);
    
    // 実績チェック例
    const achievements = [];
    
    if (stats.totalGachaExecutions === 1) {
      achievements.push('初回ガチャ実行');
    }
    
    if (stats.totalGachaExecutions === 10) {
      achievements.push('ガチャマスター（10回実行）');
    }
    
    if (stats.totalGachaExecutions === 100) {
      achievements.push('ガチャ中毒者（100回実行）');
    }
    
    if (event.executionType === 'ten_pull' && stats.tenPullCount === 1) {
      achievements.push('初回10連ガチャ');
    }
    
    // 実績解除の通知
    for (const achievement of achievements) {
      console.log(`🏆 実績解除: ${achievement} (プレイヤー: ${event.playerId})`);
    }
  }

  /**
   * プレイヤーの統計情報を取得または作成する
   * 実際のプロダクションではデータベースから取得
   */
  private getOrCreatePlayerStats(playerId: string): PlayerGachaStats {
    if (!GachaExecutedHandler.playerStatsCache.has(playerId)) {
      GachaExecutedHandler.playerStatsCache.set(playerId, {
        totalGachaExecutions: 0,
        totalSpent: 0,
        singlePullCount: 0,
        tenPullCount: 0
      });
    }
    
    return GachaExecutedHandler.playerStatsCache.get(playerId)!;
  }

  // シンプルなメモリキャッシュ（実際はRedisやデータベースを使用）
  private static playerStatsCache = new Map<string, PlayerGachaStats>();
}

/**
 * プレイヤーのガチャ統計情報
 */
interface PlayerGachaStats {
  totalGachaExecutions: number;
  totalSpent: number;
  singlePullCount: number;
  tenPullCount: number;
}
