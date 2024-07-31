import * as bitcoin from "bitcoinjs-lib";
import { Schema } from "mongoose";
export interface IWalletDetails {
  ordinal_address: string;
  cardinal_address: string;
  ordinal_pubkey: string;
  cardinal_pubkey: string;
  wallet: string | null;
  connected?: boolean;
}

export interface IVaultDetails {
  ordinal_address: string;
  vault:string;
}


export interface IBalanceData {
  balance: number;
  mempool_balance: number;
  mempool_txs: string[];
  dummyUtxos?: number;
}




export interface IInscription {
  sat_collection?: any;//ISatCollection
  valid?: boolean;
  reinscriptions?: IInscription[];
  _id: string;
  inscription_number: number;
  inscription_id: string;
  content?: string;
  sha?: string;
  location?: string;
  output?: string;
  timestamp?: Date;
  children?: any[];
  next?: string;
  previous?: string;
  parent?: string;
  genesis_address?: string;
  genesis_fee?: number;
  genesis_height?: number;
  genesis_transaction?: string;
  flagged?: boolean;
  banned: boolean;
  reason?: string;
  updated_by?: string;
  block?: number;
  content_length?: number;
  content_type?: string;
  official_collection?: any;//ICollection
  collection_item_name?: string;
  collection_item_number?: number;
  attributes?: any[];//Attribute
  sat_timestamp?: Date;
  cycle?: number;
  decimal?: string;
  degree?: string;
  epoch?: number;
  percentile?: string;
  period?: number;
  rarity?: string;

  sat?: number;
  sat_name?: string;
  sat_offset?: number;
  lists?: Schema.Types.ObjectId[];
  tags?: string[];
  error?: boolean;
  error_retry?: number;
  error_tag?: string;
  offset?: number;
  output_value?: number;
  address?: string;
  listed?: boolean;
  listed_at?: Date;
  listed_price?: number;
  listed_maker_fee_bp?: number;
  tap_internal_key?: string;
  listed_seller_receive_address?: string;
  signed_psbt?: string;
  unsigned_psbt?: string;
  in_mempool: boolean;
  txid: string;
  sat_block_time?: Date;
  sattributes?: string[];
  last_checked?: Date;
  version?: number;
  token?: boolean;
  domain_valid?: boolean;

  // v12.1.3
  metadata?: any;
  metaprotocol?: string;
  parsed_metaprotocol?: string[];
  charms?: number;
  cbrc_valid?: boolean;
  listed_token?: string;
  listed_price_per_token?: number;
  listed_amount?: number;
}

// types/RaffleItem.ts
export type RaffleItem = {
  live: boolean;
  _id: string;
  address: string;
  inscription_id: string;
  inscription_number: number;
  rune_id: string;
  rune_name: string;
  total_balance: number;
  rune_divisibility: number;
  end_date: string; // Alternatively, you could use Date if you parse it
  total_tickets: number;
  price_per_ticket: number;
  sold_tickets: number;
  createdAt: string; // Alternatively, you could use Date if you parse it
  updatedAt: string; // Alternatively, you could use Date if you parse it
  __v: number;
};


export interface IRaffle {
  _id: string;
  address: string;
  inscription_id: string;
  inscription_number: number;
  rune_id: string;
  rune_name: string;
  total_balance: number;
  rune_divisibility: number;
  end_date: string;
  total_tickets: number;
  price_per_ticket: number;
  sold_tickets: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IUserRaffle {
  _id: string;
  raffle: IRaffle;
  ordinal_address: string;
  cardinal_address: string;
  ordinal_pubkey: string;
  cardinal_pubkey: string;
  wallet: string;
  quantity: number;
  rune_id: string;
  rune_name: string;
  __v: number;
}
