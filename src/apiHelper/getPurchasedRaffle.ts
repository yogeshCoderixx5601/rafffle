"use server"
import axios from "axios";

export interface FetchRaffleParams {
  raffle?: string;
  ordinal_address?:string;
}

interface GetRafflesResponse {
  data?: any;
  error: string | null;
}

export async function getPurchasedRaffle(params: FetchRaffleParams ={}): Promise<GetRafflesResponse> {
  try {
    const {  raffle, ordinal_address } = params;
    // console.log(params,"----params")
    const url = `${process.env.NEXT_PUBLIC_URL}/api/buy-tickets`;
    const response = await axios.get(url, {
      params: {
         raffle,
         ordinal_address
      },
    });
    // console.log(response, 'RAW RESPONSE');

    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      return { data: null, error: `Request failed with status code: ${response.status}` };
    }
  } catch (error: any) {
    console.error('Error fetching raffles:', error);
    return { data: null, error: error?.message || 'An unknown error occurred' };
  }
}
