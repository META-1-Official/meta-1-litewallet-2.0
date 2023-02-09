import React, {useState} from 'react';
import styles from './loginProviders.module.scss';
import arrowDown from '../../images/arrow-down-solid.svg';
import arrowUp from '../../images/arrow-up-solid.svg'
import {providers} from "./providers";
import CountryNumber from "./GetCountry/countryNumber";



const ProvidersBlock = ({ item, moreProviders }) => {
    return (
        <div style={{ padding: 5 }}>
            <div className={moreProviders ? styles.providersBlockBrandMP : styles.providersBlockBrand}>
                <img
                    height={moreProviders? '60%' : '80%'}
                    width={moreProviders? '60%' : '80%'}
                    alt={item.name}
                    src={item.image}/>
            </div>
        </div>
    );
};

const ProvidersCount = ({moreProviders, setMoreProviders}) => {
    const changeProvidersCount = () => {
        setMoreProviders(!moreProviders);
    };
    return (
        <div className={styles.providersCount}>
            <div onClick={changeProvidersCount}>
                <p>{`View more options`} {moreProviders ?
                    <img src={arrowUp} width={15} height={15}/>
                    :
                    <img src={arrowDown} width={15} height={15}/>}</p>
            </div>
        </div>
    );
};
const LoginProvidersScreen = () => {
    const [moreProviders, setMoreProviders] = useState(false);

    return (
        <div
            style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div className={styles.containerProvider}>
                <div className={styles.providerHeader}>
                    <p style={{ fontSize: 25, fontWeight: 'bold' }}>Welcome onboard</p>
                    <p>Select how you would like to continue</p>
                </div>
                <div className={moreProviders? styles.providersBlockMP : styles.providersBlock}>
                    {moreProviders ? providers.map(item => (
                        <ProvidersBlock item={item} moreProviders={moreProviders} key={item.id} />
                    )) : providers.map((item, index) => {
                        if (index < 6) {
                            return (
                                <ProvidersBlock item={item} key={item.id} />
                            );
                        };
                    })}
                </div>
                <p style={{margin: "auto"}}>or</p>
                <div className={styles.formContainer}>
                    <div className={styles.mobileProvider}>
                        <input className={styles.providersInput} placeholder={"Email"} />
                        <button className={styles.providersButton} type={"submit"}>Continue with email</button>
                    </div>
                    <div className={styles.mobileProvider}>
                        <CountryNumber />
                        <button className={styles.providersButton} type={"submit"}>Continue with mobile</button>
                    </div>
                </div>
                <ProvidersCount moreProviders={moreProviders} setMoreProviders={setMoreProviders}/>
            </div>
        </div>
    );
};

export default LoginProvidersScreen;
