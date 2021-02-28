import axios from 'axios';

const broadcasterId = 1337; // 1337 is the RPC id


/*
 * Load the programmes of the day from the Globo API
 *
 * Return the programmes of the day when available
 * Return empty programmes list when programmes of the day not available
 * Return error message when bad request
 */

const dailyProgrammesLoader = async (date, request) =>
{
    if(!request.session.buffer) {
        request.session.buffer = {};
    }

    let programmes = {
        programme: {
            entries: []
        }
    };

    let badRequest = false;
    let errorMessage = {};

    if(!request.session.buffer[date])
    {
        await axios
            .get(`https://epg-api.video.globo.com/programmes/${broadcasterId}?date=${date}`)
            .then(response => {
                programmes = response.data;
                request.session.buffer[date] = programmes;
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
        programmes = request.session.buffer[date];
    }

    if(!badRequest) {
        return programmes;
    }

    return errorMessage;
}

export default dailyProgrammesLoader;