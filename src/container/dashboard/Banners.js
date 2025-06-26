import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button, Card, Carousel, Col, Image, Popconfirm, Row, Skeleton, Typography } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { Main } from '../styled';
import { api } from '../../utils/axios-util';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function UploadBanner() {
  const [pending, setPending] = useState(false);
  const [banners, setBanners] = useState([]);

  const handleBannerDelete = async (bannerId) => {
    setPending(true);
    try {
      await api.delete(`/admin/deleteBanner/${bannerId}`);
      setBanners(banners.filter((banner) => banner.id !== bannerId));
    } catch (err) {
      console.error('Error deleting banner:', err);
    } finally {
      setPending(false);
    }
  };
  useEffect(() => {
    setPending(true);
    async function fetchBanners() {
      try {
        const res = await api.get('/admin/banner');
        console.log({ res: await res.data, response: res });
        setBanners(await res.data);
      } catch (err) {
        console.error({ err });
      } finally {
        setPending(false);
      }
    }
    fetchBanners();
  }, []);
  return (
    <>
      <PageHeader
        title="Banners"
        buttons={[
          <Button type="primary">
            <Link to="/admin/app-banners/upload">Upload New</Link>
          </Button>,
        ]}
      />
      <Main>
        {pending ? (
          <Skeleton active className="w-full h-full" />
        ) : (
          <Row gutter={[16, 16]}>
            {banners.map((banner) => (
              <Col key={banner.id} xs={24} md={12}>
                <Card
                  style={{
                    marginBottom: '20px',
                    position: 'relative',
                    minHeight: '40vh',
                    maxHeight: '40vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Popconfirm
                    title="Are you sure you want to delete this banner?"
                    onConfirm={() => handleBannerDelete(banner.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="danger"
                      icon={<DeleteOutlined />}
                      style={{ position: 'absolute', top: 10, left: 10, zIndex: '99' }}
                    />
                  </Popconfirm>
                  <div
                    style={{
                      marginBottom: '4px',
                      position: 'relative',
                      maxHeight: '30vh',
                      overflowY: 'clip',
                    }}
                  >
                    <Image src={banner.imgLink} alt={banner.name} className="banner-image" />
                  </div>
                  <Typography className="font-bold text-md">{banner.name}</Typography>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Main>
    </>
  );
}
