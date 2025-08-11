import { DomainEvent } from './DomainEvent';

/**
 * ドメインイベントを処理するハンドラーのインターフェース
 * 各イベントタイプに対応する具体的なハンドラーが実装する
 */
export interface EventHandler<T extends DomainEvent> {
  /**
   * イベントを処理する
   * 
   * @param event 処理対象のドメインイベント
   * @returns 処理完了のPromise
   */
  handle(event: T): Promise<void>;
}