import { addDoc, setDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { padStart } from "lodash";
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewWarehouseModal(props) {

  const warehouseCollectionRef = collection(db, "warehouse")
      const masterdataDocRef = doc(db, "masterdata", "warehouse")
      const [cntr, setCntr] = useState(0);

  const closeModal=()=>{
      document.querySelector("#warehouse-modal").style.display = 'none';
      document.querySelector(".modal-backdrop").style.display = 'none';
  } 
  
var format = "";

   useEffect(() => {
        const unsub =   onSnapshot(masterdataDocRef, (doc) => {
setCntr(doc.data().idCntr)
	 });
        return unsub;
    }, [])


 
const createFormat = () => {
  format = cntr + "";
  while(format.length < 3) {format = "0" + format};
  format = "WH" + format;
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
  	createFormat();
    await setDoc(doc(db, "warehouse", format),
      {
        wh_name: newWHName
        , wh_notes: newWHNotes
        , address: newAddress
        , col: 0
        , row: 0
        , isInit: false
        , cell: newCellsArray
      });
    await updateDoc(masterdataDocRef,{
	idCntr : Number(cntr) + 1
      });
      format="";
      
   closeModal();
   successToast();

  }

  //data variables
  const [newWHName, setnewWHName] = useState("");
  const [newWHNotes, setnewWHNotes] = useState("");
  const [newAddress, setnewAddress] = useState("");
  const [newCellsArray, setNewCellsArray] = useState([{ id: "", products: [] }]);
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
            <label>{format}</label>
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
