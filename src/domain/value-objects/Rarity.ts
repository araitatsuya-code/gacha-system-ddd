/**
 * レアリティを表す値オブジェクト
 * ガチャアイテムのレア度と排出確率を管理
 */
export class Rarity {
  // 許可されているレアリティの定義
  private static readonly VALID_RARITIES = [
    "N",
    "R",
    "SR",
    "SSR",
    "UR",
  ] as const;

  // 各レアリティのデフォルト排出確率（%）
  private static readonly DEFAULT_RATES = {
    N: 50.0, // ノーマル: 50%
    R: 30.0, // レア: 30%
    SR: 15.0, // スーパーレア: 15%
    SSR: 4.0, // スーパースペシャルレア: 4%
    UR: 1.0, // ウルトラレア: 1%
  } as const;

  // コンストラクタをprivateにして、外部からの直接インスタンス化を防ぐ
  private constructor(
    private readonly _value: string, // レアリティ値（'N', 'R'など）
    private readonly _rate: number, // 排出確率
    private readonly _displayName: string // 表示名
  ) {}

  /**
   * 標準的なレアリティを作成する
   * デフォルトの確率設定を使用
   *
   * @param rarity レアリティ文字列（'N', 'R', 'SR', 'SSR', 'UR'）
   * @returns Rarityオブジェクト
   * @throws Error 無効なレアリティが指定された場合
   */
  static create(rarity: string): Rarity {
    // 1. 入力値の検証
    if (!this.isValidRarity(rarity)) {
      throw new Error(
        `Invalid rarity: ${rarity}. Valid rarities are: ${this.VALID_RARITIES.join(
          ", "
        )}`
      );
    }

    // 2. 型安全性のためのキャスト
    const typedRarity = rarity as keyof typeof this.DEFAULT_RATES;

    // 3. Rarityオブジェクトの作成と返却
    return new Rarity(
      rarity, // レアリティ値
      this.DEFAULT_RATES[typedRarity], // デフォルト確率
      this.getDisplayName(typedRarity) // 表示名（後で実装）
    );
  }

  /**
   * 指定された文字列が有効なレアリティかどうかをチェックする
   *
   * @param rarity チェックする文字列
   * @returns 有効なレアリティの場合true、無効な場合false
   */
  private static isValidRarity(rarity: string): boolean {
    // VALID_RARITIESの配列に含まれているかチェック
    return this.VALID_RARITIES.includes(rarity as any);
  }

  /**
   * レアリティの日本語表示名を取得する
   *
   * @param rarity レアリティキー（'N', 'R', 'SR', 'SSR', 'UR'）
   * @returns 日本語の表示名
   */
  private static getDisplayName(
    rarity: keyof typeof this.DEFAULT_RATES
  ): string {
    // レアリティごとの日本語表示名マッピング
    const displayNames = {
      N: "ノーマル",
      R: "レア",
      SR: "スーパーレア",
      SSR: "スーパースペシャルレア",
      UR: "ウルトラレア",
    } as const;

    // 対応する表示名を返す
    return displayNames[rarity];
  }

  /**
   * レアリティの値を取得する
   * 例: 'SSR', 'UR', 'N' など
   *
   * @returns レアリティ文字列
   */
  get value(): string {
    return this._value;
  }

  /**
   * レアリティの排出確率を取得する
   * 例: SSRなら4.0、Nなら50.0 など
   *
   * @returns 排出確率（パーセント）
   */
  get rate(): number {
    return this._rate;
  }

  /**
   * レアリティの日本語表示名を取得する
   * 例: 'SSR'なら'スーパースペシャルレア'
   *
   * @returns 日本語表示名
   */
  get displayName(): string {
    return this._displayName;
  }

  /**
   * 2つのレアリティが同じかどうかを判定する
   * 値オブジェクトの等価性比較
   *
   * @param other 比較対象のレアリティ
   * @returns 同じレアリティの場合true、異なる場合false
   */
  equals(other: Rarity): boolean {
    // レアリティの値が同じかどうかで判定
    return this._value === other._value;
  }

  /**
   * レアリティの情報を文字列で表現する
   * ログ出力やデバッグ時に使用
   *
   * @returns レアリティの詳細情報を含む文字列
   */
  toString(): string {
    return `${this._displayName}(${this._value}) - ${this._rate}%`;
  }

  /**
   * このレアリティが他のレアリティより上位かどうかを判定する
   * レアリティの序列: N < R < SR < SSR < UR
   *
   * @param other 比較対象のレアリティ
   * @returns このレアリティの方が上位の場合true、そうでなければfalse
   */
  isHigherThan(other: Rarity): boolean {
    // 配列のインデックスでレアリティの序列を表現
    const thisIndex = Rarity.VALID_RARITIES.indexOf(this._value as any);
    const otherIndex = Rarity.VALID_RARITIES.indexOf(other._value as any);

    // インデックスが大きいほど上位のレアリティ
    return thisIndex > otherIndex;
  }
}
