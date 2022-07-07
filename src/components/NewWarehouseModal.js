import { addDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useState } from 'react';


function NewWarehouseModal(props) {



  const warehouseCollectionRef = collection(db, "warehouse")




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
    alert('Successfuly Added to the Database')

  }



  //data variables
  const [newWHName, setnewWHName] = useState("");
  const [newWHNotes, setnewWHNotes] = useState("");
  const [newAddress, setnewAddress] = useState("");


  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
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
          onClick={addWarehouse}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewWarehouseModal;
