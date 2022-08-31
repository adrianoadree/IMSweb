import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect, useRef } from 'react';
import { db, st} from '../firebase-config';
import { ref } from 'firebase/storage';
import { getDoc, collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark, faMap } from '@fortawesome/free-solid-svg-icons'
import { faMap as faMapO } from '@fortawesome/free-regular-svg-icons'
import { Create, Calendar, Document, InformationCircle, Compass } from 'react-ionicons'
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
  var showSidebar = true;
  const [modalShowWH, setModalShowWH] = useState(false);
  const [modalShowMap, setModalShowMap] = useState(false);
  const [init, setInit] = useState(true);

  const [warehouseDoc, setWarehouseDoc] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const storageRef = ref(st,'/stockcard');
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

  const dragItem = useRef();
  const dragOverItem = useRef();
  const [list, setList] = useState(['CL401','CL402','CL403','CL04','CL405','CL406','CL407','CL408','CL409']);

const dragStart = (e, position) => {
  dragItem.current = position;
  console.log(e.target.innerHTML);
};

const dragEnter = (e, position) => {
  dragOverItem.current = position;
  console.log(e.target.innerHTML);
};

const drop = (e) => {
  const copyListItems = [...list];
  const dragItemContent = copyListItems[dragItem.current];
  copyListItems.splice(dragItem.current, 1);
  copyListItems.splice(dragOverItem.current, 0, dragItemContent);
  dragItem.current = null;
  dragOverItem.current = null;
  setList(copyListItems);
};

var idContainer = [];

  
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

  function fillList (props) {
    var tempContainer = [];
    props.map((contents, index) =>
      tempContainer.push(contents.id)
    );
    tempContainer.map((codes, index) =>
      idContainer.push(codes)
    );
    
    console.log(idContainer);
    /*setList([...list, idContainer])*/
    

  }
  
  /*return (

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

*/

return (
  /*
  <>
  {
  list&&
  list.map((item, index) => (
    <div style={{backgroundColor:'lightblue', margin:'20px 25%', textAlign:'center', fontSize:'40px'}}
      onDragStart={(e) => dragStart(e, index)}
      onDragEnter={(e) => dragEnter(e, index)}
      onDragEnd={drop}
      key={index}
      draggable>
        {item}
    </div>
    ))}
  </>
  */
 <div>
    <Navigation />
    <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
      <div className="row contents">
          <div className="row py-4 px-5">
              <div className='sidebar horizontal'>
                <div className="hsidebar-segment left">
                  <h1 className="pb-2 module-title">Warehouse Management</h1>
                  <hr></hr>
                </div>
                <div className="hsidebar-segment divider">
                  
                </div>
                <div className="hsidebar-segment right">
                  <div className="warehouse-title">
                    <h5>Warehouse List</h5>
                  </div>
                  <div className="warehouse-list">
                    <div className="row">
                      <div className="col-11">
                        <ListGroup horizontal>
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
                                    <div className='warehouse-item-header'>
                                      <div className="code">
                                        {warehouse.id}
                                      </div>
                                        {warehouse.isInit?
                                          <div className="status">
                                          <FontAwesomeIcon icon={faMap} />
                                          </div>
                                        :
                                          <div className="status-disabled">
                                          <FontAwesomeIcon icon={faMapO} />
                                          </div>
                                        }
                                    </div>
                                    <div className='warehouse-item-name'>
                                      {warehouse.wh_name}
                                    </div>
                                  </div>

                                </ListGroup.Item>
                              )
                            })}
                        </ListGroup>
                      </div>
                      <div className="col-1 d-flex align-items-center">
                        <Button
                          className="add me-1"
                          data-title="Add New Warehouse"
                          onClick={() => setModalShowWH(true)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divider horizontal">

              </div>
              <Tab.Content>
                <Tab.Pane eventKey={whId}>
                  <div className="data-contents horizontal">
                    <div className="map-container">
                      <div className="warehouse-info mb-4">
                        <div className="row">
                          <div className="col-5">
                            <h3><strong>{warehouseDoc.wh_name}</strong></h3>
                            {warehouseDoc.address}
                          </div>
                          <div className="col-6">
                            <div className="data-label">
                            <Create
                              className="me-2 pull-down"
                              color={'#000'} 
                              title={'Category'}
                              height="25px"
                              width="25px"
                            />
                            Notes
                              {warehouseDoc.wh_notes}
                            </div>
                          </div>
                          <div className="col-1 d-flex align-items-center">
                            <Button
                            className="delete me-1"
                            data-title="Delete Warehouse"
                            onClick={() => { deleteWarehouse(whId) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="warehouse-map">
                                    {warehouseDoc.isInit?
                                    /*
                                      <div className="row g-0">
                                      {
                                        warehouseDoc.cell.map((cells, index) => (
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
                                                      eventKey={info}>
                                                      <span key={info}> {info}</span>
                                                    </ListGroup.Item>
                                                  ))}
                                                </ListGroup>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      */
                                      
                                        <>
                                        {fillList(warehouseDoc.cell)}
                                        <div className="row">
                                          {list.map((item, index) => (
                                            <div className="col-4"
                                              onDragStart={(e) => dragStart(e, index)}
                                              onDragEnter={(e) => dragEnter(e, index)}
                                              onDragEnd={drop}
                                              key={index}
                                              draggable>
                                              <div className="wh_cell">

                                              {item}
                                              </div>
                                            </div>
                                            ))}
                                        </div>
                                        </>
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