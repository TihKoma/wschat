import { BaseThunkType, InferActionsTypes } from "./store";
import io from "socket.io-client";
import { deleteCookie, getCookie, setCookie } from "./cookie";
import consts from "./../constants";
// import { Socket } from "socket.io-client";
import dateFormat from "dateformat";

export type MessageType = {
	senderName: string,
	message: string,
	date: string,
	isCommand: boolean
};

export type SocketMessageType = {
	event: string,
	name: string,
	text: string,
	time: string,
	claimId?: string,
	nextCommands: string,
	isCommand: number
};

export type commandType = {
	commandId: number,
	text: string
};

//ответ от бэка
export type responseRecentMessageType = {
	ID: number,
	TASKID: number,
	CLAIMID: number,
	USERNAME: string,
	MESSAGE: string,
	SENDDATE: string
};

export type recentMessageType = {
	msgId: number,
	taskId: number,
	claimId: string,
	userName: string,
	message: string,
	sendDate: string
};

const initCommands = [
	{
		commandId: 1,
	},
	{
		commandId: 2,
	},
	{
		commandId: 3,
	},
	{
		commandId: 4,
	}
];

export type dbConfigType = {
	HOST: string,
	DB: string,
	USER: string,
	PORT: number,
	PIPE_HOST: string,
	PIPE_PORT: string
};

const initialState = {
	domen: "",
	stand: "",
	userName: "",
	claimId: "",
	messages: [] as MessageType[],
	msgCount: undefined as number | undefined,
	authToken: getCookie('.pipiline') || "",		// для валидации в pipeline
	jsonWebToken: getCookie('jsonWebToken') || "",	// для верификации запросов
	commands: initCommands as commandType[],
	isCommandsTextInit: false,

	login: "", // для стенда админа
	pwd: "",
	isAdminStand: false, // true - админка, false - чат (в пайпе)
	isAuthDataChanged: false,
	isLogonLoading: false,
	recentMessages: [] as recentMessageType[],
	isRecentMessagesInit: false,
	dbConfig: null as string | null,
	pipelineLink: ''
};

const chatReducer = (state = initialState, action: ActionsType): InitialStateType => {
	switch (action.type) {
		case 'APP/WSCHAT/ADD_NEW_MESSAGE':
			return {
				...state,
				messages: [...state.messages, action.message],
				msgCount: state.messages.length + 1
			};

		case 'APP/WSCHAT/CHANGE_CLAIM_ID':
			return {
				...state,
				claimId: action.claimId,
				messages: []
			};

		case 'APP/WSCHAT/CHANGE_AUTH_TOKEN':
			return {
				...state,
				authToken: action.authToken
			};

		case 'APP/WSCHAT/CHANGE_JSON_WEB_TOKEN':
			return {
				...state,
				jsonWebToken: action.jsonWebToken
			};

		case 'APP/WSCHAT/CHANGE_USER_NAME':
			return {
				...state,
				userName: action.userName,
				isAuthDataChanged: false,
				messages: []
			};

		case 'APP/WSCHAT/INIT_MSG_COUNT':
			return {
				...state,
				msgCount: 0
			};

		case 'APP/WSCHAT/CHANGE_AUTH_DATA':
			return {
				...state,
				login: action.login,
				pwd: action.pwd,
				isAuthDataChanged: true
			};

		case 'APP/WSCHAT/SET_COMMAND_TEXT':
			const masCommands = state.commands.map((item) => {
				if (item.commandId !== action.id)
					return item;

				return {
					commandId: item.commandId,
					text: action.text
				};
			});

			return {
				...state,
				commands: masCommands
			};

		case 'APP/WSCHAT/SET_IS_COMMANDS_TEXT_INIT':
			return {
				...state,
				isCommandsTextInit: action.value
			};

		case 'APP/WSCHAT/SET_COMMANDS':
			return {
				...state,
				commands: action.newCommandsId,
				isCommandsTextInit: false
			};

		case 'APP/WSCHAT/SET_RECENT_MESSAGES':
			// console.log(action.recentMessages);
			return {
				...state,
				recentMessages: action.recentMessages,
				isRecentMessagesInit: true
			};

		case 'APP/WSCHAT/SET_IS_LOGON_LOADING':
			return {
				...state,
				isLogonLoading: action.isLoading
			};

		case 'APP/WSCHAT/SET_IS_ADMIN_STAND':
			return {
				...state,
				isAdminStand: action.isAdminStand
			};

		case 'APP/WSCHAT/SET_DB_CONFIG':
			const config = JSON.stringify({
				HOST: action.HOST,
				DB: action.DB,
				USER: action.USER,
				PORT: action.PORT,
				PIPE_HOST: action.PIPE_HOST,
				PIPE_PORT: action.PIPE_PORT
			});
			// console.log([config].map(el => el));

			return {
				...state,
				dbConfig: config
			};

		case 'APP/WSCHAT/SET_DOMEN':
			return {
				...state,
				domen: action.domen
			};

		case 'APP/WSCHAT/SET_STAND':
			return {
				...state,
				stand: action.stand
			};

		case 'APP/WSCHAT/SET_PIPELINE_LINK':
			return {
				...state,
				pipelineLink: action.pipelineLink
			};

		case 'APP/WSCHAT/CLEAR_MESSAGES_LIST':
			return {
				...state,
				messages: [],
				msgCount: 0
			};

		default:
			return state;
	};
};

export const actions = {
	addNewMessage: (message: MessageType) => ({ type: 'APP/WSCHAT/ADD_NEW_MESSAGE', message } as const),
	changeClaimId: (claimId: string) => ({ type: 'APP/WSCHAT/CHANGE_CLAIM_ID', claimId } as const),
	changeAuthToken: (authToken: string) => ({ type: 'APP/WSCHAT/CHANGE_AUTH_TOKEN', authToken } as const),
	changeJsonWebToken: (jsonWebToken: string) => ({ type: 'APP/WSCHAT/CHANGE_JSON_WEB_TOKEN', jsonWebToken } as const),
	changeUserName: (userName: string) => ({ type: 'APP/WSCHAT/CHANGE_USER_NAME', userName } as const),
	initMsgCount: () => ({ type: 'APP/WSCHAT/INIT_MSG_COUNT' } as const),
	changeAuthData: (login: string, pwd: string) => ({ type: 'APP/WSCHAT/CHANGE_AUTH_DATA', login, pwd } as const),
	setCommandText: (id: number, text: string) => ({ type: 'APP/WSCHAT/SET_COMMAND_TEXT', id, text } as const),
	setIsCommandsTextInit: (value: boolean) => ({ type: 'APP/WSCHAT/SET_IS_COMMANDS_TEXT_INIT', value } as const),
	setCommands: (newCommandsId: commandType[]) => ({ type: 'APP/WSCHAT/SET_COMMANDS', newCommandsId } as const),
	setRecentMessages: (recentMessages: recentMessageType[]) => ({ type: 'APP/WSCHAT/SET_RECENT_MESSAGES', recentMessages } as const),
	setIsLogonLoading: (isLoading: boolean) => ({ type: 'APP/WSCHAT/SET_IS_LOGON_LOADING', isLoading } as const),
	setIsAdminStand: (isAdminStand: boolean) => ({ type: 'APP/WSCHAT/SET_IS_ADMIN_STAND', isAdminStand } as const),
	setDbConfig: (HOST: string, DB: string, USER: string, PORT: number, PIPE_HOST: string, PIPE_PORT: string) =>
		({ type: 'APP/WSCHAT/SET_DB_CONFIG', HOST, DB, USER, PORT, PIPE_HOST, PIPE_PORT } as const),
	changeDomen: (domen: string) => ({ type: 'APP/WSCHAT/SET_DOMEN', domen } as const),
	setStand: (stand: string) => ({ type: 'APP/WSCHAT/SET_STAND', stand } as const),
	setPipelineLink: (pipelineLink: string) => ({ type: 'APP/WSCHAT/SET_PIPELINE_LINK', pipelineLink } as const),
	clearMessagesList: () => ({ type: 'APP/WSCHAT/CLEAR_MESSAGES_LIST' } as const),
};


// Thunk Creator

export const logOn = (login: string, pwd: string): ThunkType => async (dispatch, getState) => {
	dispatch(actions.setIsLogonLoading(true));
	dispatch(actions.changeAuthData(login, pwd));
	dispatch(auth());
};

export const logOut = (): ThunkType => async (dispatch, getState) => {
	dispatch(actions.changeAuthData('', ''));
	dispatch(actions.changeAuthToken(''));
	dispatch(actions.changeUserName(''));
	deleteCookie('.pipiline');
	deleteCookie('jsonWebToken');
};

export const auth = (): ThunkType => async (dispatch, getState) => {
	var authToken = getState().wschat.authToken;
	let jsonWebToken = getState().wschat.jsonWebToken;
	let login = getState().wschat.login;
	let pwd = getState().wschat.pwd;
	let isAuthDataChanged = getState().wschat.isAuthDataChanged;

	if (authToken === '' && login === '' && pwd === '')
		return;

	if (authToken === '' || isAuthDataChanged) {
		try {
			let response = await fetch(`/Account/LogOn/?login=${login}&pwd=${pwd}`, {
				method: "GET",
				headers: {
					'Access-Control-Allow-Origin': "*",
					"Accept": "application/json",
					'Content-Type': 'text/plain'
				}
			}).then((data) => handleResponse(data));
			// authToken = response.headers['set-cookie'][1].split(';')[0].replace('.pipiline=', '');
			authToken = response.authToken;
			// jsonWebToken = response.jsonWebToken;
		} catch (err) {
			alert("Ошибка авторизации");
			console.log(err);
			dispatch(actions.setIsLogonLoading(false));
			return;
		};
	};
	// console.log('jsonWebToken: ' + jsonWebToken);


	const domen = getState().wschat.domen;
	let cookieValidate;
	try {
		cookieValidate = await fetch(`${domen}/Account/ExplainCookie/?cookie=${authToken}`, {
			method: "GET",
			headers: {
				'authorization': jsonWebToken,
				'Access-Control-Allow-Origin': "*",
				"Accept": "application/json",
				'Content-Type': 'text/plain'
			}
		}).then((data) => handleResponse(data));
		jsonWebToken = cookieValidate.jsonWebToken;
	} catch (err) {
		// alert("Ошибка при валидации authToken");
		console.error(err);
		dispatch(actions.setIsLogonLoading(false));
		dispatch(actions.changeAuthToken(""));
		dispatch(actions.changeUserName(""));
		return;
	};
	console.log(cookieValidate);


	// let cookieValidate = { Name: "test" };
	await dispatch(actions.changeJsonWebToken(jsonWebToken));
	dispatch(actions.changeAuthToken(authToken));
	dispatch(actions.changeUserName(cookieValidate.Name));
	setCookie('.pipiline', authToken);
	setCookie('jsonWebToken', jsonWebToken);
	dispatch(actions.setIsLogonLoading(false));
};



let socket: SocketIOClient.Socket | null = null;

export const startListeningMessages = (): ThunkType => async (dispatch, getState) => {
	// const domen = 'http://127.0.0.1:8080';
	// const domen = 'https://jmart.k8s.bankom.omsk.su';
	// const domen = 'https://jmart2.test.plus-bank.ru';
	const domen = getState().wschat.domen;

	const userName = getState().wschat.userName;
	if (userName === '') {
		dispatch(auth());
		return;
	};

	// console.log("startListeningMessages");
	socket?.disconnect();

	const claimId = getState().wschat.claimId;
	const jsonWebToken = getState().wschat.jsonWebToken;

	socket = io(`${domen}/wschat/socket.io?claimId=${claimId}&userName=${userName}&jwt=${jsonWebToken}`, {
		path: '/wschat/socket.io',
		transports: ['websocket', 'flashsocket', 'xhr-polling'],
	});

	socket.on('disconnect', () => {
		console.log('Соединение с сокетом разорвано');
		dispatch(actions.clearMessagesList());
		socket?.off('message');
	});


	socket.on('connect', function () {
		// console.log("conn");
		socket?.on('message', function (msg: SocketMessageType) {

			if (msg.event === 'connected')
				dispatch(actions.initMsgCount());

			if (!msg.text || msg.claimId !== claimId)
				return;

			if (msg.event === 'commandSent' && msg.name === 'commandResponse') {
				const newCommands = msg.nextCommands?.split(';').map((item) => {
					return {
						commandId: +item,
						text: ""
					};
				});

				dispatch(actions.setCommands(newCommands));
			};

			const message = { senderName: msg.name, message: msg.text, date: msg.time, isCommand: (+msg.isCommand !== 0) ? true : false };
			dispatch(actions.addNewMessage(message));
		});
	});
};

export const sendMessage = (message: string): ThunkType => async (dispatch) => {
	if (!message)
		return;
	// console.log(">>> sendMessage");
	const msg = {
		type: "message",
		text: message
	};
	socket?.send(msg);
};

export const sendCommand = (commandId: number): ThunkType => async (dispatch) => {
	if (!commandId)
		return;
	// console.log(">>> sendCommand");
	const msg = {
		type: "command",
		commandId
	};
	socket?.send(msg);
};

export const getCommandsText = (): ThunkType => async (dispatch, getState) => {
	const domen = getState().wschat.domen;
	const claimId = getState().wschat.claimId;
	// console.log('get command text');
	if (!claimId)
		return;

	let newCommands: commandType[];
	const commandsId = getState().wschat.commands?.map((item) => {
		return item.commandId;
	}).join(';');

	try {
		newCommands = await fetch(`${domen}/wschat/getCommandsText?claimId=${claimId}&commandsId=${commandsId}`, {
			method: "GET",
			headers: {
				'authorization': getState().wschat.jsonWebToken,
				'Access-Control-Allow-Origin': "*",
				"Accept": "application/json",
				'Content-Type': 'text/plain'
			}
		}).then((data) => handleResponse(data));
	} catch (err) {
		// alert("Ошибка при получении текста комманд");
		console.error(err);
		return;
	};

	dispatch(actions.setIsCommandsTextInit(true));

	newCommands.forEach((item) => {
		if (item)
			dispatch(actions.setCommandText(item.commandId, item.text))
	});
};


export const getRecentMessages = (): ThunkType => async (dispatch, getState) => {
	const domen = getState().wschat.domen;

	let recentMessages: recentMessageType[] = [];
	let result: responseRecentMessageType[] = [];

	try {
		result = await fetch(`${domen}/wschat/getRecentMessages`, {
			method: "GET",
			headers: {
				'authorization': getState().wschat.jsonWebToken,
				'Access-Control-Allow-Origin': "*",
				"Accept": "application/json",
				'Content-Type': 'text/plain'
			}
		}).then((data) => handleResponse(data));
	} catch (err) {
		// alert("Ошибка при получении последних сообщений");
		console.log(err);
		return;
	};

	result.forEach((item) => {
		recentMessages.push({
			msgId: item.ID,
			taskId: item.TASKID,
			claimId: String(item.CLAIMID),
			userName: item.USERNAME,
			message: item.MESSAGE,
			sendDate: dateFormat(new Date(item.SENDDATE.replace('T', ' ').replace('Z', '') + ' UTC'), "dd.mm.yyyy HH:MM:ss")
		});
	});
	// console.log(recentMessages);
	// console.log(result);

	dispatch(actions.setRecentMessages(recentMessages));
};




function handleResponse(response: Response) {
	return response.json().then((json) => {
		if (!response.ok) {
			const error = {
				data: json,
				status: response.status,
				statusText: response.statusText,
			};
			return Promise.reject(error);
		}
		return json;
	});
}


export default chatReducer;

export type InitialStateType = typeof initialState;
type ActionsType = InferActionsTypes<typeof actions>;
export type ThunkType = BaseThunkType<ActionsType>;