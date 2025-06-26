import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Modal, Row, Select, Skeleton, Typography } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';

import { Main } from '../styled';
import { PageHeader } from '../../components/page-headers/page-headers';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllWorkoutStore } from '../../zustand/workout-store';

const { Option } = Select;
export default function AllWorkouts() {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { workouts, setWorkouts } = useAllWorkoutStore();
  const [workout, setWorkout] = useState();
  useEffect(() => {
    setLoading(true);
    const fetchAllMeals = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/getallworkout`);
        console.log({ response });
        if (response.status !== 200) {
          setError('Failed to get meals');
          return;
        }
        const data = await response.data;
        setWorkouts(data.data);
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMeals();
  }, []);
  console.log({ workouts });
  return (
    <div>
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
        title="All Workouts"
        buttons={[
          <div>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Search Workout"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              onSelect={(value) => {
                console.log({ value });
                const selMeal = workouts?.find((item) => item.id === value);
                setWorkout(selMeal);
              }}
              defaultActiveFirstOption
            >
              <Option>Select Meal</Option>
              {workouts.map((item) => (
                <Option value={item?.id} label={item?.name}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </div>,
        ]}
      />
      <Main>
        {loading && workouts.length === 0 && (
          <div className="gap px-4">
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        )}
        <div className="gap">
          {workout?.id ? <WorkoutCard workout={workout} /> : workouts.map((item) => <WorkoutCard workout={item} />)}
        </div>
      </Main>
    </div>
  );
}

const { Meta } = Card;

const WorkoutCard = ({ workout }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleShowDetails = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="my-1">
      <Card className="w-full " hoverable>
        <div className="flex justify-between item-center">
          <Meta title={workout?.name} description={`${workout?.description?.slice(0, 100)}...`} />

          <div className="">
            <Button type="primary" onClick={handleShowDetails}>
              View More
            </Button>
          </div>
        </div>

        <div className="">
          <Modal
            title={workout?.description}
            visible={modalVisible}
            onCancel={handleCloseModal}
            footer={[
              <Button key="close" onClick={handleCloseModal}>
                Close
              </Button>,
            ]}
            width={800}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <Row gutter={{ xs: 2, md: 8, lg: 12, xl: 24 }} style={{ display: 'flex', flexWrap: 'wrap' }}>
              <Col xs={24} md={12} style={{ flex: 1, minWidth: '300px' }}>
                <Card bordered={false}>
                  <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Exercises</h5>
                  {workout.excersises.map((exercise) => (
                    <div key={exercise.id}>
                      <h6 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{exercise.exercise.name}</h6>
                      <ul style={{ fontSize: '0.9rem', marginLeft: '20px' }}>
                        <li>
                          <span style={{ fontWeight: 'bold' }}>Difficulty:</span> {exercise.exercise.difficulty}
                        </li>
                        <li>
                          <span style={{ fontWeight: 'bold' }}>Calories Burned:</span> {exercise.exercise.caloriesBurn}
                        </li>
                        <li>
                          <span style={{ fontWeight: 'bold' }}>Steps:</span>
                          <ul>
                            {exercise.exercise.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </div>
                  ))}
                </Card>
              </Col>

              <Col xs={24} md={12} style={{ flex: 1, minWidth: '300px' }}>
                <Card bordered={false}>
                  <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Equipment</h5>
                  <ul style={{ fontSize: '0.9rem' }}>
                    {workout.equipment?.length > 0 ? (
                      workout.equipment.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>None</li>
                    )}
                  </ul>
                </Card>
              </Col>
            </Row>
          </Modal>
        </div>
      </Card>
    </div>
  );
};
WorkoutCard.propTypes = {
  workout: PropTypes.object,
};
