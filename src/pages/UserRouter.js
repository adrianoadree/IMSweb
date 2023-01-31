import React, { useEffect, useState } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import { property } from 'lodash';

function UserRouter(props) {
    const navigate = useNavigate();
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [userCollection, setUserCollection] = useState([]);
    const [first, setFirst] = useState({});
    const [width, setWidth] = useState(window.innerWidth);
  
  
    //---------------------FUNCTIONS---------------------
  
    function handleWindowSizeChange() {
      setWidth(window.innerWidth);
    }
    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        }
    }, []);
    
    const isMobile = width <= 768;

    useEffect(() => {
      if (user) {
        setUserID(user.uid)
      }
    }, [{ user }])
    
    //read Functions

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
  
    useEffect(() => {
      if (userCollection == null) {
            
      }
      else {
        setFirst(userCollection[0]);
      }
    }, [userCollection])

    useEffect(() => {
      if(isMobile)
      {
        navigate('/mobile')
      }
      else
      {
        if ( first === undefined ) {
    
        }
        else
        {
          if (first.isNew) {
            if ( first.status == 'inVerification' ) {
              if ( props.route == '/verify' ) {
                //do nothing to prevent looping
              }
              else
              {
                navigate('/verify');
              }
            }
            else if ( first.status == 'verified' )
            {
              if ( props.route == '/warehouse' ) {
                //do nothing to prevent looping
              }
              else
              {
                navigate('/warehouse');
              }
            }
            else if( first.status == 'new' ){
              if ( props.route == '/profileManagement' ) {
                //do nothing to prevent looping
              }
              else
              {
                navigate('/profileManagement');
              }
            }
            else
            {
              
            }
          }
          else if ( props.route == undefined ) {
            navigate('/home');
          }
        }

      }
    }, [first, isMobile])
  
    return (
        <div></div>
    );
    }
export default UserRouter; 
