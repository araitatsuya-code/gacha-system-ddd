// src/domain/entities/GachaItem.ts

import { Rarity } from '../value-objects/Rarity';

/**
 * ガチャで獲得できるアイテムを表すエンティティ
 * エンティティの特徴: 一意のIDを持ち、ライフサイクルを通じて同一性を保つ
 */
export class GachaItem {
  /**
   * GachaItemを作成する
   * 
   * @param id アイテムの一意識別子
   * @param name アイテム名
   * @param rarity レアリティ（値オブジェクト）
   * @param description アイテムの説明（オプション）
   * @param createdAt 作成日時（デフォルトは現在時刻）
   */
  constructor(
    private readonly _id: string,
    private readonly _itemName: string,
    private readonly _rarity: Rarity,
    private readonly _description: string = '',
    private readonly _createdAt: Date = new Date()
  ) {
    // バリデーション: IDは必須
    if (!_id || _id.trim() === '') {
      throw new Error('GachaItem ID cannot be empty');
    }

    // バリデーション: 名前は必須
    if (!_itemName || _itemName.trim() === '') {
      throw new Error('GachaItem name cannot be empty');
    }
  }

  /**
   * アイテムの一意識別子を取得する
   * エンティティの同一性判定に使用される最重要プロパティ
   * 
   * @returns アイテムID
   */
  get id(): string {
    return this._id;
  }

  /**
   * アイテム名を取得する
   * プレイヤーに表示される名前
   * 
   * @returns アイテム名
   */
  get name(): string {
    return this._itemName;
  }

  /**
   * アイテムのレアリティを取得する
   * ガチャの確率計算や表示に使用
   * 
   * @returns レアリティ値オブジェクト
   */
  get rarity(): Rarity {
    return this._rarity;
  }

  /**
   * アイテムの説明文を取得する
   * アイテムの効果や背景ストーリーなど
   * 
   * @returns 説明文（空文字の場合もあり）
   */
  get description(): string {
    return this._description;
  }

  /**
   * アイテムの作成日時を取得する
   * ガチャを引いた日時や、アイテムが生成された日時
   * 
   * @returns 作成日時
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 2つのGachaItemが同じエンティティかどうかを判定する
   * エンティティの同一性はIDで判定される
   * 
   * @param other 比較対象のGachaItem
   * @returns 同じエンティティの場合true、異なる場合false
   */
  equals(other: GachaItem): boolean {
    // エンティティの同一性はIDのみで判定
    return this._id === other._id;
  }

  /**
   * GachaItemの情報を文字列で表現する
   * ログ出力やデバッグ、UI表示に使用
   * 
   * @returns アイテムの詳細情報を含む文字列
   */
  toString(): string {
    return `${this._itemName} [${this._rarity.value}] (ID: ${this._id})`;
  }
}
