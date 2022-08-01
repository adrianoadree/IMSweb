import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db, st } from '../firebase-config';
import { ref } from 'firebase/storage';
import { getDocs, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import NewMapModal from '../components/NewMapModal';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Map from '../components/Map'


function Warehouse({isAuth}) {


  const [modalShowWH, setModalShowWH] = useState(false);
  const [modalShowMap, setModalShowMap] = useState(false);

  const [warehouse, setWarehouse] = useState([]);
  const warehouseCollectionRef = collection(db, "warehouse")
  const storageRef = ref(st,'/stockcard');
  const [whId, setWHId] = useState("xx");
  const warehouseDocRef = doc(db, "warehouse", whId)
  const [whName, setWHName] = useState("");
  const [whAdd, setWHAdd] = useState("");
  const [whNotes, setWHNotes] = useState("");
  const [whInit, setWHInit] = useState(false);
  const [whCol, setWHCol] = useState(0);
  const [whRow, setWHRow] = useState(0);
  const [whId4D, setWHId4D] = useState("");
  const [imgs,setImgs]=useState([]);
  const promises=[];


  onSnapshot(warehouseDocRef, (doc) => {
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
  
   const deleteToast = () => {
    toast.error('Warehouse Deletion Successful', {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } 
 
    const deleteWarehouse = async (id) => {
    const warehouseDoc = doc(db, "warehouse", id)
    await deleteDoc(warehouseDoc);
    deleteToast();
  }
  
  const getImage=async()=>{
  const imgRefs=await storageRef.listAll();
  const urls=await Promise.all().then(
  imgRefs.items.map((ref)=>ref.getDownloadURL()
  ));
  
  alert("hello");
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
                            <small>{warehouse.wh_name}</small>
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
                    				        	<Button
				        	
				        	onClick={()=>getImage()}>Show</Button>
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
                  <NewMapModal
                    show={modalShowMap}
                    onHide={() => setModalShowMap(false)} 
                    whid = {whId}
                    whcol = {whCol}
                    whrow = {whRow}/>
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
                          <small>Address: {whAdd} </small><br />
                          <small>Notes: {whNotes} </small><br />
                        </Card.Body>
                        <Card.Body>

                        </Card.Body>

                      </Card>
<Card className='shadow'>
<Card.Body>
                        {whInit?
                        <Map
                        wh_id = {whId}
                                              show={modalShowMap}
                      onHide={() => setModalShowMap(false)}
                        />
                        :
                        <p></p>
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
