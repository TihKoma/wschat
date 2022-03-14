import React from "react";
import { connect } from "react-redux";
import { AppStateType } from "../../store/store";
import { actions, recentMessageType, getRecentMessages } from "../../store/chat-reducer";
import style from "./recentMessages.module.css";

type propsType = {
	claimId: string,
	recentMessages: recentMessageType[],
	isRecentMessagesInit: boolean,
	pipelineLink: string,

	getRecentMessages: () => void
};

const RecentMessages: React.FC<propsType & typeof actions> = (props) => {
	if (!props.isRecentMessagesInit) {
		props.getRecentMessages();
		// console.log('render recentMes');

		setInterval(() => {
			// console.log('refresh recentMes');
			props.getRecentMessages();
		}, 15000);
	};



	const connectToChat = (claimId: string) => () => {
		if (props.claimId !== claimId)
			props.changeClaimId(claimId);
	};

	// console.log(props.recentMessages);

	const masMessages = props.recentMessages.map((item) => {
		return <tr key={'recentMessage-' + item.msgId}>
			<td> {item.claimId} </td>
			<td> {item.userName} </td>
			<td> {item.message.substring(0, 40) + ((item.message.length > 40) ? '...' : '')} </td>
			<td> {item.sendDate} </td>
			<td style={{textAlign: "center"}}>
				<a href={`${props.pipelineLink}/Claim/View/${item.taskId}`} target="_blank" className={style.linkOpenPipe}>Открыть</a>
			</td>
			<td>
				<button className={style.buttonConnect} onClick={connectToChat(item.claimId)}>Подключиться</button>
			</td>
		</tr>
	});

	return <>
		{(props.recentMessages.length === 0) && <div id={style.textRecentMessagesEmpty}>Последние чаты отсутствуют</div>}
		{(props.recentMessages.length !== 0) && <table id={style.recentMessages}>
			<thead>
				<tr>
					<td>id заявки</td>
					<td>Имя отправителя</td>
					<td>Сообщение</td>
					<td>Дата отправки</td>
					<td style={{ maxWidth: '115px', textAlign: "center" }}>
						<div>Открыть заявку на просмотр</div>
					</td>
					<td></td>
				</tr>
			</thead>

			<tbody>
				{masMessages}

				{/* <tr>
					<td>4234325234</td>
					<td>userName</td>
					<td>hey there</td>
					<td>16.04 23:15</td>
					<td>
						<button>Подключиться</button>
					</td>
				</tr> */}
			</tbody>
		</table>}
	</>;
};

const mapStateToProps = (state: AppStateType) => {
	return {
		claimId: state.wschat.claimId,
		recentMessages: state.wschat.recentMessages,
		isRecentMessagesInit: state.wschat.isRecentMessagesInit,
		pipelineLink: state.wschat.pipelineLink
	}
}

export default connect(mapStateToProps, { getRecentMessages, ...actions })(RecentMessages);