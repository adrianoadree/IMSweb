import { addDoc, setDoc, doc, onSnapshot, updateDoc, query, where } from 'firebase/firestore';
import { padStart } from "lodash";
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import { UserAuth } from '../context/AuthContext'
import "react-toastify/dist/ReactToastify.css";


function NewWarehouseModal(props) {

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]); 
  const [userProfileID, setUserProfileID] = useState("");
  const userCollectionRef = collection(db, "user")
  const [warehouseCounter, setWarehouseCounter] = useState(0);
  const [userStatus, setUserStatus] = useState(true);

  const [newWHName, setnewWHName] = useState("");
  const [newWHNotes, setnewWHNotes] = useState("");
  const [newAddress, setnewAddress] = useState("");

  useEffect((()=> {
    if(warehouseCounter > 1) {
      updateDoc(doc(db, "user", userProfileID),
      {
        isNew : false
      });
    }
  }))

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }  
  }, [{ user }])

  useEffect(() => {
    if (userID === undefined) {
          const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
        }
        else {
          const q = query(userCollectionRef, where("user", "==", userID));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
          
        }
  }, [userID])

  useEffect(() => {
    userCollection.map((metadata) => {
        setWarehouseCounter(metadata.warehouseId)
        setUserProfileID(metadata.id)
        setUserStatus(metadata.id);
    });
  }, [userCollection])
 
  const closeModal=()=>{
    document.querySelector("#warehouse-modal").style.display = 'none';
    document.querySelector(".modal-backdrop").style.display = 'none';
}

  const createFormat = () => {
    var format = warehouseCounter + "";
    while(format.length < 2) {format = "0" + format};
    format = "WH" + format + '@' + userID;
    return format;
 }
  
  const successToast = () => {
    toast.success(' Warehouse Creation Successful ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const addWarehouse = async () => {
    const userProfileRef = doc(db, "user", userProfileID)
    console.log(userProfileRef)
    await setDoc(doc(db, "warehouse", createFormat()),
      {
        wh_name: newWHName
        , wh_notes: newWHNotes
        , address: newAddress
        , col: 0
        , row: 0
        , isInit: false
        , cells: []
        , user: user.uid
      });
      
    await updateDoc(userProfileRef,
      {
	      warehouseId : Number(warehouseCounter) + 1
      });
      
   closeModal();
   successToast();

  }

  return (
    <Modal id="warehouse-modal"
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="px-3">
          Add a Warehouse
              
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3">
          <div className="row my-2">
            <div className="col-8">
              <label>Warehouse Name</label>
              <input type="text"
                className="form-control"
                placeholder="Warehouse"
                onChange={(event) => { setnewWHName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2">
            <div className="col-12">
              <label>Address</label>
              <input type="text"
                className="form-control"
                placeholder="Address"
                rows={3}
                onChange={(event) => { setnewAddress(event.target.value); }}
              />
            </div>
          </div>
            <div className="row my-2">
            <div className="col-7">
              <label>Notes</label>
              <input type="text"
                className="form-control"
                placeholder="Notes"
                onChange={(event) => { setnewWHNotes(event.target.value); }}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-success"
          style={{ width: "150px" }}
          onClick={addWarehouse}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewWarehouseModal;
