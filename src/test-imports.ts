// src/test-imports.ts
// インポートが正常に動作するかテスト

import { DomainEvent } from './domain/events/DomainEvent';
import { GachaExecutedEvent } from './domain/events/GachaExecutedEvent';
import { EventHandler } from './domain/events/EventHandler';

console.log('=== インポートテスト ===');

// GachaExecutedEventの作成テスト
const event = new GachaExecutedEvent('player_001', 100, 'single');
console.log('✅ GachaExecutedEvent作成成功');
console.log(`イベント名: ${event.getEventName()}`);
console.log(`イベントID: ${event.eventId}`);

console.log('=== インポートテスト完了 ===');