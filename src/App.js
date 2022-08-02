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
import Warehouse from './pages/Warehouse';
import { useState } from 'react';

function App() {


  const [isAuth, setIsAuth] = useState(true);

  return (

    
    <div className="App">

      <Routes>
        <Route path='/login' element={<LoginPage isAuth={isAuth} setIsAuth={setIsAuth}/>}/>
        <Route path='/' element={<LandingPage isAuth={isAuth}/>}/>
        <Route path='/supplier' element={<SupplierList isAuth={isAuth}/>}/>
        <Route path='/inventory' element={<Inventory isAuth={isAuth}/>}/>
        <Route path='/records' element={<Records isAuth={isAuth}/>}/>
        <Route path='/salesrecord' element={<SalesRecord isAuth={isAuth}/>}/>
        <Route path='/stockcard' element={<StockcardPage isAuth={isAuth}/>}/>
        <Route path='/analytics' element={<Analytics isAuth={isAuth}/>}/>
        <Route path='/itemforecasting' element={<Itemforecast isAuth={isAuth}/>}/>
        <Route path='/community' element={<Community isAuth={isAuth}/>}/>
        <Route path='/warehouse' element={<Warehouse/>}/>
    


      </Routes>

    </div>
  );
}

export default App;
