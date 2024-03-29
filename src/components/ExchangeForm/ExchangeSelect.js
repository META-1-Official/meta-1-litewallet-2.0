import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./ExchangeForm.css";

export default function ExchangeSelect(props) {
  const { selectedValue, options } = props;

  const MyOption = (props) => {
    const { innerProps, innerRef } = props;
    return (
      <div ref={innerRef} {...innerProps} className="wallet-option">
        <div className="wallet-option-picture">
          <img alt="eth" src={props.data.image} />
        </div>
        <div className="wallet-option-content">
          <div className="wallet-option-content__currency">
            <span className="wallet-option-content__name">
              {props.data.label}{" "}
            </span>
            <span className="wallet-option-content__subName">
              {props.data.subLabel}{" "}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const MySingleValue = (props) => {
    const { innerProps, innerRef } = props;
    const [balance, setBalance] = useState(props.data.balance);
    useEffect(() => {
      setBalance(props.data.balance);
    }, [props.data.balance]);

    return (
      <div ref={innerRef} {...innerProps} className="wallet-option">
        <div className="wallet-option-picture">
          <img alt="eth" src={props.data.image} />
        </div>
        <div className="wallet-option-content --padding0">
          <div className="wallet-option-content__currency">
            <span className="wallet-option-content__name">
              {props.data.label}{" "}
            </span>
            <span className="wallet-option-content__subName">
              {props.data.subLabel}{" "}
            </span>
          </div>
          <div className="wallet-option-content__balance">
            Balance: {balance} {props.data.label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Select
      onChange={(newVal, actionMeta) => props.onChange(newVal)}
      components={{ SingleValue: MySingleValue, Option: MyOption }}
      options={options}
      value={selectedValue}
      isSearchable={false}
      className={`${props.from === 'withdrawal'? 'select-withdrawal' : ''}`}
    />
  );
}
