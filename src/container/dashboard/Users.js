import { Avatar, Button, Card, Col, Modal, Row, Select, Skeleton, Table, Typography } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../../utils/endpoints';
import { Main, TableWrapper } from '../styled';
import { UserTableStyleWrapper } from '../pages/style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useSeletedUser } from '../../zustand/users-store';

const { Option } = Select;
export default function Users() {
  const router = useHistory();
  const [error, setError] = useState(null);
  const [sucess, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const { user, setUser } = useSeletedUser();

  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINT}/getallusers`);
        if (res.status !== 200) {
          throw new Error('Request Failed');
        }
        const data = await res.data;
        setAllUsers(data.users);
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);
  console.log({ allUsers });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        const user = allUsers.find((item) => item?.id === id);
        return (
          <div className="flex justify-start item-center gap-less">
            <Avatar
              size={48}
              src={
                user?.profile ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D'
              }
              alt={user?.name}
            />
            {user?.name}
          </div>
        );
      },
    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },

    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      key: 'subscription',
      render: (key) => {
        // active / deactive / blocked
        return <span className={`status-text ${key || 'active'}`}>active</span>;
      },
    },
    {
      title: 'Goal',
      dataIndex: 'goal',
      key: 'goal',
    },
    {
      title: 'View Detail',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        return (
          <Button
            onClick={() => {
              const userview = allUsers.find((item) => item.id === id);
              console.log({ view: userview });
              setUser(userview);
              router.push(`/admin/users/${userview.id}`);
            }}
            type="dashed"
          >
            view
          </Button>
        );
      },
    },
    // Column for dieticianId (if you want to display it)
  ];
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
      {sucess && (
        <Modal open={sucess} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}> Assigned Successfully</Typography>
          </Card>
        </Modal>
      )}

      <PageHeader
        ghost
        title="My Users"
        subTitle={loading ? <Skeleton active /> : <span className="title-counter">{allUsers.length} Users </span>}
        buttons={[
          <Select
            showSearch
            style={{ width: '100%', maxWidth: '20rem', minWidth: '16rem' }}
            placeholder="Search by Name"
            optionFilterProp="children"
            onChange={(item) => {
              const user = allUsers.find((usr) => usr.id === item);

              setSelectedUser(user);
            }}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            <Option>Select User</Option>
            {allUsers.map((user) => (
              <Option key={user.id} value={user.id} label={user.name}>
                {user.name}
              </Option>
            ))}
          </Select>,
        ]}
      />

      <Main>
        <Row gutter={15}>
          <Col md={24}>
            {loading ? (
              <Card>
                <Skeleton active />
              </Card>
            ) : (
              <UserTableStyleWrapper>
                <TableWrapper className="table-responsive">
                  <Table
                    columns={columns}
                    dataSource={selectedUser ? [selectedUser] : allUsers}
                    pagination={{ pageSize: 10 }}
                  />
                </TableWrapper>
              </UserTableStyleWrapper>
            )}
          </Col>
        </Row>
      </Main>
    </>
  );
}
