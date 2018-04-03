import React from 'react';
import axios from 'axios';

import constants from './constants';
import './App.css';

class App extends React.Component {
	state = {
		input: '',
		parsedJSON: [],
		error: false
	}

	getCustomersFromFile() {
		axios.get('./customers.txt').then(result => {
			this.parseInput(result.data);
		}).catch(error => {
			console.error(error);
			this.setState({ output: 'error' });
		});
	}
	parseInput = (value) => {
		let s = {input: value};
		try {
			s.parsedJSON = JSON.parse('[' + value.split('\n').join(',') + ']');
			s.error = false;
		} catch(e) {
			s.error = 'An error occurred while trying to parse the input';
		}
		this.setState(s);
	}
	degreesToRadians = (degrees) => degrees * (Math.PI/180)
	isCustomerCloseEnough = (customer) => {
		// https://en.wikipedia.org/wiki/Great-circle_distance
		// φ = latitude in radians, λ = longitude in radians
		const φ1 = this.degreesToRadians(parseFloat(customer.latitude)),
			φ2 = this.degreesToRadians(constants.dublinOffice.latitude),
			Δλ = this.degreesToRadians(constants.dublinOffice.longitude - parseFloat(customer.longitude));

		const centralAngle = Math.acos(
			Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)
		);
		const distance = constants.radiusOfEarth * centralAngle;
		return distance <= 100;
	}

	handleInputChange = (e) => { this.parseInput(e.target.value ); }
	
	componentWillMount() { this.getCustomersFromFile(); }
	render() {
		const output = this.state.parsedJSON
			.filter(this.isCustomerCloseEnough)
			.sort((a,b) => a.user_id - b.user_id)
			.map(customer => customer.user_id + ' ' + customer.name)
			.join('\n');
		
		return (
			<div className="App">
				<div className="container">
					<div className="row">
						<div className="column">
							<legend><span className="title">Input</span></legend>
							<textarea value={this.state.input} onChange={this.handleInputChange}/>
						</div>
						<div className="column">
							<legend><span className="title">Output</span></legend>
							<textarea disabled readOnly value={this.state.error || output} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
