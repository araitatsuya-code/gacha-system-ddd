// src/domain/events/CurrencySpentEvent.ts

import { DomainEvent } from './DomainEvent';

/**
 * 通貨が消費された時に発行されるドメインイベント
 * 支出履歴、課金統計、不正検知などに使用される
 */
export class CurrencySpentEvent extends DomainEvent {
  /**
   * CurrencySpentEventを作成する
   * 
   * @param playerId 通貨を消費したプレイヤーID
   * @param amount 消費した通貨量
   * @param remainingBalance 消費後の残高
   * @param spendingReason 消費理由（'gacha' | 'shop' | 'upgrade' など）
   * @param relatedItemId 関連するアイテムID（ガチャ等で取得したアイテム）
   */
  constructor(
    playerId: string,
    public readonly amount: number,
    public readonly remainingBalance: number,
    public readonly spendingReason: string = 'unknown',
    public readonly relatedItemId?: string
  ) {
    super(playerId);
  }

  /**
   * イベント名を返す
   */
  getEventName(): string {
    return 'CurrencySpent';
  }

  /**
   * イベントの詳細データを返す
   */
  getEventData(): Record<string, any> {
    return {
      eventName: this.getEventName(),
      playerId: this.playerId,
      amount: this.amount,
      remainingBalance: this.remainingBalance,
      spendingReason: this.spendingReason,
      relatedItemId: this.relatedItemId,
      occurredOn: this.occurredOn.toISOString(),
      eventId: this.eventId
    };
  }

  /**
   * 大きな支出かどうかを判定する
   * 不正検知や特別な処理のトリガーに使用
   * 
   * @param threshold 大きな支出とする閾値（デフォルト: 1000）
   * @returns 閾値以上の場合true
   */
  isLargeSpending(threshold: number = 1000): boolean {
    return this.amount >= threshold;
  }

  /**
   * 残高が危険水域かどうかを判定する
   * 低残高警告のトリガーに使用
   * 
   * @param warningThreshold 警告を出す残高の閾値（デフォルト: 100）
   * @returns 残高が閾値以下の場合true
   */
  isLowBalance(warningThreshold: number = 100): boolean {
    return this.remainingBalance <= warningThreshold;
  }

  /**
   * ガチャによる消費かどうかを判定する
   */
  isGachaSpending(): boolean {
    return this.spendingReason === 'gacha';
  }

  /**
   * 消費の重要度を算出する
   * 監視システムやアラートの優先度決定に使用
   * 
   * @returns 重要度レベル（1-10）
   */
  getImportanceLevel(): number {
    let level = 1;
    
    // 消費金額による重要度
    if (this.amount >= 5000) level = 8;
    else if (this.amount >= 1000) level = 6;
    else if (this.amount >= 500) level = 4;
    else if (this.amount >= 100) level = 2;
    
    // 低残高なら重要度アップ
    if (this.isLowBalance()) {
      level += 2;
    }
    
    // 残高がゼロになった場合は最高重要度
    if (this.remainingBalance === 0) {
      level = 10;
    }
    
    return Math.min(level, 10);
  }

  /**
   * イベントの説明文を生成
   */
  getDescription(): string {
    const reasonText = this.spendingReason === 'gacha' ? 'ガチャで' : 
                      this.spendingReason === 'shop' ? 'ショップで' :
                      this.spendingReason === 'upgrade' ? 'アップグレードで' : '';
    
    return `プレイヤー${this.playerId}が${reasonText}${this.amount}コインを消費しました（残高: ${this.remainingBalance}）`;
  }

  /**
   * 支出レポート用のデータを生成
   */
  getSpendingReport(): {
    playerId: string;
    amount: number;
    reason: string;
    timestamp: string;
    balanceAfter: number;
    isSignificant: boolean;
  } {
    return {
      playerId: this.playerId,
      amount: this.amount,
      reason: this.spendingReason,
      timestamp: this.occurredOn.toISOString(),
      balanceAfter: this.remainingBalance,
      isSignificant: this.isLargeSpending() || this.isLowBalance()
    };
  }
}