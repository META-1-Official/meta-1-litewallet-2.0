import React, { useState, useRef, useEffect } from "react";
import './disconnectedinternet.css';

const DisconnectedInternet = (props) => {
    const QRCodeScanCard = (props) =>
        <div className="qr-code-card">
            <img src={props.code}></img>
            <span className="qr-code-text">{props.text}</span>
        </div>

    return (
        <div className="di-wrapper">
            <div className="left-side">
                <div className="text1">Internet Connection</div>
                <div className="text2">Error</div>
                <div className="text3">Unable to connect to the internet</div>
                <div className="text4">Second option scan the QR code and download the app</div>
                <div className="qr-code-wrapper">
                    <QRCodeScanCard code={props.appStoreIcon} text="App Store" />
                    <QRCodeScanCard code={props.googlePlayIcon} text="Google Play" />
                </div>
            </div>
            <div className="right-side">
                <img src={props.offlineIcon}></img>
            </div>
        </div>
    )
}

export default DisconnectedInternet;
