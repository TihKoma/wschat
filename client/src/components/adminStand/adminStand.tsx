import React, { ChangeEvent, useState } from "react"
import { connect } from "react-redux";
import { AppStateType } from "../../store/store";
import { actions, logOut } from "../../store/chat-reducer";
import { withAuth } from "../../hoc/withAuth";
import RecentMessages from "./../recentMessages/recentMessages";
import style from "./adminStand.module.css";

type propsType = {
	userName: string,
	claimId: string,
	authToken: string,
	stand: string,

	logOut: () => void
};

const AdminStand: React.FC<propsType & typeof actions> = (props) => {
	const [claimId, setClaimId] = useState(props.claimId);
	// const [testAuthToken, setTestAuthToken] = useState(props.authToken);

	const onClaimIdChange = (e: ChangeEvent<HTMLInputElement>) => setClaimId(e.target.value);
	// const onAuthTokenChange = (e: ChangeEvent<HTMLInputElement>) => setTestAuthToken(e.target.value);

	const connectToWS = () => {
		if (claimId !== props.claimId)
			props.changeClaimId(claimId);
		// if (testAuthToken !== props.authToken)
		// props.changeAuthToken(testAuthToken);
	};

	const onLogOut = () => props.logOut();
	const reloadPage = () => window.location.reload();

	return <div id={style.adminPanel}>
		<div id={style.authBlock}>
			<span>user name: <b> {props.userName} </b></span> <br />
			<span id={style.logOut} onClick={onLogOut}>Выйти</span>
		</div>

		<div id={style.connectBlock}>
			<input type="text" placeholder=" " className={style.inputClaimId} value={claimId} onChange={onClaimIdChange} />
			<label className={style.labelClaimId}>Номер заявки</label>
			<button onClick={connectToWS}>Подключиться</button>
		</div>

		<div id={style.currentChat}>
			Текущий чат: <b> {props.claimId || 'не выбран'} </b> <br />
			<button onClick={reloadPage} id={style.btnReloadPage}>Обновить страницу</button>
		</div>

		<div id={style.config}>
			{ props.stand }
		</div>

		<RecentMessages />
	</div>
}

const mapStateToProps = (state: AppStateType) => {
	return {
		userName: state.wschat.userName,
		claimId: state.wschat.claimId,
		authToken: state.wschat.authToken,
		stand: state.wschat.stand
	}
}

const AdminStandWithAuth = withAuth(AdminStand);

export default connect(mapStateToProps, { ...actions, logOut })(AdminStandWithAuth);