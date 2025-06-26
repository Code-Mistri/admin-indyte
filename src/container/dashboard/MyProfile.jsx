import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import {
  Form,
  Input,
  Upload,
  Button,
  PageHeader,
  Row,
  Col,
  Card,
  Modal,
  Typography,
  Alert,
  Image,
  Avatar,
  Skeleton,
} from 'antd';
import { CheckCircle, Loader2 } from 'lucide-react';
import { BasicFormWrapper, Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { api } from '../../utils/axios-util';
import { decryptData } from '../../utils/helper-functions';

export default function DieticianForm() {
  const { isAuthenticate, name, logo, role } = useSelector((state) => {
    return {
      name: state.auth.name,
      logo: state.auth.logo,
      role: state.auth.role,
      company: state.auth.company,
      email: state.auth.email,
    };
  });
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });

  const [form] = Form.useForm();
  const router = useHistory();
  const [error, setError] = useState();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      if (userRole === 'admin') {
        const res = await api.get(`${API_ENDPOINT}/admin/me`);
        console.log({ response: res });
        if (res.status !== 200) {
          throw new Error('Could not fetch profile data');
        }
        setProfileData(await res.data);
      } else if (userRole === 'dietician') {
        const res = await api.get(`${API_ENDPOINT}/dietician/me`);
        console.log({ response: res });

        if (res.status !== 200) {
          throw new Error('Could not fetch profile data');
        }
        setProfileData(await res.data);
      }
    };
    try {
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role]);
  const onUploadClick = async () => {
    setImgLoading(true);
    try {
      if (!imageFile) throw new Error('Image File Missing');
      const resProfile = await api.post(
        `/dietician/profile`,
        {
          image: imageFile,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      if (resProfile.status !== 200) {
        throw new Error('Dieticains created but failed to upload photo');
      }
    } catch (err) {
      console.error({ err });
      setError('Failed to update profile');
    } finally {
      setImgLoading(false);
    }
  };
  console.log({ profileData });

  return (
    <>
      {error && (
        <Modal open={error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      <PageHeader title="Profile" />
      <Main>
        <Card style={{ marginBottom: '1rem' }}>
          {loading ? (
            <Skeleton active />
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                gap: '2rem',
                alignItems: 'center',
              }}
            >
              <div>
                {profileData?.profile ? (
                  <Image width={200} src={profileData?.profile} />
                ) : (
                  <Avatar style={{ width: '200px', height: '200px' }} alt="Upload an Image" />
                )}
              </div>
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    padding: '0.5rem',
                  }}
                >
                  <p>
                    <strong>Name</strong>:{' '}
                  </p>
                  <p>{profileData?.name}</p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    padding: '0.5rem',
                  }}
                >
                  <p>
                    <strong>Email</strong>:{' '}
                  </p>
                  <p>{profileData?.email}</p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    padding: '0.5rem',
                  }}
                >
                  <p>
                    <strong>Address</strong>:{' '}
                  </p>
                  <p>{profileData?.address}</p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    padding: '0.5rem',
                  }}
                >
                  <p>
                    <strong>Phone</strong>:{' '}
                  </p>
                  <p>{profileData?.phone}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
        {userRole === 'dietician' && (
          <Card>
            <Row align="center">
              <Col xs={24} md={12}>
                <Upload
                  name="file"
                  action={imageUrl || 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188'}
                  listType="picture-card"
                  beforeUpload={(file) => {
                    console.log({ file });
                    setPreview(URL.createObjectURL(file));
                    setImageFile(file);
                  }}
                  showUploadList={false}
                >
                  {preview && !imgLoading ? (
                    <img src={preview} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    <button style={{ border: 0, background: 'none' }} type="button">
                      {imageUrl ? (
                        imgLoading ? (
                          <LoadingOutlined />
                        ) : (
                          <CheckCircle style={{ color: 'green' }} />
                        )
                      ) : (
                        <UploadOutlined />
                      )}
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </button>
                  )}
                </Upload>
                <Button onClick={onUploadClick} type="default">
                  {imgLoading ? 'uploading...' : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Card>
        )}
      </Main>
    </>
  );
}
