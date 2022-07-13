import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import NewMapModal from '../components/NewMapModal';
import GetID from '../components/NewMapModal';


function Warehouse({isAuth}) {

  const [modalShowWH, setModalShowWH] = React.useState(false);
  const [modalShowMap, setModalShowMap] = React.useState(false);

  const [warehouse, setWarehouse] = useState([]);
  const warehouseCollectionRef = collection(db, "warehouse")
  const [whId, setWHId] = useState("xx");
  const warehouseDocRef = doc(db, "warehouse", whId)
  const [whName, setWHName] = useState("");
  const [whAdd, setWHAdd] = useState("");
  const [whNotes, setWHNotes] = useState("");
  const [whInit, setWHInit] = useState(false);
  const [whCol, setWHCol] = useState(0);
  const [whRow, setWHRow] = useState(0);
  const [whId4D, setWHId4D] = useState("");

  //delete row 

  onSnapshot(warehouseDocRef, (doc) => {
    setWHId4D(doc.id)
    setWHName(doc.data().wh_name)
    setWHAdd(doc.data().address)
    setWHNotes(doc.data().wh_notes)
    setWHInit(doc.data().isInit)
    setWHCol(doc.data().col)
    setWHRow(doc.data().row)
  }, [])


  //Read collection from database
  useEffect(() => {
    const qW = query(warehouseCollectionRef);

    const unsub = onSnapshot(qW, (snapshot) =>
      setWarehouse(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])
  
    const [cell, setCell] = useState([]);
    const cellCollectionRef = collection(db, "wh_cell")
  
    useEffect(() => {
    const qC = query(cellCollectionRef);

    const unsub = onSnapshot(qC, (snapshot) =>
      setCell(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])
  
    const deleteWarehouse = async (id) => {
    const warehouseDoc = doc(db, "warehouse", id)
    await deleteDoc(warehouseDoc);
    alert('Item Removed from the Database')

  }

  return (
    <div className="row bg-light">
      <Navigation />

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
                    onHide={() => setModalShowWH(false)} />




                  {warehouse.map((warehouse) => {
                    return (
                      <ListGroup.Item 
                      action 
                      key={warehouse.id}
                      eventKey={warehouse.id}
                      onClick={() => { setWHId(warehouse.id) }}
                     >
                        <div className='row'>
                          <div className="col-10 pt-1">
                          <div className="col-4">
                            <small>{warehouse.id}</small>
                            </div>
                            <div className="col-5">
                            <small>{warehouse.wh_name}</small>
                            </div>
                          </div>
                          <div className='col-2'>
                            <Button
                              variant="outline-danger"
                              size="sm"
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
                          <small>ID:</small><br />
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
                  <NewMapModal
                    show={modalShowMap}
                    onHide={() => setModalShowMap(false)} />
                  <div className='row'>
                    <div className='col-12 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                        	<div className="container-fluid">
                        		<div className="row">
				        	<div className="col-6">
				          		<h3>Warehouse Name: {whName}</h3>
				        	</div>
				        	<div className="col-6 text-right">
				        	{whInit?
				        	<button type="button" className="btn btn-light float-end" disabled> Set-Up Map </button>
				        	:
				        	<button type="button" className="btn btn-light float-end" onClick={() => { setModalShowMap(true)}}> Set-Up Map </button>
				        	}
				        	</div>
				        	
		                	</div>
                        	</div>
                        </Card.Header>
                        <Card.Body>
                        
                        {warehouse.map((warehouse) => {
                        return (
                        <div>
                        <small>ID: {whId4D} </small><br />
                          <small>Address: {whAdd} </small><br />
                          <small>Notes: {whNotes} </small><br />
                                         </div>
                                                  )
                        })}
                        </Card.Body>
                        <Card.Body>
				{cell.map((cell) => {
                    return (
                      <ListGroup.Item 
                     >
                        <div className='row'>
                          <div className="col-10 pt-1">
                          <div className="col-4">
                            <small>{whId.CL001}</small>
                            </div>
                          </div>
                        </div>

                      </ListGroup.Item>
                    )
                  })}
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
