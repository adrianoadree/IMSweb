import { Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';
import { AuthContextProvider } from './context/AuthContext';

//pages
import Analytics from './pages/Analytics';
import Community from './pages/Community';
import Inventory from './pages/Inventory';
import LandingPage from './pages/LandingPage';
import Records from './pages/Records';
import Itemforecast from './pages/ItemForcast';
import SupplierList from './pages/SupplierList';
import StockcardPage from './pages/StockcardPage';
import SalesRecord from './pages/SalesRecord';
import LoginPage from './pages/LoginPage';
import Warehouse from './pages/Warehouse';
import TestPage from './pages/TestPage';
import ProfileManagement from './pages/ProfileManagement';
import AccountManagement from './pages/AccountManagement';
import UserRouter from './pages/UserRouter';
import VerificationMessage from './pages/VerificationMessage';
import ModRouter from './pages/ModRouter';
import ManageUsers from './pages/ManageUsers';



import { useState } from 'react';
import Protected from './layout/Protected';

function App() {

  return (


    <div className="App">
 
      <AuthContextProvider>
        <Routes>
          <Route path='/' element={<Protected><UserRouter /></Protected>} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/verify' element={<Protected><VerificationMessage /></Protected>} />
          <Route path='/home' element={<Protected><LandingPage /></Protected>} />
          <Route path='/supplier' element={<Protected><SupplierList /></Protected>} />
          <Route path='/inventory' element={<Protected><Inventory /></Protected>} />
          <Route path='/records' element={<Protected><Records /></Protected>} />
          <Route path='/salesrecord' element={<Protected><SalesRecord /></Protected>} />
          <Route path='/stockcard' element={<Protected><StockcardPage /></Protected>} />
          <Route path='/itemforecasting' element={<Protected><Itemforecast /></Protected>} />
          <Route path='/community' element={<Protected><Community /></Protected>} />
          <Route path='/warehouse' element={<Protected><Warehouse /></Protected>} />
          <Route path='/testpage' element={<Protected><TestPage /></Protected>} />
          <Route path='/profilemanagement' element={<Protected><ProfileManagement /></Protected>} />
          <Route path='/accountmanagement' element={<Protected><AccountManagement /></Protected>} />
          <Route path='/mod' element={<Protected><ModRouter /></Protected>} />
          <Route path='/manageusers' element={<Protected><ManageUsers /></Protected>} />
          <Route path='/analytics' element={<Analytics />} />
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
