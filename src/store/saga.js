import { all, fork } from 'redux-saga/effects';
import { waitForAccount } from './account/saga';
import { waitForMeta1 } from './meta1/saga';

export default function* rootSaga() {
    yield all([
        fork(waitForAccount),
        fork(waitForMeta1)
    ])
}
