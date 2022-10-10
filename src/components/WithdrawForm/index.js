
import { CopyToClipboard } from "react-copy-to-clipboard";
import React, { useState, useEffect } from "react";
import Meta1 from "meta1-vision-dex";
import { Aes, ChainStore, FetchChain, PrivateKey, TransactionBuilder, TransactionHelper } from "meta1-vision-js";
import { ChainConfig } from 'meta1-vision-ws';
import {
  Image, Modal, Button, Grid, Icon, Label, Popup
} from "semantic-ui-react";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CAValidator from "multicoin-address-validator";

import "./style.css";
import ExchangeSelect from "../ExchangeForm/ExchangeSelect.js";
import styles from "../ExchangeForm/ExchangeForm.module.scss";
import { helpWithdrawInput, helpMax1 } from "../../config/help";
import MetaLoader from "../../UI/loader/Loader";
import { trim } from "../../helpers/string";
import { useDispatch, useSelector } from "react-redux";
import { accountsSelector, isValidPasswordKeySelector, sendEmailSelector } from "../../store/account/selector";
import { passKeyRequestService, sendMailRequest, sendMailReset } from "../../store/account/actions";
import { userCurrencySelector } from "../../store/meta1/selector";
import { availableGateways } from '../../utils/gateways';
import { getMETA1Simple } from "../../utils/gateway/getMETA1Simple";
import Immutable from "immutable";
import { getAssetAndGateway, getIntermediateAccount } from "../../utils/common/gatewayUtils";
import { getCryptosChange } from "../../API/API";
import { WithdrawAddresses } from "../../utils/gateway/gatewayMethods";
import { assetsObj } from "../../utils/common";
import { Asset } from "../../utils/MarketClasses";
import AccountUtils from "../../utils/account_utils";
import { Axios } from "axios";

const WITHDRAW_ASSETS = ['ETH', 'USDT']

const MIN_WITHDRAW_AMOUNT = {
  "BTC": 0.0005,
  "ETH": 0.01,
  "LTC": 0.001,
  "EOS": 0.1,
  "XLM": 0.01,
  "META1": 0.02,
  "USDT": 50,
};
const broadcast = (transaction, resolve, reject) => {
  console.log("final process transaction broadcast", transaction)

  let broadcast_timeout = setTimeout(() => {
    return {
      broadcast: false,
      broadcasting: false,
      error: "Your transaction has expired without being confirmed, please try again later.",
      closed: false,
    };
    if (reject) reject();
  }, ChainConfig.expire_in_secs * 2000);

  transaction
    .broadcast(() => {
      return { broadcasting: false, broadcast: true };
    })
    .then((res) => {
      console.log("finally res", res)
      clearTimeout(broadcast_timeout);
      console.log("final process transaction confirm_transactions final", {
        error: null,
        broadcasting: false,
        broadcast: true,
        included: true,
        trx_id: res[0].id,
        trx_block_num: res[0].block_num,
        trx_in_block: res[0].trx_num,
        broadcasted_transaction: true,
      })
      return {
        error: null,
        broadcasting: false,
        broadcast: true,
        included: true,
        trx_id: res[0].id,
        trx_block_num: res[0].block_num,
        trx_in_block: res[0].trx_num,
        broadcasted_transaction: true,
      };
      if (resolve) resolve();
    })
    .catch((error) => {
      console.error(error);
      clearTimeout(broadcast_timeout);
      // messages of length 1 are local exceptions (use the 1st line)
      // longer messages are remote API exceptions (use the 1st line)
      let splitError = error.message.split('\n');
      let message = splitError[0];
      return {
        broadcast: false,
        broadcasting: false,
        error: message,
        closed: false,
      };
      if (reject) reject();
    });
}
const confirmTransaction = (transaction, resolve, reject) => {
  console.log("final process transaction", transaction)
  broadcast(transaction, resolve, reject)
  return { transaction, resolve, reject };
}
const getPubkeys_having_PrivateKey = (pubkeys, addys = null) => {
  let return_pubkeys = [];
  if (pubkeys) {
    for (let pubkey of pubkeys) {
      // if (this.hasKey(pubkey)) {
        return_pubkeys.push(pubkey);
        // }
      }
    }
    console.log("return_pubkeys",return_pubkeys)
  // if (addys) {
  //   let addresses = AddressIndex.getState().addresses;
  //   for (let addy of addys) {
  //     let pubkey = addresses.get(addy);
  //     return_pubkeys.push(pubkey);
  //   }
  // }
  console.log("process return_pubkeys", return_pubkeys)
  return return_pubkeys;
}
const process_transaction = (tr, accountNameState,password,signer_pubkeys, broadcast, extra_keys = [],) => {
  console.log("process function")
  return Promise.all([
    tr.set_required_fees(),
    tr.update_head_block(),
  ]).then(() => {
    let signer_pubkeys_added = {};


    return tr
      .get_potential_signatures()
      .then(({ pubkeys, addys }) => {
        let my_pubkeys = getPubkeys_having_PrivateKey(
          pubkeys.concat(extra_keys),
          addys
        );
        console.log("process my_pubkeys", my_pubkeys)
        return tr
          .get_required_signatures(my_pubkeys)
          .then((required_pubkeys) => {
            let signed = false;
            for (let pubkey_string of required_pubkeys) {
              if (signer_pubkeys_added[pubkey_string]) continue;
              console.log("accountNameState before", accountNameState)
              let private_key = getPrivateKey(pubkey_string, accountNameState, password);
              console.log("accountNameState after", accountNameState)
              console.log("process private_keyprivate_key", private_key)
              if (private_key) {
                tr.add_signer(private_key, pubkey_string);
                signed = true;
              }
            }
          });
      })
      .then(() => {
        console.log("final process")
        if (broadcast) {
          if (true) {
            let p = new Promise((resolve, reject) => {
              confirmTransaction(tr, resolve, reject);
            });
            // return p.then(async () => {
            //   await Axios.post(
            //     process.env.LITE_WALLET_URL + '/saveBalance',
            //     {accountName: AccountStore.getState().currentAccount}
            //   );
            // });
          } else return tr.broadcast();
        } else return tr.serialize();
      });
  });
}

/** @return ecc/PrivateKey or null */
const getPrivateKey = (public_key, accountNameState, password) => {
  console.log("accountNameState password", accountNameState)
  const data = generateKeyFromPassword(accountNameState, 'memo',password)
  console.log("generateKeyFromPassword data", data)
  return data.privKey;
  // if (_passwordKey) return _passwordKey[public_key];
  // if (!public_key) return null;
  // if (public_key.Q) public_key = public_key.toPublicKeyString();
  // let private_key_tcomb = PrivateKeyStore.getTcomb_byPubkey(public_key);
  // if (!private_key_tcomb) return null;
  // return decryptTcomb_PrivateKey(private_key_tcomb);
}
const generateKeyFromPassword = (accountName, role = "memo", password) => {
  console.log("accountNameState password2", accountName)
  let seed = accountName + role + password;
  let privKey = PrivateKey.fromSeed(seed);
  let pubKey = privKey.toPublicKey().toString();
  console.log("generateKeyFromPassword privKey", privKey)
  console.log("generateKeyFromPassword pubKey", pubKey)
  console.log("generateKeyFromPassword pubKey final", pubKey)
  return { privKey, pubKey };
}
// getFinalFeeAsset
const _get_memo_keys = (account, with_private_keys = true, accountNameState, password) => {
  console.log("accountaccountaccount", account)
  let memo = {
    public_key: null,
    private_key: null,
  };
  memo.public_key = account.getIn(['options', 'memo_key']);
  console.log("accountaccountaccount memo.public_key", memo.public_key)
  if (/111111111111111111111/.test(memo.public_key)) {
    memo.public_key = null;
  }
  console.log("memomemomemo", memo)
  if (with_private_keys) {
    memo.private_key = getPrivateKey(memo.public_key, accountNameState, password);
    console.log("memo.private_key", memo)
  }
  console.log("memomemomemo".memo)
  return memo;
}
const create_transfer_op = async ({
  // OBJECT: { ... }
  from_account,
  to_account,
  amount,
  asset,
  memo,
  propose_account = null, // should be called memo_sender, but is not for compatibility reasons with transfer. Is set to "from_account" for non proposals
  encrypt_memo = true,
  optional_nonce = null,
  fee_asset_id = '1.3.0',
  transactionBuilder = null,
  accountNameState,
  password
}) => {
  let memo_sender_account = propose_account || from_account;
  console.log("transfer memo_sender_account", memo_sender_account);
  console.log('ressssss getAccount', from_account);
  console.log('ressssss getAccount', to_account);
  console.log('ressssss getAccount', memo_sender_account);
  console.log('ressssss getAsset', asset);
  console.log('ressssss getAsset', fee_asset_id);
  return Promise.all([
    FetchChain('getAccount', from_account),
    FetchChain('getAccount', to_account),
    FetchChain('getAccount', memo_sender_account),
    // FetchChain('getAsset', asset),
    // FetchChain('getAsset', fee_asset_id),
  ])
    .then(res => {
      console.log("resssssssssssssssssssssss",res)
      const assetDataObj = assetsObj.find(data => data.id === asset);
      const assetFeeDataObj = assetsObj.find(data => data.id === fee_asset_id);
      console.log("ressssssssss", res, assetDataObj, assetFeeDataObj)
      const assetArr = [];
      for (let data in assetDataObj) {
        assetArr.push([`${data}`, assetDataObj[data]])
      }

      const assetFeeArr = [];
      for (let data in assetFeeDataObj) {
        assetFeeArr.push([`${data}`, assetFeeDataObj[data]])
      }
      // working
      let chain_asset = Immutable.Map([...assetArr])
      let chain_fee_asset = Immutable.Map([...assetFeeArr])
      let [chain_from, chain_to, chain_memo_sender] = res;
      console.log("ressssssssss chain_asset", res, chain_asset, chain_fee_asset, chain_from, chain_to, chain_memo_sender)

      let chain_propose_account = null;
      if (propose_account) {
        chain_propose_account = chain_memo_sender;
      }

      let memo_object;
      if (memo) {
        let memo_sender = _get_memo_keys(
          chain_memo_sender,
          encrypt_memo,
          accountNameState,
          password
        );
        console.log("memo_sender", memo_sender)
        let memo_to = _get_memo_keys(chain_to, false, accountNameState, password);
        console.log("memo_sender memo_to", memo_to)
        if (!!memo_sender.public_key && !!memo_to.public_key) {
          console.log("memo_sender memo_sender.public_key", memo_to.public_key, memo_sender.public_key)
          let nonce =
            optional_nonce == null
              ? TransactionHelper.unique_nonce_uint64()
              : optional_nonce;
          memo_object = {
            from: memo_sender.public_key,
            to: memo_to.public_key,
            nonce,
            message: encrypt_memo
              ? Aes.encrypt_with_checksum(
                memo_sender.private_key,
                memo_to.public_key,
                nonce,
                memo
              )
              : Buffer.isBuffer(memo)
                ? memo.toString('utf-8')
                : memo,
          };
          console.log("memo_object", memo_object)
        }
      }

      // Allow user to choose asset with which to pay fees #356
      let fee_asset = chain_fee_asset.toJS();
      console.log("memo_sender fee_asset", fee_asset)
      // Default to CORE in case of faulty core_exchange_rate
      // if (
      // 	fee_asset.options.core_exchange_rate.base.asset_id === '1.3.0' &&
      // 	fee_asset.options.core_exchange_rate.quote.asset_id === '1.3.0'
      // ) {
      // fee_asset_id = '1.3.0';
      // }

      let tr = null;
      console.log("memo_sender tr", tr)
      if (transactionBuilder == null) {
        console.log("memo_sender tr if")
        tr = new TransactionBuilder();
      } else {
        console.log("memo_sender tr else")
        tr = transactionBuilder;
      }
      console.log("memo_sender memo_object", memo_object)
      console.log("memo_sender chain_asset.get('id')", chain_asset.get('id'))
      console.log("lastttttttttt", {
        fee: {
          amount: 0,
          asset_id: fee_asset_id,
        },
        from: chain_from.get('id'),
        to: chain_to.get('id'),
        amount: { amount, asset_id: chain_asset.get('id') },
        memo: memo_object,
      })
      let transfer_op = tr.get_type_operation('transfer', {
        fee: {
          amount: 0,
          asset_id: fee_asset_id,
        },
        from: chain_from.get('id'),
        to: chain_to.get('id'),
        amount: { amount, asset_id: chain_asset.get('id') },
        memo: memo_object,
      });
      console.log("transfer_op", transfer_op)
      return {
        transfer_op,
        chain_from,
        chain_to,
        chain_propose_account,
        chain_memo_sender,
        chain_asset,
        chain_fee_asset,
      };
    })
}

const ApplicationApiTransfer = ({
  from_account,
  to_account,
  amount,
  asset,
  memo,
  broadcast = true,
  encrypt_memo = true,
  optional_nonce = null,
  propose_account = null,
  fee_asset_id = '1.3.0',
  transactionBuilder = null,
  accountNameState,
  password
}) => {
  console.log("transfer transfer application api")
  if (transactionBuilder == null) {
    transactionBuilder = new TransactionBuilder();
    console.log("transfer transfer application api transactionBuilder", transactionBuilder)
    create_transfer_op({
      from_account,
      to_account,
      amount,
      asset,
      memo,
      propose_account,
      encrypt_memo,
      optional_nonce,
      fee_asset_id,
      transactionBuilder,
      accountNameState,
      password
    }).then(transfer_obj => {
      console.log("prcesss before res", transfer_obj)
      return transactionBuilder
        .update_head_block()
        .then(() => {
          if (propose_account) {
            transactionBuilder.add_type_operation('proposal_create', {
              proposed_ops: [{ op: transfer_obj.transfer_op }],
              fee_paying_account: transfer_obj.chain_propose_account.get('id'),
            });
          } else {
            transactionBuilder.add_operation(transfer_obj.transfer_op);
          }
          return process_transaction(
            transactionBuilder,
            accountNameState,
            password,
            null, //signer_private_keys,
            broadcast,
          );
        })
        .catch((err) => {
          console.error(err);
        });

    })
  }

}

const transferHandler = (from_account, to_account, amount, asset, memo, propose_account = null, fee_asset_id = '1.3.0', accountNameState, password) => {
  console.log("transferHandler", from_account, to_account, amount, asset, memo, propose_account, fee_asset_id)
  fee_asset_id = AccountUtils.getFinalFeeAsset(
    propose_account || from_account,
    'transfer',
    fee_asset_id
  );
  console.log("transferHandler fee_asset_id", fee_asset_id)
  ApplicationApiTransfer({
    from_account,
    to_account,
    amount,
    asset,
    memo,
    propose_account,
    fee_asset_id,
    accountNameState,
    password
  })
  // .then((result) => {
  // console.log( "transfer result: ", result )

  // dispatch(result);
  // });
}

const getChainStore = (accountName) => {
  return new Promise(async (resolve, fail) => {
    await ChainStore.clearCache()

    let newObj = ChainStore.getAccount(
      accountName,
      undefined
    );
    await getCryptosChange();
    newObj = ChainStore.getAccount(
      accountName,
      undefined
    );
    console.log("newObj", newObj)
    if (newObj) {
      resolve(newObj);
    }
    if (!newObj) {
      fail("fail");
    }
  })
}
const WithdrawForm = (props) => {
  const { onBackClick, asset } = props;
  const accountNameState = useSelector(accountsSelector);
  const userCurrencyState = useSelector(userCurrencySelector);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState(props.selectedFrom);
  const [selectedFromAmount, setSelectedFromAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [name, setName] = useState("");
  const [isValidName, setIsValidName] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isValidEmailAddress, setIsValidEmailAddress] = useState(false);
  const [blockPrice, setBlockPrice] = useState();
  const [priceForAsset, setPriceForAsset] = useState(0);
  const [assets, setAssets] = useState(props.assets);
  const [options, setOptions] = useState([]);
  const [invalidEx, setInvalidEx] = useState(false);
  const [clickedInputs, setClickedInputs] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [password, setPassword] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidCurrency, setIsValidCurrency] = useState(false);
  const sendEmailState = useSelector(sendEmailSelector);
  const isValidPasswordKeyState = useSelector(isValidPasswordKeySelector);
  const dispatch = useDispatch();
  const ariaLabel = { "aria-label": "description" };
  const [gatewayStatus, setGatewayStatus] = useState(availableGateways);
  const [backedCoins] = useState(Immutable.Map({ META1: getMETA1Simple() }));

  useEffect(() => {
    const currentPortfolio = props.portfolio || [];
    setAssets(props.assets);

    const getBalance = (symbol) => {
      const assetInWallet = currentPortfolio.find((el) => el.name === symbol);

      return assetInWallet ? assetInWallet.qty : 0;
    };

    const newOptions = assets.map((asset) => {
      return {
        image: asset.image,
        value: asset.symbol,
        label: asset.symbol,
        pre: asset.precision,
        balance: getBalance(asset.symbol) || 0,
      };
    });

    setOptions(newOptions);

    if (options !== []) {
      const from = asset
        ? newOptions.find((el) => el.value === asset)
        : newOptions[0];

      setSelectedFrom(from);
    } else {
      setSelectedFrom(newOptions.find((o) => o.value === selectedFrom.value));
    }
  }, [props.assets, props.portfolio]);
  useEffect(() => {
    if (selectedFrom) {
      changeAssetHandler(selectedFrom.value);
    }
  }, [selectedFrom]);

  useEffect(() => {
      console.log("isValidPasswordKeyState",isValidPasswordKeyState)
      if (isValidPasswordKeyState) {
        if (!isValidPassword) {
          console.log("isValidPasswordKeyState if",isValidPasswordKeyState)
          setIsValidPassword(true);
        }
      } else {
        if (isValidPassword) {
          console.log("isValidPasswordKeyState else",isValidPasswordKeyState)
          setIsValidPassword(false);
        }
      }
  },[isValidPasswordKeyState])

  useEffect(() => {
    if (selectedFrom && selectedFromAmount) {
      console.log("@1 - ", selectedFromAmount === 0)
      if (parseFloat(selectedFrom.balance) < parseFloat(selectedFromAmount)) {
        setAmountError('Amount exceeded the balance.');
      } else if (parseFloat(MIN_WITHDRAW_AMOUNT['USDT']) > parseFloat(blockPrice) / userCurrencyState.split(' ')[2]) {
        setAmountError('Amount is too small.');
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  }, [selectedFromAmount, blockPrice]);

  useEffect(() => {
    if (!name) {
      setIsValidName(true);
    } else if (trim(name) === '') {
      setIsValidName(false);
    } else {
      setIsValidName(true);
    }
  }, [name]);

  useEffect(() => {
    if (emailAddress) {
      setIsValidEmailAddress(
        String(emailAddress).toLowerCase().match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
      );
    } else {
      setIsValidEmailAddress(false);
    }
  }, [emailAddress]);

  useEffect(() => {
    if (selectedFrom && toAddress) {
      if (process.env.REACT_APP_ENV === 'prod') {
        setIsValidAddress(CAValidator.validate(toAddress, selectedFrom.value));
      } else {
        setIsValidAddress(
          CAValidator.validate(toAddress, selectedFrom.value, "testnet")
        );
      }
    }
  }, [toAddress, selectedFrom]);

  const getAssetsObject = async (obj) => {
    const balances = obj.get('balances');
    console.log("balances", balances)
    let assets = Immutable.Map({})
    const newData = balances.map((data, index) => {
      return assets.set(index, assetsObj.find(data => data.id === index));
    })
    console.log("assetsassetsassetsassets", newData)
    return newData;
  }
  const changeAssetHandler = async (val) => {
    if (val !== "META1" && val !== "USDT") {
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${val}USDT`
      );
      await setPriceForAsset((await response.json()).lastPrice);
    } else if (val === "USDT") {
      setPriceForAsset(1);
    } else {
      Meta1
        .ticker("USDT", "META1")
        .then((res) => setPriceForAsset(Number(res.latest).toFixed(2)));
    }
  };

  const setAssetMax = (e) => {
    e.preventDefault();
    setSelectedFromAmount(selectedFrom.balance);
    setTimeout(() => {
      let priceForOne = (
        Number(document.getElementById("inputAmount").value) * priceForAsset
      ).toFixed(3);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    }, 25);
  };

  const calculateUsdPriceHandler = (e) => {
    if (e.target.value.length != 0) {
      const priceForOne = (Number(e.target.value) * priceForAsset).toFixed(2);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    } else {
      setBlockPrice(NaN);
    }
  };

  const calculateCryptoPriceHandler = (e) => {
    setBlockPrice(e.target.value);

    if (e.target.value) {
      let priceForOne = (
        Number(e.target.value) /
        priceForAsset /
        Number(userCurrencyState.split(" ")[2])
      ).toFixed(selectedFrom.label === "USDT" ? 3 : selectedFrom.pre);
      setSelectedFromAmount(priceForOne);
    } else {
      setSelectedFromAmount(e.target.value);
    }
  };

  const selectedData = () => {
    let assets = [];
    let idMap = {};
    let include = ["META1", "USDT", "BTC", "ETH", "EOS", "XLM", "BNB"];
    backedCoins.forEach((coin) => {
      assets = assets
        .concat(
          coin.map((item) => {
            /* Gateway Specific Settings */
            let split = getAssetAndGateway(item.symbol);
            let gateway = split.selectedGateway;
            let backedCoin = split.selectedAsset;

            // Return null if backedCoin is already stored
            if (!idMap[backedCoin] && backedCoin && gateway) {
              idMap[backedCoin] = true;

              return {
                id: backedCoin,
                label: backedCoin,
                gateway: gateway,
                gateFee: item.gateFee,
                issuer: item.issuerId,
                issuerId: item.issuerToId
              };
            } else {
              return null;
            }
          })
        )
        .filter((item) => {
          return item;
        })
        .filter((item) => {
          if (item.id == 'META1') {
            return true;
          }
          if (include) {
            return include.includes(item.id);
          }
          return true;
        });
    });
    return assets;
    console.log("assetsassetsassets", assets)
    // if (!(includeBTS === false)) {
    // 	assets.push({id: 'META1', label: 'META1', gateway: ''});
    // }
  }

  const onClickWithdraw = async (e) => {
    e.preventDefault();

    console.log("availableGateways", availableGateways)
    console.log("availableGateways", availableGateways["META1"])
    console.log("availableGateways selectedFrom", selectedFrom.value)
    let assetName = !!gatewayStatus.assetWithdrawlAlias
      ? gatewayStatus.assetWithdrawlAlias[selectedFrom.value.toLowerCase()] ||
      selectedFrom.value.toLowerCase() : selectedFrom.value.toLowerCase();

    console.log("availableGateways assetName", assetName)
    console.log("availableGateways getMETA1Simple", getMETA1Simple())

    console.log("availableGateways backedCoins", backedCoins)
    const intermediateAccountNameOrId = getIntermediateAccount(
      selectedFrom.value,
      backedCoins
    );
    console.log("availableGateways intermediateAccountNameOrId", intermediateAccountNameOrId);


    const intermediateAccounts = await getChainStore(accountNameState)
    // const intermediateAccountTo = intermediateAccounts.find((a) => {
    //   console.log("aaaaaaaaaaaaaaaa",a)
    // 	return (
    // 		a &&
    // 		(a.get('id') === intermediateAccountNameOrId ||
    // 			a.get('name') === intermediateAccountNameOrId)
    // 	);
    // });
    console.log("availableGateways availableGateways intermediateAccounts", intermediateAccounts)

    console.log("WithdrawAddresses", WithdrawAddresses)
    if (!WithdrawAddresses.has(assetName)) {
      let withdrawals = [];
      withdrawals.push(trim(toAddress));
      console.log("availableGateways intermediateAccount address1", trim(toAddress))
      WithdrawAddresses.set({ wallet: assetName, addresses: withdrawals });
    } else {
      let withdrawals = WithdrawAddresses.get(assetName);
      if (withdrawals.indexOf(trim(toAddress)) == -1) {
        withdrawals.push(trim(toAddress));
        console.log("availableGateways intermediateAccount address2", trim(toAddress))
        WithdrawAddresses.set({
          wallet: assetName,
          addresses: withdrawals,
        });
      }
    }
    console.log("availableGateways WithdrawAddresses", WithdrawAddresses)

    WithdrawAddresses.setLast({ wallet: assetName, address: trim(toAddress) });

    const assetData = selectedData();
    console.log("assetDataassetDataassetDataassetData", assetData)
    // fee
    const assetObj = assetData.find(data => data.id === selectedFrom.value)
    console.log("assetData", assetData, assetObj)
    const assets = await getAssetsObject(intermediateAccounts);
    console.log("assetsassets", assets)
    // current selected id
    console.log("selectedFrom.valueselectedFrom.value", selectedFrom.value)
    let withdrawalCurrencyObj;
    let withdrawalCurrency = assets.find((item, index) => {
      if (item.get(index).symbol === selectedFrom.value) {
        withdrawalCurrencyObj = { ...item.get(index) };
        return item;
      }
    });
    console.log("withdrawalCurrency", withdrawalCurrency)
    console.log("withdrawalCurrency", withdrawalCurrency, withdrawalCurrencyObj)
    // newAssets.set("test","test1");
    // newAssets.set("test11","test12");
    // console.log("newAssets",newAssets)
    let sendAmount = new Asset({
      asset_id: withdrawalCurrencyObj.id,
      precision: withdrawalCurrencyObj.precision,
      real: selectedFromAmount,
    });

    let balanceAmount = new Asset({
      asset_id: withdrawalCurrencyObj.id,
      precision: withdrawalCurrencyObj.precision,
      real: 0,
    });

    console.log("sendAmount1", sendAmount)
    if (Number(selectedFrom.balance) > 0) {
      const precisionAmount = Number(1 + "0".repeat(selectedFrom.pre))
      console.log("(Number(selectedFrom.backedCoins)*selectedFrom.pre)", precisionAmount, Number(selectedFrom.balance) * precisionAmount)
      balanceAmount = sendAmount.clone(Number(selectedFrom.balance) * precisionAmount);
      console.log("withdrawalCurrencyBalance balanceAmount", balanceAmount)
    } else {
      return;
    }

    const gateFeeAmount = new Asset({
      asset_id: withdrawalCurrencyObj.id,
      precision: withdrawalCurrencyObj.precision,
      real: assetObj.gateFee,
    });
    console.log("gateFeeAmount", gateFeeAmount)

    sendAmount.plus(gateFeeAmount);
    console.log("sendAmount12", sendAmount)
    console.log("assetName", assetName)
    let descriptor = `${assetName}:${trim(toAddress)}`;
    let feeAmount = new Asset({ amount: 0 })
    console.log("feeAmountfeeAmountfeeAmount", feeAmount)

    let fromData = intermediateAccounts.get("registrar");
    let to = intermediateAccounts.get('id')
    console.log("fromData", fromData, to)
    let args = [
      fromData,
      assetObj.issuerId,
      sendAmount.getAmount(),
      withdrawalCurrencyObj.id,
      descriptor,
      null,
      feeAmount ? feeAmount.asset_id : '1.3.0',
      accountNameState,
      password
    ];
    console.log("assetName args", args)
    transferHandler(...args)
    console.log("assetName intermediateAccounts", intermediateAccounts)
    // let balances = intermediateAccounts.get('balances');
    // console.log("bbbbbbbbbbbbbbbbbbbbbb",balances)
    // if (balances) {
    // 	balances.forEach((balance) => {
    //     console.log("bbbbbbbbbbbbbbbbbbbbbb balance",balance)
    // 		if (balance && balance.toJS) {
    // 			if (
    // 				withdrawalCurrencyObj &&
    // 				balance.get('asset_type') == withdrawalCurrencyObj.id
    // 			) {
    // 				// withdrawBalance = balance;
    // 				// withdrawalCurrencyBalanceId = balance.get('id');
    //         console.log("bbbbbbbbbbbbbbbbbbbbbb get",balance.get('balance'));
    // 			}
    // 		}
    // 	});
    // }
    console.log("sendAmount balanceAmount", selectedFrom)
    const emailType = "withdraw";
    const emailData = {
      accountName: props.accountName,
      name: trim(name),
      emailAddress: trim(emailAddress),
      asset: selectedFrom.value,
      amount: selectedFromAmount,
      toAddress: trim(toAddress)
    };
    // dispatch(sendMailRequest({emailType,emailData}))
  }

  useEffect(() => {
    if (sendEmailState) {
      alert("Email sent, awesome!");
      // Reset form inputs
      setName('');
      setEmailAddress('');
      setSelectedFromAmount(NaN);
      setBlockPrice(NaN);
      setToAddress('');
      dispatch(sendMailReset());
    }
  }, [sendEmailState]);

  if (selectedFrom == null) return null;

  const getAssets = (except) => {
    console.log("optionsoptionsoptions", options)
    return options
      .filter((asset) => WITHDRAW_ASSETS.indexOf(asset.value) > -1)
      .filter((el) => el.value !== except);
  }

  const canWithdraw = name && isValidName &&
    isValidEmailAddress &&
    isValidAddress &&
    !amountError &&
    selectedFromAmount &&
    isValidPassword;

  return (
    <>
      <div className="withdraw">
        <div
          className={"headerTitle"}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h2 className="headTl">Withdraw</h2>
          <div style={{ marginRight: "1rem", cursor: "pointer" }}>
            <i
              className="far fa-arrow-left"
              style={{ color: "#FFC000", marginRight: ".5rem" }}
            />
            <span
              onClick={onBackClick}
              style={{
                color: "#FFC000",
                borderBottom: "1px solid #FFC000",
                height: "40%",
                fontWeight: "600",
              }}
            >
              Back to Portfolio
            </span>
          </div>
        </div>

        {isLoading ?
          <MetaLoader size={"small"} />
          :
          <form>
            <label>
              <span>Name:</span><br />
              <TextField
                InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                value={name}
                onChange={(e) => { setName(e.target.value) }}
                className={styles.input}
                id="name-input"
                variant="filled"
                style={{ marginBottom: "1rem", borderRadius: "8px" }}
              />
              {name && !isValidName &&
                <span className="c-danger">Invalid first name</span>
              }
            </label><br />
            <label>
              <span>Email Address:</span><br />
              <TextField
                InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                value={emailAddress}
                onChange={(e) => { setEmailAddress(e.target.value) }}
                className={styles.input}
                id="emailaddress-input"
                variant="filled"
                style={{ marginBottom: "1rem", borderRadius: "8px" }}
              />
              {emailAddress && !isValidEmailAddress &&
                <span className="c-danger">Invalid email address</span>
              }
            </label><br />
            <label>
              <span>META1 Wallet Name:</span>
              <TextField
                InputProps={{ disableUnderline: true }}
                value={props.accountName}
                disabled={true}
                className={styles.input}
                id="wallet-name-input"
                variant="filled"
                style={{ marginBottom: "1rem", borderRadius: "8px" }}
              />
            </label><br />
            <label>
              <span>From Currency:</span>
              <ExchangeSelect
                onChange={(val) => {
                  setSelectedFrom(val);
                  changeAssetHandler(val.value);
                  setSelectedFromAmount(NaN);
                  setBlockPrice(NaN);
                  setInvalidEx(false);
                }}
                options={getAssets(selectedFrom.value)}
                selectedValue={selectedFrom}
              />
            </label><br />
            <label>
              <span>From Amount:</span>
              <div className="wallet-input">
                <Popup
                  content={helpWithdrawInput(selectedFrom?.value)}
                  position="bottom center"
                  trigger={
                    <div className={styles.inputForAmount}>
                      <Input
                        placeholder="Amount crypto"
                        value={selectedFromAmount}
                        type={"number"}
                        onChange={(e) => {
                          if (
                            e.target.value.length < 11 &&
                            /[-+]?[0-9]*\.?[0-9]*/.test(
                              e.target.value
                            ) &&
                            Number(e.target.value) >= 0
                          ) {
                            setSelectedFromAmount(e.target.value);
                            calculateUsdPriceHandler(e);
                            setClickedInputs(true);
                          }
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            {selectedFrom.label}
                          </InputAdornment>
                        }
                        inputProps={ariaLabel}
                        id={"inputAmount"}
                        disabled={invalidEx}
                        min="0"
                        inputMode="numeric"
                        pattern="\d*"
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginTop: ".1rem",
                          fontSize: "1rem",
                          color: "#505361",
                        }}
                      >
                        <input
                          className={styles.inputDollars}
                          onChange={(e) => {
                            if (
                              e.target.value.length < 11 &&
                              /[-+]?[0-9]*\.?[0-9]*/.test(
                                e.target.value
                              ) &&
                              Number(e.target.value) >= 0
                            ) {
                              calculateCryptoPriceHandler(e);
                              setClickedInputs(true);
                            }
                          }}
                          min="0"
                          inputMode="numeric"
                          pattern="\d*"
                          type={"number"}
                          placeholder={`Amount ${userCurrencyState.split(" ")[1]
                            }`}
                          disabled={invalidEx}
                          style={
                            invalidEx ? { opacity: "0.5" } : null
                          }
                          value={blockPrice}
                        />
                        <span>{userCurrencyState.split(" ")[0]}</span>
                      </div>
                    </div>
                  }
                />
                <div className="max-button">
                  <Popup
                    content={helpMax1(selectedFrom?.value)}
                    position="bottom center"
                    trigger={
                      <Button
                        secondary
                        className={"btn"}
                        onClick={setAssetMax}
                        floated="right"
                        size="mini"
                      >
                        MAX
                      </Button>
                    }
                  />
                </div>
              </div>
              {(selectedFromAmount && amountError) ?
                <span className="c-danger">{amountError}</span> : null
              }
            </label><br />
            <label>
              <span>Destination Address:</span>
              <TextField
                InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                value={toAddress}
                onChange={(e) => { setToAddress(e.target.value) }}
                className={styles.input}
                id="destination-input"
                variant="filled"
                style={{ marginBottom: "1rem", borderRadius: "8px" }}
              />
              {toAddress && !isValidAddress &&
                <span className="c-danger">Invalid {selectedFrom?.value} address</span>
              }
            </label><br />
            <label>
              <span>Passkey:</span>
              <TextField
                InputProps={{ disableUnderline: true, className: 'custom-input-bg' }}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (e.target.value === '') {
                    console.log("ifffff")
                    if (isValidPassword) {
                      console.log("isValidPasswordKeyState onCHange if",!isValidPassword)
                      setIsValidPassword(false);
                    }
                  } else {
                    // console.log("ifffff else")
                    // if (!isValidPassword) {
                    //   console.log("isValidPasswordKeyState onCHange else if",!isValidPassword)
                    //   setIsValidPassword(true);
                    // }
                  }
                }}
                onBlur={() => {
                  console.log("isValidPasswordKeyState onBlur")
                  dispatch(passKeyRequestService({ login: accountNameState, password}));
                }}
                className={styles.input}
                id="destination-input"
                variant="filled"
                style={{ marginBottom: "1rem", borderRadius: "8px" }}
              />
              {!password && !isValidPassword &&
                <span className="c-danger">Passkey can't be empty</span>
              }
              {password && !isValidPassword &&
                <span className="c-danger">please enter valid passKey</span>
              }
            </label><br /><br />
            <Button
              primary
              type="submit"
              className="btn-primary withdraw"
              onClick={(e) => onClickWithdraw(e)}
              floated="left"
            disabled={canWithdraw ? '' : 'disabled'}
            >
              Withdraw
            </Button>
          </form>
        }
      </div>
    </>
  );
}

export default WithdrawForm
