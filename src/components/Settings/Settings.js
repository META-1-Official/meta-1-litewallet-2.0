import React, { useEffect, useRef, useState } from "react";
import styles from "./Settings.module.scss";
import axios from "axios";
import RightSideHelpMenuThirdType from "../RightSideHelpMenuThirdType/RightSideHelpMenuThirdType";
import {
  Image,
  Modal,
  Button,
  Grid,
  Icon,
  Label,
  Popup,
} from "semantic-ui-react";
import { saveUserCurrency, deleteAvatar } from "../../API/API";
import logoNavbar from "../../images/default-pic2.png";
import logoDefalt from "../../images/default-pic1.png";

const Settings = (props) => {
  const {
    onClickExchangeEOSHandler,
    onClickExchangeUSDTHandler,
    account,
    cryptoData,
    userIcon,
    getAvatarFromBack,
    userCurrency,
    setUserCurrency,
    setUserImageDefault,
    setUserImageNavbar,
    checkPaswordObj
  } = props;

  const [currency, setCurrency] = useState(userCurrency);
  const [modalOpened, setModalOpened] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [openPasswordSection, setOpenPasswordSection] = useState(false);
  const [isRemoveBtn, setIsRemoveBtn] = useState(false);
  const [isPasswordTouch, setIsPasswordTouch] = useState(false);
  const imageRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("mainBlock").style.height = "auto";
    }, 50);
  }, []);

  const changeCurrencyHandler = async (e) => {
    e.preventDefault();
    await saveUserCurrency(
      localStorage.getItem("login"),
      currency.split(" ")[1]
    );
    setUserCurrency(currency);
    setModalOpened(true);
  };

  async function removePhoto() {
    await deleteAvatar(localStorage.getItem("login"));
    setUserImageDefault(logoDefalt);
    setUserImageNavbar(logoNavbar);
  }

  const uploadImageValidation = async () => {
    if (!password) {
      setIsPasswordTouch(true);
      return;
    }
    const result = await checkPaswordObj.checkPasword(password)
    if (result.error !== null) {
      setPasswordError(result.error)
      return
    }
    imageRef.current.click()
    closePasswordSectionHandler(false)
  }

  const removeImageValidation = async () => {
    if (!password) {
      setIsPasswordTouch(true);
      return;
    }
    const result = await checkPaswordObj.checkPasword(password)
    if (result.error !== null) {
      setPasswordError(result.error)
      return
    }
    removePhoto()
    closePasswordSectionHandler(false)
  }

  async function uploadFile(e) {
    e.preventDefault();

    if (e.target?.files[0]?.name) {
      let type = e.target?.files[0]?.name.split(".")[1];
      if (type === "png" || type === "jpeg" || type === "jpg") {
        if (
          e.target?.files[0]?.size > 70000 &&
          e.target?.files[0]?.size < 1000000
        ) {
          const formData = new FormData();
          formData.append("login", account);
          formData.append(
            "file",
            document.getElementById("file_upload")?.files[0]
          );
          const { data } = await axios.post(
            `https://${process.env.REACT_APP_BACK_URL}/saveAvatar`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          setUserImageDefault(`https://${process.env.REACT_APP_BACK_URL}/public/${data.message}`);
          setUserImageNavbar(`https://${process.env.REACT_APP_BACK_URL}/public/${data.message}`);
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
    setPassword('')
    setOpenPasswordSection(true)
    setPasswordError('')
    if (isRemove) setIsRemoveBtn(true)
  }
  const closePasswordSectionHandler = () => {
    setOpenPasswordSection(false)
    setPasswordError('')
    setIsRemoveBtn(false)
    setIsPasswordTouch(false)
  }
  return (
    <>
      <Modal
        size="mini"
        open={modalOpened}
        onClose={() => {
          setModalOpened(false);
        }}
        id={"modalExch"}
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
            }}
          >
            OK
          </Button>
        </Modal.Actions>
      </Modal>
      <div>
        <div style={{ background: "#fff", padding: "1.05rem 2rem" }}>
          <h3 style={{ fontWeight: "600" }}>
            <strong>Account Settings</strong>
          </h3>
        </div>
        <div className={styles.adaptNeed}>
          <div className={styles.mainBlockAdapt} style={{ width: "70%" }}>
            <div className={styles.mainBlock}>
              <div className={styles.mainHeader}>
                <h3 style={{ fontWeight: "700" }}>Edit Profile</h3>
              </div>
              <hr style={{ color: "rgba(80, 83, 97, 0.47)" }} />
              <div className={styles.changeDataBlock}>
                <div className={styles.imgChangeBlock}>
                  <div className={styles.userNewImgBlock}>
                    <img
                      src={userIcon}
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
                      <h4 style={{ margin: "0" }}>Upload a Photo</h4>
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
                      <label>Enter Password</label>
                      <input
                        type='password'
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setIsPasswordTouch(true)
                        }}
                        onBlur={() => setIsPasswordTouch(true)}
                        placeholder='Enter Password'
                        className={styles.input_password}
                      />
                      {!password && isPasswordTouch && <span style={{ color: 'red', display: 'block' }}>Password field can't be empty</span>}
                      <button onClick={!isRemoveBtn ? uploadImageValidation : removeImageValidation} className={styles.Button_Password} >Submit</button>
                      <button onClick={closePasswordSectionHandler} className={styles.Button_Password}>Cancel</button>
                    </div>}
                    <div className={styles.extraText}>
                      <span>Acceptable formates: jpg, png only</span>
                      <span>
                        Maximum file size is 1mb and minimum size 70kb
                      </span>
                    </div>
                  </div>
                </div>
                <hr style={{ color: "rgba(80, 83, 97, 0.47)" }} />
                <div className={styles.extraInfoChangeBlock}>
                  <h3 style={{ fontWeight: "400", margin: "0 0 .3rem 0" }}>
                    Account Profile
                  </h3>
                  <span>
                    You can update an login wallet associated with your account
                    using the form below.
                  </span>
                </div>
                <form className={styles.changeDataForm}>
                  <div className={styles.changeDataInput}>
                    <label
                      style={{
                        color: "rgb(90, 103, 118)!important",
                        margin: ".5rem 0",
                      }}
                      htmlFor="email"
                    >
                      Login<span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type={"text"}
                      className={styles.input}
                      placeholder={account}
                      name={"login"}
                      disabled
                    />
                  </div>
                  <div className={styles.blockButton}>
                    <button
                      type={"submit"}
                      style={{ width: "10rem", marginBottom: "2rem" }}
                      className={styles.Button + " " + styles.disabled}
                      disabled
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className={styles.changeCurrencyBlock}>
              <div className={styles.changeCurrencyHeader}>
                <h3>Currency Preference</h3>
              </div>
              <hr style={{ color: "rgba(80, 83, 97, 0.47)" }} />
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
                <div className={styles.changeDataInput}>
                  <select
                    className={styles.currencySelect}
                    onChange={(e) => setCurrency(e.target.value)}
                    name="currencies"
                    id="currenciesChoose"
                    value={currency}
                  >
                    <option value="$ USD 1">$ (USD)</option>
                    <option value={`€ EUR ${cryptoData.ExchangeRate[0].rate}`}>
                      € (EUR)
                    </option>
                    <option value={`£ GBP ${cryptoData.ExchangeRate[1].rate}`}>
                      £ (GBP)
                    </option>
                    <option value={`₽ RUB ${cryptoData.ExchangeRate[2].rate}`}>
                      ₽ (RUB)
                    </option>
                    <option
                      value={`CA$ CAD ${cryptoData.ExchangeRate[3].rate}`}
                    >
                      CA$ (CAD)
                    </option>
                  </select>
                </div>
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
            </div>
          </div>
          <div className={styles.helpBlockAdapt} style={{ width: "30%" }}>
            <RightSideHelpMenuThirdType
              onClickExchangeEOSHandler={onClickExchangeEOSHandler}
              onClickExchangeUSDTHandler={onClickExchangeUSDTHandler}
            />
          </div>
        </div>
      </div>

      <Modal
        size="mini"
        open={passwordError !== ''}
        onClose={() => setPasswordError('')}
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
                <div className="trade-error">{passwordError}</div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button positive onClick={() => setPasswordError('')}>
            OK
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default Settings;
