npm install express
npm install socket.io
npm install pg
npm install oracledb
npm install dotenv

утановить клиента oracle x64



БД chat

create table SocketIoData (
 id int not null primary key, 
 user_name text not null ,
 message text not null , 
 claimId int not null , 
 send_date timestamp not null )

конфиг для коннекта к бд - db.config.js