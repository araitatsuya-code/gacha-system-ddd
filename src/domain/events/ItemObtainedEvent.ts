// src/domain/events/ItemObtainedEvent.ts

import { DomainEvent } from './DomainEvent';

/**
 * アイテムを獲得した時に発行されるドメインイベント
 * レア度に応じた演出、プッシュ通知、達成記録などに使用される
 */
export class ItemObtainedEvent extends DomainEvent {
  /**
   * ItemObtainedEventを作成する
   * 
   * @param playerId アイテムを獲得したプレイヤーID
   * @param itemId 獲得したアイテムのID
   * @param itemName 獲得したアイテムの名前
   * @param rarity 獲得したアイテムのレアリティ
   * @param isFirstTime 初回獲得かどうか
   */
  constructor(
    playerId: string,
    public readonly itemId: string,
    public readonly itemName: string,
    public readonly rarity: string,
    public readonly isFirstTime: boolean = true
  ) {
    super(playerId);
  }

  /**
   * イベント名を返す
   */
  getEventName(): string {
    return 'ItemObtained';
  }

  /**
   * イベントの詳細データを返す
   */
  getEventData(): Record<string, any> {
    return {
      eventName: this.getEventName(),
      playerId: this.playerId,
      itemId: this.itemId,
      itemName: this.itemName,
      rarity: this.rarity,
      isFirstTime: this.isFirstTime,
      occurredOn: this.occurredOn.toISOString(),
      eventId: this.eventId
    };
  }

  /**
   * レアアイテムかどうかを判定する
   * SR以上をレアとして扱う
   */
  isRareItem(): boolean {
    return ['SR', 'SSR', 'UR'].includes(this.rarity);
  }

  /**
   * 最高レアリティかどうかを判定する
   */
  isUltraRare(): boolean {
    return this.rarity === 'UR';
  }

  /**
   * イベントの説明文を生成
   */
  getDescription(): string {
    const firstTimeText = this.isFirstTime ? '初回' : '重複';
    return `プレイヤー${this.playerId}が${this.rarity}「${this.itemName}」を獲得しました（${firstTimeText}）`;
  }

  /**
   * 獲得の重要度を数値で返す
   * 演出の規模や通知の優先度決定に使用
   * 
   * @returns 重要度（1-10）
   */
  getImportanceLevel(): number {
    let level = 1;
    
    // レアリティによる重要度
    switch (this.rarity) {
      case 'UR': level = 10; break;
      case 'SSR': level = 8; break;
      case 'SR': level = 6; break;
      case 'R': level = 4; break;
      case 'N': level = 2; break;
    }
    
    // 初回獲得なら重要度アップ
    if (this.isFirstTime) {
      level += 1;
    }
    
    return Math.min(level, 10); // 最大10
  }
}