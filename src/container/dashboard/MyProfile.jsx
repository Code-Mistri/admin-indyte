import { useEffect, useState, useCallback } from 'react';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  Upload,
  Button,
  PageHeader,
  Row,
  Col,
  Card,
  Modal,
  Typography,
  Image,
  Avatar,
  Skeleton,
  message,
  Space,
} from 'antd';
import Cookies from 'js-cookie';
import { BasicFormWrapper, Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { api } from '../../utils/axios-util';
import { decryptData } from '../../utils/helper-functions';
import actions from '../../redux/authentication/actions';

const { Title, Text } = Typography;

// Constants
const MAX_FILE_SIZE_MB = 5;
const SUPPORTED_FORMATS = 'image/*';
const AVATAR_SIZE = 200;

// Profile info item component
// Profile info item component
// eslint-disable-next-line react/prop-types
const ProfileInfoItem = ({ label, value, capitalize = false }) => (
  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
    <Text strong style={{ minWidth: '100px', marginRight: '16px' }}>
      {label}:
    </Text>
    <Text style={capitalize ? { textTransform: 'capitalize' } : undefined}>
      {value || 'N/A'}
    </Text>
  </div>
);
// Custom hooks
const useUserRole = () => {
  const { role } = useSelector((state) => ({ role: state.auth.role }));
  return decryptData({ 
    ciphertext: role, 
    key: process.env.REACT_APP_COOKIE_SECRET 
  });
};

const useProfileData = (userRole) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async () => {
    if (!userRole) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = userRole === 'admin' 
        ? `${API_ENDPOINT}/admin/me`
        : `${API_ENDPOINT}/dietician/me`;
      
      const response = await api.get(endpoint);

      if (response?.status !== 200) {
        throw new Error('Could not fetch profile data');
      }

      setProfileData(response.data);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch profile data';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  return { profileData, loading, error, setError, refetch: fetchProfileData };
};

const useImageUpload = (refetchProfile) => {
  const dispatch = useDispatch();
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const resetImageState = useCallback(() => {
    setPreview(null);
    setImageFile(null);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file.type.startsWith('image/')) {
      message.error('You can only upload image files!');
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < MAX_FILE_SIZE_MB;
    if (!isValidSize) {
      message.error(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB!`);
      return false;
    }

    return true;
  }, []);

  const handleBeforeUpload = useCallback((file) => {
    if (!validateFile(file)) return false;

    setPreview(URL.createObjectURL(file));
    setImageFile(file);
    return false; // Prevent automatic upload
  }, [validateFile]);

  const handleImageUpload = useCallback(async () => {
    if (!imageFile) {
      message.warning('Please select an image first');
      return;
    }

    setImgLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.put(
        `${API_ENDPOINT}/dietician/profile`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status === 200) {
        message.success('Profile image updated successfully!');
        
        // Update cookie and redux store
        const newLogo = response?.data?.data?.profile;
        Cookies.set('logo', newLogo);
        dispatch(actions.updateLogo({ logo: newLogo }));
        
        resetImageState();
        await refetchProfile();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      message.error('Failed to update profile image');
    } finally {
      setImgLoading(false);
    }
  }, [imageFile, dispatch, refetchProfile, resetImageState]);

  return {
    imgLoading,
    preview,
    imageFile,
    handleBeforeUpload,
    handleImageUpload,
  };
};

// Main component
export default function DieticianForm() {
  const userRole = useUserRole();
  const { profileData, loading, error, setError, refetch } = useProfileData(userRole);
  const { imgLoading, preview, imageFile, handleBeforeUpload, handleImageUpload } = useImageUpload(refetch);

  const renderProfileImage = () => {
    if (profileData?.profile) {
      return (
        <Image
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          src={profileData.profile}
          style={{ borderRadius: '8px', objectFit: 'cover' }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
        />
      );
    }

    return (
      <Avatar 
        size={AVATAR_SIZE} 
        icon={<UserOutlined />} 
        style={{ backgroundColor: '#f0f0f0' }} 
      />
    );
  };

  const renderUploadPreview = () => {
    if (preview) {
      return (
        <img
          src={preview}
          alt="preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '6px',
          }}
        />
      );
    }

    return (
      <div>
        <UploadOutlined style={{ fontSize: '24px' }} />
        <div style={{ marginTop: 8 }}>Select Image</div>
      </div>
    );
  };

  const renderImageUploadSection = () => {
    if (userRole !== 'dietician') return null;

    return (
      <Card title="Update Profile Image" style={{ marginTop: '1rem' }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Upload
                name="image"
                listType="picture-card"
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                accept={SUPPORTED_FORMATS}
                style={{ width: '100%' }}
              >
                {renderUploadPreview()}
              </Upload>

              {imageFile && (
                <Button 
                  type="primary" 
                  onClick={handleImageUpload} 
                  loading={imgLoading} 
                  block 
                  size="large"
                >
                  {imgLoading ? 'Uploading...' : 'Upload Image'}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <>
      <Modal
        title="Error"
        open={!!error}
        onOk={() => setError(null)}
        onCancel={() => setError(null)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setError(null)}>
            OK
          </Button>,
        ]}
      >
        <Text type="danger">{error}</Text>
      </Modal>

      <PageHeader title="Profile" />

      <Main>
        <Card>
          {loading ? (
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          ) : (
            <Row gutter={[24, 24]} align="top">
              <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {renderProfileImage()}
                  <Title level={4} style={{ textTransform: 'capitalize' }}>
                    {profileData?.name || 'User'}
                  </Title>                </Space>
              </Col>

              <Col xs={24} md={16}>
                <Card title="Profile Information" size="small">
                  <ProfileInfoItem label="Name" value={profileData?.name} capitalize />
                  <ProfileInfoItem label="Email" value={profileData?.email} />
                  <ProfileInfoItem label="Address" value={profileData?.address} />
                  <ProfileInfoItem label="Phone" value={profileData?.phone} />
                </Card>
              </Col>
            </Row>
          )}
        </Card>

        {renderImageUploadSection()}
      </Main>
    </>
  );
}