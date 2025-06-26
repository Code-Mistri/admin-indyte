import React, { Suspense, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, Col, Modal, Row, Select, Skeleton, Table, Typography } from 'antd';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import PropTypes from 'prop-types';
import SearchUser from './overview/meals/SearchUser';
import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useWorkoutStatStore } from '../../zustand/workout-store';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllDieticiansState, useAllUserState } from '../../zustand/users-store';
import { getFormattedDate } from '../../utils/helper-functions';

const { Option } = Select;
export default function AllMealStats() {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // filters
  const [filterUserStats, setFilterUserStats] = useState([]);
  const [selUserId, setSelUserID] = useState();
  const [selRange, setSelRange] = useState();
  const [selStatus, setSelStatus] = useState();
  const [selDietitian, setSelDietitian] = useState();
  // main data
  const { allDietitians, setAllDieticians } = useAllDieticiansState();
  const { workoutsStats, setWorkoutsStat } = useWorkoutStatStore();
  const { allUsers, setAllUsers } = useAllUserState();
  useEffect(() => {
    setLoading(true);
    const fetchMealsStat = async () => {
      console.log('Fetching for page', currentPage);
      try {
        const response = await axios.get(`${API_ENDPOINT}/all-workout-stats?page=${currentPage}`);
        console.log({ response });
        if (response.status !== 200) {
          throw new Error('Try again');
        }
        const data = await response.data;
        console.log({ data });
        setWorkoutsStat(data.data);
        console.log('ASSINGED');
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMealsStat();
  }, [allUsers, currentPage]);
  useEffect(() => {
    setLoading(true);

    const fetchAllUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_ENDPOINT}/getallusers`);
        if (res.status === 200) {
          const data = await res.data;

          setAllUsers(data.users);
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const fetchAllDietitians = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${API_ENDPOINT}/getdiet`);
        if (res.status !== 200) {
          throw new Error('Could not retrieve data');
        }

        const data = await res.data;
        setAllDieticians(data.dieticians);
      } catch (err) {
        console.error({ err });
        setError('Something went wrong, try again');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDietitians();
    fetchAllUsers();
  }, []);
  console.log({ workoutsStats });

  useEffect(() => {
    setLoading(true);
    console.log('STARTING FILTER');
    try {
      if (!selRange || selRange.toLowerCase() === 'all') {
        const fUser = workoutsStats?.filter((item) => {
          console.log({ item }, item.userId === selUserId, { selUserId });
          if (selUserId) {
            return item.userId === selUserId;
          }
          return item;
        });
        console.log({ newFil: fUser });
        setFilterUserStats(fUser);
      } else if (selRange.toLowerCase() === 'today') {
        console.log('TODAY');
        const todaysMealStats = workoutsStats.filter((item) => {
          const today = getFormattedDate(new Date());
          const { date } = item;
          if (selUserId) {
            return date === today && item.userId === selUserId;
          }
          return date === today;
        });
        setFilterUserStats(todaysMealStats);
      } else if (selRange.toLowerCase() === 'week') {
        const week = workoutsStats.filter((item) => {
          const today = new Date();
          const weekago = new Date(today.setDate(today.getDate() - 7));
          const date = item?.date;
          if (selUserId) {
            return date >= weekago && item.userId === selUserId;
          }
          return date >= weekago;
        });
        setFilterUserStats(week);
      } else if (selRange.toLowerCase() === 'month') {
        const month = workoutsStats.filter((item) => {
          const today = new Date();
          const monthago = new Date(today.setMonth(today.getMonth() - 1));
          const date = item?.date;
          if (selUserId) {
            return date >= monthago && item.userId === selUserId;
          }
          return date >= monthago;
        });
        setFilterUserStats(month);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selUserId, selRange]);
  console.log({ selUserId });
  useEffect(() => {
    setLoading(true);

    if (!selStatus) return;
    if (selStatus === 'pending') {
      const logs = workoutsStats.filter((log) => {
        if (selUserId) {
          return log.finished === false && log.userId === selUserId;
        }

        return log.finished === false;
      });
      setFilterUserStats(logs);
    }
    if (selStatus === 'finished') {
      const logs = workoutsStats.filter((log) => {
        if (selUserId) {
          return log.finished === true && log.userId === selUserId;
        }
        return log.finished === true;
      });
      setFilterUserStats(logs);
    }
    setLoading(false);
  }, [selStatus]);
  useEffect(() => {
    setLoading(true);

    console.log({ selDietitian });
    if (!selDietitian) return;
    const logs = workoutsStats.filter((log) => {
      if (selUserId) {
        return log?.user?.dietician?.name === selDietitian && log.userId === selUserId;
      }
      return log?.user?.dietician?.name === selDietitian;
    });
    setFilterUserStats(logs);
    setLoading(false);
  }, [selDietitian]);

  const columns = [
    {
      title: 'Workout',
      dataIndex: ['workout', 'name'],
      key: 'workout',
    },
    {
      title: 'User',
      dataIndex: ['user', 'name'],
      key: 'name',
    },

    {
      title: 'Status',
      dataIndex: ['finished'],
      key: 'finished',
      render: (finished) => {
        console.log({ finished });
        return finished ? (
          <div style={{ fontWeight: 'bold', color: 'green' }}>Finished</div>
        ) : (
          <div style={{ fontWeight: 'bold', color: 'orange' }}>Pending</div>
        );
      },
    },
    {
      title: 'Assigned For',
      dataIndex: ['date'],
      key: 'date',
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      render: (date) => {
        const day = new Date(date);
        const options = { weekday: 'long' };
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
  ];

  console.log({ workoutsStats });
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
      <div>
        <MealsLog />
        <PageHeader
          className="header-boxed"
          ghost
          buttons={[
            <Select
              showSearch
              placeholder="Select User"
              optionFilterProp="children"
              listHeight={160}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              onSelect={(value) => {
                if (!value) {
                  setSelUserID(null);
                  return;
                }
                console.log('user selected', value);
                setSelUserID(value);
              }}
            >
              <Option value="" label="Select User">
                Select User
              </Option>
              {allUsers?.map((user) => (
                <Option value={user.id}>{user.name}</Option>
              ))}
            </Select>,
            <Select
              showSearch
              placeholder="Filter by range"
              optionFilterProp="children"
              listHeight={160}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              onSelect={(value) => {
                console.log('user selected range', value);

                setSelRange(value);
              }}
            >
              <Option value="today">Today</Option>
              <Option value="week">Last Week</Option>
              <Option value="month">Last Month</Option>
              <Option value="all">All</Option>
            </Select>,
            <Select
              showSearch
              placeholder="Filter by Status"
              optionFilterProp="children"
              listHeight={160}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              onSelect={(value) => {
                console.log('user selected status', value);

                setSelStatus(value);
              }}
            >
              <Option value="pending">Pending</Option>
              <Option value="finished">Finished</Option>
            </Select>,
            <Select
              showSearch
              placeholder="Filter by Dietitian"
              optionFilterProp="children"
              listHeight={160}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              onSelect={(value) => {
                console.log('user selected dietitian', value);
                setSelDietitian(value);
              }}
            >
              <Option>Select Dietitian</Option>
              {allDietitians.map((dietician) => (
                <Option key={dietician.id} value={dietician?.name}>
                  {dietician?.name}
                </Option>
              ))}
            </Select>,
          ]}
        />
        <Main className="grid-boxed">
          <Row gutter={{ xs: 2, sm: 4, md: 8, lg: 12 }}>
            <Col span={24}>
              <div className="table-bordered meal-update-table full-width-table table-responsive ">
                {console.log({ filterUserStats })}
                {loading ? (
                  <Card bordered={false} style={{ padding: '2rem' }}>
                    <Skeleton active />
                    <Skeleton active />
                  </Card>
                ) : (
                  <>
                    <Table
                      columns={columns}
                      dataSource={
                        filterUserStats.length >= 1 || selUserId || selDietitian || selRange || selStatus
                          ? filterUserStats
                          : workoutsStats
                      }
                      // dataSource={workoutsStats}
                      pagination={false}
                    />
                    <div className="flex justify-end item-center " style={{ marginTop: '0.5rem' }}>
                      <div className="flex justify-between item-center gap-less">
                        <Button
                          onClick={() => {
                            setCurrentPage(currentPage - 1);
                          }}
                        >
                          <ChevronLeft />
                        </Button>
                        <Button
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                          }}
                        >
                          <ChevronRight />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Main>
      </div>
    </>
  );
}

export const FilterMealsOPtions = () => {};

export const MealsLog = () => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [statData, setStatData] = useState({
    totalWorkouts: 0,
    finishedWorkouts: 0,
    notFinishedWorkouts: 0,
  });
  useEffect(() => {
    setLoading(true);
    const fetchStat = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINT}/workout-stats`);
        if (res.status !== 200) {
          throw new Error('Could not find relevnat data');
        }
        const data = await res.data.data;
        setStatData(data?.workoutStats);
      } catch (err) {
        console.log({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStat();
  }, []);
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
      <div className="flex justify-between item-center gap py-1 px-4 w-full" style={{ marginTop: '2rem' }}>
        {loading ? (
          <>
            <Card className="w-full ">
              <Skeleton />
            </Card>
            <Card className="w-full ">
              <Skeleton />
            </Card>
            <Card className="w-full ">
              <Skeleton />
            </Card>
          </>
        ) : (
          <>
            <Card className="w-full ">
              <div className="flex justify-start item-center gap">
                <p style={{ fontWeight: '700', color: 'blue', fontSize: '1rem' }}>Total Workouts Assigned</p>{' '}
                <p>{statData.totalWorkouts}</p>
              </div>
            </Card>
            <Card className="w-full ">
              <div className="flex justify-start item-center gap">
                <p style={{ fontWeight: '700', color: 'orange ', fontSize: '1rem' }}>Pending Workouts</p>{' '}
                <p>{statData.notFinishedWorkouts}</p>
              </div>
            </Card>

            <Card className="w-full ">
              <div className="flex justify-start item-center gap">
                <p style={{ fontWeight: '700', color: 'green', fontSize: '1rem' }}>Finshed Workouts</p>{' '}
                <p>{statData.finishedWorkouts}</p>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
};
