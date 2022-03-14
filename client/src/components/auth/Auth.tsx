import React, { ChangeEvent, useState } from "react"
import { connect } from "react-redux";
import { AppStateType } from "../../store/store";
import { logOn, actions } from "../../store/chat-reducer";
import style from "./auth.module.css";
import loaderImg from "./../../img/loading.gif";

type propsType = {
	userName: string,
	claimId: string,
	authToken: string,

	login: string,
	pwd: string,
	isLogonLoading: boolean,

	logOn: (login: string, pwd: string) => void
};

const Auth: React.FC<propsType & typeof actions> = (props) => {
	const [login, setLogin] = useState(props.login);
	const [password, setPassword] = useState(props.pwd);

	const onLoginChange = (e: ChangeEvent<HTMLInputElement>) => setLogin(e.target.value);
	const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

	const logOn = () => {
		if (login !== props.login || password !== props.pwd)
			props.logOn(login, password);
	};

	const onKeyPressEnter = (e: any) => {
		if (e.code === "Enter")
			logOn();
	};

	return <>
		<div className={style.authWindow}>
			<h1 className={style.authWindowTitle}>Вход</h1>
			<div className={style.authFormGroup}>
				<input type="text" placeholder=" " className={style.authFormInput + ' authFormInput'} value={login} onChange={onLoginChange} onKeyPress={onKeyPressEnter} autoComplete="off" />
				<label className={style.authFormLabel + ' authFormLabel'}>Логин</label>
			</div>

			<div className={style.authFormGroup}>
				<input type="password" placeholder=" " className={style.authFormInput} value={password} onChange={onPasswordChange} onKeyPress={onKeyPressEnter} autoComplete="off" /> <br />
				<label className={style.authFormLabel}>Пароль</label>
			</div>
			<button className={style.authWindowButton} onClick={logOn}>
				{(!props.isLogonLoading) ? 'Авторизоваться' : <div style={{width: "132px"}}><img src={loaderImg} /></div>}
			</button> <br /><br />
		</div>
	</>
}

const mapStateToProps = (state: AppStateType) => {
	return {
		userName: state.wschat.userName,
		claimId: state.wschat.claimId,
		authToken: state.wschat.authToken,
		login: state.wschat.login,
		pwd: state.wschat.pwd,
		isLogonLoading: state.wschat.isLogonLoading
	}
}

export default connect(mapStateToProps, { logOn, ...actions })(Auth);