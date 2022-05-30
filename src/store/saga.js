import { all, fork } from 'redux-saga/effects';
import { waitForAccount } from './account/saga';

export default function* rootSaga() {
    yield all([
        fork(waitForAccount)
    ])
}