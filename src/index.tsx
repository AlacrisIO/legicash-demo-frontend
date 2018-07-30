import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './App';
import './index.css';
import { rootReducer } from './reducers'
import { UIState } from './types/state'

/* tslint:disable:ordered-imports */
import registerServiceWorker from './registerServiceWorker';

const initialState = new UIState({})
export const store = createStore(rootReducer, initialState)
ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.getElementById('root') as HTMLElement
);

registerServiceWorker();
