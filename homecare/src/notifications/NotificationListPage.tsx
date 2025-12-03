import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';
import { NotificationService } from './NotificationService';
import type { NotificationDto } from '../types/notification';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

const NotificationListPage: React.FC = () => {

  //Component state management, handles variables that change over time
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifyNavbar = () => { window.dispatchEvent(new CustomEvent('notifications-updated')); }

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    //loads notifications if user is logged in
    loadNotifications();
  }, [user, filter, navigate]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = filter === 'unread' 
        ? await NotificationService.getUnreadNotifications()
        : await NotificationService.getMyNotifications();
      
      setNotifications(data); //update notification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId);
      //update the notification as read
      setNotifications(prev => 
        prev.map(n => 
          n.notificationId === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );
      notifyNavbar();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      //update all notifications as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      notifyNavbar();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      //remove notification from list
      setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
      notifyNavbar();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    //mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.notificationId!);
    }

    //navigate to related item if applicable
    if (notification.type === 'appointment' && notification.relatedId) {
      navigate('/appointments');
    } else if (notification.type === 'medication' && notification.relatedId) {
      navigate('/medications');
    }
  };
  //data formatting for dates and time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  //user have to be logged in to see notifications
  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          Please log in to view your notifications.
        </Alert>
      </Container>
    );
  }


  //notification section on page
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="notification-title">
              Notifications 
              {unreadCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {unreadCount}
                </Badge>
              )}
            </h2>
            <div className="d-flex gap-2">
              <Button 
                className={`view-toggle-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                className={`view-toggle-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
              {unreadCount > 0 && (
                <Button 
                  variant="outline-secondary" 
                  onClick={handleMarkAllAsRead}
                  className="notification-mark-all-button"
                >
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" className="notification-loading-spinner">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : notifications.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h5 className="text-muted">No notifications found</h5>
                <p className="text-muted">
                  {filter === 'unread' 
                    ? "You have no unread notifications." 
                    : "You haven't received any notifications yet."
                  }
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div>
              {notifications.map((notification) => (
                <Card 
                  key={notification.notificationId} 
                  className={`notification-card ${!notification.isRead ? 'border-primary notification-card-unread' : 'notification-card-read'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Card.Body>
                    <Row>
                      <Col xs={10}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className={`notification-item-title ${!notification.isRead ? 'notification-item-title-bold' : 'notification-item-title-normal'}`}>
                            {notification.title}
                            {!notification.isRead && (
                              <Badge bg="primary" className="ms-2 notification-new-badge">
                                New
                              </Badge>
                            )}
                          </h6>
                          <small className="text-muted">
                            {formatDate(notification.createdAt)}
                          </small>
                        </div>
                        <p className={!notification.isRead ? 'notification-message-bold' : 'notification-message-normal'}>
                          {notification.message}
                        </p>
                        {notification.type && (
                          <Badge 
                            bg="secondary" 
                            className="notification-type-badge"
                          >
                            {notification.type}
                          </Badge>
                        )}
                      </Col>
                      <Col xs={2} className="text-end">
                        <div className="d-flex flex-column gap-1">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.notificationId!);
                              }}
                              className="notification-action-button"
                            >
                              Read
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.notificationId!);
                            }}
                            className="notification-action-button"
                          >
                            Delete
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NotificationListPage;