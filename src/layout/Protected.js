import React from 'react';
import { Navigate } from 'react-router-dom';

import { UserAuth } from '../context/AuthContext';

// prevent user from navigating to other pages if not logged in
const Protected = ({ children }) => {
  const { user } = UserAuth();
  if (!user) {
    return <Navigate to='/login' />;
  }

  return children;
};

export default Protected;
