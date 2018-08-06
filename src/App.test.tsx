import { mount } from 'enzyme'
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { expectSaga } from 'redux-saga-test-plan'

import App from './App';
import { makeDeposit } from '../sagas'

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
});

function* testSaga() {
