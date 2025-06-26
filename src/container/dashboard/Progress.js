import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom/';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Table,
  Typography,
} from 'antd';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { BedIcon, DropletIcon, DumbbellIcon, FootprintsIcon, LeafyGreenIcon, Loader2 } from 'lucide-react';
import { Liquid } from '@ant-design/plots';
import ProgressBar from './overview/progress/ProgressMeter';
import { PageHeader } from '../../components/page-headers/page-headers';
import { BasicFormWrapper, Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { decryptData, getFormattedDate } from '../../utils/helper-functions';
import { api } from '../../utils/axios-util';

// eslint-disable-next-line react/prop-types
const ProgressBarCard = ({ title, target = 0, completed = 0, active }) => {
  let percentage = 0;
  if (completed && target) {
    percentage = (Number(completed) / Number(target)) * 100;
  }
  return (
    <Card title={title} style={{ width: '100%', margin: '', display: active ? 'block' : 'none' }}>
      <Progress percent={percentage.toFixed(2)} strokeColor="#1890ff" strokeWidth="2rem" />
    </Card>
  );
};

//  =====

const { Option } = Select;
export default function WaterProgress() {
  const { role } = useSelector((state) => {
    return {
      role: state.auth.role,
    };
  });
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const [waterLoading, setWaterLoading] = useState(false);
  const [sleepLoading, setSleepLoading] = useState(false);
  const [workoutLoading, setWorkoutLoading] = useState(false);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('water');
  const [userWorkoutlogs, setWorkoutlogs] = useState();

  const [usersProfile, setUsersProfile] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userWaterIntake, setUserWaterIntake] = useState(null);
  const [userSleepLog, setUserSleepLog] = useState(null);
  const [userStepsLog, setUserStepsLog] = useState(null);
  const [userCaloriesIntake, setUserCaloriesIntake] = useState(null);
  const [reportBasis, setReportBasis] = useState('daily');
  const [waterForm] = Form.useForm();
  const [stepsForm] = Form.useForm();
  const [sleepForm] = Form.useForm();
  const [calForm] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    async function fetchAllUserGoals() {
      try {
        const userId = Cookies.get('userid');

        let res;
        let data;
        console.log({ mypage: userRole });
        if (userRole === 'dietician') {
          res = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${userId}`);
          console.log({ res });
          if (res.status !== 200) {
            throw new Error('Could not get users');
          }
          data = await res.data?.clients?.user;
        } else {
          res = await axios.get(`${API_ENDPOINT}/getallusers`);
          if (res.status !== 200) {
            throw new Error('Could not get users');
          }
          data = await res.data?.users;
        }
        if (data) {
          setUsersProfile(data);
        } else {
          throw new Error('No Users Found');
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllUserGoals();
  }, []);
  useEffect(() => {
    async function fetchUserWaterIntake() {
      setWaterLoading(true);
      const date = getFormattedDate(new Date());
      try {
        let res;
        let data;
        if (reportBasis === 'weekly') {
          res = await axios.get(`${API_ENDPOINT}/getlastweekwaterprogress?userId=${selectedUser?.id}`);
          if (res.status === 404) {
            throw new Error('Ahh! user does not have water progress data for last week');
          }
          data = await res.data?.data;
        } else if (reportBasis === 'monthly') {
          console.log('LAST MONTH');
          res = await axios.get(`${API_ENDPOINT}/getlastmonthwaterprogress?userId=${selectedUser?.id}`);
          if (res.status === 404) {
            throw new Error('Ahh! user does not have water progress data for this month');
          }
          console.log({ lastwater: res });
          data = await res.data?.data;
        } else {
          res = await axios.get(`${API_ENDPOINT}/water-logs/${selectedUser?.id}/${date}`);
          data = await res.data;
          if (res.status === 404) {
            throw new Error('Ahh! user does not have water any progress data for today');
          }
        }
        console.log({ water: res });
        if (res.status !== 200 && res.status !== 404) {
          throw new Error('Request error');
        }
        setUserWaterIntake(data);
        console.log({ data });
        return res;
      } catch (err) {
        console.error({ err });
        // setError(err.message);
      } finally {
        setWaterLoading(false);
      }
    }
    async function fetchUserSleepIntake() {
      setSleepLoading(true);

      const date = getFormattedDate(new Date());
      try {
        let res;
        let data;
        if (reportBasis === 'weekly') {
          res = await axios.get(`${API_ENDPOINT}/getlastweeksleepprogress?userId=${selectedUser?.id}`);
          console.log({ water1: res });
          if (res.status === 404) {
            throw new Error('Ahh! user does not have sleep progress data for last week');
          }
          data = await res.data?.data;
        } else if (reportBasis === 'monthly') {
          res = await axios.get(`${API_ENDPOINT}/getlastmonthsleepprogress?userId=${selectedUser?.id}`);
          console.log({ water2: res });
          if (res.status === 404) {
            throw new Error('Ahh! user does not have sleep progress data for last month');
          }
          data = await res.data?.data;
        } else {
          const res = await axios.get(`${API_ENDPOINT}/sleep-logs/${selectedUser?.id}/${date}`);
          console.log({ water3: res });
          if (res.status === 404) {
            throw new Error('Ahh! user does not have water progress data for today');
          }
          data = await res.data;
        }
        console.log({ sleep: res });
        if (res.status !== 200 && res.status !== 404) {
          throw new Error('Request error');
        }
        setUserSleepLog(data);
        console.log({ sleep: data });
        return data;
      } catch (err) {
        console.error({ err });
        // setError(err.message);
      } finally {
        setSleepLoading(false);
      }
    }
    async function fetchUserStepsLog() {
      setStepsLoading(true);

      const date = getFormattedDate(new Date());
      try {
        const res = await axios.get(`${API_ENDPOINT}/steps-logs/${selectedUser?.id}/${date}`);
        console.log({ res });
        if (res.status !== 200 && res.status !== 404) {
          throw new Error('Request error');
        }
        const data = await res.data;
        setUserStepsLog(data);
        console.log({ steps: data });
      } catch (err) {
        console.error({ err });
        // setError(err.message);
      } finally {
        setStepsLoading(false);
      }
    }
    async function fetchUserCaloriesIntake() {
      setCalLoading(true);

      const date = getFormattedDate(new Date());
      try {
        const res = await api.get(
          `getusermealprogress/${selectedUser?.id}?date=${reportBasis === 'daily' ? date : reportBasis}`,
        );
        if (res.status !== 200 && res.status !== 404) {
          throw new Error('Request error');
        }
        if (res.status === 404) {
          throw new Error(
            `Ahh! user does not have diet progress data for ${reportBasis === 'daily' ? 'today' : reportBasis}`,
          );
        }
        const data = await res.data.data;
        setUserCaloriesIntake(data);
        console.log({ data });
      } catch (err) {
        console.error({ err });
        // setError(err.message);
      } finally {
        setCalLoading(false);
      }
    }
    async function getWorkoutLogs() {
      const date = getFormattedDate(new Date());
      setWorkoutLoading(true);
      try {
        const res = await api.get(
          `getuserworkoutprogress/${selectedUser?.id}?date=${reportBasis === 'daily' ? date : reportBasis}`,
        );
        console.log('Its not working work');
        console.log({ workoutres: res });
        if (res.status === 404 || res.status === 400) {
          throw new Error(
            `Ahh! user does not have workout progress data for ${reportBasis === 'daily' ? 'today' : reportBasis}`,
          );
        }
        if (res.status !== 200 && res.status !== 404) {
          throw new Error('Request error');
        }
        const data = await res.data.data;
        setWorkoutlogs(data);
        console.log({ workout: data });
        return data;
      } catch (err) {
        console.error({ workouterr: err });
        setError(err.message);
      } finally {
        setWorkoutLoading(false);
      }
    }
    fetchUserWaterIntake().then((wtaerrr) => console.log('water fetched', { wtaerrr }));
    fetchUserSleepIntake().then((data) => console.log({ sleepD: data }));
    // fetchUserStepsLog();
    fetchUserCaloriesIntake();
    getWorkoutLogs().then(() => console.log('workout fetcjed'));
  }, [selectedUser, reportBasis]);

  console.log(
    '=====',
    { userCaloriesIntake },
    { userSleepLog },
    { userWaterIntake },
    { selectedUser },
    { userWorkoutlogs },
  );
  return (
    <>
      {error && selectedUser && (
        <Modal open={error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      {success && (
        <Modal open={success} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}>Assigned Successfully</Typography>
          </Card>
        </Modal>
      )}
      {/* {logsModel && (
        <Modal
          open={logsModel}
          onOk={() => setLogsModel(null)}
          onCancel={() => setLogsModel(null)}
          style={{ minWidth: '60vw' }}
        >
         
        </Modal>
      )} */}

      <PageHeader
        title={
          <>
            <div className="p-1 w-full">
              <Select
                showSearch
                style={{ width: '100%', maxWidth: '20rem', minWidth: '16rem', marginBottom: '0.5rem' }}
                placeholder="Search by Name"
                optionFilterProp="children"
                onChange={(item) => {
                  const user = usersProfile.find((usr) => usr.id === item);
                  if (!user) {
                    setError('Something went wrong');
                    return;
                  }
                  setSelectedUser(user);
                }}
                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              >
                <Option>Select User</Option>
                {usersProfile.map((user) => (
                  <Option key={user.id} value={user.id} label={user.name}>
                    {user.name}
                  </Option>
                ))}
              </Select>
              {selectedUser && (
                <div className="flex justify-start gap-less item-center">
                  <Button type={activePage === 'water' ? 'primary' : 'default'} onClick={() => setActivePage('water')}>
                    Water
                  </Button>
                 {/* <Button
                   type={activePage === 'workout' ? 'primary' : 'default'}
                    onClick={() => setActivePage('workout')}
                  >
                    Workout
                  </Button>
                  <Button type={activePage === 'diet' ? 'primary' : 'default'} onClick={() => setActivePage('diet')}>
                    Diet
                  </Button>
                  <Button type={activePage === 'sleep' ? 'primary' : 'default'} onClick={() => setActivePage('sleep')}>
                    Sleep
                  </Button> */}
                </div>
              )}
            </div>
          </>
        }
        buttons={[
          selectedUser && (
            <Select
              showSearch
              style={{ width: '100%', maxWidth: '20rem', minWidth: '16rem', marginLeft: '8px' }}
              placeholder="Filter"
              optionFilterProp="children"
              onChange={(item) => {
                setReportBasis(item);
                console.log({ item, reportBasis });
              }}
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
            >
              <Option value="daily" label="Today">
                Today
              </Option>
              <Option value="weekly" label="Weekly">
                Weekly
              </Option>
              <Option value="monthly" label="Monthly">
                Monthly
              </Option>
            </Select>
          ),
        ]}
      />
      {!selectedUser?.id ? (
        <Card className="w-full h-full flex-center" style={{ margin: '2rem', fontSize: '2rem', fontWeight: 'bold' }}>
          Select a user
        </Card>
      ) : (
        <Main>
          {activePage === 'water' && (
            <>
              {waterLoading ? (
                <Skeleton className="w-full h-full" active />
              ) : (
                <>
                  <ProgressBarCard
                    title={
                      <div className="flex justify-start item-center gap w-full font-bold">
                        <div className="drop-pad" style={{ backgroundColor: '#387ADF' }}>
                          <DropletIcon size={24} style={{ color: 'white' }} />
                        </div>
                        <p>WATER</p>
                      </div>
                    }
                    completed={
                      reportBasis === 'daily' ? userWaterIntake?.totalAmount : userWaterIntake?.totalWaterDrunk
                    }
                    target={selectedUser?.water_target}
                    active
                  />

                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard title="Target" value={selectedUser?.water_target} color="#1890ff" />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Drank"
                        value={
                          reportBasis === 'daily' ? userWaterIntake?.totalAmount : userWaterIntake?.totalWaterDrunk
                        }
                        color="#108ee9"
                      />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Left"
                        value={
                          Number(selectedUser?.water_target || 0) -
                          Number(
                            reportBasis === 'daily'
                              ? userWaterIntake?.totalAmount || 0
                              : userWaterIntake?.totalWaterDrunk || 0,
                          )
                        }
                        color="#007bff"
                      />
                    </Col>
                  </Row>
                  {reportBasis === 'daily' && userWaterIntake?.waterIntakes && (
                    <Collapse>
                      <Collapse.Panel header="History">
                        {userWaterIntake?.waterIntakes.map((intake) => (
                          <Card bordered={false} style={{ color: 'black' }}>
                            <div className="flex justify-between item-center">
                              <p className="font-bold text-md">Date</p>
                              <p className="font-bold text-md">Amount</p>
                            </div>
                            <div className="flex justify-between item-center">
                              <p className="font-bold text-md">{getFormattedDate(new Date(intake.recordedAt))}</p>
                              <p className="font-bold text-md">{intake.amount} ml</p>
                            </div>
                          </Card>
                        ))}
                      </Collapse.Panel>
                    </Collapse>
                  )}
                </>
              )}
            </>
          )}
          {activePage === 'sleep' && (
            <>
              {sleepLoading ? (
                <Skeleton className="w-full h-full" active />
              ) : (
                <>
                  <ProgressBarCard
                    title={
                      <div className="flex justify-start item-center gap w-full font-bold">
                        <div className="drop-pad" style={{ backgroundColor: '#0C134F' }}>
                          <BedIcon size={24} style={{ color: 'white' }} />
                        </div>
                        <p>SLEEP</p>
                      </div>
                    }
                    completed={userSleepLog?.totalSleepMinutes}
                    target={selectedUser?.sleep_target}
                    active
                  />

                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard title="Taget Hours" value={selectedUser.sleep_target || 0} color="#1890ff" />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard title="Slept" value={userSleepLog?.totalSleepMinutes || 0} color="#108ee9" />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="More to go"
                        value={Number(selectedUser.sleep_target || 0) - Number(userSleepLog?.totalSleepMinutes || 0)}
                        color="#007bff"
                      />
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
          {activePage === 'diet' && (
            <>
              {calLoading ? (
                <Skeleton className="w-full h-full" active />
              ) : (
                <>
                  <ProgressBarCard
                    title={
                      <div className="flex justify-start item-center gap w-full font-bold">
                        <div className="drop-pad" style={{ backgroundColor: '#65B741' }}>
                          <LeafyGreenIcon size={24} style={{ color: 'white' }} />
                        </div>
                        <p>Diet</p>
                      </div>
                    }
                    completed={userCaloriesIntake?.takenCalories}
                    target={userCaloriesIntake?.targetCalories}
                    active
                  />

                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Target"
                        value={
                          Number(userCaloriesIntake?.takenCalories || 0) +
                          Number(userCaloriesIntake?.targetCalories || 0)
                        }
                        units="cal"
                        color="#1890ff"
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Consumed"
                        value={userCaloriesIntake?.takenCalories || 0}
                        units="cal"
                        color="#108ee9"
                      />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Left"
                        value={userCaloriesIntake?.targetCalories || 0}
                        units="cal"
                        color="#007bff"
                      />
                    </Col>
                  </Row>

                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard title="Total Meals" value={userCaloriesIntake?.total || 0} units="" color="#1890ff" />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Meals Eaten"
                        value={userCaloriesIntake?.completed || 0}
                        units=""
                        color="#108ee9"
                      />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Meals Skipped"
                        value={userCaloriesIntake?.skipped || 0}
                        units=""
                        color="#007bff"
                      />
                    </Col>
                  </Row>
                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={6}>
                      <ValueCard
                        title="Breakfast"
                        value={userCaloriesIntake?.caloriesCount?.breakfast || 0}
                        units="cal"
                        color="#1890ff"
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <ValueCard
                        title="Lunch"
                        value={userCaloriesIntake?.caloriesCount?.lunch || 0}
                        units="cal"
                        color="#108ee9"
                      />
                    </Col>

                    <Col xs={24} md={6}>
                      <ValueCard
                        t
                        title="Dinner"
                        value={userCaloriesIntake?.caloriesCount?.dinner || 0}
                        units="cal"
                        color="#007bff"
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <ValueCard
                        t
                        title="Other"
                        value={userCaloriesIntake?.caloriesCount?.other || 0}
                        units="cal"
                        color="#007bff"
                      />
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
          {activePage === 'workout' && (
            <>
              {calLoading ? (
                <Skeleton className="w-full h-full" active />
              ) : (
                <>
                  <ProgressBarCard
                    title={
                      <div className="flex justify-start item-center gap w-full font-bold">
                        <div className="drop-pad" style={{ backgroundColor: '#387ADF' }}>
                          <DumbbellIcon size={24} style={{ color: 'white' }} />
                        </div>
                        <p>WORKOUT</p>
                      </div>
                    }
                    completed={userWorkoutlogs?.burntCalories}
                    target={userWorkoutlogs?.targetCalories}
                    active
                  />

                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Calories Burn Target"
                        value={userWorkoutlogs?.targetCalories || 0}
                        color="#1890ff"
                        units=""
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Calories Burnt"
                        value={userWorkoutlogs?.burntCalories || 0}
                        units=""
                        color="#108ee9"
                      />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="More to go"
                        value={userWorkoutlogs?.unfinishedWorkouts || 0}
                        color="#007bff"
                        units=""
                      />
                    </Col>
                  </Row>
                  <Row gutter={12} style={{ margin: '1rem auto' }}>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Total Workouts"
                        value={userWorkoutlogs?.totalWorkout || 0}
                        color="#1890ff"
                        units=""
                      />
                    </Col>
                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Completed"
                        value={userWorkoutlogs?.finishedWorkouts || 0}
                        color="#108ee9"
                        units=""
                      />
                    </Col>

                    <Col xs={24} md={8}>
                      <ValueCard
                        title="Incomplete"
                        value={userWorkoutlogs?.unfinishedWorkouts || 0}
                        color="#007bff"
                        units=""
                      />
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
        </Main>
      )}
    </>
  );
}

const WaterIntakeProgress = ({ target, consumed, shape }) => {
  console.log({ consumed });
  const percent = ((consumed / target) * 100) / 100;
  return (
    <Liquid
      percent={percent}
      style={{
        shape,
        outlineBorder: 4,
        outlineDistance: 8,
        waveLength: 128,
      }}
    />
  );
};

WaterIntakeProgress.propTypes = { target: PropTypes.number, consumed: PropTypes.number, shape: PropTypes.string };

// eslint-disable-next-line react/prop-types
const ValueCard = ({ title, value, units = 'ml', color }) => {
  return (
    <Card title={title}>
      <div style={{ fontSize: 36, color }}>
        {value}
        {units}
      </div>
    </Card>
  );
};

const WaterProgressC = () => {
  const waterTarget = 2.5;
  const waterDrank = 1.8;
  const waterRemaining = waterTarget - waterDrank;

  return (
    <Card>
      <div className="flex justify-start item-center gap w-full font-bold">
        <div className="drop-pad" style={{ backgroundColor: '#387ADF' }}>
          <DropletIcon size={24} style={{ color: 'white' }} />
        </div>
        <p>WATER</p>
      </div>
      <Row gutter={12}>
        <Col xs={24} md={8}>
          <ValueCard title="Target" value={waterTarget} color="#1890ff" />
        </Col>
        <Col xs={24} md={8}>
          <ValueCard title="Consumed" value={waterDrank} color="#108ee9" />
        </Col>

        <Col xs={24} md={8}>
          <ValueCard title="Left" value={waterRemaining} color="#007bff" />
        </Col>
      </Row>
    </Card>
  );
};
