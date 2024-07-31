"use server"
import axios from "axios";

export interface FetchRaffleParams {
  raffleId?: string;
  ordinal_address?: string;
  vault?:string
  live?: boolean;
}

interface GetRafflesResponse {
  data?: any;
  error: string | null;
}

export async function getRaffles(params: FetchRaffleParams ={}): Promise<GetRafflesResponse> {
  try {
    const { raffleId, ordinal_address,vault,live } = params;
    console.log(params,"-----------get raffles api helper params")
    const url = `${process.env.NEXT_PUBLIC_URL}/api/raffles`;
    const response = await axios.get(url, {
      params: {
        _id: raffleId,
        address: ordinal_address,
        vault,
        live,
      },
    });

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
