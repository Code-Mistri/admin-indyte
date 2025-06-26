import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import axios from 'axios';
import { Form, Input, Button, PageHeader, Col, Row, Select, Modal, Card, Typography } from 'antd';
import { Loader2 } from 'lucide-react';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main, BasicFormWrapper } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';

const MOCK = [
  {
    id: '65d212b544324048bf1e9bdb',
    name: 'Squats',
    difficulty: 'Beginner',
    caloriesBurn: 80,
    description: 'A fundamental lower body exercise targeting the quadriceps, hamstrings, and glutes.',
    steps: [
      'Stand with your feet shoulder-width apart, toes pointing slightly outwards.',
      "Lower your body by bending your knees and pushing your hips back as if you're sitting down on a chair.",
      'Keep your chest up and your back straight, and lower yourself until your thighs are parallel to the ground.',
      'Push through your heels to return to the starting position.',
      'Repeat for the desired number of repetitions.',
    ],
    equipments: ['Dumbells'],
    reps: 12,
    time: null,
    createdAt: '2024-02-18T14:22:45.008Z',
    updatedAt: '2024-02-18T14:22:45.008Z',
  },
  {
    id: '65d2122844324048bf1e9bda',
    name: 'Push-ups',
    difficulty: 'Intermediate',
    caloriesBurn: 100,
    description: 'A classic bodyweight exercise targeting the upper body muscles.',
    steps: [
      'Start in a plank position with your hands shoulder-width apart.',
      'Lower your body until your chest nearly touches the floor.',
      'Push yourself back up to the starting position.',
      'Repeat for the desired number of repetitions.',
    ],
    equipments: ['None'],
    reps: 15,
    time: null,
    createdAt: '2024-02-18T14:20:24.485Z',
    updatedAt: '2024-02-18T14:20:24.485Z',
  },
];

const { Option } = Select;
const MealForm = () => {
  const location = useLocation();
  const router = useHistory();
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [exersices, setAllExersices] = useState([]);
  const pageState = location.state || {};
  if (pageState.state && !success) {
    console.log({ pageState });
    form.setFieldsValue(pageState.state);
  }

  const onFinish = async () => {
    setBtnLoading(true);
    const values = form.getFieldsValue();
    console.log({ values });
    try {
      if (!values || !values?.name || !values?.exercises || !values?.description) {
        throw new Error('Invalid Data');
      }
      console.log({ values });
      const res = await axios.post(`${API_ENDPOINT}/createworkout`, {
        ...values,
      });
      if (res.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setBtnLoading(false);
      form.resetFields();
    }
  };

  useEffect(() => {
    setLoading(true);
    async function fetchAllExersices() {
      try {
        const res = await axios.get(`${API_ENDPOINT}/getallexercise`);
        const data = await res.data.data;
        setAllExersices(data);

        console.log({ data });
      } catch (err) {
        console.error({ err });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllExersices();
  }, []);
  console.log({ exersices });

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
          <Card bordered={false}>
            <Typography style={{ textAlign: 'center', fontWeight: 'bold', color: 'green' }}>
              Workout created successfully
            </Typography>
          </Card>
        </Modal>
      )}
      <PageHeader ghost title="Create Workout" />
      <Main>
        <Row gutter={24}>
          <Col md={12} sm={24} xs={24} style={{ margin: '0 auto' }}>
            <Cards title="Enter Workout Details">
              <BasicFormWrapper>
                <Form form={form} name="workout_form" onFinish={onFinish}>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please input the Workout name!' }]}
                    label="Workout Name"
                  >
                    <Input placeholder="Push Pull Leg" />
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please write the description!' }]}
                  >
                    <Input.TextArea placeholder="..." />
                  </Form.Item>
                  <Form.Item label="Exersices" name="exercises">
                    <Select
                      showSearch
                      placeholder="Add exersice"
                      mode="multiple"
                      optionFilterProp="children"
                      listHeight={160}
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {exersices.map((item) => {
                        return <Option value={item.id}>{item?.name}</Option>;
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item style={{ marginTop: '1rem ' }}>
                    <Button
                      onClick={() => {
                        console.log({ ad: form.getFieldsValue() });
                        router.push('/admin/create-workout/exercise', { state: form.getFieldsValue() });
                      }}
                    >
                      Create new Exersice
                    </Button>
                  </Form.Item>
                  <Form.Item style={{ marginTop: '1rem ' }}>
                    <Button htmlType="submit" size="large" type="primary" className="btn-mid">
                      <div className="flex justify-center item-center gap-less w-full h-full">
                        {btnLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} /> adding...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </div>
                    </Button>
                  </Form.Item>
                </Form>
              </BasicFormWrapper>
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
};

export default MealForm;
