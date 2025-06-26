import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Skeleton, Card, Typography, Row, Col, Avatar, Descriptions } from 'antd';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import { Loader2, Trash2Icon } from 'lucide-react';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { API_ENDPOINT } from '../../../../utils/endpoints';
import { useSeletedUserForWorkoutState } from '../../../../zustand/users-store';
import { useUserWorkouts } from '../../../../zustand/workout-store';
import { TableWrapper } from '../../../styled';
import { getFormattedDate } from '../../../../utils/helper-functions';

const UserWorkoutTable = () => {
  const { userWorkouts, setUserWorkouts } = useUserWorkouts();
  const { selectedUserForWorkout } = useSeletedUserForWorkoutState();
  const [selectedWorkout, setSelectedWorkout] = useState({});
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const [delLoading, setDelLoading] = useState({ workoutId: '', pending: false });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hanldeRemove = async (workout) => {
    setDelLoading({ workoutId: workout.workoutId, pending: true });
    console.log({ workout, userWorkouts });
    console.log({
      userId: workout.userId,
      workoutId: workout.workoutId,
      date: workout.date,
    });
    try {
      const res = await axios.delete(`${API_ENDPOINT}/unassign-workout`, {
        userId: workout.userId,
        workoutId: workout.workoutId,
        date: workout.date,
      });
      if (res.status !== 200) {
        throw new Error(await res.data?.data);
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setDelLoading({ workoutId: '', pending: false });
    }

    setUserWorkouts(userWorkouts.filter((item) => item.workoutId !== workout.workouId));
  };
  console.log({ userWorkouts });

  // Columns for the table
  const columns = [
    {
      title: 'Workout',
      dataIndex: 'workout',
      key: 'workout',
      render: (workout) => (
        <div>
          <img
            src={
              workout?.image ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D'
            }
            alt={workout?.name}
            style={{ width: '50px', marginRight: '10px', borderRadius: '15px' }}
          />
          {console.log({ workoutJs: workout })}
          {workout?.name}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: ['workout', 'description'],
      key: 'description',
    },
    {
      title: 'Calories burnt',
      dataIndex: ['workout', 'totalCaloriesBurnt'],
      key: 'totalCaloriesBurnt',
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
      dataIndex: ['date'],
      key: 'date',
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
      render: (date) => {
        const assignedMealDate = new Date(date);
        const options = { weekday: 'long' };
        return assignedMealDate.toLocaleDateString('en-IN', options);
      },
    },

    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        console.log({ text, record });
        return (
          <div className="flex justify-center item-center w-full h-full gap">
            <Button
              type="primary"
              shape="circle"
              onClick={() => {
                const selWorkout = userWorkouts?.find((item) => item?.id === record?.id);
                console.log({ selWorkout, record });
                setSelectedWorkout(selWorkout);
                setModalIsVisible(true);
              }}
            >
              <div className="flex justify-center item-center p-1 w-full h-full">
                <EyeOpenIcon />
              </div>
            </Button>

            <Button type="danger" shape="circle" onClick={() => hanldeRemove(record)}>
              <div className="flex justify-center item-center p-1 w-full h-full">
                {delLoading.pending && delLoading.workoutId === record.workoutId ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                  </>
                ) : (
                  <Trash2Icon />
                )}
              </div>
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchUserTodayWorkouts = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const formattedDate = getFormattedDate(today);
        console.log({ formattedDate });
        const response = await axios.get(
          `${API_ENDPOINT}/getworkoutfordate?userId=${selectedUserForWorkout.id}&date=${formattedDate}`,
        );
        if (response.status !== 200) {
          setError('Failed to get Workouts for this user');
          return;
        }

        const userWorkoutData = await response.data.data;
        console.log('urserWorkDAta', { userWorkoutData });
        setUserWorkouts(userWorkoutData);
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (selectedUserForWorkout?.id) {
      fetchUserTodayWorkouts();
    }
  }, [selectedUserForWorkout]);
  const exerciseColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Difficulty', dataIndex: 'difficulty', key: 'difficulty' },
    { title: 'Calories Burnt', dataIndex: 'caloriesBurn', key: 'caloriesBurn' },
    { title: 'Reps', dataIndex: 'reps', key: 'reps' },
  ];

  const exerciseData = selectedWorkout?.workout?.excersises?.map((exercise) => {
    console.log({ exercise });
    return {
      key: exercise.id,
      name: exercise?.exercise?.name,
      difficulty: exercise?.exercise?.difficulty,
      caloriesBurn: exercise?.exercise?.caloriesBurn,
      reps: exercise?.exercise?.reps,
    };
  });
  console.log({ userWorkouts, selectedWorkout, exerciseData });
  console.log({ selectedUserForWorkout });
  if (!selectedUserForWorkout) {
    return <Card>Select a user</Card>;
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
      <div style={{ width: '100%' }}>
        <div style={{ minHeight: '4rem', marginTop: '1rem' }}>
          {loading ? (
            <Card style={{ minHeight: '4rem' }} bordered={false}>
              <Skeleton active />
            </Card>
          ) : (
            <Card className="table-bordered meal-update-table table-responsive break-words full-width-table  ">
              <TableWrapper>
                <Table columns={columns} dataSource={userWorkouts} pagination={{ pageSize: 10 }} />
              </TableWrapper>
            </Card>
          )}
        </div>
      </div>
      <Modal title="Workout Details" open={modalIsVisible} onCancel={() => setModalIsVisible(false)} footer={null}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Date">{selectedWorkout?.date}</Descriptions.Item>
          <Descriptions.Item label="Workout">{selectedWorkout?.workout?.name}</Descriptions.Item>
          <Descriptions.Item label="Description">{selectedWorkout?.workout?.description}</Descriptions.Item>
          <Descriptions.Item label="Calories Burnt (approx.)">
            {selectedWorkout?.workout?.totalCaloriesBurnt}
          </Descriptions.Item>
        </Descriptions>

        <Typography.Title level={4}>Exercises</Typography.Title>
        <Table columns={exerciseColumns} dataSource={exerciseData} />
      </Modal>
    </>
  );
};

export default UserWorkoutTable;
