import { Schema } from "mongoose";

export const raffleSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    vault: { type: String, required: true },
    inscription_id: { type: String, required: true },
    inscription_number: { type: Number, required: true },
    rune_id: { type: String, required: false },
    rune_name: { type: String, required: false },
    total_balance: { type: Number, required: false },
    rune_divisibility: { type: Number, required: false },
    end_date: { type: Date, required: true },
    total_tickets: { type: Number, required: true },
    price_per_ticket: { type: Number, required: true },
    sold_tickets: { type: Number, default: 0 },
    unsigned_psbt_base64: { type: String, required: true },
    status: { type: String, required: false },
    utxo_id: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);
