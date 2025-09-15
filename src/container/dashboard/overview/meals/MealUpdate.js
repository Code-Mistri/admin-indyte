import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Skeleton, Collapse, Card, Typography } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

import { PropTypes } from 'prop-types';
import { Loader2 } from 'lucide-react';
import { useAllMeateStore, useUserMeals } from '../../../../zustand/meal-store';
import { API_ENDPOINT } from '../../../../utils/endpoints';
import { useSeletedUserForMealState } from '../../../../zustand/users-store';

const { Panel } = Collapse;

const MEAL_TYPES = [
  { key: 'EARLY_MORNING', label: 'Early Morning' },
  { key: 'AFTER_30_MINUTES', label: 'After 30 Minutes' },
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'MID_MEAL', label: 'Mid Meal' },
  { key: 'LUNCH', label: 'Lunch' },
  { key: 'EVENING_SNACKS', label: 'Evening Snacks' },
  { key: 'LATE_EVENING', label: 'Late Evening' },
  { key: 'DINNER', label: 'Dinner' },
  { key: 'BED_TIME', label: 'Bed Time' },
];

const MealUpdate = () => {
  const { userMeals, setUserMeals } = useUserMeals();
  const { selectedUserForMeal } = useSeletedUserForMealState();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [delMeal, setDelMeal] = useState({ mealId: '', isPending: false, date: '' });

  const { meals } = useAllMeateStore();
  const [groupedMeals, setGroupedMeals] = useState({});

  if (!meals) {
    alert('no data');
    return;
  }

  const hanldeRemove = async (meal) => {
    setDelMeal({ isPending: true, mealId: meal.mealId, date: meal.date });

    try {
      if (!meal.userId || !meal.mealId || !meal.date || !meal.mealTime) {
        throw new Error('Missing values please try again or refresh the page');
      }
      const res = await axios.put(`${API_ENDPOINT}/unassignmeal`, {
        userId: meal.userId,
        mealId: meal.mealId,
        date: meal.date,
        mealTime: meal.mealTime.toUpperCase(),
      });
      if (res.status !== 200) {
        throw new Error('Failed to remove meal');
      }
      const filterUserMeals = userMeals.filter(
        (item) =>
          item.mealId !== meal.mealId ||
          item.date !== meal.date ||
          item.mealTime.toUpperCase() !== meal.mealTime.toUpperCase(),
      );
      setUserMeals(filterUserMeals);
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setDelMeal({ isPending: false, mealId: '', date: '' });
    }
  };

  const columns = [
    {
      title: 'Meal',
      dataIndex: ['meal', 'imgUrl'],
      key: 'meal',
      render: (meal, record) => {
        const imageUrl =
          record?.imgUrl ||
          record?.image ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D';

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={imageUrl}
              alt={record?.meal?.name || 'Meal Image'}
              style={{
                width: '50px',
                height: '50px',
                marginRight: '10px',
                borderRadius: '15px',
                objectFit: 'cover',
              }}
            />
            <span>{record?.meal?.name || 'N/A'}</span>
          </div>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: ['mealTime'],
      key: 'mealTime',
    },
    {
      title: 'Status',
      dataIndex: ['finished'],
      key: 'finished',
      render: (finished) =>
        finished ? (
          <div style={{ fontWeight: 'bold', color: 'green' }}>Finished</div>
        ) : (
          <div style={{ fontWeight: 'bold', color: 'orange' }}>Pending</div>
        ),
    },
    {
      title: 'Assigned For',
      dataIndex: ['date'],
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Quantity',
      dataIndex: ['quantity'],
      key: 'quantity',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => hanldeRemove(record)}>
          <div className="flex justify-center item-center gap-less w-full h-full">
            {delMeal.isPending && delMeal.mealId === record.mealId && delMeal.date === record.date ? (
              <>
                <Loader2 className="animate-spin" size={24} /> wait...
              </>
            ) : (
              'Remove'
            )}
          </div>
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setLoading(true);
    const fetchUserMeals = async () => {
      const response = await axios.get(`${API_ENDPOINT}/getusermeals?userId=${selectedUserForMeal.id}`);
      if (response.status !== 200) {
        setError('Failed to get meals');
        return;
      }

      const useMealData = await response.data.data;
      setUserMeals(useMealData);
    };

    if (selectedUserForMeal?.id) {
      fetchUserMeals();
    }
  }, [selectedUserForMeal]);

  useEffect(() => {
    const groupMeals = async () => {
      const grouped = {};

      // initialize each type with empty array
      MEAL_TYPES.forEach((mealType) => {
        grouped[mealType.key] = [];
      });

      userMeals.forEach((data) => {
        const normalizedKey = data?.mealTime?.toUpperCase().replace(/\s+/g, '_');
        if (grouped[normalizedKey]) {
          grouped[normalizedKey].push(data);
        }
      });

      setGroupedMeals(grouped);
      setLoading(false);
    };

    groupMeals();
  }, [userMeals]);

  if (!selectedUserForMeal) {
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
        {MEAL_TYPES.map((mealType) => (
          <div key={mealType.key} style={{ minHeight: '4rem', marginTop: '1rem' }}>
            {loading ? (
              <Skeleton active />
            ) : (
              <CollapsibleMealTable
                type={mealType.label}
                data={groupedMeals[mealType.key] || []}
                columns={columns}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default MealUpdate;

const CollapsibleMealTable = ({ type, data, columns }) => {
  return (
    <Collapse
      style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
      accordion
      size="large"
      bordered={false}
      expandIcon={({ isActive }) => <CaretRightOutlined size={120} rotate={isActive ? 90 : 0} />}
    >
      <Panel header={<h3 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{type}</h3>}>
        <div className="table-bordered meal-update-table full-width-table table-responsive ">
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 25 }} />
        </div>
      </Panel>
    </Collapse>
  );
};

CollapsibleMealTable.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
};
