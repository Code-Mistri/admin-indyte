import React, { useEffect, useState } from 'react';
import PropTypes, { func } from 'prop-types';
import axios from 'axios';
import Cookies from 'js-cookie';
import Scrollbars from 'react-custom-scrollbars';
import {
  CometChatCallButtons,
  CometChatConversationsWithMessages,
  CometChatIncomingCall,
  CometChatMessageHeader,
  CometChatUIKit,
  MessageListConfiguration,
  MessageListStyle,
  MessagesConfiguration,
  UIKitSettingsBuilder,
  UsersConfiguration,
  UsersStyle,
  WithMessagesStyle,
} from '@cometchat/chat-uikit-react';
import { useSelector } from 'react-redux';
import { Input, List, Avatar, Layout, Menu, Card, AutoComplete, PageHeader, Row, Col, Badge } from 'antd';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useMediaQuery } from '../../utils/helper-functions';

export default function ChatApp() {
  const isMobile = useMediaQuery('(max-width:768px)');
  const { id } = useSelector((state) => {
    return {
      id: state.auth.id,
    };
  });
  const getSubtitleView = (user) => {
    return <span style={{ color: '#347fb9', font: '400 11px Inter, sans-serif' }}>{user.role}</span>;
  };
  const uwmStyle = new WithMessagesStyle({
    width: '100%',
    height: '75vh',
    border: '2px solid #e8e8e8',
    background: '#fff',
    messageTextColor: '#5f63f2',
    borderRadius: '8px',
  });

  const uStyle = new UsersStyle({
    background: '#fff',
    searchBorder: '2px solid #d9d9d9',
    searchTextColor: '#666',
    searchPlaceholderTextColor: '#999',
    titleTextColor: '5f63f2',
    separatorColor: '#38aecc',
  });

  const mStyle = new MessageListStyle({
    background: '#fff',
  });

  const uConfig = new UsersConfiguration({
    border: '2px solid black',
    hideSectionSeparator: true,
    showSectionHeader: false,
    usersStyle: uStyle,
    subtitleView: getSubtitleView,
  });

  const mListConfiguration = new MessageListConfiguration({
    messageListStyle: mStyle,
  });
  const [cometchatuser, setCometchatuser] = useState(null);
  const [initSuccess, setInitSuccess] = useState(false);
  const UIKitSettings = new UIKitSettingsBuilder()
    .setAppId(process.env.REACT_APP_COMETCHAT_APP_ID)
    .setRegion(process.env.REACT_APP_COMETCHAT_REGION)
    .setAuthKey(process.env.REACT_APP_COMETCHAT_AUTH_KEY)
    .subscribePresenceForFriends()
    .build();
  useEffect(() => {
    try {
      // if (!initSuccess) {
      CometChatUIKit.init(UIKitSettings)
        .then(() => {
          console.log('Initialization completed successfully');
          setInitSuccess(true);
        })
        .catch(console.error);
      // }

      if (id) {
        CometChatUIKit.getLoggedinUser()
          .then((chatUser) => {
            if (!chatUser) {
              console.log(chatUser);
              CometChatUIKit.login(id, process.env.REACT_APP_COMETCHAT_AUTH_KEY).then(() =>
                console.log('logged in to comet chat'),
              );
            }
            if (chatUser && !cometchatuser) {
              console.log({ chatUser });
              setCometchatuser(chatUser);
            }
          })
          .catch(console.error);
      }
    } catch (error) {
      console.error({ error });
    }
  }, []);
  console.log({ cometchatuser: cometchatuser?.e });
  const mConfig = new MessagesConfiguration({
    background: 'linear-gradient(#b6eae1, #D2FBAD)',
    messageListConfiguration: mListConfiguration,
  });
  return (
    <>
      <PageHeader title="Conversations" />
      <Card>
        {cometchatuser && (
          <>
            <div>
              <CometChatIncomingCall />
            </div>
            <CometChatConversationsWithMessages
              isMobileView={isMobile}
              user={cometchatuser}
              conversationsWithMessagesStyle={uwmStyle}
            />
          </>
        )}
      </Card>
    </>
  );
}

const UserList = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = users.filter((user) => user.name.toLowerCase().includes(value.toLowerCase()));
    console.log({ filtered, value });
    if (!filtered) setFilteredUsers([]);
    else setFilteredUsers(filtered);
  };

  console.log({ filteredUsers, searchTerm });

  return (
    <Card className="w-full">
      <AutoCompleteSearch users={users} onClick={handleSearch} />
      <Scrollbars
        style={{ height: '60vh' }}
        className="custom-scrollbar w-full"
        autoHide
        autoHideTimeout={500}
        autoHideDuration={200}
      >
        <List
          itemLayout="horizontal"
          dataSource={filteredUsers?.length >= 1 ? filteredUsers : users}
          renderItem={(user) => (
            <List.Item>
              <List.Item.Meta avatar={<Avatar src={user.profile} />} title={user.name} />
            </List.Item>
          )}
        />
      </Scrollbars>
    </Card>
  );
};

const AutoCompleteSearch = ({ users, onClick }) => {
  const [options, setOptions] = useState([]);
  const searchResult = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    return users
      .filter((user) => user.name.toLowerCase().includes(lowerCaseQuery))
      .map((user) => ({
        value: user.name,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={user.profile} size="small" />
            <span style={{ marginLeft: '10px' }}>{user.name}</span>
          </div>
        ),
      }));
  };
  const handleSearch = (value) => {
    setOptions(value ? searchResult(value) : []);
  };

  return (
    <AutoComplete
      className="w-full"
      popupMatchSelectWidth={252}
      options={options}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick(e.target.value);
        }
      }}
      onSelect={onClick}
      onSearch={handleSearch}
      size="large"
    >
      <Input.Search size="large" placeholder="Search here" enterButton />
    </AutoComplete>
  );
};

AutoCompleteSearch.propTypes = {
  users: PropTypes.array.isRequired,
  onClick: PropTypes.func,
};

UserList.propTypes = {
  users: PropTypes.array.isRequired,
};
