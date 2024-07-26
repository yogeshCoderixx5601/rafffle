import { Schema } from "mongoose";

export const raffleSchema = new Schema(
  {
    address: { type: String, required: true },
    inscription_id: { type: String, required: true },
    inscription_number: { type: Number, required: true },
    rune_id: { type: String, required: true },
    rune_name: { type: String, required: true },
    total_balance: { type: Number, required: true },
    rune_divisibility: { type: Number, required: true },
    end_date: { type: Date, required: true },
    total_tickets: { type: Number, required: true },
    price_per_ticket: { type: Number, required: true },
    sold_tickets: { type: Number, default:0 },
  },
  {
    timestamps: true,
  }
);
