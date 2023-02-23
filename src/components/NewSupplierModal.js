import React from "react";
import { useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { onSnapshot, doc, updateDoc, setDoc, query, where } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext'

import { Modal, Button } from 'react-bootstrap';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewSupplierModal(props) {
  const { user } = UserAuth(); // user credentials
  const [userID, setUserID] = useState(""); // set user id
  const userCollectionRef = collection(db, "user") // user collection reference
  const [userCollection, setUserCollection] = useState([]);// user collection
  const [userProfileID, setUserProfileID] = useState(""); // user profile id
  const [supplierCounter, setSupplierCounter] = useState(0); // purchase counter

  const [newSupplierName, setnewSupplierName] = useState(""); // supplier name
  const [newSupplierAddress, setnewSupplierAddress] = useState(""); // supplier address
  const [newSupplierEmailAddress, setnewSupplierEmailAddress] = useState(""); // supplier email address
  const [newSupplierMobileNumber, setnewSupplierMobileNumber] = useState(""); // supplier mobile number
  const [newSupplierTelephoneNumber, setnewSupplierTelephoneNumber] = useState(""); // supplier telephone number

  const [disallowAddition, setDisallowAddition] = useState(true); // disabler if form is incomplete

  //------------------------------- START OF STATE LISTENER -------------------------------
  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])
  // fetch user collection from database
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

  // assign profile and purchase counter
  useEffect(() => {
    userCollection.map((metadata) => {
      setSupplierCounter(metadata.supplierId)
      setUserProfileID(metadata.id)
    });
  }, [userCollection])
  
  // disable adding supplier if incomplete
  useEffect(() => {
    if (newSupplierName == "" || newSupplierName == " ") {
      setDisallowAddition(true)
    }
    else {
      setDisallowAddition(false)
    }
  })
  //================================ END OF STATE LISTENERS ================================

  //=================================== START OF HANDLERS ==================================
  //success toast
  const successToast = () => {
    toast.success("Adding " + newSupplierName, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Zoom
    });
  }

  // create supplier id
  const createFormat = () => {
    var format = supplierCounter + "";
    while (format.length < 3) { format = "0" + format };
    format = "SU" + format + '@' + userID;
    return format;
  }
  //=================================== END OF HANDLERS  ===================================

  //============================== START OF DATABASE WRITERS ===============================
  // add supplier
  const addSupplier = async () => {
    setDoc(doc(db, "supplier", createFormat()), {
      user: userID
      , supplier_name: newSupplierName
      , supplier_emailaddress: newSupplierEmailAddress
      , supplier_address: newSupplierAddress
      , supplier_mobileNum: newSupplierMobileNumber
      , supplier_telNum: newSupplierTelephoneNumber
    });

    //update docNum variable
    const userDocRef = doc(db, "user", userProfileID)
    const newData = { supplierId: Number(supplierCounter) + 1 }
    await updateDoc(userDocRef, newData)
    props.onHide()
    successToast();
  }
  //=============================== END OF DATABASE WRITERS ================================

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
    >
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Modal.Body
        className="d-flex justify-content-center">
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Add New Supplier</h3>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-3 ps-4'>
              <label>Supplier ID</label>

              <input type="text"
                readOnly
                className="form-control shadow-none no-click"
                placeholder=""
                value={createFormat().substring(0, 5)}
              />
            </div>
            <div className='col-9 ps-4'>
              <label>
                Supplier Name
                <span style={{ color: '#b42525' }}> *</span>
              </label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="ABC Inc.,"
                autoFocus
                onChange={(event) => { setnewSupplierName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className="col-12 ps-4">
              <label>Address</label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="Magsaysay Ave., Naga City"
                onChange={(event) => { setnewSupplierAddress(event.target.value); }}
              />
            </div>
          </div>
          <hr></hr>
          <div className="row my-2 mb-3">
            <div className="col-6 ps-4">
              <label>Mobile Number</label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="09---------"
                onChange={(event) => { setnewSupplierMobileNumber(event.target.value); }}
              />
            </div>
            <div className="col-6 ps-4">
              <label>Telephone Number</label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="(---) --- ---"
                onChange={(event) => { setnewSupplierTelephoneNumber(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className="col-12 ps-4">
              <label>Email Address</label>
              <input type="email"
                className="form-control shadow-none"
                placeholder="*****@email.com"
                onChange={(event) => { setnewSupplierEmailAddress(event.target.value); }}
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
          style={{ width: "8rem" }}
          onClick={() => { addSupplier() }}>
          Add Supplier
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewSupplierModal;