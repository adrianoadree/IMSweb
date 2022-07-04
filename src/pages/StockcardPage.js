import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";


function StockcardPage({isAuth}) {
  let navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <Navigation />


    </div>




  );


}
export default StockcardPage;