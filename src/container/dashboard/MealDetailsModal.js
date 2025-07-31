/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Modal, Card, Rate, Typography, Image, Tag, Divider } from 'antd';
import { InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Image Preview Modal Component
// eslint-disable-next-line react/prop-types
const ImagePreviewModal = ({ visible, onClose, imageUrl, mealName }) => {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80vw"
      style={{ top: 20 }}
      title={`${mealName} - Full Size Image`}
      centered
    >
      <div style={{ textAlign: 'center' }}>
        <Image
          src={imageUrl}
          alt={mealName}
          style={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain'
          }}
          fallback="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D"
        />
      </div>
    </Modal>
  );
};

// Main Meal Details Modal Component
const MealDetailsModal = ({ visible, onClose, mealData }) => {
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  if (!mealData) return null;

  const {
    meal,
    user,
    mealTime,
    date,
    quantity,
    finished,
    imgUrl,
    comment,
    review
  } = mealData;

  // Get the display image URL
  const getImageUrl = () => {
    return imgUrl || 
           meal?.image || 
           'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D';
  };

  // Format date
  const formatDate = (dateStr) => {
    const day = new Date(dateStr);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return day.toLocaleDateString('en-IN', options);
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <span>Meal Details</span>
          </div>
        }
      >
        <div style={{ padding: '20px 0' }}>
          {/* Meal Image Section */}
          <Card 
            hoverable
            style={{ 
              marginBottom: '20px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setImagePreviewVisible(true)}
            cover={
              <div style={{ position: 'relative' }}>
                <Image
                  src={getImageUrl()}
                  alt={meal?.name || 'Meal Image'}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px 8px 0 0'
                  }}
                  preview={false}
                  fallback="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D"
                />
                <div 
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '20px',
                    padding: '5px 10px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                >
                  <EyeOutlined /> Click to view full size
                </div>
              </div>
            }
          >
            <Title level={3} style={{ margin: '10px 0' }}>
              {meal?.name || 'N/A'}
            </Title>
          </Card>

          {/* Meal Information Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px',
            marginBottom: '20px'
          }}>
            <Card size="small" title="Basic Information">
              <div style={{ marginBottom: '10px' }}>
                <Text strong>User: </Text>
                <Text>{user?.name || 'N/A'}</Text>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Dietitian: </Text>
                <Text>{user?.dietician?.name || 'N/A'}</Text>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Meal Type: </Text>
                <Tag color="blue">{mealTime}</Tag>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Quantity: </Text>
                <Text>{quantity}</Text>
              </div>
            </Card>

            <Card size="small" title="Status & Date">
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Status: </Text>
                <Tag color={finished ? 'green' : 'orange'}>
                  {finished ? 'Finished' : 'Pending'}
                </Tag>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Assigned Date: </Text>
                <Text>{formatDate(date)}</Text>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <Text strong>Rating: </Text>
                {review !== null && review !== undefined && review >= 0 ? (
                  <Rate disabled value={review} style={{ fontSize: '16px' }} />
                ) : (
                  <Text type="secondary">No rating yet</Text>
                )}
              </div>
            </Card>
          </div>

          {/* Comment Section */}
          <Card size="small" title="Comments">
            <div style={{ minHeight: '60px' }}>
              {comment && comment !== 'null' && comment !== 'SKIPPED' ? (
                <Paragraph style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <Text italic>&quot;{comment}&quot;</Text>
                </Paragraph>
              ) : comment === 'SKIPPED' ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '8px',
                  border: '1px solid #ffeaa7'
                }}>
                  <Tag color="warning">MEAL SKIPPED</Tag>
                  <br />
                  <Text type="secondary">This meal was skipped by the user</Text>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <Text type="secondary">No comments provided</Text>
                </div>
              )}
            </div>
          </Card>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={imagePreviewVisible}
        onClose={() => setImagePreviewVisible(false)}
        imageUrl={getImageUrl()}
        mealName={meal?.name || 'Meal'}
      />
    </>
  );
};

export default MealDetailsModal;