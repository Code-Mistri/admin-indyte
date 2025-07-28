import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button, Card, Col, Form, Input, Modal, PageHeader, Row, Typography, Upload } from 'antd';
import Cookies from 'js-cookie';
import { UploadOutlined } from '@ant-design/icons';
import { BasicFormWrapper, Main } from '../styled';
import { api } from '../../utils/axios-util';

const UploadBannerForm = () => {
  const router = useHistory();
  const [selectedFile, setSelectedFile] = useState(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    setPending(true);

    event.preventDefault();
    try {
      const formData = new FormData();
      if (!bannerTitle) {
        throw new Error('Please set the name');
      }
      formData.append('image', selectedFile);
      formData.append('name', bannerTitle);

      const res = await api.post('/admin/addBanner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 201) {
        router.push('/admin/app-banners');
      } else {
        throw new Error('Something went wrong');
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  const beforeUpload = (file) => {

    const isImage = file.type.includes('image/');
    if (!isImage) {
      setError('You can only upload image files!');
      return;
    }
    return isImage || Upload.LIST_IGNORE;
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
      <PageHeader title="Upload Banner" />
      <Main>
        <Row align="middle">
          <Col xs={24} md={16} lg={12} style={{ margin: '0 auto' }}>
            <Card bordered={false}>
              <BasicFormWrapper>
                <Form onSubmit={handleSubmit}>
                  <Form.Item label="Banner Image" rules={[{ required: true, message: 'Please select a banner image' }]}>
                    <Upload
                      name="image"
                      listType="picture"
                      maxCount={1} // Allow only a single image
                      beforeUpload={beforeUpload}
                      onChange={(info) => setSelectedFile(info.fileList[0].originFileObj)}
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Form.Item>

                  <Form.Item label="Banner Title">
                    <Input value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                      <div className="flex-center item-center w-full gap-less">
                        {pending ? <Loader2 className="animate-spin" /> : 'Upload Banner'}
                      </div>
                    </Button>
                  </Form.Item>
                </Form>
              </BasicFormWrapper>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
};
export default UploadBannerForm;
