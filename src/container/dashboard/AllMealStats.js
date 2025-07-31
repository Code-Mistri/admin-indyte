/* eslint-disable react/prop-types */
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Card, Col, Modal, Row, Select, Skeleton, Table, Typography, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import SearchUser from './overview/meals/SearchUser';
import MealDetailsModal from './MealDetailsModal'; // Import the new modal component
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useMealStatStore, useMealStore } from '../../zustand/meal-store';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllDieticiansState, useAllUserState } from '../../zustand/users-store';
import { decryptData, getFormattedDate } from '../../utils/helper-functions';
import { api } from '../../utils/axios-util';

const { Option } = Select;

export default function AllMealStats() {
  const { role, id } = useSelector((state) => {
    return {
      role: state.auth.role,
      id: state.auth.id,
    };
  });

  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [statData, setStatData] = useState({
    totalMeals: 0,
    finishedMeals: 0,
    notFinishedMeals: 0,
  });

  // Modal states
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDetailsVisible, setMealDetailsVisible] = useState(false);

  // filters
  const [selUserId, setSelUserID] = useState();
  const [selRange, setSelRange] = useState();
  const [selStatus, setSelStatus] = useState();
  const [selDietitian, setSelDietitian] = useState();

  // main data
  const { allDietitians, setAllDieticians } = useAllDieticiansState();
  const { mealsStats, setMealsStat } = useMealStatStore();
  const { allUsers, setAllUsers } = useAllUserState();

  // Build query parameters for API call
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('perPage', perPage.toString());

    if (selUserId) params.append('userId', selUserId.toString());
    if (selDietitian) {
      // Find dietician ID by name
      // const dietician = allDietitians.find(d => d.name === selDietitian);
      // if (dietician) 
        params.append('dieticianId', selDietitian);
      }
    if (selStatus) {
      const statusValue = selStatus === 'pending' ? 'unfinished' : selStatus;
      params.append('status', statusValue);
    }
    if (selRange && selRange !== 'all') {
      params.append('dateRange', selRange);
    }

    return params.toString();
  }, [currentPage, perPage, selUserId, selDietitian, selStatus, selRange, allDietitians]);

  // Fetch meals stats with filters
  const fetchMealsStat = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = buildQueryParams();
      const response = await api.get(`/all-meal-stats?${queryParams}`);
      
      if (response.status !== 200) {
        throw new Error('Try again');
      }
      
      const {data} = response;
      
      setMealsStat(data.data);
      setStatData(data.stats);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, setMealsStat]);

  const fetchAllUsers = useCallback(async () => {
    try {
      let res;
      let data;
      if (userRole === 'dietician') {
        res = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${id}`);
        if (res.status !== 200) {
          throw new Error('Could not get users');
        }
        data = res.data?.clients?.user;
      } else {
        res = await axios.get(`${API_ENDPOINT}/getallusers`);
        if (res.status !== 200) {
          throw new Error('Could not get users');
        }
        data = res.data?.users;
      }
      setAllUsers(data);
    } catch (err) {
      console.error({ err });
      setError(err.message);
    }
  }, [userRole, id, setAllUsers]);

  const fetchAllDietitians = useCallback(async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/getdiet`);
      if (res.status !== 200) {
        throw new Error('Could not retrieve data');
      }
      const {data} = res;
      setAllDieticians(data.dieticians);
    } catch (err) {
      console.error({ err });
      setError('Something went wrong, try again');
    }
  }, [setAllDieticians]);

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAllDietitians(),
          fetchAllUsers(),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [fetchAllDietitians, fetchAllUsers]);

  // Fetch meals data when filters or pagination change
  useEffect(() => {
    if (allDietitians.length > 0) { // Wait until dietitians are loaded
      fetchMealsStat();
    }
  }, [fetchMealsStat, allDietitians.length]);

  // Handle filter changes - reset to page 1
  const handleFilterChange = useCallback((filterType, value) => {
    setCurrentPage(1);
    
    switch (filterType) {
      case 'user':
        setSelUserID(value);
        break;
      case 'range':
        setSelRange(value);
        break;
      case 'status':
        setSelStatus(value);
        break;
      case 'dietitian':
        setSelDietitian(value);
        break;
      default:
        break;
    }
  }, []);

  // Handle pagination change
  const handleTableChange = (paginationInfo) => {
    setCurrentPage(paginationInfo.current);
    setPerPage(paginationInfo.pageSize);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelUserID(null);
    setSelRange(null);
    setSelStatus(null);
    setSelDietitian(null);
    setCurrentPage(1);
  };

  // Handle meal details modal
  const handleShowMealDetails = (record) => {
    setSelectedMeal(record);
    setMealDetailsVisible(true);
  };

  const handleCloseMealDetails = () => {
    setMealDetailsVisible(false);
    setSelectedMeal(null);
  };

  const columns = [
    {
      title: 'Meal',
      dataIndex: ['meal', 'imgUrl'],
      key: 'meal',
      render: (meal, record) => {
        const imageUrl =
          record?.imgUrl ||
          record?.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D';
  
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={imageUrl}
              alt={record?.meal?.name || 'Meal Image'}
              style={{
                width: '50px',
                height: '50px',
                marginRight: '10px',
                borderRadius: '15px',
                objectFit: 'cover',
              }}
            />
            <span>{record?.meal?.name || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'mealTime',
      key: 'mealTime',
    },
    {
      title: 'Status',
      dataIndex: 'finished',
      key: 'finished',
      render: (finished) => {
        return finished ? (
          <div style={{ fontWeight: 'bold', color: 'green' }}>Finished</div>
        ) : (
          <div style={{ fontWeight: 'bold', color: 'orange' }}>Pending</div>
        );
      },
    },
    {
      title: 'Assigned For',
      dataIndex: 'date',
      key: 'date',
      render: (date) => {
        const day = new Date(date);
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        return day.toLocaleDateString('en-IN', options);
      },
    },
    {
      title: 'Dietitian',
      dataIndex: ['user', 'dietician', 'name'],
      key: 'dietitian',
      render: (dietitian) => {
        return dietitian || 'NA';
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={() => handleShowMealDetails(record)}
          style={{ 
            color: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px'
          }}
          title="View meal details"
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
      {error && (
        <Modal open={!!error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      <div>
      <MealsLog stats={statData} loading={loading} />
      <PageHeader
          className="header-boxed"
          ghost
          buttons={[
            <Select
              key="user-select"
              showSearch
              placeholder="Select User"
              optionFilterProp="children"
              listHeight={160}
              value={selUserId}
              allowClear
              filterOption={(input, option) => 
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={(value) => handleFilterChange('user', value)}
              onClear={() => handleFilterChange('user', null)}
            >
              {allUsers?.map((user) => (
                <Option key={user.id} value={user.id}>{user.name}</Option>
              ))}
            </Select>,
            <Select
              key="range-select"
              showSearch
              placeholder="Filter by range"
              optionFilterProp="children"
              listHeight={160}
              value={selRange}
              allowClear
              filterOption={(input, option) => 
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={(value) => handleFilterChange('range', value)}
              onClear={() => handleFilterChange('range', null)}
            >
              <Option value="today">Today</Option>
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
              <Option value="year">Last Year</Option>
              <Option value="all">All</Option>
            </Select>,
            <Select
              key="status-select"
              showSearch
              placeholder="Filter by Status"
              optionFilterProp="children"
              listHeight={160}
              value={selStatus}
              allowClear
              filterOption={(input, option) => 
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={(value) => handleFilterChange('status', value)}
              onClear={() => handleFilterChange('status', null)}
            >
              <Option value="pending">Pending</Option>
              <Option value="finished">Finished</Option>
            </Select>,
           ...(userRole !== 'dietician' ? [
            <Select
              key="dietitian-select"
              showSearch
              placeholder="Filter by Dietitian"
              optionFilterProp="children"
              listHeight={160}
              value={selDietitian}
              allowClear
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onSelect={(value) => handleFilterChange('dietitian', value)}
              onClear={() => handleFilterChange('dietitian', null)}
            >
              {allDietitians.map((dietician) => (
                <Option key={dietician.id} value={dietician.id}>
                  {dietician.name}
                </Option>
              ))}
            </Select>
          ] : []),
            // eslint-disable-next-line react/button-has-type
            <button 
              key="clear-filters"
              onClick={clearFilters}
              style={{ 
                padding: '4px 15px', 
                backgroundColor: '#f0f0f0', 
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          ]}
        />
        <Main className="grid-boxed">
          <Row gutter={{ xs: 2, sm: 4, md: 8, lg: 12 }}>
            <Col span={24}>
              <div className="table-bordered meal-update-table full-width-table table-responsive">
                {loading ? (
                  <Card bordered={false} style={{ padding: '2rem' }}>
                    <Skeleton active />
                    <Skeleton active />
                  </Card>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={mealsStats}
                    pagination={{
                      current: pagination.currentPage,
                      pageSize: pagination.perPage,
                      total: pagination.totalCount,
                      showTotal: (total, range) => 
                        `${range[0]}-${range[1]} of ${total} items`,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    rowKey={(record) => `${record.userId}-${record.mealId}-${record.date}`}
                  />
                )}
              </div>
            </Col>
          </Row>
        </Main>

        {/* Meal Details Modal */}
        <MealDetailsModal
          visible={mealDetailsVisible}
          onClose={handleCloseMealDetails}
          mealData={selectedMeal}
        />
      </div>
    </>
  );
}

export const FilterMealsOPtions = () => {};

// eslint-disable-next-line react/prop-types
export const MealsLog = ({ stats, loading }) => {
  return (
    <div className="flex justify-between item-center gap py-1 px-4 w-full" style={{ marginTop: '2rem' }}>
      {loading ? (
        <>
          <Card className="w-full">
            <Skeleton />
          </Card>
          <Card className="w-full">
            <Skeleton />
          </Card>
          <Card className="w-full">
            <Skeleton />
          </Card>
        </>
      ) : (
        <>
          <Card className="w-full">
            <div className="flex justify-start item-center gap">
              <p style={{ fontWeight: '700', color: 'blue', fontSize: '1rem' }}>Total Meals Assigned</p>
              <p>{stats?.totalMeals || 0}</p>
            </div>
          </Card>
          <Card className="w-full">
            <div className="flex justify-start item-center gap">
              <p style={{ fontWeight: '700', color: 'orange', fontSize: '1rem' }}>Pending Meals</p>
              <p>{stats?.notFinishedMeals || 0}</p>
            </div>
          </Card>
          <Card className="w-full">
            <div className="flex justify-start item-center gap">
              <p style={{ fontWeight: '700', color: 'green', fontSize: '1rem' }}>Finished Meals</p>
              <p>{stats?.finishedMeals || 0}</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};