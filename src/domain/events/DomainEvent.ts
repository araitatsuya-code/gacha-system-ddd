// src/domain/events/DomainEvent.ts

/**
 * ガチャシステムにおけるすべてのドメインイベントの基底クラス
 * ガチャ実行、アイテム獲得、課金などのイベントの共通基盤
 */
export abstract class DomainEvent {
  /** イベントが発生した日時 */
  public readonly occurredOn: Date;

  /** イベントの一意識別子 */
  public readonly eventId: string;

  /** イベントを発生させたプレイヤーID */
  public readonly playerId: string;

  constructor(playerId: string) {
    this.occurredOn = new Date();
    this.eventId = this.generateEventId();
    this.playerId = playerId;
  }

  /**
   * イベント名を返す抽象メソッド
   * 各ガチャイベント（GachaExecuted, RareItemObtained等）で実装
   */
  abstract getEventName(): string;

  /**
   * イベントの詳細データを返す抽象メソッド
   * ログやデバッグ、イベント配信時に使用
   */
  abstract getEventData(): Record<string, any>;

  /**
   * シンプルなイベントID生成
   * 実際のプロダクションではUUID等を使用
   */
  private generateEventId(): string {
    return `gacha_event_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  /**
   * イベントの基本情報を文字列で返す
   * ログ出力やデバッグに使用
   */
  toString(): string {
    return `${this.getEventName()}(${
      this.eventId
    }) at ${this.occurredOn.toISOString()} for player ${this.playerId}`;
  }
}
