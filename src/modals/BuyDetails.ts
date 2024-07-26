import { Schema } from "mongoose";

export const buyDetailSchema = new Schema({
  raffle_id:{type:String, required:true},
  ordinal_address: { type: String, required: true },
  cardinal_address: { type: String, required: true },
  ordinal_pubkey: { type: String, required: true },
  cardinal_pubkey: { type: String, required: true },
  wallet: { type: String, required: true },
  quantity: { type: Number, requited: true },
  rune_id: { type: String, requited: true },
  rune_name: { type: String, requited: true },
});


// raffle: { type: Schema.Types.ObjectId, ref: 'Raffle', required: true },