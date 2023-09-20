import React, { useEffect, useRef, useState, useReducer } from "react";
import styles from "./Settings.module.scss";
import "./settings.css";
import {
  Modal,
  Button,
  Grid,
  Icon,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import { changeCurrencySelector, checkPasswordObjSelector, cryptoDataSelector, userCurrencySelector } from "../../store/meta1/selector";
import { accountsSelector, isValidPasswordKeySelector, passwordKeyErrorSelector, profileImageSelector, uploadImageErrorSelector } from "../../store/account/selector";
import { deleteAvatarRequest, passKeyRequestService, passKeyResetService, uploadAvatarRequest, uploadAvatarReset } from "../../store/account/actions";
import { saveUserCurrencyRequest, saveUserCurrencyReset } from "../../store/meta1/actions";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from '@mui/material/MenuItem';
import { getImage } from "../../lib/images";
import { toast } from 'react-toastify';

// notification items
import AnnouncementIcon from '../../images/announcements.png';
import EventIcon from '../../images/events.png';
import DepositIcon from '../../images/deposit.png';
import WithdrawlIcon from '../../images/withdrawal.png';
import OrderCreatedIcon from '../../images/order-created.png';
import OrderCancelledIcon from '../../images/order-cancelled.png';

const Settings = (props) => {
  const userCurrencyState = useSelector(userCurrencySelector);
  const uploadImageErrorState = useSelector(uploadImageErrorSelector);
  const [currency, setCurrency] = useState(userCurrencyState);
  const [modalOpened, setModalOpened] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openPasswordSection, setOpenPasswordSection] = useState(false);
  const [isRemoveBtn, setIsRemoveBtn] = useState(false);
  const [isPasswordTouch, setIsPasswordTouch] = useState(false);
  const [activeTab, setActiveTab] = useState('edit_profile');
  const [notiMode, setNotiMode] = useState(null);
  const [selectedCoinMovement, setSelectedCoinMovement] = useState('META1');
  const [selectedTendency, setSelectedTendency] = useState('up');
  const [selectedComparator, setSelectedComparator] = useState('price');
  const [comparatorValue, setComparatorValue] = useState();
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const imageRef = useRef();
  const dispatch = useDispatch();
  const cryptoDataState = useSelector(cryptoDataSelector);
  const accountNameState = useSelector(accountsSelector);
  const profileImageState = useSelector(profileImageSelector);
  const changeCurrencyState = useSelector(changeCurrencySelector);
  const isValidPasswordKeyState = useSelector(isValidPasswordKeySelector);
  const passwordKeyErrorState = useSelector(passwordKeyErrorSelector);
  const iconList = {
    events: EventIcon,
    announcements: AnnouncementIcon,
    deposits: DepositIcon,
    withdrawals: WithdrawlIcon,
    tradeExcuted: OrderCreatedIcon,
    tradeCanceled: OrderCancelledIcon
  }

  useEffect(() => {
    var conf = JSON.parse(localStorage.getItem("noti_conf"));
    if (!conf) {
      conf = {
        specNotification: [
          { events: true },
          { announcements: true },
          { deposits: true },
          { tradeExcuted: true },
          { tradeCanceled: true },
        ],
        coinMovements: [
          {
            meta1: {
              toggle: true,
              tendency: 'up',
              comparator: ['percentage', 1]
            }
          },
          {
            usdt: {
              toggle: true,
              tendency: 'up',
              comparator: ['price', 10]
            }
          }
        ]
      }
    }
    localStorage.setItem('noti_conf', JSON.stringify(conf));
    setNotiMode(conf);
    forceUpdate();
  }, []);

  useEffect(() => {
    if (!isValidPasswordKeyState && passwordKeyErrorState) {
      setPasswordError("Invalid Credentials");
      return;
    }
    if (isValidPasswordKeyState) {
      if (isRemoveBtn) {
        dispatch(passKeyResetService());
        dispatch(deleteAvatarRequest(accountNameState));
      }
      else {
        imageRef.current.click();
      }
      closePasswordSectionHandler(false);
    }
  }, [isValidPasswordKeyState, passwordKeyErrorState]);

  useEffect(() => {
    if (changeCurrencyState) {
      setModalOpened(true);
    }
  }, [changeCurrencyState]);

  const changeCurrencyHandler = async (e) => {
    e.preventDefault();
    dispatch(saveUserCurrencyRequest({ login: accountNameState, currency }));
  };

  const uploadImageValidation = async () => {
    if (!password) {
      setIsPasswordTouch(true);
      return;
    }
    dispatch(passKeyRequestService({ login: accountNameState, password }));
  }

  const removeImageValidation = async () => {
    if (!password) {
      setIsPasswordTouch(true);
      return;
    }
    dispatch(passKeyRequestService({ login: accountNameState, password }));
  }

  const uploadFile = async (e) => {
    e.preventDefault();
    if (e.target?.files[0]?.name) {
      let type = e.target?.files[0]?.name.split(".")[1];
      if (type === "png" || type === "jpeg" || type === "jpg") {
        if (
          e.target?.files[0]?.size > 70000 &&
          e.target?.files[0]?.size < 1000000
        ) {
          const formData = new FormData();
          formData.append("login", accountNameState);
          formData.append(
            "file",
            document.getElementById("file_upload")?.files[0]
          );
          dispatch(uploadAvatarRequest(formData));
        } else {
          alert("Invalid file size");
        }
      } else {
        alert("Invalid file format");
      }
    } else {
      alert("Please select a file");
    }
    document.getElementById("file_upload").value = "";
  }

  const openPasswordSectionHandler = (isRemove = false) => {
    setPassword('');
    setOpenPasswordSection(true);
    setPasswordError('');
    if (isRemove) setIsRemoveBtn(true);
  }

  const closePasswordSectionHandler = () => {
    setOpenPasswordSection(false);
    setPasswordError('');
    setIsRemoveBtn(false);
    setIsPasswordTouch(false);
  }

  const NotificationItem = (props) => {
    const { icon, type, toggle, onToggle } = props;

    return (
      <div className={styles.notificationItem} >
        <div className={styles.leftItem}>
          <img src={icon} alt="edit profile" />
          <span>{type}</span>
        </div>
        <div className={styles.rightItem}>
          <Switch
            className={styles.switch}
            value={type}
            onClick={onToggle}
            inputProps={{ "aria-label": "controlled" }}
            color={"warning"}
            checked={toggle}
          />
        </div>
      </div>
    )
  }

  const CoinNotificationItem = (props) => {
    const { asset, gteOrLte, value, comparator, onToggle, toggle } = props;

    return (
      <div className={styles.coinNotificationItem} >
        <div className={styles.leftItem}>
          <img src={getImage(asset.toUpperCase())} alt="edit profile" />
          <div className={styles.coinSec}>
            <span>{asset}</span>
            <span>{`Price move ${gteOrLte} by ${comparator === 'price' ? '$' : ''}${value}${comparator === 'percentage' ? '%' : ''}`}</span>
          </div>
        </div>
        <div className={styles.rightItem}>
          <Switch
            className={styles.switch}
            checked={toggle}
            onClick={onToggle}
            inputProps={{ "aria-label": "controlled" }}
            color={"warning"}
            value={asset}
          />
          <button onClick={() => handleClose(asset)}>
            <i className="fa fa-times" />
          </button>
        </div>
      </div>
    )
  }

  const handleCoinSelect = (event) => {
    setSelectedCoinMovement(event.target.value);
  };

  const handleTendencyChange = (event) => {
    setSelectedTendency(event.target.value);
  };

  const handleComparatorChange = (event) => {
    setSelectedComparator(event.target.value);
  };

  const handleComparatorValueChange = (event) => {
    setComparatorValue(event.target.value);
  }

  const handleToggle = (event) => {
    let type = event.target.value;
    var new_conf = notiMode;

    new_conf.specNotification.map((ele, index) => {
      var obj_key, obj_value;
      for (var key in ele) {
        obj_key = key;
        obj_value = ele[key];
      }

      if (obj_key === type) new_conf.specNotification[index][obj_key] = event.target.checked;
    });

    localStorage.setItem('noti_conf', JSON.stringify(new_conf));
    setNotiMode(new_conf);
    forceUpdate();
  }

  const handleCoinMovementToggle = (event) => {
    let asset = event.target.value.toLowerCase();
    var new_conf = notiMode;

    new_conf.coinMovements.map((ele, index) => {
      var obj_key, obj_value;
      for (var key in ele) {
        obj_key = key;
        obj_value = ele[key];
      }

      if (obj_key === asset) new_conf.coinMovements[index][obj_key].toggle = event.target.checked;
    });

    localStorage.setItem('noti_conf', JSON.stringify(new_conf));
    setNotiMode(new_conf);
    forceUpdate();
  }

  const handleCoinSave = () => {
    if (!selectedCoinMovement) {
      toast('Please select asset');
      return;
    }
    if (!selectedTendency) {
      toast('Please select tendency');
      return;
    }
    if (!selectedComparator) {
      toast('Please select tendency');
      return;
    }
    if (!comparatorValue) {
      toast('Please adjust value');
      return;
    }

    var new_conf = notiMode;
    var flag = false;
    var symbol = selectedCoinMovement.toLowerCase();

    new_conf.coinMovements.map((ele, index) => {
      var obj_key, obj_value;
      for (var key in ele) {
        obj_key = key;
        obj_value = ele[key];
      }

      if (obj_key === symbol) {
        new_conf.coinMovements[index][obj_key].toggle = true;
        new_conf.coinMovements[index][obj_key].tendency = selectedTendency;
        new_conf.coinMovements[index][obj_key].comparator = [selectedComparator, comparatorValue];
        flag = true;
      }
    })

    if (!flag) {
      var pushVal = {};
      pushVal[symbol] = {};
      pushVal[symbol].toggle = true;
      pushVal[symbol].tendency = selectedTendency;
      pushVal[symbol].comparator = [selectedComparator, comparatorValue];
      new_conf.coinMovements.push(pushVal);
    }

    localStorage.setItem('noti_conf', JSON.stringify(new_conf));
    setNotiMode(new_conf);
    forceUpdate();
    toast('Successfully saved your settings');
  }

  const handleClose = (val) => {
    var symbol = val.toLowerCase();
    var new_conf = notiMode;

    new_conf.coinMovements.map((ele, index) => {
      var obj_key, obj_value;
      for (var key in ele) {
        obj_key = key;
        obj_value = ele[key];
      }

      if (obj_key === symbol) {
        new_conf.coinMovements.splice(index, 1);
      }
    })

    localStorage.setItem('noti_conf', JSON.stringify(new_conf));
    setNotiMode(new_conf);
    forceUpdate();
    toast('Successfully deleted.');
  }

  return (
    <>
      <Modal
        size="mini"
        open={modalOpened}
        onClose={() => {
          setModalOpened(false);
          dispatch(saveUserCurrencyReset())
        }}
        id={"modal-1"}
      >
        <Modal.Header>Currency change</Modal.Header>
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
            <h3 style={{ textAlign: "center" }}>
              You have successfully changed the currency to{" "}
              {currency.split(" ")[0]}
            </h3>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            style={{ backgroundColor: "#fc0", color: "white" }}
            onClick={() => {
              setModalOpened(false);
              dispatch(saveUserCurrencyReset())
            }}
          >
            OK
          </Button>
        </Modal.Actions>
      </Modal>
      <div>
        <div className={styles.settingsBlock}>
          <h3 style={{ fontWeight: "600" }}>
            <strong>Account Settings</strong>
          </h3>
        </div>
        <div className={styles.adaptNeed}>
          <ul className={styles.subNaveBar}>
            <li
              onClick={() => setActiveTab('edit_profile')}
              className={styles.Li + " nav-item"}
            >
              <div className={styles.containerLi}>
                <div className={styles.leftLi}>
                  <i className="fas fa-user" />
                  <div className={styles.textSpan} >
                    <span>Edit Profile</span>
                  </div>
                </div>
                <div className={styles.rightLi}>
                  <i
                    className="fas fa-chevron-right"
                  />
                </div>
              </div>
            </li>
            <li
              onClick={() => setActiveTab('currency_preference')}
              className={styles.Li + " nav-item"}
            >
              <div className={styles.containerLi}>
                <div className={styles.leftLi}>
                  <i className="fa fa-cog" />
                  <div className={styles.textSpan} >
                    <span>Currency Preference</span>
                  </div>
                </div>
                <div className={styles.rightLi}>
                  <i
                    className="fas fa-chevron-right"
                  />
                </div>
              </div>
            </li>
            <li
              onClick={() => setActiveTab('notification_preference')}
              className={styles.Li + " nav-item"}
            >
              <div className={styles.containerLi}>
                <div className={styles.leftLi}>
                  <i className="fa fa-bell" />
                  <div className={styles.textSpan} >
                    <span>Notification Preference</span>
                  </div>
                </div>
                <div className={styles.rightLi}>
                  <i
                    className="fas fa-chevron-right"
                  />
                </div>
              </div>
            </li>
          </ul>
          <div className={styles.tabWrapper}>
            {activeTab === 'edit_profile' && <div className={styles.mainBlock}>
              <div className={styles.mainHeader}>
                <h3 style={{ fontWeight: "700" }}>Edit Profile</h3>
              </div>
              <hr />
              <div className={styles.changeDataBlock}>
                <div className={styles.imgChangeBlock}>
                  <div className={styles.userNewImgBlock}>
                    <img
                      src={profileImageState}
                      id="imageUser"
                      style={{
                        width: "140px",
                        height: "140px",
                        borderRadius: "100px",
                      }}
                      alt=""
                    />
                  </div>
                  <div className={styles.extraInfoBlock}>
                    {<div style={openPasswordSection ? { display: 'none', fontFamily: "Poppins, sans-serif" } : { display: 'block', fontFamily: "Poppins, sans-serif" }}>
                      <h4 className={styles.uploadPhotoTitle}>Upload a Photo</h4>
                      <div className={styles.buttonAdapt}>
                        <div
                          className={styles.blockForUpload}
                          style={{ position: "relative" }}
                          onClick={() => openPasswordSectionHandler()}
                        >
                          <p className={styles.pUpload}>Choose a File</p>

                        </div>
                        <div style={{ display: 'none' }} >
                          <input
                            type="file"
                            id="file_upload"
                            onChange={(e) => {
                              uploadFile(e);
                            }}
                            onClick={() => {
                              dispatch(passKeyResetService());
                            }}
                            ref={imageRef}
                            className={styles.uploadButton}
                          />
                        </div>
                        <button
                          className={styles.Button}
                          style={{ marginLeft: "1rem" }}
                          onClick={() => openPasswordSectionHandler(true)}
                        >
                          Remove the Photo
                        </button>
                      </div>
                    </div>}
                    {!!openPasswordSection && <div>
                      <label>Enter Passkey</label>
                      <input
                        type='password'
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setIsPasswordTouch(true)
                        }}
                        onBlur={() => setIsPasswordTouch(true)}
                        className={styles.input_password}
                      />
                      {!password && isPasswordTouch && <span style={{ color: 'red', display: 'block' }}>Passkey field can't be empty</span>}
                      <button onClick={!isRemoveBtn ? uploadImageValidation : removeImageValidation} className={styles.Button_Password} >Submit</button>
                      <button onClick={closePasswordSectionHandler} className={styles.Button_Password}>Cancel</button>
                    </div>}
                    <div className={styles.extraText}>
                      <span>Acceptable formats: jpg, png only</span>
                      <span>
                        Maximum file size is 1mb and minimum size 70kb
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            }
            {activeTab === 'currency_preference' && <div className={styles.changeCurrencyBlock}>
              <div className={styles.changeCurrencyHeader}>
                <h3>Currency Preference</h3>
              </div>
              <hr />
              <form
                onSubmit={changeCurrencyHandler}
                className={styles.changeCurrencyForm}
              >
                <div
                  style={{ margin: "0 0 1rem 0", color: "rgb(90, 103, 118)" }}
                >
                  <span>
                    Select your preferred display currency for all markets.
                  </span>
                </div>
                {cryptoDataState && cryptoDataState?.ExchangeRate && Array.isArray(cryptoDataState?.ExchangeRate) && cryptoDataState?.ExchangeRate.length > 0 && <div className={styles.changeDataInput}>
                  <select
                    className={styles.currencySelect}
                    onChange={(e) => setCurrency(e.target.value)}
                    name="currencies"
                    id="currenciesChoose"
                    value={currency}
                  >
                    <option value="$ USD 1">$ (USD)</option>
                    <option value={`€ EUR ${cryptoDataState.ExchangeRate[0].rate}`}>
                      € (EUR)
                    </option>
                    <option value={`£ GBP ${cryptoDataState.ExchangeRate[1].rate}`}>
                      £ (GBP)
                    </option>
                    <option value={`₽ RUB ${cryptoDataState.ExchangeRate[2].rate}`}>
                      ₽ (RUB)
                    </option>
                    <option
                      value={`CA$ CAD ${cryptoDataState.ExchangeRate[3].rate}`}
                    >
                      CA$ (CAD)
                    </option>
                  </select>
                </div>}
                <div className={styles.blockButton}>
                  <button
                    type={"submit"}
                    style={{ width: "10rem" }}
                    className={styles.Button}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>}
            {activeTab === 'notification_preference' && <div className={styles.changeNotifcationBlock}>
              <div className={styles.changeCurrencyHeader}>
                <h3>Notification Preference</h3>
              </div>
              <hr />
              <div className={styles.notificationPrefContent}>
                <h5>Select the kind of notifications you get about your activities.</h5>
                <hr />
                {
                  notiMode.specNotification && notiMode.specNotification.map((ele) => {
                    var obj_key, obj_value;
                    for (var key in ele) {
                      obj_key = key;
                      obj_value = ele[key];
                    }
                    return <NotificationItem
                      type={obj_key}
                      icon={iconList[obj_key]}
                      toggle={obj_value}
                      onToggle={handleToggle}
                    />
                  })
                }
                <div className={styles.coinMovements}>Coin Movements</div>
                {
                  notiMode.coinMovements && notiMode.coinMovements.map((ele) => {
                    var obj_key, obj_value;
                    for (var key in ele) {
                      obj_key = key;
                      obj_value = ele[key];
                    }
                    return <CoinNotificationItem
                      asset={obj_key.toUpperCase()}
                      gteOrLte={obj_value.tendency}
                      toggle={obj_value.toggle}
                      value={obj_value.comparator[1]}
                      comparator={obj_value.comparator[0]}
                      onToggle={handleCoinMovementToggle}
                    />
                  })
                }
              </div>
              <div className={styles.form_custom}>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="coin-122">
                      <p className={styles.coin_p}>Coin Movements</p>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={styles.common_margin}>
                      <label className={styles.label_same}>Coins:</label>
                      <Select
                        value={selectedCoinMovement}
                        onChange={handleCoinSelect}
                      >
                        {process.env.REACT_APP_CRYPTOS_ARRAY.split(',').map(ele => {
                          return <MenuItem value={ele} className="wallet-option">
                            <div className="wallet-option-picture">
                              <img alt="eth" src={getImage(ele)} />
                            </div>
                            <div>
                              <div className="wallet-option-content__currency">
                                <span className="wallet-option-content__name">
                                  {ele}{" "}
                                </span>
                              </div>
                            </div>
                          </MenuItem>
                        })}
                      </Select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className={styles.common_margin}>
                      <label className={styles.label_same}>Movement:</label>
                      <select value={selectedTendency} onChange={handleTendencyChange} className={styles.select_same}>
                        <option value='up'>Greator Than</option>
                        <option value='down'>Less Than</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6">
                    <div className={styles.common_margin}>
                      <select value={selectedComparator} onChange={handleComparatorChange} className={styles.select_same} >
                        <option value='price'>By Price</option>
                        <option value='percentage'>By Percentage</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={styles.common_margin}>
                      <input type="number" placeholder={selectedComparator === "price" ? '$10.00' : '5.00%'} value={comparatorValue} onChange={handleComparatorValueChange} />
                    </div>
                  </div>

                  <Button className={styles.btn_save_movment} onClick={handleCoinSave}>Save</Button>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
      </div>

      <Modal
        size="mini"
        open={passwordError !== '' || uploadImageErrorState}
        onClose={() => {
          setPasswordError('');
          dispatch(passKeyResetService());
          if (uploadImageErrorState) {
            dispatch(uploadAvatarReset());
          }
        }}
        id={"modal-1"}
      >
        <Modal.Header>Error occured</Modal.Header>
        <Modal.Content>
          <Grid verticalAlign="middle" centered>
            <Grid.Row centered columns={2}>
              <Grid.Column width={4}>
                <Icon disabled name="warning sign" size="huge" />
              </Grid.Column>

              <Grid.Column width={10}>
                <div className="trade-error">{uploadImageErrorState ? 'Something went wrong' : passwordError}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button positive onClick={() => {
            setPasswordError('');
            dispatch(passKeyResetService());
            if (uploadImageErrorState) {
              dispatch(uploadAvatarReset());
            }
          }}>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Settings;
