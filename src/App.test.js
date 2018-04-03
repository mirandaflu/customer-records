import React from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import customers from './customers-mock';
import coordinates from './coordinates';
const mock = new MockAdapter(axios);

import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
enzyme.configure({ adapter: new Adapter() });

import App from './App';

mock.onGet('./customers.txt').reply(200, customers);

describe('<App />', () => {
	const component = enzyme.mount(<App />);

	it('renders without crashing', () => {
		const div = document.createElement('div');
		ReactDOM.render(<App />, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	it('reads data from a text file', () => {
		component.instance().getCustomersFromFile();
		expect(component.state('input')).toEqual(customers);
	});
		
	it('shows an error when it cannot parse the input', () => {
		component.instance().parseInput('{{{THIS IS NOT JSON');
		expect(component.state('error')).toEqual('An error occurred while trying to parse the input');
	});
		
	it('converts degrees to radians', () => {
		expect(component.instance().degreesToRadians(180)).toEqual(Math.PI);
	});
	
	it('compares locations to the dublin office', () => {
		// set threshold to 100km
		component.instance().handleThresholdChange({target:{value:100}});
		
		expect(component.instance().isCustomerCloseEnough(coordinates.dublinOffice)).toEqual(true);
		expect(component.instance().isCustomerCloseEnough(coordinates.glendalough)).toEqual(true);
		expect(component.instance().isCustomerCloseEnough(coordinates.wexford)).toEqual(false);
		expect(component.instance().isCustomerCloseEnough(coordinates.inverted)).toEqual(false);
	});

	it('has an adjustable distance threshold', () => {
		expect(component.instance().isCustomerCloseEnough(coordinates.glendalough)).toEqual(true);
		component.instance().handleThresholdChange({target:{value:30}});
		expect(component.instance().isCustomerCloseEnough(coordinates.glendalough)).toEqual(false);
	});

});
