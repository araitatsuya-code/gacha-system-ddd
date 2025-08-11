// src/domain/entities/Player.ts

import { GachaItem } from './GachaItem';
import { DomainEvent } from '../events/DomainEvent';
import { CurrencySpentEvent } from '../events/CurrencySpentEvent';

/**
 * プレイヤーを表すエンティティ
 * ガチャを実行し、アイテムを所持する主体
 */
export class Player {
  private _inventory: GachaItem[] = [];
  private _events: DomainEvent[] = [];

  /**
   * Playerを作成する
   * 
   * @param id プレイヤーの一意識別子
   * @param playerName プレイヤー名
   * @param gachaCurrency ガチャに使用できる通貨（デフォルト: 0）
   * @param createdAt アカウント作成日時（デフォルト: 現在時刻）
   */
  constructor(
    private readonly _id: string,
    private readonly _playerName: string,
    private _gachaCurrency: number = 0,
    private readonly _createdAt: Date = new Date()
  ) {
    // バリデーション: IDは必須
    if (!_id || _id.trim() === '') {
      throw new Error('Player ID cannot be empty');
    }

    // バリデーション: プレイヤー名は必須
    if (!_playerName || _playerName.trim() === '') {
      throw new Error('Player name cannot be empty');
    }

    // バリデーション: 通貨は負の値にできない
    if (_gachaCurrency < 0) {
      throw new Error('Gacha currency cannot be negative');
    }
  }

  /**
   * プレイヤーの一意識別子を取得する
   * 
   * @returns プレイヤーID
   */
  get id(): string {
    return this._id;
  }

  /**
   * プレイヤー名を取得する
   * 
   * @returns プレイヤー名
   */
  get playerName(): string {
    return this._playerName;
  }

  /**
   * 現在のガチャ通貨を取得する
   * 
   * @returns ガチャ通貨の残高
   */
  get gachaCurrency(): number {
    return this._gachaCurrency;
  }

  /**
   * アカウント作成日時を取得する
   * 
   * @returns 作成日時
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 所持アイテムのコピーを取得する
   * 直接配列を渡さず、コピーを返すことで外部からの変更を防ぐ
   * 
   * @returns インベントリのコピー
   */
  get inventory(): readonly GachaItem[] {
    return [...this._inventory];
  }

  /**
   * アイテムをインベントリに追加する
   * ビジネスルール: 同じIDのアイテムは重複して所持できない
   * 
   * @param item 追加するガチャアイテム
   * @throws Error 既に同じアイテムを所持している場合
   */
  addItem(item: GachaItem): void {
    // ビジネスルール: 重複チェック
    if (this.hasItem(item)) {
      throw new Error(`アイテム「${item.name}」は既に所持しています (ID: ${item.id})`);
    }

    // インベントリに追加
    this._inventory.push(item);

    // TODO: 後でイベント発行を追加
    // this.addEvent(new ItemObtainedEvent(this._id, item.id));
  }

  /**
   * 指定されたアイテムを既に所持しているかチェックする
   * エンティティの同一性（ID）で判定
   * 
   * @param item チェックするガチャアイテム
   * @returns 所持している場合true、していない場合false
   */
  hasItem(item: GachaItem): boolean {
    return this._inventory.some(inventoryItem => inventoryItem.equals(item));
  }

  /**
   * アイテムをインベントリから削除する
   * ビジネスルール: 所持していないアイテムは削除できない
   * 
   * @param item 削除するガチャアイテム
   * @throws Error 所持していないアイテムを削除しようとした場合
   */
  removeItem(item: GachaItem): void {
    // ビジネスルール: 存在チェック
    if (!this.hasItem(item)) {
      throw new Error(`アイテム「${item.name}」を所持していません (ID: ${item.id})`);
    }

    // インベントリから削除
    const initialLength = this._inventory.length;
    this._inventory = this._inventory.filter(inventoryItem => !inventoryItem.equals(item));

    // 削除確認（デバッグ用）
    if (this._inventory.length === initialLength) {
      throw new Error(`アイテム削除に失敗しました: ${item.id}`);
    }

    // TODO: 後でイベント発行を追加
    // this.addEvent(new ItemRemovedEvent(this._id, item.id));
  }

  /**
   * ガチャ通貨を追加する（チャージ）
   * ビジネスルール: 負の値は追加できない
   * 
   * @param amount 追加する通貨量
   * @throws Error 負の値を追加しようとした場合
   */
  addCurrency(amount: number): void {
    if (amount < 0) {
      throw new Error(`通貨の追加量は0以上である必要があります: ${amount}`);
    }

    this._gachaCurrency += amount;

    // TODO: 後でイベント発行を追加
    // this.addEvent(new CurrencyAddedEvent(this._id, amount, this._gachaCurrency));
  }

  /**
   * ガチャ通貨を消費する
   * ビジネスルール: 所持金を超えて消費できない、負の値は消費できない
   * 
   * @param amount 消費する通貨量
   * @param reason 消費理由（オプション、イベント発行時に使用）
   * @throws Error 残高不足または負の値を消費しようとした場合
   */
  spendCurrency(amount: number, reason: string = 'unknown'): void {
    if (amount < 0) {
      throw new Error(`通貨の消費量は0以上である必要があります: ${amount}`);
    }

    if (this._gachaCurrency < amount) {
      throw new Error(`残高不足です。必要: ${amount}, 残高: ${this._gachaCurrency}`);
    }

    this._gachaCurrency -= amount;

    // イベント発行（reasonパラメータを使用）
    const event = new CurrencySpentEvent(
      this._id,
      amount,
      this._gachaCurrency,
      reason
    );
    this.addEvent(event);
  }

  /**
   * 指定された金額のガチャを実行できるかチェックする
   * 
   * @param cost ガチャのコスト
   * @returns 実行可能な場合true、不可能な場合false
   */
  canAffordGacha(cost: number): boolean {
    return this._gachaCurrency >= cost && cost >= 0;
  }

  /**
   * ドメインイベントを追加する
   * エンティティの状態変化をイベントとして記録
   * 
   * @param event 追加するドメインイベント
   */
  addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  /**
   * 蓄積されたドメインイベントを取得する
   * イベントディスパッチャーがイベントを処理するために使用
   * 
   * @returns ドメインイベントのコピー
   */
  getEvents(): readonly DomainEvent[] {
    return [...this._events];
  }

  /**
   * 蓄積されたドメインイベントをクリアする
   * イベント処理完了後に呼び出される
   */
  clearEvents(): void {
    this._events = [];
  }

  /**
   * Playerエンティティの情報を文字列で表現する
   * 
   * @returns プレイヤーの詳細情報
   */
  toString(): string {
    return `Player: ${this._playerName} (ID: ${this._id}) - ${this._gachaCurrency}コイン, ${this._inventory.length}アイテム`;
  }
}