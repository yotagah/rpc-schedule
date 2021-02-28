import React from 'react';

import './styles.css';

const PageHeader = (props) =>
{
	console.log(props.currentDate);
	const months = [
		'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEAEMBRO'
	];

	const weekDays = [
		'DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'
	]

	return (
		<header>
			<div className="image"><img src="https://s2.glbimg.com/l8vDLy5dP-mMomtA827cWso0Kl0=/46x19/i.s3.glbimg.com/v1/AUTH_b58693ed41d04a39826739159bf600a0/internal_photos/bs/2018/d/n/qBrFd5S56b1GKqlAQ9vQ/rpc.png" alt="RPC" /></div>
			<div className="navigator"><i className="icon-arrow icon-arrow-left"></i>{ weekDays[props.currentDate.getDay()] }, { props.currentDate.getDate() } DE { months[props.currentDate.getMonth()] }<i className="icon-arrow icon-arrow-right"></i></div>
		</header>
	)
}

export default PageHeader;