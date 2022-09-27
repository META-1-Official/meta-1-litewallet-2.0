
import { CopyToClipboard } from "react-copy-to-clipboard";
import React, { useState, useEffect } from "react";
import Meta1 from "meta1-vision-dex";
import { ChainStore, PrivateKey } from "meta1-vision-js";
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
import { sendEmailSelector } from "../../store/account/selector";
import { sendMailRequest, sendMailReset } from "../../store/account/actions";
import { userCurrencySelector } from "../../store/meta1/selector";
import {availableGateways} from '../../utils/gateways';
import { getMETA1Simple } from "../../utils/gateway/getMETA1Simple";
import Immutable from "immutable";
import { getAssetAndGateway, getIntermediateAccount } from "../../utils/common/gatewayUtils";
import { getCryptosChange } from "../../API/API";
import { WithdrawAddresses } from "../../utils/gateway/gatewayMethods";

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

const getChainStore = (accountNameState) => {
  return new Promise( async (resolve,fail)=>{
      await ChainStore.clearCache()
      
      let newObj = ChainStore.getAccount(
          accountNameState,
          undefined
      );
      await getCryptosChange();
      newObj = ChainStore.getAccount(
          accountNameState,
          undefined
      );
      console.log("newObj",newObj)
      if (newObj) {
          resolve(newObj);
      }
      if (!newObj) {
          fail("fail");
      }
  })
}
const WithdrawForm = (props) => {
  const {onBackClick, asset } = props;
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
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidCurrency, setIsValidCurrency] = useState(false);
  const sendEmailState = useSelector(sendEmailSelector);
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
    if (selectedFrom && selectedFromAmount) {
      console.log("@1 - ", selectedFromAmount === 0)
      if (parseFloat(selectedFrom.balance) < parseFloat(selectedFromAmount)) {
        setAmountError('Amount exceeded the balance.');
      } else if (parseFloat(MIN_WITHDRAW_AMOUNT['USDT']) > parseFloat(blockPrice)/userCurrencyState.split(' ')[2]) {
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
    console.log("assetsassetsassets",assets)
		// if (!(includeBTS === false)) {
		// 	assets.push({id: 'META1', label: 'META1', gateway: ''});
		// }
  }

  const onClickWithdraw = async (e) => {
    e.preventDefault();
    
    console.log("availableGateways",availableGateways)
    console.log("availableGateways",availableGateways["META1"])
    console.log("availableGateways selectedFrom",selectedFrom.value)
    let assetName = !!gatewayStatus.assetWithdrawlAlias
		  ? gatewayStatus.assetWithdrawlAlias[selectedFrom.value.toLowerCase()] ||
		  selectedFrom.value.toLowerCase() : selectedFrom.value.toLowerCase();
      
    console.log("availableGateways assetName",assetName)
    console.log("availableGateways getMETA1Simple",getMETA1Simple())
    
    console.log("availableGateways backedCoins",backedCoins)
    const intermediateAccountNameOrId = getIntermediateAccount(
			selectedFrom.value,
			backedCoins
			);
    console.log("availableGateways intermediateAccountNameOrId",intermediateAccountNameOrId);
    const intermediateAccounts = await getChainStore("abc-test")
    console.log("availableGateways availableGateways intermediateAccounts",intermediateAccounts)
    
    console.log("WithdrawAddresses",WithdrawAddresses)
    if (!WithdrawAddresses.has(assetName)) {
			let withdrawals = [];
			withdrawals.push(trim(toAddress));
			console.log("availableGateways intermediateAccount address1",trim(toAddress))
			WithdrawAddresses.set({wallet: assetName, addresses: withdrawals});
		} else {
			let withdrawals = WithdrawAddresses.get(assetName);
			if (withdrawals.indexOf(trim(toAddress)) == -1) {
				withdrawals.push(trim(toAddress));
				console.log("availableGateways intermediateAccount address2",trim(toAddress))
				WithdrawAddresses.set({
					wallet: assetName,
					addresses: withdrawals,
				});
			}
		}
    console.log("availableGateways WithdrawAddresses",WithdrawAddresses)

    WithdrawAddresses.setLast({wallet: assetName, address:trim(toAddress)});

    const assetData = selectedData();
    const assetObj = assetData.find(data => data.id === selectedFrom.value)
    console.log("assetData",assetData,assetObj)

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

  useEffect(()=>{
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
    console.log("optionsoptionsoptions",options)
    return options
    .filter((asset) => WITHDRAW_ASSETS.indexOf(asset.value) > -1)
    .filter((el) => el.value !== except);
  }

  const canWithdraw = name && isValidName &&
    isValidEmailAddress &&
    isValidAddress &&
    !amountError &&
    selectedFromAmount;

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
            </label><br /><br />
            <Button
              primary
              type="submit"
              className="btn-primary withdraw"
              onClick={(e) => onClickWithdraw(e)}
              floated="left"
              // disabled={canWithdraw ? '' : 'disabled'}
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
