import axios from "axios";

export async function getVaultBalance(address: string) {
  console.log("********GETTING VAULT BALANCE UTILS***********");
  try {
    const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
      ? "http://192.168.1.17:8003/"
      : `${process.env.NEXT_PUBLIC_PROVIDER}/`;

    if (!apiUrl) {
      console.warn("API provider URL is not defined in environment variables");
      return undefined;
    }

    const url = `${apiUrl}v1/runes/get_current_balance_of_wallet?address=${address}`;
    // console.log({ url });
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });
    // console.log(response.data, "api getVaultBalance utils");

    return response.data;
  } catch (error) {}
}
// http://192.168.1.17:8003/v1/runes/get_current_balance_of_wallet?address=tb1pf54fmtpk00d8afkh5f74pne73ppq64fhqdn5vflgzt75pn3gmnlsm6fcfy



export async function doesUtxoContainInscription(utxo: any): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_NETWORK?.includes("testnet")
    ? process.env.NEXT_PUBLIC_PROVIDER_TESTNET
    : "https://ord.ordinalnovus.com/api";

  if (!apiUrl) {
    // If the API URL is not set, return true as per your requirement
    console.warn("API provider URL is not defined in environment variables");
    return true;
  }

  try {
    const url = `${apiUrl}/output/${utxo.txid}:${utxo.vout}`;
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    // console.log(
    //   Array.isArray(response.data.inscriptions),
    //   "CHECK",
    //   response.data.inscriptions
    // );
    if (
      response.data &&
      Array.isArray(response.data.inscriptions) &&
      response.data.inscriptions.length > 0
    ) {
      return response.data.inscriptions[0];
    } else if (response.data.inscriptions.length === 0) {
      // If the data is empty array, return false
      // console.warn('Empty Array is returned');
      return false;
    } else {
      return true;
    }
  } catch (error) {
    // In case of any API error, return true
    console.error("Error in doesUtxoContainInscription:", error);
    return true;
  }
}
