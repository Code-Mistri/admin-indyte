import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { v4 } from 'uuid';
import Cookies from 'js-cookie';
import { Form, Input, Upload, Button, PageHeader, Row, Col, Card, Modal, Typography, Alert, message } from 'antd';
import { CheckCircle, Loader2 } from 'lucide-react';
import { BasicFormWrapper, Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { api } from '../../utils/axios-util';
import { DUMMY_PROFILE_URL } from '../../constant';

const APP_ID = process.env.REACT_APP_COMETCHAT_APP_ID;
const REGION = process.env.REACT_APP_COMETCHAT_REGION;
const AUTH_KEY = process.env.REACT_APP_COMETCHAT_AUTH_KEY;

export default function DieticianForm() {
  const [form] = Form.useForm();
  const router = useHistory();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleCreateChatUser = async ({ userId, username }) => {
    // Initialize CometChat if not already initialized
    if (!CometChat.isInitialized()) {
      try {
        await CometChat.init(
          APP_ID,
          new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(REGION).build(),
        );
      } catch (initError) {
        console.error('CometChat Initialization failed:', initError);
        throw new Error('CometChat Initialization failed');
      }
    }
    const user = new CometChat.User(userId);
    user.setName(username);
    try {
      const response = await CometChat.createUser(user, AUTH_KEY);
    } catch (error) {
      console.error('Error creating CometChat user:', error);
      // Re-throw a string error to ensure consistency
      throw new Error('Failed to create chat user');
    }
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return;
    }

    // Validate file size (limit to 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return;
    }

    // Clean up previous preview URL
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }

    // Set new image file and create preview
    setImageFile(file);
    const newPreview = URL.createObjectURL(file);
    setPreview(newPreview);
  };

  const handleRemoveImage = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setImageFile(null);
    setPreview(null);
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required image
      if (!imageFile) {
        throw new Error('Please select a profile image');
      }

      const modifiedValues = {
        ...values,
        phone: values.phone.startsWith('+91') ? values.phone : `+91${values.phone}`,
      };

      const formData = new FormData();
      Object.entries(modifiedValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Append image file
      formData.append('profile', imageFile);

      const res = await api.post(
        `${API_ENDPOINT}/dietician/register`, 
        formData, 
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (res.status !== 201) {
        throw new Error(typeof res.data === 'string' ? res.data : 'Registration failed');
      }

      const dietician = res.data;
      if (!dietician || !dietician.id) {
        throw new Error('Invalid response from server');
      }

      // Create chat user
      try {
        await handleCreateChatUser({
          username: values.username,
          userId: dietician.id.toString(),
        });
      } catch (err) {
        console.error('Chat user creation failed:', err);
        // Don't throw here - dietician was created successfully
        message.warning('Dietitian registered successfully, but chat setup failed. Contact admin.');
      }

      message.success('Dietitian registered successfully!');

      // Clean up and redirect
      handleRemoveImage();
      form.resetFields();
      router.push('/admin/dietitians');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create new dietitian');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error('Please fix the form errors and try again');
  };

  return (
    <>
      {error && (
        <Modal open={!!error} onOk={() => setError(null)} onCancel={() => setError(null)} title="Registration Error">
          <Alert message="Registration Failed" description={error} type="error" showIcon />
        </Modal>
      )}

      <PageHeader title="Add new Dietitian" />

      <Main>
        <Card>
          <Row justify="center">
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={preview || DUMMY_PROFILE_URL}
                    alt="Dietitian Profile"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #eee',
                      marginBottom: 10,
                    }}
                  />
                  {preview && (
                    <Button
                      type="text"
                      size="small"
                      onClick={handleRemoveImage}
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: '#ff4d4f',
                        color: 'white',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        padding: 0,
                        fontSize: 12,
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>

                <Upload
                  showUploadList={false}
                  beforeUpload={() => false} // Prevent automatic upload
                  accept="image/*"
                  onChange={handleImageChange}
                >
                  <Button icon={<UploadOutlined />}>{preview ? 'Change Image' : 'Select Image'}</Button>
                </Upload>

                <Typography.Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                  Max size: 5MB. Formats: JPG, PNG, GIF
                </Typography.Text>
              </div>

              <BasicFormWrapper>
                <Form
                  form={form}
                  name="dietician_form"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      { required: true, message: 'Please enter username' },
                      { min: 3, message: 'Username must be at least 3 characters' },
                    ]}
                  >
                    <Input placeholder="Enter username" />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter password' },
                      { min: 6, message: 'Password must be at least 6 characters' },
                    ]}
                  >
                    <Input.Password placeholder="Enter password" />
                  </Form.Item>

                  <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter name' }]}>
                    <Input placeholder="Enter full name" />
                  </Form.Item>

                  <Form.Item
                    label="Qualification"
                    name="qualification"
                    rules={[{ required: true, message: 'Please enter qualification' }]}
                  >
                    <Input placeholder="Enter qualification" />
                  </Form.Item>

                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please enter address' }]}
                  >
                    <Input.TextArea placeholder="Enter complete address" rows={2} />
                  </Form.Item>

                  <Form.Item
                    label="Aadhar No."
                    name="aadhar"
                    rules={[
                      { required: true, message: 'Please enter Aadhar number' },
                      { len: 12, message: 'Aadhar number must be 12 digits' },
                      { pattern: /^\d{12}$/, message: 'Aadhar number must contain only digits' },
                    ]}
                  >
                    <Input placeholder="Enter 12-digit Aadhar number" maxLength={12} />
                  </Form.Item>

                  <Form.Item
                    label="PAN No."
                    name="pan"
                    rules={[
                      { required: true, message: 'Please enter PAN number' },
                      { len: 10, message: 'PAN number must be 10 characters' },
                      { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' },
                    ]}
                  >
                    <Input placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: 'uppercase' }} />
                  </Form.Item>

                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[
                      { required: true, message: 'Please enter phone number' },
                      { len: 10, message: 'Phone number must be 10 digits' },
                      { pattern: /^[6-9]\d{9}$/, message: 'Enter valid Indian mobile number' },
                    ]}
                  >
                    <Input addonBefore="+91" maxLength={10} placeholder="9876543210" />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Enter valid email address' },
                    ]}
                  >
                    <Input placeholder="Enter email address" />
                  </Form.Item>

                  <Form.Item
                    label="Other Documents"
                    name="other_doc"
                    rules={[{ required: true, message: 'Please enter other documents info' }]}
                  >
                    <Input placeholder="Enter other document details" />
                  </Form.Item>

                  <Form.Item
                    label="Certificate"
                    name="certificate"
                    rules={[{ required: true, message: 'Please enter certificate details' }]}
                  >
                    <Input placeholder="Enter certificate details" />
                  </Form.Item>

                  <Form.Item
                    label="Work Experience"
                    name="work_exp"
                    rules={[{ required: true, message: 'Please enter work experience' }]}
                  >
                    <Input.TextArea
                      placeholder="Describe work experience, previous roles, specializations, etc."
                      rows={4}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} disabled={loading} block size="large">
                      {loading ? 'Registering...' : 'Register Dietitian'}
                    </Button>
                  </Form.Item>
                </Form>
              </BasicFormWrapper>
            </Col>
          </Row>
        </Card>
      </Main>
    </>
  );
}
