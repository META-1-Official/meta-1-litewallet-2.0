import * as React from "react";
import styles from './Navbar.module.scss'
import './styles.css'
import logo from '../../images/Logo.png'
import user from '../../images/default-pic2.png'
import LeftPanelAdapt from "../LeftPanelAdapt/LeftPanelAdapt";

const Navbar = (props) => {

    const {
        onClickHomeHandler,
        onClickPortfolioHandler,
        onClickExchangeHandler,
        onClickPaperWalletHandler,
        onClickOrderTableHandler,
        onClickSettingsHandler,
        onClickHistoryHandler,
        portfolio,
        name
    } = props

    const { innerWidth: width } = window
    const isMobile = width <= 600

    return (
        <>
            <div className="modal fade" id="fund" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className={"modal-body onramper-wallet"}>
                            <button style={{margin: '0 0 0 97%'}} type="button" className="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close" />
                            <iframe
                                src="https://widget.onramper.com/?color=ffc000&amp;defaultAmount=1000&amp;defaultFiat=USD&amp;defaultCrypto=BTC&amp;apiKey=pk_prod_k6LKERIMdGDE8geCxOApKSCy6mnfF5CuhI4TLZj55Wc0"
                                title="myFrame" style={{border: '0'}} allowFullScreen="" aria-hidden="false" tabIndex="0" width="100%"
                                height="600" frameBorder="0" />
                        </div>
                    </div>
                </div>
            </div>
        <nav className={styles.navbar + " navbar navbar-expand-lg navbar-light bg-light"}>
    <div className="container-fluid">
        <img className={styles.img} onClick={() => {window.open('https://meta1.io')}} style={{cursor: 'pointer'}} src={logo} alt="logo"/>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"/>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <div className={'navbar-nav me-auto'}/>
            <div className="d-flex">
                <div style={{display: "flex", flexDirection: 'row'}}>
                    <div className={styles.blockhelp}>
                        <i className="far fa-question-circle" style={{marginRight: '.2rem'}}/>
                        <span onClick={() => {window.open('https://support.meta1.io')}}>Get help</span>
                    </div>
                    <button className={name ? styles.btn : styles.btnDisabled} disabled={!name} data-bs-toggle="modal" data-bs-target="#fund">Fund Account</button>
                    <div className={styles.line + styles.adaptNeed}/>
                    <div className={styles.adaptNeed} style={{marginRight: '1rem', display: 'flex', flexDirection: 'row', cursor: 'pointer'}}>
                        <div className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="navbarScrollingDropdown" role="button"
                               data-bs-toggle="dropdown" aria-expanded="false">
                                <div className={'imgUser'} style={{marginLeft: '.3rem'}}>
                                    <img className={styles.userImg} src={user } alt="user"/>
                                </div>
                            </a>
                            {
                                name ?
                                    <ul className="dropdown-menu" aria-labelledby="navbarScrollingDropdown">
                                        <li><a className="dropdown-item" onClick={() => {window.location.reload()}}>LogOut</a></li>
                                    </ul>
                                    :
                                    null
                            }
                        </div>
                    </div>
                </div>
            </div>
            {isMobile ?
                <LeftPanelAdapt
                    onClickHomeHandler = {onClickHomeHandler}
                    onClickPortfolioHandler = {onClickPortfolioHandler}
                    onClickExchangeHandler = {onClickExchangeHandler}
                    onClickPaperWalletHandler = {onClickPaperWalletHandler}
                    onClickOrderTableHandler = {onClickOrderTableHandler}
                    onClickSettingsHandler = {onClickSettingsHandler}
                    onClickHistoryHandler = {onClickHistoryHandler}
                    portfolio = {portfolio}
                    name = {name}
                />
                :
                null
            }
        </div>
    </div>
</nav>
        </>
    )
}

export default Navbar;

