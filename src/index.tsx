import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App, startMiddleware } from './App';
import './index.css';
/* tslint:disable:ordered-imports */
import registerServiceWorker from './registerServiceWorker';
ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
startMiddleware()
registerServiceWorker();
