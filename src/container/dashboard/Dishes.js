import React, { Suspense, useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, Modal, Row, Select, Skeleton, Table } from 'antd';
import { InfoCircleOutlined, FireOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { DeleteIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { DotFilledIcon } from '@radix-ui/react-icons';

import { Main } from '../styled';
import { Cards } from '../../components/cards/frame/cards-frame';
import { PageHeader } from '../../components/page-headers/page-headers';
import { useAllMeateStore, useMealStore } from '../../zustand/meal-store';
import { API_ENDPOINT } from '../../utils/endpoints';
import { capitalise } from '../../utils/helper-functions';

const { Option } = Select;
export default function AllMealStats() {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { meals, setAllMeals } = useAllMeateStore();
  const { meal, setMeal } = useMealStore();
  useEffect(() => {
    setLoading(true);
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

    fetchAllMeals().then(() => setLoading(false));
  }, []);
  console.log({ meals });
  return (
    <div>
      <PageHeader
        className="header-boxed"
        title="All Dishes"
        buttons={[
          <div>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Search Meal"
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').includes(input)}
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              }
              onSelect={(value) => {
                console.log({ value });
                const selMeal = meals?.find((item) => item.id === value);
                setMeal(selMeal);
              }}
              defaultActiveFirstOption
            >
              <Option>Select Meal</Option>
              {meals.map((meal) => (
                <Option value={meal?.id} label={meal?.name}>
                  {meal?.name}
                </Option>
              ))}
            </Select>
          </div>,
        ]}
      />
      <Main>
        {loading && meals.length === 0 && (
          <div className="gap px-4">
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </div>
        )}
        <div className="gap">
          {meal?.id ? (
            <FoodCard meal={meal} setError={setError} />
          ) : (
            meals.map((meal) => <FoodCard meal={meal} setError={setError} />)
          )}
        </div>
      </Main>
    </div>
  );
}

export const FilterMealsOPtions = () => {};

export const FoodCard = ({ meal, setError }) => {
  const [loading, setLoading] = useState(false);
  const { meals, setAllMeals } = useAllMeateStore();

  const dishImage =
    meal?.image ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D';

  // Modal state
  const [modalVisible, setModalVisible] = React.useState(false);

  // Show modal with dish details
  const handleShowDetails = () => {
    setModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="my-1">
      <Card className="w-full ">
        <div className="w-full flex justify-between item-center ">
          <div className="w-full flex justify-start item-center gap">
            <Avatar src={dishImage} size={128} style={{ borderRadius: '4%' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{meal?.name || 'NA'}</h3>
              <p>{`${meal?.description?.slice(0, 100)}...` || 'NA'}</p>
            </div>
          </div>
          <div className="flex justify-between item-center gap">
            <Button type="ghost" onClick={handleShowDetails}>
              <InfoCircleOutlined /> Details
            </Button>
            <Button
              type="danger"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await axios.delete(`${API_ENDPOINT}/deletemealbyid/${meal.id}`);
                  if (res.status !== 200) throw new Error('Could not delete the Dish');
                  setAllMeals(meals.filter((item) => item.id !== meal.id));
                } catch (err) {
                  console.error({ err });
                  setError(err.message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="flex justify-start item-center gap-less">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> wait..
                  </>
                ) : (
                  <>
                    <DeleteIcon size={20} /> Delete
                  </>
                )}
              </div>
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal for dish details */}
      <Modal
        width="60%"
        title={meal?.name || 'NA'}
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
      >
        <div>
          <Row gutter={{ xs: 2, md: 8, lg: 12, xl: 24 }}>
            <Col xs={24} md={12}>
              <Card bordered={false}>
                <Avatar src={dishImage} style={{ borderRadius: '4%', width: '100%', height: '100%' }} />
                <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Description</h5>

                <p style={{ fontSize: '1rem' }}>{meal?.description || 'NA'}</p>
                {meal.nutrition.map((nt) => {
                  console.log({ nt });
                  return Object.keys(nt).map((item) => {
                    if (item !== 'id') {
                      return (
                        <h5 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'green' }} key={item}>
                          {capitalise(item)}: {nt[item]}
                        </h5>
                      );
                    }
                    return null;
                  });
                })}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card bordered={false}>
                <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ingredients</h5>
                <ul style={{ fontSize: '1rem' }}>
                  {meal?.ingredients?.map((ingredient) => (
                    <li>
                      <DotFilledIcon />
                      &nbsp;{ingredient}
                    </li>
                  ))}
                </ul>
                <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Steps to make</h5>

                <ul style={{ fontSize: '1rem' }}>
                  {meal?.steps?.map((step) => (
                    <li>
                      <DotFilledIcon />
                      &nbsp;{step}
                    </li>
                  ))}
                </ul>
              </Card>
            </Col>
          </Row>
        </div>
        {/* Add more details here */}
      </Modal>
    </div>
  );
};

FoodCard.propTypes = {
  meal: PropTypes.object,
  setError: PropTypes.string,
};
