import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db, storage } from '../firebase-config';
import { ref } from 'firebase/storage';
import { getDoc, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import FillMapModal from '../components/FillMapModal';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Map from '../components/Map'
import QRCode from "react-qr-code";


function Warehouse({isAuth}) {

function refreshPage() {
    window.location.reload(false);
  }
  const [modalShowWH, setModalShowWH] = useState(false);
  const [modalShowMap, setModalShowMap] = useState(false);
  const [init, setInit] = useState(true);

  const [warehouseDoc, setWarehouseDoc] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const storageRef = ref(storage,'/stockcard');
  const masterdataDocRef = doc(db, "masterdata", "warehouse");
  const [cells, setCells] = useState([]);
  const [whId, setWHId] = useState("xx");
  const [cellId, setCellId] = useState("");
  const [cellIndex, setCellIndex] = useState(0);
  
  const [newCol, setNewCol] = useState("");
  const [newRow, setNewRow] = useState("");
  const [newCellsArray, setNewCellsArray] = useState([{ id: "", products: [] }]);
  const [cntr, setCntr] = useState(0);
  const [cellNamesArray, setCellNamesArray] = useState([]);


  
   /*useEffect(() => {
        const unsub =   onSnapshot(warehouseDocRef, (doc) => {
    setWHName(doc.data().wh_name)
    setWHAdd(doc.data().address)
    setWHNotes(doc.data().wh_notes)
    setWHInit(doc.data().isInit)
    setWHCol(doc.data().col)
    setWHRow(doc.data().row)
	 });
        return unsub;
    }, [])*/
    
    useEffect(() => {
    async function readWarehouseDoc() {
      const warehouseRef = doc(db, "warehouse", whId)
      const docSnap = await getDoc(warehouseRef)
      if (docSnap.exists()) {
        setWarehouseDoc(docSnap.data());
        setCells(docSnap.data().cell);
        setInit(docSnap.data().isInit);
      }
    }
    readWarehouseDoc()
  }, [whId])
  
    useEffect(() => {
    const collectionRef = collection(db, "warehouse");
    const q = query(collectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setWarehouse(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])
var format = "";
var tempArray = [];
var tempProdArray = [];

const pushCellsArray = () => {
	var N = newCol*newRow;
	const arr = Array.from(Array(N+1).keys()).slice(1);
	for (var i=1; i < N+1; i++) {
		var tempObj = {};
		var format = i + "";
		while(format.length < 2) {format = "0" + format;}
		format = "CL" + (cntr-1) + format;
		tempObj["id"] = format;
		tempObj["products"] = tempProdArray;
		tempArray.push(tempObj);
    }
    console.log(tempArray);
}



   useEffect(() => {
        const unsub =   onSnapshot(masterdataDocRef, (doc) => {
setCntr(doc.data().idCntr)
	 });
        return unsub;
    }, [])
  
  
   const deleteToast = () => {
    toast.error('Warehouse Deletion Successful', {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } 
 
    const deleteWarehouse = async (id) => {
    const warehouseDoc = doc(db, "warehouse", id)
    await deleteDoc(warehouseDoc);
    deleteToast();
  }
  
    const addMap = async () => {
    pushCellsArray();
    setInit(true);
    refreshPage();
   const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        col: Number(newCol)
        , row: Number(newRow)
        , isInit: true
        , cell: tempArray
      });
      
  }
  
  function getCLID (props) {
  	setCellIndex(props);
  	setModalShowMap(true);
  }
  
  
  return (

    <div className="row bg-light">
      <Navigation />
        
        <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row bg-light">

          <div className='col-3 p-5'>

            <Card className='shadow'>
              <Card.Header className='bg-primary'>
                <div className='row'>
                  <div className='col-9 pt-2 text-white'>
                    <h6>Your Warehouses:</h6>
                  </div>
                  <div className='col-3'>
                    <Button variant="primary"
                      onClick={() => setModalShowWH(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "500px" }}>
                <ListGroup variant="flush">
           
                  <NewWarehouseModal
                    show={modalShowWH}
                    onHide={() => setModalShowWH(false)} 
                    />

                  {warehouse.map((warehouse) => {
                    return (
                      <ListGroup.Item 
                      action 
                      key={warehouse.id}
                      eventKey={warehouse.id}
                      onClick={() => { setWHId(warehouse.id) }}
                     >
                        <div className='row'>
                          <div className="col-9 pt-1">
                          <div className='row'>
                          <small><strong>{warehouse.wh_name}</strong></small>
                          <small>{warehouse.id}</small>
                          </div>
                          </div>
                          <div className='col-3'>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => { deleteWarehouse(warehouse.id) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>

                      </ListGroup.Item>
                    )
                  })}

                </ListGroup>
              </Card.Body>
            </Card>
          </div>

          <div className='col-9 p-5'>
            <Tab.Content>
        	<Tab.Pane eventKey={0}>
                <div className='row px-5'>
                  <div className='row'>
                    <h1 className='text-center py-3 p1'>Warehouse Management</h1>
                  </div>

                  <div className='row'>
                    <div className='col-12 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                        	<div className="container-fluid">
                        		<div className="row">
				        	<div className="col-6">
				          		<h3>Warehouse Name:</h3>
				        	</div>
				        	<div className="col-6 text-right">
				        	</div>

		                	</div>
                        	</div>
                        </Card.Header>
                        <Card.Body>
                          <small>Address:</small><br />
                          <small>Notes:</small><br />
                        </Card.Body>

                      </Card>

                    </div>
                  </div>

                </div>
              </Tab.Pane>

        
              <Tab.Pane eventKey={whId}>
                
                <div className='row px-5'>
                  <div className='row'>
                    <h1 className='text-center py-3 p1'>Warehouse Management</h1>
                  </div>
                  <div className='row'>
                    <div className='col-12 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                        	<div className="container-fluid">
                        		<div className="row">
				        	<div className="col-6">
				          		<h3>Warehouse Name: {warehouseDoc.wh_name}</h3>
				        	</div>
				        	
		                	</div>
                        	</div>
                        </Card.Header>
                        <Card.Body>
                          <small>Address: {warehouseDoc.address} </small><br />
                          <small>Notes: {warehouseDoc.wh_notes} </small><br />
                        </Card.Body>

                        <Card.Body>
                           {init?
				<div className="row g-0">
				{
					cells.map((cells, index) => (
						<div className={'col-' + Number(12/warehouseDoc.col)}>
						<div className="wh_cell">
							<div className="whc_header">
								<div className="whch_left">
						  <QRCode value={cells.id} size={50}/>
						  							       <Button
							       	variant ="outline-dark"
									    className="rounded-circle ms-3 mt-1"
									    style={{ width: "40px"}}
									    onClick={() => { getCLID(index) }}>
									    <FontAwesomeIcon icon={faPlus} />
									</Button>
								</div>
								<div className="whch_right">
									<h4 key={cells.id}>{cells.id}</h4>
								</div>
							</div>
						      <div className="whc_body">
						                              <FillMapModal
                    show={modalShowMap}
                    onHide={() => setModalShowMap(false)}
                    whid = {whId}
                    cellindex = {cellIndex}
                    />	
							<ListGroup variant="flush">
							  {cells.products.map((info,i)=>(
							      <ListGroup.Item
								action
								key={info}
								eventKey={info}
								>
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
                        <div>
                        <div className="text-center">
                        Warehouse Map Not Initialized
                        </div>
                                <div className="p-3">
          <div className="row">
            <div className="col-6">
                        <label>No. of Columns</label>
              <input type="number"
                className="form-control"
                placeholder="Column"
                onChange={(event) => { setNewCol(event.target.value); }}
              />
            </div>
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
        			}
                        </Card.Body>
	
                      </Card>
                    </div>
                  </div>

                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </Tab.Container>






    </div>
  );

}
export default Warehouse;