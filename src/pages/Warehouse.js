import React from 'react';
import { Tab, Button, ListGroup, Modal, Card, Table,FormControl,InputGroup} from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase-config';
import { collection, doc, deleteDoc, updateDoc, onSnapshot, query, where, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPlus, faMap, faEdit, faArrowCircleRight, faDoorOpen, faDoorClosed, faSave, faGears,faSearch, faClose } from '@fortawesome/free-solid-svg-icons'
import { faMap as faMapO } from '@fortawesome/free-regular-svg-icons'
import QRCode from "react-qr-code";
import { Create, Text, QrCode as QR, SearchOutline} from 'react-ionicons'
import { CaretDown, CaretUp } from 'react-ionicons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Warning } from 'react-ionicons'

import { UserAuth } from '../context/AuthContext'
import  UserRouter  from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import  ProductQuickView  from '../components/ProductQuickView'


function Warehouse(props) {
  
  const [productToView, setProductToView] = useState(["IT0000001"])
  const [modalShowWH, setModalShowWH] = useState(false);
  const [modalShowMap, setModalShowMap] = useState(false);
  const [modalShowAP, setModalShowAP] = useState(false);
  const [modalShowVS, setModalShowVS] = useState(false);
  const [modalShowPQV, setModalShowPQV] = useState(false); //product quick view modal
  const [deleteWarehouseModalShow, setDeleteWarehouseModalShow] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState(false);
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [cellSpecifications, setCellSpecifications] = useState({type:"",products:[]});
  const [warehouse, setWarehouse] = useState();
  const [whId, setWHId] = useState();
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [editingMap, setEditingMap] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [qrVisible, setQRVisible] = useState(false);
  const [cellIdVisible, setCellIdVisible] = useState(false);
  const [warehouseListVisible, setWarehouseListVisible] = useState(true);
  const [colIndex, setColIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(0);
  const [isStockcardFetched, setIsStockcardFetched] = useState();
  const [key, setKey] = useState('main');//Tab controller
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")
  const [openStorageHovered, setOpenStorageHovered] = useState(false)
  const [closeStorageHovered, setCloseStorageHovered] = useState(false)
  const [warehouseTemplates, setWarehouseTemplates] = useState([])
  const [isTemplateChosen, setIsTemplateChosen]= useState(false)
  const [templateChosen, setTemplateChosen] = useState({})
  const [warehouseFormerLength, setWarehouseFormerLength] = useState(0)
  const [searchResult, setSearchResult] = useState([])
  const storageSearchRef = useRef(null);

  //element state updater
  useEffect(() => {
    var allGridlines = document.querySelectorAll(".box-col"); // select all box-col for editing
    if (editingMap) {
      for(var i = 0; i < allGridlines.length; i++) {allGridlines[i].classList.remove('border-0');} // show editing gridlines
    }
    else
    {
      for(var i = 0; i < allGridlines.length; i++) {allGridlines[i].classList.add('border-0');} // hide editing gridlines
    }

    var allQR = document.querySelectorAll(".qr-code"); // select all qr codes
    if (qrVisible) {
      for(var i = 0; i < allQR.length; i++) {allQR[i].classList.remove('d-none');} // show qr codes
    }
    else
    {
      for(var i = 0; i < allQR.length; i++) {allQR[i].classList.add('d-none');} // hide qr codes
    }

    var allID = document.querySelectorAll(".cell-id"); // select all space ids
    if (cellIdVisible) {
      for(var i = 0; i < allID.length; i++) {allID[i].classList.remove('d-none');} // show space ids
    }
    else
    {
      for(var i = 0; i < allID.length; i++) {allID[i].classList.add('d-none');} // hide space ids
    }
  },[editingMap, qrVisible, cellIdVisible] )

  useEffect(() => { 
    async function getTemplatesDoc() {
      const warehouseSystemData = doc(db, "masterdata", "warehouse")
      const docSnap = await getDoc(warehouseSystemData)
      if (docSnap.exists()) {
        setWarehouseTemplates(docSnap.data().templates);
      }
    }
    getTemplatesDoc()
  },[])

  //set user ID
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  const getMapWidth = () => {
    //compute for DOM dimensions for proportions
    var warehouse_map = document.getElementById("warehouse-map")
    if (
      typeof warehouse_map === 'object' &&
      !Array.isArray(warehouse_map) &&
      warehouse_map !== null
    ) {
    var mapContainerWidth = getComputedStyle(warehouse_map);// get warehouse-map dimensions
    var mapWidth = warehouse_map.clientWidth // get warehouse-map width
    mapWidth -= parseFloat(mapContainerWidth.paddingLeft) + parseFloat(mapContainerWidth.paddingRight); // subtract padding dimensions from width
    return mapWidth
    }
  }

  const getProductInfo = (product_id) => {
    var tempProd = {}
    stockcard.map((prod)=>{
      if(prod.id == product_id){
        tempProd = prod
      }
    })
    return tempProd
  }
  // get warehouse collection
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

  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable

  useEffect(() => {
    if (userID === undefined) {

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])
  
  // check if data has been fetched
  useEffect(()=>{
    if(warehouse === undefined) {
      setIsFetched(false)
    }
    else
    {
      setIsFetched(true)
      if(warehouse.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setWHId(warehouse.length-1)
          setKey(warehouse[warehouse.length-1].id)
        }
        else
        {
          
          setCollectionUpdateMethod("add")
        }
      }
      else
      {
        setWHId()
        setKey("main")
      }
    }
  }, [warehouse])

  const handleDocChange = (warehouse_id) => {
    warehouse.map((wh, index)=>{
      if(wh.id == warehouse_id)
      {
        setWHId(index)
      }
    })
  }


  useEffect(()=>{
    if(stockcard === undefined) {
      setIsStockcardFetched(false)
    }
    else
    {
      setIsStockcardFetched(true)
    }
  }, [stockcard])


  const addPadding = (num) => {
    var padded = num + "";
    while(padded.length < 2) {padded = "0" + padded;}
    return padded;
  }

  
function NewMapModal(props) {

  const [col, setCol] = useState(1);
  const [row, setRow] = useState(1);
  const [prevCell, setPrevCell] = useState([[0,0],[0,0]]);
  const [prevDimension, setPrevDimension] = useState(40);
  const [prevHeight, setPrevHeight] = useState(0);
  const [prevBackground, setPrevBackground] = useState(0);
  const [cell, setCell] = useState({});
  const [prevClicked, setPrevClicked] = useState(false);
  const [gridCalculated, setGridCalculated] = useState(false);
  const [modeChosen, setModeChosen] = useState();
  const [warehouseWidth, setWarehouseWidth] = useState(1);
  const [warehouseHeight, setWarehouseHeight] = useState(1);
  const [storageWidth, setStorageWidth] = useState(1);
  const [mapPreviewDivHeight, setMapPreviewDivHeight] = useState(1);
  const [mapPreviewHeight, setMapPreviewHeight] = useState(1);
  const [mapPreviewDivWidth, setMapPreviewDivWidth] = useState(1);

  useEffect(() => {
    if (isTemplateChosen) 
    {
      setPrevClicked(true);
    }
    else
    {
      setPrevClicked(false);
    }
  }, [isTemplateChosen])

  useEffect(() => {
    setPrevDimension(prevHeight/row+1)
  })

  const changeMode = (evt, mode) => {
    // Declare all variables
    var i, tabcontent, tablinks;
    setPrevClicked(false)
    setModeChosen(mode)
    var allTabs = document.querySelectorAll(".tablinks");
    for(i = 0; i < allTabs.length; i++) {
      allTabs[i].classList.remove('tablinks-init-style');
    }
  
    // Get all elements with className="tablinks" and remove the className "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" className to the button that opened the tab
    evt.currentTarget.className += " active";
  } 




  const pushCellsArray = () => {
    var tempArray = []
    for( var i = 0; i < row ; i++ ) {
      var tempCol = {};
      for(var j = 0; j < col; j++){
        var obj = {
          products: [],
          isStorage: false,
          color: prevBackground
        };
        obj.id = warehouse[whId].id.substring(0, 4) + '-' + (i + 10).toString(36).toUpperCase() + addPadding(Number(j+1));
        tempCol[j] = obj;
      }
      tempArray.push(tempCol);
    }
    setCell(tempArray);
  }

  const getMapPreviewHeight = () => {
    if(mapPreviewHeight == 1)
    {
      var map_preview = document.getElementById('map-preview')
      if (
        typeof map_preview === 'object' &&
        !Array.isArray(map_preview) &&
        map_preview !== null
      )
      {
        /*var mapContainerHeight = getComputedStyle(map_preview);// get warehouse-map dimensions
        var mapHeight = map_preview.clientHeight // get warehouse-map width
        mapHeight -= parseFloat(mapContainerHeight.paddingTop) + parseFloat(mapContainerHeight.paddingBottom); // subtract padding dimensions from width
      
        return mapHeight*/
        setMapPreviewDivHeight(map_preview.offsetHeight)
        setMapPreviewDivWidth(map_preview.offsetWidth)
     }
    }
  }

  const calculateGrid = () => {
    var col = warehouseWidth/storageWidth
    var row = warehouseHeight/storageWidth
    setCol(Math.floor(col))
    setRow(Math.floor(row))
  }

  const updatePreview = () => {
    
    var tempArray = [];
    var tempCol = [];
    var prev_height = mapPreviewHeight
  
    for(var i = 0; i < col; i++){
      tempCol.push("");
    }
    
    for(var j = 0; j < row; j++){
      tempArray.push(tempCol);
    }

  
    setPrevCell(tempArray)
    if(mapPreviewHeight == mapPreviewDivHeight/row || mapPreviewHeight == mapPreviewDivWidth/col)
    {

    }
    else
    {
      if(prev_height == 1)
      {
        prev_height = mapPreviewDivHeight/row
      }
      if(prev_height*col > mapPreviewDivWidth)
      {
        setMapPreviewHeight(mapPreviewDivWidth/col)
      }
      else
      {
        setMapPreviewHeight(mapPreviewDivHeight/row)
      }

    }
    pushCellsArray()
   }

  const addMap = async () => {
    if(isTemplateChosen)
    {
      const getMap = doc(db, 'warehouse', warehouse[whId].id);
        await updateDoc(getMap,{
          col: Number(Object.keys(templateChosen.contents[0]).length)
          , row: Number(templateChosen.contents.length)
          , isInit: true
          , cells: templateChosen.contents
      });
    }
    else
    {
      if( cell === undefined || cell.length == 0) {
        alert(cell);
      }
      else
      {
        const getMap = doc(db, 'warehouse', warehouse[whId].id);
        await updateDoc(getMap,{
          col: Number(col)
          , row: Number(row)
          , isInit: true
          , cells: cell
        });
      }
    }
    setCollectionUpdateMethod("update")
    props.onHide()
  }

  return (
    <Modal id="warehouse-modal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
    >

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {isTemplateChosen?
        <Modal.Body
          className="d-flex justify-content-center"
        >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
                <h3 className="text-center">Set-Up Warehouse Map</h3>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-8' style={{height: "450px"}}>
                <div className="d-flex align-items-center justify-content-center w-100 h-100">
                  <img src={templateChosen.img} style={{width: "100%", height: "100%", objectFit: "contain", boxSizing: "border-box"}}/>
                </div>
              </div>
              <div className='col-4 px-3 py-5' style={{textAlign: "right"}}>
                <h4 className="mb-3">
                  <strong>{templateChosen.name}</strong>
                </h4>
                <h6 className="mb-3" style={{lineHeight: "1.5em"}}>{templateChosen.description}</h6>
                <h6 className="text-muted">{templateChosen.specs}</h6>
              </div>
            </div>
          </div>
        </Modal.Body>
      :
        <Modal.Body
          className="d-flex justify-content-center"
        >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
                <h3 className="text-center">Set-up Warehouse Map</h3>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-12 ps-4'>
                <div className="tab">
                  <button className="tablinks no-click me-5">
                    <Warning
                      className="me-2 pull-down"
                      color={'#000'} 
                      title={'Category'}
                      height="15px"
                      width="15px"
                    />
                    <strong>Select a method to initialize your map: </strong>
                  </button>
                  <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, "grid")}>By Grid</button>
                  <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, "scale")}>By Scale</button>
                </div>
                {modeChosen === undefined?
                <></>
                :
                <div className="tabcontent">
                  <div className="row h-100">
                    <div className="blue-strip p-2 mb-2 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                      {modeChosen == "grid"?
                      <span>With <strong>by grid</strong>, the number of workable spaces is dependent on the number of rows and columns (row * col).</span>
                      :
                      <span>With <strong>by scale</strong>, the number of workable spaces is dependent on the estimated dimensions of the warehouse as well as the dedicated width for every storage.</span>
                      }
                    </div>
                    <div className="col-6">
                      <div id="map-preview">
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                          {prevCell.map((row, index) =>{
                          return(
                          <div 
                            className="prev-box-row d-flex align-items-center justify-content-center"
                            key={index}
                          >
                            {row.map((col, i) =>
                              <div 
                                key={i}
                                className={'prev-box-col ' + prevBackground}
                                style={{width: mapPreviewHeight  + "px", height: mapPreviewHeight  + "px", aspectRatio: "1 / 1"}}
                              >
                              </div>
                            )}
                          </div>
                          )
                        })}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="mb-2"></h6>
                      <div className="mb-2">
                        {modeChosen == "grid"?
                        <div className="row m-0 mb-3 p-0 d-flex align-items-center">
                          <div className="col-5">
                            <label className="mb-2">Columns</label>
                              <input
                                type="number"
                                className="form-control d"
                                placeholder="Column"
                                min={1}
                                defaultValue={col}
                                onChange={(e) => { 
                                  getMapPreviewHeight()
                                  setPrevClicked(false);
                                  setCol(e.target.value)
                                }}
                              />
                          </div>
                          <div className="col-2">
                            <strong>X</strong>
                          </div>
                          <div className="col-5">        
                            <label className="mb-2">Rows</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Row"
                              min={1}
                              defaultValue={row}
                              onChange={(e) => {
                                getMapPreviewHeight()
                                setPrevClicked(false);
                                setRow(e.target.value)
                              }}
                            />
                          </div>
                        </div>
                        :
                        <div className="row m-0 mb-3 p-0 d-flex align-items-center">
                          <div className="col-12">
                            <label className="mb-2">Warehouse Dimensions</label>
                          <div className="row m-0 mb-3 d-flex align-items-center">
                            <div className="col-5 p-1">
                              <input
                                type="number"
                                className="form-control d"
                                placeholder="Column"
                                min={1}
                                value={warehouseWidth}
                                onChange={(e) => { 
                                  getMapPreviewHeight()
                                  setGridCalculated(false);
                                  setWarehouseWidth(e.target.value)
                                }}
                              />
                            </div>
                            <div className="col-2">
                              x
                            </div>
                            <div className="col-5 p-1">
                            <input
                                type="number"
                                className="form-control d"
                                placeholder="Column"
                                min={1}
                                value={warehouseHeight}
                                onChange={(e) => { 
                                  getMapPreviewHeight()
                                  setGridCalculated(false);
                                  setWarehouseHeight(e.target.value)
                                }}
                              />
                            </div>
                          </div>
                              
                          </div>
                          <div className="col-12">        
                            <label className="mb-2">Storage Width</label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Row"
                              min={1}
                              value={storageWidth}
                              onChange={(e) => {
                                getMapPreviewHeight()
                                setGridCalculated(false);
                                setStorageWidth(e.target.value)
                              }}
                            />
                          </div>
                        </div>
                        }
                        <div className="row m-0 mb-3 p-0 d-flex justify-content-center align-items-center">
                          <div className="mb-2">Choose warehouse flooring</div>
                          <div className="color-swatch map-creation d-flex justify-content-center mb-2">
                            <button
                              className="color"
                              style={{backgroundColor: '#ffffff'}}
                              data-title="None"
                              onClick={()=>{setPrevBackground('#ffffff');setPrevClicked(false)
                              }}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fsmooth_conrete.jpg?alt=media&token=0773acac-c048-4f33-8f39-47fd644330d6")'}}
                              data-title="Smooth Concrete"
                              onClick={()=>{setPrevBackground('pattern-smooth-concrete');setPrevClicked(false)}}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Frough_concrete.jpg?alt=media&token=3cce02b1-a2fd-49cc-8011-507f6ea3c352")'}}
                              data-title="Rough Concrete"
                              onClick={()=>{setPrevBackground('pattern-rough-concrete');setPrevClicked(false)}}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fdark_wood.jpg?alt=media&token=d3385145-b7ac-4845-a06c-e51012d56226")'}}
                              data-title="Dark Wood"
                              onClick={()=>{setPrevBackground('pattern-dark-wood');setPrevClicked(false)}}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Flight_wood.jpg?alt=media&token=307a303c-1698-4c92-ad96-def38752042e")'}}
                              data-title="Light Wood"
                              onClick={()=>{setPrevBackground('pattern-light-wood');setPrevClicked(false)}}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fwhite_tile.jpg?alt=media&token=09c77e80-ba5c-44c8-a056-e169a449100d")'}}
                              data-title="Tile"
                              onClick={()=>{setPrevBackground('pattern-white-tile');setPrevClicked(false)}}
                            >
                            </button>
                            <button
                              className="color"
                              style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fbrick.jpg?alt=media&token=403814c0-b98b-4c8f-89f9-f23720905649")'}}
                              data-title="Cobblestone"
                              onClick={()=>{setPrevBackground('pattern-cobblestone');setPrevClicked(false)}}
                              >
                            </button>
                          </div>
                        </div>
                        <div className="row m-0 mb-3 p-0">
                          <div className="col d-flex justify-content-center">
                            {modeChosen == "scale"?
                            <>
                            <Button
                              disabled={warehouseWidth <= 0 || warehouseHeight <=0 || storageWidth <=0}
                              className="preview float-end disabled-conditionally me-2"
                              data-title={warehouseWidth <= 0 || warehouseHeight <=0 || storageWidth <=0?"Enter positive numbers":""}
                              variant="outline-primary"
                              onClick={(e)=>{setGridCalculated(true);calculateGrid()}}
                            >
                              Calculate
                            </Button>
                            <Button
                              disabled={!gridCalculated}
                              className="preview float-end disabled-conditionally"
                              data-title={!gridCalculated?"Calculate the dimensions first":""}
                              variant="outline-primary"
                              onClick={(e)=>{setPrevClicked(true);updatePreview()}}
                            >
                              Preview
                            </Button>
                            </>
                            :
                            <Button
                              disabled={col <= 0 || row <=0}
                              className="preview float-end disabled-conditionally"
                              data-title={col <= 0 || row <=0?"Enter positive numbers":""}
                              variant="outline-primary"
                              onClick={(e)=>{setPrevClicked(true);updatePreview()}}
                            >
                              Preview
                            </Button>
                            }
                          </div>
                        </div>
                        <div className="row m-0 p-0">
                          <div className="col d-flex justify-content-center">
                            {col <= 0 || row <=0?
                              <div className="red-strip p-2 mb-4 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                                Please enter the corrent number of columns and rows.
                              </div>
                            :
                              <div className="blue-strip p-2 mb-4 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                                You created a warehouse map with {col*row} spaces.
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  
                }
              </div>
            </div>
          </div>
        </Modal.Body>
      }
      <Modal.Footer
        className="d-flex justify-content-center"
      >
        <Button
          className="btn btn-danger"
          style={{ width: "6rem" }}
          onClick={() => props.onHide()}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-light float-start"
          style={{ width: "8rem" }}
          disabled={modeChosen == "scale"?(!prevClicked || !gridCalculated):!prevClicked}
          onClick={()=>{setPrevClicked(true); addMap()}}
        >
          Create Map
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

  const addRow = async (w_cells, w_row, w_col) => {
    var tempArray = w_cells
    var background = tempArray[0][0].color
    var tempCol = {};
    var tempRow = []
    for(var j = 0; j < w_col; j++){ 
      var obj = {
        products: [],
        isStorage: false,
        color: background
      };
      obj.id = warehouse[whId].id.substring(0, 4) + '-' + (tempArray.length + 10).toString(36).toUpperCase() + addPadding(Number(j+1));
      tempCol[j] = obj;
    }
    tempArray.push(tempCol);
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
      cells: tempArray,
      row: Number(w_row + 1)
    });
  setCollectionUpdateMethod("update")
  }

  const addColumn = async (w_cells, w_row, w_col) => {
    var tempArray = w_cells
    var background = tempArray[0][0].color
    for(var i = 0; i < w_row; i++){ 
      var obj = {
        products: [],
        isStorage: false,
        color: background
      };
      obj.id = warehouse[whId].id.substring(0, 4) + '-' + (i + 10).toString(36).toUpperCase() + addPadding(Number(w_col+1));
      tempArray[i][w_col] = obj
    }
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
      cells: tempArray,
      col: Number(w_col + 1)
    });
  setCollectionUpdateMethod("update")
  }


  /*           Storage Functionalities           */

  // change space texture
  const changeColor = async (cells, rIndex, cIndex, color) => {
    var tempCells = cells;//get accounts list and place in temp array
    tempCells[rIndex][cIndex].color = color;
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
        cells: tempCells
      });
    setCollectionUpdateMethod("update")
  }

  // insert storage to space
  const toStorage = async (cells, rowIndex, colIndex, option) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].isStorage = true;
    tempCells[rowIndex][colIndex].type = option;
    tempCells[rowIndex][colIndex].orientation = "flip-top";
    tempCells[rowIndex][colIndex].remarks = " ";
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
        cells: tempCells
      });
    setCollectionUpdateMethod("update")
  }

  // change storage type
  const changeStorage = async (cells, rowIndex, colIndex, type) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].type = type;
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
        cells: tempCells
      });
    setCollectionUpdateMethod("update")
  }

  // rotate storage
  const flipStorage = async (cells, rowIndex, colIndex, orientation) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].orientation = orientation;
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
        cells: tempCells
      });
    setCollectionUpdateMethod("update")
  }

  // remove storage
  const deStorage = async (cells, rowIndex, colIndex) => {
    var tempCells = cells;
    tempCells[rowIndex][colIndex].isStorage = false;
    tempCells[rowIndex][colIndex].products = [];
    tempCells[rowIndex][colIndex].remarks = "";
    const getMap = doc(db, 'warehouse', warehouse[whId].id);
    await updateDoc(getMap,{
        cells: tempCells
      });
    setCollectionUpdateMethod("update")
  }

  const checkIfPooled = (warehouse_cells) => {
    for(var i = 0; i < warehouse_cells.length; i++)
    {
      for(var j = 0; j < Object.keys(warehouse_cells[i]).length; j++)
      {
        if(warehouse_cells[i][j].products.length > 0)
        {
          return true;
        }
      }
    }
    return false;
  }


  const updateWarehouseToast = () => {
    toast.info(warehouse[whId].id.substring(0, 4) + " edited", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  function DisplayMap(){
    return (
      <>
        {warehouse[whId].cells.map((content,index) => {
          return(
            <div className="box-row d-flex align-items-center">    
              {Object.keys(content).map((k) => {
                return (
                  <>
                    <div
                      draggable
                    >
                      <a 
                        className={"box" + (searchResult.includes(content[k].id)?" searched ":" ") + "d-flex align-items-center justify-content-center"}
                        key={'row' + index + '-' + k}
                      >
                        <div className="box-call-to-action"
                          key={'ca' + index + '-' + k}>
                          <div className="box-ca-container">
                            {editingMap?
                              <>
                                <div className="color-changer d-flex justify-content-center align-items-center mb-2">
                                  <div className="color-swatch d-flex justify-content-center">
                                    <button className="color pattern-none"
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-none")}}
                                    >
                                    </button>
                                    <button className="color pattern-smooth-concrete"
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-smooth-concrete") }}
                                    >
                                    </button>
                                    <button className="color pattern-rough-concrete"
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-rough-concrete")}}
                                    >
                                    </button>
                                    <button className="color pattern-dark-wood"
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-dark-wood")}}
                                    >
                                    </button>
                                    <button className="color pattern-light-wood"
                                      style={{}}
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-light-wood")}}
                                    >
                                    </button>
                                    <button className="color pattern-white-tile"
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-white-tile")}}
                                    >
                                    </button>
                                    <button className="color pattern-cobblestone"
                                      style={{}}
                                      onClick={()=>{changeColor(warehouse[whId].cells, index, k, "pattern-cobblestone")}}
                                    >
                                    </button>
                                  </div>
                                </div>
                                {content[k].isStorage?
                                <>
                                  <div className="d-flex flex-row mb-2">
                                    <button className="box-call-to-action-button me-5"
                                      onClick={()=>{setRowIndex(index);setColIndex(k);setModalShowAP(true)}}
                                    >
                                      Edit Products
                                    </button>
                                    <div className="storage-options">
                                      <button
                                        className="box-call-to-action-button "
                                        value="delete"
                                        onClick={(show)=>deStorage(warehouse[whId].cells, index, k)}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                  </div>
                                    <div className="storage-options d-flex flex-row mb-2">
                                      <button
                                        className="box-call-to-action-button no-click"
                                        value="context-sm"
                                      >Edit:</button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        data-title="Pallet"
                                        onClick={()=>changeStorage(warehouse[whId].cells, index, k, 'pallet')}
                                      >
                                        <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-palet.png?alt=media&token=8c2de023-30de-4f00-8d2b-453a25ae823f")'}}></div>
                                      </button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        data-title="Shelf"
                                        onClick={()=>changeStorage(warehouse[whId].cells, index, k, 'shelf')}
                                      >
                                        <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-shelf.png?alt=media&token=167f685a-d810-4fe4-a90e-a5cd2168647c")'}}></div>
                                      </button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        onClick={()=>changeStorage(warehouse[whId].cells, index, k, 'freezer')}
                                      >
                                        <div style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-freezer.png?alt=media&token=83f133ae-7159-4c4c-8d14-bd61f35ef8ed")'}}></div>
                                        </button>
                                    </div>
                                    <div className="storage-options d-flex flex-row mb-2">
                                      <button
                                        className="box-call-to-action-button no-click"
                                        value="context-sm"
                                      >Flip:</button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        onClick={()=>flipStorage(warehouse[whId].cells, index, k, 'flip-top')}
                                      >
                                        <div 
                                          className="flip-top"
                                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}
                                        ></div>
                                      </button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        onClick={()=>flipStorage(warehouse[whId].cells, index, k, 'flip-left')}
                                      >
                                        <div 
                                          className="flip-left"
                                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}
                                        ></div>
                                      </button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        onClick={()=>flipStorage(warehouse[whId].cells, index, k, 'flip-right')}
                                      >
                                        <div 
                                          className="flip-right"
                                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}
                                        ></div>
                                      </button>
                                      <button
                                        className="box-call-to-action-button with-icon"
                                        onClick={()=>flipStorage(warehouse[whId].cells, index, k, 'flip-bottom')}
                                      >
                                        <div 
                                          className="flip-bottom"
                                          style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Ficon-flip.png?alt=media&token=a17e485b-73c2-4b9d-b0e4-3b887631127f")'}}
                                        ></div>
                                      </button>
                                    </div>
                                  </>
                                :
                                  <>
                                    <div className="storage-options d-flex flex-row">
                                      <button
                                        className="box-call-to-action-button no-click"
                                        value="context"
                                      >Place a:</button>
                                      <button
                                        className="box-call-to-action-button"
                                        onClick={()=>toStorage(warehouse[whId].cells, index, k, "pallet")}>Pallet</button>
                                      <button
                                        className="box-call-to-action-button"
                                        onClick={()=>toStorage(warehouse[whId].cells, index, k, "shelf")}>Shelf</button>
                                      <button
                                        className="box-call-to-action-button"
                                        onClick={()=>toStorage(warehouse[whId].cells, index, k, "freezer")}>Freezer</button>
                                    </div>
                                  </>
                                }
                              </>
                            :
                            <>
                              {content[k].isStorage?
                                <div className="product-list">
                                {content[k].products.length == 0?
                                  <div className="storage-empty d-flex justify-content-center align-items-center">
                                    <div className="">
                                      <h6><strong>Storage is empty</strong></h6>
                                    </div>
                                  </div>
                                :
                                  <>
                                    {content[k].products === undefined?
                                      <></>
                                    :
                                      <div className="px-0">
                                        {content[k].products === undefined || content[k].products.length == 0 ?
                                          <></>
                                        :
                                        <div className="d-flex align-items-center justify-content-center" style={{height: '6em', width: 'fit-content'}}> 
                                          <div
                                            className="storage-actions"
                                            style={{height: '100%', width:'auto'}}
                                          >
                                        <button
                                          className="w-100 h-100 d-flex align-items-center justify-content-center"
                                          data-title="hey"
                                          onClick={()=>{
                                            setCellSpecifications(content[k]);
                                            setModalShowVS(true)
                                          }}
                                          onMouseEnter={()=>{setOpenStorageHovered(true)}}
                                          onMouseLeave={()=>{setOpenStorageHovered(false)}}
                                        >
                                          {openStorageHovered?
                                            <FontAwesomeIcon icon={faDoorOpen}/>
                                          :
                                            <FontAwesomeIcon icon={faDoorClosed}/>
                                          }
                                        </button>
                                        </div>
                                        {content[k].products.map((prod_id) => {
                                          return(
                                          <div 
                                            className="storage-item w-100 h-100 p-0"
                                            style={{height: '100%', width:'auto', aspectRatio: '1 / 1'}}
                                            key={prod_id.id}
                                          >
                                            <button 
                                              className="storage-item-img-container m-0 w-100 d-flex align-items-center justify-content-center"
                                              onClick={()=>{setProductToView(getProductInfo(prod_id).id); setModalShowPQV(true)}}
                                            >
                                            <div className="badge-container">
                                              <div className="badge">
                                                <div className="circle-small shadow-small yellow black-text condensed-text d-flex align-items-center justify-content-center">
                                                  <div>
                                                    <strong>{getProductInfo(prod_id).qty} </strong> 
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                              <div className="storage-item-img">
                                                {getProductInfo(prod_id).img == " " || getProductInfo(prod_id).img == ""?
                                                  <div className="scroll-text-horizontally storage-item-no-image" style={{margin: '0.2em'}}>{getProductInfo(prod_id).description}</div>
                                                :
                                                <img src={getProductInfo(prod_id).img} style={{height: '100%', width: 'auto'}}/>
                                                }
                                              </div>
                                            </button>
                                          </div>
                                            )
                                        })}
                                        </div>
                                        }
                                      </div>
                                    }
                                  </>
                                }
                                </div>
                              :
                                <></>
                              }
                            </>
                            
                            }
                            
                          </div>
                        </div>
                        <div className={'box-col ' + content[k].color + " border-0"} style ={{width: (getMapWidth()/warehouse[whId].col) + 'px', height: (getMapWidth()/warehouse[whId].col) + 'px'}}
                        key={'col' + index + '-' + k}
                        >
                          {content[k].isStorage?
                            <div className={'storage ' + content[k].type + ' ' + content[k].orientation}>
                              <div className="cell-info" style={{fontSize: (60/warehouse[whId].col) + 'pt'}}>
                                <span className="cell-id d-none">
                                  {content[k].alias === undefined || content[k].alias == "" || content[k].alias == ""?
                                    <>{content[k].id.substring(content[k].id.length-3, content[k].id.length)}</>
                                  :
                                    <>{content[k].alias}</>
                                  }
                                </span>
                                <div className="qr-code d-flex justify-content-center d-none">
                                  <QRCode
                                    value={content[k].id}
                                    size={50}
                                  />
                                </div>
                              </div>
                            </div>
                          :
                            <div className="cell-info" style={{fontSize: (60/warehouse[whId].col) + 'pt'}}>
                              <span className="cell-id d-none">{content[k].id.substring(content[k].id.length-3, content[k].id.length)}</span>
                            </div>
                          }
                        </div>
                      </a>
                    </div>
                    {index == warehouse[whId].row-1?
                      <></>
                    :
                      <></>
                    }
                  </>   
                ); 
              })}
              {index == 0?
              <div 
                id="add-column-container" 
                style ={{height: ((getMapWidth()/warehouse[whId].col) + 10) + 'px'}}
              >
                <div id="add-column-button">
                  <div className="d-flex h-100 align-items-center justify-content-center flex-column">
                    
                    <button
                      id="add-column-icon"
                      className="plain-button"
                      onClick={(show)=>addColumn(warehouse[whId].cells, warehouse[whId].row, warehouse[whId].col)}
                    >
                      <FontAwesomeIcon icon={faPlus}/>
                    </button>
                    
                    <div id="add-column-line">
                  </div>
                  </div>
                </div>
              </div>
              :
              <></>
              }
            </div>  
          );
        })}
        
        <div id="add-row-container" style ={{width: ((getMapWidth()/warehouse[whId].col) + 10) + 'px'}}>
          <div id="add-row-button">
            <div className="d-flex w-100 align-items-center justify-content-center flex-row">
            <button 
              id="add-row-icon" 
              className="plain-button"
              onClick={(show)=>addRow(warehouse[whId].cells, warehouse[whId].row, warehouse[whId].col)}
            >
                <FontAwesomeIcon icon={faPlus}/>
            </button>
            <div id="add-row-line">
                
            </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  function DeleteWarehouseModal(props) {

    //delete row 
    const deleteWarehouse = async () => {
      setWHId(0)
      setKey("main")
      props.onHide()
      const warehouseDoc = doc(db, "warehouse", warehouse[whId].id)
      await deleteDoc(warehouseDoc);
      deleteToast();
    }

    //delete Toast
    const deleteToast = () => {
      toast.error('Warehouse DELETED from the Database', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal danger"
      >
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Modal.Body >
        {(warehouse.length == 0 || warehouse=== undefined) || whId === undefined ?
        <></>
        :
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Deleting {warehouse === undefined || whId === undefined ?<></>:<>{warehouse[whId].id.substring(0,4)}</>}</h3>
          </div>
          <div className="row m-0 p-0 mb-3">
            <div className="col-12 px-3 text-center">
              <strong>
                Are you sure you want to delete
                <br />
                <span style={{color: '#b42525'}}>{warehouse[whId].wh_name}?</span>
              </strong>
            </div>
          </div>
          <div className="row m-0 p-0">
                <div className="col-12 px-3 d-flex justify-content-center">
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td>Warehouse Name</td>
                        <td>{warehouse[whId].wh_name}</td>
                      </tr>
                      <tr>
                        <td>Address</td>
                        <td>{warehouse[whId].address}</td>
                      </tr>
                      <tr>
                        <td>Notes</td>
                        <td>{warehouse[whId].wh_notes}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
        </div>
        }
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className="btn btn-light"
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-danger float-start"
            style={{ width: "10rem" }}
            onClick={() => { deleteWarehouse() }}
          >
            Delete Warehouse
          </Button>
        </Modal.Footer>
      </Modal>

    )
  }

  function DisplayTemplates(props) {
    return(
      <div>
        {warehouseTemplates === undefined?
        <></>
        :
        <div id="warehouse-templates-collection">
          <div className="row">
            <div className="col-3 p-4 d-flex align-items-center justify-content-center">
              <Card 
                className="warehouse-template"
                onClick={()=>{setIsTemplateChosen(false); setTemplateChosen([]); setModalShowMap(true)}}
              >
                <div className="w-100 h-100 d-flex align-items-center justify-content-center p-2 flex-column">

                  <h1>
                    <div className="warehouse-template-icon-container mb-4">
                      <FontAwesomeIcon icon={faGears}/>
                    </div>
                  </h1>
                  <h4 className="mb-5">
                    <strong>Custom</strong>
                  </h4>
                  <h6 className="px-4">
                    Make the map yourself! Specify the number of spaces to work with and style the floor the way you want.
                  </h6>
                </div>
              </Card>
            </div>
          {warehouseTemplates.map((template)=>{
            return(
              <div className="col-3 p-4 d-flex align-items-center justify-content-center">
              <Card 
                className="warehouse-template"
                onClick={()=>{setIsTemplateChosen(true); setTemplateChosen(template); setModalShowMap(true)}}
              >
                <div className="warehouse-template-thumb">
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center p-2">
                    <img className="m-2" src={template.img} />
                  </div>
                </div>
                <div className="warehouse-template-info">
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-1">
                    <h4 className="mb-3">
                      <strong>{template.name}</strong>
                    </h4>
                    <small className="px-2 mb-1">{template.description}</small>
                    <small className="text-muted">{template.specs}</small>
                  </div>
                </div>
              </Card>
              </div>
            )
          })}
          </div>
        </div>
        }
      </div>
    )
  }
  function WarehouseMapAddProductModal(props) {
    const [productsInStorage, setProductsInStorage] = useState([]);
    const [cellId, setCellId] = useState("");
    const [cellType, setCellType] = useState("");
    const [cellRemarks, setCellRemarks] = useState(" ");

    const [outStorageSearchValue, setOutStorageSearchValue] = useState('');    // the value of the search field 
    const [outStorageSearchResult, setOutStorageSearchResult] = useState([]);    // the search result
    const [inStorageSearchValue, setInStorageSearchValue] = useState('');    // the value of the search field 
    const [inStorageSearchResult, setInStorageSearchResult] = useState([]);    // the search result

    useEffect(() => {
      setOutStorageSearchResult(stockcard)
      setInStorageSearchResult(stockcard)
    }, [stockcard])

    useEffect(()=>{
      if(warehouse === undefined) {
      }
      else
      {
        setProductsInStorage(warehouse[whId].cells[rowIndex][colIndex].products)
        setCellId(warehouse[whId].cells[rowIndex][colIndex].id)
        setCellRemarks(warehouse[whId].cells[rowIndex][colIndex].remarks)
        setCellType(warehouse[whId].cells[rowIndex][colIndex].type)
      }
    }, [warehouse[whId]])

    const filterInStorage = (e) => {
      const keyword = e.target.value;

      if (keyword !== '') {
        const results = stockcard.filter((stockcard) => {
          return stockcard.id.toLowerCase().includes(keyword.toLowerCase()) || stockcard.description.toLowerCase().includes(keyword.toLowerCase())
          // Use the toLowerCase() method to make it case-insensitive
        });
        setInStorageSearchResult(results);
      } else {
        setInStorageSearchResult(stockcard);
        // If the text field is empty, show all users
      }

      setInStorageSearchValue(keyword);
    };

    const filterOutStorage = (e) => {
      const keyword = e.target.value;

      if (keyword !== '') {
        const results = stockcard.filter((stockcard) => {
          return stockcard.id.toLowerCase().includes(keyword.toLowerCase()) || stockcard.description.toLowerCase().includes(keyword.toLowerCase())
          // Use the toLowerCase() method to make it case-insensitive
        });
        setOutStorageSearchResult(results);
      } else {
        setOutStorageSearchResult(stockcard);
        // If the text field is empty, show all users
      }

      setOutStorageSearchValue(keyword);
    };



    const handleProductSelect = (product) => {
      let productIndex = productsInStorage.indexOf(product)
      var currentSelectedProduct = document.getElementById(product);
      
      if(currentSelectedProduct.classList.contains("product-selected")) 
      {
        currentSelectedProduct.classList.remove("product-selected")
      }
      else
      {
        currentSelectedProduct.classList.add("product-selected")
      }
      if(productIndex >= 0) {
        setProductsInStorage([
          ...productsInStorage.slice(0, productIndex),
          ...productsInStorage.slice(productIndex + 1, productsInStorage.length)
        ]);
      }
      else
      {
        setProductsInStorage([... productsInStorage, product])
      }
    }

    const placeProducts = async () => {
      var tempCell = warehouse[whId].cells;
      tempCell[rowIndex][colIndex].products = productsInStorage
      tempCell[rowIndex][colIndex].alias = cellId
      tempCell[rowIndex][colIndex].remarks = cellRemarks
      const getWarehouse = doc(db, 'warehouse', warehouse[whId].id);
      
      await updateDoc(getWarehouse,{
        cells: tempCell
      });
      props.onHide()
      setCollectionUpdateMethod("update")
    }

    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <Modal.Body
          className="d-flex justify-content-center"
        >
          <div className="px-3 py-2 w-100">
            <div className="module-header mb-4">
              <h3 className="text-center">Editing {cellId}</h3>
            </div>
            <div className="row my-2 mb-3">
              <div className="col-4 ps-4">
                <label>Rename Space ID</label>
                <input type="text"
                  value={cellId}
                  className="form-control shadow-none"
                  onChange={(event) => { setCellId(event.target.value); }}
                />
              </div>
              <div className="col-8 ps-4">
                <label>Add Notes</label>
                <input type="text"
                  value={cellRemarks}
                  className="form-control shadow-none"
                  onChange={(event) => { setCellRemarks(event.target.value); }}
                />
              </div>
            </div>
            <div className="row my-2 mb-3">
              {isStockcardFetched?
                <div id="product-adding-stage">
                  <div className="row h-100">
                    <div className="col-5 p-0 h-100 ">
                      <div className="product-adding-stage-active h-100 ">
                        <div className="product-adding-stage-header">
                          Products in Stockcard
                        </div>
                      <div className="products-container">
                        <div className="products-container-header">
                          <div className="row">
                            <InputGroup>
                              <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                              </InputGroup.Text>
                              <FormControl
                                type="search"
                                value={outStorageSearchValue}
                                onChange={filterOutStorage}
                                className="input"
                                placeholder="IT000013, Rexona Pink 3mL (1pc)"
                              />
                            </InputGroup>
                            <p className="product-adding-stage-tip">Click a product to <span style={{color: '#629ce3c3'}}>add</span> to the storage</p>
                          </div>
                        </div>
                        <div className="products-container-body">
                          <div className="h-100 row" style={{overflowY:"scroll"}}>
                            {stockcard === undefined?<></>:<>
                            {stockcard.length == 0?
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>products</span> to show.</strong></h5>
                            <p className="d-flex align-items-center justify-content-center">
                            <span>
                            Go to 
                            <Link to="/stockcard"><strong> stockcard </strong></Link>
                            to add one.
                          </span>
                            </p>
                          </div>
                            :
                            <>{outStorageSearchResult && outStorageSearchResult.length > 0 ? (
                              outStorageSearchResult.map((stockcard) => (
                                <>
                                  {productsInStorage === undefined? <>
                                    <Spinner 
                                      color1="#b0e4ff"
                                      color2="#fff"
                                      textColor="rgba(0,0,0, 0.5)"
                                      className="w-25 h-25"
                                    /></>
                                  :
                                    <>
                                      {productsInStorage.indexOf(stockcard.id) == -1?
                                        <div className="col-6 p-1">
                                          <button
                                            className={"product-inselection" + (stockcard.qty == 0?" product-not-used":"")}
                                            id={stockcard.id}
                                            key={stockcard.id}
                                            onClick={() => { handleProductSelect(stockcard.id)}}
                                            style={{border: '0', background: 'none'}}
                                          >
                                            <Card>
                                              <Card.Body>
                                                <strong>{stockcard.description}</strong>
                                                <div className="row specification" style={{margin: '0 auto'}}>
                                                  <div className="col-8 p-0 p-0">
                                                    <p className="code">{stockcard.id.substring(0, 9)}</p>
                                                  </div>
                                                  <div className="col-4 p-0 p-0">
                                                    <p className="qty">QTY: {stockcard.qty}</p>
                                                  </div>
                                                </div>
                                              </Card.Body>
                                            </Card>
                                          </button>
                                        </div>
                                      :
                                        <></>
                                      }
                                    </>
                                  }
                                </>
                              ))
                              ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column" style={{ marginTop: '25%' }}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No product matched:
                                    <br />
                                    <span style={{ color: '#0d6efd' }}>{outStorageSearchValue}</span>
                                  </strong>
                                </h5>
                              </div>
                            )}</>}
                              
                              </>
                            }
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="col-2 h-100 d-flex align-items-center justify-content-center">
                  <div className={'storage ' + cellType} style={{height: '100px', width: '100px'}}>
                    <div className="w-100 h-100 position-relative d-inline-block d-flex align-items-center">
                      <div className="position-absolute" style={{color: 'rgb(9, 255, 0)', lineHeight: '0', fontSize: '1.5rem', left: '-0.5em', backgroundColor: '#fff', padding: '0.25em', borderRadius: '50%'}}>
                        <div><FontAwesomeIcon icon={faArrowCircleRight} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="col-5 h-100 p-0">
                  <div className="product-adding-stage-active instorage h-100">
                    <div className="product-adding-stage-header">
                      Products in this Storage
                    </div>
                    <div className="products-container">
                      <div className="row">
                        <InputGroup id="fc-search">
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                              type="search"
                              value={inStorageSearchValue}
                              onChange={filterInStorage}
                              className="input"
                              placeholder="IT000013, Rexona Pink 3mL (1pc)"
                            />
                          </InputGroup>
                        <p className="product-adding-stage-tip">Click a product to <span style={{color: '#e36262c3'}}>remove</span> from the storage</p>
                      </div>
                      <div className="h-100 row " style={{overflowY:"scroll"}}>
                        {stockcard === undefined?<></>:<>
                        {stockcard.length == 0?
                        
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>products</span> to show.</strong></h5>
                        <p className="d-flex align-items-center justify-content-center">
                          <span>
                            Go to 
                            <Link to="/stockcard"><strong> stockcard </strong></Link>
                            to add one.
                          </span>
                        </p>
                      </div>
                        :
                         <>{inStorageSearchResult && inStorageSearchResult.length > 0 ? (
                          inStorageSearchResult.map((stockcard) => (
                            <>
                              {productsInStorage === undefined? <>
                                <Spinner 
                                  color1="#b0e4ff"
                                  color2="#fff"
                                  textColor="rgba(0,0,0, 0.5)"
                                  className="w-25 h-25"
                                /></>
                              :
                                <>
                                  {productsInStorage.indexOf(stockcard.id) >= 0?
                                    <div className="col-6 p-0">
                                      <button
                                        className={"product-inselection" + (stockcard.qty == 0?" product-not-used":"")}
                                        id={stockcard.id}
                                        key={stockcard.id}
                                        onClick={() => { handleProductSelect(stockcard.id)}}
                                        style={{border: '0', background: 'none'}}
                                      >
                                        <Card>
                                          <Card.Body>
                                            <strong>{stockcard.description}</strong>
                                            <div className="row specification" style={{margin: '0 auto'}}>
                                              <div className="col-8 p-0 p-0">
                                                <p className="code">{stockcard.id.substring(0, 9)}</p>
                                              </div>
                                              <div className="col-4 p-0 p-0">
                                                <p className="qty">QTY: {stockcard.qty}</p>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </button>
                                    </div>
                                  :
                                    <></>
                                  }
                                </>
                              }
                            </>
                          ))
                          ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column" style={{ marginTop: '25%' }}>
                            <h5>
                              <strong className="d-flex align-items-center justify-content-center flex-column">
                                No product matched:
                                <br />
                                <span style={{ color: '#0d6efd' }}>{inStorageSearchValue}</span>
                              </strong>
                            </h5>
                          </div>
                        )}</> 
                        }
                            
                            </>
                          }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              :
                <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                  <Spinner 
                    color1="#b0e4ff"
                    color2="#fff"
                    textColor="rgba(0,0,0, 0.5)"
                    className="w-25 h-25"
                  />
                </div>
              }
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className="btn btn-danger"
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
         >
          Cancel
          </Button>
          <Button
            className="btn btn-light float-start"
            style={{ width: "6rem" }}
            onClick={() => placeProducts()}
          >
          Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
  function ViewStorage(props) {
    var tempStockcardList = [];
    if(stockcard === undefined) 
    {

    }
    else
    {
      stockcard.map((product)=>{
        if(cellSpecifications.products.indexOf(product.id) >= 0)
          tempStockcardList.push(product)
      })
    }

    var rowArray = []
    var colArray = []
    
    if(cellSpecifications.type == "shelf")
    {
      while (tempStockcardList.length < 32) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " ",
          "img": ""
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      while (tempStockcardList.length % 8 != 0) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " "
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      for(var i = 0; i < tempStockcardList.length; i++) {
        colArray.push(tempStockcardList[i])
        if((i + 1) % 8 == 0) {
          rowArray.push(colArray)
          colArray = []
        }
      }
    }

    if(cellSpecifications.type == "freezer")
    {
      while (tempStockcardList.length < 16) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " ",
          "img": ""
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      while (tempStockcardList.length % 4 != 0) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " "
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      for(var i = 0; i < tempStockcardList.length; i++) {
        colArray.push(tempStockcardList[i])
        if((i + 1) % 4 == 0) {
          rowArray.push(colArray)
          colArray = []
        }
      }
    }

    if(cellSpecifications.type == "pallet")
    {
      while (tempStockcardList.length < 24) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " ",
          "img": ""
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      while (tempStockcardList.length % 6 != 0) {
        var stockcardTempObj={
          "id":" ",
          "qty": "",
          "description": " "
        }
        tempStockcardList.push(stockcardTempObj)
      }
  
      for(var i = 0; i < tempStockcardList.length; i++) {
        colArray.unshift(tempStockcardList[i])
        if((i + 1) % 6 == 0) {
          rowArray.unshift(colArray)
          colArray = []
        }
      }
    }
    

    const modalSize = (storage_type) => {
      if(storage_type == "shelf")
      {
        return "lg"
      }
      else if(storage_type == "freezer" || storage_type == "pallet")
      {
        return "md"
      }
    }

    return (
      <Modal
        {...props}
        size={modalSize(cellSpecifications.type)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal view-storage">
        <div className="badge-container d-inline-block w-100" style={{textAlign: 'right'}}>
          <div className="badge storage-actions opened p-2">
        <button
          className="px-1 py-2"
          onClick={()=>{props.onHide()}}
          onMouseEnter={()=>{setCloseStorageHovered(true)}}
          onMouseLeave={()=>{setCloseStorageHovered(false)}}
        >
          {closeStorageHovered?
            <FontAwesomeIcon icon={faDoorClosed}/>
          :
            <FontAwesomeIcon icon={faDoorOpen}/>
          }
        </button>
          </div>
        </div>
        <Modal.Body>
          <div id="view-storage-container" className="d-flex align-items-center justify-content-center">
            <div id="storage-in-view" className="w-100 h-100" style={{width: (cellSpecifications.type == "freezer"? '300px !important':'')}}>
            {isFetched?
              <div className='row py-3 px-4'>
                <div className="row my-2 mx-0">
                  <div className='col-12 p-0' style={{lineHeight: '0'}}>
                    {cellSpecifications.type == "shelf"?
                      <>
                      {rowArray.map((products) => {
                        return(
                          <>
                          <div className="col-12 p-0 shelf-top m-0"></div>
                          <div className="col-12 p-0 m-0 shelf-center w-100">
                            <div className=" d-flex justify-content-center flex-row align-items-center p-3 h-100">
                              
                              {products.map((item)=>{
                                return (
                                  <>
                                    {item.id != " "?
                                      <div 
                                        className="storage-item w-100 h-100 p-0"
                                        key={item.id}
                                      >
                                        <button 
                                          className="storage-item-img-container m-0 w-100 d-flex align-items-center justify-content-center"
                                          onClick={()=>{setProductToView(item.id); setModalShowPQV(true)}}
                                        >
                                        <div className="badge-container">
                                          <div className="badge">
                                            <div className="circle-small shadow-small yellow black-text condensed-text d-flex align-items-center justify-content-center">
                                              <div>
                                                <strong>{item.qty} </strong> 
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                          <div className="storage-item-img">
                                            {item.img == " " || item.img == ""?
                                              <div className="scroll-text-horizontally storage-item-no-image" style={{margin: '0.2em'}}>{item.description}</div>
                                            :
                                            <img src={item.img} style={{height: '100%', width: 'auto'}}/>
                                            }
                                          </div>
                                        </button>
                                      </div>
                                    :
                                      <div 
                                        className="storage-item-empty w-100 h-100"
                                        key={item.id}
                                      >
                                        <button 
                                          className="storage-item-img-container m-0 p-0 w-100 d-flex align-items-center justify-content-center"
                                          style={{background: 'none !important'}}
                                        >
                                        </button>
                                      </div>
                                    }
                                  </>
                                )
                              })}
                            </div>
                          </div>
                          </>
                        )
                      })}
                      </>
                    :
                      <></>
                    }
                    {cellSpecifications.type == "freezer"?
                      <>
                      {rowArray.map((products, index) => {
                        return(
                          <>
                          {index == 0?
                          <div className="col-12 p-0 freezer-top m-0"></div>
                          :
                          <></>
                          }
                          <div className="col-12 p-0 m-0 freezer-center w-100">
                                        <div className=" d-flex justify-content-center flex-row align-items-center p-3 h-100">
                              {products.map((item)=>{
                                return (
                                  <>
                                    {item.id != " "?
                                      
                                          <div 
                                            className="storage-item w-100 h-100 p-0"
                                            key={item.id}
                                          >
                                            <button 
                                          className="storage-item-img-container m-0 w-100 d-flex align-items-center justify-content-center"
                                          onClick={()=>{setProductToView(item.id); setModalShowPQV(true)}}
                                        >
                                            <div className="badge-container">
                                              <div className="badge">
                                              <div className="circle-small shadow-small yellow black-text condensed-text d-flex align-items-center justify-content-center">
                                              <div>
                                                <strong>{item.qty} </strong> 
                                              </div>
                                            </div>
                                              </div>
                                            </div>
                                              {item.img == " " || item.img == ""?
                                                <div className="scroll-text-horizontally storage-item-no-image" style={{margin: '0.2em'}}>{item.description}</div>
                                              :
                                              <img src={item.img} style={{height: '100%', width: 'auto'}}/>
                                              }
                                            </button>
                                          </div>
                                    :
                                      <div 
                                        className="storage-item-empty w-100 h-100"
                                        key={item.id}
                                      >
                                        <button 
                                          className="storage-item-img-container m-0 p-0 w-100 d-flex align-items-center justify-content-center"
                                          style={{background: 'none !important'}}
                                        >
                                        </button>
                                      </div>
                                    }
                                    
                                  </>
                                )
                              })}
                              
                              </div>
                                      </div>
                          </>
                        )
                      })}
                      </>
                    :
                      <></>
                    }
                    {cellSpecifications.type == "pallet"?
                      <>
                      {rowArray.map((products, index) => {
                        return(
                          <>
                          <div className="col-12 p-0 m-0 w-100" style={{height: '100px'}}>
                                        <div className={"d-flex justify-content-center flex-row align-items-center p-3 h-100" + (index == rowArray.length-1?" pallet-center":"")}>
                              {products.map((item)=>{
                                return (
                                  <>
                                    {item.id != " "?
                                          <div 
                                            className="storage-item w-100 h-100 p-0"
                                            key={item.id}
                                          >
                                            <button 
                                          className="storage-item-img-container m-0 w-100 d-flex align-items-center justify-content-center"
                                          onClick={()=>{setProductToView(item.id); setModalShowPQV(true)}}
                                        >
                                            <div className="badge-container">
                                              <div className="badge">
                                              <div className="circle-small shadow-small yellow black-text condensed-text d-flex align-items-center justify-content-center">
                                              <div>
                                                <strong>{item.qty} </strong> 
                                              </div>
                                            </div>
                                              </div>
                                            </div>
                                              {item.img == " " || item.img == ""?
                                                <div className="scroll-text-horizontally storage-item-no-image" style={{margin: '0.2em'}}>{item.description}</div>
                                              :
                                              <img src={item.img} style={{height: '100%', width: 'auto'}}/>
                                              }
                                            </button>
                                          </div>
                                    :
                                      <div 
                                        className="storage-item-empty w-100 h-100"
                                        key={item.id}
                                      >
                                        <button 
                                          className="storage-item-img-container m-0 p-0 w-100 d-flex align-items-center justify-content-center"
                                          style={{background: 'none !important'}}
                                        >
                                        </button>
                                      </div>
                                    }
                                    
                                  </>
                                )
                              })}
                              
                              </div>
                                      </div>
                          </>
                        )
                      })}
                      </>
                    :
                      <></>
                    }
                  <div className={'col-12 p-0 ' + cellSpecifications.type +'-bottom'}></div>
                  </div>
                </div>
              </div>
            :
              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                <Spinner 
                color1="#b0e4ff"
                color2="#fff"
                textColor="rgba(0,0,0, 0.5)"
                className="w-50 h-50"
                />
              </div>
            }
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  function DisplayWarehouseListFooter() {
    const [searchValue, setSearchValue] = useState("")
    const findProducts = () => {
      var keyword = searchValue
      var temp_storages = []
      if(keyword == null || keyword === undefined || keyword == "")
      {
        temp_storages = []
      }
      else
      {
        warehouse[whId].cells.map((row) => {
          Object.keys(row).map((col) => {
            if(row[col].isStorage)
            {
              row[col].products.map((product) => {
                if(product.substring(0, 9).toLowerCase() == keyword.toLowerCase() || getProductInfo(product).description.toLowerCase().startsWith(keyword.toLowerCase()))
                {
                  
                  temp_storages.push(row[col].id)
                }
              })
            }
          })
        })

      }
      setSearchResult(temp_storages)
    
    };
    return(
      
      <div 
        id="warehouse-list-bar-footer" 
        className={"w-100 d-flex justify-content-between align-items-center" + (warehouseListVisible?"":" warehouse-list-bar-hidden")}
        style={{height: '50px'}}
      >
      <div className="w-100 row m-0">
        <div className="col-5 d-flex align-items-center justify-content-center ps-2 pe-5">
          <InputGroup id="warehouse-search">
            <InputGroup.Text style={{borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px"}}>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <input
              ref={storageSearchRef}
              type="search"
              className="input"
              value={searchValue}
              onChange={(event)=>{setSearchValue(event.target.value)}}
              placeholder="IT000013, Rexona Pink 3mL (1pc)"
            />
            <button
            className="locate ms-2"
            disabled={searchValue === undefined || searchValue == "" || searchValue == " "}
            onClick={findProducts}>
              Locate
            </button>
            <button
            className="reset mx-2"
            onClick={()=>{setSearchResult([])}}>
              Reset
            </button>
            </InputGroup>
        </div>
        <div className="col-2 d-flex align-items-center justify-content-end ps-0 pe-2">
          <span className="me-2" style={{lineHeight: '0'}}><strong>Warehouse Map Togggles:</strong></span>
        </div>
        <div className="col-5 ps-1 pe-5">
          <div className="row m-0 p-2">
            <div className="col-3 d-flex align-items-center justify-content-center px-2">
              <span className="me-2" style={{lineHeight: '0'}}>
                <Create
                  color={'#000'} 
                  title={'Category'}
                  height="15px"
                  width="15px"
                />
              </span>
              <label
                className={'vertical-switch '+ (zooming?'no-click':'')}
                data-title="Toggle Map Editing"
              >
                <input 
                  type="checkbox"
                  defaultChecked={editingMap}
                  disabled={zooming}
                  onClick={()=>{editingMap?setEditingMap(false):setEditingMap(true)}}
                />
                <span className="vertical-slider round"></span>
              </label>
            </div>
            <div className="col-3 d-flex align-items-center justify-content-center px-2">
              <span className="me-2" style={{lineHeight: '0'}}>
                <QR
                  color={'#000'} 
                  title={'Category'}
                  height="15px"
                  width="15px"
                />
              </span>
              <label 
                className="vertical-switch"
                data-title="Toggle QR Code Display"
              >
                <input 
                  type="checkbox"
                  defaultChecked={qrVisible}
                  onClick={()=>{qrVisible?setQRVisible(false):setQRVisible(true)}}
                />
                  <span className="vertical-slider round"></span>
              </label>
            </div>
            <div className="col-3 d-flex align-items-center justify-content-center px-2">
              <span className="me-2" style={{lineHeight: '0'}}>
                <Text
                  color={'#000'} 
                  title={'Category'}
                  height="15px"
                  width="15px"
                />
              </span>
              <label
                className="vertical-switch"
                data-title="Toggle Space ID Display"
              > 
                <input 
                  type="checkbox"
                  defaultChecked={cellIdVisible}
                  onClick={()=>{cellIdVisible?setCellIdVisible(false):setCellIdVisible(true)}}
                />
                <span className="vertical-slider round"></span>
              </label>
            </div>
            <div className="col-3 d-flex align-items-center justify-content-center px-2">
              <span className="me-2" style={{lineHeight: '0'}}>
                <SearchOutline
                  color={'#000'} 
                  title={'Category'}
                  height="15px"
                  width="15px"
                />
              </span>
              <label
                  className={'vertical-switch '+ (editingMap?'no-click':'')}
                  data-title="Toggle Zooming"
              > 
                <input
                  className={(editingMap?'no-click':'')} 
                  type="checkbox"
                  defaultChecked={zooming}
                  onClick={()=>{if(zooming){setZooming(false); setEditingMap(false)}else{setZooming(true)}}}
                />
                  <span className="vertical-slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="">
        <div className="">
          <button
            id="warehouse-list-visibility-toggle"
            className="plain-button float-end"
            data-title={warehouseListVisible?"Hide":"Show"}
            onClick={() => {warehouseListVisible?setWarehouseListVisible(false):setWarehouseListVisible(true)}}
          >
            {warehouseListVisible?
              <CaretUp
                className="caret pull-down"
                color={'#000000'}
                height="15px"
                width="15px"
              />
            :
              <CaretDown
                className="caret pull-down"
                color={'#000000'}
                height="15px"
                width="15px"
                />
            }
          </button>
        </div>
      </div>
    </div>
    )
  }

  function WarehouseInfo() {
    const editWarehouse = () => {
      updateDoc(doc(db, "warehouse", warehouse[whId].id), {
        wh_name: newWarehouseName,
        address: newWarehouseAddress,
        wh_notes: newWarehouseNotes
      });
      setCollectionUpdateMethod("update")
      updateWarehouseToast()
    }
    const [newWarehouseName, setNewWarehouseName] = useState("")
    const [newWarehouseAddress, setNewWarehouseAddress] = useState("")
    const [newWarehouseNotes, setNewWarehouseNotes] = useState("")
    
  useEffect(() => {
    if(warehouse === undefined || whId == undefined)
    {

    }
    else
    {
      setNewWarehouseName(warehouse[whId].wh_name)
      setNewWarehouseAddress(warehouse[whId].address)
      setNewWarehouseNotes(warehouse[whId].wh_notes)
    }
  }, [whId])
    return(
      <div className="w-100 m-0 row d-flex align-items-center">
        <div className="col-11">
          {editingWarehouse?
      <div className="w-100 m-0 row">
      <div className="col-5 px-1 d-flex align-items-center justify-content-start">
        <h3><strong>
        <input
          type="text"
          className="form-control shadow-none"
          value={newWarehouseName}
          onChange={(e)=>{setNewWarehouseName(e.target.value)}}
        />
        </strong></h3>
      </div>
      <div className="col-4 px-1 d-flex align-items-center justify-content-center">
        <div className="me-2">
          <strong>Address:</strong>
        </div>
        <input
          type="text"
          className="form-control shadow-none"
          value={newWarehouseAddress}
          onChange={(e)=>{setNewWarehouseAddress(e.target.value)}}
        />
      </div>
      <div className="col-3 px-1 d-flex align-items-center justify-content-center">
        <div className="me-2">
          <strong>Notes:</strong>
        </div>
        <input
          type="text"
          className="form-control shadow-none"
          value={newWarehouseNotes}
          onChange={(e)=>{setNewWarehouseNotes(e.target.value)}}
        />
      </div>
    </div>
          :
          <div className="w-100 m-0 row">
            <div className="col-5 px-1 d-flex align-items-center justify-content-start" style={{padding: ".375rem .75rem"}}>
              <h3><strong>{warehouse[whId].wh_name}</strong></h3>
            </div>
            <div className="col-4 px-1 d-flex align-items-center justify-content-center" style={{padding: ".375rem .75rem"}}>
              <div className="me-2">
                <strong>Address:</strong>
              </div>
              <div className="d-inline-block">
                  {warehouse[whId].address}
              </div>
            </div>
            <div className="col-3 px-1 d-flex align-items-center justify-content-center" style={{padding: ".375rem .75rem"}}>
              <div className="me-2">
                <strong>Notes:</strong>
              </div>
              <div className="d-inline-block">
                  {warehouse[whId].wh_notes}
              </div>
            </div>
          </div>
          }
        </div>
        <div className="col-1 px-1 d-flex align-items-center">
          <DeleteWarehouseModal
            show={deleteWarehouseModalShow}
            onHide={() => { setDeleteWarehouseModalShow(false) }}
          />
          {editingWarehouse?
          <Button
            className="delete me-1"
            data-title="Cancel Changes"
            onClick={()=>{setEditingWarehouse(false)}}
          >
            <FontAwesomeIcon icon={faClose} />
          </Button>
          :
          <Button
            className={warehouse[whId].cells.length > 0 ? "delete disabled-conditionally me-1" : "delete me-1"}
            data-title={checkIfPooled(warehouse[whId].cells)?"Warehouse already pooled": (editingMap?"Can't delete while editing":"Delete Warehouse")}
            disabled={checkIfPooled(warehouse[whId].cells)? true: editingMap}
            onClick={()=>{setDeleteWarehouseModalShow(true)}}
          >
            <FontAwesomeIcon icon={faTrashCan} />
          </Button>
          }
          <Button
            className="edit me-1"
            disabled={editingMap}
            data-title={editingWarehouse?"Save Changes":"Edit Warehouse"}
            onClick={()=>{
              if (editingWarehouse) {
                setEditingWarehouse(false)
                editWarehouse(warehouse[whId].id)
              }
              else {
                setEditingWarehouse(true)
              }
            }}
          >
            {editingWarehouse?
              <FontAwesomeIcon icon={faSave} />
            :
              <FontAwesomeIcon icon={faEdit} />
            }
          </Button>
        </div>
      </div>
    )
  }

return (
 <div>
    <UserRouter
      route='/warehouse'
    />
    <Navigation 
      page='/warehouse'
    />
    <ToastContainer
          newestOnTop={false}
          pauseOnFocusLoss
        />
    <ViewStorage
      show={modalShowVS}
      onHide={() => setModalShowVS(false)}
    />
    <ProductQuickView
      show={modalShowPQV}
      onHide={() => setModalShowPQV(false)}
      productid={productToView}
    />
    <Tab.Container activeKey={key} onSelect={(k) => setKey(k)}>
      <div id="contents" className="row">
        <div className="row py-4 px-5">
          <div 
            id="warehouse-list-bar"
            className={"sidebar horizontal" + (warehouseListVisible?"":" d-none")}
          >
            <div className="hsidebar-segment left">
              <h1 className="pb-2 module-title">Warehouse Management</h1>
              <hr></hr>
            </div>
            <div className="hsidebar-segment divider"></div>
            <div className="hsidebar-segment right">
              <div id="warehouse-title">
                <h5>Warehouse List [{isFetched?<>{warehouse.length}</>:<></>}]</h5>
              </div>
              <div id="warehouse-list" style={{minHeight: '100px'}}>
                <div className="row">
                  <div className="col-11">
                    <NewWarehouseModal
                      show={modalShowWH}
                      onHide={() => setModalShowWH(false)} 
                    />
                      {isFetched?
                        <>
                          {warehouse.length == 0?
                            <div className="w-100 h-100 pt-4 d-flex align-items-center justify-content-center flex-column">
                              <h5 className="mb-3"><strong>No <span style={{color: '#0d6efd'}}>warehouses</span> to show.</strong></h5>
                                <p className="d-flex align-items-center justify-content-center">
                                  <span>Click the</span>
                                  <Button
                                    className="add ms-1 me-1 static-button no-click"
                                  >
                                    <FontAwesomeIcon icon={faPlus} />
                                  </Button>
                                  <span>
                                    button to add one.
                                  </span>
                                </p>
                            </div>
                          :
                          <ListGroup activeKey={key} horizontal> 
                            {warehouse.map((warehouse) => {
                              return (
                                <ListGroup.Item 
                                  action 
                                  key={warehouse.id}
                                  eventKey={warehouse.id}
                                  onClick={() => { handleDocChange(warehouse.id) }}
                                >
                                  <div className='row'>
                                    <div className='warehouse-item-header'>
                                      <div className="code">
                                        {warehouse.id.substring(0,4)}
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
                          }
                        </>
                      :
                        <div className="d-flex align-items-center justify-content-center flex-column p-5" style={{height: '90px', width: '90px'}}>
                          <Spinner 
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
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
          <DisplayWarehouseListFooter/>
          <div className="divider horizontal">
          </div>
          <Tab.Content
            className="px-0">
              {(warehouse === undefined || warehouse.length == 0) || whId === undefined?
                <></>
              :
                <Tab.Pane eventKey={warehouse[whId].id}>
                  <div className="data-contents horizontal">
                    <div id="warehouse-info">
                      <WarehouseInfo/>
                    </div>
                    <div className="map-container">
                      <div id="warehouse-map">
                        {warehouse[whId].isInit === undefined?
                          <div className="d-flex align-items-center justify-content-center flex-column p-5">
                            <Spinner 
                              color1="#b0e4ff"
                              color2="#fff"
                              textColor="rgba(0,0,0, 0.5)"
                              className="w-25 h-25"
                            />
                          </div>
                        :
                          <>
                          {warehouse[whId].isInit?
                            <>
                              <WarehouseMapAddProductModal
                                show={modalShowAP}
                                onHide={() => setModalShowAP(false)}
                              />
                              {zooming?
                                <>
                                  <TransformWrapper
                                    initialScale={1}
                                    minScale={0.25}
                                    maxScale={7}
                                    initialPositionX={0}
                                    initialPositionY={0}
                                    position={0}
                                    options={
                                      {
                                        transformEnabled: false,
                                        centerContent: false,}
                                      }
                                    wheel={
                                      {disabled: !zooming,}
                                    }
                                    enablePadding={false}
                                  >
                                    {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                                      <React.Fragment>
                                        <TransformComponent>
                                          <DisplayMap/>
                                        </TransformComponent>
                                      </React.Fragment>
                                    )}
                                  </TransformWrapper>
                                </>
                              :
                                <DisplayMap/>
                              }
                            </>
                          :
                            <>
                              <NewMapModal
                                show={modalShowMap}
                                onHide={() => setModalShowMap(false)}
                              />
                              <div>
                                <div className="text-center">
                                  <h5 className="py-2">Seems like you haven't set-up your warehouse map yet.</h5>
                                  <h4 className="py-3" style={{fontWeight: "600", color: '#4172c1'}}>Start now by choosing from the templates below or customizing your own.</h4>
                                  <DisplayTemplates/>
                                  <br />
                                </div>
                              </div>
                            </>
                          }
                          </>
                        }
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              } 
          </Tab.Content>
        </div>
      </div>
    </Tab.Container>
 </div>
);
}
export default Warehouse;