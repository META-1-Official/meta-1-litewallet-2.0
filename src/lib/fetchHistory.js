import Meta1 from "meta1-vision-dex";
import { operationType, opText, trxTypes } from "../helpers/utility";
import { ChainTypes as grapheneChainTypes } from 'meta1-vision-js';
const {operations} = grapheneChainTypes;
const ops = Object.keys(operations);
ops.push(
	'property_create_operation',
	'property_update_operation',
	'property_approve_operation',
	'property_delete_operation',
	'asset_price_publish_operation'
);
async function getHistory(event) {
  const amount = event?.queryKey[0] === "history" ? 10 : 3;
  let rawData = await Meta1.history.get_account_history(
    localStorage.getItem("login"),
    "1.11.0",
    40,
    "1.11.0"
  );
  let newRawData = [];
  for (let i = 0; i < rawData.length; i++) {
    if (newRawData.length !== amount) {
      if (rawData[i].virtual_op === 0) {
        // Exchange proccesing
        if (rawData[i].op[1]?.seller) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.amount_to_sell?.asset_id,
          ]);
          let preAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.min_to_receive?.asset_id,
          ]);
          let block = await Meta1.db.get_block(rawData[i].block_num);
          let date = new Date(block.timestamp);
          let splitedBlock = new Date(date).toUTCString().split(" ");
          newRawData.push({
            asset: {
              name: "",
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Exchange",
            usersData: `${localStorage.getItem("login")}`,
            volume:
              rawData[i].op[1]?.min_to_receive?.amount /
              10 ** preAsset[0].precision,
            status: "Done",
            time: `${splitedBlock[1]} ${splitedBlock[2]}, ${splitedBlock[3]}, ${splitedBlock[4]}
              `,
          });
        }
        // Send proccesing
        else if (rawData[i].op[1]?.from) {
          let exchangeAsset = await Meta1.db.get_objects([
            rawData[i]?.op[1]?.amount.asset_id,
          ]);
          let from = (await Meta1.accounts[rawData[i]?.op[1]?.from]).name;
          let to = (await Meta1.accounts[rawData[i]?.op[1]?.to]).name;
          let block = await Meta1.db.get_block(rawData[i].block_num);
          let date = new Date(block.timestamp);
          let splitedBlock = new Date(date).toUTCString().split(" ");
          newRawData.push({
            asset: {
              name: "",
              abbr: exchangeAsset[0]?.symbol?.toUpperCase(),
            },
            type: "Send",
            usersData: `${from} / ${to}`,
            volume:
              rawData[i].op[1]?.amount?.amount / 10 ** exchangeAsset[0].precision,
              status: "Done",
            time: `${splitedBlock[1]} ${splitedBlock[2]}, ${splitedBlock[3]}, ${splitedBlock[4]}
              `,
          });
        }
      }
    }
  }
  return newRawData;
}

export default getHistory;
