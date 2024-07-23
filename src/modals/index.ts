import { model, models } from "mongoose";
import {accountSchema} from "./Account"

const UserAccount = models.Account || model("Account", accountSchema)
 export { UserAccount}