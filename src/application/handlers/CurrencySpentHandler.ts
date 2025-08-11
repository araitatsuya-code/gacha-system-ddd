import { EventHandler } from '../../domain/events/EventHandler';
import { CurrencySpentEvent } from '../../domain/events/CurrencySpentEvent';

/**
 * 通貨消費イベントを処理するハンドラー
 * 支出履歴、課金統計、不正検知、低残高警告などを行う
 */
export class CurrencySpentHandler implements EventHandler<CurrencySpentEvent> {

  /**
   * 通貨消費イベントを処理する
   * 
   * @param event 通貨消費イベント
   */
  async handle(event: CurrencySpentEvent): Promise<void> {
    console.log('💰 通貨消費イベントを処理中...');
    
    try {
      // 1. 支出ログの記録
      await this.logSpending(event);
      
      // 2. 統計情報の更新
      await this.updateSpendingStatistics(event);
      
      // 3. 残高チェックと警告
      await this.checkBalance(event);
      
      // 4. 異常な支出の検知
      await this.detectSuspiciousSpending(event);
      
      console.log('✅ 通貨消費イベントの処理が完了しました');
      
    } catch (error) {
      console.error('❌ 通貨消費イベントの処理でエラーが発生:', error);
      throw error;
    }
  }

  /**
   * 支出ログを記録する
   */
  private async logSpending(event: CurrencySpentEvent): Promise<void> {
    const logMessage = [
      `[CURRENCY_SPENT]`,
      `Player: ${event.playerId}`,
      `Amount: ${event.amount}`,
      `Reason: ${event.spendingReason}`,
      `Balance: ${event.remainingBalance}`,
      `Time: ${event.occurredOn.toISOString()}`
    ].join(' | ');
    
    console.log(logMessage);
    
    // 支出履歴を保存（実際はデータベースに保存）
    this.addToSpendingHistory(event);
    
    console.log(`📊 支出履歴に記録: ${event.getDescription()}`);
  }

  /**
   * 支出統計を更新する
   */
  private async updateSpendingStatistics(event: CurrencySpentEvent): Promise<void> {
    const stats = this.getOrCreatePlayerStats(event.playerId);
    
    // 総支出額更新
    stats.totalSpent += event.amount;
    stats.totalTransactions++;
    
    // 用途別支出更新
    if (!stats.spendingByReason[event.spendingReason]) {
      stats.spendingByReason[event.spendingReason] = 0;
    }
    stats.spendingByReason[event.spendingReason] += event.amount;
    
    // 最大単回支出額更新
    if (event.amount > stats.maxSingleSpending) {
      stats.maxSingleSpending = event.amount;
    }
    
    console.log(`📈 ${event.playerId}の支出統計更新:`);
    console.log(`  総支出: ${stats.totalSpent}コイン`);
    console.log(`  取引回数: ${stats.totalTransactions}回`);
    console.log(`  ${event.spendingReason}支出: ${stats.spendingByReason[event.spendingReason]}コイン`);
  }

  /**
   * 残高をチェックして警告を出す
   */
  private async checkBalance(event: CurrencySpentEvent): Promise<void> {
    const importance = event.getImportanceLevel();
    
    if (event.remainingBalance === 0) {
      console.log('⚠️🚨 残高がゼロになりました！');
      console.log('   チャージが必要です。');
      await this.sendLowBalanceNotification(event.playerId, 'ZERO_BALANCE');
    } else if (event.isLowBalance(100)) {
      console.log('⚠️💰 残高が少なくなりました！');
      console.log(`   現在の残高: ${event.remainingBalance}コイン`);
      await this.sendLowBalanceNotification(event.playerId, 'LOW_BALANCE');
    }
    
    // 重要度が高い場合の追加処理
    if (importance >= 8) {
      console.log('🔔 重要度の高い支出が発生しました');
      await this.notifyHighImportanceSpending(event);
    }
  }

  /**
   * 異常な支出パターンを検知する
   */
  private async detectSuspiciousSpending(event: CurrencySpentEvent): Promise<void> {
    const stats = this.getOrCreatePlayerStats(event.playerId);
    
    // 大きな支出の検知
    if (event.isLargeSpending(1000)) {
      console.log('🚨 大額支出を検知しました');
      console.log(`   支出額: ${event.amount}コイン`);
      await this.flagLargeSpending(event);
    }
    
    // 短時間での連続支出の検知
    const recentSpending = this.getRecentSpending(event.playerId, 5 * 60 * 1000); // 5分以内
    if (recentSpending.length >= 5) {
      console.log('⚠️ 短時間での連続支出を検知しました');
      console.log(`   過去5分間の支出回数: ${recentSpending.length}回`);
      await this.flagRapidSpending(event);
    }
    
    // 通常と異なる支出パターンの検知
    const averageSpending = stats.totalSpent / Math.max(stats.totalTransactions, 1);
    if (event.amount > averageSpending * 5) {
      console.log('📊 通常より大きな支出を検知しました');
      console.log(`   今回の支出: ${event.amount}コイン, 平均支出: ${averageSpending.toFixed(0)}コイン`);
    }
  }

  /**
   * 低残高通知を送信する
   */
  private async sendLowBalanceNotification(playerId: string, type: 'LOW_BALANCE' | 'ZERO_BALANCE'): Promise<void> {
    const message = type === 'ZERO_BALANCE' 
      ? 'コインが不足しています。チャージして引き続きお楽しみください！'
      : 'コインが少なくなりました。お得なチャージパックをご確認ください！';
      
    console.log(`📱 プッシュ通知送信: ${message}`);
    
    // 実際のプロダクションでは通知サービスAPIを呼び出し
    // await notificationService.send({ playerId, message, type });
  }

  /**
   * 重要度の高い支出を通知する
   */
  private async notifyHighImportanceSpending(event: CurrencySpentEvent): Promise<void> {
    console.log(`📊 重要支出通知: プレイヤー${event.playerId}が${event.amount}コインを消費`);
    
    // 管理者への通知や分析システムへの送信
    // await adminNotificationService.send({
    //   type: 'high_importance_spending',
    //   data: event.getEventData()
    // });
  }

  /**
   * 大額支出をフラグする
   */
  private async flagLargeSpending(event: CurrencySpentEvent): Promise<void> {
    console.log(`🏷️ 大額支出フラグ設定: ${event.amount}コイン`);
    // 不正監視システムやCSチームへの通知
  }

  /**
   * 連続支出をフラグする
   */
  private async flagRapidSpending(event: CurrencySpentEvent): Promise<void> {
    console.log(`🏷️ 連続支出フラグ設定: プレイヤー${event.playerId}`);
    // ギャンブル依存症対策や使いすぎ防止機能
  }

  /**
   * プレイヤーの支出統計を取得または作成
   */
  private getOrCreatePlayerStats(playerId: string): PlayerSpendingStats {
    if (!CurrencySpentHandler.playerStatsCache.has(playerId)) {
      CurrencySpentHandler.playerStatsCache.set(playerId, {
        totalSpent: 0,
        totalTransactions: 0,
        spendingByReason: {},
        maxSingleSpending: 0
      });
    }
    return CurrencySpentHandler.playerStatsCache.get(playerId)!;
  }

  /**
   * 支出履歴に追加
   */
  private addToSpendingHistory(event: CurrencySpentEvent): void {
    if (!CurrencySpentHandler.spendingHistoryCache.has(event.playerId)) {
      CurrencySpentHandler.spendingHistoryCache.set(event.playerId, []);
    }
    
    CurrencySpentHandler.spendingHistoryCache.get(event.playerId)!.push({
      amount: event.amount,
      reason: event.spendingReason,
      timestamp: event.occurredOn,
      balanceAfter: event.remainingBalance
    });
  }

  /**
   * 最近の支出履歴を取得
   */
  private getRecentSpending(playerId: string, timeWindowMs: number): SpendingHistoryEntry[] {
    const history = CurrencySpentHandler.spendingHistoryCache.get(playerId) || [];
    const cutoffTime = new Date(Date.now() - timeWindowMs);
    
    return history.filter(entry => entry.timestamp > cutoffTime);
  }

  // キャッシュ（実際のプロダクションではRedisやデータベースを使用）
  private static playerStatsCache = new Map<string, PlayerSpendingStats>();
  private static spendingHistoryCache = new Map<string, SpendingHistoryEntry[]>();
}

/**
 * プレイヤーの支出統計情報
 */
interface PlayerSpendingStats {
  totalSpent: number;
  totalTransactions: number;
  spendingByReason: Record<string, number>;
  maxSingleSpending: number;
}

/**
 * 支出履歴エントリ
 */
interface SpendingHistoryEntry {
  amount: number;
  reason: string;
  timestamp: Date;
  balanceAfter: number;
}