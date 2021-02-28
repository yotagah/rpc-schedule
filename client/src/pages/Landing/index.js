import React, { useState, useEffect } from 'react';

import PageHeader from '../../components/PageHeader';

import api from '../../services/api';

import './styles.css'

function Landing()
{
	const nowDate = new Date();
	const todayURL =
		nowDate.getFullYear() + '-' +
		(nowDate.getMonth()+1).toString().padStart(2,'0') + '-' +
		nowDate.getDate().toString().padStart(2,'0');

	const [dateURL, setDateURL] = useState(todayURL);
	const [loadingList, setLoadingList] = useState(true);
	const [list, setList] = useState(Array(0));
	const [loadingDescription, setLoadingDescription] = useState(true);
	const [description, setDescription] = useState({});
	const [loadingPage, setLoadingPage] = useState(true);

	useEffect(() => {
        api.get('programmes/'+dateURL)
			.then((response) => {
				const list = response.data;

				const timezoneOffset = (new Date()).getTimezoneOffset() * 60;

				const todayDate = new Date(dateURL);

				const tomorrowDate = new Date(dateURL);
				tomorrowDate.setDate(tomorrowDate.getDate()+1);

				// Filter the list to the day time (00:00 - 23:59), it's done here (and not in API) to use client timezone
				const filteredList = list.filter((program) => {
					return program.startTimestamp < (tomorrowDate.getTime()/1000 + timezoneOffset) && program.endTimestamp > (todayDate.getTime()/1000 + timezoneOffset);
				});

				filteredList.map((program) => {
					const nowUTCTimestamp = Math.floor(Date.now()/1000);
					program.onAir = nowUTCTimestamp >= program.startTimestamp && nowUTCTimestamp < program.endTimestamp;

					if(program.onAir) {
						api.get('program/'+dateURL+'/'+program.id)
							.then((response) => {
								setLoadingDescription(false);
								setDescription(response.data);
							});
					}

					program.active = program.onAir;
					return program;
				});

				setList(filteredList);
				setLoadingList(false);
        	});
    }, [dateURL]);

	const scrollTo = (id) => {
		const element = document.getElementById(id);
		window.scrollTo(0, element.offsetTop - 60);
	};

	useEffect(() => {
		if(!loadingDescription) {
			const activeProgram = list.find(program => program.active);
			setTimeout(() => scrollTo('program_'+activeProgram.startTimestamp), 250);
		}
	}, [loadingDescription, list]);

	useEffect(() => {
		if(!loadingDescription && !loadingList) {
			setLoadingPage(false);
		}
	}, [loadingDescription, loadingDescription]);

	const handleActiveProgramChange = (id, startTimestamp) => {
		let change = false;

		const newList = list.map((program) => {
			const active = program.id === id && program.startTimestamp === startTimestamp;

			if(active && !program.active) {
				change = true;
				setTimeout(() => scrollTo('program_'+program.startTimestamp), 100);
				setLoadingDescription(true);
				api.get('program/'+dateURL+'/'+program.id)
					.then((response) => {
						setLoadingDescription(false);
						setDescription(response.data);
					});
			}

			program.active = active;

			return program;
		});

		if(change) {
			setList(newList);
		}
	}

	return (
		<div className="container" id="programList">
			<PageHeader />
			{ list.map((program, index) => {

				let programDate = new Date(program.startTimestamp * 1000);
				programDate = programDate.getHours().toString().padStart(2,'0') + ':' + programDate.getMinutes().toString().padStart(2,'0');

				return (
					<div key={index} className={`program-container ${program.active ? 'active' : ''}`} id={`program_${program.startTimestamp}`} onClick={() => handleActiveProgramChange(program.id, program.startTimestamp)}>
						<div className="program">
							<img src={program.icon} alt={program.title} />
							<div className="time">{ program.onAir ? <div className="on-air">NO AR</div> : programDate }</div>
							<div className="title">{program.title}</div>
							{ program.active && <div className="arrow"></div> }
						</div>
						{ program.active &&
							<div className="description-container">
								<div className="description" style={loadingDescription ? {maxHeight: 58} : {maxHeight: 1000}}>
									{ loadingDescription ? 
										<div className="loading">Carregando...</div>
										:
										<div>
											<p>{description.custom_info && description.custom_info.Resumos.ResumoImprensa ? description.custom_info.Resumos.ResumoImprensa : description.description}</p>
											{description.custom_info && <span className="tags">{description.custom_info.Video}</span>}
											{description.custom_info && description.custom_info.ClosedCaption && <span className="tags">CC</span>}
											{description.custom_info && description.custom_info.Tipo === "Filme" &&
												<div className="more">
													<strong>MAIS INFORMAÇÕES</strong><br/><br/>
													<strong>Título Original:</strong> {description.custom_info.TituloOriginal}<br/><br/>
													<strong>Elenco:</strong> {description.custom_info.Elenco}<br/><br/>
													<strong>Dubladores:</strong> {description.custom_info.Dubladores}<br/><br/>
													<strong>Direção:</strong> {description.custom_info.Diretor}<br/><br/>
													<strong>Nacionalidade:</strong> {description.custom_info.Pais}<br/><br/>
													<strong>Gênero:</strong> {description.custom_info.Classe}
												</div>
											}
											{description.custom_info && description.custom_info.Graficos.ImagemURL && <div className="image" style={{backgroundImage: `url('${description.custom_info.Graficos.ImagemURL}')`}}></div>}
										</div>
									}
								</div>
							</div>
						}
					</div>
				);
			}) }
			{ loadingPage && <div className="page-loader"><img src="loader.gif" alt="Carregando..." /></div> }
		</div>
	)
}

export default Landing;