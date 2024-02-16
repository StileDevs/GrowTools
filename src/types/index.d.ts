declare module "react" {
  interface HTMLAttributes<T> extends React.DOMAttributes<T> {
    dataid?: number;
  }
}
export interface StringOptions {
  id?: number;
  encoded?: boolean;
}

export interface ItemDefinition {
  [key: string]: string;
  id?: number;

  flags?: number;
  flagsCategory?: number;
  type?: number;
  materialType?: number;

  name?: string;

  texture?: string;
  textureHash?: number;
  visualEffectType?: number;

  flags2?: number;

  textureX?: number;
  textureY?: number;
  storageType?: number;
  isStripeyWallpaper?: number;
  collisionType?: number;

  breakHits?: number;

  resetStateAfter?: number;
  bodyPartType?: number;
  blockType?: number;
  growTime?: number;
  rarity?: number;
  maxAmount?: number;
  extraFile?: string;
  extraFileHash?: number;
  audioVolume?: number;

  petName?: string;
  petPrefix?: string;
  petSuffix?: string;
  petAbility?: string;

  seedBase?: number;
  seedOverlay?: number;
  treeBase?: number;
  treeLeaves?: number;

  seedColor?: number;
  seedOverlayColor?: number;
  isMultiFace?: number;

  isRayman?: number;

  extraOptions?: string;
  texture2?: string;
  extraOptions2?: string;
  punchOptions?: string;

  extraBytes?: number[] | Uint8Array;

  // new options
  ingredient?: number;
  flags3?: number;
  flags4?: number;
  bodyPart?: number[] | Uint8Array;
  flags5?: number;
  extraTexture?: string;
  itemRenderer?: string;
}

export interface ItemsDatMeta {
  version?: number;
  itemCount?: number;

  items: ItemDefinition[];

  hash?: number;
}

export interface MipMap {
  width: number;
  height: number;
  bufferLength: number;
  count: number;
}

export interface RTPACK {
  type: string;
  version: number;
  reserved: number;
  compressedSize: number;
  decompressedSize: number;
  compressionType: number;
  reserved2: Int8Array;
}

export interface RTTXTR {
  type: string;
  version: number;
  reserved: number;
  width: number;
  height: number;
  format: number;
  originalWidth: number;
  originalHeight: number;
  isAlpha: number;
  isCompressed: number;
  reservedFlags: number;
  mipmap: MipMap;
  reserved2: Int32Array;
}
