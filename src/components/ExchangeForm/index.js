import React, { useEffect, useState } from "react";
import styles from "./ExchangeForm.module.scss";
import RightSideHelpMenuSecondType from "../RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import ExchangeSelect from "./ExchangeSelect.js";
import {
  Image,
  Modal,
  Button,
  Grid,
  Icon,
  Label,
  Popup,
} from "semantic-ui-react";
import { helpInput, helpMax1, helpSwap } from "../../config/help";
import Input from "@mui/material/Input";
import MetaLoader from "../../UI/loader/Loader";
import "./ExchangeForm.css";
import Meta1 from "meta1-vision-dex";
import InputAdornment from "@mui/material/InputAdornment";
import leftArrow from "../../images/exchangeAssets/Shape Left.png";
import rightArrow from "../../images/exchangeAssets/Shape 2 copy 2.png";
import { useDispatch, useSelector } from "react-redux";
import { checkPasswordObjSelector, traderSelector, userCurrencySelector } from "../../store/meta1/selector";
import { accountsSelector, isValidPasswordKeySelector, passwordKeyErrorSelector } from "../../store/account/selector";
import { saveBalanceRequest } from "../../store/meta1/actions";
import { passKeyRequestService, passKeyResetService } from "../../store/account/actions";
import { TextField } from "@mui/material";

export default function ExchangeForm(props) {
  const {
    onSuccessModal,
    asset,
    onBackClick,
    metaUrl,
    onSuccessTrade,
    passwordShouldBeProvided,
    setPasswordShouldBeProvided
  } = props;
  const traderState = useSelector(traderSelector);
  const userCurrencyState = useSelector(userCurrencySelector);
  const accountState = useSelector(accountsSelector);
  const [portfolio, setPortfolio] = useState(props.portfolio);
  const [password, setPassword] = useState("");
  const [assets, setAssets] = useState(props.assets);
  const [options, setOptions] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(props.selectedFrom);
  const [selectedTo, setSelectedTo] = useState(props.selectedTo);
  const [selectedFromAmount, setSelectedFromAmount] = useState("");
  const [selectedToAmount, setSelectedToAmount] = useState(0);
  const [pair, setPair] = useState(null);
  const [invalidEx, setInvalidEx] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [tradeError, setTradeError] = useState(null);
  const [tradeInProgress, setTradeInProgress] = useState(false);
  const [priceForAsset, setPriceForAsset] = useState(0);
  const [blockPrice, setBlockPrice] = useState();
  const [clickedInputs, setClickedInputs] = useState(false);
  const [error, setError] = useState();
  const [feeAlert, setFeeAlert] = useState(false);
  const isValidPasswordKeyState = useSelector(isValidPasswordKeySelector);
  const passwordKeyErrorState = useSelector(passwordKeyErrorSelector);
  const [tradeType, setTradeType] = useState('market');
  const [limitPrice, setLimitPrice] = useState(0);
  const [isLimitPriceSet, setIsLimitPriceSet] = useState(false);
  const [amountPercent, setAmountPercent] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(pair);
  }, [pair]);

  useEffect(() => {
    if (!isValidPasswordKeyState && passwordKeyErrorState) {
        setTradeError("Invalid Credentials");
        setPassword("");
        setTradeInProgress(false);
        return;
    }
    if (isValidPasswordKeyState) {
      dispatch(passKeyResetService());
      performTradeSubmit();
    }
  },[isValidPasswordKeyState, passwordKeyErrorState])

  const performTradeSubmit = async () => {
    const buyResult = await traderState.perform({
      from: selectedFrom.value,
      to: selectedTo?.value?.trim(),
      amount: selectedToAmount,
      password: password,
      tradePrice: tradeType === 'limit' ? limitPrice : null
    });
    
    if (buyResult.error) {
      setTradeError(buyResult.error);
    } else {
      dispatch(saveBalanceRequest(accountState))
      setModalOpened(true);
    }
    setPassword("");
    setTradeInProgress(false);
  }
  useEffect(() => {
    async function getPriceForAsset() {
      if (asset === "USDT") {
        setPriceForAsset(1);
      } else {
        Meta1.ticker("USDT", asset).then((res) =>
          setPriceForAsset(Number(res.latest).toFixed(2))
        );
      }
    }
    getPriceForAsset();
  }, [asset, portfolio]);

  useEffect(() => {
    const feeAsset = portfolio?.find((asset) => asset.name === "META1");
    if (Number(selectedFromAmount) <= 0 && clickedInputs) {
      setError(
        `The amount must be greater than ${(
          0.003 * Number(userCurrencyState.split(" ")[2])
        ).toFixed(4)} ${userCurrencyState.split(" ")[1]}`
      );
    } else {
      setError("");
    }
    if (feeAsset == undefined) {
      setError("Not enough FEE");
    } else {
      setError("");
    }
  }, [selectedFromAmount, blockPrice]);

  useEffect(() => {
    const currentPortfolio = props.portfolio || [];
    setAssets(props.assets);
    const getBalance = (symbol) => {
      const assetInWallet = currentPortfolio.find((el) => el.name === symbol);
      if (assetInWallet) {
        return assetInWallet.qty;
      } else {
        return 0;
      }
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
    if (selectedTo == null && options !== []) {
      const from = asset
        ? newOptions.find((el) => el.value === asset)
        : newOptions[0];
      let to = asset
        ? newOptions.find((el) => el.value === "META1")
        : newOptions[1];
      if (asset === "META1") {
        to = newOptions.find((el) => el.value === "USDT");
      }
      setSelectedTo(to);
      setSelectedFrom(from);
    } else {
      setSelectedTo(newOptions.find((o) => o.value === selectedTo.value));
      setSelectedFrom(newOptions.find((o) => o.value === selectedFrom.value));
    }
  }, [props.assets, props.portfolio]);

  useEffect(() => {
    if (pair == null) return;
    if (pair.lowest_ask === "0" || parseFloat(pair.lowest_ask) === 0.0) {
      setInvalidEx(true);
      setSelectedFromAmount(0);
      setBlockPrice("");
      return;
    }
    setInvalidEx(false);
  }, [pair]);

  const calculateUsdPriceHandler = (e,lastPrice='', fromPercent = false) => {
    const value = fromPercent ? e : e.target.value;
    if (value.length != 0) {
      let priceAsset = priceForAsset
      if(lastPrice!=''){
        priceAsset=lastPrice
      }
      let priceForOne = (Number(value) * priceAsset).toFixed(10);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    } else {
      setBlockPrice(NaN);
    }
  };

  const calculateCryptoPriceHandler = (e) => {
    setBlockPrice(e.target.value);
    let priceForOne = (
      Number(e.target.value) /
      priceForAsset /
      Number(userCurrencyState.split(" ")[2])
    ).toFixed(selectedFrom.label === "USDT" ? 3 : selectedFrom.pre);
    setSelectedFromAmount(priceForOne);
  };

  const handleCalculateSelectedTo = (currentValue='') => {
    if (pair == null) return;
    if (pair.lowest_ask === "0" || parseFloat(pair.lowest_ask) === 0.0) {
      setInvalidEx(true);
      setSelectedToAmount(NaN);
      setSelectedFromAmount(NaN);
      setBlockPrice(NaN);
      return;
    }
    setInvalidEx(false);
    const selectedAmount=currentValue?currentValue:selectedFromAmount
    let amount;
    if (selectedAmount !== "" && selectedAmount) {
      if (pair.base === "META1") {
        amount = (selectedAmount / pair.latest).toString().substr(0, 11) * 1;
      } else if (pair.base === "USDT") {
        amount = (selectedAmount / pair.latest).toString().substr(0, 11) * 1;
      } else {
        amount = (selectedAmount / pair.lowest_ask).toString().substr(0, 11) * 1;
      }
      setSelectedToAmount(amount);
    } else {
      setSelectedToAmount(0);
    }
  };
  const handleCalculateSelectedFrom = () => {
    if (pair == null) return;
    if (pair.lowest_ask === "0" || parseFloat(pair.lowest_ask) === 0.0) {
      setInvalidEx(true);
      setSelectedFromAmount(0);
      setBlockPrice("");
      return;
    }
    setInvalidEx(false);
    const amount = selectedToAmount * pair.lowest_ask;
    setSelectedFromAmount(amount);
  };

  useEffect(() => {
    if (selectedFromAmount > 0) {
      setSelectedToAmount(0);
    }
    if (selectedFromAmount?.length) {
      console.log("cvfdggggg 1",selectedFromAmount)
      handleCalculateSelectedTo();
    }
    if (selectedToAmount?.length) {
      console.log("cvfdgggggdfsff 2",selectedFromAmount)
      handleCalculateSelectedFrom();
    }
    if (selectedToAmount === "") {
      setSelectedFromAmount("");
    }
  }, [selectedFromAmount, selectedToAmount]);

  useEffect(() => {
    setPasswordShouldBeProvided(false);
  }, [selectedFrom, selectedTo, selectedFromAmount, selectedToAmount]);

  useEffect(() => {
    if (amountPercent !== 0) {
      setAmountPercent(0);
    }
    async function fetchPair(selectedTo, selectedFrom) {
      if (
        selectedTo != null &&
        selectedFrom != null &&
        selectedFrom.value !== undefined
      ) {
        const newPair = await Meta1.ticker(
          selectedFrom.value,
          selectedTo.value
        );
        let pairAmt = 0;
        if (selectedFrom.value === "META1") {
          pairAmt = newPair.latest;
        } else if (selectedFrom.value === "USDT") {
          pairAmt = newPair.latest;
        } else {
          pairAmt = newPair.lowest_ask;
        }
        setLimitPrice(pairAmt);
      } else {
        setIsLimitPriceSet(prev => !prev);
      }
    }
    fetchPair(selectedTo, selectedFrom);
  }, [isLimitPriceSet, tradeType]);

  useEffect(() => {
    async function fetchPair(selectedTo, selectedFrom) {
      if (
        selectedTo != null &&
        selectedFrom != null &&
        selectedFrom.value !== undefined
      ) {
        const newPair = await Meta1.ticker(
          selectedFrom.value,
          selectedTo.value
        );
        setPair(newPair);
      }
    }
    fetchPair(selectedTo, selectedFrom);
  }, [selectedFrom, selectedTo]);

  const changeAssetHandler = async (val) => {
    if (val === "USDT") {
      setPriceForAsset(1);
    } else {
      Meta1.ticker("USDT", val).then((res) =>{
        setPriceForAsset(Number(res.latest).toFixed(2))
      }
      );
    }
  };

  const changeAssetHandlerSwap = async (val) => {
    if (val.label === "USDT") {
      setPriceForAsset(1);
    } else {
      Meta1.ticker("USDT", val.label).then((res) =>
        setPriceForAsset(Number(res.latest).toFixed(2))
      );
    }
  };

  const swapAssets = (e) => {
    e.preventDefault();
    const oldFrom = selectedFrom;
    setSelectedFrom(selectedTo);
    setSelectedTo(oldFrom);
  };

  const { innerWidth: width } = window;
  const isMobile = width <= 600;

  const prepareTrade = () => {
    const feeAsset = portfolio?.find((asset) => asset.name === "META1");
    localStorage.setItem("selectFrom", selectedFromAmount);
    localStorage.setItem("selectTo", selectedToAmount);
    if (
      selectedFrom.label === "META1" &&
      Number(selectedFromAmount) === Number(feeAsset.qty)
    ) {
      setFeeAlert(true);
    } else {
      setPasswordShouldBeProvided(true);
    }
  };  

  const performTrade = async () => {
    setTradeInProgress(true);
    setPasswordShouldBeProvided(false);
    dispatch(passKeyRequestService({ login: accountState, password}));
  }

  const setAssetMax = (e) => {
    e.preventDefault();
    setSelectedFromAmount(selectedFrom.balance);
    handleCalculateSelectedTo();
    setTimeout(() => {
      let priceForOne = (
        Number(document.getElementById("inputAmount").value) * priceForAsset
      ).toFixed(3);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    }, 25);
  };
  const ariaLabel = { "aria-label": "description" };

  // const getAssets = (except) => options.filter((el) => el.value !== except);
  if (selectedFrom == null && selectedTo == null) return null;

  const getAssets = (except) => options.filter((el) => el.value !== except);

  const inputChangeValuesHandler =(e,currentInput,lastPrice, fromPercent = false)=>{
    const val = fromPercent ? e : e.target.value;
    handleCalculateSelectedTo(val);
    calculateUsdPriceHandler(e, lastPrice, fromPercent);
    setClickedInputs(true);
  }

  const inputChangeHandler = async (val,e, fromPercent = false)=>{
    const currentInput = fromPercent ? e : e.target.value
    setSelectedFromAmount(prev=>{
      return currentInput
    });
    if (val === "USDT") {
      setPriceForAsset(1);
      inputChangeValuesHandler(e,currentInput,'', fromPercent);
    } else {
      Meta1.ticker("USDT", val).then((res) =>{
        setPriceForAsset(prev=>{
          return Number(res.latest).toFixed(2)
        })
        inputChangeValuesHandler(e, currentInput,Number(res.latest).toFixed(2), fromPercent);
      }
      );
    }
  }

  const changePercentageHandler = (val) => {
    if (!invalidEx) {
      setAmountPercent(val);
      const value = String(Number(selectedFrom.balance)*(val/100));
      setSelectedFromAmount(value);
      inputChangeHandler(selectedFrom.label, value, true);
    }
  }

  return (
    <>
      <div>
        <div
          className={"headerTitle"}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h2 className="headTl">Exchange</h2>
          <div style={{ marginRight: "1rem", cursor: "pointer" }}>
            <i
              onClick={onBackClick}
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
        <Modal
          size="mini"
          open={tradeError !== null}
          onClose={() => {
            setTradeError(null);
            dispatch(passKeyResetService());
          }}
          id={"modalExch"}
        >
          <Modal.Header>Error occured</Modal.Header>
          <Modal.Content>
            <Grid verticalAlign="middle" centered>
              <Grid.Row centered columns={2}>
                <Grid.Column width={4}>
                  <Icon disabled name="warning sign" size="huge" />
                </Grid.Column>

                <Grid.Column width={10}>
                  <div className="trade-error">{tradeError}</div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button positive onClick={() => {
              setTradeError(null);
              dispatch(passKeyResetService());
            }}>
              OK
            </Button>
          </Modal.Actions>
        </Modal>
        <Modal
          size="mini"
          open={feeAlert}
          onClose={() => setFeeAlert(false)}
          id={"modalExch"}
        >
          <Modal.Header>All META1 transfer</Modal.Header>
          <Modal.Content style={{ height: "55%" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h4 style={{ textAlign: "center" }}>
                Insufficient Balance: prevented the swap of Max amount of META1.
                <br />
                META1 coin is required to pay network fees, otherwise your
                account can become unusable
              </h4>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button negative onClick={() => setFeeAlert(false)}>
              OK
            </Button>
          </Modal.Actions>
        </Modal>
        <Modal
          size="mini"
          open={modalOpened}
          onClose={() => {
            setModalOpened(false);
            onSuccessModal();
            onSuccessTrade();
          }}
          id={"modalExch"}
        >
          <Modal.Header>Trade Completed</Modal.Header>
          <Modal.Content>
            <Grid verticalAlign="middle" centered>
              <Grid.Row centered columns={3}>
                <Grid.Column>
                  <div className="asset-traded">
                    <Image size="tiny" src={selectedFrom.image} />
                    <p>
                      {" "}
                      {(localStorage.getItem("selectFrom") * 1).toFixed(
                        selectedFrom.pre
                      )}{" "}
                    </p>
                  </div>
                </Grid.Column>
                <Grid.Column width={3} style={{ marginRight: '2.2rem', marginTop: '-2rem' }} >
                  <Icon disabled name="arrow right" size="huge" />
                </Grid.Column>

                <Grid.Column>
                  <div className="asset-traded">
                    <Image size="tiny" src={selectedTo.image} />
                    <p>
                      {(localStorage.getItem("selectTo") * 1).toFixed(
                        selectedTo.pre
                      )}{" "}
                    </p>
                  </div>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            <Button
              style={{ backgroundColor: "#fc0", color: "white" }}
              onClick={() => {
                onSuccessModal();
                setModalOpened(false);
                // setRefreshData(prev => !prev)
                onSuccessTrade()
              }}
            >
              OK
            </Button>
          </Modal.Actions>
        </Modal>
        <div className={"adaptForMainExchange"}>
          <div className={`${styles.mainBlock} marginBottomZero`}>
          <div>
              <Button className={tradeType === 'market' ? 'custom-tab' : ''} onClick={() => setTradeType('market')}>Market</Button>
              <Button className={tradeType === 'limit' ? 'custom-tab' : ''} onClick={() => {
                setTradeType('limit');
                setIsLimitPriceSet(prev => !prev);
              }}>Limit Order</Button>
            </div>
            <div className={styles.mainBlockExchange}>
              <div className={styles.leftBlockExchange}>
                <h2 style={{ textAlign: "center" }}>Exchange</h2>
                <div id="from">
                  <Grid stackable>
                    <Grid.Column columns={2} className="flex-middle">
                      <Grid.Column>
                        <ExchangeSelect
                          onChange={(val) => {
                            setIsLimitPriceSet(prev => !prev);
                            setAmountPercent(0);
                            setSelectedFrom(val);
                            changeAssetHandler(val.value);
                            setSelectedFromAmount(NaN);
                            setSelectedToAmount(NaN);
                            setBlockPrice(NaN);
                            setInvalidEx(false);
                          }}
                          options={getAssets(selectedTo.value)}
                          selectedValue={selectedFrom}
                        />
                      </Grid.Column>
                      <Grid.Column>
                        <div>
                          <h1> </h1>
                        </div>
                      </Grid.Column>
                      <Grid.Column>
                        <div className="wallet-input">
                          <Popup
                            content={helpInput(
                              selectedFrom?.value,
                              selectedTo?.value
                            )}
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
                                      inputChangeHandler(selectedFrom.label,e)
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
                                  inputmode="numeric"
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
                                    position:'relative'
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
                                    inputmode="numeric"
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
                                  <span className={styles['abs-sp']} >{userCurrencyState.split(" ")[0]}</span>
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
                      </Grid.Column>
                    </Grid.Column>
                  </Grid>
                  <Grid>
                    <div className="percentage-container">
                      <span className={`percentage-padding ${amountPercent === 25 ? 'active' : ''}`} onClick={() => changePercentageHandler(25)}>25%</span>
                      <span className={`percentage-padding ${amountPercent === 50 ? 'active' : ''}`} onClick={() => changePercentageHandler(50)}>50%</span>
                      <span className={`percentage-padding ${amountPercent === 75 ? 'active' : ''}`} onClick={() => changePercentageHandler(75)}>75%</span>
                      <span className={`percentage-padding ${amountPercent === 100 ? 'active' : ''}`} onClick={() => changePercentageHandler(100)}>100%</span>
                    </div>
                  </Grid>
                  <Grid className="limit-input-grid">
                    <TextField
                      id="outlined-textarea"
                      label="Price"
                      placeholder="Enter Price"
                      className="input-price"
                      disabled={tradeType === 'market'? true: false}
                      value={limitPrice}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) {
                          setLimitPrice(e.target.value);
                        }
                      }}
                    />
                  </Grid>
                </div>
              </div>
              <div
                style={{ marginTop: "2.3rem", marginLeft: ".3rem" }}
                className="padding-y-large text-center-s"
              >
                <Popup
                  content={helpSwap(selectedFrom?.value, selectedTo?.value)}
                  position="top center"
                  trigger={
                    <Button
                      className={styles.button}
                      style={{ width: "3rem", height: "3rem" }}
                      onClick={(e) => {
                        changeAssetHandlerSwap(selectedTo);
                        setSelectedToAmount(NaN);
                        setSelectedFromAmount(NaN);
                        setBlockPrice(NaN);
                        swapAssets(e);
                        setIsLimitPriceSet(prev=> !prev);
                      }}
                    >
                      <div className={styles.blockArrows}>
                        <img
                          src={leftArrow}
                          className={styles.leftArrow}
                          alt=""
                        />
                        <img
                          src={rightArrow}
                          className={styles.rightArrow}
                          alt=""
                        />
                      </div>
                    </Button>
                  }
                />
              </div>
              <div className={styles.rightBlockExchange}>
                <h2 style={{ textAlign: "center" }}>Receive</h2>
                <div id="to">
                  <Grid stackable>
                    <Grid.Column columns={2} className="flex-middle">
                      <Grid.Column>
                        <ExchangeSelect
                          onChange={(val) => {
                            setIsLimitPriceSet(prev => !prev);
                            setSelectedTo(val);
                            setSelectedFromAmount(NaN);
                            setSelectedToAmount(NaN);
                            setBlockPrice(NaN);
                            setInvalidEx(false);
                          }}
                          options={getAssets(selectedFrom.value)}
                          selectedValue={selectedTo}
                        />
                      </Grid.Column>
                      <Grid.Column>
                        <div>
                          <h1> </h1>
                        </div>
                      </Grid.Column>
                      <Grid.Column>
                        <div className="wallet-input">
                          <Popup
                            wide
                            content={helpInput(
                              selectedTo?.value,
                              selectedFrom?.value
                            )}
                            position="bottom center"
                            disabled
                            trigger={
                              <div className={styles.inputForAmount}>
                                <Input
                                  style={isMobile ? { width: "100%" } : null}
                                  placeholder="Amount crypto"
                                  value={
                                    selectedFromAmount ? selectedToAmount : 0
                                  }
                                  type={"number"}
                                  onChange={(e) => {
                                    setSelectedToAmount(
                                      Number(e.target.value).toFixed(
                                        selectedTo.pre
                                      )
                                    );
                                    handleCalculateSelectedFrom();
                                  }}
                                  endAdornment={
                                    <InputAdornment position="end">
                                      {selectedTo.label}
                                    </InputAdornment>
                                  }
                                  inputProps={ariaLabel}
                                  disabled
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: ".1rem",
                                    fontSize: "1rem",
                                    color: "#505361",
                                    position:'relative'
                                  }}
                                >
                                  <span>
                                    {!invalidEx && selectedFromAmount
                                      ? blockPrice
                                      : 0}
                                  </span>
                                  <span className={styles['abs-sp']}>{userCurrencyState.split(" ")[0]}</span>
                                </div>
                              </div>
                            }
                          />
                        </div>
                        <div style={{ marginTop: "1px" }}>
                          {invalidEx && (
                            <Label pointing color="red">
                              Trade is currently unavailable
                            </Label>
                          )}
                        </div>
                      </Grid.Column>
                    </Grid.Column>
                  </Grid>
                </div>
              </div>
            </div>
            <div className={styles.absoluteBottomBlock}>
              <div className={styles.centeredBlock}>
                <div className={styles.leftBlockCrypt}>
                  <div
                    className={styles.textBlockLeft}
                    style={{ marginRight: "1rem" }}
                  >
                    <span>You are exchanging</span>
                    <h4>
                      {selectedFromAmount || 0} {selectedFrom.label}
                    </h4>
                    <span>
                      {!invalidEx && blockPrice
                        ? `${blockPrice}${userCurrencyState.split(" ")[0]}`
                        : 0}
                    </span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <img
                      style={{
                        width: "80px",
                        height: "80px",
                        margin: "0 auto",
                      }}
                      src={selectedFrom.image}
                      alt=""
                    />
                  </div>
                </div>
                <div className={styles.centeredBlockCrypt}>
                  <div className={styles.iconBlock}>
                    <i
                      style={{ color: "#fff" }}
                      className={
                        isMobile ? "far fa-arrow-down" : "far fa-arrow-right"
                      }
                    />
                  </div>
                </div>
                <div className={styles.rightBlockCrypt}>
                  <div className={"imgToCenter"} style={{ display: "flex" }}>
                    <img
                      style={{
                        width: "80px",
                        height: "80px",
                        margin: "0 auto",
                      }}
                      src={selectedTo.image}
                      alt=""
                    />
                  </div>
                  <div className={styles.textBlockRight}>
                    <span>You will Receive</span>
                    <h4>
                      {selectedFromAmount ? selectedToAmount : 0}{" "}
                      {selectedTo.label}
                    </h4>
                    <span>
                      {!invalidEx && blockPrice
                        ? `${blockPrice}${userCurrencyState.split(" ")[0]}`
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {error && !invalidEx && selectedFromAmount ? (
              <Grid.Row centered style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "red", textAlign: "center" }}>{error}</h5>
              </Grid.Row>
            ) : null}
            {Number(selectedFrom.balance) < Number(selectedFromAmount) ? (
              <Grid.Row centered style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "red", textAlign: "center" }}>
                  You don't have enough crypto
                </h5>
              </Grid.Row>
            ) : null}
            <div className="hidden-pass ui input">
              {passwordShouldBeProvided && (
                <>
                  <Input
                    size="medium"
                    type="password"
                    placeholder="Passkey"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />

                  <Button
                    disabled={password.length === 0}
                    onClick={performTrade}
                    size="medium"
                    color="yellow"
                    ui
                  >
                    Submit
                  </Button>
                </>
              )}

              {tradeInProgress && <MetaLoader size={"small"} />}

              {!passwordShouldBeProvided && !tradeInProgress && (
                <Button
                  className={"btnExch"}
                  disabled={
                    tradeInProgress ||
                    selectedToAmount == null ||
                    selectedToAmount == 0 ||
                    selectedToAmount === 0.0 ||
                    selectedFrom.balance === 0 ||
                    Number(selectedFrom.balance) < Number(selectedFromAmount) ||
                    !selectedFromAmount ||
                    !selectedToAmount ||
                    // blockPrice == 0 ||
                    error
                  }
                  onClick={prepareTrade}
                  color="yellow"
                  size="large"
                >
                  Exchange
                </Button>
              )}
            </div>
          </div>
          <div className={"flexNeed customFlexNeed newCustomFlexNeed"} >
            <RightSideHelpMenuSecondType
              fromHistory="exchange"
              onClickExchangeEOSHandler={() => {
                setSelectedFrom({
                  image: "/static/media/EOS.fb40b8e0.svg",
                  value: "EOS",
                  label: "EOS",
                  pre: 4,
                  balance: 0,
                });
                portfolio.map((el) => {
                  if (el.name === "EOS") {
                    setSelectedFrom({
                      image: "/static/media/EOS.fb40b8e0.svg",
                      value: "EOS",
                      label: "EOS",
                      pre: 4,
                      balance: el.qty,
                    });
                  }
                });
              }}
              onClickExchangeUSDTHandler={() => {
                setSelectedFrom({
                  image: "/static/media/USDT.004b5e55.svg",
                  value: "USDT",
                  label: "USDT",
                  pre: 2,
                  balance: 0,
                });
                portfolio.map((el) => {
                  if (el.name === "USDT") {
                    setSelectedFrom({
                      image: "/static/media/USDT.004b5e55.svg",
                      value: "USDT",
                      label: "USDT",
                      pre: 2,
                      balance: el.qty,
                    });
                  }
                });
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
