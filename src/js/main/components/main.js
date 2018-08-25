import React from 'react';
import PropTypes from 'prop-types';
import UsersOnlineContainer from '../containers/users-online';
import ChatContainer from '../containers/chat';

const Main = (props) => {
  return (
    <main className="main">
      <UsersOnlineContainer
        hidden={props.onlineSectionHidden}
        userList={props.onlineSectionUsersOnline}
      />
      <ChatContainer
        clientID={props.chatClientID}
        controlsAreFrozen={props.chatControlsAreFrozen}
        handleMessageSending={props.chatHandleMessageSending}
        handleConnect={props.chatHandleConnect}
        handleLoginBoxChange={props.chatHandleLoginBoxChange}
        handleMessageBoxChange={props.chatHandleMessageBoxChange}
        loginBoxUserData={props.loginBoxUserData}
        messages={props.chatMessages}
        messageValue={props.chatMessageValue}
      />
    </main>
  );
};

export default Main;
