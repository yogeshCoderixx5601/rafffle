"use server";
import { IWalletDetails } from "@/types";
import axios from "axios";

// interface IVaultDetails {
//   ordinal_address: string;
//   vault: string;
// }

// interface ICreateUserResponse {
//   success: boolean;
//   message: string;
//   result: IVaultDetails[];
// }

export async function createRaffle(
  raffleDetails: any
): Promise<{ data?: any; error: string | null } | undefined> {
  try {
    console.log(raffleDetails)
    let url = `${process.env.NEXT_PUBLIC_URL}/api/create-raffle`;
    const response = await axios.post(url, 
      raffleDetails,
    );

    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error:any) {
    return { error: error?.message || "An unknown error occurred" };
  }
}
