import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';

function ModRouter(props) {
    const navigate = useNavigate();
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const masterdataDocRef = doc(db, "masterdata", "user");
    const [modUsers, setModUsers] = useState();
  
  
    //---------------------FUNCTIONS---------------------
  
    
    onSnapshot(masterdataDocRef, (doc) => {
      setModUsers(doc.data().mods)
      
    }, []);

    useEffect(() => {
      if (user) {
        setUserID(user.uid)
      }
    }, [{ user }])
    

    useEffect(() => {
      if(modUsers === undefined) {

      }
      else
      {
        if (modUsers.indexOf(userID) >= 0)
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

    }, [modUsers]);
      
  
    
    return (
      <div></div>
    );
    
    }
export default ModRouter; 
