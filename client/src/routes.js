import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Landing from './pages/Landing/index';

function Routes() {

	return (
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={Landing} />
				<Route path="*" component={() => <h1>Page not found</h1>} />
			</Switch>
		</BrowserRouter>
	)
}

export default Routes;