import { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { v4 } from 'uuid';
import Cookies from 'js-cookie';
import { Form, Input, Upload, Button, PageHeader, Row, Col, Card, Modal, Typography, Alert } from 'antd';
import { CheckCircle, Loader2 } from 'lucide-react';
import { BasicFormWrapper, Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { api } from '../../utils/axios-util';

export default function DieticianForm() {
  const [form] = Form.useForm();
  const router = useHistory();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  // const [fileList, setFileList] = useState([]);

  // const normFile = (e) => {
  //   if (Array.isArray(e)) {
  //     return e;
  //   }
  //   return e?.fileList;
  // };

  // const handleFilesUpload = async (options) => {
  //   const { file, onSuccess } = options;
  //   console.log('UPLOADING FILES');
  //   try {
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  //     const filePath = `dietitians/dietitian_image_${fileName}`;
  //     console.log({ filePath });
  //     const storageBucket = 'indyte';

  //     const { data, error } = await supabaseClient.storage.from(storageBucket).upload(filePath, file, {
  //       cacheControl: '3600',
  //       upsert: false,
  //       contentType: 'application/pdf',
  //     });
  //     console.log({ filesDAT: data });

  //     if (error) throw error;

  //     onSuccess('Upload successful!');
  //     console.log('Uploaded file:', data);
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //   }
  // };

  const handleCreateChatUser = async ({ userId, username }) => {
    const user = new CometChat.User(userId);
    user.setName(username);
    console.log('USER:', user);

    const response = await CometChatUIKit.createUser(user);
    console.log({ response });
  };

  const onFinish = async (values) => {
    setLoading(true);
    console.log('Success:', values);
    try {
      const token = Cookies.get('access_token').split(' ')[1];
      console.log({ token });
      const res = await api.post(`${API_ENDPOINT}/dietician/register`, {
        ...values,
      });
      console.log({ res });
      if (res.status !== 201) {
        throw new Error(await res.data);
      }

      const dietician = await res.data;
      if (!dietician) {
        throw new Error('User Not found');
      }
      await handleCreateChatUser({ username: values.username, userId: dietician.id });
      router.push('/admin/dietitians');
    } catch (err) {
      console.error({ err });
      setError('Failed to create new dietitian');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

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
      <PageHeader title="Add new Dietitian" />
      <Main>
        <Card>
          <Row align="center">
            <Col xs={24} md={12}>
              <BasicFormWrapper>
                <Form form={form} name="dietician_form" onFinish={onFinish} onFinishFailed={onFinishFailed}>
                  <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Qualification" name="qualification" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>

                  {/* Contact & Identification */}
                  <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Aadhar No." name="aadhar" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="PAN No." name="pan" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: 'Please add phone number of 10 digits' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
                    <Input />
                  </Form.Item>

                  {/* Documentation */}
                  <Form.Item label="Other Doc" name="other_doc" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label="Certificate" name="certificate" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  {/* <Form.Item
                    label="Upload Documents (PDF)"
                    name="upload"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload name="documents" multiple accept=".pdf" customRequest={handleFilesUpload} listType="text">
                      <Button>Click to upload</Button>
                    </Upload>
                  </Form.Item> */}

                  {/* Work Experience */}
                  <Form.Item label="Work Experience" name="work_exp" rules={[{ required: true }]}>
                    <Input.TextArea />
                  </Form.Item>

                  <Form.Item>
                    {console.log({ loading })}

                    <Button type="primary" htmlType="submit">
                      <div className="flex justify-center item-center gap-less w-full h-full">
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} /> adding...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </div>
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
