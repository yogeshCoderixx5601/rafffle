"use server";
import axios from "axios";
interface BuyDetails {
  raffle:string;
  ordinal_address: string;
  cardinal_address: string;
  ordinal_pubkey: string;
  cardinal_pubkey: string;
  wallet: string | null;
  quantity: number | string;
  rune_id: string;
  rune_name: string;
}

export async function buyTickets(
  buyerDetais: BuyDetails
): Promise<{ data?: any; error: string | null } | undefined> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/api/buy-tickets`;
    const response = await axios.post(url, buyerDetais);

    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error:any) {
    return { error: error?.message || "An unknown error occurred" };
  }
}
