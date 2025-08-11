// src/infrastructure/events/EventDispatcher.ts

import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventHandler } from '../../domain/events/EventHandler';

/**
 * ドメインイベントを適切なハンドラーに配信するディスパッチャー
 * イベント駆動アーキテクチャの中核となるクラス
 */
export class EventDispatcher {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  /**
   * イベントハンドラーを登録する
   * 
   * @param eventName イベント名
   * @param handler イベントハンドラー
   */
  subscribe<T extends DomainEvent>(
    eventName: string, 
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
    console.log(`📝 ハンドラー登録: ${eventName} (総数: ${this.handlers.get(eventName)!.length})`);
  }

  /**
   * 単一のイベントを処理する
   * 
   * @param event 処理するドメインイベント
   */
  async dispatch(event: DomainEvent): Promise<void> {
    const eventName = event.getEventName();
    const eventHandlers = this.handlers.get(eventName) || [];
    
    console.log(`🚀 イベント処理開始: ${eventName} (ハンドラー数: ${eventHandlers.length})`);
    
    if (eventHandlers.length === 0) {
      console.log(`⚠️ ハンドラーが登録されていません: ${eventName}`);
      return;
    }

    try {
      // 全ハンドラーを並列実行
      await Promise.all(
        eventHandlers.map(async (handler, index) => {
          try {
            console.log(`  📋 ハンドラー${index + 1}実行中...`);
            await handler.handle(event);
            console.log(`  ✅ ハンドラー${index + 1}完了`);
          } catch (error) {
            console.error(`  ❌ ハンドラー${index + 1}でエラー:`, error);
            throw error;
          }
        })
      );
      console.log(`🎯 イベント処理完了: ${eventName}`);
    } catch (error) {
      console.error(`💥 イベント処理失敗: ${eventName}`, error);
      throw error;
    }
  }

  /**
   * 複数のイベントを一括処理する
   * 
   * @param events 処理するイベントの配列（readonly配列も受け入れ可能）
   */
  async dispatchAll(events: readonly DomainEvent[]): Promise<void> {
    console.log(`📦 一括イベント処理開始: ${events.length}個のイベント`);
    
    for (const event of events) {
      await this.dispatch(event);
    }
    
    console.log(`🎊 一括イベント処理完了: ${events.length}個のイベント`);
  }

  /**
   * エンティティから発生したイベントを処理する
   * エンティティの getEvents() と clearEvents() を活用
   * 
   * @param entity イベントを持つエンティティ
   */
  async dispatchEntityEvents(entity: { getEvents(): readonly DomainEvent[], clearEvents(): void }): Promise<void> {
    const events = entity.getEvents();
    
    if (events.length === 0) {
      console.log('📭 処理すべきイベントはありません');
      return;
    }

    console.log(`🎭 エンティティイベント処理: ${events.length}個のイベント`);
    
    try {
      await this.dispatchAll(events);
      entity.clearEvents(); // 処理完了後にイベントをクリア
      console.log('🧹 エンティティのイベントをクリアしました');
    } catch (error) {
      console.error('💥 エンティティイベント処理中にエラーが発生:', error);
      throw error;
    }
  }

  /**
   * 登録されているハンドラーの情報を表示
   */
  showRegisteredHandlers(): void {
    console.log('📋 登録済みハンドラー一覧:');
    
    if (this.handlers.size === 0) {
      console.log('  (ハンドラーは登録されていません)');
      return;
    }

    this.handlers.forEach((handlerList, eventName) => {
      console.log(`  ${eventName}: ${handlerList.length}個のハンドラー`);
    });
  }

  /**
   * 特定のイベントタイプのハンドラーを削除
   * 
   * @param eventName 削除するイベント名
   */
  unsubscribe(eventName: string): void {
    if (this.handlers.has(eventName)) {
      this.handlers.delete(eventName);
      console.log(`🗑️ ハンドラー削除: ${eventName}`);
    }
  }

  /**
   * 全ハンドラーをクリア
   * テスト時のクリーンアップに使用
   */
  clear(): void {
    this.handlers.clear();
    console.log('🧹 全ハンドラーをクリアしました');
  }

  /**
   * 指定されたイベント名にハンドラーが登録されているかチェック
   * 
   * @param eventName チェックするイベント名
   * @returns ハンドラーが存在する場合true
   */
  hasHandlers(eventName: string): boolean {
    return this.handlers.has(eventName) && this.handlers.get(eventName)!.length > 0;
  }

  /**
   * 登録されているイベント名の一覧を取得
   * 
   * @returns イベント名の配列
   */
  getRegisteredEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 統計情報を取得
   * 
   * @returns ディスパッチャーの統計情報
   */
  getStats(): {
    totalEventTypes: number;
    totalHandlers: number;
    eventBreakdown: Record<string, number>;
  } {
    const eventBreakdown: Record<string, number> = {};
    let totalHandlers = 0;

    this.handlers.forEach((handlerList, eventName) => {
      eventBreakdown[eventName] = handlerList.length;
      totalHandlers += handlerList.length;
    });

    return {
      totalEventTypes: this.handlers.size,
      totalHandlers,
      eventBreakdown
    };
  }
}