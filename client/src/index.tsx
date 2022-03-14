import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import { Provider } from 'react-redux';
import store from './store/store';
import { actions } from './store/chat-reducer';
import AdminStand from './components/adminStand/adminStand';
import { getCookie } from './store/cookie';

let config;
try {
	config = require('./../db.config.js');
} catch (err) {
	config = null;
};

if (document.getElementById("wschat") != undefined) {
	const authToken: string = document.getElementById("wschat")?.getAttribute("authToken") || getCookie('.pipiline') || "";
	const claimId = (document.getElementById("ClaimId") as HTMLInputElement).value;
	const domen = (document.getElementById("wschatUrl") as HTMLInputElement).value;

	// console.log(store.getState().wschat.isAdminStand);

	// if (claimId || store.getState().wschat.isAdminStand) {
	store.dispatch(actions.changeAuthToken(authToken));
	store.dispatch(actions.changeClaimId(claimId));
	store.dispatch(actions.changeDomen(domen));

	ReactDOM.render(
		<App />,
		document.getElementById('wschat')
	);
	// };
};


if (document.getElementById("wschat-admin") != undefined) {
	store.dispatch(actions.setIsAdminStand(true));
	const stand = (document.getElementById("stand") as HTMLInputElement).value;
	const pipelineLink = (document.getElementById("wschat-admin") as HTMLInputElement).getAttribute('pipelineLink');
	// if (config)
	store.dispatch(actions.setStand(stand));
	store.dispatch(actions.setPipelineLink(pipelineLink || ''));
				// config = {
				// 	HOST: "string",
				// 	DB: "string",
				// 	USER: "string",
				// 	PORT: 1234,
				// 	PIPE_HOST: "string",
				// 	PIPE_PORT: "string"
				// }
	// [JSON.stringify({
	// HOST: "config.HOST",
	// DB: "config.DB",
	// USER: "config.USER",
	// PWD: "config.PWD",
	// PORT: 1234,
	// PIPE_HOST: "config.PIPE_HOST",
	// PIPE_PORT: "config.PIPE_PORT"
	// })]));
	// console.log(config.USER);

	ReactDOM.render(
		<Provider store={store}>
			<AdminStand />
		</Provider>,
		document.getElementById('wschat-admin')
	);
};