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
	const today = req.params.date;
	const todayDate = new Date(today);

	const yesterdayDate = new Date(today);
	yesterdayDate.setDate(yesterdayDate.getDate()-1);
	const yesterday = yesterdayDate.toISOString().split('T')[0];

	const tomorrowDate = new Date(today);
	tomorrowDate.setDate(tomorrowDate.getDate()+1);

	const dataToday = await dailyProgrammesLoader(today, req);
	const dataYesterday = await dailyProgrammesLoader(yesterday, req);

	if(dataToday.programme && dataYesterday.programme)
	{
		const listToday = dataToday.programme.entries;
		const listYesterday = dataYesterday.programme.entries;

		const firstProgramToday = listToday[0];
		const lastProgramYesterday = listYesterday[listYesterday.length-1];

		if(firstProgramToday.media_id === lastProgramYesterday.media_id) {
			listYesterday.pop();
		}

		const list = [...listYesterday, ...listToday];

		const compactList = list.map((program) => {
			return {
				id: program.media_id,
				title: program.title,
				startTimestamp: program.start_time,
				endTimestamp: program.end_time,
				icon: program.custom_info.Graficos.LogoURL
			}
		});

		res.send(compactList);
	}
	else
	{
		if(dataToday.programme) {
			res.status(dataYesterday.status).send(dataYesterday.error);
		} else {
			res.status(dataToday.status).send(dataToday.error);
		}
	}
});

// Get the relevant description of a program
app.get('/api/program/:date/:id', async (req, res) =>
{
	const today = req.params.date;

	const yesterdayDate = new Date(today);
	yesterdayDate.setDate(yesterdayDate.getDate()-1);
	const yesterday = yesterdayDate.toISOString().split('T')[0];

	const dataToday = await dailyProgrammesLoader(today, req);
	const dataYesterday = await dailyProgrammesLoader(yesterday, req);

	if(dataToday.programme && dataYesterday.programme)
	{
		const mediaId = parseInt(req.params.id);
		const programmes = [...dataYesterday.programme.entries, ...dataToday.programme.entries];
		const programData = programmes.find(program => program.media_id === mediaId);

		res.send(programData);
	}
	else
	{
		if(dataToday.programme) {
			res.status(dataYesterday.status).send(dataYesterday.error);
		} else {
			res.status(dataToday.status).send(dataToday.error);
		}
	}
});


/*
 * Client configuration for the Heroku environment
 */

if (process.env.NODE_ENV === 'production')
{
	const __dirname = path.resolve(path.dirname(''));

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