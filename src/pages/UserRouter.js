import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { db } from "../firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { UserAuth } from '../context/AuthContext';

function UserRouter(props) {
  const navigate = useNavigate(); // navigation module

  const { user } = UserAuth(); // user credentials
  const [userCollection, setUserCollection] = useState([]); // user collection
  const [userID, setUserID] = useState(""); // user id
  const [first, setFirst] = useState({}); // user profile

  const [width, setWidth] = useState(window.innerWidth); // window width
  const isMobile = width <= 768; // criteria for mobile screen size

  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection
  useEffect(() => {
    if (userID === undefined) {
      const userCollectionRef = collection(db, "user")
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const userCollectionRef = collection(db, "user")
      const q = query(userCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])

  // assign user profile
  useEffect(() => {
    if (userCollection == null) {

    }
    else {
      setFirst(userCollection[0]);
    }
  }, [userCollection])

  // listen to window width change
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    }
  }, []);

  // navigate to pages
  useEffect(() => {
    if (isMobile) {
      navigate('/mobile')
    }
    else {
      if (first === undefined) {

      }
      else {
        if (first.isNew) {
          if (first.status == 'inVerification') {
            if (props.route == '/verify') {
              //do nothing to prevent looping
            }
            else {
              navigate('/verify');
            }
          }
          else if (first.status == 'verified') {
            if (props.route == '/warehouse') {
              //do nothing to prevent looping
            }
            else {
              navigate('/warehouse');
            }
          }
          else if (first.status == 'new') {
            if (props.route == '/profileManagement') {
              //do nothing to prevent looping
            }
            else {
              navigate('/profileManagement');
            }
          }
          else {

          }
        }
        else if (props.route == undefined) {
          navigate('/home');
        }
      }
    }
  }, [first, isMobile])

  // change window width on resize
  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  return (
    <div></div>
  );
}
export default UserRouter; 
