import { model, models } from "mongoose";
import {accountSchema} from "./Account"
import { raffleSchema } from "./Raffle";
import { buyDetailSchema } from "./BuyDetails";

const UserAccount = models.Account || model("Account", accountSchema)
const Raffle = models.Raffle || model("Raffle", raffleSchema)
const BuyDetail = models.BuyDetail || model("BuyDetail", buyDetailSchema)
 export { UserAccount, Raffle,BuyDetail}