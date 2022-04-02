import { CopyToClipboard } from "react-copy-to-clipboard";
import React, { useState, useEffect } from "react";
import {
  Message, Input,
} from "semantic-ui-react";
import QRCode from "react-qr-code";

import "./style.css";

const WithdrawForm = (props) => {
  const { fetcher, account, onBackClick, asset } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(props.address);
  const canDeposit = address.length > 0;
  useEffect(() => {
    async function fetchAddress(asset) {
      try {
        setIsLoading(true);
        const fetchedAsset = asset === "USDT" ? "eth" : asset;
        const resp = await fetcher(fetchedAsset);
        const body = await resp.body.getReader().read();
        if (resp.status === 200) {
          const addr = JSON.parse(
            new TextDecoder("utf-8").decode(body.value)
          ).address;
          setAddress(addr);
        }
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
      }
    }

    if (asset !== undefined) fetchAddress(asset);
  }, [asset]);

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
          <h2 className="headTl">Deposit</h2>
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

        <div>
          {/* TODO */}
        </div>
      </div>
    </>
  );
}

export default WithdrawForm
