#https://help.ubuntu.com/community/Oracle%20Instant%20Client
#https://yum.oracle.com/repo/OracleLinux/OL7/oracle/instantclient21/x86_64/
FROM node:12.21.0

WORKDIR /install

RUN curl https://yum.oracle.com/repo/OracleLinux/OL7/oracle/instantclient21/x86_64/getPackage/oracle-instantclient-basiclite-21.1.0.0.0-1.x86_64.rpm -o ora-basic-lite.rpm
RUN curl https://yum.oracle.com/repo/OracleLinux/OL7/oracle/instantclient21/x86_64/getPackage/oracle-instantclient-sqlplus-21.1.0.0.0-1.x86_64.rpm -o ora-sqlplus.rpm

RUN apt-get update &&  apt-get install -y alien
RUN alien -i ora-basic-lite.rpm
RUN alien -i ora-sqlplus.rpm

RUN apt-get install -y mc

RUN apt-get install -y  libaio1

ENV ORACLE_HOME=/usr/lib/oracle/21/client64
ENV PATH=$PATH:$ORACLE_HOME/bin
ENV NLS_LANG=AMERICAN_AMERICA.CL8MSWIN1251

#TODO locales for sqlplus
##### not working yet
#RUN apt-get install -y locales
#RUN cat /usr/share/i18n/SUPPORTED | grep ru_RU | grep CP1251
#RUN locale-gen ru_RU.CP1251
#RUN localedef  --no-archive -c -i ru_RU -f CP1251 ru_RU.CP1251
##RUN dpkg-reconfigure --frontend noninteractive locales

#ENV LANG ru_RU.CP1251
#ENV LANGUAGE ru_RU.CP1251
##ENV LC_ALL ru_RU.CP1251
##### not working yet

ENV APP_ROOT /app
ENV NODE_ENV production

WORKDIR ${APP_ROOT}
ADD /chat/chat-socket/server/. ${APP_ROOT}

# RUN npm install express
# RUN npm install socket.io
# RUN npm install oracledb
# RUN npm install dotenv
RUN npm i

EXPOSE 8080

ENV HOST 0.0.0.0

CMD ["node", "server.js"]