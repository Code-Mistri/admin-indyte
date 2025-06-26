/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  PageHeader,
  Button,
  Row,
  Col,
  Select,
  Modal,
  Avatar,
  Typography,
  Skeleton,
  Form,
  Input,
} from 'antd';
import { Link, useHistory } from 'react-router-dom';

import { EyeOpenIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { Loader2, MoreHorizontal, MoreHorizontalIcon, UserPlus2Icon } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllDieticiansState, useAllUserState } from '../../zustand/users-store';
import { BasicFormWrapper, Main, TableWrapper } from '../styled';
import { api } from '../../utils/axios-util';

const { Option } = Select;
const { Paragraph } = Typography;
const Dietitians = () => {
  const router = useHistory();
  const { allDietitians, loading, error, setAllDieticians, setLoading, setError } = useAllDieticiansState();
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [filteredDietitians, setFilteredDietitians] = useState([]);
  const [selectDietitian, setSelectedDietitian] = useState({});
  const [dietitianClients, setDietianClients] = useState([]);
  const [pending, setPending] = useState(false);
  const [isAssignPending, setIsAssignPending] = useState(false);
  const [delUser, setDelUser] = useState({ id: '', pending: false });
  const [assignCientsModal, setAssignClientsModal] = useState(false);
  const { allUsers, setAllUsers } = useAllUserState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [updatePending, setUpdatePending] = useState({ id: '', pending: false });

  const [form] = Form.useForm();
  const showModal = () => {
    setVisible(true);
  };

  const handleOk = async (values) => {
    if (!selectDietitian || !selectDietitian.id) {
      setError('Can not do the operation!');
    }
    console.log('Form values:', values);
    setUpdatePending({ id: selectDietitian.id, pending: true });
    try {
      const { username, name, address, work_exp, email, phone } = values;
      if (!username && !name && !address && !work_exp && !email && !phone) {
        setError('Update at least one value');
        return;
      }
      const body = {
        ...(username && { username }),
        ...(name && { name }),
        ...(address && { address }),
        ...(work_exp && { work_exp }),
        ...(email && { email }),
        ...(phone && { phone }),
      };
      console.log({ body });
      const res = await axios.put(`${API_ENDPOINT}/updatedietbyid/${selectDietitian.id}`, {
        ...body,
      });
      if (res.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      form.setFieldsValue('');
      setUpdatePending({ id: selectDietitian.id, pending: false });
    } // Handle form submission here
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  console.log({ allDietitians });
  useEffect(() => {
    const fetchAllDietitians = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/dietician/getall`);
        if (res.status !== 200) {
          throw new Error('Could not retrieve data');
        }

        const data = await res.data;
        console.log({ dietdata: data.dietician });
        setAllDieticians(data.dietician);
      } catch (err) {
        console.error({ err });
        setError('Something went wrong, try again');
      } finally {
        setLoading(false);
      }
    };
    async function fetchNewUsers() {
      try {
        const res = await axios.get(`${API_ENDPOINT}/getnewusers`);
        if (res.status !== 200) {
          throw new Error('Could not retrieve data');
        }

        const data = await res.data;
        setAllUsers(data.users);
      } catch (err) {
        console.error({ err });
        setError('Something went wrong, try again');
      } finally {
        setLoading(false);
      }
    }
    fetchNewUsers();
    fetchAllDietitians();
  }, [selectedUsers]);

  const handleSearchChange = (value) => {
    const filteredData = allDietitians.find((dietician) => dietician.id === value);
    setFilteredDietitians([filteredData]);
  };
  useEffect(() => {
    setPending(true);
    const fetchDietClients = async () => {
      try {
        const clRes = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${selectDietitian?.id}`);
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
        setPending(false);
      }
    };
    if (selectDietitian?.id) {
      fetchDietClients();
    }
  }, [selectDietitian]);
  console.log({ filteredDietitians });
  const columns = [
    {
      title: 'Dietitian',
      dataIndex: 'name',
      key: 'name',
    },

    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Work Experience',
      dataIndex: 'work_exp',
      key: 'work_exp',
    },

    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateString) => new Date(dateString).toLocaleDateString(),
    },

    {
      title: <div className="w-full text-center">Action</div>,
      dataIndex: 'id',
      key: 'id',
      width: '10%',
      render: (text, record) => {
        return (
          <div className="flex justify-between item-center gap">
            <Button
              type="info"
              shape="circle"
              onClick={() => {
                setAssignClientsModal(true);
                const selDiet = allDietitians.find((diet) => diet?.id === record?.key);
                setSelectedDietitian(selDiet);
              }}
            >
              <div className="flex-center h-full w-full">
                <UserPlus2Icon size={20} />
              </div>
            </Button>
            <Button
              type="info"
              to="#"
              shape="circle"
              onClick={() => {
                const selDiet = allDietitians.find((diet) => diet?.id === record?.key);
                setSelectedDietitian(selDiet);
                router.push(`dietitians/${selDiet?.id}`);
                setModalIsVisible(true);
              }}
            >
              <div className="flex-center h-full">
                <MoreHorizontalIcon />
              </div>
            </Button>
            <Button
              type="info"
              to="#"
              shape="circle"
              onClick={() => {
                const selDiet = allDietitians.find((diet) => diet?.id === record?.key);
                setSelectedDietitian(selDiet);
                showModal();
              }}
            >
              <div className="flex-center h-full">
                {updatePending.pending && updatePending.id === record.key ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Pencil2Icon />
                )}
              </div>
            </Button>
            <Button
              type="danger"
              to="#"
              shape="circle"
              onClick={async () => {
                console.log(record.key);
                console.log(text);

                try {
                  setDelUser({ id: record.key, pending: true });
                  const res = await axios.delete(`${API_ENDPOINT}/deletedietbyid/${record?.key}`);
                  if (res.status !== 200) {
                    throw new Error('Error deleting deititian');
                  }
                  const newDiet = allDietitians.filter((diet) => diet?.id !== record?.key);
                  setAllDieticians(newDiet);
                  if (res.status !== 200) {
                    throw new Error(await res.data);
                  }
                } catch (err) {
                  console.error({ err });
                  setError('Could not delete try again');
                } finally {
                  setDelUser({ id: '', pending: false });
                }
              }}
            >
              <div className="flex-center h-full">
                {delUser.pending && delUser.id === record.key ? <Loader2 className="animate-spin" /> : <TrashIcon />}
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  const data = filteredDietitians.length >= 1 ? filteredDietitians : allDietitians;
  const transformedData = data.map((dietician) => {
    return {
      key: dietician.id,
      name: (
        <div className="flex justify-start item-center gap">
          <figure>
            <img
              style={{ width: '40px', borderRadius: '4%' }}
              src={
                dietician?.profile ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHVzZXJzfGVufDB8fDB8fHww'
              }
              alt="User"
            />
          </figure>
          <figcaption style={{ fontWeight: 'bold' }}>
            <p className="">{dietician.name}</p>
          </figcaption>
        </div>
      ),
      qualification: dietician.qualification,
      phone: dietician.phone,
      work_exp: dietician.work_exp,
      createdAt: new Date(dietician.createdAt).toLocaleDateString(),
    };
  });
  console.log({ allUsers });
  return (
    <>
      {success && (
        <Modal open={success} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}>User Updated Sucessfully</Typography>
          </Card>
        </Modal>
      )}
      {/* update dietitians */}
      <Modal title="User Information Form" visible={visible} onOk={() => form.submit()} onCancel={handleCancel}>
        <BasicFormWrapper>
          <Form form={form} onFinish={handleOk}>
            <Form.Item
              name="name"
              label="Name"
              // rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label="Username"
              // rules={[{ required: false, message: 'Please enter the username' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              // rules={[{ type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>
            <Form.Item name="workExp" label="Work Experience">
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>
          </Form>
        </BasicFormWrapper>
      </Modal>
      {/* assign clients */}
      <Modal
        open={assignCientsModal}
        onOk={async () => {
          if (selectDietitian?.id === null) {
            setAssignClientsModal(null);
          }
          setIsAssignPending(true);
          try {
            const res = await axios.post(`${API_ENDPOINT}/assignmanyclients`, {
              userIds: selectedUsers,
              dieticianId: selectDietitian.id,
            });
            console.log({ res });
            if (res.status !== 200) {
              throw new Error((await res.data?.message) || 'Could not assign');
            }
            setAssignClientsModal(null);
            setSelectedUsers([]);
          } catch (err) {
            console.error({ err });
            setError(err.message);
          } finally {
            setIsAssignPending(false);
          }
        }}
        onCancel={() => setAssignClientsModal(null)}
      >
        <Card>
          {!isAssignPending ? (
            <Select
              showSearch
              style={{ width: '100%', maxWidth: '20rem' }}
              placeholder="Search by Name"
              mode="multiple"
              optionFilterProp="children"
              onSelect={(id) => {
                console.log({ id });
                setSelectedUsers([...selectedUsers, id]);
              }}
              onDeselect={(id) => {
                console.log({ deId: id });
                const updatedArray = selectedUsers.filterOption((item) => item === id);
                setSelectedUsers(updatedArray);
              }}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              {allUsers.map((user) => (
                <Option key={user.id} value={user.id} label={user.name}>
                  {user.name}
                </Option>
              ))}
            </Select>
          ) : (
            <div className="flex-center">
              <Loader2 className="animate-spin" size={32} style={{ color: 'gray' }} />
            </div>
          )}
        </Card>
      </Modal>
      {/* --------------- */}
      {error && (
        <Modal open={error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      <PageHeader title="Dietitians">
        <div className="flex justify-between item-center gap">
          <Select
            showSearch
            style={{ width: '100%', maxWidth: '20rem' }}
            placeholder="Search by Name"
            optionFilterProp="children"
            onChange={handleSearchChange}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            <Option>Select Dietician </Option>
            {allDietitians.map((dietician) => (
              <Option key={dietician.id} value={dietician.id} label={dietician.name}>
                {dietician.name}
              </Option>
            ))}
          </Select>

          <Button className="btn-add_new" size="default" type="primary" key="1">
            <Link to="/admin/add-dietitian">+ Add New Dietitian</Link>
          </Button>
        </div>
      </PageHeader>
      <Main>
        <Card bordered={false}>
          {loading ? (
            <Skeleton active style={{ minHeight: '50vh' }} />
          ) : (
            <TableWrapper className="table-responsive">
              <Table columns={columns} dataSource={transformedData} pagination={{ pageSize: 10 }} />
            </TableWrapper>
          )}
        </Card>
      </Main>
      <Modal
        open={modalIsVisible}
        onCancel={() => {
          setModalIsVisible(false);
        }}
        onOk={() => {
          setModalIsVisible(false);
        }}
      >
        <Card bordered={false}>
          <Row align="middle" gutter={24}>
            <Col xs={24} md={8} align="middle">
              <Avatar
                size={128}
                src={
                  selectDietitian?.profile ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHVzZXJzfGVufDB8fDB8fHww'
                }
              />
              <Typography.Title level={4} style={{ width: 'fit-content', margin: '1rem auto' }}>
                {selectDietitian.name}
              </Typography.Title>
            </Col>
            <Col xs={24} md={16}>
              <Paragraph>Qualifications: {selectDietitian.qualification}</Paragraph>
              <Paragraph>Clients: {selectDietitian?.clients || 400}</Paragraph>
              <Paragraph>Address: {selectDietitian.address}</Paragraph>
              <Paragraph>PAN: {selectDietitian.pan}</Paragraph>
              <Paragraph>Phone: {selectDietitian.phone}</Paragraph>
              <Paragraph>Email: {selectDietitian.email}</Paragraph>
            </Col>

            <Col xs={24}>
              <Typography.Title level={5} style={{ marginTop: '20px' }}>
                {dietitianClients.user?.length < 1 ? 'No clients assigned' : 'Clients'}
              </Typography.Title>
              {pending ? (
                <Skeleton active />
              ) : (
                dietitianClients.user?.map((client, index) => (
                  <Card key={index} style={{ marginBottom: '10px' }}>
                    <Row gutter={16}>
                      <Col xs={12}>
                        <Paragraph>Name: {client.name}</Paragraph>
                        <Paragraph>Phone: {client.phone}</Paragraph>
                        <Paragraph>Email: {client.email}</Paragraph>
                      </Col>
                      <Col xs={12}>
                        <Paragraph>Profile: {client.profile}</Paragraph>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}
            </Col>
          </Row>
        </Card>
      </Modal>
    </>
  );
};

export default Dietitians;
