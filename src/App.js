import React from 'react';
import axios from 'axios';
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

	handleInputChange = (e) => { this.parseInput(e.target.value ); }
	
	componentWillMount() { this.getCustomersFromFile(); }
	render() {
		const output = this.state.parsedJSON
			.filter(customer => customer.name.indexOf('Cahill') !== -1)
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
