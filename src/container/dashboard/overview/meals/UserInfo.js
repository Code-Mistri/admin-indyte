import React, { useEffect, useState } from 'react';
import { Card, Avatar, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  useDieticianState,
  useSeletedUserForMealState,
  useSeletedUserForWorkoutState,
} from '../../../../zustand/users-store';
import { API_ENDPOINT } from '../../../../utils/endpoints';
import { api } from '../../../../utils/axios-util';

const { Meta } = Card;
export default function UserInfo({ page, userDiticianName }) {
  const { dietician, setDietician } = useDieticianState();
  const { selectedUserForMeal } = useSeletedUserForMealState();
  const { selectedUserForWorkout } = useSeletedUserForWorkoutState();

  useEffect(() => {
    const fetchDietician = async () => {
      if (!selectedUserForMeal.dieticianId) return null;
      try {
        if (page === 'meals') {
          const res = await axios.get(`${API_ENDPOINT}/getdietbyid/${selectedUserForMeal.dieticianId}`);
          if (res.status === 200) {
            const data = await res.data;
            setDietician(data.dietician);
          }
        }
        if (page === 'workouts') {
          const res = await axios.get(`${API_ENDPOINT}/getdietbyid/${selectedUserForWorkout.dieticianId}`);
          if (res.status === 200) {
            const data = await res.data;
            setDietician(data.dietician);
          }
        }
      } catch (err) {
        console.error({ err });
      }
    };

    fetchDietician();
  }, []);
  console.log({ selectedUserForMeal });
  if (!selectedUserForMeal?.id && page === 'meals') {
    return (
      <Card
        style={{
          width: '100%',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          height: '8rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Please Select a user
      </Card>
    );
  }
  if (!selectedUserForWorkout?.id && page === 'workouts') {
    return (
      <Card
        style={{
          width: '100%',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          height: '8rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Please Select a user
      </Card>
    );
  }
  return (
    <Card style={{ width: '100%', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <Row gutter={{ xs: 2, sm: 4, md: 8, lg: 12 }} align="top">
        <Col xs={24} md={20} lg={5}>
          <Avatar
            src={
              (page === 'meals' ? selectedUserForMeal?.profile : selectedUserForWorkout.profile) ||
              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
            }
            size={128}
            style={{ margin: 'auto ' }}
          />
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Meta
            title={
              <h5 style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingTop: '0.5rem' }}>
                {page === 'meals' ? selectedUserForMeal.name : selectedUserForWorkout.name}
              </h5>
            }
            description={
              <div>
                <p>
                  <strong>Gender:</strong>{' '}
                  {(page === 'meals' ? selectedUserForMeal.gender : selectedUserForWorkout.gender) ?? 'Not Meantioned'}
                </p>
                <p>
                  <strong>Weight:</strong>{' '}
                  {(page === 'meals'
                    ? `${selectedUserForMeal.weight} ${selectedUserForMeal.weight_unit}`
                    : selectedUserForWorkout.weight) ?? 'Not mentioned'}
                </p>
                <p>
                  <strong>Height:</strong>{' '}
                  {(page === 'meals'
                    ? `${selectedUserForMeal.height} ${selectedUserForMeal.height_unit}`
                    : `${selectedUserForWorkout.height} ${selectedUserForWorkout.height_unit}`) ?? 'Not mentioned'}
                </p>
                <p>
                  <strong>Goal:</strong>{' '}
                  {(page === 'meals' ? selectedUserForMeal.goal : selectedUserForWorkout.goal) ?? 'Not mentioned'}
                </p>
                <p>
                  <strong>Dietitian:</strong> {userDiticianName ?? 'N/A'}
                </p>
              </div>
            }
          />
        </Col>
        <Col xs={24} md={12} lg={7}>
          <Meta
            title={<h5 style={{ fontWeight: 'bold', fontSize: '2rem' }}>Addition Details</h5>}
            description={
              <div>
                <p>
                  <strong>Date of Birth:</strong>{' '}
                  {(page === 'meals'
                    ? new Date(selectedUserForMeal?.date_of_birth).toDateString('en-IN')
                    : selectedUserForWorkout?.date_of_birth) ?? 'NA'}
                </p>
                <p>
                  <strong>Email:</strong>{' '}
                  {(page === 'meals' ? selectedUserForMeal?.email : selectedUserForWorkout?.email) ?? 'NA'}
                </p>
                <p>
                  <strong>Phone:</strong>{' '}
                  {(page === 'meals' ? selectedUserForMeal?.phone : selectedUserForWorkout?.phone) ?? 'NA'}
                </p>
              </div>
            }
          />
        </Col>
      </Row>
    </Card>
  );
}

UserInfo.propTypes = {
  page: PropTypes.string.isRequired,
  userDiticianName: PropTypes.string.isRequired,
};
