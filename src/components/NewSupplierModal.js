import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addDoc, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';


function NewSupplierModal(props) {

  //---------------------VARIABLES---------------------

  const [newSupplierName, setnewSupplierName] = useState("");
  const [newSupplierAddress, setnewSupplierAddress] = useState("");
  const [newSupplierEmailAddress, setnewSupplierEmailAddress] = useState("");
  const [newSupplierMobileNumber, setnewSupplierMobileNumber] = useState(0);
  const [newSupplierTelephoneNumber, setnewSupplierTelephoneNumber] = useState(0);


  const [varRef, setVarRef] = useState([]); // variable collection


  //---------------------FUNCTIONS---------------------

  //fetch variable collection
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
      setVarRef(doc.data());
    });
    return unsub;
  }, [])


  //success toast
  const successToast = () => {
    toast.success(' New Supplier Successfully Registered to the Database ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  //add supplier to collection
  const addSupplier = async (supplierId) => {
    setDoc(doc(db, "supplier", "SU" + Number(varRef.supplierId)), {
        supplier_name: newSupplierName
      , supplier_emailaddress: newSupplierEmailAddress
      , supplier_address: newSupplierAddress
      , supplier_mobileNum: newSupplierMobileNumber
      , supplier_telNum: newSupplierTelephoneNumber
    });

    //update docNum variable
    const varColRef = doc(db, "variables", "var")
    const newData = { supplierId: Number(supplierId) + 1 }
    await updateDoc(varColRef, newData)




    successToast();
  }




  return (
    <Modal
      {...props}
      size="lg"
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
          Register New Supplier
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3">
          <div className="row my-2">
            <div className='row'>
              <div className='col-8'>
                <label>Supplier Name</label>

                <input type="text"
                  className="form-control"
                  placeholder="Supplier Name"
                  onChange={(event) => { setnewSupplierName(event.target.value); }}
                /></div>

              <div className='col-4'>
                <label>Supplier Id</label>

                <input type="text"
                  readOnly
                  className="form-control"
                  placeholder="Supplier Name"
                  value={varRef.supplierId}
                />
              </div>

            </div>

          </div>

          <div className="row my-2">
            <div className="col-12">
              <label>Address</label>
              <input type="text"
                className="form-control"
                placeholder="Address"
                rows={3}
                onChange={(event) => { setnewSupplierAddress(event.target.value); }}
              />
            </div>
          </div>


          <h5>Contact Information</h5>
          <hr></hr>

          <div className="row my-2">
            <div className="col-7">
              <label>Email Address</label>
              <input type="email"
                className="form-control"
                placeholder="*****@email.com"
                onChange={(event) => { setnewSupplierEmailAddress(event.target.value); }}
              />
            </div>
          </div>

          <div className="row my-2">
            <div className="col-6">
              <label>Mobile Number</label>
              <input type="number"
                className="form-control"
                placeholder="09---------"
                onChange={(event) => { setnewSupplierMobileNumber(event.target.value); }}
              />
            </div>
          </div>

          <div className="row my-2">
            <div className="col-6">
              <label>Telephone Number</label>
              <input type="number"
                className="form-control"
                placeholder="Contact Number"
                onChange={(event) => { setnewSupplierTelephoneNumber(event.target.value); }}
              />
            </div>
          </div>


        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-success"
          style={{ width: "150px" }}
          onClick={() => { addSupplier(varRef.supplierId) }}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewSupplierModal;