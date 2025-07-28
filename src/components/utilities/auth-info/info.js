import React from 'react';
import { Avatar } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import { InfoWraper, UserDropDwon } from './auth-info-style';
import { Popover } from '../../popup/popup';
import { logOut } from '../../../redux/authentication/actionCreator';
import { fbAuthLogout } from '../../../redux/firebase/auth/actionCreator';
import Heading from '../../heading/heading';
import { capitalise, capitalizeAllWords, decryptData } from '../../../utils/helper-functions';
import { DUMMY_PROFILE_URL } from '../../../constant';

const AuthInfo = () => {
  const dispatch = useDispatch();

  // Redux state selectors
  const { isAuthenticate, name, logo, role } = useSelector((state) => ({
    isAuthenticate: state.fb.auth.uid,
    name: state.auth.name,
    logo: state.auth.logo,
    role: state.auth.role,
    company: state.auth.company,
    email: state.auth.email,
    user: state.auth,
  }));
  // Decrypt user role
  const userRole = decryptData({
    ciphertext: role,
    key: process.env.REACT_APP_COOKIE_SECRET,
  });

  // Sign out handler
  const handleSignOut = (e) => {
    e.preventDefault();
    if (isAuthenticate) {
      dispatch(fbAuthLogout(dispatch(logOut())));
    } else {
      dispatch(logOut());
    }
  };

  // User dropdown content
  const userDropdownContent = (
    <UserDropDwon>
      <div className="user-dropdwon">
        <figure className="user-dropdwon__info">
          <img
            src={logo || DUMMY_PROFILE_URL}
            alt="User Avatar"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #f0f0f0',
            }}
          />
          <figcaption>
            <Heading className="capitalize" as="h5">{capitalizeAllWords(name)}</Heading>
            <p>{capitalise(userRole)}</p>
          </figcaption>
        </figure>

        <Link to="/admin/my-profile" className="profile-link">
          Profile
        </Link>

        <Link className="user-dropdwon__bottomAction" onClick={handleSignOut} to="#">
          <FeatherIcon icon="log-out" /> Sign Out
        </Link>
      </div>
    </UserDropDwon>
  );
  return (
    <InfoWraper>
      {/* User Profile Dropdown */}
      <div className="nav-author">
        <Popover placement="bottomRight" content={userDropdownContent} action="click">
          <Link to="#" className="head-example">
            <Avatar
              src={logo || DUMMY_PROFILE_URL}
              size={40}
              style={{
                cursor: 'pointer',
                border: '2px solid #f0f0f0',
              }}
            />
          </Link>
        </Popover>
      </div>
    </InfoWraper>
  );
};

export default AuthInfo;
