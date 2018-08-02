import * as React from 'react';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { AddAccount } from './components/add_account'
import { WalletList } from './components/wallet_list'
import { rootReducer } from './reducers'
import { UIState } from './types/state'

const initialState = new UIState({})
export const store = createStore(rootReducer, initialState)

class App extends React.Component {
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
