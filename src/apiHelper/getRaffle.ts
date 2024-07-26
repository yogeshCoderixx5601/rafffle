import axios from "axios";

interface Raffle {
  ordinal_address: string  ;
}

export async function getRaffle(
  params?: any
): Promise<{ data?: any; error: string | null } | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/raffle`;
    const response = await axios.get(url, {
      params:{ordinal_address:params.ordinal_address},
    });

    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error:any) {
    return { error: error?.message || "An unknown error occurred" };
  }
}
