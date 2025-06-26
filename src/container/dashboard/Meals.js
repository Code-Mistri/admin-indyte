import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
  Row,
  Col,
  Skeleton,
  Select,
  Card,
  Input,
  DatePicker,
  Modal,
  Form,
  InputNumber,
  Button as AntButton,
  Typography,
} from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Loader, Loader2 } from 'lucide-react';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';
import { decryptData } from '../../utils/helper-functions';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAddMealModalVisible, useAllMeateStore, useUserMeals } from '../../zustand/meal-store';
import { useAllUserState, useSeletedUserForMealState } from '../../zustand/users-store';
import { api } from '../../utils/axios-util';

const MealsUpdate = lazy(() => import('./overview/meals/MealUpdate'));
const SearchUser = lazy(() => import('./overview/meals/SearchUser'));
const UserInfo = lazy(() => import('./overview/meals/UserInfo'));
const { Option } = Select;

const MEAL_TYPES = ['Dinner', 'Lunch', 'Breakfast', 'Snacks', 'Special Meals'];

function MealsAndWorkouts() {
  const { role, id } = useSelector((state) => {
    return {
      role: state.auth.role,
      id: state.auth.id,
    };
  });
  const userRole = decryptData({ ciphertext: role, key: process.env.REACT_APP_COOKIE_SECRET });
  const [mainLoading, setMailLoading] = useState(false);
  const { selectedUserForMeal } = useSeletedUserForMealState();
  const [dieticain, setDietitian] = useState({});
  const { meals, setAllMeals } = useAllMeateStore();
  const { allUsers, setAllUsers } = useAllUserState();
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
        console.error({ err });
        setError(err.message);
      } finally {
        setMailLoading(false);
      }
    };

    fetchAllUsers();

    console.log('maelpage');
  }, []);

  useEffect(() => {
    async function getDietitian() {
      setMailLoading(true);
      try {
        const res = await api.get(`/dietician/me/${selectedUserForMeal?.dieticianId}`);
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
    if (selectedUserForMeal?.dieticianId) {
      getDietitian();
    }
  }, [selectedUserForMeal]);
  console.log({ dieticain });
  useEffect(() => {
    const fetchAllMeals = async () => {
      const response = await axios.get(`${API_ENDPOINT}/getallmeal`);
      console.log({ response });
      if (response.status !== 200) {
        setError('Failed to get meals');
        return;
      }
      const data = await response.data;
      setAllMeals(data.meals);
    };

    fetchAllMeals();
  }, [allUsers]);

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
        title="Meals"
        buttons={[
          <div key="1" className="page-header-actions">
            <MealsHeader meals={meals} />
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
              {selectedUserForMeal ? (
                <UserInfo page="meals" userDiticianName={dieticain?.name} />
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
              <MealsUpdate />
            </Suspense>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default MealsAndWorkouts;

const MealsHeader = () => {
  const { meals } = useAllMeateStore();
  const { userMeals, setUserMeals } = useUserMeals();
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [mealName, setMealName] = useState(null);
  const [mealType, setMealType] = useState(null);

  const [quantity, setQuantity] = useState(null);
  const { selectedUserForMeal } = useSeletedUserForMealState();

  const handleDateChange = (date, dateString) => {
    const d1 = new Date(dateString);
    const d2 = new Date(date);
    console.log({ d1, d2 });
    setSelectedDateTime(dateString);
  };

  const hanldeAddMeal = useCallback(async () => {
    setLoading(true);
    const selMeal = meals.find((meal) => meal.id === mealName);
    console.log({ selMeal });
    if (!selMeal) return;

    try {
      if (!selectedDateTime || !selectedUserForMeal.id || !mealType || !quantity) {
        setError('No data');
        return;
      }
      console.log('We are updating');
      const newMeal = {
        meal: selMeal,
        userId: selectedUserForMeal.id,
        mealTime: mealType,
        mealId: selMeal.id,
        date: selectedDateTime,
        finished: false,
        quantity,
      };
      console.log({ newMeal });

      const res = await axios.post(`${API_ENDPOINT}/assignmeal`, {
        userId: selectedUserForMeal?.id,
        date: selectedDateTime,
        mealTime: mealType.toUpperCase(),
        mealId: selMeal.id,
        quantity,
      });
      if (res.status !== 200) {
        console.log({ res: await res.data });
        if (await res.data.message) {
          setError(await res.data.message);
        } else {
          setError('Failed to assign meal');
        }
      }
      setUserMeals([...userMeals, { ...newMeal }]);

      setSuccess(true);
    } catch (error) {
      console.error({ error });
      setError('Error assigning meal');
    } finally {
      setLoading(false);
    }
  });
  console.log({ userMeals });

  console.log({ meals });

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
            <Typography style={{ color: 'green' }}>Meal Assigned Successfully</Typography>
          </Card>
        </Modal>
      )}
      <SearchUser page="meals" />

      <div style={{ padding: '0 3px' }}>
        <Select
          showSearch
          style={{ width: '8rem' }}
          placeholder="Select Meal"
          optionFilterProp="children"
          listHeight={160}
          filterOption={(input, option) => {
            if (option?.props?.children && input) {
              return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }
            return null;
          }}
          onSelect={(value) => {
            console.log('user selected', value);
            setMealName(value);
          }}
        >
          {meals?.map((meal) => (
            <Option value={meal.mealId} key={meal.id}>
              {meal.name}
            </Option>
          ))}
        </Select>
      </div>
      <div style={{ padding: '0 3px' }}>
        <Select
          showSearch
          style={{ width: '7rem' }}
          placeholder="Type "
          optionFilterProp="children"
          filterOption={(input, option) => {
            if (option?.props?.children && input) {
              return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }
            return null;
          }}
          onSelect={(value) => {
            console.log('user selected type', value);
            setMealType(value);
          }}
        >
          {MEAL_TYPES.map((type, i) => (
            <Option value={type} key={i}>
              {type}
            </Option>
          ))}
        </Select>
      </div>
      <InputNumber
        min={1}
        value={quantity}
        placeholder="Quantity"
        className="w-full inp"
        onChange={(e) => {
          setQuantity(e);
        }}
      />

      <DatePicker onChange={handleDateChange} needConfirm={false} />
      <Button size="small" type="primary" onClick={hanldeAddMeal}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> wait
          </>
        ) : (
          <>
            <FeatherIcon icon="plus" size={14} />
            Add Meal
          </>
        )}
      </Button>
    </>
  );
};
