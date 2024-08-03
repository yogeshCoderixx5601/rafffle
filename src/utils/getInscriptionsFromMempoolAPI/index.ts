import axios from "axios";
import { doesUtxoContainInscription } from "../MarketPlace";

export async function getInscriptionFromMempoolAPI(wallet: string) {
  console.log("******getInscriptionFromMempoolAPI*******")
  const url = `https://mempool.space/testnet/api/address/${wallet}/utxo`;
  console.log(url,"---url")
  const { data: utxos } = await axios.get(url);

  console.log(utxos,'------utxos getInscriptionFromMempoolAPI')
  const inscriptions = [];

  console.log({ utxos: utxos.length });

  for (const utxo of utxos) {
    const inscription = await doesUtxoContainInscription(utxo);
    console.log(inscription, "have inscription");
    if (inscription) {
      inscriptions.push({
        inscription_id: inscription.inscription_id,
        inscription_number: 55555,
        address: wallet,
        txid: inscription.txid,
        vout: inscription.vout,
        value: inscription.value,
      });
    }
  }

  console.log(inscriptions, "array inscriptions");

  return inscriptions;
}
