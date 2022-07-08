import { addDoc, setDoc, doc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewWarehouseModal(props) {



  const warehouseCollectionRef = collection(db, "warehouse")

  const closeModal=()=>{
      document.querySelector("#warehouse-modal").style.display = 'none';
      document.querySelector(".modal-backdrop").style.display = 'none';
  } 
  
  /*const addWarehouse = async () => {
    db.collection("warehouse").get().then(snap => {
	setColSize(snap.size);
    });
    setIdFormat("WH" + collectionSize.padStart(3, "0"));
    await setDoc(doc(db, "warehouse", idFormat),
      {
        wh_name: newWHName
        , wh_notes: newWHNotes
        , address: newAddress
        , col: 0
        , row: 0
        , isInit: false
      });
    alert('Successfuly Added to the Database')

  }*/
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
    await addDoc(warehouseCollectionRef,
      {
        wh_name: newWHName
        , wh_notes: newWHNotes
        , address: newAddress
        , col: 0
        , row: 0
        , isInit: false
      });
      
   closeModal();
   successToast();

  }

  //data variables
  const [newWHName, setnewWHName] = useState("");
  const [newWHNotes, setnewWHNotes] = useState("");
  const [newAddress, setnewAddress] = useState("");
  const [collectionSize, setColSize] = useState("");  
  const [idFormat, setIdFormat] = useState("");  


  return (
    <Modal id="warehouse-modal"
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
          Add a Warehouse
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3">
          <div className="row my-2">
            <label>Name</label>
            <div className="col-8">
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