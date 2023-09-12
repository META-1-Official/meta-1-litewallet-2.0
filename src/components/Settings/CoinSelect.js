import React from "react";
import Select from "react-select";
import "../ExchangeForm/ExchangeForm.css";
import { getImage } from "../../lib/images";

export default function CoinSelect(props) {
  const { selectedValue, options } = props;

  const Option = (props) => {
    const { innerProps, innerRef } = props;

    return (
      <div ref={innerRef} {...innerProps} className="wallet-option">
        <div className="wallet-option-picture">
          <img alt="eth" src={getImage(props.data)} />
        </div>
        <div className="wallet-option-content">
          <div className="wallet-option-content__currency">
            <span className="wallet-option-content__name">
              {props.data}{" "}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const SingleValue = (props) => {
    const { innerProps, innerRef } = props;

    return (
      <div ref={innerRef} {...innerProps} className="wallet-option">
        <div className="wallet-option-picture">
          <img alt="eth" src={getImage(props.data)} />
        </div>
        <div className="wallet-option-content --padding0">
          <div className="wallet-option-content__currency">
            <span className="wallet-option-content__name">
              {props.data}{" "}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const customStyles = {
    control: (styles, {isDisabled}) => {
      return {
        ...styles,
        cursor: isDisabled ? 'not-allowed' : 'default',
        backgroundColor: 'var(--blockBgColor)',
        borderRadius: 10,
        borderColor: 'var(--inputBorderColor)',
      }
    },
    option: (styles, {isDisabled}) => {
      return {
        ...styles,
        backgroundColor: 'transparent',
        cursor: isDisabled ? 'not-allowed' : 'default',
        borderRadius: 10,
        boxShadow: 'var(--boxShadowIndex)',
        maxHeight: 100
      };
    },
  };

  return (
    <Select
      onChange={(newVal) => props.onChange(newVal)}
      components={{ SingleValue, Option }}
      options={options}
      value={selectedValue}
      isSearchable={false}
      styles={customStyles}
    />
  );
}
