import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Button, Card, Modal, Skeleton, Typography } from 'antd';
import { useParams } from 'react-router-dom/';
import { Main } from '../styled';
import { decryptData, getFormattedDate } from '../../utils/helper-functions';
import { api } from '../../utils/axios-util';

const { Meta } = Card;

export default function ViewUser() {
  const { id } = useParams();
  const [user, setUser] = useState();
  const [dieticain, setDietician] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [banUserModalOpen, setBanUserModalOpen] = useState(false);
  const { role } = useSelector((state) => {
    return {
      role: state.auth.role,
    };
  });

  useEffect(() => {
    setLoading(true);
    async function fetchUser() {
      try {
        const res = await api.get(`/user/me/${id}`);
        console.log({ res });
        if (res.status === 201) {
          const data = await res.data;
          console.log({ data });
          setUser(data);
        } else {
          throw new Error(await res.data);
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);
  useEffect(() => {
    async function getDietitian() {
      setPending(true);
      try {
        const res = await api.get(`/dietician/me/${user.dieticianId}`);
        console.log({ res });
        if (res.status === 200) {
          const data = await res.data;
          console.log({ data });
          setDietician(data);
        } else {
          throw new Error(await res.data);
        }
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setPending(false);
      }
    }
    if (user?.dieticianId) {
      getDietitian();
    }
  }, [user]);
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });
  if (!id) {
    return <Card className="flex-center w-full h-full">Not Found</Card>;
  }
  console.log({ user });
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
      <Modal
        open={banUserModalOpen}
        onCancel={() => setBanUserModalOpen(false)}
        onOk={() => setBanUserModalOpen(false)}
      >
        <Typography>Feature Coming soon</Typography>
      </Modal>
      {loading ? (
        <Skeleton active className="w-full h-full" />
      ) : (
        user && (
          <Main>
            <div className="p-4 my-1">
              <Card
                bordered={false}
                className="profile-card"
                actions={[
                  userRole === 'admin' && (
                    <Button type="danger" onClick={() => setBanUserModalOpen(true)}>
                      Block User
                    </Button>
                  ),
                ]}
              >
                <div className="profile-picture-container">
                  <Avatar
                    size={128}
                    src={
                      user?.profile ||
                      'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bmlnaHQlMjBza3l8ZW58MHx8MHx8fDA%3D'
                    }
                  />
                </div>
                <div className="flex-center w-fit my-1">
                  <Meta title={user?.name} className="mb" />
                </div>
                <div className="my-1">
                  <Card title="Personal Information">
                    <p className="my">Email: {user?.email}</p>
                    <p className="my">Phone: {user?.phone}</p>
                    <p className="my">Gender: {user?.gender}</p>
                    <p className="my">Date of Birth: {getFormattedDate(new Date(user?.date_of_birth))}</p>
                    {dieticain?.name && <p className="my">Dieticain: {dieticain?.name}</p>}
                  </Card>
                </div>
                <div className="my-1">
                  <Card title="Additional Information" className="my-1">
                    <p className="my">Goal: {user?.goal}</p>
                    <p className="my">Height: {`${user?.height} ${user.height_unit}`}</p>
                    <p className="my">Weight: {`${user?.weight} ${user.weight_unit}`}</p>
                    <p className="my">Dietician: {user?.dietician}</p>
                    <p className="my">Sleep Target: {user?.sleep_target}</p>
                    <p className="my">Step Target: {user?.step_target}</p>
                    <p className="my">Water Target: {user?.water_target}</p>
                    <p className="my">Calories Target: {user?.calories_target}</p>
                  </Card>
                </div>
              </Card>
            </div>
          </Main>
        )
      )}
    </>
  );
}
