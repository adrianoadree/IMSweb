import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db, firebase, uid } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Map(props) {

  const mapDocRef = doc(db, "warehouse", props.whId);
  const [cells, setCells] = useState([]);
  // [row, setRow] = useState(0);
  //const [col, setCol] = useState(0);



const collectionQuery = query(
  collection(db, 'warehouse'),
  where('id', '==', props.whId),
);

/*const cellContents = async () => {
  await onSnapshot(doc(db, "warehouse", props.whId), (doc) => {
    return doc.data().cells;
  });
};*/

  onSnapshot(mapDocRef, (doc) => {
    setCells(doc.data().cells)
  }, [])
//setRow(props.whRow);
//setCol(props.whCol);

  return(
	<div>
	{
cells.map((n) => (
        <div className="grid">{n}</div>
        ))
    }
	</div>
);


}
export default Map;
