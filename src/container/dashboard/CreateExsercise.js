import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, InputNumber, Button, PageHeader, Col, Row, Select, Modal, Card, Typography } from 'antd';
import { Loader2 } from 'lucide-react';
import { Main, BasicFormWrapper } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';

const { Option } = Select;
export default function CreateExerciseForm() {
  const router = useHistory();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [newExerciseData, setNewExerciseData] = useState({
    name: '',
    difficulty: 'Beginner',
    caloriesBurn: 0,
    description: '',
    steps: [],
    equipments: [],
    reps: 0,
  });
  const previousPageState = location.state || {};

  const handleNewExerciseChange = (event, field, index) => {
    if (field === 'steps') {
      const updatedSteps = [...newExerciseData.steps];
      updatedSteps[index] = event.target.value;
      setNewExerciseData({ ...newExerciseData, steps: updatedSteps });
    } else if (field === 'equipments') {
      const updatedEquipmets = [...newExerciseData.equipments];
      updatedEquipmets[index] = event.target.value;
      setNewExerciseData({ ...newExerciseData, equipments: updatedEquipmets });
    } else {
      setNewExerciseData({ ...newExerciseData, [field]: event.target.value });
    }
  };

  const handleSubmitNewExercise = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log({ newExerciseData });
    try {
      const res = await axios.post(`${API_ENDPOINT}/createexercise`, newExerciseData);
      if (res.status === 200) {
        if (previousPageState?.state) {
          router.push('/admin/create-workout', { state: previousPageState.state });
        } else {
          return null;
        }
      }
    } catch (err) {
      console.error({ err });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const addStepField = () => {
    setNewExerciseData({ ...newExerciseData, steps: [...newExerciseData.steps, ''] });
  };

  const addEquipmentField = () => {
    setNewExerciseData({ ...newExerciseData, equipments: [...newExerciseData.equipments, ''] });
  };

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
      <PageHeader title="Create Exersice" />
      <Main>
        <Row gutter={24}>
          <Col md={12} sm={24} xs={24} style={{ margin: '0 auto' }}>
            <Card title="New Exercise">
              <BasicFormWrapper>
                <Form onFinish={handleSubmitNewExercise}>
                  <Form.Item label="Name">
                    <Input value={newExerciseData.name} onChange={(e) => handleNewExerciseChange(e, 'name')} />
                  </Form.Item>

                  <Form.Item label="Difficulty">
                    <Select
                      value={newExerciseData.difficulty}
                      onChange={(value) => handleNewExerciseChange({ target: { value } }, 'difficulty')}
                    >
                      <Option value="Beginner">Beginner</Option>
                      <Option value="Intermediate">Intermediate</Option>
                      <Option value="Advanced">Advanced</Option>
                    </Select>
                  </Form.Item>
                  <div className="flex justify-between item-center gap">
                    <Form.Item label="Calories Burned" style={{ margin: '0 0 1rem' }}>
                      <InputNumber
                        value={newExerciseData.caloriesBurn}
                        onChange={(value) => handleNewExerciseChange({ target: { value } }, 'caloriesBurn')}
                      />
                    </Form.Item>
                    <Form.Item label="Reps" style={{ margin: '0 0 1rem' }}>
                      <InputNumber
                        value={newExerciseData.reps}
                        onChange={(value) => handleNewExerciseChange({ target: { value } }, 'reps')}
                      />
                    </Form.Item>
                  </div>

                  <Form.Item label="Description">
                    <Input.TextArea
                      value={newExerciseData.description}
                      onChange={(e) => handleNewExerciseChange(e, 'description')}
                    />
                  </Form.Item>

                  <Form.Item label="Steps">
                    {newExerciseData.steps.map((step, index) => (
                      <div key={index}>
                        <Input
                          value={step}
                          onChange={(e) => {
                            console.log(e);
                            handleNewExerciseChange(e, 'steps', index);
                          }}
                        />
                      </div>
                    ))}
                    <Button type="dashed" onClick={addStepField}>
                      + Add Step
                    </Button>
                  </Form.Item>
                  <Form.Item label="Equipments">
                    {newExerciseData.equipments.map((equipment, index) => (
                      <div key={index}>
                        <Input value={equipment} onChange={(e) => handleNewExerciseChange(e, 'equipments', index)} />
                      </div>
                    ))}
                    <Button type="dashed" onClick={addEquipmentField}>
                      + Add Equipment
                    </Button>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" size="small" className="btn-mid" onClick={handleSubmitNewExercise}>
                      <div className="flex justify-center item-center gap-less w-full h-full">
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} /> adding...
                          </>
                        ) : (
                          'Create'
                        )}
                      </div>
                    </Button>
                  </Form.Item>
                </Form>
              </BasicFormWrapper>
            </Card>
          </Col>
        </Row>
      </Main>
    </>
  );
}
