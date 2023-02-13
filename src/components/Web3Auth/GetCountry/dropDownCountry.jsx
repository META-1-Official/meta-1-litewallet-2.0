import Data from "./list.json";
import React, {useEffect, useState} from "react";
import styles from './dropDownCountry.module.scss';

export const CountryUS = Data[226];
export const CountryData = Data;
export function isoToEmoji(str) {
    const code = str
        .toUpperCase()
        .split('')
        .map(e => 127397 + e.charCodeAt(0));

    return String.fromCodePoint(...code);
}

const DropDownCountry = ({activeCountry, setActiveCountry, setButtonValue}) => {
    const [initialState, setInitialState] = useState([]);
    const [inputValue, setInputValue] = useState('');
    useEffect(() => {
        const filtered = CountryData.filter(
            e =>
                e.defaultName.toUpperCase().includes(inputValue.toUpperCase()) ||
                e.iso2.includes(inputValue.toUpperCase()) ||
                e.countryCode === inputValue.replace('+', ''),
        );
        setInitialState(filtered);
    }, [inputValue]);
    return (
        <div className={styles.dropDownContainer}>
            <div className={styles.dropDownDivInput}>
                <input onChange={(t) => setInputValue(t.target.value)}
                       style={{width: '100%'}}
                       value={inputValue}
                       type={'text'}
                       placeholder={'Search'}/>
            </div>
            <div className={styles.dropDownCountryList}>
                {initialState.map((item, index) => {
                    const emoji = isoToEmoji(item.iso2);
                    return (
                        <button onClick={() => {
                            setButtonValue(`${emoji}+${item.countryCode}`);
                            setActiveCountry(!activeCountry);
                        }} key={index}>{emoji}{`+${item.countryCode} ${item.defaultName}`}</button>
                    );
                })}
            </div>
        </div>
    );
};

export default DropDownCountry;
