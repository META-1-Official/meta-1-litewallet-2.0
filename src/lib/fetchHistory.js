import Meta1 from "meta1-vision-dex";
import { getHistoryData } from "../API/API";
import { operationType, opText } from "../helpers/utility";

async function getHistory(event) {
  const numberOfRecords = event?.queryKey[0] === "history" ? 10000 : 3;
  const pageNo = event?.queryKey[1] || 1;
  const response = await getHistoryData(localStorage.getItem("login"), (pageNo-1)*100);
  const historyData = response.data.splice(0,numberOfRecords).map(async (value) => {
    let timestamp;
    let witness;
    const op = operationType(value.operation_type);
    const op_type = op[0];
    const op_color = op[1];
    const time = new Date(value.block_data.block_time);
    timestamp = time.toLocaleString();
    witness = value.witness;
    const parsed_op = value.operation_history.op_object;
    const operation = {
      operation_id: value.account_history.operation_id,
      block_num: value.block_data.block_num,
      operation_id_num: value.operation_id_num,
      time: timestamp,
      witness: witness,
      op_type: value.operation_type,
      op_color: op_color,
      count: response.count

    };
    const {op_text, symbol, amount} = await opText(value.operation_type, parsed_op);
    operation.operation_text = op_text;
    operation.symbol = symbol;
    operation.amount = amount;
    return operation;
  });
  const res = await Promise.all(historyData).then((values) => {
    return values;
  });
  return res;
}

export default getHistory;
