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
    private readonly _name: string,
    private readonly _rarity: Rarity,
    private readonly _description: string = '',
    private readonly _createdAt: Date = new Date()
  ) {
    // バリデーション: IDは必須
    if (!id || id.trim() === '') {
      throw new Error('GachaItem ID cannot be empty');
    }

    // バリデーション: 名前は必須
    if (!name || name.trim() === '') {
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
    return this._name;
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

  // TODO: 次のステップでエンティティの比較メソッドを実装
}