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

function App() {




  return (

    
    <div className="App">

      <Routes>
        <Route path='/analytics' element={<Analytics/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/inventory' element={<Inventory/>}/>
        <Route path='/stockcard' element={<StockcardPage/>}/>

        <Route path='/' element={<LandingPage/>}/>
        <Route path='/records' element={<Records/>}/>
        <Route path='/salesrecord' element={<SalesRecord/>}/>

        <Route path='/itemforecasting' element={<Itemforecast/>}/>
        <Route path='/supplier' element={<SupplierList/>}/>
      </Routes>

    </div>
  );
}

export default App;
