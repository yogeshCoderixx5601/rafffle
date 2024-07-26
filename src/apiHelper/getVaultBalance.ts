import axios from "axios";

export async function getVaultBalance(
  ordinal_address: string
): Promise<{ data?: any; error: string | null } | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/get-vault-balance`;
    const response = await axios.get(url, {
      params: { ordinal_address },
      headers: {
        Accept: "application/json",
      },
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
