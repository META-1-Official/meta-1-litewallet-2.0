import UseAccount from "./UseAccount";
import UseAsset from "./useAssets";
import { expFloatToFixed, ceilFloat, floorFloat } from '../lib/math';

export const formatNumber = (x) => {
  try {
    var parts = x.toString().split('.');

    if (x < 1) {
      // parts[1] = parts[1];
    } else if (x > 1 && x < 100) {
      parts[1] = parts[1].substr(0, 2);
    } else if (x > 100 && x < 1000) {
      parts[1] = parts[1].substr(0, 1);
    } else if (x > 1000) {
      parts[1] = '';
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (x > 1000) {
      return parts[0];
    } else {
      return parts.join('.');
    }
  } catch (err) {
    return x;
  }
};

export const opMapping = {
  0: 'TRANSFER',
  1: 'LIMIT ORDER CREATE',
  2: 'LIMIT ORDER CANCEL',
  3: 'CALL ORDER UPDATE',
  4: 'FILL ORDER',
  5: 'ACCOUNT CREATE',
  6: 'ACCOUNT UPDATE',
  7: 'ACCOUNT WHITELIST',
  8: 'ACCOUNT UPGRADE',
  9: 'ACCOUNT TRANSFER',
  10: 'ASSET CREATE',
  11: 'ASSET UPDATE',
  12: 'ASSET UPDATE BITASSET',
  13: 'ASSET UPDATE FEED PRODUCERS',
  14: 'ASSET ISSUE',
  15: 'ASSET RESERVE',
  16: 'ASSET FUND FEE POOL',
  17: 'ASSET SETTLE',
  18: 'ASSET GLOBAL SETTLE',
  19: 'ASSET PUBLISH FEED',
  20: 'WITNESS CREATE',
  21: 'WITNESS UPDATE',
  22: 'PROPOSAL CREATE',
  23: 'PROPOSAL UPDATE',
  24: 'PROPOSAL DELETE',
  25: 'WITHDRAW PERMISSION CREATE',
  26: 'WITHDRAW PERMISSION',
  27: 'WITHDRAW PERMISSION CLAIM',
  28: 'WITHDRAW PERMISSION DELETE',
  29: 'COMMITTEE MEMBER CREATE',
  30: 'COMMITTEE MEMBER UPDATE',
  31: 'COMMITTEE MEMBER UPDATE GLOBAL PARAMETERS',
  32: 'VESTING BALANCE CREATE',
  33: 'VESTING BALANCE WITHDRAW',
  34: 'WORKER CREATE',
  35: 'CUSTOM',
  36: 'ASSERT',
  37: 'BALANCE CLAIM',
  38: 'OVERRIDE TRANSFER',
  39: 'TRANSFER TO BLIND',
  40: 'BLIND TRANSFER',
  41: 'TRANSFER FROM BLIND',
  42: 'ASSET SETTLE CANCEL',
  43: 'ASSET CLAIM FEES',
  44: 'FBA DISTRIBUTE',
  45: 'BID COLLATERAL',
  46: 'EXECUTE BID',
  47: 'ASSET CLAIM POOL',
  48: 'ASSET UPDATE ISSUER',
  49: 'HTLC CREATE',
  50: 'HTLC REDEEM',
  51: 'HTLC REDEEMED',
  52: 'HTLC EXTEND',
  53: 'HTLC REFUND',
  54: 'PROPERTY CREATE',
  55: 'PROPERTY UPDATE',
  56: 'PROPERTY APPROVE',
  57: 'PROPERTY DELETE',
  58: 'ASSET PRICE PUBLISH',
};
export const trxTypes =	{
  "amount": "Amount",
  "date": "Date",
  "time": "Time",
  "name": "Username",
  "received": "Received",
  "sent": "Sent",
  "last_month": "Last month",
  "last_week": "Last week",
  "24h": "24 hours",
  "from": "From",
  "to": "To",
  "account_create": "Create account",
  "account_transfer": "Transfer Account",
  "account_update": "Update account",
  "account_upgrade": "Upgrade Account",
  "account_whitelist": "Account whitelist",
  "all": "Show all",
  "assert": "Assert operation",
  "asset_bid_collateral": "Bid collateral",
  "asset_claim_fee_pool": "Claim fee pool balance",
  "asset_claim_fees": "Claim asset fees",
  "asset_claim_pool": "Claim asset fee pool",
  "asset_create": "Create asset",
  "asset_fund_fee_pool": "Fund asset fee pool",
  "asset_global_settle": "Global asset settlement",
  "asset_issue": "Issue asset",
  "asset_publish_feed": "Publish feed",
  "asset_reserve": "Burn asset",
  "asset_settle": "Asset settlement",
  "asset_settle_cancel": "Cancel asset settlement",
  "asset_update": "Update asset",
  "asset_update_bitasset": "Update SmartCoin",
  "asset_update_feed_producers": "Update asset feed producers",
  "asset_update_issuer": "Update asset issuer",
  "balance_claim": "Claim balance",
  "bid_collateral": "Collateral bid",
  "blind_transfer": "Blinded transfer",
  "call_order_update": "Update margin",
  "committee_member_create": "Create committee member",
  "committee_member_update": "Update committee member",
  "committee_member_update_global_parameters": "Global parameters update",
  "custom": "Custom",
  "execute_bid": "Execute bid",
  "fba_distribute": "Fee backed asset distribution",
  "fill_order": "Fill order",
  "htlc_create": "HTLC create",
  "htlc_extend": "HTLC extend",
  "htlc_redeem": "HTLC redeem",
  "htlc_redeemed": "HTLC redeemed",
  "htlc_refund": "HTLC refund",
  "limit_order_cancel": "Cancel order",
  "limit_order_create": "Place order",
  "override_transfer": "Override transfer",
  "proposal_create": "Create proposal",
  "proposal_delete": "Delete proposal",
  "proposal_update": "Update proposal",
  "transfer": "Transfer",
  "transfer_from_blind": "Transfer from blinded account",
  "transfer_to_blind": "Transfer to blinded account",
  "vesting_balance_create": "Create vesting balance",
  "vesting_balance_withdraw": "Withdraw vesting balance",
  "withdraw_permission_claim": "Claim withdrawal permission",
  "withdraw_permission_create": "Create withdrawal permission",
  "withdraw_permission_delete": "Delete withdrawal permission",
  "withdraw_permission_update": "Update withdrawal permission",
  "witness_create": "Create witness",
  "witness_update": "Update witness",
  "witness_withdraw_pay": "Witness pay withdrawal",
  "worker_create": "Create worker",
  "property_create_operation": "Create property",
  "property_update_operation": "Update property",
  "property_approve_operation:": "Approve property",
  "property_delete_operation": "Delete property",
  "asset_price_publish_operation": "Publish asset price"
}

export const operationType = (_opType) => {
  var name;
  var color;
  var results = [];
  var opType = Number(_opType);
  if (opType === 0) {
    name = opMapping[0];
    color = '81CA80';
  } else if (opType === 1) {
    name = opMapping[1];
    color = '6BBCD7';
  } else if (opType === 2) {
    name = opMapping[2];
    color = 'E9C842';
  } else if (opType === 3) {
    name = opMapping[3];
    color = 'E96562';
  } else if (opType === 4) {
    name = opMapping[4];
    color = '008000';
  } else if (opType === 5) {
    name = opMapping[5];
    color = 'CCCCCC';
  } else if (opType === 6) {
    name = opMapping[6];
    color = 'FF007F';
  } else if (opType === 7) {
    name = opMapping[7];
    color = 'FB8817';
  } else if (opType === 8) {
    name = opMapping[8];
    color = '552AFF';
  } else if (opType === 9) {
    name = opMapping[9];
    color = 'AA2AFF';
  } else if (opType === 10) {
    name = opMapping[10];
    color = 'D400FF';
  } else if (opType === 11) {
    name = opMapping[11];
    color = '0000FF';
  } else if (opType === 12) {
    name = opMapping[12];
    color = 'AA7FFF';
  } else if (opType === 13) {
    name = opMapping[13];
    color = '2A7FFF';
  } else if (opType === 14) {
    name = opMapping[14];
    color = '7FAAFF';
  } else if (opType === 15) {
    name = opMapping[15];
    color = '55FF7F';
  } else if (opType === 16) {
    name = opMapping[16];
    color = '55FF7F';
  } else if (opType === 17) {
    name = opMapping[17];
    color = 'F1CFBB';
  } else if (opType === 18) {
    name = opMapping[18];
    color = 'F1DFCC';
  } else if (opType === 19) {
    name = opMapping[19];
    color = 'FF2A55';
  } else if (opType === 20) {
    name = opMapping[20];
    color = 'FFAA7F';
  } else if (opType === 21) {
    name = opMapping[21];
    color = 'F1AA2A';
  } else if (opType === 22) {
    name = opMapping[22];
    color = 'FFAA55';
  } else if (opType === 23) {
    name = opMapping[23];
    color = 'FF7F55';
  } else if (opType === 24) {
    name = opMapping[24];
    color = 'FF552A';
  } else if (opType === 25) {
    name = opMapping[25];
    color = 'FF00AA';
  } else if (opType === 26) {
    name = opMapping[26];
    color = 'FF00FF';
  } else if (opType === 27) {
    name = opMapping[27];
    color = 'FF0055';
  } else if (opType === 28) {
    name = opMapping[28];
    color = '37B68Cc';
  } else if (opType === 29) {
    name = opMapping[29];
    color = '37B68C';
  } else if (opType === 30) {
    name = opMapping[30];
    color = '6712E7';
  } else if (opType === 31) {
    name = opMapping[31];
    color = 'B637B6';
  } else if (opType === 32) {
    name = opMapping[32];
    color = 'A5A5A5';
  } else if (opType === 33) {
    name = opMapping[33];
    color = '696969';
  } else if (opType === 34) {
    name = opMapping[34];
    color = '0F0F0F';
  } else if (opType === 35) {
    name = opMapping[35];
    color = '0DB762';
  } else if (opType === 36) {
    name = opMapping[36];
    color = 'D1EEFF';
  } else if (opType === 37) {
    name = opMapping[37];
    color = '939314';
  } else if (opType === 38) {
    name = opMapping[38];
    color = '8D0DB7';
  } else if (opType === 39) {
    name = opMapping[39];
    color = 'C4EFC4';
  } else if (opType === 40) {
    name = opMapping[40];
    color = 'F29DF2';
  } else if (opType === 41) {
    name = opMapping[41];
    color = '9D9DF2';
  } else if (opType === 42) {
    name = opMapping[42];
    color = '4ECEF8';
  } else if (opType === 43) {
    name = opMapping[43];
    color = 'F8794E';
  } else if (opType === 44) {
    name = opMapping[44];
    color = '8808B2';
  } else if (opType === 45) {
    name = opMapping[45];
    color = '6012B1';
  } else if (opType === 46) {
    name = opMapping[46];
    color = '1D04BB';
  } else if (opType === 47) {
    name = opMapping[47];
    color = 'AAF654';
  } else if (opType === 48) {
    name = opMapping[48];
    color = 'AB7781';
  } else if (opType === 49) {
    name = opMapping[49];
    color = '11e0dc';
  } else if (opType === 50) {
    name = opMapping[50];
    color = '085957';
  } else if (opType === 51) {
    name = opMapping[51];
    color = 'AB7781';
  } else if (opType === 52) {
    name = opMapping[52];
    color = '093f3e';
  } else if (opType === 53) {
    name = opMapping[53];
    color = '369694';
  } else if (opType === 54) {
    name = opMapping[54];
    color = '169524';
  } else if (opType === 55) {
    name = opMapping[55];
    color = '169524';
  } else if (opType === 56) {
    name = opMapping[56];
    color = '169524';
  } else if (opType === 57) {
    name = opMapping[57];
    color = '169524';
  } else if (opType === 58) {
    name = opMapping[58];
    color = 'FF2A55';
  } else {
    name = 'UNKNOWN (' + opType + ')';
    color = '369694';
  }

  results[0] = name;
  results[1] = color;

  return results;
};


export const opText = (operation_type, operation) => {
  var operation_account = 0;
  var operation_text;
  var fee_paying_account;

  switch (operation_type) {
    case 0:
      var from = operation.from;
      var to = operation.to;

      var amount_asset_id = operation.amount_.asset_id;
      var amount_amount = operation.amount_.amount;

      operation_account = from;

      return UseAccount(operation_account).then((response_name) => {
        // get me the to name:
        return UseAccount(to).then((response_name_to) => {
          var to_name = response_name_to;

          return UseAsset(amount_asset_id).then((response_asset) => {
            var asset_name = response_asset.data.symbol;
            var asset_precision = response_asset.data.precision;

            var divideby = Math.pow(10, asset_precision);
            var amount = Number(amount_amount / divideby);

            operation_text = response_name;
            operation_text =
              operation_text +
              ' sent ' +
              formatNumber(amount) +
              " " +
              asset_name +
              ' to ' +
              to_name;

            return { op_text: operation_text, symbol: asset_name, amount: formatNumber(amount) };
          });
        });
      });
    case 1:
      var seller = operation.seller;
      operation_account = seller;

      var amount_to_sell_asset_id = operation.amount_to_sell.asset_id;
      var amount_to_sell_amount = operation.amount_to_sell.amount;

      var min_to_receive_asset_id = operation.min_to_receive.asset_id;
      var min_to_receive_amount = operation.min_to_receive.amount;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(amount_to_sell_asset_id).then((response_asset1) => {
          var sell_asset_name = response_asset1.data.symbol;
          var sell_asset_precision = response_asset1.data.precision;

          var divideby = Math.pow(10, sell_asset_precision);
          var sell_amount = expFloatToFixed(Number(amount_to_sell_amount / divideby));
          sell_amount = expFloatToFixed(sell_amount).toString().substring(0, sell_asset_precision + 1);

          return UseAsset(min_to_receive_asset_id).then((response_asset2) => {
            var receive_asset_name = response_asset2.data.symbol;
            var receive_asset_precision = response_asset2.data.precision;

            var divideby = Math.pow(10, receive_asset_precision);
            var receive_amount = Number(min_to_receive_amount / divideby);
            receive_amount = expFloatToFixed(receive_amount).toString().substring(0, receive_asset_precision + 1);
            divideby = Math.pow(10, Math.abs(response_asset1.data.precision - response_asset2.data.precision));
            var direction = (response_asset1.data.precision - response_asset2.data.precision) > 0;
            divideby = direction ? divideby : 1 / divideby
            var price = floorFloat(amount_to_sell_amount / min_to_receive_amount / divideby, 6);

            operation_text = response_name;
            operation_text =
              operation_text +
              ' wants ' +
              formatNumber(receive_amount) +
              " " +
              receive_asset_name +
              ' for ';
            operation_text =
              operation_text +
              formatNumber(sell_amount) +
              " " +
              sell_asset_name;
            operation_text += ` at ${price} ${response_asset1.data.symbol}/${response_asset2.data.symbol}`;
            return { op_text: operation_text, symbol: receive_asset_name, amount: formatNumber(receive_amount) };
          });
        });
      });

    case 2:
      fee_paying_account = operation.fee_paying_account;
      operation_account = fee_paying_account;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' cancelled order ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 3:
      var funding_account = operation.funding_account;
      var delta_collateral_asset_id = operation.delta_collateral.asset_id;
      var delta_debt_asset_id = operation.delta_debt.asset_id;

      return UseAccount(funding_account).then((response_name) => {
        return UseAsset(delta_collateral_asset_id).then((response_asset1) => {
          var asset1 = response_asset1.data.symbol;

          return UseAsset(delta_debt_asset_id).then((response_asset2) => {
            var asset2 = response_asset2.data.symbol;

            operation_text =
              response_name +
              ' update debt/collateral for ';
            operation_text =
              operation_text +
              asset1 +
              '/' +
              asset2;
            return { op_text: operation_text, symbol: asset1, amount: 0 };
          });
        });
      });

    case 4:
      var account_id = operation.account_id;
      operation_account = account_id;

      var pays_asset_id = operation.pays.asset_id;
      var pays_amount = operation.pays.amount;

      var receives_asset_id = operation.receives.asset_id;
      var receives_amount = operation.receives.amount;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(pays_asset_id).then((response_asset1) => {
          var pays_asset_name = response_asset1.data.symbol;
          var pays_asset_precision = response_asset1.data.precision;

          var divideby = Math.pow(10, pays_asset_precision);
          var p_amount = parseFloat(pays_amount / divideby);
          p_amount = expFloatToFixed(p_amount).toString().substring(0, pays_asset_precision + 1);

          return UseAsset(receives_asset_id).then((response_asset2) => {
            var receive_asset_name = response_asset2.data.symbol;
            var receive_asset_precision = response_asset2.data.precision;

            var divideby = Math.pow(10, receive_asset_precision);
            var receive_amount = Number(receives_amount / divideby);
            receive_amount = expFloatToFixed(receive_amount).toString().substring(0, receive_asset_precision + 1);
            divideby = Math.pow(10, Math.abs(response_asset2.data.precision - response_asset1.data.precision));
            var direction = (response_asset2.data.precision - response_asset1.data.precision) > 0;
            divideby = direction ? divideby : 1 / divideby
            var price = floorFloat(pays_amount / receives_amount * divideby, 6);

            operation_text = response_name;
            operation_text =
              operation_text +
              ' paid ' +
              formatNumber(p_amount) +
              " " +
              pays_asset_name +
              ' for ';
            operation_text =
              operation_text +
              formatNumber(receive_amount) +
              " " +
              receive_asset_name;
            operation_text += ` at ${price} ${response_asset1.data.symbol}/${response_asset2.data.symbol}`;
            return { op_text: operation_text, symbol: pays_asset_name, amount: formatNumber(p_amount) };
          });
        });
      });

    case 5:
      var registrar = operation.registrar;
      var referrer = operation.referrer;
      var name = operation.name;
      operation_account = registrar;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' register ' +
          name;

        if (registrar !== referrer) {
          return UseAccount(referrer).then((response_name2) => {
            operation_text =
              operation_text +
              ' thanks to ' +
              response_name2;
            return { op_text: operation_text, symbol: null, amount: 0 };
          });
        } else {
          return { op_text: operation_text, symbol: null, amount: 0 };
        }
      });
    case 6:
      operation_account = operation.account;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' updated their wallet data change ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 7:
      operation_account = operation.authorizing_account;
      var account_to_list = operation.account_to_list;
      var new_listing = operation.new_listing;
      var type = ' whitelisted ';
      if (new_listing === 2) type = ' blacklisted ';

      return UseAccount(operation_account).then((response_name) => {
        return UseAccount(account_to_list).then((response_name2) => {
          operation_text =
            response_name +
            type +
            ' the wallet ' +
            response_name2;
          return { op_text: operation_text, symbol: null, amount: 0 };
        });
      });

    case 8:
      return UseAccount(operation.account_to_upgrade).then((response) => {
        operation_text =
          response +
          ' upgraded the wallet ';

        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 14:
      var issuer = operation.issuer;
      var issue_to_account = operation.issue_to_account;
      var asset_to_issue_amount = operation.asset_to_issue.amount;
      var asset_to_issue_asset_id = operation.asset_to_issue.asset_id;

      return UseAccount(issuer).then((response_name) => {
        return UseAsset(asset_to_issue_asset_id).then((response_asset) => {
          var asset_precision = response_asset.data.precision;

          var divideby = Math.pow(10, asset_precision);
          var amount = Number(asset_to_issue_amount / divideby);

          return UseAccount(issue_to_account).then((response_name2) => {
            operation_text =
              response_name +
              ' issued ' +
              amount;
            operation_text =
              operation_text +
              " " +
              response_asset.data.symbol;
            operation_text =
              operation_text +
              ' to ' +
              response_name2;
            return { op_text: operation_text, symbol: response_asset.data.symbol, amount: 0 };
          });
        });
      });

    case 15:
      operation_account = operation.payer;

      var amount_to_reserve_amount = operation.amount_to_reserve.amount;
      var amount_to_reserve_asset_id = operation.amount_to_reserve.asset_id;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(amount_to_reserve_asset_id).then((response_asset) => {
          var asset_name = response_asset.data.symbol;
          var asset_precision = response_asset.data.precision;
          var divideby = Math.pow(10, asset_precision);
          var amount = Number(amount_to_reserve_amount / divideby);

          operation_text =
            response_name +
            ' burned(reserved) ' +
            formatNumber(amount) +
            asset_name;
          return { op_text: operation_text, symbol: null, amount: formatNumber(amount) };
        });
      });

    case 19:
      var publisher = operation.publisher;
      var asset_id = operation.asset_id;
      operation_account = publisher;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(asset_id).then((response_asset) => {
          operation_text =
            response_name +
            ' published feed for ';
          operation_text =
            operation_text +
            response_asset.data.symbol;
          return { op_text: operation_text, symbol: response_asset.data.symbol, amount: 0 };
        });
      });

    case 22:
      fee_paying_account = operation.fee_paying_account;
      operation_account = fee_paying_account;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' created a proposal ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 23:
      fee_paying_account = operation.fee_paying_account;
      var proposal = operation.proposal;
      operation_account = fee_paying_account;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          '  updated ';
        operation_text =
          operation_text +
          ' proposal ' +
          proposal;
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 24:
      fee_paying_account = operation.fee_paying_account;
      operation_account = fee_paying_account;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' deleted a proposal';
        return { op_text: operation_text, symbol: null, amount: 0 };
    });

    case 33:
      operation_account = operation.owner_;

      amount_amount = operation.amount_.amount;
      amount_asset_id = operation.amount_.asset_id;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(amount_asset_id).then((response_asset) => {
          var asset_name = response_asset.data.symbol;
          var asset_precision = response_asset.data.precision;
          var divideby = Math.pow(10, asset_precision);
          var amount = Number(amount_amount / divideby);

          operation_text =
            response_name +
            ' withdrew vesting balance of ' +
            formatNumber(amount) +
            " " +
            asset_name;
          return { op_text: operation_text, symbol: asset_name, amount: 0 };
        });
      });

    case 37:
      operation_account = operation.deposit_to_account;

      var total_claimed_amount = operation.total_claimed.amount;
      var total_claimed_asset_id = operation.total_claimed.asset_id;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(total_claimed_asset_id).then((response_asset) => {
          var asset_name = response_asset.data.symbol;
          var asset_precision = response_asset.data.precision;
          var divideby = Math.pow(10, asset_precision);
          var amount = Number(total_claimed_amount / divideby);

          operation_text =
            response_name +
            ' claimed a balance of ' +
            formatNumber(amount) +
            " " +
            asset_name;
          return { op_text: operation_text, symbol: asset_name, amount: 0 };
        });
      });

    case 45:
      operation_account = operation.bidder;

      var additional_collateral_amount = operation.additional_collateral.amount;
      var additional_collateral_asset_id =
        operation.additional_collateral.asset_id;

      var debt_covered_amount = operation.debt_covered.amount;
      var debt_covered_asset_id = operation.debt_covered.asset_id;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(additional_collateral_asset_id).then(
          (additional_collateral_asset) => {
            var asset_name1 = additional_collateral_asset.data.symbol;
            var asset_precision1 = additional_collateral_asset.data.precision;
            var divideby1 = Math.pow(10, asset_precision1);
            var amount1 = Number(additional_collateral_amount / divideby1);

            return UseAsset(debt_covered_asset_id).then(
              (debt_covered_asset) => {
                var asset_name2 = debt_covered_asset.data.symbol;
                var asset_precision2 = debt_covered_asset.data.precision;
                var divideby2 = Math.pow(10, asset_precision2);
                var amount2 = Number(debt_covered_amount / divideby2);

                operation_text =
                  response_name +
                  ' bid' +
                  formatNumber(amount1) +
                  " " +
                  asset_name1 +
                  ' for ' +
                  formatNumber(amount2) +
                  " " +
                  asset_name2;
                return { op_text: operation_text, symbol: asset_name1, amount: formatNumber(amount1) };
              },
            );
          },
        );
      });

    case 49:
      operation_account = operation.from;

      var amount_ = operation.amount_.amount;
      asset_id = operation.amount_.asset_id;

      to = operation.to;

      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(asset_id).then((asset) => {
          var asset_name = asset.data.symbol;
          var asset_precision = asset.data.precision;
          var divideby = Math.pow(10, asset_precision);
          var amount = Number(amount_ / divideby);

          return UseAccount(to).then((response_name2) => {
            operation_text =
              response_name +
              ' create HTLC to ' +
              response_name2 +
              ' to transfer ' +
              formatNumber(amount) +
              " " +
              asset_name;
            return { op_text: operation_text, symbol: asset_name, amount: formatNumber(amount) };
          });
        });
      });

    case 50:
      operation_account = operation.redeemer;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' redeem HTLC ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 51:
      operation_account = operation.from;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' redeemed HTLC ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 52:
      operation_account = operation.update_issuer;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' extend HTLC ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 53:
      operation_account = operation.to;

      return UseAccount(operation_account).then((response_name) => {
        operation_text =
          response_name +
          ' refund HTLC ';
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 54:
      return UseAccount(operation.issuer).then((response_name) => {
        operation_text = 'created property ' + operation.property_id;
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 55:
      return UseAccount(operation.issuer).then((response_name) => {
        operation_text = 'updated property ' +
          operation.property_to_update;
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 56:
      return UseAccount(operation.issuer).then((response_name) => {
        operation_text = 'approved property ' +
          operation.property_to_approve;
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 57:
      return UseAccount(operation.fee_paying_account).then((response_name) => {
        operation_text = 'deleted property ' +
          operation.property;
        return { op_text: operation_text, symbol: null, amount: 0 };
      });

    case 58:
      operation_account = operation.fee_paying_account;
      var symbol = operation.symbol;
      return UseAccount(operation_account).then((response_name) => {
        return UseAsset(symbol).then((asset) => {
          var asset_name = asset.data.symbol;
          var asset_precision = asset.data.precision;
          var divideby = Math.pow(10, asset_precision);
          var symbol_amount = Number(
            operation.usd_price.denominator / divideby,
          );
          var usd_amount = Number(
            operation.usd_price.numerator / Math.pow(10, 6),
          );

          operation_text =
            response_name +
            ' published price ';
          operation_text =
            operation_text +
            usd_amount / symbol_amount +
            ' ' +
            'USD' +
            '/' +
            asset_name +
            ' ';
          return { op_text: operation_text, symbol: asset_name, amount: usd_amount / symbol_amount };
        });
      });

    default:
      operation_text = '';
      return { op_text: operation_text, symbol: null, amount: 0 };
  }
};
