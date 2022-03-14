import React, { ChangeEvent, Dispatch, SetStateAction, useState } from "react"
import { connect } from "react-redux";
// import { AppStateType } from "../store/store";
import { actions, sendCommand, commandType, getCommandsText, ThunkType } from "../../store/chat-reducer";
import { AppStateType } from "../../store/store";
import style from "./commandWindow.module.css";

type propsType = {
	userName: string,
	claimId: string,
	authToken: string,
	isOpen: boolean,
	commands: commandType[],
	isCommandsTextInit: boolean,
	isAdminStand: boolean,

	setIsOpen: Dispatch<SetStateAction<boolean>>,
	sendCommand: (commandId: number) => void,
	getCommandsText: () => void
};

const CommandWindow: React.FC<propsType> = (props) => {
	if (!props.isOpen || (!props.userName && !props.authToken) || props.isAdminStand)
		return <></>;

	if (!props.isCommandsTextInit)
		props.getCommandsText();

	const onCommandClick = (commandId: number) => () =>
		props.sendCommand(commandId);

	const onCommandWindowClose = () =>
		props.setIsOpen(false);

	const masCommands = props.commands?.map((item) => {
		return item.text && <div className={style.commandButton} onClick={onCommandClick(item.commandId)} key={`command-${item.commandId}`}>
			{ item.text }
		</div>
	})
	

	return <>
		<div id={style.emptyContainer}></div>

		<div id={style.commandWindowContainer}>
			<div id={style.commandWindow}>
				<div id={style.closeCommandWindow} onClick={onCommandWindowClose}>х</div>

				{masCommands}

				{/* <div className={style.commandButton} onClick={onCommandClick(1)}>
					просьба ускорить процесс
				</div>

				<div className={style.commandButton} onClick={onCommandClick(2)}>
					необходимо прикрепить документы
				</div> */}
			</div>
		</div>
	</>
}

const mapStateToProps = (state: AppStateType) => {
	return {
		userName: state.wschat.userName,
		claimId: state.wschat.claimId,
		authToken: state.wschat.authToken,
		commands: state.wschat.commands,
		isCommandsTextInit: state.wschat.isCommandsTextInit,
		isAdminStand: state.wschat.isAdminStand
	}
}

export default connect(mapStateToProps, { sendCommand, getCommandsText })(CommandWindow);