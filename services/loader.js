import axios from 'axios';

const broadcasterId = 1337; // 1337 is the RPC id


/*
 * Load the programmes of the day from the Globo API
 *
 * Return the programmes of the day when available
 * Return empty programmes list when programmes of the day not available
 * Return error message when bad request
 */

const dailyProgrammesLoader = async (req) =>
{
    const date = req.params.date;

    if(!req.session.buffer) {
        req.session.buffer = {};
    }

    let programmes = {
        programme: {
            entries: []
        }
    };

    let badRequest = false;
    let errorMessage = {};

    if(!req.session.buffer[date])
    {
        await axios
            .get(`https://epg-api.video.globo.com/programmes/${broadcasterId}?date=${req.params.date}`)
            .then(response => {
                programmes = response.data;
                req.session.buffer[date] = programmes;
                console.log('-- Data loaded from Globo API');
            })
            .catch(error => {
                if(error.response.status !== 404) {
                    badRequest = true;
                    errorMessage = {
                        error,
                        status: error.response.status
                    }
                }
            });
    }
    else
    {
        programmes = req.session.buffer[date];
    }

    if(!badRequest) {
        return programmes;
    }

    return errorMessage;
}

export default dailyProgrammesLoader;