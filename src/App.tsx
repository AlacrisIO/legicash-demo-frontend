import * as React from 'react';
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'  // Does not work with braces!!
import { AddAccount } from './components/add_account'
import { WalletList } from './components/wallet_list'
import { rootReducer } from './reducers'
import { depositListener } from './sagas'
import { UIState } from './types/state'

const sagaMiddleware = createSagaMiddleware()

const initialState = new UIState({})
export const store = createStore(rootReducer, initialState,
    applyMiddleware(sagaMiddleware))

/* This MUST be run after the app has been rendered. Hence the thunk */
export const startMiddleware = () => {
    sagaMiddleware.run(depositListener)
}

export class App extends React.Component {
    public render() {
        return (
            <Provider store={store}>
                <div className="App">
                    <AddAccount />
                    <WalletList />
                </div>
            </Provider>
        );
    }
}

export default App;
