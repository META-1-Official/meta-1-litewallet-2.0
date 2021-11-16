import React, {useEffect, useState} from "react";
import styles from './Settings.module.scss'
import userIcon from '../../images/default-pic1.png'
import RightSideHelpMenuThirdType from "../RightSideHelpMenuThirdType/RightSideHelpMenuThirdType";


const Settings = (props) => {

    const {
        onClickExchangeEOSHandler,
        onClickExchangeUSDTHandler,
        account
    } = props

    const [currency, setCurrency] = useState('$ USD 1')

    useEffect(() => {
        setTimeout(() => {
            document.getElementById('mainBlock').style.height = 'auto';
        }, 50)
    }, [])

    const changeCurrencyHandler = (e) => {
        e.preventDefault();
        localStorage.setItem('currency', currency)
        alert('Your currency has been saved successfully')
    }

    return (
        <div>
            <div style={{background: '#fff', padding: '1.05rem 2rem'}}>
                <h3 style={{ fontWeight: '600'}}><strong>Account Settings</strong></h3>
            </div>
            <div className={styles.adaptNeed}>
                <div className={styles.mainBlockAdapt} style={{width: '70%'}}>
                    <div className={styles.mainBlock}>
                        <div className={styles.mainHeader}>
                            <h3 style={{fontWeight: '700'}}>Edit Profile</h3>
                        </div>
                        <hr style={{color: 'rgba(80, 83, 97, 0.47)'}}/>
                        <div className={styles.changeDataBlock}>
                            <div className={styles.imgChangeBlock}>
                                <div className={styles.userNewImgBlock}>
                                    <img src={userIcon} style={{width: '140px', height: '140px'}} alt=""/>
                                </div>
                                <div className={styles.extraInfoBlock}>
                                    <div style={{fontFamily: 'Poppins, sans-serif'}}>
                                        <h4 style={{margin: '0'}}>Upload a Photo</h4>
                                        <button style={{marginBottom: '1rem'}} type={'button'} className={styles.Button}>Choose a File</button>
                                    </div>
                                    <div className={styles.extraText}>
                                        <span>Acceptable formates: jpg, png only</span>
                                        <span>Maximum file size is 1mb and minimum size 70kb</span>
                                    </div>
                                </div>
                            </div>
                            <hr style={{color: 'rgba(80, 83, 97, 0.47)'}}/>
                            <div className={styles.extraInfoChangeBlock}>
                                <h3 style={{fontWeight: '400', margin: '0 0 .3rem 0'}}>Account Profile</h3>
                                <span>You can update an login wallet associated with your account using the form below.
                                </span>
                            </div>
                            <form className={styles.changeDataForm}>
                                <div className={styles.changeDataInput}>
                                    <label style={{color: 'rgb(90, 103, 118)!important', margin: '.5rem 0'}} htmlFor="email">Login<span style={{color: 'red'}}>*</span></label>
                                    <input
                                        type={'text'}
                                        className={styles.input}
                                        placeholder={account}
                                        name={'login'}
                                    />
                                </div>
                                    <div className={styles.blockButton}>
                                        <button type={'submit'} style={{width: '10rem', marginBottom: '2rem'}} className={styles.Button}>Update</button>
                                    </div>
                            </form>
                        </div>
                    </div>
                    <div className={styles.changeCurrencyBlock}>
                        <div className={styles.changeCurrencyHeader}>
                            <h3>Currency Preference</h3>
                        </div>
                        <hr style={{color: 'rgba(80, 83, 97, 0.47)'}}/>
                        <form onSubmit={changeCurrencyHandler} className={styles.changeCurrencyForm}>
                            <div style={{margin: '0 0 1rem 0', color: 'rgb(90, 103, 118)'}}>
                                <span>Select your preferred display currency for all markets.</span>
                            </div>
                            <div className={styles.changeDataInput}>
                                <select className={styles.currencySelect} onChange={(e) => setCurrency(e.target.value)} name="currencies" id="">
                                    <option value="$ USD 1">$ (USD)</option>
                                    <option value="€ EUR 0.86">€ (EUR)</option>
                                    <option value="€ EUR 0.86">£ (GBP)</option>
                                    <option value="€ EUR 0.86">₽ (RUB)</option>
                                    <option value="€ EUR 0.86">CA$ (CAD)</option>
                                </select>
                            </div>
                            <div className={styles.blockButton}>
                                <button type={'submit'} style={{width: '10rem'}} className={styles.Button}>Update</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className={styles.helpBlockAdapt} style={{width: '30%'}}>
                    <RightSideHelpMenuThirdType
                        onClickExchangeEOSHandler = {onClickExchangeEOSHandler}
                        onClickExchangeUSDTHandler = {onClickExchangeUSDTHandler}
                    />
                </div>
            </div>
        </div>
    )
}

export default Settings;