import React, { Suspense, useEffect, useState } from 'react';
import { Avatar, Button, Card, Col, Modal, Row, Select, Skeleton, Table, Input } from 'antd';
import { InfoCircleOutlined, FireOutlined, CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { DeleteIcon, Loader2, X } from 'lucide-react';
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
  const [searchValue, setSearchValue] = useState('');
  const { meals, setAllMeals } = useAllMeateStore();
  const { meal, setMeal } = useMealStore();

  const fetchAllMeals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINT}/getallmeal`);
      if (response.status !== 200) {
        setError('Failed to get meals');
        return;
      }
      const {data} = response;
      setAllMeals(data.meals);
    } catch (err) {
      setError('Failed to fetch meals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllMeals();
  }, []);

  const handleMealSelect = (value) => {
    const selectedMeal = meals?.find((item) => item.id === value);
    setMeal(selectedMeal);
    setSearchValue(selectedMeal?.name || '');
  };

  const handleSearchClear = () => {
    setSearchValue('');
    setMeal(null);
  };

  const filteredMeals = searchValue
    ? meals.filter((meal) => meal.name.toLowerCase().includes(searchValue.toLowerCase()))
    : meals;

  return (
    <div>
      <PageHeader
        className="header-boxed"
        title="All Dishes"
        buttons={[
          <MealSearchComponent
            key="search"
            meals={meals}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onMealSelect={handleMealSelect}
            onSearchClear={handleSearchClear}
          />,
        ]}
      />
      <Main>
        {loading && meals.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <MealsList meals={meal?.id ? [meal] : filteredMeals} setError={setError} />
        )}
      </Main>
    </div>
  );
}

// Separate component for meal search with cancel functionality
const MealSearchComponent = ({ meals, searchValue, onSearchChange, onMealSelect, onSearchClear }) => {
  return (
    <div style={{ position: 'relative', width: 200 }}>
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder="Search Meal"
        optionFilterProp="children"
        value={searchValue || undefined}
        onSearch={onSearchChange}
        onSelect={onMealSelect}
        onClear={onSearchClear}
        allowClear
        suffixIcon={
          searchValue ? (
            <CloseCircleOutlined onClick={onSearchClear} style={{ cursor: 'pointer', color: '#999' }} />
          ) : (
            <SearchOutlined style={{ color: '#999' }} />
          )
        }
        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
        }
      >
        {meals.map((meal) => (
          <Option key={meal?.id} value={meal?.id} label={meal?.name}>
            {meal?.name}
          </Option>
        ))}
      </Select>
    </div>
  );
};

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="gap px-4">
    <Skeleton active />
    <Skeleton active />
    <Skeleton active />
  </div>
);

// Meals list component
const MealsList = ({ meals, setError }) => (
  <div className="gap">
    {meals.map((meal) => (
      <FoodCard key={meal.id} meal={meal} setError={setError} />
    ))}
  </div>
);

export const FoodCard = ({ meal, setError }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { meals, setAllMeals } = useAllMeateStore();

  const dishImage =
    meal?.image ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D';

  const handleShowDetails = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleDeleteMeal = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(`${API_ENDPOINT}/deletemealbyid/${meal.id}`);
      if (res.status !== 200) throw new Error('Could not delete the Dish');
      setAllMeals(meals.filter((item) => item.id !== meal.id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-1">
      <Card className="w-full">
        <div className="w-full flex justify-between item-center">
          <div className="w-full flex justify-start item-center gap">
            <Avatar src={dishImage} size={128} style={{ borderRadius: '4%' }} />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{meal?.name || 'NA'}</h3>
              <p>{meal?.description ? `${meal.description.slice(0, 100)}...` : 'NA'}</p>
            </div>
          </div>
          <div className="flex justify-between item-center gap">
            <Button type="ghost" onClick={handleShowDetails}>
              <InfoCircleOutlined /> Details
            </Button>
            {/* Uncomment if delete functionality is needed
            <Button type="danger" onClick={handleDeleteMeal} loading={loading}>
              <DeleteIcon size={20} /> Delete
            </Button>
            */}
          </div>
        </div>
      </Card>

      <MealDetailsModal meal={meal} visible={modalVisible} onClose={handleCloseModal} dishImage={dishImage} />
    </div>
  );
};

// Separate modal component for better organization
const MealDetailsModal = ({ meal, visible, onClose, dishImage }) => (
  <Modal
    width="60%"
    title={meal?.name || 'NA'}
    open={visible}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>
        Close
      </Button>,
    ]}
  >
    <Row gutter={{ xs: 2, md: 8, lg: 12, xl: 24 }}>
      <Col xs={24} md={12}>
        <Card bordered={false}>
          <Avatar
            src={dishImage}
            style={{
              borderRadius: '4%',
              width: '100%',
              height: '300px',
              objectFit: 'cover',
            }}
          />
          <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Description</h5>
          <p style={{ fontSize: '1rem' }}>{meal?.description || 'NA'}</p>

          <NutritionInfo nutrition={meal?.nutrition} />
        </Card>
      </Col>
      <Col xs={24} md={12}>
        <Card bordered={false}>
          <IngredientsSection ingredients={meal?.ingredients} />
          <CookingStepsSection steps={meal?.steps} />
        </Card>
      </Col>
    </Row>
  </Modal>
);

// Nutrition information component
const NutritionInfo = ({ nutrition }) => {
  if (!nutrition || !Array.isArray(nutrition)) return null;

  return (
    <div>
      <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '1rem' }}>Nutrition Information</h5>
      {nutrition.map((nt, index) => (
        <div key={index}>
          {Object.entries(nt).map(([key, value]) => {
            if (key !== 'id') {
              return (
                <h5
                  key={key}
                  style={{
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: 'green',
                    margin: '0.5rem 0',
                  }}
                >
                  {capitalise(key)}: {value}
                </h5>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

// Ingredients section component
const IngredientsSection = ({ ingredients }) => (
  <div>
    <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ingredients</h5>
    <ul style={{ fontSize: '1rem' }}>
      {ingredients?.map((ingredient, index) => (
        <li key={index}>
          <DotFilledIcon />
          &nbsp;{ingredient}
        </li>
      ))}
    </ul>
  </div>
);

// Cooking steps section component
const CookingStepsSection = ({ steps }) => (
  <div>
    <h5 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Steps to make</h5>
    <ul style={{ fontSize: '1rem' }}>
      {steps?.map((step, index) => (
        <li key={index}>
          <DotFilledIcon />
          &nbsp;{step}
        </li>
      ))}
    </ul>
  </div>
);

// PropTypes
MealSearchComponent.propTypes = {
  meals: PropTypes.array.isRequired,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  onMealSelect: PropTypes.func.isRequired,
  onSearchClear: PropTypes.func.isRequired,
};

MealsList.propTypes = {
  meals: PropTypes.array.isRequired,
  setError: PropTypes.func.isRequired,
};

FoodCard.propTypes = {
  meal: PropTypes.object.isRequired,
  setError: PropTypes.func.isRequired,
};

MealDetailsModal.propTypes = {
  meal: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dishImage: PropTypes.string.isRequired,
};

NutritionInfo.propTypes = {
  nutrition: PropTypes.array,
};

IngredientsSection.propTypes = {
  ingredients: PropTypes.array,
};

CookingStepsSection.propTypes = {
  steps: PropTypes.array,
};
