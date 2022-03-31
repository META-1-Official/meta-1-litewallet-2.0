import React from "react";
import OnramperWidget from "@onramper/widget";

const WidgetOnRamper = () => {
  return (
    <div
      style={{
        width: "90%",
        height: "595px",
        borderRadius: "10px",
        margin: "auto",
      }}
    >
      <OnramperWidget
        defaultAmount={1000}
        API_KEY="pk_prod_k6LKERIMdGDE8geCxOApKSCy6mnfF5CuhI4TLZj55Wc0"
        defaultFiat={"USD"}
        defaultCrypto={"BTC"}
        color={"#fdc000"}
        country={"es"}
      />
    </div>
  );
};

export default WidgetOnRamper;
