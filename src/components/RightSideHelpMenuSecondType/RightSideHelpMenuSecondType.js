import * as React from 'react'
import styles from './RightSideHelpMenuSecondType.module.scss'

const RightSideHelpMenuSecondType = (props) => {

    const {
        onClickExchangeEOSHandler,
        onClickExchangeUSDTHandler
    } = props

    return (
        <>
            <div className={styles.newCrypto}>
                <h5 style={{fontWeight: 'bold', fontSize: '1rem'}}>New Crypto on META1</h5>
                <hr/>
                <div className={styles.newCryptoBlock}>
                    <div className={styles.crypto} id={'usdtBlock'} onClick={onClickExchangeUSDTHandler} style={{cursor: 'pointer'}}>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <img style={{width: '35px', height: '35px', marginTop: '.3rem'}}  src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png" alt="uniswap"/>
                            <div className={styles.blockCryptText} style={{marginLeft: '.5rem'}}>
                                <h6>USDT</h6>
                                <span>Added 1 days ago</span>
                            </div>
                        </div>
                        <div style={{marginTop: '1rem', marginRight: '1rem'}}>
                            <i style={{color: '#240000'}} className="fas fa-chevron-right event"/>
                        </div>
                    </div>
                    <hr/>
                    <div className={styles.crypto} id={'eosBlock'} onClick={onClickExchangeEOSHandler} style={{cursor: 'pointer'}}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <img style={{width: '35px', height: '35px', marginTop: '.3rem'}} src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/EOS-icon.png" alt="cordano"/>
                            <div className={styles.blockCryptText} style={{marginLeft: '.5rem'}}>
                                <h6>EOS</h6>
                                <span>Added 2 days ago</span>
                            </div>
                        </div>
                        <div style={{marginTop: '1rem', marginRight: '1rem'}}>
                            <i style={{color: '#240000'}} className="fas fa-chevron-right event"/>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.intro}>
                <h5>Recent Transactions</h5>
                <hr/>
                <div className={styles.helpBlock}>
                    <span>You don't own any crypto. <br/> Ready to make a purchase?</span>
                </div>
            </div>
        </>
    )
}

export default RightSideHelpMenuSecondType;