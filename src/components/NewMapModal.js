import { addDoc, setDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { padStart } from "lodash";
import { Modal, Button } from 'react-bootstrap';
import React from "react";
import { collection, where, query, getDoc } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import { UserAuth } from '../context/AuthContext'
import { Warning } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from 'loading-animations-react';


function NewMapModal(props) {

  const masterdataDocRef = doc(db, "masterdata", "warehouse")
  const [cntr, setCntr] = useState(0);
  const { user } = UserAuth();//user credentials
  const [warehouseID, setWarehouseID] = useState("WH004");
  const [warehouseDoc, setWarehouseDoc] = useState("");
  const [col, setCol] = useState(2);
  const [row, setRow] = useState(2);
  const [prevCell, setPrevCell] = useState([[0,0],[0,0]]);
  const [prevDimension, setPrevDimension] = useState(40);
  const [prevWidth, setPrevWidth] = useState(0);
  const [prevBackground, setPrevBackground] = useState(0);
  const [cell, setCell] = useState({});




  useEffect(() => {
    if (props.id) {
      setWarehouseID(props.id);
    }  
  }, [props.id])

  useEffect(() => {
    setPrevDimension(prevWidth/col)
  })

  useEffect(() => {
    async function readWarehouseDoc() {
      const warehouseRef = doc(db, "warehouse", warehouseID)
      const docSnap = await getDoc(warehouseRef)
      if (docSnap.exists()) {
        setWarehouseDoc(docSnap.data());
      }
    }
    readWarehouseDoc()
  }, [warehouseID])

  const handlePreview = () => {

  }

  function changeMode(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;
    var allTabs = document.querySelectorAll(".tablinks");
    for(i = 0; i < allTabs.length; i++) {
      allTabs[i].classList.remove('tablinks-init-style');
    }
  
    // Get all elements with className="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with className="tablinks" and remove the className "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" className to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";

  } 

  const closeModal=()=>{
      document.querySelector("#warehouse-modal").style.display = 'none';
      document.querySelector(".modal-backdrop").style.display = 'none';
  } 

  onSnapshot(masterdataDocRef, (doc) => {
    setCntr(doc.data().idCntr)
  }, [])

  var format = "";
 
  const createFormat = () => {
    format = cntr + "";
    while(format.length < 3) {format = "0" + format};
    format = "WH" + format;
 }



  const successToast = () => {
    toast.success(' Warehouse Creation Successful ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  function addPadding(num) {
    var padded = num + "";
    while(padded.length < 2) {padded = "0" + padded;}
    return padded;
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
        obj.id = (i + 10).toString(36).toUpperCase() + addPadding(Number(j+1));
        tempCol[j] = obj;
      }
      tempArray.push(tempCol);
    }
    setCell(tempArray);
  }

  const updatePreview = () => {
    var offsetWidth = document.getElementById('map-preview').offsetWidth;
    setPrevWidth(offsetWidth - 20)
    var tempArray = [];
    var tempCol = [];
  
    for(var i = 0; i < col; i++){
      tempCol.push("");
    }
    for(var j = 0; j < row; j++){
      tempArray.push(tempCol);
    }
  
    setPrevCell(tempArray)
    pushCellsArray()
   }

  const addMap = async () => {

    if( cell === undefined || cell.length == 0) {
      alert(cell);
    }
    else
    {
      const getMap = doc(db, 'warehouse', warehouseID);
      await updateDoc(getMap,{
          col: Number(col)
          , row: Number(row)
          , isInit: true
          , cells: cell
        });
    }
  }

  //data variables
  const [newWHName, setnewWHName] = useState("");
  const [newWHNotes, setnewWHNotes] = useState("");
  const [newAddress, setnewAddress] = useState("");
  const [collectionSize, setColSize] = useState("");  


  return (
    <Modal id="warehouse-modal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
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
      
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="px-3">
          Setting up map for <strong>{warehouseDoc.wh_name}</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="tab">
          <button className="tablinks no-click me-5">
          <Warning
                                className="me-2 pull-down"
                                color={'#000'} 
                                title={'Category'}
                                height="15px"
                                width="15px"
                              /><strong>Select a method to initialize your map: </strong>
          </button>
        
          <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, 'grid')}>By Grid</button>
          <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, 'scale')}>By Scale</button>
        </div>
      <div id="grid" className="tabcontent">
        <div className="blue-strip p-2 mb-4 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
          <span>With <strong>by grid</strong>, the number of workable spaces is dependent on the number of rows and columns (row * col).</span>
        </div>
        <div className="row">
          <div className="col-6">
            <h6 className="mb-2">Preview:</h6>
            <div id="map-preview">
              {prevCell.map((row) =>
              <div className="prev-box-row">
                {row.map((col) =>
                  <div className="prev-box-col"
                  style={{width: prevDimension + 'px', height: prevDimension + 'px', backgroundColor: prevBackground, backgroundImage: 'url("'+prevBackground+'")'}}>
                  </div>
                )}
                </div>
              )}
              </div>
          </div>
          <div className="col-6">
            <h6 className="mb-2"></h6>
            <div className="mb-2">
              <div className="row m-0 mb-3 p-0 d-flex align-items-center">
                <div className="col-5">
                  <label className="mb-2">Columns</label>
                    <input type="number"
                      className="form-control d"
                      placeholder="Column"
                      min={2}
                      defaultValue={col}
                      onChange={(e) => { 
                          setCol(e.target.value)
                      }}
                    />
                  </div>
                <div className="col-2">
                  <strong>X</strong>
                </div>
                <div className="col-5">        
                <label className="mb-2">Rows</label>
                  <input type="number"
                    className="form-control"
                    placeholder="Row"
                    min={2}
                    defaultValue={row}
                    onChange={(e) => {
                        setRow(e.target.value)
                    }}
                  />
                </div>
              </div>
              <div className="row m-0 mb-3 p-0 d-flex justify-content-center align-items-center">
                <div className="mb-2">Choose warehouse flooring</div>
                <div className="color-swatch map-creation d-flex justify-content-center mb-2">
                          <button className="color"
                            style={{backgroundColor: '#ffffff'}}
                            data-title="None"
                            onClick={()=>{setPrevBackground('#ffffff')
                            }}
                          >
                            </button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fsmooth_conrete.jpg?alt=media&token=0773acac-c048-4f33-8f39-47fd644330d6")'}}
                            data-title="Smooth Concrete"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fsmooth_conrete.jpg?alt=media&token=0773acac-c048-4f33-8f39-47fd644330d6')}}
                          >
                          </button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Frough_concrete.jpg?alt=media&token=3cce02b1-a2fd-49cc-8011-507f6ea3c352")'}}
                            data-title="Rough Concrete"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Frough_concrete.jpg?alt=media&token=3cce02b1-a2fd-49cc-8011-507f6ea3c352')}}
                          ></button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fdark_wood.jpg?alt=media&token=d3385145-b7ac-4845-a06c-e51012d56226")'}}
                            data-title="Dark Wood"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fdark_wood.jpg?alt=media&token=d3385145-b7ac-4845-a06c-e51012d56226')}}
                          ></button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Flight_wood.jpg?alt=media&token=307a303c-1698-4c92-ad96-def38752042e")'}}
                            data-title="Light Wood"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Flight_wood.jpg?alt=media&token=307a303c-1698-4c92-ad96-def38752042e')}}
                          ></button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fwhite_tile.jpg?alt=media&token=09c77e80-ba5c-44c8-a056-e169a449100d")'}}
                            data-title="Tile"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fwhite_tile.jpg?alt=media&token=09c77e80-ba5c-44c8-a056-e169a449100d')}}
                          ></button>
                          <button className="color"
                            style={{backgroundImage: 'url("https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fbrick.jpg?alt=media&token=403814c0-b98b-4c8f-89f9-f23720905649")'}}
                            data-title="Cobblestone"
                            onClick={()=>{setPrevBackground('https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fcell_patterns%2Fbrick.jpg?alt=media&token=403814c0-b98b-4c8f-89f9-f23720905649')}}
                          ></button>
                          </div>
              </div>
              <div className="row m-0 mb-3 p-0">
                <div className="col d-flex justify-content-center">
                  <Button
                  className="float-end"
                  variant="outline-primary"
                  onClick={(e)=>updatePreview()}>
                    Preview
                  </Button>
                </div>
              </div>
              <div className="row m-0 p-0">
                <div className="col d-flex justify-content-center">
                  <div className="blue-strip p-2 mb-4 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                    You created a warehouse map with {col*row} spaces.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          

        </div>
      <div id="scale" className="tabcontent">
        <h3>Paris</h3>
        <p>Paris is the capital of France.</p>
      </div>
    </Modal.Body>
      <Modal.Footer>
      {cell === undefined || cell.length == 0?
        <Button
        className="btn btn-success"
        disabled
        style={{ width: "150px" }}
        onClick={()=>addMap()}
        >
          <Spinner 
                      color1="#b0e4ff"
                      color2="#fff"
                      textColor="rgba(0,0,0, 0.5)"
                      className="w-50 h-50"
                      />
        </Button>
      :
      <Button
        className="btn btn-success"
        
        style={{ width: "150px" }}
        onClick={()=>addMap()}
        >Save
      </Button>
      }
        
      </Modal.Footer>
    </Modal>
  );
}


export default NewMapModal;
