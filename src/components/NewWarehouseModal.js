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

  const [newWHName, setNewWHName] = useState("");
  const [newWHNotes, setNewWHNotes] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [disallowAddition, setDisallowAddition] = useState(true)

  useEffect((()=> {
    if(warehouseCounter > 1) {
      updateDoc(doc(db, "user", userProfileID),
      {
        isNew : false
      });
    }
  }))

  useEffect(() => {
    if(newWHName === undefined || newWHName == " " || newWHName == "")
    {
      setDisallowAddition(true)
    }
    else
    {
      setDisallowAddition(false)
    }
  })

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }  
  }, [{ user }])

  const clearFields = () => {
    setNewWHName("")
    setNewWHNotes("")
    setNewAddress("")
  }

  useEffect(()=>{
    if(props.onHide)
    {
      clearFields()
    }
  }, [props.onHide])

  useEffect(() => {
    if (userID === undefined) {
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else
    {
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
    });
  }, [userCollection])
 

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

    successToast();
    props.onHide()
  }

  return (
    <Modal id="warehouse-modal"
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
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

      <Modal.Body >
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Add a Warehouse</h3>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-5 ps-4'>
              <label>Warehouse ID</label>
              <input type="text"
                readOnly
                className="form-control shadow-none shadow-none no-click"
                placeholder=""
                defaultValue={createFormat().substring(0,4)}
              />
            </div>
            <div className='col-7 ps-4'>
              <label>
                Warehouse Name
                <span style={{color: '#b42525'}}> *</span>
              </label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="Warehouse"
                value={newWHName}
                onChange={(event) => { setNewWHName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-12 ps-4'>
              <label>Address</label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="Address"
                rows={3}
                value={newAddress}
                onChange={(event) => { setNewAddress(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-12 ps-4'>
              <label>Notes: (Optional)</label>
              <textarea
                className="form-control shadow-none shadow-none"
                as="textarea"
                rows={2}
                value={newWHNotes}
                onChange={(event) => { setNewWHNotes(event.target.value); }}
              />
            </div>
          </div>
        </div>
      </Modal.Body>   
      <Modal.Footer
        className="d-flex justify-content-center"
      >
        <Button
          className="btn btn-danger"
          style={{ width: "6rem" }}
          onClick={() => props.onHide()}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-light float-start"
          disabled={disallowAddition}
          style={{ width: "6rem" }}
          onClick={() => { addWarehouse() }}
        >
          Save
      </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewWarehouseModal;
