const HOST = 'ora-se-2';//'localhost';
const DB = 'WAPPTST';//'WAPPUAT';
const USER = 'pipeline_iis';//'pipeline';
const PWD = 'Ud7*dhsbkGfh_Uber';//'ZkCPYYMutIfpM6 tin6WhiteCramb2043';
const PORT = 1522;//5432;

const PIPE_HOST = 'app-wapp-dev';
const PIPE_PORT = '99';

const ALLOW_LIST = ['http://localhost:3000', 'http://localhost:3001'];

module.exports = {
	HOST, DB, USER, PWD, PORT, PIPE_HOST, PIPE_PORT, ALLOW_LIST
};