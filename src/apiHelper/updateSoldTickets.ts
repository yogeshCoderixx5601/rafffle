"use server";
import axios from "axios";



export async function updateSoldTickets(
  ticketsCount: {_id:string, sold_tickets:number | '' }
): Promise<{ data?: any; error: string | null } | undefined> {
  try {
    let url = `${process.env.NEXT_PUBLIC_URL}/api/create-raffle`;
    const response = await axios.put(url, 
      ticketsCount
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
