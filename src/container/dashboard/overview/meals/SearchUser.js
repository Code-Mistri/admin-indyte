import { Select } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import {
  useAllUserState,
  useSeletedUserForMealState,
  useSeletedUserForWorkoutState,
} from '../../../../zustand/users-store';

export default function SearchUser({ page }) {
  const { allUsers } = useAllUserState();
  const { setSelectedUserForMeal } = useSeletedUserForMealState();
  const { setSelectedUserForWorkout } = useSeletedUserForWorkoutState();

  const options = allUsers.map((user) => ({ label: user.name, value: user.id }));

  return (
    <div>
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Select User"
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? '').includes(input)}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
        }
        onSelect={(value) => {
          console.log({ sel: value });
          const user = allUsers.find((user) => user.id === value);
          if (user) {
            if (page === 'meals') {
              setSelectedUserForMeal(user);
            } else if (page === 'workouts') {
              setSelectedUserForWorkout(user);
            }
          }
        }}
        options={options}
        defaultActiveFirstOption
      />
    </div>
  );
}

SearchUser.propTypes = {
  page: PropTypes.string.isRequired,
};
