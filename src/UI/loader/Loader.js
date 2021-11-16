import React from "react";
import loader from '../../images/loaders/Meta1Loader.gif'

const MetaLoader = (props) => {

    const {size} = props

    const sizes = {
        large: {
            width: '350px',
            height: 'auto',
            margin: '3rem auto',
            display: 'block'
        },
        small: {
            width: '100px',
            height: 'auto',
            margin: '3rem auto',
            display: 'block'
        }
    }

    return(
        <div style={{width: '100%', height: '100%'}}>
            <img style={sizes[size]} src={loader} alt="Meta1 Loader"/>
        </div>
    )
}

export default MetaLoader;