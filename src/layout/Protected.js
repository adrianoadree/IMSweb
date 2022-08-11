import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const Protected = ({ children }) => {
  const { user } = UserAuth();
  if (!user) {
    return <Navigate to='/login' />;
  }

  return children;
};

<<<<<<< HEAD
export default Protected;
=======
export default Protected;
>>>>>>> parent of 76dbd3d (Revert "changed login method")
