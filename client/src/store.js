import { createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'
import {reducers} from './reducers/index';

const persistConfig = {
  key: 'root',
  storage, // localstorage is selected at this point
  whitelist: ['access_state', 'login_state'] // State only persistent whitelisted state
}

const persistedReducer = persistReducer(persistConfig, reducers)

const store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
)

export const persistor = persistStore(store)
export default store