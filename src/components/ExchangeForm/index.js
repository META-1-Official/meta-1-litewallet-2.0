import React, { useEffect, useState, useRef } from "react";
import styles from "./ExchangeForm.module.scss";
import RightSideHelpMenuSecondType from "../RightSideHelpMenuSecondType/RightSideHelpMenuSecondType";
import ExchangeSelect from "./ExchangeSelect.js";
import {
  Image, Modal, Button, Grid, Icon, Label, Popup
} from "semantic-ui-react";
import { helpInput, helpMax1, helpSwap } from "../../config/help";
import Input from "@mui/material/Input";
import MetaLoader from "../../UI/loader/Loader";
import "./ExchangeForm.css";
import Meta1 from "meta1-vision-dex";
import {Apis} from 'meta1-vision-ws';
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
  const [selectedToAmount, setSelectedToAmount] = useState(0);
  const [pair, setPair] = useState(null);
  const [quoteAsset, setQuoteAsset] = useState(null);
  const [baseAsset, setBaseAsset] = useState(null);
  const [limitOrders, setLimitOrders] = useState([]);
  const [marketPrice, setMarketPrice] = useState(0);
  const [baseAssetPrice, setBaseAssetPrice] = useState(0);
  const [quoteAssetPrice, setQuoteAssetPrice] = useState(0);
  const [isInputsEnabled, setIsInputsEnabled] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [invalidEx, setInvalidEx] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [tradeError, setTradeError] = useState(null);
  const [tradeInProgress, setTradeInProgress] = useState(false);
  const [priceForAsset, setPriceForAsset] = useState(0);
  const [blockPrice, setBlockPrice] = useState();
  const [error, setError] = useState();
  const [feeAlert, setFeeAlert] = useState(false);
  const isValidPasswordKeyState = useSelector(isValidPasswordKeySelector);
  const passwordKeyErrorState = useSelector(passwordKeyErrorSelector);
  const [tradeType, setTradeType] = useState('market');
  const [amountPercent, setAmountPercent] = useState(null);
  const [backingAssetValue, setBackingAssetValue] = useState(0);
  const [backingAssetPolarity, setBackingAssetPolarity] = useState(false);
  const dispatch = useDispatch();
  const inputRef = useRef(null);

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
    if ((selectedFrom == null || selectedTo == null) && options !== []) {
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
      const from = newOptions.find((o) => o.value === selectedFrom.value);
      const to = newOptions.find((o) => o.value === selectedTo.value);
      if (from.value !== selectedFrom.value) setSelectedFrom(from);
      if (to.value !== selectedTo.value) setSelectedTo(to);
    }
  }, [props.assets, props.portfolio]);

  useEffect(() => {
    if (pair == null) return;

    console.log("pair change:", pair.base, pair.quote, "trade type:", tradeType);
    getLimitOrders(pair);
  }, [pair]);

  useEffect(() => {
    const feeAsset = portfolio?.find((asset) => asset.name === "META1");

    if (!feeAsset) {
      setError("Not enough FEE");
    } else {
      setError("");
    }
  }, [selectedToAmount]);

  useEffect(() => {
    if (Number(blockPrice) <= 0.003) {
      setError(
        `The amount must be greater than ${(
          0.003 * Number(userCurrencyState.split(" ")[2])
        ).toFixed(3)} ${userCurrencyState.split(" ")[1]}`
      );
    } else {
      setError("");
    }
  }, [blockPrice]);

  useEffect(() => {
    setPasswordShouldBeProvided(false);
  }, [tradeType, selectedFrom, selectedTo, selectedToAmount]);

  useEffect(() => {
    if (isLoadingPrice) {
      inputRef.current.focus();
    }
  }, [isLoadingPrice]);

  const performTradeSubmit = async () => {
    const buyResult = await traderState.perform({
      from: selectedFrom.value,
      to: selectedTo?.value?.trim(),
      amount: selectedToAmount,
      password: password,
      tradePrice: 1 / marketPrice
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

  const calculateSelectedToAmount = (fromAmount) => {
    if (pair == null) return;
    setInvalidEx(false);

    const toAmount = (
      Number(fromAmount) * marketPrice / Number(userCurrencyState.split(" ")[2])
    ).toFixed(selectedTo.label === "USDT" ? 3 : selectedTo.pre);
    setSelectedToAmount(toAmount);
  };

  const calculateCryptoPrice = (e) => {
    const _blockPrice = e.target.value;
    setBlockPrice(_blockPrice);
    const userCurrencySymbol = userCurrencyState.split(" ")[1];

    if (userCurrencySymbol === 'USD' && quoteAsset.symbol === 'USDT') {
      setSelectedToAmount(_blockPrice)
    } else {
      const toAmount = (
        Number(_blockPrice) / quoteAssetPrice / Number(userCurrencyState.split(" ")[2])
      ).toFixed(selectedTo.label === "USDT" ? 3 : selectedTo.pre);
      setSelectedToAmount(toAmount);
    }
  };

  const calculateBlockPrice = (toAmount) => {
    if (!toAmount) {
      setBlockPrice(NaN);
    } else {
      const userCurrencySymbol = userCurrencyState.split(" ")[1];
      const priceForOne = (Number(toAmount) * quoteAssetPrice).toFixed(10);
      setBlockPrice(priceForOne * Number(userCurrencyState.split(" ")[2]));
    }
  };

  const fetchPair = (_selectedTo, _selectedFrom) => {
    const LOG_ID = '[FetchPair]';

    if (
      _selectedTo != null &&
      _selectedFrom != null &&
      _selectedFrom.value !== undefined
    ) {
      const getPairPromise = Meta1.ticker(_selectedFrom.value, _selectedTo.value);
      const getBaseAssetPricePromise = Meta1.ticker("USDT", _selectedFrom.value);
      const getQuoteAssetPricePromise = Meta1.ticker("USDT", _selectedTo.value);
      const getAssetLimitationPromise = Apis.db.get_asset_limitation_value('META1');
      Promise.all([getPairPromise, getBaseAssetPricePromise, getQuoteAssetPricePromise, getAssetLimitationPromise])
        .then(res => {
          // Caculate backing asset value
          const meta1_usdt = res[3] / 1000000000;
          const isQuoting = _selectedTo.value === 'META1';
          console.log(LOG_ID, 'META1 Backing Asset($): ', meta1_usdt);
          let asset_usdt;

          if (_selectedFrom.value === 'META1' || _selectedTo.value === 'META1') {
            asset_usdt = parseFloat(isQuoting ? res[1].latest : res[2].latest) || 1;
            const ratio = isQuoting
              ? asset_usdt / (meta1_usdt + 0.01)
              : (meta1_usdt + 0.01) / asset_usdt;
            console.log(
              LOG_ID, isQuoting ? _selectedFrom.value : _selectedTo.value, ': USDT', asset_usdt
            );

            if (isQuoting) {
              console.log(LOG_ID, 'BUY/SELL price should be lower than', ratio);
            } else {
              console.log(LOG_ID, 'BUY/SELL price should be bigger than', ratio);
            }

            setBackingAssetValue(ratio);
            setBackingAssetPolarity(isQuoting)
          }

          setBaseAssetPrice(res[1].latest === '0' ? 1 : res[1].latest);
          setQuoteAssetPrice(res[2].latest === '0' ? 1 : res[2].latest);
          setPair(res[0]);
        });
    }
  }

  const changeAssetHandler = async (val) => {
    if (val === "USDT") {
      setPriceForAsset(1);
    } else {
      Meta1.ticker("USDT", val).then((res) =>{
        setPriceForAsset(Number(res.latest).toFixed(2));
      });
    }
  };

  const prepareTrade = async () => {
    const feeAsset = portfolio?.find((asset) => asset.name === "META1");
    localStorage.setItem("selectTo", selectedToAmount);

    const marketLiquidity = await calculateMarketLiquidity();

    if (marketLiquidity < selectedToAmount) {
      setError(`Current available liquidity is ${marketLiquidity} ${selectedTo.label}, please adjust amount to ${marketLiquidity} ${selectedTo.label} or below.`);
      return;
    } else if (
      selectedTo.label === "META1" &&
      Number(selectedToAmount) === Number(feeAsset.qty)
    ) {
      setFeeAlert(true);
    } else {
      setPasswordShouldBeProvided(true);
    }
  };  

  const onClickExchange = async () => {
    setTradeInProgress(true);
    setPasswordShouldBeProvided(false);
    dispatch(passKeyRequestService({ login: accountState, password }));
  }

  if (selectedFrom == null && selectedTo == null) return null;
  const getAssets = (except) => options.filter((el) => el.value !== except);

  const inputChangeHandler = (toAmount) => {
    setSelectedToAmount(toAmount);
    calculateBlockPrice(toAmount);
    // calculateSelectedToAmount(fromAmount);
  }

  const onChangeAsset = (val, src) => {
    let _selectedTo = selectedTo;
    let _selectedFrom = selectedFrom;

    setIsLoadingPrice(true);
    setIsInputsEnabled(false);
    setSelectedToAmount(NaN);
    setMarketPrice(0);
    setBackingAssetValue(NaN);
    setBlockPrice(NaN);
    setError(null);
    setInvalidEx(false);

    if (src === 'from') {
      _selectedFrom = val;
      setSelectedFrom(_selectedFrom);
      changeAssetHandler(_selectedFrom.value);
      fetchPair(_selectedTo, _selectedFrom);
    } else if (src === 'to') {
      _selectedTo = val;
      setSelectedTo(_selectedTo);
      fetchPair(_selectedTo, _selectedFrom);
    } else if (src === 'swap') {
      val.preventDefault();
      setSelectedFrom(_selectedTo);
      setSelectedTo(_selectedFrom);
      fetchPair(_selectedFrom, _selectedTo);
    }
  }

  const getLimitOrders = (pair) => {
    Apis.instance()
      .db_api()
      .exec('lookup_asset_symbols', [
        [pair.base, pair.quote]
      ])
      .then(res => {
        const _baseAsset = res[0];
        const _quoteAsset = res[1];
        setBaseAsset(_baseAsset);
        setQuoteAsset(_quoteAsset);

        Apis.instance()
          .db_api()
          .exec(
            'get_limit_orders', 
            [_baseAsset.id, _quoteAsset.id, 300]
          )
          .then((_limitOrders) => {
            setLimitOrders(_limitOrders);

            if (_limitOrders && _limitOrders.length > 0) {
              calculateMarketPrice(_limitOrders, _baseAsset, _quoteAsset);
            } else {
              setIsLoadingPrice(false);
            }
          })
          .catch(err => {
            console.log('get_limit_orders error:', err);
            setIsLoadingPrice(false);
          });
      })
      .catch(err => {
        console.log("lookup_asset_symbols error:", err);
        setIsLoadingPrice(false);
      });
  }

  const calculateMarketLiquidity = async () => {
    let _liquidity = 0;
    setIsLoadingPrice(true);
    const _limitOrders = await Apis.instance()
      .db_api()
      .exec(
        'get_limit_orders', 
        [baseAsset.id, quoteAsset.id, 300]
      );

    if (_limitOrders && _limitOrders.length > 0) {
      for (let limitOrder of _limitOrders) {
        if (limitOrder.sell_price.quote.asset_id === baseAsset.id) {
          _liquidity += Number(limitOrder.for_sale) / Math.pow(10, quoteAsset.precision);
        }
      }
    }

    setIsLoadingPrice(false);
    return parseFloat((_liquidity - 0.0001).toFixed(3));
  }

  const calculateMarketPrice = (_limitOrders, baseAsset, quoteAsset) => {
    let _marketPrice = 0;

    for (let limitOrder of _limitOrders) {
      if (limitOrder.sell_price.quote.asset_id === baseAsset.id) {
        const divideby = Math.pow(10, baseAsset.precision - quoteAsset.precision);
        const price = Number(limitOrder.sell_price.quote.amount / limitOrder.sell_price.base.amount / divideby);
        _marketPrice = _marketPrice > price ? _marketPrice : price;
      }
    }

    if (_marketPrice > 0) {
      _marketPrice = 1 / _marketPrice;

      // Consider backing asset level
      if (baseAsset.symbol === 'META1' || quoteAsset.symbol === "META1") {
        if (backingAssetValue) {
          if (backingAssetPolarity && backingAssetValue < _marketPrice)
            _marketPrice = backingAssetValue;

          if (!backingAssetPolarity && backingAssetValue > _marketPrice)
            _marketPrice = backingAssetValue;
        }
      }

      console.log("marketPrice:", baseAsset.symbol, quoteAsset.symbol, _marketPrice);
      setIsInputsEnabled(true);
      setMarketPrice(_marketPrice);
    }

    setIsLoadingPrice(false);
  }

  const { innerWidth: width } = window;
  const isMobile = width <= 600;
  const ariaLabel = { "aria-label": "description" };

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
                onSuccessTrade()
              }}
            >
              OK
            </Button>
          </Modal.Actions>
        </Modal>
        <div className={"adaptForMainExchange"}>
          <div className={`${styles.mainBlock} marginBottomZero`}>
            <div style={{ marginBottom: "20px", display: 'hidden' }}>
              <Button
                style={{ display: "none" }}
                className={tradeType === 'market' ? 'custom-tab' : ''}
                onClick={() => {
                  if (tradeType === 'market') return;
                  setIsLoadingPrice(true);
                  setTradeType('market');
                }}
              >
                Market Order
              </Button>
              <Button
                style={{ display: "none" }}
                className={tradeType === 'limit' ? 'custom-tab' : ''}
                onClick={() => {
                  if (tradeType === 'limit') return;
                  setIsLoadingPrice(true);
                  setTradeType('limit');
                }}
                ref={inputRef}
              >
                Limit Order
              </Button>
            </div>
            <div className={styles.mainBlockExchange}>
              <div className={styles.leftBlockExchange}>
                <h2 style={{ textAlign: "center" }}>Buy</h2>
                <div id="to">
                  <Grid stackable>
                    <Grid.Column columns={2} className="flex-middle">
                      <Grid.Column>
                        <ExchangeSelect
                          onChange={(val) => onChangeAsset(val, 'to')}
                          options={getAssets(selectedFrom.value)}
                          selectedValue={selectedTo}
                          isDisabled={isLoadingPrice}
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
                                  value={selectedToAmount}
                                  type={"number"}
                                  onChange={(e) => {
                                    if (Number(e.target.value) < 0) return;
                                    if (
                                      (
                                        e.target.value.length < 11 &&
                                        /[-+]?[0-9]*\.?[0-9]*/.test(e.target.value)
                                      )
                                      || `${selectedToAmount}`.length > e.target.value.length
                                    ) {
                                      inputChangeHandler(e.target.value)
                                    }
                                  }}
                                  endAdornment={
                                    <InputAdornment position="end">
                                      {selectedTo.label}
                                    </InputAdornment>
                                  }
                                  inputProps={ariaLabel}
                                  disabled={invalidEx || !isInputsEnabled}
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
                                      if (Number(e.target.value) < 0) return;
                                      if (
                                        (
                                          e.target.value.length < 11 &&
                                          /[-+]?[0-9]*\.?[0-9]*/.test(e.target.value)
                                        )
                                        || `${blockPrice}`.length > e.target.value.length
                                      ) {
                                        setAmountPercent(null);
                                        calculateCryptoPrice(e);
                                      }
                                    }}
                                    min="0"
                                    inputmode="numeric"
                                    pattern="\d*"
                                    type={"number"}
                                    placeholder={`Amount ${userCurrencyState.split(" ")[1]}`}
                                    disabled={invalidEx || !isInputsEnabled}
                                    style={invalidEx ? { opacity: "0.5" } : null}
                                    value={blockPrice}
                                  />
                                  <span className={styles['abs-sp']} >{userCurrencyState.split(" ")[0]}</span>
                                </div>
                              </div>
                            }
                          />
                        </div>
                      </Grid.Column>
                    </Grid.Column>
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
                      disabled={isLoadingPrice}
                      onClick={(e) => onChangeAsset(e, 'swap')}
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
                <h2 style={{ textAlign: "center" }}>Sell</h2>
                <div id="from">
                  <Grid stackable>
                    <Grid.Column columns={2} className="flex-middle">
                      <Grid.Column>
                        <ExchangeSelect
                          onChange={(val) => onChangeAsset(val, 'from')}
                          options={getAssets(selectedTo.value)}
                          selectedValue={selectedFrom}
                          isDisabled={isLoadingPrice}
                        />
                      </Grid.Column>
                    </Grid.Column>
                  </Grid>
                </div>
              </div>
            </div>
            <div className={styles.absoluteBottomBlock}>
              <div className={styles.centeredBlock}>
                <div className={styles.leftBlockCrypt}>
                  <div className={styles.textBlockLeft}>
                    <span>You will Receive</span>
                    <h4>
                      {selectedToAmount ? selectedToAmount : 0}{" "}
                      {selectedTo.label}
                    </h4>
                    <span>
                      {!invalidEx && blockPrice
                        ? `${blockPrice}${userCurrencyState.split(" ")[0]}`
                        : 0}
                    </span>
                  </div>
                  <div className={"imgToCenter"} style={{ display: "flex",  marginLeft: "1rem" }}>
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
                  <div
                    className={styles.textBlockRight}
                    style={{ marginRight: "1rem" }}
                  >
                    <span>You are exchanging</span>
                    <h4>
                      {selectedFrom.label}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            {error ? (
              <Grid.Row centered style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "red", textAlign: "center" }}>{error}</h5>
              </Grid.Row>
            ) : null}
            {(tradeType === 'market' && !isLoadingPrice && marketPrice === 0) ? (
              <Grid.Row centered style={{ marginBottom: "1rem" }}>
                <h5 style={{ color: "red", textAlign: "center" }}>
                  No liquidity
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
                    style = {{width: 310}}
                  />

                  <Button
                    disabled={password.length === 0}
                    onClick={onClickExchange}
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
                    !selectedToAmount ||
                    selectedToAmount === 0.0 ||
                    selectedTo.balance === 0 ||
                    Number(selectedTo.balance) < Number(selectedToAmount) ||
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
