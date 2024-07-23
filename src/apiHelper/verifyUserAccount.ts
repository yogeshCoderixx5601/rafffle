import axios from "axios";

interface UserResponse {
  success: boolean;
  message: string;
  result: any[];
}

export async function verifyingUserAccount(
  ordinal_address: string
): Promise<{ data?: UserResponse; error: string | null } | undefined> {
  try {
    const url = `${process.env.NEXT_PUBLIC_URL}/api/verify-user-account`;
    const response = await axios.get(url, {
      params: { ordinal_address },
    });

    if (response.status === 200) {
      return { data: response.data, error: null };
    } else {
      return { error: `Request failed with status code: ${response.status}` };
    }
  } catch (error: any) {
    return { error: error?.message || "An unknown error occurred" };
  }
}
