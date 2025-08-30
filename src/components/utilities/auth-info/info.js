import React, { useState } from 'react';
import axios from 'axios';
import cookie from 'js-cookie';

import { Avatar, Button, Input, Modal } from 'antd';
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
import { API_ENDPOINT } from '../../../utils/endpoints';

const AuthInfo = () => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const { auth } = useSelector((state) => state.auth); // redux me jo login info hai
  const token = auth?.token;

  // Redux state selectors
  const { isAuthenticate, name, logo, role, id } = useSelector((state) => ({
    isAuthenticate: state.fb.auth.uid,
    name: state.auth.name,
    logo: state.auth.logo,
    role: state.auth.role,
    company: state.auth.company,
    email: state.auth.email,
    user: state.auth,
    id: state.auth.id,
  }));
  // Decrypt user role
  const userRole = decryptData({
    ciphertext: role,
    key: process.env.REACT_APP_COOKIE_SECRET,
  });

  const showEditModal = () => {
    setForm({ name });
    setIsModalVisible(true);
  };

  // Close modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // Sign out handler
  const handleSignOut = (e) => {
    e.preventDefault();
    if (isAuthenticate) {
      dispatch(fbAuthLogout(dispatch(logOut())));
    } else {
      dispatch(logOut());
    }
  };

  // Submit update

  const handleUpdate = async () => {
    if (!id) {
      console.error('❌ Admin ID not found in auth');
      return;
    }

    // ✅ Cookie se token nikalna
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    let token = getCookie('access_token');
    if (!token) {
      console.error('❌ Token not found in cookies');
      return;
    }

    // ✅ decode karke "Bearer eyJhb..." banado
    token = decodeURIComponent(token);

    try {
      const res = await axios.put(
        `${API_ENDPOINT}/admin/update/${id}`,
        { name: form.name },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (res.status === 200) {
        cookie.set('name', res.data.admin.name, { expires: 1 });

        setForm((prev) => ({
          ...prev,
          name: res.data.admin.name,
        }));

        setIsModalVisible(false);
      } else {
        console.warn('⚠️ Unexpected status:', res.status);
      }
    } catch (error) {
      console.error('❌ Update error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Something went wrong!');
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
            <Heading className="capitalize" as="h5">
              {capitalizeAllWords(form.name || name)}
            </Heading>
            <p>{capitalise(userRole)}</p>
          </figcaption>
        </figure>

        <Link to="/admin/my-profile" className="profile-link">
          Profile
        </Link>
        <Button type="default" htmlType="button" className="edit-profile-btn" onClick={showEditModal}>
          Edit Profile
        </Button>
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

      <Modal
        title="Edit Profile "
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate}>
            Save
          </Button>,
        ]}
      >
        <Input
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          style={{ marginBottom: '10px' }}
        />
      </Modal>
    </InfoWraper>
  );
};

export default AuthInfo;
