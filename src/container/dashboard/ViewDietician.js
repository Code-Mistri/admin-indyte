import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Button, Card, Col, Modal, Row, Skeleton, Typography } from 'antd';
import { useParams } from 'react-router-dom/';
import { Main } from '../styled';
import { decryptData, getFormattedDate } from '../../utils/helper-functions';
import { api } from '../../utils/axios-util';

const { Meta } = Card;
const { Paragraph } = Typography;
export default function ViewUser() {
  const { id } = useParams();
  const [selectDietitian, setSelectedDietitian] = useState({});
  const [dietitianClients, setDietianClients] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [banUserModalOpen, setBanUserModalOpen] = useState(false);
  const { role } = useSelector((state) => {
    return {
      role: state.auth.role,
    };
  });

  useEffect(() => {
    setLoading(true);
    async function fetchUser() {
      try {
        const res = await api.get(`/dietician/me/${id}`);
        console.log({ res });
        if (res.status === 200) {
          const data = await res.data;
          console.log({ data });
          setSelectedDietitian(data);
        } else {
          throw new Error(await res.data);
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    const fetchDietClients = async () => {
      try {
        const clRes = await api.get(`/getclients?dieticianId=${id}`);
        if (clRes.status !== 200) {
          throw new Error('Failed to get data');
        }
        const data = await clRes.data;
        console.log(data);
        setDietianClients(data?.clients);
        console.log({ clRes });
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    fetchDietClients();
  }, []);

  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });
  if (!id) {
    return <Card className="flex-center w-full h-full">Not Found</Card>;
  }

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
      <Modal
        open={banUserModalOpen}
        onCancel={() => setBanUserModalOpen(false)}
        onOk={() => setBanUserModalOpen(false)}
      >
        <Typography>Feature Coming soon</Typography>
      </Modal>
      {loading ? (
        <Skeleton active className="w-full h-full" />
      ) : (
        selectDietitian && (
          <Main>
            <div className="p-4 my-1">
              <Card bordered={false}>
                <Row align="middle" gutter={24}>
                  <Col xs={24} md={8} align="">
                    <Card bordered={false} style={{ margin: 'auto 0' }}>
                      <Avatar
                        size={200}
                        src={
                          selectDietitian?.profile ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHVzZXJzfGVufDB8fDB8fHww'
                        }
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={16}>
                    <Card bordered={false}>
                      <Typography.Title
                        level={4}
                        style={{ width: 'fit-content', margin: '1rem 0', textAlign: 'start' }}
                      >
                        {selectDietitian.name}
                      </Typography.Title>
                      <Paragraph>Qualifications: {selectDietitian.qualification}</Paragraph>
                      <Paragraph>Clients: {selectDietitian?.clients || 400}</Paragraph>
                      <Paragraph>Address: {selectDietitian.address}</Paragraph>
                      <Paragraph>PAN: {selectDietitian.pan}</Paragraph>
                      <Paragraph>Phone: {selectDietitian.phone}</Paragraph>
                      <Paragraph>Email: {selectDietitian.email}</Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Typography.Title level={5} style={{ marginTop: '20px' }}>
                      {dietitianClients.user?.length < 1 ? 'No clients assigned' : 'Clients'}
                    </Typography.Title>
                    {loading ? (
                      <Skeleton active />
                    ) : (
                      dietitianClients.user?.map((client, index) => (
                        <Card key={index} style={{ marginBottom: '10px' }}>
                          <Row gutter={16}>
                            <Col xs={8}>
                              <Avatar
                                size={128}
                                className="w-full"
                                src={
                                  client?.profile ||
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHVzZXJzfGVufDB8fDB8fHww'
                                }
                              />
                            </Col>
                            <Col xs={12}>
                              <Paragraph>Name: {client.name}</Paragraph>
                              <Paragraph>Phone: {client.phone}</Paragraph>
                              <Paragraph>Email: {client.email}</Paragraph>
                            </Col>
                          </Row>
                        </Card>
                      ))
                    )}
                  </Col>
                </Row>
              </Card>
            </div>
          </Main>
        )
      )}
    </>
  );
}
