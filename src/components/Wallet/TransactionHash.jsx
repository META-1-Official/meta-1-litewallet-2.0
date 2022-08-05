import React, { useEffect, useState } from 'react';
import {Apis} from 'meta1-vision-ws';

const TrxHash = ({trx}) => {
    const [data, setData] = useState('');
    const getBlock = async (height) => {
        Apis.instance()
            .db_api()
            .exec('get_block', [height])
            .then((result) => {
                if (!result) {
                    return false;
                }
                result.id = height; // The returned object for some reason does not include the block height..
                setData(result.transaction_merkle_root);
            })
            .catch((error) => {
                console.log('Error in BlockchainActions.getBlock: ', error);
            });
    }

    useEffect(()=>{
        getBlock(trx);
    },[]);
	return <div>{data}</div>;
};

export default TrxHash;