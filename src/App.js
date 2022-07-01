import { Route,Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

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
import { useState } from 'react';

function App() {


  const [isAuth, setIsAuth] = useState(true);

  return (

    
    <div className="App">

      <Routes>

        <Route path='/dashboard' element={<LandingPage isAuth={isAuth}/>}/>
        <Route path='/' element={<LoginPage setIsAuth={setIsAuth}/>}/>


        <Route path='/supplier' element={<SupplierList/>}/>
        <Route path='/inventory' element={<Inventory/>}/>
        <Route path='/records' element={<Records/>}/>
        <Route path='/salesrecord' element={<SalesRecord/>}/>
        <Route path='/stockcard' element={<StockcardPage/>}/>
        <Route path='/analytics' element={<Analytics/>}/>
        <Route path='/itemforecasting' element={<Itemforecast/>}/>
        <Route path='/community' element={<Community/>}/>
    


      </Routes>

    </div>
  );
}

export default App;
