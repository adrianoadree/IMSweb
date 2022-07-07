import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useState } from 'react';

function NewMapModal(props) {



  const warehouseCollectionRef = collection(db, "warehouse");
  const cellCollectionRef = collection(db, "wh_cell");



  const addMap = async () => {
   const getMap = doc(db, 'warehouse',"WH001");
    await updateDoc(getMap,{
        col: newCol
        , row: newRow
        , isInit: true
      });

    alert('Successfuly Added to the Database')

  }



  //data variables
  const [newCol, setnewCol] = useState("");
  const [newRow, setnewRow] = useState("");


	

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="px-3">
          Initialize Map
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-3">
          <div className="row my-2">
            <label>No. of Columns</label>
            <div className="col-6">
              <input type="text"
                className="form-control"
                placeholder="Column"
                onChange={(event) => { setnewCol(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2">
            <div className="col-6">
              <label>No. of Rows</label>
              <input type="text"
                className="form-control"
                placeholder="Row"
                rows={3}
                onChange={(event) => { setnewRow(event.target.value); }}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="btn btn-success"
          style={{ width: "150px" }}
          onClick={addMap}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewMapModal;
