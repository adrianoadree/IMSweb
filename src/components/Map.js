import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db, firebase, uid, ref, getStorage, st } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark, faQrcode, faEye } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductQuickView from './ProductQuickView';


function Map(props) {

var cntr = 12;
var data;

  const mapDocRef = doc(db, "warehouse", props.wh_id);
  const [cells, setCells] = useState([]);
  // [row, setRow] = useState(0);
  const [colm, setCol] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [show, setShow] = useState(false);
  const [addShow, setAddShow] = useState(false);
  const [imageUrl, setImageUrl] = useState(undefined);
  const [prodId, setProdId] = useState("xx");


const updateCntr = () => {
cntr++;
}


/*const cellContents = async () => {
  await onSnapshot(doc(db, "warehouse", props.whId), (doc) => {
    return doc.data().cells;
  });
};*/

  onSnapshot(mapDocRef, (doc) => {
    setCells(doc.data().cell)
    setCol(doc.data().col)
  }, [])
  

//setRow(props.whRow);
//setCol(props.whCol);

  return(
	<div>
	<div className="row g-0">
	{
cells.map((cells, index) => (
        <div key="{index}" className={'col-' + Number(12/colm)}>
        <div className="wh_cell">
		<div className="whc_header">
			<div className="whch_left">
			      <Button variant="light">
		              <FontAwesomeIcon icon={faQrcode} />
		              </Button>
			</div>
			<div className="whch_right">
				<h4>{cells.id}</h4>
			</div>
		</div>
              <div className="whc_body">	
                <ListGroup variant="flush">
                  {cells.products.map((info,i)=>(
                      <ListGroup.Item
                        action
                        key={info}
                        eventKey={info}
                        onClick={() => { setProdId(info) }}>
                                                        <Button
                              className="text-dark"
                              variant="outline-light"
                              size="sm"
                              onClick={() => { setModalShow(true) }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>   {info}
                          <ProductQuickView
                                                show={modalShow}
                      onHide={() => setModalShow(false)}
                      productId={prodId}
                          />
                      </ListGroup.Item>
                      ))}
                       </ListGroup>
		</div>
        </div>
        </div>
        ))}
    </div>
    </div>
);


}
export default Map;
