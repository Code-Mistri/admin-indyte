import { Avatar, Button, Card, Col, Modal, Row, Select, Skeleton, Table, Typography, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { API_ENDPOINT } from '../../utils/endpoints';
import { Main, TableWrapper } from '../styled';
import { UserTableStyleWrapper } from '../pages/style';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useSeletedUser } from '../../zustand/users-store';
import { DUMMY_PROFILE_URL } from '../../constant';

const { Option } = Select;
const { Search } = Input;

export default function Users() {
  const router = useHistory();
  const [error, setError] = useState(null);
  const [sucess, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    gender: null,
    subscription: null,
    fromZoho: null
  });
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
        setFilteredUsers(data.users);
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Client-side filtering and searching
  const applyFiltersAndSearch = (users, searchValue, filterValues) => {
    let result = [...users];

    // Apply search filter
    if (searchValue) {
      result = result.filter(user => 
        user.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.goal?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply gender filter
    if (filterValues.gender) {
      result = result.filter(user => 
        user.gender?.toLowerCase() === filterValues.gender.toLowerCase()
      );
    }

    // Apply subscription filter
    if (filterValues.subscription) {
      result = result.filter(user => 
        user.subscription?.toLowerCase() === filterValues.subscription.toLowerCase()
      );
    }

    // Apply fromZoho filter
    if (filterValues.fromZoho !== '') {
      result = result.filter(user => 
        Boolean(user.fromZoho) === Boolean(filterValues.fromZoho)
      );
    }

    return result;
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = applyFiltersAndSearch(allUsers, value, filters);
    setFilteredUsers(filtered);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const filtered = applyFiltersAndSearch(allUsers, searchText, newFilters);
    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setFilters({ gender: '', subscription: '', fromZoho: '' });
    setSelectedUser(null);
    setFilteredUsers(allUsers);
  };

  // Client-side table filtering and sorting
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
  });

  console.log({ allUsers, filteredUsers });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name),
      ...getColumnSearchProps('name'),
      render: (name, record) => (
        <div className="flex justify-start item-center gap-less">
          <Avatar size={48} src={record?.profile || DUMMY_PROFILE_URL} alt={name} />
          <span style={{ marginLeft: 8 }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email?.localeCompare(b.email),
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      sorter: (a, b) => a.gender?.localeCompare(b.gender),
      filters: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
        { text: 'Other', value: 'other' },
      ],
      onFilter: (value, record) => record.gender?.toLowerCase() === value.toLowerCase(),
      render: (gender) => (
        <span style={{ textTransform: 'capitalize' }}>{gender}</span>
      ),
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      key: 'subscription',
      sorter: (a, b) => a.subscription?.localeCompare(b.subscription),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Blocked', value: 'blocked' },
      ],
      onFilter: (value, record) => record.subscription?.toLowerCase() === value.toLowerCase(),
      render: (subscription) => {
        const status = subscription || 'active';
        return <span className={`status-text ${status}`}>{status}</span>;
      },
    },
    {
      title: 'Goal',
      dataIndex: 'goal',
      key: 'goal',
      sorter: (a, b) => a.goal?.localeCompare(b.goal),
      ...getColumnSearchProps('goal'),
    },
    {
      title: 'From Zoho',
      dataIndex: 'fromZoho',
      key: 'fromZoho',
      sorter: (a, b) => {
        const aVal = Boolean(a.fromZoho);
        const bVal = Boolean(b.fromZoho);
        return aVal === bVal ? 0 : aVal ? 1 : -1;
      },
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => Boolean(record.fromZoho) === Boolean(value),
      render: (fromZoho) => (
        <Tag color={fromZoho ? 'green' : 'red'}>
          {fromZoho ? 'Yes' : 'No'}
        </Tag>
      ),
    },
    {
      title: 'View Detail',
      dataIndex: 'id',
      key: 'id',
      render: (id, record) => {
        return (
          <Button
            onClick={() => {
              console.log({ view: record });
              setUser(record);
              router.push(`/admin/users/${record.id}`);
            }}
            type="dashed"
          >
            view
          </Button>
        );
      },
    },
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
        subTitle={loading ? <Skeleton active /> : <span className="title-counter">{filteredUsers.length} Users </span>}
        buttons={[
          <Select
          key="user-select"
          showSearch
          style={{ width: '200px' }}
          placeholder="Select User"
          optionFilterProp="children"
          value={selectedUser?.id}
          onChange={(item) => {
            const user = filteredUsers.find((usr) => usr.id === item);
            setSelectedUser(user);
          }}
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          allowClear
        >
          {filteredUsers.map((user) => (
            <Option key={user.id} value={user.id} label={user.name}>
              {user.name}
            </Option>
          ))}
        </Select>,
          <Select
            key="gender-filter"
            placeholder="Filter by Gender"
            style={{ width: '150px', marginRight: '10px' }}
            value={filters.gender}
            onChange={(value) => handleFilterChange('gender', value)}
            allowClear
          >
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>,
         
          <Select
            key="zoho-filter"
            placeholder="From Zoho"
            style={{ width: '120px', marginRight: '10px' }}
            value={filters.fromZoho}
            onChange={(value) => handleFilterChange('fromZoho', value)}
            allowClear
          >
            <Option value>Yes</Option>
            <Option value={false}>No</Option>
          </Select>,
          <Button 
            key="clear-filters"
            onClick={clearFilters}
            style={{ marginRight: '10px' }}
          >
            Clear Filters
          </Button>
        
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
                    dataSource={selectedUser ? [selectedUser] : filteredUsers}
                    pagination={{ 
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                      pageSizeOptions: ['10', '25', '50', '100']
                    }}
                    showSorterTooltip={false}
                    scroll={{ x: 'max-content' }}
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