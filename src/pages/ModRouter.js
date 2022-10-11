import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'

function ModRouter(props) {
    const navigate = useNavigate();
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
  
  
    //---------------------FUNCTIONS---------------------
  
    useEffect(() => {
      if (user) {
        setUserID(user.uid)
      }
    }, [{ user }])
    
    if (userID == undefined) {

    }
    else
    {
      if (userID == 'B2xzqtuqDzNog41Zz9G7wtzdyR83')
      {
        if (props.route == '/manageusers') {
          
        }
        else
        {
          navigate('/manageusers');
        }
      }
      else
      {
        navigate('/home');
      }
    }
      
  
    
      return (
          <div></div>
      );
    
    }
export default ModRouter; 
