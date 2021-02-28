import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';

import dailyProgrammesLoader from './services/loader.js'

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	secret: 'sTv6bMm0PhJUQgKioEk2fx18xZXOYISCeB1o8kLCjS6gpJGlyYCstXXd3DBw',
	resave: false,
	saveUninitialized: true
}));

/*
 * API calls
 */

// Get the full list of programs of the day filtering the relevant attributes
app.get('/api/programmes/:date', async (req, res) =>
{
	const data = await dailyProgrammesLoader(req);

	if(data.programme)
	{
		const list = data.programme.entries;

		const compactList = list.map((program) => {
			return {
				id: program.media_id,
				title: program.title,
				time: program.human_start_time,
				startTimestamp: program.start_time,
				endTimestamp: program.end_time,
				icon: program.custom_info.Graficos.LogoURL
			}
		});

		res.send(compactList);
	}
	else
	{
		res.status(data.status).send(data.error);
	}
});

// Get the relevant description of a program
app.get('/api/program/:date/:id', async (req, res) =>
{
	const data = await dailyProgrammesLoader(req);

	if(data.programme)
	{
		const mediaId = parseInt(req.params.id);
		const programmes = data.programme.entries;
		const programData = programmes.find(program => program.media_id === mediaId);

		res.send(programData);
	}
	else
	{
		res.status(data.status).send(data.error);
	}
});


/*
 * Client configuration for the Heroku environment
 */

if (process.env.NODE_ENV === 'production')
{
	// Serve any static files
	app.use(express.static(path.join(__dirname, 'client/build')));

	// Handle React routing, return all requests to React app
	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
	});
}


/*
 * Server config
 */

app.listen(port, () => console.log(`Listening on port ${port}`));