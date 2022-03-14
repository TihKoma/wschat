import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { connect } from "react-redux";
import { AppStateType } from "../../store/store";
import { MessageType, startListeningMessages, sendMessage, actions } from "../../store/chat-reducer";
import style from "./chat.module.css";
import chatIcon from "./../../img/iconChat.png";
// import 'bootstrap/dist/css/bootstrap.min.css';
import faviconImg from "./../../img/favicon.png";
import btnSendImg from "./../../img/btn_send.orange.png";
import dateFormat from "dateformat";
import CommandWindow from "./../commandWindow/CommandWindow";
import { withAuth } from "../../hoc/withAuth";
import styleTooltip from "./tooltipLine.module.css";

type propsType = {
	claimId: string,
	authToken: string,
	userName: string,
	messages: MessageType[],
	msgCount?: number,
	isAdminStand: boolean,

	startListeningMessages: () => void,
	sendMessage: (message: string) => void
};

const Chat: React.FC<propsType & typeof actions> = (props) => {
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [isCommandWindowOpen, setIsCommandWindowOpen] = useState(false);
	const [currentMessage, setCurrentMessage] = useState('');
	const [testClaimId, setTestClaimId] = useState(props.claimId);
	const [isShowNotification, setIsShowNotification] = useState(false); // уведомление о нерабочем времени

	const messagesAnchorRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setIsChatOpen(props.isAdminStand);
	}, [props.isAdminStand]);

	useEffect(() => {
		props.startListeningMessages();
		// document.getElementById('wschatFooterContainerInput')?.removeAttribute('disabled');
	}, [props.claimId, props.userName]);

	useEffect(() => {
		messagesAnchorRef.current?.scrollIntoView({behavior: 'auto'});
		// const topOffset = document.querySelector('.mywschat-body')?.offsetHeight;
	}, [props.messages]);

	const onMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
		setCurrentMessage(e.target.value);
	};

	const onClaimIdChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTestClaimId(e.target.value);
	};

	const connectToWS = () => {
		if (testClaimId !== props.claimId)
			props.changeClaimId(testClaimId);
	};

	const onSendMessage = () => {
		if (!currentMessage)
			return;
		props.sendMessage(currentMessage);
		setCurrentMessage('');

		let now = new Date();
		const year = now.getUTCFullYear();
		const month = now.getUTCMonth()+1;
		const day = now.getUTCDate();
		const hours = now.getUTCHours();
		const minutes = now.getUTCMinutes();
		
		let nowUTC = new Date(year, month, day, hours, minutes);
		let dateStart = new Date(year, month, day, 6, 0);
		let dateEnd = new Date(year, month, day, 18, 0);
		
		if ( !((nowUTC >= dateStart) && (nowUTC <= dateEnd)) ) {
			setIsShowNotification(true);
			// console.log("notification");

			let timeout = setInterval(() => {
				setIsShowNotification(false);
				clearInterval(timeout);
			}, 5000);
		};
	};
	

	const onKeyPressEnter = (e: any) => {
		if (e.code === "Enter")
			onSendMessage();
	};

	const hideChat = () => setIsChatOpen(false);
	const openChat = () => setIsChatOpen(true);

	const onClickTooltip = () => setIsShowNotification(false);

	if (!props.authToken || (!props.claimId && !props.isAdminStand))
		return <></>;

	// console.log(props.messages);

	const masMessages = props.messages.map(el => {
		let msgDate = dateFormat(new Date(el.date.replace('T', ' ').replace('Z', '') + ' UTC'), "dd.mm.yyyy HH:MM:ss");
		// console.log(dateFormat(new Date('2021-03-30 10:49:55 UTC'), "dd.mm.yyyy HH:MM:ss"));
		const q = el.senderName === props.userName;
		// console.log(el.message);
		return <div className={ (q ? style.wschatBodyMessageRight : style.wschatBodyMessage) + ' ' + (el.isCommand ? style.wschatMsgCommand : '') } key={el.senderName + el.date}>
			{/* <div className="wschat-body-message-avatar">
				<img src={userImg} />
			</div> */}
			<div className={ q ? style.wschatBodyMessageRightContainer : style.wschatBodyMessageContainer }>
				<span className={style.wschatBodyMessageSpan} dangerouslySetInnerHTML={{__html: el.message.toString()}}>
					{/* {el.message.toString()} */}
				</span>
				<p>
					{msgDate}
					{/* {el.date} */}
				</p>
			</div>
		</div>
	});

	return <>
		{/* <div>
			<input type="text" placeholder="claimId" value={testClaimId} onChange={onClaimIdChange} />
		</div>
		<div>
			<button onClick={connectToWS}>Connect</button>
		</div> */}
		{ !isChatOpen && <div id={style.chatOpenIcon} onClick={openChat}>
			<img src={chatIcon} alt="" width="60px" />
		</div> }

		{ isChatOpen && <div id = { style.wschatPanel } >
			{/* <div id="docs-panel">
				<input type="button" value="Скачать все документы" style={{width: "50%"}} />
				<input type="file" style={{width: "50%"}} />
				<select name="" id="" style={{width: "100%"}} >
					<option value="">Паспорт</option>
					<option value="">Фото</option>
					<option value="">Прочие документы</option>
				</select>
			</div> */}

			<div id = { style.wschatHeader }>
				<div>
					<img src={faviconImg} width="40px" />
				</div>
				<div id = { style.wschatHeaderText }>
					<span>Квант чат</span>
					<p> { ( props.msgCount === undefined ) ? "...loading" : `${props.msgCount} сообщений`} </p>
				</div>

				<div id = { style.wschatHide }>
					<span onClick={hideChat}>Скрыть</span>
				</div>
			</div>
			<div id = { style.mywschatBody }>
				{masMessages}
				<div ref={messagesAnchorRef} id = { style.messagesAnchorRef }></div>
				{/* <div className="wschat-body-message">
					<div className="wschat-body-message-avatar">
						<img src={userImg} />
					</div>
					<div className="wschat-body-message-container">
						<span>
							hello team hello team hello team hello team hello team hello team hello team hello team
						</span>
						<p>
							17:10 09.02.2021
						</p>
					</div>
				</div> */}
				<CommandWindow isOpen = { isCommandWindowOpen } setIsOpen = { setIsCommandWindowOpen }/>
			</div>

			<div id = { style.wschatFooter }>
				<div id = { style.wschatFooterContainer }>
					<div id = { style.wschatFooterContainerTextfield }>
					
						<span className={isShowNotification ? styleTooltip.tooltip : ""} onClick={onClickTooltip}>
							<input type="text" autoFocus value={currentMessage} onChange={onMessageChange} onKeyPress={onKeyPressEnter} />
							<span className={styleTooltip.tooltipContent}>
								<span className={styleTooltip.tooltipText}>
									<span className={styleTooltip.tooltipInner}>
										Ваше обращение принято в работу. Онлайн-консультант примет его в работу с 9 до 21 по МСК. Вы также можете обратиться к своему куратору по мобильному телефону.
									</span>
								</span>
							</span>
						</span>
					</div>
					<div id = { style.wschatFooterBtnSend } onClick={onSendMessage}>
						<img src={btnSendImg} alt="" />
					</div>
				</div>

			</div>
		</div> }
		
	</>
}

const mapStateToProps = (state: AppStateType) => {
	return {
		claimId: state.wschat.claimId,
		authToken: state.wschat.authToken,
		userName: state.wschat.userName,
		messages: state.wschat.messages,
		msgCount: state.wschat.msgCount,
		isAdminStand: state.wschat.isAdminStand
	}
}

export default connect(mapStateToProps, { startListeningMessages, sendMessage, ...actions })(Chat);