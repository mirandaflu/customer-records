import React from 'react';
import GoogleMapReact from 'google-map-react';
import axios from 'axios';

import constants from './constants';
import './App.css';

const MapMarker = ({name, close}) => {
	let className = 'mapmarker customer';
	if (close) className += ' close';
	return <div className={className}>{name}</div>;
}
const OfficeMarker = () => <div className="mapmarker office">Dublin Office</div>;

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
				<div className="map-container">
					<GoogleMapReact
						center={{lat: constants.dublinOffice.latitude, lng: constants.dublinOffice.longitude}}
						zoom={7}>
						{this.state.parsedJSON.map(customer => 
							<MapMarker
								key={customer.id}
								lat={customer.latitude}
								lng={customer.longitude}
								close={this.isCustomerCloseEnough(customer)}
								name={customer.name} />
						)}
						<OfficeMarker lat={constants.dublinOffice.latitude} lng={constants.dublinOffice.longitude} />
					</GoogleMapReact>
				</div>
				<div className="container">
					<div className="row">
						<div className="column" style={{width: '70%'}}>
							<legend><span className="title">Input</span></legend>
							<textarea value={this.state.input} onChange={this.handleInputChange}/>
						</div>
						<div className="column" style={{width: '30%'}}>
							<legend><span className="title">Output</span></legend>
							<textarea disabled readOnly
								className={(this.state.error === false)? '': 'error'}
								value={this.state.error || output} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
