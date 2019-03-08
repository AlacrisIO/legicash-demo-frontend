import * as React from 'react';
import { Provider } from 'react-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import createSagaMiddleware from 'redux-saga'  // Does not work with braces!!
import 'semantic-ui-css/semantic.min.css'
import  './App.css'
import { AddAccount } from './components/add_account'
import {Notifications} from "./components/notifications";
import { WalletList } from './components/wallet_list'
import { rootReducer } from './reducers'
import { rootSaga } from './sagas'
import { UIState } from './types/state'


const sagaMiddleware = createSagaMiddleware()

const initialState = new UIState({});

const enchancers = (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? 
    compose( applyMiddleware(sagaMiddleware), (window as any).__REDUX_DEVTOOLS_EXTENSION__()) : 
    compose(applyMiddleware(sagaMiddleware));

export const store = createStore(rootReducer, initialState, enchancers);


/* This MUST be run after the app has been rendered. Hence the thunk */
export const startMiddleware = () => sagaMiddleware.run(rootSaga)

export class App extends React.Component {
    public render() {
        return (
            <Provider store={store}>
                <div className="App">
                    <AddAccount />
                    <WalletList />
                    <Notifications />
                </div>
            </Provider>
        );
    }
}

export default App;
