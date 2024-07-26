import { Schema } from "mongoose";

export const accountSchema = new Schema({
  ordinal_address:{type:String, required:true, unique:true},
  vault: { type: String, required: true, unique:true },
  privkey: { type: String, required: true },
  leaf: { type: String, required: true },
  tapkey: { type: String, required: true },
});
