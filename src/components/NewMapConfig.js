import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useState } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NewMapConfig(props) {

  const warehouseCollectionRef = collection(db, "warehouse");
  const [arr, setArr] = useState([]);
  const [newCol, setNewCol] = useState("");
  const [newRow, setNewRow] = useState("");
  const [cellsArray, setCellsArray] = useState([{ id: "", products: [] }]);


  const successToast = () => {
    toast.success(' Warehouse Initialized for Mapping ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const addMap = async () => {
   const getMap = doc(db, 'warehouse', props.whid);
    await updateDoc(getMap,{
        col: Number(newCol)
        , row: Number(newRow)
        , isInit: true
      });

   successToast();

  }

  /*const createCells = () => {
	  setArr(Array(newCol*newRow).fill(1));
   }*/

  //data variables

  return (
  	<div>
        <div className="p-3">
          <div className="row my-2">
            <label>No. of Columns</label>
            <div className="col-6">
              <input type="number"
                className="form-control"
                placeholder="Column"
                onChange={(event) => { setNewCol(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2">
            <div className="col-6">
              <label>No. of Rows</label>
              <input type="number"
                className="form-control"
                placeholder="Row"
                onChange={(event) => { setNewRow(event.target.value); }}
              />
            </div>
          </div>
        </div>
            <Button
          className="btn btn-success"
          style={{ width: "150px" }}
          onClick={addMap}>
          Save
        </Button>
    </div>
  );
}


export default NewMapConfig;
