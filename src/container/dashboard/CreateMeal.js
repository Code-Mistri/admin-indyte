import React, { useState } from 'react';
import axios from 'axios';
import { v4 } from 'uuid';
import { Form, Input, InputNumber, Button, PageHeader, Col, Row, Select, Upload, Modal, Card, Typography } from 'antd';
import { LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Cards } from '../../components/cards/frame/cards-frame';
import { Main, BasicFormWrapper } from '../styled';
import { API_ENDPOINT } from '../../utils/endpoints';

const { Option } = Select;
const MealForm = () => {
  const [error, setError] = useState();
  const [form] = Form.useForm();
  const [steps, setSteps] = useState([{ text: '' }]);
  const [ingredients, setIngredients] = useState([{ text: '' }]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [nutritions, setNutritions] = useState([{ type: '', value: '' }]);
  const [success, setSuccess] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (file) => {
    setImageFile(file);
    setImgLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setImgLoading(false);
    };
    reader.readAsDataURL(file);
    return false; // prevent Upload from auto-uploading
  };

  const onFinish = async () => {
    setLoading(true);
    const values = form.getFieldsValue();
    if (!values.mealName || !values.description || !values.category || !values.calories || !imageFile) {
      setError('Missing some values');
      setLoading(false);
      return;
    }
    const allNutrients = {};
    nutritions.forEach((item) => {
      allNutrients[item.type] = item.value;
    });
    try {
      const formData = new FormData();
      formData.append('mealName', values.mealName);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('calories', values.calories);
      formData.append('ingredients', JSON.stringify(ingredients.map(i => i.text)));
      formData.append('steps', JSON.stringify(steps.map(s => s.text)));
      formData.append('nutritions', JSON.stringify(nutritions));
      formData.append('image', imageFile);
      const res = await axios.post(`${API_ENDPOINT}/meal`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status !== 200) {
        setError('Failed to create meal');
      }
      setSuccess(true);
      setImageUrl('');
      setImageFile(null);
      setPreview(null);
      form.resetFields();
      setSteps([{ text: '' }]);
      setIngredients([{ text: '' }]);
      setNutritions([{ type: '', value: '' }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { text: '' }]);
  };
  const updateStep = (index, event) => {
    const newSteps = [...steps];
    newSteps[index].text = event.target.value;
    setSteps(newSteps);
    form.setFieldsValue({ recipeSteps: newSteps.map((step) => step.text) });
  };
  const removeStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
    form.setFieldsValue({ recipeSteps: newSteps.map((step) => step.text) });
  };
  const addIngredient = () => {
    setIngredients([...ingredients, { text: '' }]);
  };
  const updateIngredient = (index, event) => {
    const newIngredients = [...ingredients];
    newIngredients[index].text = event.target.value;
    setIngredients(newIngredients);
    form.setFieldsValue({ ingredients: newIngredients.map((ingredient) => ingredient.text) });
  };
  const removeIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
    form.setFieldsValue({ ingredients: newIngredients.map((ingredient) => ingredient.text) });
  };
  const addNutrition = () => {
    setNutritions([...nutritions, { type: '', value: '' }]);
  };
  const updateNutrition = (index, field, value) => {
    const newNutritions = [...nutritions];
    newNutritions[index][field] = value;
    setNutritions(newNutritions);
    form.setFieldsValue({ nutritions: newNutritions });
  };
  const removeNutrition = (index) => {
    const newNutritions = [...nutritions];
    newNutritions.splice(index, 1);
    setNutritions(newNutritions);
    form.setFieldsValue({ nutritions: newNutritions });
  };

  return (
    <>
      {error && (
        <Modal open={!!error} onOk={() => setError(null)} onCancel={() => setError(null)}>
          <Card style={{ color: 'red' }}>
            <Typography>Oops</Typography>
            {error}
          </Card>
        </Modal>
      )}
      {success && (
        <Modal open={!!success} onOk={() => setSuccess(null)} onCancel={() => setSuccess(null)}>
          <Card>
            <Typography style={{ color: 'green' }}>Meal Created Successfully</Typography>
          </Card>
        </Modal>
      )}
      <PageHeader ghost title="Create a Meal" />
      <Main>
        <Row gutter={24}>
          <Col md={12} sm={24} xs={24} style={{ margin: '0 auto' }}>
            <Cards title="Enter Details of the Food">
              <BasicFormWrapper>
                <Form form={form} name="meal_form" onFinish={onFinish}>
                  <Form.Item label="Meal Image">
                    <Upload
                      name="file"
                      beforeUpload={handleImageChange}
                      showUploadList={false}
                    >
                      {preview && !imgLoading ? (
                        <img src={preview} alt="avatar" style={{ width: '100%' }} />
                      ) : (
                        <button style={{ border: 0, background: 'none' }} type="button">
                          {imageUrl ? (
                            imgLoading ? (
                              <LoadingOutlined />
                            ) : (
                              <CheckCircle style={{ color: 'green' }} />
                            )
                          ) : (
                            <UploadOutlined />
                          )}
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </button>
                      )}
                    </Upload>
                  </Form.Item>
                  <Form.Item
                    name="mealName"
                    rules={[{ required: true, message: 'Please input the meal name!' }]}
                    label="Meal Name"
                  >
                    <Input placeholder="Meal Name" />
                  </Form.Item>
                  <Form.Item
                    name="calories"
                    label="Calories"
                    rules={[{ required: true, message: 'Please input the calories!' }]}
                  >
                    <InputNumber min={1} placeholder="Calories" />
                  </Form.Item>
                  <Form.Item label="Nutrition" name="nutritions">
                    {nutritions.map((nutrition, index) => (
                      <div key={index} className="flex justify-between gap mb">
                        <Select
                          value={nutrition.type}
                          onChange={(value) => updateNutrition(index, 'type', value)}
                          style={{ width: '45%' }}
                          placeholder="Nutrient"
                        >
                          <Option value="protein">Protein</Option>
                          <Option value="fats">Fats</Option>
                          <Option value="carbs">Carbohydrates</Option>
                        </Select>
                        <InputNumber
                          value={nutrition?.value}
                          onChange={(val) => {
                            updateNutrition(index, 'value', val);
                          }}
                          style={{ width: '45%' }}
                          placeholder="Value in grams"
                        />
                        <Button onClick={() => removeNutrition(index)} danger>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addNutrition}>Add Nutrition</Button>
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input the description!' }]}
                  >
                    <Input.TextArea placeholder="Description" />
                  </Form.Item>
                  <Form.Item label="Ingredients" name="ingredients">
                    {ingredients.map((ingredient, index) => (
                      <div key={index} className="flex justify-between gap mb">
                        <Input
                          value={ingredient.text}
                          onChange={(event) => updateIngredient(index, event)}
                          placeholder={`Ingredient ${index + 1}`}
                        />
                        <Button danger size="small" onClick={() => removeIngredient(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addIngredient}>Add Ingredient</Button>
                  </Form.Item>
                  <Form.Item label="Recipe Steps" name="recipeSteps">
                    {steps.map((step, index) => (
                      <div key={index} className="flex justify-between gap mb">
                        <Input
                          value={step.text}
                          onChange={(event) => updateStep(index, event)}
                          placeholder={`Step ${index + 1}`}
                        />
                        <Button onClick={() => removeStep(index)} danger>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addStep}>Add Step</Button>
                  </Form.Item>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Please input the Food Category!' }]}
                  >
                    <Input placeholder="eg. Drinks" />
                  </Form.Item>
                  <Form.Item style={{ marginTop: '1rem ' }}>
                    <Button htmlType="submit" size="large" type="primary" className="btn-mid">
                      <div className="flex-center gap">{loading ? <Loader2 className="animate-spin" /> : 'Submit'}</div>
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