import React, { useEffect } from 'react';
import { Card } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';

export default function WorkoutMealProgress() {
  const { userId } = useParams();
  useEffect(() => {
    async function getUserLogs() {
      try {
        const res = await axios.get(`${API_ENDPOINT}/getallusers`);

        if (res.status !== 200) {
          throw new Error('Seems somthing is not working properly');
        }
        const data = await res.data.users;
        if (data) {
          // setUsersProfile(data);
        } else {
          throw new Error('No Users Found');
        }
      } catch (err) {
        console.error({ err });
        // setError(err.message);
      } finally {
        // setLoading(false);
      }
    }
  }, []);

  return (
    <>
      <PageHeader title="Workout and Meal Prgress" />
      <Main>
        <Card>P</Card>
      </Main>
    </>
  );
}
