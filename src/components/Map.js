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
import QRCode from "react-qr-code";


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
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);


	const updateCntr = () => {
	cntr++;
	}

   useEffect(() => {
        const unsub = onSnapshot(mapDocRef, (doc) => {
	    setCells(doc.data().cell)
	    setCol(doc.data().col)
	 });
        return unsub;
    }, [])
  
  useEffect(() => {
    //query stockcard document that contains, [queryList] datas
    async function queryStockcardData() {
      const stockcardRef = collection(db, "stockcard")

      if (queryList.length !== 0) {
        const q = await query(stockcardRef, where("__name__", "in", [...queryList]));
        const unsub = onSnapshot(q, (snapshot) =>
          setStockcardData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
        );
        return unsub;
      }
    }
    queryStockcardData();
  }, [queryList]) 

    //Dynamic Add Product Button ------------------------------------------------------------

    //End of Dynamic Button functions ---------------------------
  return(
	<div>
	<div className="row g-0">
	{
cells.map((cells, index) => (
        <div className={'col-' + Number(12/colm)}>
        <div className="wh_cell">
		<div className="whc_header">
			<div className="whch_left">
          <QRCode value={cells.id} size={50}/>
			</div>
			<div className="whch_right">
				<h4 key={cells.id}>{cells.id}</h4>
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
<span key={info}> {info}</span>

                      </ListGroup.Item>
                      ))}
                       </ListGroup>
		</div>
        </div>
        </div>
        ))}
    </div>
    :
    <div>Noap</div>
    </div>
);


}
export default Map;
