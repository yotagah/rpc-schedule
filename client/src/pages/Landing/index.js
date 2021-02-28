import React, { useState, useEffect } from 'react';

import PageHeader from '../../components/PageHeader';

import api from '../../services/api';

import './styles.css'

function Landing()
{
	const timezoneOffset = (new Date()).getTimezoneOffset() * 60000;
	const nowUTCTimestamp = Date.now();
	const nowTimezoneDate = new Date(nowUTCTimestamp - timezoneOffset);

	const todayURL = '2021-02-27';//nowTimezoneDate.toISOString().split('T')[0];
	const nowTimestamp = Math.floor(nowTimezoneDate.getTime()/1000);

	const [list, setList] = useState(Array(0));

	useEffect(() => {
        api.get('programmes/'+todayURL)
			.then((response) => {
				const list = response.data;

				list.map((program) => {
					program.onAir = nowTimestamp >= program.startTimestamp && nowTimestamp < program.endTimestamp;
					program.active = program.onAir;
					return program;
				});

				setList(list);
        	});
    }, []);

	const scrollTo = (id) => {
		const element = document.getElementById(id);
		window.scrollTo(0, element.offsetTop - 60);
	};

	useEffect(() => {
		const activeProgram = list.find(program => program.active);
		if(activeProgram) {
			scrollTo('program_'+activeProgram.id);
		}
	}, [list])

	const handleActiveProgramChange = (id) => {
		const newList = list.map((program) => {
			program.active = program.id === id;
			return program;
		});

		setList(newList);
	}

	return (
		<div className="container" id="programList">
			<PageHeader />
			{ list.map((program) => {

				return (
					<div key={program.id} className={`program-container ${program.active ? 'active' : ''}`} id={`program_${program.id}`} onClick={() => handleActiveProgramChange(program.id)}>
						<div className="program">
							<img src={program.icon} alt={program.title} />
							<div className="time">{ program.onAir ? <div className="on-air">NO AR</div> : program.time.substring(0, 5) }</div>
							<div className="title">{program.title}</div>
							{ program.active && <div className="arrow"></div> }
						</div>
						{ program.active &&
							<div className="description-container">
								<div className="description">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sollicitudin lectus eget nulla pharetra, et laoreet magna sodales. Nullam at ante eu nisi eleifend condimentum. Aliquam ac scelerisque metus, a convallis erat. Vivamus egestas neque lacus, sit amet blandit est tincidunt eu. Phasellus nec lacus a dolor maximus elementum. Nullam lacus elit, ullamcorper id sapien dapibus, molestie tempus sem. Praesent bibendum finibus eros quis venenatis. Sed posuere accumsan urna, quis euismod risus dignissim et.
								</div>
							</div>
						}
					</div>
				);
			}) }
		</div>
	)
}

export default Landing;