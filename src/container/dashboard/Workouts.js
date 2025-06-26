import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
  Row,
  Col,
  Skeleton,
  Select,
  Card,
  Avatar,
  Input,
  DatePicker,
  Modal,
  Form,
  InputNumber,
  Button as AntButton,
  Typography,
} from 'antd';
import axios from 'axios';
import { Loader, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import FeatherIcon from 'feather-icons-react';
import Cookies from 'js-cookie';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllUserState, useSeletedUserForMealState, useSeletedUserForWorkoutState } from '../../zustand/users-store';
import { useAllWorkoutStore, useUserWorkouts } from '../../zustand/workout-store';
import { decryptData, getFormattedDate } from '../../utils/helper-functions';
import { api } from '../../utils/axios-util';

const WorkoutTable = lazy(() => import('./overview/workouts/WorkoutTable'));
const SearchUser = lazy(() => import('./overview/meals/SearchUser'));
const UserInfo = lazy(() => import('./overview/meals/UserInfo'));
const { Option } = Select;

function MealsAndWorkouts() {
  const [mainLoading, setMailLoading] = useState(false);
  const { role, id } = useSelector((state) => {
    return {
      role: state.auth.role,
      id: state.auth.id,
    };
  });
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });
  const { setWorkouts } = useAllWorkoutStore();
  const [dieticain, setDietitian] = useState({});

  const { allUsers, setAllUsers } = useAllUserState();
  const { selectedUserForWorkout } = useSeletedUserForWorkoutState();
  const [error, setError] = useState('');
  console.log({ API_ENDPOINT });

  useEffect(() => {
    setMailLoading(true);
    const fetchAllUsers = async () => {
      try {
        let res;
        let data;
        console.log({ mypage: userRole });
        if (userRole === 'dietician') {
          res = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${id}`);
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
        setAllUsers(data);
      } catch (err) {
        setError('Failed to get users');
        console.error(err.message);
      } finally {
        setMailLoading(false);
      }
    };
    fetchAllUsers();

    console.log('maelpage');
  }, []);
  useEffect(() => {
    setMailLoading(true);
    const fetchAllWorkouts = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINT}/getallworkout`);
        if (res.status !== 200) {
          console.log({ res: await res.data });
          if (await res.data.message) {
            setError(await res.data.message);
          } else {
            setError('Failed to Fetch Workouts');
          }
        }
        const data = await res.data.data;
        console.log({ all: data });
        setWorkouts(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setMailLoading(false);
      }
    };
    fetchAllWorkouts();
    console.log('wprkoutpage');
  }, [allUsers]);

  useEffect(() => {
    async function getDietitian() {
      setMailLoading(true);
      try {
        const res = await api.get(`/dietician/me/${selectedUserForWorkout?.dieticianId}`);
        console.log({ res });
        if (res.status === 200) {
          const data = await res.data;
          console.log({ data });
          setDietitian(data);
        } else {
          throw new Error(await res.data);
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setMailLoading(false);
      }
    }
    if (selectedUserForWorkout?.dieticianId) {
      getDietitian();
    }
  }, [selectedUserForWorkout]);
  if (mainLoading) {
    return (
      <Card bordered={false} className="flex justify-center item-center w-full h-screen-less">
        <Loader className="animate-spin" size={44} />
      </Card>
    );
  }

  console.log({ allUsers });
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
      <PageHeader
        className="header-boxed"
        ghost
        title="Workouts"
        buttons={[
          <div key="1" className="page-header-actions">
            <WorkoutHeader />
          </div>,
        ]}
      />

      <Main className="grid-boxed">
        <Row gutter={{ xs: 2, sm: 4, md: 8, lg: 12 }}>
          <Col span={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              {selectedUserForWorkout ? (
                <UserInfo page="workouts" userDiticianName={dieticain?.name} />
              ) : (
                <Card>Select a User</Card>
              )}
            </Suspense>
          </Col>

          <Col xs={24} md={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <WorkoutTable />
            </Suspense>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default MealsAndWorkouts;

export const WorkoutHeader = () => {
  const { workouts } = useAllWorkoutStore();
  const { userWorkouts, setUserWorkouts } = useUserWorkouts();
  const [error, setError] = useState();
  const [workoutId, setWorkoutId] = useState();
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { selectedUserForWorkout } = useSeletedUserForWorkoutState();

  const handleDateChange = (date, dateString) => {
    console.log({ dateString });
    setSelectedDateTime(dateString);
  };

  const hanldeAssignWorkout = useCallback(async () => {
    setLoading(true);
    const selWorlout = workouts.find((item) => item.id === workoutId);
    console.log({ selWorlout });
    if (!selWorlout) return;
    console.log({ selectedDateTime });
    try {
      if (!selectedDateTime || !selectedUserForWorkout.id || !workoutId) {
        setError('No data');
        return;
      }
      const res = await axios.post(`${API_ENDPOINT}/assignworkout`, {
        userId: selectedUserForWorkout.id,
        workoutId,
        date: selectedDateTime,
      });
      if (res.status !== 200) {
        console.log({ res: await res.data });
        if (await res.data.message) {
          setError(await res.data.message);
        } else {
          setError('Failed to assign workout');
        }
      }
      setSuccess(true);
      //   if (selectedDateTime === getFormattedDate(new Date())) {
      const newWorkout = {
        userId: selectedUserForWorkout.id,
        ...selWorlout,
        date: selectedDateTime,
        finished: false,
      };
      console.log({ newWorkout, userWorkouts });

      setUserWorkouts([
        ...userWorkouts,
        { date: selectedDateTime, finished: false, userId: selectedUserForWorkout.id, workout: newWorkout },
      ]);
      //   }
    } catch (error) {
      console.error({ error });
      setError('Error assigning Workout');
    } finally {
      setLoading(false);
    }
  });

  console.log({ workouts });

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
      {success && (
        <Modal open={success} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}>Workout Assigned Successfully</Typography>
          </Card>
        </Modal>
      )}
      <SearchUser page="workouts" />

      <div style={{ padding: '0 3px' }}>
        <Select
          showSearch
          style={{ width: '8rem' }}
          placeholder="Select Workout"
          optionFilterProp="children"
          listHeight={160}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onSelect={(value) => {
            console.log('user selected', value);
            setWorkoutId(value);
          }}
        >
          {workouts?.map((workout) => (
            <Option value={workout.id} key={workout.id}>
              {workout.name}
            </Option>
          ))}
        </Select>
      </div>

      <DatePicker onChange={handleDateChange} needConfirm={false} />
      <Button size="small" type="primary" onClick={hanldeAssignWorkout}>
        <div className="flex justify-center item-center gap-less w-full h-full">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} /> adding...
            </>
          ) : (
            <>
              <FeatherIcon icon="plus" size={14} /> Assign Workout
            </>
          )}
        </div>
      </Button>
    </>
  );
};
