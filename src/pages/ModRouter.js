import React, { useEffect, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase-config';
import { doc, onSnapshot } from 'firebase/firestore';

function ModRouter(props) {
  const navigate = useNavigate(); // navigation module

  const masterdataDocRef = doc(db, "masterdata", "user"); // masterdata reference
  const [modUsers, setModUsers] = useState(); // moderator user ids
  const { user } = UserAuth(); // user credentials
  const [userID, setUserID] = useState(""); // user id

  // fetch user id of moderators
  onSnapshot(masterdataDocRef, (doc) => {
    setModUsers(doc.data().mods)
  }, []);

  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // route use if mod
  useEffect(() => {
    if (modUsers === undefined) {

    }
    else {
      if (modUsers.indexOf(userID) >= 0) {
        if (props.route == '/manageusers') {
        }
        else {
          navigate('/manageusers');
        }
      }
      else {
        navigate('/home');
      }
    }
  }, [modUsers]);

  return (
    <div></div>
  );

}
export default ModRouter; 
