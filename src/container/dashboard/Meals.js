/* eslint-disable react/prop-types */
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
  Row,
  Col,
  Skeleton,
  Select,
  Card,
  DatePicker,
  Modal,
  InputNumber,
  Button as AntButton,
  Typography,
  message,
} from 'antd';
import axios from 'axios';
import { Loader, Loader2 } from 'lucide-react';
import FeatherIcon from 'feather-icons-react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { decryptData } from '../../utils/helper-functions';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Button } from '../../components/buttons/buttons';
import { Main } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';
import { useAllMeateStore, useUserMeals } from '../../zustand/meal-store';
import { useAllUserState, useSeletedUserForMealState } from '../../zustand/users-store';
import { api } from '../../utils/axios-util';

// Lazy loaded components
const MealsUpdate = lazy(() => import('./overview/meals/MealUpdate'));
const SearchUser = lazy(() => import('./overview/meals/SearchUser'));
const UserInfo = lazy(() => import('./overview/meals/UserInfo'));

const { Option } = Select;

const MEAL_TYPES = ['Dinner', 'Lunch', 'Breakfast', 'Snacks', 'Special Meals'];

// Custom hook for user data fetching
const useUserData = () => {
  const { role, id } = useSelector((state) => ({
    role: state.auth.role,
    id: state.auth.id,
  }));
  
  const userRole = decryptData({ 
    ciphertext: role, 
    key: process.env.REACT_APP_COOKIE_SECRET 
  });
  
  return { userRole, id };
};

// Custom hook for API calls
const useApiCalls = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApiCall = useCallback(async (apiCall, successCallback) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await apiCall();
      if (successCallback) successCallback(result);
      return result;
    } catch (err) {
      console.error({ err });
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, handleApiCall };
};

// Error Modal Component
const ErrorModal = ({ error, onClose }) => (
  <Modal 
    open={!!error} 
    onOk={onClose} 
    onCancel={onClose}
    title="Error"
  >
    <Card style={{ color: 'red', border: 'none' }}>
      <Typography.Text type="danger">
        Oops! {error}
      </Typography.Text>
    </Card>
  </Modal>
);

// Success Modal Component
const SuccessModal = ({ success, onClose, message }) => (
  <Modal 
    open={success} 
    onOk={onClose} 
    onCancel={onClose}
    title="Success"
  >
    <Card style={{ border: 'none' }}>
      <Typography.Text style={{ color: 'green' }}>
        {message}
      </Typography.Text>
    </Card>
  </Modal>
);

// Main Component
function MealsAndWorkouts() {
  const { userRole, id } = useUserData();
  const { loading: mainLoading, error, setError, handleApiCall } = useApiCalls();
  const { selectedUserForMeal } = useSeletedUserForMealState();
  const { meals, setAllMeals } = useAllMeateStore();
  const { allUsers, setAllUsers } = useAllUserState();
  const [dietician, setDietician] = useState({});

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    const apiCall = async () => {
      let res; let data;
      
      if (userRole === 'dietician') {
        res = await axios.get(`${API_ENDPOINT}/getclients?dieticianId=${id}`);
        if (res.status !== 200) throw new Error('Could not get users');
        data = res.data?.clients?.user || [];
      } else {
        res = await axios.get(`${API_ENDPOINT}/getallusers`);
        if (res.status !== 200) throw new Error('Could not get users');
        data = res.data?.users || [];
      }
      
      return data;
    };

    return handleApiCall(apiCall, setAllUsers);
  }, [userRole, id, handleApiCall, setAllUsers]);

  // Fetch dietician data
  const fetchDietician = useCallback(async () => {
    if (!selectedUserForMeal?.dieticianId) return;

    const apiCall = async () => {
      const res = await api.get(`/dietician/me/${selectedUserForMeal.dieticianId}`);
      if (res.status !== 200) throw new Error(res.data || 'Failed to fetch dietician');
      return res.data;
    };

    return handleApiCall(apiCall, setDietician);
  }, [selectedUserForMeal?.dieticianId, handleApiCall]);

  // Fetch all meals
  const fetchAllMeals = useCallback(async () => {
    const apiCall = async () => {
      const response = await axios.get(`${API_ENDPOINT}/getallmeal`);
      if (response.status !== 200) throw new Error('Failed to get meals');
      return response.data?.meals || [];
    };

    return handleApiCall(apiCall, setAllMeals);
  }, [handleApiCall, setAllMeals]);

  // Effects
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  useEffect(() => {
    fetchDietician();
  }, [fetchDietician]);

  useEffect(() => {
    if (allUsers.length > 0) {
      fetchAllMeals();
    }
  }, [allUsers, fetchAllMeals]);

  if (mainLoading) {
    return (
      <Card bordered={false} className="flex justify-center items-center w-full h-screen-less">
        <Loader className="animate-spin" size={44} />
      </Card>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClose={() => setError('')} />
      
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
                <UserInfo page="meals" userDiticianName={dietician?.name} />
              ) : (
                <Card>
                  <Typography.Text type="secondary">
                    Please select a user to view meal information
                  </Typography.Text>
                </Card>
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

// Meals Header Component
const MealsHeader = ({ meals }) => {
  const { userMeals, setUserMeals } = useUserMeals();
  const { selectedUserForMeal } = useSeletedUserForMealState();
  
  // Form state
  const [formData, setFormData] = useState({
    selectedDateTime: null,
    mealName: null,
    mealType: null,
    quantity: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form validation
  const isFormValid = () => {
    const { selectedDateTime, mealName, mealType, quantity } = formData;
    return !!(
      selectedDateTime && 
      mealName && 
      mealType && 
      quantity && 
      selectedUserForMeal?.id
    );
  };

  // Form handlers
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      selectedDateTime: null,
      mealName: null,
      mealType: null,
      quantity: null,
    });
  };

  // Handle date change
  const handleDateChange = (date, dateString) => {
    updateFormField('selectedDateTime', dateString);
  };

  // Handle add meal
  const handleAddMeal = useCallback(async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedMeal = meals.find(meal => meal.id === formData.mealName);
      if (!selectedMeal) {
        setError('Selected meal not found');
        return;
      }

      const payload = {
        userId: selectedUserForMeal.id,
        date: formData.selectedDateTime,
        mealTime: formData.mealType.toUpperCase(),
        mealId: selectedMeal.id,
        quantity: formData.quantity,
      };

      const response = await axios.post(`${API_ENDPOINT}/assignmeal`, payload);
      
      if (response.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to assign meal';
        setError(errorMessage);
        return;
      }

      // Update local state
      const newMeal = {
        meal: selectedMeal,
        userId: selectedUserForMeal.id,
        mealTime: formData.mealType,
        mealId: selectedMeal.id,
        date: formData.selectedDateTime,
        finished: false,
        quantity: formData.quantity,
      };

      setUserMeals([...userMeals, newMeal]);
      setSuccess(true);
      resetForm();
      
      // Show success message
      message.success('Meal assigned successfully');
      
    } catch (error) {
      console.error('Error assigning meal:', error);
      setError(error.response?.data?.message || 'Error assigning meal');
    } finally {
      setLoading(false);
    }
  }, [formData, meals, selectedUserForMeal, userMeals, setUserMeals, isFormValid]);

  return (
    <>
      <ErrorModal error={error} onClose={() => setError('')} />
      <SuccessModal 
        success={success} 
        onClose={() => setSuccess(false)} 
        message="Meal Assigned Successfully" 
      />
      
      <SearchUser page="meals" />

      {/* Meal Selection */}
      <div style={{ padding: '0 3px' }}>
        <Select
          showSearch
          style={{ width: '8rem' }}
          placeholder="Select Meal"
          optionFilterProp="children"
          listHeight={160}
          value={formData.mealName}
          filterOption={(input, option) => {
            if (option?.props?.children && input) {
              return option.props.children.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
          onSelect={(value) => updateFormField('mealName', value)}
          onClear={() => updateFormField('mealName', null)}
          allowClear
        >
          {meals?.map((meal) => (
            <Option value={meal.mealId || meal.id} key={meal.id}>
              {meal.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Meal Type Selection */}
      <div style={{ padding: '0 3px' }}>
        <Select
          showSearch
          style={{ width: '7rem' }}
          placeholder="Type"
          optionFilterProp="children"
          value={formData.mealType}
          filterOption={(input, option) => {
            if (option?.props?.children && input) {
              return option.props.children.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
          onSelect={(value) => updateFormField('mealType', value)}
          onClear={() => updateFormField('mealType', null)}
          allowClear
        >
          {MEAL_TYPES.map((type, index) => (
            <Option value={type} key={index}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      {/* Quantity Input */}
      <InputNumber
        min={1}
        value={formData.quantity}
        placeholder="Quantity"
        className="w-full inp"
        onChange={(value) => updateFormField('quantity', value)}
      />

      {/* Date Picker */}
      <DatePicker 
        onChange={handleDateChange} 
        needConfirm={false}
        value={formData.selectedDateTime ? moment(formData.selectedDateTime) : null}
        placeholder="Select Date"
      />

      {/* Add Meal Button */}
      <Button 
        size="small" 
        type="primary" 
        onClick={handleAddMeal}
        disabled={!isFormValid() || loading}
        style={{ 
          opacity: !isFormValid() ? 0.6 : 1,
          cursor: !isFormValid() ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} /> 
            <span style={{ marginLeft: '4px' }}>Adding...</span>
          </>
        ) : (
          <>
            <FeatherIcon icon="plus" size={14} />
            <span style={{ marginLeft: '4px' }}>Add Meal</span>
          </>
        )}
      </Button>
    </>
  );
};

export default MealsAndWorkouts;