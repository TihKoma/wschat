import React, { FC } from 'react'
import { Provider } from 'react-redux';
import store from './store/store';
import Chat from './components/chat/chat';

export const App = () => {
	return (
		<Provider store={store}>
			<Chat />
		</Provider>
	)
};