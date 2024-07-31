import axios from 'axios';
import { doesUtxoContainInscription } from '../MarketPlace';

export async function getInscriptionFromMempoolAPI(wallet: string) {
  const { data: utxos } = await axios.get(
    `https://mempool.space/testnet/api/address/${wallet}/utxo`
  );

  const inscriptions = [];

  for (const utxo of utxos) {
    const inscription = await doesUtxoContainInscription(utxo);
    if (inscription) {
      inscriptions.push({
        inscription_id: inscription,
        inscription_number: 55555,
        address: wallet,
      });
    }
  }

  return inscriptions;
}

