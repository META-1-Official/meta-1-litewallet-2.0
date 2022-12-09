import React from 'react';
import axios from 'axios';
import store from '../store';

const UseAsset = async (assetId) => {
  const EXPLORER_URL = `${process.env.REACT_APP_EXPLORER_META1_URL}/api/v1/explorer`;
  const state = store.getState();
  const activeAssets = state.explorer?.assets?.active_assets;
  if (activeAssets) {
    const assets = activeAssets.map((item) => {
      const { asset } = item;
      return {
        data: asset,
      };
    });
    const filteredAssets = assets.filter(
      (asset) => asset.data.id === assetId || asset.data.symbol === assetId,
    );
    if (filteredAssets.length) {
      return Promise.resolve(filteredAssets[0]);
    } else {
      try {
        return await axios.get(EXPLORER_URL + '/asset?asset_id=' + assetId);
      } catch (err) {
        return null;
      }
    }
  } else {
    try {
      return await axios.get(EXPLORER_URL + '/asset?asset_id=' + assetId);
    } catch (err) {
      return null;
    }
  }
};

export default UseAsset;
