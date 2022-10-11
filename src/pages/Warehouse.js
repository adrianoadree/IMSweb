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
import { Checkbox, CaretDown, CaretUp } from 'react-ionicons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import NewMapModal from '../components/NewMapModal';
import FillMapModal from '../components/FillMapModal';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Map from '../components/Map'
import QRCode from "react-qr-code";
import { UserAuth } from '../context/AuthContext'
import  UserRouter  from '../pages/UserRouter'


function Warehouse({isAuth}) {

  const [shown, setShown] = useState(true);
  const [modalShowWH, setModalShowWH] = useState(false);
  const [modalShowMap, setModalShowMap] = useState(false);
  const [isInit, setIsInit] = useState(false);

  const [warehouseDoc, setWarehouseDoc] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const storageRef = ref(st,'/stockcard');
  const masterdataDocRef = doc(db, "masterdata", "warehouse");
  const [whId, setWHId] = useState("xx");
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [col, setCol] = useState("");
  const [row, setRow] = useState("");
  const [cntr, setCntr] = useState(0);
  const [dimensions, setDimensions] = useState();
  const [fontSize, setFontSize] = useState();
  const [editing, setEditing] = useState(true);
  const [qrVisible, setQRVisible] = useState(false);
  const [cellIdVisible, setCellIdVisible] = useState(false);
  const [warehouseCell, setWarehouseCell] = 
  useState(
    [
      {
        "A00": {
          "products": []
        },
        "A01": {
          "products": []
        }
      },
      {
        "B01": {
          "products": []
        },
        "B02": {
          "products": []
        }
      },
    
    ]
  );

  const dragItem = useRef();
  const dragOverItem = useRef();
  const [list, setList] = useState([]);

  useEffect(() => {
    console.log(col)
    setDimensions(1200/col)
    setFontSize(60/col)
    console.log(editing)
    var allBoxes = document.querySelectorAll(".box");
    var allGridlines = document.querySelectorAll(".box-col");
    if (editing) {
      for(var i = 0; i < allGridlines.length; i++) {
        allGridlines[i].classList.remove('border-0');
      }

      for(var i = 0; i < allBoxes.length; i++) {
        allBoxes[i].classList.remove('disable-hovering');
      }
    }
    else
    {
      for(var i = 0; i < allGridlines.length; i++) {
        allGridlines[i].classList.add('border-0');
      }

      for(var i = 0; i < allBoxes.length; i++) {
        allBoxes[i].classList.add('disable-hovering');
      }
    }

    var allQR = document.querySelectorAll(".qr-code");
    if (qrVisible) {
      for(var i = 0; i < allQR.length; i++) {
        allQR[i].classList.remove('d-none');
      }
    }
    else
    {
      for(var i = 0; i < allQR.length; i++) {
        allQR[i].classList.add('d-none');
      }
    }

    var allID = document.querySelectorAll(".cell-id");
    if (cellIdVisible) {
      for(var i = 0; i < allID.length; i++) {
        allID[i].classList.remove('d-none');
      }
    }
    else
    {
      for(var i = 0; i < allID.length; i++) {
        allID[i].classList.add('d-none');
      }
    }
  }, )

  useEffect(() => {
    if(warehouseDoc == undefined) {
      setIsInit(false)
    }
    else
    {
      setIsInit(true)
      setCol(warehouseDoc.col)
      setRow(warehouseDoc.row)
      setWarehouseCell(warehouseDoc.cells)
    }
  }, [warehouseDoc])


  useEffect(() => {
    if(warehouseCell == undefined) {

    }
    else
    {
      
      /*refernce for mapping errors
      warehouseCell.map((content,index) => {
        console.log(content) //index-basedrow
        Object.keys(content).map((k) => {
          console.log(content[k])//obj-based col
          console.log(content[k].products)// products
          content[k].products.map((val, k) => {
            console.log(val)
          })
        })
      })
      */
    }
  }, [warehouseCell])
  
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

    useEffect(() => {
      if (user) {
        setUserID(user.uid)
      }
    }, [{ user }])
  
  
    //read Functions
  
    useEffect(() => {
      //read purchase_record collection
      if (userID === undefined) {
  
        const collectionRef = collection(db, "warehouse")
        const q = query(collectionRef, where("user", "==", "DONOTDELETE"));
  
        const unsub = onSnapshot(q, (snapshot) =>
          setWarehouse(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
      }
      else {
        const collectionRef = collection(db, "warehouse");
        const q = query(collectionRef, where("user", "==", userID));
    
        const unsub = onSnapshot(q, (snapshot) =>
          setWarehouse(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
    
        return unsub;
      }
  
  
    }, [userID])  

  useEffect(() => {
    async function readWarehouseDoc() {
      const warehouseRef = doc(db, "warehouse", whId)
      const docSnap = await getDoc(warehouseRef)
      if (docSnap.exists()) {
        setWarehouseDoc(docSnap.data());
      }
    }
    readWarehouseDoc()
  }, [whId])
  
  
var format = "";
var tempArray = [];
var tempProdArray = [];

const toggle=() =>{
  var whl = document.getElementById("warehouse-list-bar");
  var tgl = document.getElementById("warehouse-list-visibility-toggle");
  var whlf = document.getElementById("warehouse-list-bar-footer");
  var whIn = document.getElementById("warehouse-info");
  if (whl.style.display === "none") {
    whl.style.display = "block";
    tgl.setAttribute("data-title","Hide");
    setShown(true);
    whlf.classList.remove("warehouse-list-bar-hidden");
  } else {
    whl.style.display = "none";
    tgl.setAttribute("data-title","Show");
    setShown(false);

    whlf.classList.add("warehouse-list-bar-hidden");
  }
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

  
  function isChecked (status) {
    if (status)
    {
      return "checked";
    }
    else
    {
      return "";
    }
  }

  function getWarehouseID(id) {
    return id.substring(0,4)

  }

  function isLoaded(array) {
    if (array === undefined || array.length == 0) {
      return false;
    }
    else
    {
      return true;
    }

  }

  const changeColor = async (cells, rIndex, cIndex, color) => {
    var tempCells = cells;//get accounts list and place in temp array
    tempCells[rIndex][cIndex].color = color;
    const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        cells: tempCells
      }); 
      console.log(tempCells)
  }

  const toStorage = async (cells, rowIndex, colIndex, option) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].isStorage = true;
    tempCells[rowIndex][colIndex].type = option;
    tempCells[rowIndex][colIndex].orientation = "flip-top";
    const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        cells: tempCells
      });
    
      console.log(tempCells)
  }

  const changeStorage = async (cells, rowIndex, colIndex, type) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].type = type;
    const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        cells: tempCells
      });
    
      console.log(tempCells)
  }

  const flipStorage = async (cells, rowIndex, colIndex, orientation) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].orientation = orientation;
    const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        cells: tempCells
      });
    
      console.log(tempCells)
  }

  const deStorage = async (cells, rowIndex, colIndex) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].isStorage = false;
    const getMap = doc(db, 'warehouse', whId);
    await updateDoc(getMap,{
        cells: tempCells
      });
    
      console.log(tempCells)
  }


return (
 <div>
  <UserRouter
      route='/warehouse'
      />
    <Navigation />
    <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
      <div className="row contents">
          <div className="row py-4 px-5">
              <div className='sidebar horizontal' id="warehouse-list-bar">
                <div className="hsidebar-segment left">
                  <h1 className="pb-2 module-title">Warehouse Management</h1>
                  <hr></hr>
                </div>
                <div className="hsidebar-segment divider">
                  
                </div>
                <div className="hsidebar-segment right">
                  <div className="warehouse-title">
                    <h5>Warehouse List [{warehouse.length}]</h5>
                  </div>
                  <div className="warehouse-list">
                    <div className="row">
                      <div className="col-11">
                      <NewWarehouseModal
                            show={modalShowWH}
                            onHide={() => setModalShowWH(false)} 
                          />
                        {isLoaded(warehouse)?
                          <ListGroup horizontal>
                          
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
                                        {getWarehouseID(warehouse.id)}
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
                      :  
                      <div className="w-100 d-flex justify-content-center align-items-center" style={{height: '76.4px'}}>

                        Nothing to show
                      </div>
                      }
                        
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
              <div id="warehouse-list-bar-footer" style={{height: '30px'}}>
                <button
                  id="warehouse-list-visibility-toggle"
                  className="hide float-end"
                  data-title="Hide"
                  onClick={() => toggle()}
                >
                  {shown?
                    <CaretUp
                      className="caret pull-down"
                      color={'#000000'} 
                      title={'Category'}
                      height="15px"
                      width="15px"
                    />
                    :
                    <CaretDown
                    className="caret pull-down"
                    color={'#000000'} 
                    title={'Category'}
                    height="15px"
                    width="15px"
                    />
                  }
                </button>
              </div>
              <div className="divider horizontal">

              </div>
              <Tab.Content>
                <Tab.Pane eventKey={whId}>
                  <div className="data-contents horizontal">
                    <div className="map-container">
                      <div className="warehouse-info mb-4">
                        <div className="row">
                          <div className="col-7">
                            <h3><strong>{warehouseDoc.wh_name}</strong></h3>
                            {warehouseDoc.address}
                          </div>
                          <div className="col-4">
                            <div className="warehouse-notes">
                              <div className="d-inline-block me-2">

                              <Create
                              className="me-2 pull-down"
                              color={'#000'} 
                              title={'Category'}
                              height="25px"
                              width="25px"
                            />
                            Notes:
                            <br />
                              </div>
                              <div className="d-inline-block">
                              {warehouseDoc.wh_notes}
                              </div>
                              
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
                      <div className="warehouse-info-map-divider">
                        
                      </div>
                      <div className="warehouse-map-options">
                        <div className="row">
                          <div className="col text-center">
                      Editing?
                          </div>
                          <div className="col text-center">
                            QR?
                          </div>
                          <div className="col text-center">
                            Space ID's?
                          </div>
                        </div>
                        <div className="row">
                          <div className="col d-flex justify-content-center">
                            
                          <label class="vertical-switch">
                          <input 
                          type="checkbox"
                          checked={isChecked(editing)}
                          defaultValue="true"
                          onClick={()=>{if(editing){setEditing(false)}else{setEditing(true)}}}
                          />
                          <span class="vertical-slider round"></span>
                  </label>
                          
                          </div>
                          
                          <div className="col d-flex justify-content-center">
                          
                            <label class="vertical-switch">
                                  <input 
                                  type="checkbox"
                                  checked={isChecked(qrVisible)}
                                  defaultValue="true"
                                  onClick={()=>{if(qrVisible){setQRVisible(false)}else{setQRVisible(true)}}}
                                  />
                                  <span class="vertical-slider round"></span>
                          </label>                     
                          </div>
                          
                          <div className="col d-flex justify-content-center">
                          <label class="vertical-switch">
                                  <input 
                                  type="checkbox"
                                  checked={isChecked(cellIdVisible)}
                                  defaultValue="false"
                                  onClick={()=>{if(cellIdVisible){setCellIdVisible(false)}else{setCellIdVisible(true)}}}
                                  />
                                  <span class="vertical-slider round"></span>
                          </label>
                          </div>
                        </div>
                      </div>
                      <NewMapModal
                                                  show={modalShowMap}
                                                  onHide={() => setModalShowMap(false)}
                                                  id={whId}
                                                  />
                      <div className="warehouse-map">
                                    {warehouseDoc.isInit?
                                        <>
{warehouseDoc.cells.map((content,index) => {
      return(
        <div className="box-row d-flex align-items-center">    
        {Object.keys(content).map((k) => {
          return (
            <>
                              
              <a className="box d-flex align-items-center justify-content-center">
                <div className="box-call-to-action">
                    <div className="box-ca-container">
                    <div className="color-changer d-flex justify-content-center align-items-center mb-2">
                      <div className="color-swatch d-flex justify-content-center">
                        <button className="color"
                          style={{backgroundColor: '#ffffff'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "#ffffff")
                           }}
                        >
                          </button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fsmooth_conrete.jpg?alt=media&token=0773acac-c048-4f33-8f39-47fd644330d6")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fsmooth_conrete.jpg?alt=media&token=0773acac-c048-4f33-8f39-47fd644330d6")
                           }}
                        >
                        </button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Frough_concrete.jpg?alt=media&token=3cce02b1-a2fd-49cc-8011-507f6ea3c352")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Frough_concrete.jpg?alt=media&token=3cce02b1-a2fd-49cc-8011-507f6ea3c352")
                           }}
                        ></button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fdark_wood.jpg?alt=media&token=d3385145-b7ac-4845-a06c-e51012d56226")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fdark_wood.jpg?alt=media&token=d3385145-b7ac-4845-a06c-e51012d56226")
                           }}
                        ></button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Flight_wood.jpg?alt=media&token=307a303c-1698-4c92-ad96-def38752042e")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Flight_wood.jpg?alt=media&token=307a303c-1698-4c92-ad96-def38752042e")
                           }}
                        ></button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fwhite_tile.jpg?alt=media&token=09c77e80-ba5c-44c8-a056-e169a449100d")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fwhite_tile.jpg?alt=media&token=09c77e80-ba5c-44c8-a056-e169a449100d")
                           }}
                        ></button>
                        <button className="color"
                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fbrick.jpg?alt=media&token=403814c0-b98b-4c8f-89f9-f23720905649")'}}
                          onClick={()=>{changeColor(warehouseDoc.cells, index, k, 
                            "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fbrick.jpg?alt=media&token=403814c0-b98b-4c8f-89f9-f23720905649")
                           }}
                        ></button>
                        </div>
                        </div>
                        
                        
                        {content[k].isStorage?
                        <>
                        <div className="d-flex flex-row mb-2">
                          
                          <button className="box-call-to-action-button me-5"
                          >Add Products</button>
                          <div className="storage-options">
                          <button
                      className="box-call-to-action-button "
                      value="delete"
                      onClick={(show)=>deStorage(warehouseDoc.cells, index, k)}>Clear</button>
                            </div>
  
                          </div>
                        <div className="storage-options d-flex flex-row mb-2">
                          <button
                    className="box-call-to-action-button no-click"
                    value="context-sm">Edit:</button>
                    <button
                    className="box-call-to-action-button with-icon"
                    data-title="Palet"
                    onClick={()=>changeStorage(warehouseDoc.cells, index, k, 'palet')}>
                      <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-palet.png?alt=media&token=8c2de023-30de-4f00-8d2b-453a25ae823f")'}}>
                        </div>
                      </button>
                      <button
                    className="box-call-to-action-button with-icon"
                    data-title="Shelf"
                    onClick={()=>changeStorage(warehouseDoc.cells, index, k, 'shelf')}>
                      <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-shelf.png?alt=media&token=167f685a-d810-4fe4-a90e-a5cd2168647c")'}}></div>
                      </button>
                      <button
                    className="box-call-to-action-button with-icon"
                    onClick={()=>changeStorage(warehouseDoc.cells, index, k, 'freezer')}>
                      <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-freezer.png?alt=media&token=83f133ae-7159-4c4c-8d14-bd61f35ef8ed")'}}>
                      </div>
                      </button>
                      
                    

                          </div>
                          <div className="storage-options d-flex flex-row mb-2">
                          <button
                    className="box-call-to-action-button no-click"
                    value="context-sm">Flip:</button>
                    <button
                    className="box-call-to-action-button with-icon"
                    onClick={()=>flipStorage(warehouseDoc.cells, index, k, 'flip-top')}>
                      <div 
                      className="flip-top"
                      style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}></div>
                      </button>
                      <button
                    className="box-call-to-action-button with-icon"
                    onClick={()=>flipStorage(warehouseDoc.cells, index, k, 'flip-left')}>
                      <div 
                      className="flip-left"
                      style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}></div>
                      
                      </button>
                      <button
                    className="box-call-to-action-button with-icon"
                    onClick={()=>flipStorage(warehouseDoc.cells, index, k, 'flip-right')}>
                      <div 
                      className="flip-right"
                      style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}></div>
                      
                      </button>
                      <button
                    className="box-call-to-action-button with-icon"
                    onClick={()=>flipStorage(warehouseDoc.cells, index, k, 'flip-bottom')}>
                      <div 
                      className="flip-bottom"
                      style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}></div>
                      
                      </button>

                          </div>
                        
                        
                        </>
                        :
                          <>
                          <div className="storage-options d-flex flex-row">
                          <button
                    className="box-call-to-action-button no-click"
                    value="context">Place a:</button>
                    <button
                    className="box-call-to-action-button"
                    onClick={()=>toStorage(warehouseDoc.cells, index, k, "palet")}>Palet</button>
                    <button
                    className="box-call-to-action-button"
                    onClick={()=>toStorage(warehouseDoc.cells, index, k, "shelf")}>Shelf</button>
                    <button
                    className="box-call-to-action-button"
                    onClick={()=>toStorage(warehouseDoc.cells, index, k, "freezer")}>Freezer</button>
                          </div>
                          </>
                        }
                      
                      </div>
              
                    

                  
                </div>
              <div className="box-col" style ={{width: dimensions + 'px', height: dimensions + 'px', backgroundImage: 'url("' + content[k].color + '")', backgroundColor: content[k].color}}>
              {content[k].isStorage?
                  <div className={'storage ' + content[k].type + ' ' + content[k].orientation}>
                  <div className="cell-info" style={{fontSize: fontSize + 'pt'}}>
                    <span className="cell-id d-none">{content[k].id}</span>
                    <div className="qr-code d-flex justify-content-center d-none">
                        <QRCode
                          value={content[k].id}
                          size={50}
                        />
                        </div>
                </div>      
                  {content[k].products.map((val, k) => {
                    return(
                      <div>
                        {val}
                      </div>
                    )
                  })}
                  </div>

:

        
        <>
        <div className="cell-info" style={{fontSize: fontSize + 'pt'}}>
                  <span className="cell-id d-none">{content[k].id}</span>
              </div>      
                {content[k].products.map((val, k) => {
                  return(
                    <div>
                      {val}
                    </div>
                  )
                })}
        </>
        }
              </div>
              </a>
              
              
          
          
          </>   
          ); 
        })}
      </div>  
      );
    })}
                                          
                                        </>
                                      :
                                      <div>
                                        <div className="text-center">
                                          <h4>Warehouse Map Not Initialized</h4>
                                            <br />
                                            
                                            <Button
                                          className="btn btn-primary"
                                          style={{ width: "150px" }}
                                          onClick={()=>setModalShowMap(true)}>
                                          Set Up Now
                                        </Button>
                                        </div>
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