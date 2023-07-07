import React, { useState, useRef, useEffect } from "react";
import './disconnectedinternet.css';

import AppStore from "../../images/app-store.png";
import GooglePlay from "../../images/google-play.png";
import OfflieIcon from "../../images/offline.png";

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
                    <QRCodeScanCard code={AppStore} text="App Store" />
                    <QRCodeScanCard code={GooglePlay} text="Google Play" />
                </div>
            </div>
            <div className="right-side">
                <img src={OfflieIcon}></img>
            </div>
        </div>
    )
}

export default DisconnectedInternet;
