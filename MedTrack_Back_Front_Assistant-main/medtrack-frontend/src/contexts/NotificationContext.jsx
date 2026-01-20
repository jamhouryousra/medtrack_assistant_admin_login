// contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fonction pour déclencher un refresh des notifications
  const triggerNotificationRefresh = useCallback(() => {
    console.log('🔔 Déclenchement refresh notifications');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <NotificationContext.Provider value={{ refreshTrigger, triggerNotificationRefresh }}>
      {children}
    </NotificationContext.Provider>
  );
};