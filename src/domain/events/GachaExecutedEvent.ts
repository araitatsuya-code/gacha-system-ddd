import { DomainEvent } from './DomainEvent';

/**
 * ガチャが実行された時に発行されるドメインイベント
 * ガチャの実行記録、統計情報の更新、ログ出力などに使用される
 */
export class GachaExecutedEvent extends DomainEvent {
  /**
   * GachaExecutedEventを作成する
   * 
   * @param playerId ガチャを実行したプレイヤーID
   * @param gachaCost ガチャの実行コスト
   * @param executionType ガチャの種類（'single' | 'ten_pull'）
   */
  constructor(
    playerId: string,
    public readonly gachaCost: number,
    public readonly executionType: 'single' | 'ten_pull'
  ) {
    super(playerId);
  }

  /**
   * イベント名を返す
   * イベントディスパッチャーがハンドラーを特定するために使用
   */
  getEventName(): string {
    return 'GachaExecuted';
  }

  /**
   * イベントの詳細データを返す
   * ログ出力、デバッグ、外部システムへの通知に使用
   */
  getEventData(): Record<string, any> {
    return {
      eventName: this.getEventName(),
      playerId: this.playerId,
      gachaCost: this.gachaCost,
      executionType: this.executionType,
      occurredOn: this.occurredOn.toISOString(),
      eventId: this.eventId
    };
  }

  /**
   * イベントの説明文を生成
   * ログやUI表示で使用
   */
  getDescription(): string {
    const typeText = this.executionType === 'single' ? '単発' : '10連';
    return `プレイヤー${this.playerId}が${typeText}ガチャを実行しました（コスト: ${this.gachaCost}）`;
  }
}
