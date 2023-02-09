import React, {useState} from "react";
import styles from './countryNumberStyles.module.scss';
import DropDownCountry, {CountryUS, isoToEmoji} from "./dropDownCountry";
import arrowDown from '../../../images/arrow-down-solid.svg';
import arrowUp from '../../../images/arrow-up-solid.svg';

const CountryNumber = () => {
    const [activeCountry, setActiveCountry] = useState(false);
    const defaultCountry = isoToEmoji(CountryUS.iso2);
    const [buttonValue, setButtonValue] = useState(`${defaultCountry}+${CountryUS.countryCode}`)
    return (
        <div className={styles.countryNumberContainer}>
            <div className={styles.countryNumberContainerForm}>
                <div className={styles.countryNumberPhone}>
                    <button
                        className={styles.countryNumberPhoneButton}
                        type={"button"}
                        onClick={() => setActiveCountry(!activeCountry)}
                    >
                        {buttonValue}
                        {activeCountry ?
                            <img src={arrowUp} width={15} height={15}/>
                            :
                            <img src={arrowDown} width={15} height={15}/>}
                    </button>
                    <input className={styles.countryNumberPhoneInput} type={"tel"} placeholder={'Eg: 9009009009'}/>
                </div>
                {activeCountry ? <DropDownCountry activeCountry={activeCountry} setActiveCountry={setActiveCountry} setButtonValue={setButtonValue}/> : ""}
            </div>
        </div>
    );
};

export default CountryNumber;
