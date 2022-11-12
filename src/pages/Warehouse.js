import React from 'react';
import { Tab, Button, ListGroup, Modal, Card } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect, useRef, Component  } from 'react';
import { db } from '../firebase-config';
import { collection, doc, deleteDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPlus, faMap, faEdit, faArrowCircleRight, faDoorOpen, faDoorClosed} from '@fortawesome/free-solid-svg-icons'
import { faMap as faMapO } from '@fortawesome/free-regular-svg-icons'
import QRCode from "react-qr-code";
import { Create, Text, QrCode as QR, SearchOutline} from 'react-ionicons'
import { CaretDown, CaretUp } from 'react-ionicons'
import NewWarehouseModal from '../components/NewWarehouseModal';
import NewMapModal from '../components/NewMapModal';
import { toast, } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [cellSpecifications, setCellSpecifications] = useState({type:"",products:[]});
  const [warehouse, setWarehouse] = useState();
  const [whId, setWHId] = useState();
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [editing, setEditing] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [qrVisible, setQRVisible] = useState(false);
  const [cellIdVisible, setCellIdVisible] = useState(false);
  const [warehouseListVisible, setWarehouseListVisible] = useState(true);
  const [colIndex, setColIndex] = useState(0);
  const [rowIndex, setRowIndex] = useState(0);
  const [isStockcardFetched, setIsStockcardFetched] = useState();
  const [key, setKey] = useState('main');//Tab controller
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("none")

  //element state updater
  useEffect(() => {
    var allGridlines = document.querySelectorAll(".box-col"); // select all box-col for editing
    if (editing) {
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

    var warehouse_list_bar = document.getElementById("warehouse-list-bar");
    var warehouse_list_visibility_toggle = document.getElementById("warehouse-list-visibility-toggle");
    var warehouse_list_footer = document.getElementById("warehouse-list-bar-footer");

    if (warehouseListVisible) {
      warehouse_list_bar.classList.remove("d-none")
      warehouse_list_visibility_toggle.setAttribute("data-title","Hide");
      warehouse_list_footer.classList.remove("warehouse-list-bar-hidden");
    } else {
      warehouse_list_bar.classList.add("d-none")
      warehouse_list_visibility_toggle.setAttribute("data-title","Show");
      warehouse_list_footer.classList.add("warehouse-list-bar-hidden");
    }
  }, )

  useEffect(()=>{

  }, [whId])

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

  // get warehouse docs
  /*useEffect(() => {
    async function readWarehouseDoc() {
      const warehouseRef = doc(db, "warehouse", whId)
      const docSnap = await getDoc(warehouseRef)
      if (docSnap.exists()) {
        setWarehouseDoc(docSnap.data());
      }
    }
    readWarehouseDoc()
  }, [whId])*/
  
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
        if(collectionUpdateMethod == "update")
        {
          setCollectionUpdateMethod("add")
        }
        else if(collectionUpdateMethod == "add")
        {
          setWHId(warehouse.length-1)
          setKey(warehouse[warehouse.length-1].id)
        }
        else if(collectionUpdateMethod == "none")
        {
          setWHId(0)
          setKey(warehouse[0].id)
        }
      }
      else
      {
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

  function addPadding(num) {
    var padded = num + "";
    while(padded.length < 2) {padded = "0" + padded;}
    return padded;
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

  const deleteWarehouse = async (id) => {
    const warehouseDoc = doc(db, "warehouse", id)
    await deleteDoc(warehouseDoc);
    deleteToast();
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
    console.log()

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
        >
          <FontAwesomeIcon icon={faDoorClosed}/>
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

  function WarehouseMapAddProductModal(props) {
    const [productsInStorage, setProductsInStorage] = useState([]);
    const [cellId, setCellId] = useState("");
    const [cellType, setCellType] = useState("");
    const [cellRemarks, setCellRemarks] = useState(" ");

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
    tempCell[rowIndex][colIndex].id = cellId
    tempCell[rowIndex][colIndex].remarks = cellRemarks
    const getWarehouse = doc(db, 'warehouse', warehouse[whId].id);
    
    await updateDoc(getWarehouse,{
      cells: tempCell
    });
    props.onHide()
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
            className="d-flex justify-content-center">
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
                              <div className="row">
                              <p className="product-adding-stage-tip">Click a product to <span style={{color: '#629ce3c3'}}>add</span> to the storage</p>
                              </div>
                              <div className="row">
                                {stockcard.map((stockcard, index) => {
                                  return (
                                    <>
                                    {productsInStorage === undefined? <>
                                    <Spinner 
                                      color1="#b0e4ff"
                                      color2="#fff"
                                      textColor="rgba(0,0,0, 0.5)"
                                      className="w-25 h-25"
                                    /></>:<>
                                      {stockcard === undefined?<></>:<>
                                        {productsInStorage.indexOf(stockcard.id) == -1?
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
                                      
                                        :<></>}
                                      </>}
                                    </>}
                                  </>)})}
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
                              <p className="product-adding-stage-tip">Click a product to <span style={{color: '#e36262c3'}}>remove</span> from the storage</p>
                              </div>
                              <div className="row">
                                {stockcard.map((stockcard, index) => {
                                  return (
                                    <>
                                    {productsInStorage === undefined?<></>:<>
                                      {stockcard === undefined?<></>:<>
                                        {productsInStorage.indexOf(stockcard.id) >= 0?
                                          <div className="col-6 p-0">
                                            <button
                                              className="product-inselection"
                                              id={stockcard.id}
                                              key={stockcard.id}
                                              onClick={() => { handleProductSelect(stockcard.id)}}
                                              
                                            >
                                              <Card
                                              >
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
                                      
                                        :<></>}
                                      </>}
                                    </>}
                                  </>)})}
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
                        className="box d-flex align-items-center justify-content-center"
                        key={'row' + index + '-' + k}
                      >
                        <div className="box-call-to-action"
                          key={'ca' + index + '-' + k}>
                          <div className="box-ca-container">
                            {editing?
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
                                        >
                                          <FontAwesomeIcon icon={faDoorOpen}/>
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
                        <div className={'box-col ' + content[k].color} style ={{width: (getMapWidth()/warehouse[whId].col) + 'px', height: (getMapWidth()/warehouse[whId].col) + 'px'}}
                        key={'col' + index + '-' + k}
                        >
                          {content[k].isStorage?
                            <div className={'storage ' + content[k].type + ' ' + content[k].orientation}>
                               
                              
                              
                              <div className="cell-info" style={{fontSize: (60/warehouse[whId].col) + 'pt'}}>
                                <span className="cell-id d-none">{content[k].id.substring(content[k].id.length-3, content[k].id.length)}</span>
                                <div className="qr-code d-flex justify-content-center d-none">
                                  <QRCode
                                    value={content[k].id}
                                    size={50}
                                  />
                                </div>
                              </div>
                            </div>
                          :
                            <>
                            <div className="cell-info" style={{fontSize: (60/warehouse[whId].col) + 'pt'}}>
                              <span className="cell-id d-none">{content[k].id.substring(content[k].id.length-3, content[k].id.length)}</span>
                            </div>      
                              {content[k].products.map((val, k) => {
                                return(
                                  <div>
                                  </div>
                                  )
                              })}
                            </>
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
                      classname="plain-button"
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

return (
 <div>
    <UserRouter
      route='/warehouse'
    />
    <Navigation 
      page='/warehouse'
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
          <div className='sidebar horizontal' id="warehouse-list-bar">
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
          <div id="warehouse-list-bar-footer" className="d-flex justify-content-end align-items-center"style={{height: '40px'}}>
            <div className="col-4 d-flex align-items-center justify-content-center px-2">
            </div>
            <div className="col-3 d-flex align-items-center justify-content-end px-2">
              <span className="me-2" style={{lineHeight: '0'}}><strong>Warehouse Map Togggles:</strong></span>
            </div>
            <div className="col-6">
              <div className="row m-0 p-2">
                <div className="col-2 d-flex align-items-center justify-content-center px-2">
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
                      defaultChecked={editing}
                      disabled={zooming}
                      onClick={()=>{editing?setEditing(false):setEditing(true)}}
                    />
                    <span className="vertical-slider round"></span>
                  </label>
                </div>
                <div className="col-2 d-flex align-items-center justify-content-center px-2">
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
                <div className="col-2 d-flex align-items-center justify-content-center px-2">
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
                <div className="col-2 d-flex align-items-center justify-content-center px-2">
                  <span className="me-2" style={{lineHeight: '0'}}>
                    <SearchOutline
                      color={'#000'} 
                      title={'Category'}
                      height="15px"
                      width="15px"
                    />
                  </span>
                  <label
                      className={'vertical-switch '+ (editing?'no-click':'')}
                      data-title="Toggle Zooming"
                  > 
                    <input
                      className={(editing?'no-click':'')} 
                      type="checkbox"
                      defaultChecked={zooming}
                      onClick={()=>{if(zooming){setZooming(false); setEditing(false)}else{setZooming(true)}}}
                    />
                      <span className="vertical-slider round"></span>
                   </label>
                </div>
              </div>
            </div>
            <div className="col-1">
              <button
                id="warehouse-list-visibility-toggle"
                className="plain-button float-end"
                data-title="Hide"
                onClick={() => {warehouseListVisible?setWarehouseListVisible(false):setWarehouseListVisible(true)}}
              >
                {warehouseListVisible?
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
          </div>
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
                      <div className="row d-flex align-items-center">
                        <div className="col-4">
                          <h3><strong>{warehouse[whId].wh_name}</strong></h3>
                        </div>
                        <div className="col-4">
                          <div className="d-inline-block me-2">
                            <strong>Address:</strong>
                          </div>
                          <div className="d-inline-block">
                              {warehouse[whId].address}
                          </div>
                        </div>
                        <div className="col-3">
                          <div className="d-inline-block me-2">
                            <strong>Notes:</strong>
                          </div>
                          <div className="d-inline-block">
                              {warehouse[whId].wh_notes}
                          </div>
                        </div>
                        <div className="col-1 d-flex align-items-center">
                          <Button
                            className="delete me-1"
                            data-title="Delete Warehouse"
                            onClick={() => { deleteWarehouse(warehouse[whId].id) }}
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                          <Button
                            className="edit me-1"
                            data-title="Edit Warehouse"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                        </div>
                      </div>
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
                                id={warehouse === undefined?"WH01":warehouse[whId].id}
                              />
                              <div>
                                <div className="text-center">
                                  <h4>Warehouse Map Not Initialized</h4>
                                  <br />
                                  <Button
                                    className="btn btn-primary"
                                    style={{ width: "150px" }}
                                    onClick={()=>setModalShowMap(true)}
                                  >
                                    Set Up Now
                                  </Button>
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