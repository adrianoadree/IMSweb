import { addDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useState } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewSupplierModal(props) {



  const supplierCollectionRef = collection(db, "supplier")


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


  const addSupplier = async () => {
    await addDoc(supplierCollectionRef,
      {
        supplier_name: newSupplierName
        , supplier_company: newSupplierCompany
        , supplier_address: newSupplierAddress
        , supplier_contact: newSupplierContactNumber
      });
      successToast();
  }



  //data variables
  const [newSupplierName, setnewSupplierName] = useState("");
  const [newSupplierCompany, setnewSupplierCompany] = useState("");
  const [newSupplierAddress, setnewSupplierAddress] = useState("");
  const [newSupplierContactNumber, setnewSupplierContactNumber] = useState(0);


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
            <label>Supplier Name</label>
            <div className="col-8">
              <input type="text"
                className="form-control"
                placeholder="Supplier Name"
                onChange={(event) => { setnewSupplierName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2">
            <div className="col-7">
              <label>Company Name</label>
              <input type="text"
                className="form-control"
                placeholder="Company"
                onChange={(event) => { setnewSupplierCompany(event.target.value); }}

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
                onChange={(event) => { setnewSupplierAddress(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2">
            <div className="col-5">
              <label>Contact Number</label>
              <input type="text"
                className="form-control"
                placeholder="Contact Number"
                onChange={(event) => { setnewSupplierContactNumber(event.target.value); }}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-success"
          style={{ width: "150px" }}
          onClick={addSupplier}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewSupplierModal;