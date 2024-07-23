import { Schema } from "mongoose";

export const accountSchema = new Schema({
  ordinal_address:{type:String, required:true, unique:true},
  ordinal_pubkey:{type:String, required:true},
  userAddress: { type: String, required: true, unique:true },
  privkey: { type: String, required: true },
  leaf: { type: String, required: true },
  tapkey: { type: String, required: true },
});
