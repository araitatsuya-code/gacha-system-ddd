// src/test-item-event.ts

import { ItemObtainedEvent } from './domain/events/ItemObtainedEvent';

console.log('=== ItemObtainedEvent テスト ===');

// URアイテム獲得（初回）
const urEvent = new ItemObtainedEvent('player_001', 'sword_999', '神々の剣', 'UR', true);
console.log(`URアイテム: ${urEvent.getDescription()}`);
console.log(`重要度: ${urEvent.getImportanceLevel()}/10`);
console.log(`レアアイテム?: ${urEvent.isRareItem()}`);
console.log(`ウルトラレア?: ${urEvent.isUltraRare()}`);

console.log('---');

// SSRアイテム獲得（重複）
const ssrEvent = new ItemObtainedEvent('player_001', 'sword_001', 'エクスカリバー', 'SSR', false);
console.log(`SSRアイテム: ${ssrEvent.getDescription()}`);
console.log(`重要度: ${ssrEvent.getImportanceLevel()}/10`);
console.log(`レアアイテム?: ${ssrEvent.isRareItem()}`);
console.log(`ウルトラレア?: ${ssrEvent.isUltraRare()}`);

console.log('---');

// Nアイテム獲得（初回）
const normalEvent = new ItemObtainedEvent('player_001', 'potion_001', 'HP回復薬', 'N', true);
console.log(`Nアイテム: ${normalEvent.getDescription()}`);
console.log(`重要度: ${normalEvent.getImportanceLevel()}/10`);
console.log(`レアアイテム?: ${normalEvent.isRareItem()}`);
console.log(`ウルトラレア?: ${normalEvent.isUltraRare()}`);

console.log('=== テスト完了 ===');