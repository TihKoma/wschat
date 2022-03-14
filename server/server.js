const db_config = require('./db.config.js');
let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require("socket.io")(http, {
	// cors: {
	// origin: "null",
	// methods: ["GET", "POST"]
	// },
	path: '/wschat/socket.io'
});

const db = require('oracledb');
let dateFormat = require('dateformat');
const jwt = require('jsonwebtoken');
const { send } = require('process');
let jsonWebToken;
const jwtKey = 'FgDf34F-Lkmjg32i4RTi-clF0gm1V'
// const { config } = require('process');
// const { read } = require('fs/promises');
// const { send } = require('process');
db.outFormat = db.OUT_FORMAT_OBJECT;
db.autoCommit = true;

var conn;
try {
	conn = db.getConnection({
		user: db_config.USER,
		password: db_config.PWD,
		connectString: `(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = ${db_config.HOST})(PORT = ${db_config.PORT}))(CONNECT_DATA = (SID = ${db_config.DB})))`
	});
} catch (err) {
	console.error(err);
};

// async function testSelect() {
// 	var connection = await conn;
// 	const result = await connection.execute(
// 		`BEGIN
// 		PIPELINE.PK_WSCHAT.GetRecentMessages(:cursor);
// 		END;`,
// 		{
// 			cursor: { type: db.CURSOR, dir: db.BIND_OUT }
// 		});

// 	console.log("Cursor metadata:");
// 	console.log(result.outBinds.cursor.metaData);

// 	const resultSet = result.outBinds.cursor;
// 	const numRows = 10;  // number of rows to return from each call to getRows()
// 	let rows;

// 	// If getRows(numRows) returns:
// 	//   Zero rows               => there were no rows, or are no more rows to return
// 	//   Fewer than numRows rows => this was the last set of rows to get
// 	//   Exactly numRows rows    => there may be more rows to fetch

// 	do {
// 		rows = await resultSet.getRows(numRows); // get numRows rows at a time
// 		if (rows.length > 0) {
// 			console.log("getRows(): Got " + rows.length + " rows");
// 			console.log(rows);
// 		}
// 	} while (rows.length === numRows);

// 	// From node-oracledb 5.2, you can alternatively fetch all rows in one call.
// 	// This is useful when the ResultSet is known to contain a small number of
// 	// rows that will always fit in memory.
// 	//
// 	// rows = await resultSet.getRows();  // no parameter means get all rows
// 	// console.log(rows);

// 	// always close the ResultSet
// 	await resultSet.close();
// }



// Вызов любой хранимой процедуры на получение данных из БД
const dbGetData = async (storedProcedure, ...params) => {
	let paramsName = '', paramsValue = {};
	params.forEach((el, i) => {
		const name = `param${i}`;
		paramsName += `:${name},`;
		paramsValue[name] = el;
	});

	var connection = await conn;
	const result = await connection.execute(
		`BEGIN
		pipeline.pk_wschat.${storedProcedure}(${paramsName} :cursor);
		END;`, {
		...paramsValue,
		cursor: { type: db.CURSOR, dir: db.BIND_OUT }
	});

	const resultSet = result.outBinds.cursor;
	const numRows = 10;  // number of rows to return from each call to getRows()
	let res = [];

	do {
		rows = await resultSet.getRows(numRows); // get numRows rows at a time
		if (rows.length > 0)
			res.push(...rows);
			// res = rows;
	} while (rows.length === numRows);

	await resultSet.close();

	return res;
};
// dbGetData('GetListChatMessagesByClaim', 2565120);


const dbAddChatMessage = async (claimId, userName, msg, sendDate, isCommand, commandId) => {
	var connection = await conn;
	await connection.execute(
		`BEGIN
		pipeline.pk_wschat.AddChatMessage(:pClaimId, :pUserName, :pMessage, :pSendDate, :pIsCommand, :pCommandId);
		END;`, {
		pClaimId: claimId,
		pUserName: userName,
		pMessage: msg,
		pSendDate: sendDate,
		pIsCommand: isCommand,
		pCommandId: commandId
	});
};



app.use('/public', express.static('client'));
app.use('/wschat/public', express.static('dist'));

app.get('/wschat/client', (req, res) => {
	// console.log('request wschat client');
	try {
		res.sendFile(__dirname + '/dist/index.html')
	} catch (err) {
		console.log(err);
	};
	// res.send("Текущий стенд недоступен");
});

app.all('/*', function (req, res, next) {
	const origin = req.headers.origin;
	const allowList = db_config.ALLOW_LIST;
	// console.log(allowList);
	// console.log(origin);
	// console.log(allowList.indexOf(origin) != -1);

	if (allowList.indexOf(origin) != -1)
		res.header('Access-Control-Allow-Origin', origin);
	else
		res.header('Access-Control-Allow-Origin', 'null');

	res.header('Vary', 'Origin');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, authorization');
	debugger;
	// console.log(req.method);

	if (req.method === 'OPTIONS' || req.url.indexOf('/Account/LogOn/') !== -1 || req.url.indexOf('/Account/ExplainCookie') !== -1) {
		next();
		return;
	};

	if (!req.headers.authorization) {
		res.status(401).json({ error: 'Json web token was not received' });
		return;
	};

	try {
		jwt.verify(req.headers.authorization, jwtKey);
		// next();
	} catch (err) {
		res.status(401).json({ error: 'Json web token verification failed' });
		// next();
		console.error('Error. Json web token verification failed');
		return;
	};

	// res.status(401).json({error: 'Json web token was not received'});
	// console.log('stamp');
	next();
});


app.get("/Account/LogOn", function (request, response) {
	var req = require("request");

	const login = request.query.login;
	const pwd = request.query.pwd;

	var options = {
		method: 'POST',
		url: `http://${db_config.PIPE_HOST}:${db_config.PIPE_PORT}/Account/LogOn`,
		headers:
		{
			'postman-token': '99373be9-b34e-283e-0a29-4a266706777f',
			'cache-control': 'no-cache',
			'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
		},
		formData:
		{
			UserName: login,
			Password: pwd,
			donotcheck: 'true'
		}
	};

	req(options, function (error, res, body) {
		if (error) throw new Error(error);

		// console.log(res);
		try {
			const authToken = res.headers['set-cookie'][1].split(';')[0].replace('.pipiline=', '');
			// jsonWebToken = jwt.sign({ login, pwd }, jwtKey);
			response.status(200).json({ authToken });
		} catch (err) {
			response.status(400).json({ error: "Не верный логин или пароль" });
		};
		// console.log(jsonWebToken);

		// console.log(jwt.verify(jsonWebToken, authToken));

	});
});


app.get("/Account/ExplainCookie", function (request, response) {
	let http2 = require('http');
	let http3 = require('https');
	const authToken = encodeURI(request.query.cookie);

	let scheme = "http";
	let host = db_config.PIPE_HOST;
	let port = db_config.PIPE_PORT;
	// response.send({UserName: "kom_km"});

	if (request.headers.origin)
	{
		var el = db_config.ALLOW_LIST.find(a =>a.includes(request.headers.origin));
		
		if(el != undefined) { // Если request origin разрешен, меняем домен pipeline (из конфига) на пришедший origin
			// scheme = request.headers.origin.split(':')[0];
			// host = request.headers.origin.split(':')[1].substr(2);
			// port = request.headers.origin.split(':')[2];
		};
	}

	//console.log(request);
	//console.log(authToken);
	var options = {
		protocol: scheme + ':',
		host: host,// db_config.PIPE_HOST,
		port: port, //db_config.PIPE_PORT,
		path: `/Account/ExplainCookie/?cookie=${authToken}`
	};

	callback = function (explainCookieResponse) {
		let answer;
		explainCookieResponse.on('data', function (chunk) {
			try {
				answer = JSON.parse(chunk.toString('utf8'));
			} catch (err) {
				console.error('Ошибка при валидации токена в pipeline');
				response.status(502).send();
				return;
			};

			try {
				answer.jsonWebToken = jwt.sign({ authToken }, jwtKey);
				response.send(answer);
			} catch (err) {
				response.status(400).send({ err: "Ошибка подписи json web token" });
			};

		});

		explainCookieResponse.on('end', function () {
			// console.log("Запрос завершен");
		});
	}

	if (options.protocol === 'http:') {
		http2.get(options, callback).end();
	}
	else if (options.protocol === 'https:') {
		http3.get(options, callback).end();
	}
	else {
		//todo throw
	}
});



app.get("/wschat/getCommandsText", async function (request, response) {
	const commandsId = request.query.commandsId.split(';');
	const claimId = request.query.claimId;
	let res = [];

	commandsId.forEach(async (item, i) => {
		try {
			// const textCommand = await connection.execute(
			// 	// `SELECT ID, COMMAND_TEXT FROM PIPELINE.CLAIM_CHAT_COMMANDS WHERE ID = :id`,
			// 	`SELECT c.ID, c.COMMAND_TEXT
			// 	FROM CLAIM_CHAT_COMMANDS c
			// 	WHERE ID = :id AND ID NOT IN (
			// 		SELECT COMMAND_ID FROM CLAIM_CHAT_MESSAGES ccm 
			// 		WHERE CLAIMID = :claimId
			// 		and SENDDATE >= sys_extract_utc(systimestamp) - INTERVAL '10' MINUTE 
			// 		AND IS_COMMAND = 1
			// 	)`,
			// 	[item, claimId]
			// );

			// Получить id и текст конкретной комманды по commandId и claimId
			const textCommand = await dbGetData('GetListChatCommandsByClaim', item, claimId);

			res.push({
				commandId: textCommand[0].ID,
				text: textCommand[0].COMMAND_TEXT
			});
		} catch (err) {
			console.log(err);
			res.push(null);
		};

		if (res.length === commandsId.length) {
			response.send(res);
		};
	});

});


app.get("/wschat/getRecentMessages", async function (request, response) {
	let res = [];
	try {
		// res = await connection.execute(
		// 	`WITH cte
		// 	AS
		// 	(
		// 		SELECT aa.id, aa.CLAIMID, aa.ROLEID FROM (
		// 			SELECT ch.ID, 
		// 				ch.CLAIMID, 
		// 				ur.ROLEID,
		// 				ROW_NUMBER() OVER (PARTITION BY ch.CLAIMID ORDER BY ch.ID desc) rn 
		// 			FROM ASP_NET.ORA_ASPNET_USERS oau
		// 			JOIN ASP_NET.ORA_ASPNET_USERSINROLES ur ON oau.USERID = ur.USERID
		// 			JOIN ASP_NET.ORA_ASPNET_ROLES oar ON oar.ROLEID = ur.ROLEID
		// 			JOIN PIPELINE.CLAIM_CHAT_MESSAGES ch ON ch.USERNAME = oau.USERNAME
		// 			WHERE oau.APPLICATIONID = '7800E9BE23334999AAAA31D2FFD04801'
		// 		) aa WHERE aa.rn = 1
		// 	)
		// 	SELECT t.Id AS taskId, ch.ID, ch.CLAIMID, ch.USERNAME, ch.MESSAGE, FROM_TZ(CAST( ch.SENDDATE AS TIMESTAMP ), 'UTC' ) AS SENDDATE, ch.IS_COMMAND, ch.COMMAND_ID FROM cte c
		// 	JOIN PIPELINE.CLAIM_CHAT_MESSAGES ch ON c.id = ch.ID AND c.ROLEID = 'C6676507F72048AB82C1A26A3B1B3A2E'
		// 	JOIN PIPELINE.TASKS t ON t.CLAIMID = c.ClaimID AND nvl(t.NEXTOPERID, -1) = -1
		// 	ORDER BY ch.ID`
		// );

		// Получить список последних неотвеченных сообщений
		res = await dbGetData('GetRecentMessages');
	} catch (err) {
		console.log(err);
	};
	response.send(res);
});



// app.use(function (req, res, next) {
// 	var origins = [
// 		'http://example.com',
// 		'http://www.example.com'
// 	];

// 	for (var i = 0; i < origins.length; i++) {
// 		var origin = origins[i];

// 		if (req.headers.origin.indexOf(origin) > -1) {
// 			res.header('Access-Control-Allow-Origin', req.headers.origin);
// 		}
// 	}

// res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
// res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	console.log("this");
// 	next();
// });

http.listen(8080, () => {
	console.log('Listening on port: 8080');
});

// const { Client } = require('pg');

// const db = new Client({
// 	user: db_config.USER,
// 	host: db_config.HOST,
// 	database: db_config.DB,
// 	password: db_config.PWD,
// 	port: db_config.PORT
// });

// db.connect();
// require('dotenv').config();
// console.log(process.env);



// const run = async () => {
// 	let connection;
// 	try {
// 		connection = await db.getConnection({
// 			user: db_config.USER,
// 			password: db_config.PWD,
// 			connectString: `(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = ${db_config.HOST})(PORT = ${db_config.PORT}))(CONNECT_DATA = (SID = ${db_config.DB})))`
// 		});

// const result = await connection.execute(
// 	`SELECT * FROM CLAIM_CHAT_MESSAGES`
// );
// console.log(result);

// const data = await connection.execute(
// 	`INSERT INTO CLAIM_CHAT_MESSAGES (CLAIMID, USERNAME, MESSAGE, SENDDATE) VALUES (:claimId, :userName, :msg, to_date(:sendDate, 'yyyy-mm-dd hh24:mi:ss'))`,
// 	{ claimId: 111, userName: 'userName', msg: 'tstMSG', sendDate: ''}
// );
// console.log(data);

// 	} catch (err) {
// 		console.error(err);
// 	} finally {
// 		if (connection) {
// 			try {
// 				await connection.close();
// 			} catch (err) {
// 				console.error(err);
// 			}
// 		}
// 	}
// };

// run();


// function convertDate(inputFormat) {
// 	function pad(s) { return (s < 10) ? '0' + s : s; }
// 	var d = new Date(inputFormat)
// 	var date = [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('.')
// 	var time = [pad(d.getHours()), pad(d.getMinutes()), d.getSeconds()].join(':')
// 	return [date, time].join(' ')
// }



const responseTextSwitcher = (row) => {
	switch (row.IS_COMMAND) {
		case 0:
			return row.MESSAGE;
		case 1:
			return row.COMMAND_TEXT;
		case 2:
			return row.RESPONSE_TEXT;
		default:
			return null;
	};
};


// Обработчик на подключение нового клиента
io.of('/wschat/socket.io').on('connection', async function (socket) {
	console.log("some connect");

	try {
		jwt.verify(socket.request._query['jwt'], jwtKey);
	} catch (err) {
		console.log('client disconnected (json web token verify failed)');
		socket.disconnect();
	};

	try {
		// connection = await db.getConnection({
		// 	user: db_config.USER,
		// 	password: db_config.PWD,
		// 	connectString: `(DESCRIPTION =(ADDRESS = (PROTOCOL = TCP)(HOST = ${db_config.HOST})(PORT = ${db_config.PORT}))(CONNECT_DATA = (SID = ${db_config.DB})))`
		// });

		var time = (new Date).toLocaleTimeString();

		var claimId = socket.request._query['claimId'];
		var userName = socket.request._query['userName'];

		// const data = await connection.execute(
		// 	`SELECT USERNAME, MESSAGE, FROM_TZ(CAST( SENDDATE AS TIMESTAMP ), 'UTC' ) AS SENDDATE, IS_COMMAND, CLAIM_CHAT_COMMANDS.COMMAND_TEXT, CLAIM_CHAT_COMMANDS.RESPONSE_TEXT
		// 	 FROM PIPELINE.CLAIM_CHAT_MESSAGES
		// 	 LEFT JOIN PIPELINE.CLAIM_CHAT_COMMANDS ON PIPELINE.CLAIM_CHAT_MESSAGES.COMMAND_ID = PIPELINE.CLAIM_CHAT_COMMANDS.ID
		// 	 WHERE CLAIMID = :id
		// 	 ORDER BY PIPELINE.CLAIM_CHAT_MESSAGES.ID`,
		// 	[claimId]
		// );

		// Получение списка всех сообщений по текущему claimId
		const data = await dbGetData('GetListChatMessagesByClaim', claimId);

		// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
		socket.send({ 'event': 'connected', 'name': userName, 'time': time });

		for (let i = 0; i < data.length; i++) {
			let text = responseTextSwitcher(data[i]);
			socket.send({ 'event': 'messageSent', 'name': data[i].USERNAME, 'text': text, 'time': data[i].SENDDATE, 'claimId': claimId, 'isCommand': data[i].IS_COMMAND });
		};

		// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
		socket.broadcast.send({ 'event': 'userJoined', 'name': userName, 'time': time });
		// Навешиваем обработчик на входящее сообщение
		socket.on('message', async function (message) {
			if (message.type === 'command') {
				const sendDate = dateFormat(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), "yyyy-mm-dd HH:MM:ss");
				let resCommand;

				try {
					// resCommand = await connection.execute(
					// 	// `SELECT * FROM PIPELINE.CLAIM_CHAT_COMMANDS WHERE ID = :id`,
					// 	`SELECT c.ID, c.COMMAND_TEXT, c.RESPONSE_TEXT, (
					// 		select listagg(child_id,';') within group(order by child_id) csv
					// 		from CLAIM_CHAT_COMMAND_CHAINS 
					// 		WHERE PARENT_ID = c.ID 
					// 		AND CHILD_ID NOT IN (
					// 			SELECT COMMAND_ID FROM CLAIM_CHAT_MESSAGES ccm 
					// 			WHERE CLAIMID = :claimId 
					// 			and SENDDATE >= sys_extract_utc(systimestamp) - INTERVAL '10' MINUTE 
					// 			AND IS_COMMAND = 1
					// 		)
					// 	) RESPONSE_COMMANDS
					// 	FROM CLAIM_CHAT_COMMANDS c
					// 	WHERE ID = :id`,
					// 	[claimId, message.commandId]
					// );

					// Получить информацию о конкретной комманде по commandId
					resCommand = await dbGetData('GetChatCommandsByCommandId', message.commandId, claimId);

					// запись комманды
					await dbAddChatMessage(claimId, userName, null, sendDate, 1, message.commandId);
					// await connection.execute(
					// 	`INSERT INTO PIPELINE.CLAIM_CHAT_MESSAGES (CLAIMID, USERNAME, SENDDATE, IS_COMMAND, COMMAND_ID) VALUES (:claimId, :userName, to_date(:sendDate, 'yyyy-mm-dd hh24:mi:ss'), 1, :commandId)`,
					// 	{ claimId, userName, sendDate, commandId: message.commandId }
					// );

					// запись ответа комманды
					await dbAddChatMessage(claimId, "commandResponse", null, sendDate, 2, message.commandId);
					// await connection.execute(
					// 	`INSERT INTO PIPELINE.CLAIM_CHAT_MESSAGES (CLAIMID, USERNAME, SENDDATE, IS_COMMAND, COMMAND_ID) VALUES (:claimId, :userName, to_date(:sendDate, 'yyyy-mm-dd hh24:mi:ss'), 2, :commandId)`,
					// 	{ claimId, userName: "commandResponse", sendDate, commandId: message.commandId }
					// );

				} catch (err) {
					console.log(err);
				};

				socket.send({ 'event': 'commandSent', 'name': userName, 'text': resCommand[0].COMMAND_TEXT, 'time': sendDate, 'claimId': claimId, 'isCommand': 1 });
				socket.send({ 'event': 'commandSent', 'name': "commandResponse", 'text': resCommand[0].RESPONSE_TEXT, 'nextCommands': resCommand[0].RESPONSE_COMMANDS, 'time': sendDate, 'claimId': claimId, 'isCommand': 1 });

				socket.broadcast.send({ 'event': 'commandSent', 'name': userName, 'text': resCommand[0].COMMAND_TEXT, 'time': sendDate, 'claimId': claimId, 'isCommand': 1 });
				socket.broadcast.send({ 'event': 'commandSent', 'name': "commandResponse", 'text': resCommand[0].RESPONSE_TEXT, 'nextCommands': resCommand[0].RESPONSE_COMMANDS, 'time': sendDate, 'claimId': claimId, 'isCommand': 1 });
				return;
			};

			const msg = message.text;

			// console.log(new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }).split(",").join(""));
			// console.log(new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }).split(",").join(""));
			// var sendDate = dateFormat(new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }).split(",").join(""), "yyyy-mm-dd hh:MM:ss");
			// console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), "yyyy-mm-dd HH:MM:ss");
			var sendDate = dateFormat(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), "yyyy-mm-dd HH:MM:ss");
			// console.log(day);

			// var date = (new Date).toLocaleDateString();
			// var time = (new Date).toLocaleTimeString();
			// console.log(`${date} ${time}`);

			// var date = (new Date).toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' });
			// var time = (new Date).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
			// console.log("date with timezone");
			// console.log(`${date} ${time}`);


			// let promise = new Promise((function (resolve, reject) {
			// 	var id = 0;
			// 	db.query(`select max(id) from socketiodata s;`, (err, data) => {
			// 		if (err)
			// 			throw new Error(err);
			// 		id = data.rows[0].max + 1;
			// 		resolve(id);
			// 	});
			// }));
			// console.log(connection);

			try {
				// Запись сообщения в БД
				await dbAddChatMessage(claimId, userName, msg, sendDate, 0, null);
				// const data = await connection.execute(
				// 	`INSERT INTO PIPELINE.CLAIM_CHAT_MESSAGES (CLAIMID, USERNAME, MESSAGE, SENDDATE) VALUES (:claimId, :userName, :msg, to_date(:sendDate, 'yyyy-mm-dd hh24:mi:ss'))`,
				// 	{ claimId, userName, msg, sendDate }
				// );
			} catch (err) {
				console.log(err);
			};

			// Уведомляем клиента, что его сообщение успешно дошло до сервера
			socket.send({ 'event': 'messageSent', 'name': userName, 'text': msg, 'time': sendDate, 'claimId': claimId, 'isCommand': 0 });
			// Отсылаем сообщение остальным участникам чата
			socket.broadcast.send({ 'event': 'messageReceived', 'name': userName, 'text': msg, 'time': sendDate, 'claimId': claimId, 'isCommand': 0 })
		});
		// При отключении клиента - уведомляем остальных
		socket.on('disconnect', function () {
			var time = (new Date).toLocaleTimeString();
			io.sockets.send({ 'event': 'userSplit', 'name': userName, 'time': time });
		});


	} catch (err) {
		console.error(err);
	} finally {
		// if (connection) {
		// 	try {
		// 		await connection.close();
		// 	} catch (err) {
		// 		console.error(err);
		// 	}
		// }
	}

});