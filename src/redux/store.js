import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import firebase, { storage } from 'firebase';

import { getFirebase } from 'react-redux-firebase';
import { reduxFirestore, getFirestore, createFirestoreInstance } from 'redux-firestore';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './rootReducers';
import fbConfig from '../config/database/firebase';

const reduxDevTool =
  process.env.NODE_ENV === 'development'
    ? composeWithDevTools(
        applyMiddleware(thunk.withExtraArgument({ getFirebase, getFirestore, storage })),
        reduxFirestore(fbConfig),
      )
    : compose(
        applyMiddleware(thunk.withExtraArgument({ getFirebase, getFirestore, storage })),
        reduxFirestore(fbConfig),
      );
const store = createStore(rootReducer, reduxDevTool);

export const rrfProps = {
  firebase,
  config: (fbConfig, { useFirestoreForProfile: true, userProfile: 'users', attachAuthIsReady: true }),
  dispatch: store.dispatch,
  createFirestoreInstance,
};

// (process.env.NODE_ENV === "development" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

export default store;
