/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from 'react';
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
  message,
} from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { EyeOpenIcon, Pencil2Icon, TrashIcon } from '@radix-ui/react-icons';
import { Loader2, MoreHorizontal, UserPlus2Icon } from 'lucide-react';
import axios from 'axios';

import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllDieticiansState, useAllUserState } from '../../zustand/users-store';
import { BasicFormWrapper, Main, TableWrapper } from '../styled';
import { api } from '../../utils/axios-util';
import { DUMMY_PROFILE_URL } from '../../constant';

const { Option } = Select;
const { Paragraph, Title } = Typography;

// Custom hooks for better state management
const useDietitianActions = () => {
  const { allDietitians, loading, error, setAllDieticians, setLoading, setError } = useAllDieticiansState();

  const fetchAllDietitians = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/dietician/getall');
      if (res.status !== 200) {
        throw new Error('Could not retrieve data');
      }
      setAllDieticians(res.data.dietician);
    } catch (err) {
      console.error('Fetch dietitians error:', err);
      setError('Something went wrong, try again');
    } finally {
      setLoading(false);
    }
  }, [setAllDieticians, setLoading, setError]);

  const updateDietitian = useCallback(
    async (id, updateData) => {
      try {
        const res = await axios.put(`${API_ENDPOINT}/updatedietbyid/${id}`, updateData);
        if (res.status === 200) {
          message.success('User updated successfully');
          await fetchAllDietitians(); // Refresh data
          return true;
        }
      } catch (err) {
        console.error('Update error:', err);
        setError(err.message || 'Failed to update dietitian');
        return false;
      }
    },
    [fetchAllDietitians, setError],
  );

const deleteDietitian = useCallback(
  async (id) => {
    try {
      const res = await axios.delete(`${API_ENDPOINT}/deletedietbyid/${id}`);
   if (res.data?.message === "Dietician deleted successfully") {
  const updatedDietitians = allDietitians.filter((diet) => diet.id !== id);
  setAllDieticians(updatedDietitians);
  message.success("Dietitian deleted successfully");
    setAllDieticians(updatedDietitians);
        message.success("Dietitian deleted successfully");
        return true;
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError("Could not delete, try again");
      return false;
    }
  },
  [allDietitians, setAllDieticians, setError],
);

  return {
    allDietitians,
    loading,
    error,
    setError,
    fetchAllDietitians,
    updateDietitian,
    deleteDietitian,
  };
};

const useClientActions = () => {
  const { allUsers, setAllUsers } = useAllUserState();

  const fetchNewUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/getnewusers`);
      if (res.status === 200) {
        setAllUsers(res.data.users);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  }, [setAllUsers]);

  const assignClients = useCallback(async (userIds, dieticianId) => {
    try {
      const res = await axios.post(`${API_ENDPOINT}/assignmanyclients`, {
        userIds,
        dieticianId,
      });
      if (res.status === 200) {
        message.success('Clients assigned successfully');
        fetchNewUsers()
        return true;
      }
    } catch (err) {
      console.error('Assign clients error:', err);
      throw new Error(err.response?.data?.message || 'Could not assign clients');
    }
  }, []);

  return { allUsers, fetchNewUsers, assignClients };
};

// Component for the update form modal
const UpdateDietitianModal = ({ visible, onCancel, onUpdate, selectedDietitian, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const filteredValues = Object.fromEntries(Object.entries(values).filter(([_, value]) => value && value.trim()));

    if (Object.keys(filteredValues).length === 0) {
      message.warning('Please update at least one field');
      return;
    }

    const success = await onUpdate(selectedDietitian.id, filteredValues);
    if (success) {
      form.resetFields();
      onCancel();
    }
  };
  // UPDATE: Pre-fill form when modal opens and selectedDietitian changes
useEffect(() => {
  if (visible && selectedDietitian?.id) {
    form.setFieldsValue({
      name: selectedDietitian.name || '',
      username: selectedDietitian.username || '',
      email: selectedDietitian.email || '',
      phone: selectedDietitian.phone || '',
      work_exp: selectedDietitian.work_exp || '',
      address: selectedDietitian.address || '',
    });
  }
}, [visible, selectedDietitian, form]);

  return (
    <Modal
      title="Update Dietitian Information"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          Update
        </Button>,
      ]}
    >
      <BasicFormWrapper>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="Name">
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item name="username" label="Username">
            <Input placeholder="Enter username" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" placeholder="Enter email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Enter phone number" />
          </Form.Item>
          <Form.Item name="work_exp" label="Work Experience">
            <Input placeholder="Enter work experience" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
        </Form>
      </BasicFormWrapper>
    </Modal>
  );
};

// Component for client assignment modal
const AssignClientsModal = ({ visible, onCancel, onAssign, allUsers, loading }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      message.warning('Please select at least one client');
      return;
    }
    await onAssign(selectedUsers);
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => [...prev, userId]);
  };

  const handleUserDeselect = (userId) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <Modal title="Assign Clients" open={visible} onCancel={onCancel} onOk={handleAssign} confirmLoading={loading}>
      <Card>
        {loading ? (
          <div className="flex-center">
            <Loader2 className="animate-spin" size={32} style={{ color: 'gray' }} />
          </div>
        ) : (
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Search and select clients"
            mode="multiple"
            value={selectedUsers}
            optionFilterProp="children"
            onSelect={handleUserSelect}
            onDeselect={handleUserDeselect}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            {allUsers.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>
        )}
      </Card>
    </Modal>
  );
};

// Component for dietitian details modal
const DietitianDetailsModal = ({ visible, onCancel, dietitian, clients, loading }) => (
  <Modal
    title="Dietitian Details"
    open={visible}
    onCancel={onCancel}
    footer={[
      <Button key="close" onClick={onCancel}>
        Close
      </Button>,
    ]}
    width={800}
  >
    <Card bordered={false}>
      <Row align="middle" gutter={24}>
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Avatar size={128} src={dietitian?.profile || DUMMY_PROFILE_URL} />
          <Title level={4} style={{ marginTop: '1rem', textTransform:"capitalize" }}>
            {dietitian?.name}
          </Title>
        </Col>
        <Col xs={24} md={16}>
          <Paragraph>
            <strong>Qualifications:</strong> {dietitian?.qualification}
          </Paragraph>
          <Paragraph>
            <strong>Address:</strong> {dietitian?.address}
          </Paragraph>
          <Paragraph>
            <strong>PAN:</strong> {dietitian?.pan}
          </Paragraph>
          <Paragraph>
            <strong>Phone:</strong> {dietitian?.phone}
          </Paragraph>
          <Paragraph>
            <strong>Email:</strong> {dietitian?.email}
          </Paragraph>
          <Paragraph>
            <strong>Work Experience:</strong> {dietitian?.work_exp}
          </Paragraph>
        </Col>
        <Col xs={24}>
          <Title level={5} style={{ marginTop: '20px' }}>
            {!clients?.user?.length ? 'No clients assigned' : 'Assigned Clients'}
          </Title>
          {loading ? (
            <Skeleton active />
          ) : (
            clients?.user?.map((client, index) => (
              <Card key={client.id || index} size="small" style={{ marginBottom: '10px' }}>
                <Row gutter={16}>
                  <Col xs={12}>
                    <Paragraph style={{textTransform:"capitalize"}}>
                      <strong>Name:</strong> {client.name}
                    </Paragraph>
                    <Paragraph>
                      <strong>Phone:</strong> {client.phone}
                    </Paragraph>
                    <Paragraph>
                      <strong>Email:</strong> {client.email}
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Card>
  </Modal>
);

// Main component
const Dietitians = () => {
  const router = useHistory();
  const [filteredDietitians, setFilteredDietitians] = useState([]);
  const [selectedDietitian, setSelectedDietitian] = useState({});
  const [dietitianClients, setDietitianClients] = useState([]);

  // Modal states
  const [modals, setModals] = useState({
    details: false,
    update: false,
    assignClients: false,
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    clients: false,
    update: false,
    assign: false,
    delete: null, // stores the ID being deleted
  });

  const { allDietitians, loading, error, setError, fetchAllDietitians, updateDietitian, deleteDietitian } =
    useDietitianActions();

  const { allUsers, fetchNewUsers, assignClients } = useClientActions();

  // Fetch data on component mount
  useEffect(() => {
    fetchAllDietitians();
    fetchNewUsers();
  }, [fetchAllDietitians, fetchNewUsers]);

  // Fetch dietitian clients when selected dietitian changes
  useEffect(() => {
    const fetchDietitianClients = async () => {
      if (!selectedDietitian?.id) return;

      setLoadingStates((prev) => ({ ...prev, clients: true }));
      try {
        const res = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${selectedDietitian.id}`);
        if (res.status === 200) {
          setDietitianClients(res.data?.clients || {});
        }
      } catch (err) {
        console.error('Fetch clients error:', err);
        setError(err.message || 'Failed to fetch clients');
      } finally {
        setLoadingStates((prev) => ({ ...prev, clients: false }));
      }
    };

    fetchDietitianClients();
  }, [selectedDietitian, setError]);

  // Handlers
  const handleSearch = (value) => {
    if (!value) {
      setFilteredDietitians([]);
      return;
    }
    const filtered = allDietitians.filter((dietician) => dietician.id === value);
    setFilteredDietitians(filtered);
  };

  const handleModalToggle = (modalName, isOpen, dietitian = null) => {
    setModals((prev) => ({ ...prev, [modalName]: isOpen }));
    // if (dietitian) {
      setSelectedDietitian(dietitian);
    // }
  };

  const handleUpdate = async (id, updateData) => {
    setLoadingStates((prev) => ({ ...prev, update: true }));
    const success = await updateDietitian(id, updateData);
    setLoadingStates((prev) => ({ ...prev, update: false }));
    return success;
  };

  const handleDelete = async (id) => {
    setLoadingStates((prev) => ({ ...prev, delete: id }));
    await deleteDietitian(id);
    setLoadingStates((prev) => ({ ...prev, delete: null }));
  };

  const handleAssignClients = async (userIds) => {
    setLoadingStates((prev) => ({ ...prev, assign: true }));
    try {
      await assignClients(userIds, selectedDietitian.id);
      handleModalToggle('assignClients', false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStates((prev) => ({ ...prev, assign: false }));
    }
  };

  // Table configuration
  const columns = [
    {
      title: 'Dietitian',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex justify-start item-center gap">
          <figure>
            <img
              style={{ width: '40px', borderRadius: '4%' }}
              src={record.profile || DUMMY_PROFILE_URL}
              alt="Dietitian"
            />
          </figure>
          <figcaption style={{ fontWeight: 'bold' }}>
            <p>{record.originalName}</p>
          </figcaption>
        </div>
      ),
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
      render: (dateString) =>
        new Date(dateString).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      title: <div className="w-full text-center">Actions</div>,
      key: 'actions',
      width: '15%',
      render: (_, record) => {
        const dietitian = allDietitians.find((d) => d.id === record.key);
        return (
          <div className="flex justify-between item-center gap">
            <Button
              type="default"
              shape="circle"
              title="Assign Clients"
              style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
              onClick={() => handleModalToggle('assignClients', true, dietitian)}
            >
              <UserPlus2Icon size={16} />
            </Button>
            <Button
              type="default"
              shape="circle"
              title="View Details"
              style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
              onClick={() => handleModalToggle('details', true, dietitian)}
            >
              <EyeOpenIcon />
            </Button>
            {/* <Button
              type="default"
              shape="circle"
              title="Edit Dietitian"
              style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
              onClick={() => handleModalToggle('update', true, dietitian)}
            >
              {loadingStates.update ? <Loader2 className="animate-spin" size={16} /> : <Pencil2Icon />}
            </Button> */}
            <Button
              type="primary"
              danger
              shape="circle"
              title="Delete Dietitian"
              loading={loadingStates.delete === record.key}
              style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
              onClick={() => handleDelete(record.key)}
            >
              <TrashIcon />
            </Button>
          </div>
        );
      },
    },
  ];

  // Transform data for table
  const displayData = filteredDietitians.length > 0 ? filteredDietitians : allDietitians;
  const transformedData = displayData.map((dietician) => ({
    key: dietician.id,
    originalName: dietician.name,
    qualification: dietician.qualification,
    phone: dietician.phone,
    work_exp: dietician.work_exp,
    createdAt: dietician.createdAt,
    profile: dietician.profile,
  }));

  return (
    <>
      {/* Error Modal */}
      {error && (
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
          <div style={{ color: 'red' }}>{error}</div>
        </Modal>
      )}

      {/* Update Modal */}
      <UpdateDietitianModal
        visible={modals.update}
        onCancel={() => handleModalToggle('update', false)}
        onUpdate={handleUpdate}
        selectedDietitian={selectedDietitian}
        loading={loadingStates.update}
      />

      {/* Assign Clients Modal */}
      <AssignClientsModal
        visible={modals.assignClients}
        onCancel={() => handleModalToggle('assignClients', false)}
        onAssign={handleAssignClients}
        allUsers={allUsers}
        loading={loadingStates.assign}
      />

      {/* Details Modal */}
      <DietitianDetailsModal
        visible={modals.details}
        onCancel={() => handleModalToggle('details', false,null)}
        dietitian={selectedDietitian}
        clients={dietitianClients}
        loading={loadingStates.clients}
      />

      {/* Main Content */}
      <PageHeader title="Dietitians">
        <div className="flex justify-between item-center gap">
          <Select
            showSearch
            style={{ width: '100%', maxWidth: '20rem' }}
            placeholder="Search by Name"
            allowClear
            optionFilterProp="children"
            onChange={handleSearch}
            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          >
            {allDietitians.map((dietician) => (
              <Option key={dietician.id} value={dietician.id}>
                {dietician.name}
              </Option>
            ))}
          </Select>

          <Button type="primary" size="default">
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
              <Table columns={columns} dataSource={transformedData} pagination={{ pageSize: 10 }} rowKey="key" />
            </TableWrapper>
          )}
        </Card>
      </Main>
    </>
  );
};

export default Dietitians;
