import React, { ChangeEvent, useState } from "react"
import { connect } from "react-redux";
import { AppStateType } from "../store/store";
import Auth from "../components/auth/Auth";

// export const withAuth = (Component: React.FC) => {
// 	class RedirectComponent extends React.Component<propsType> {
// 		render() {
// 			if (!this.props.authToken)
// 				return <Auth />;

// 			return <Component {...this.props} />
// 		}
// 	};

// 	let ConnectedAuthRedirectComponent = connect(mapStateToProps)(RedirectComponent);

// 	return ConnectedAuthRedirectComponent;
// };


const mapStateToProps = (state: AppStateType) => {
	return {
		authToken: state.wschat.authToken,
	}
}

export const withAuth = (Component: any) => {
	const RedirectComponent = (props: any) => {
		if (!props.authToken)
			return <Auth />

		return <Component {...props} />
	};

	let ConnectedAuthRedirectComponent = connect(mapStateToProps)(RedirectComponent);

	return ConnectedAuthRedirectComponent;
};


// export interface OnChangeHoFProps {
// 	onChange?: (value: string) => void;
//  }
 
//  // Свойства компонента, принимаемого в композицию
//  export interface OnChangeNative {
// 	onChange?: React.ChangeEventHandler<HTMLInputElement>;
//  }

// export function withOnChangeString<T extends OnChangeNative>(Child: React.ComponentType<T>) {
// 	return class extends React.Component<OnChangeHoFProps & T, {}> {
// 		static displayName = `withOnChangeString(${Child.displayName || Child.name})`;
 
// 		onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) =>
// 			this.props.onChange(event.target.value);
 
// 		render() {
// 			return <Child {...this.props} onChange={this.onChangeHandler} />;
// 		}
// 	}
//  }