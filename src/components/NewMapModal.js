import { addDoc, setDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { padStart } from "lodash";
import { Modal, Button } from 'react-bootstrap';
import React, { StrictMode } from "react";
import { collection, where, query, getDoc } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import { UserAuth } from '../context/AuthContext'
import { Warning } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from 'loading-animations-react';


function NewMapModal(props) {

  const [warehouseID, setWarehouseID] = useState();
  const [col, setCol] = useState(1);
  const [row, setRow] = useState(1);
  const [prevCell, setPrevCell] = useState([[0,0],[0,0]]);
  const [prevDimension, setPrevDimension] = useState(40);
  const [prevHeight, setPrevHeight] = useState(0);
  const [prevBackground, setPrevBackground] = useState(0);
  const [cell, setCell] = useState({});
  const [prevClicked, setPrevClicked] = useState(false);
  const [modeChosen, setModeChosen] = useState();
  const [warehouseWidth, setWarehouseWidth] = useState(1);
  const [warehouseHeight, setWarehouseHeight] = useState(1);
  const [mapPreviewDivHeight, setMapPreviewDivHeight] = useState(1);
  const [mapPreviewHeight, setMapPreviewHeight] = useState(1);
  const [mapPreviewDivWidth, setMapPreviewDivWidth] = useState(1);


  useEffect(() => {
    if (props.id) 
    {
      setWarehouseID(props.id);
    }  
  }, [props.id])

  useEffect(() => {
    if (props.istemplate) 
    {
      setPrevClicked(true);
    }
    else
    {
      setPrevClicked(false);
    }
  }, [props.istemplate])

  useEffect(() => {
    setPrevDimension(prevHeight/row+1)
  })

  function changeMode(evt, mode) {
    // Declare all variables
    var i, tabcontent, tablinks;
    setPrevClicked(false)
    setModeChosen(mode)
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
    document.getElementById(mode).style.display = "block";
    evt.currentTarget.className += " active";
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
        obj.id = warehouseID.substring(0, 4) + '-' + (i + 10).toString(36).toUpperCase() + addPadding(Number(j+1));
        tempCol[j] = obj;
      }
      tempArray.push(tempCol);
    }
    setCell(tempArray);
  }

  useEffect(()=>{
    console.log(modeChosen)
  })
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

  const updatePreview = () => {
    
    var tempArray = [];
    var tempCol = [];
  
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
      if(mapPreviewHeight*col > mapPreviewDivWidth)
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
    if(props.istemplate)
    {
      const getMap = doc(db, 'warehouse', warehouseID);
        await updateDoc(getMap,{
          col: Number(Object.keys(props.template.contents[0]).length)
          , row: Number(props.template.contents.length)
          , isInit: true
          , cells: props.template.contents
      });
    }
    else
    {
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
    props.onHide()
  }

  const computeSpaces = () => {

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
      {props.istemplate?
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
                  <img src={props.template.img} style={{width: "100%", height: "100%", objectFit: "contain", boxSizing: "border-box"}}/>
                </div>
              </div>
              <div className='col-4 px-3 py-5' style={{textAlign: "right"}}>
                <h4 className="mb-3">
                  <strong>{props.template.name}</strong>
                </h4>
                <h6 className="mb-3" style={{lineHeight: "1.5em"}}>{props.template.description}</h6>
                <h6 className="text-muted">{props.template.specs}</h6>
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
                  <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, 'grid')}>By Grid</button>
                  <button className="tablinks tablinks-init-style" onClick={(event)=>changeMode(event, 'scale')}>By Scale</button>
                </div>
                <div id="grid" className="tabcontent">
                  <div className="row h-100">
                    <div className="blue-strip p-2 mb-2 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                      <span>With <strong>by grid</strong>, the number of workable spaces is dependent on the number of rows and columns (row * col).</span>
                    </div>
                    <div className="col-6">
                      <div id="map-preview">
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                          {prevCell.map((row, index) =>
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
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="mb-2"></h6>
                      <div className="mb-2">
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
                            <Button
                              disabled={col <= 0 || row <=0}
                              className="preview float-end disabled-conditionally"
                              data-title={col <= 0 || row <=0?"Enter positive numbers":""}
                              variant="outline-primary"
                              onClick={(e)=>{setPrevClicked(true);updatePreview()}}
                            >
                              Preview
                            </Button>
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
                <div id="scale" className="tabcontent">
                <div className="row h-100">
                    <div className="blue-strip p-2 mb-2 left-full-curve right-full-curve  d-flex align-items-center justify-content-center" style={{fontSize: '11pt'}}>
                    <span>With <strong>by scale</strong>, the number of workable spaces is dependent on the estimated dimensions of the warehouse as well as the dedicated width for every storage.</span>
                    </div>
                    <div className="col-6">
                      <div id="map-preview">
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                          {prevCell.map((row, index) =>
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
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="mb-2"></h6>
                      <div className="mb-2">
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
                                  setPrevClicked(false);
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
                                  setPrevClicked(false);
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
                              defaultValue={row}
                              onChange={(e) => {
                                getMapPreviewHeight()
                                setPrevClicked(false);
                                setRow(e.target.value)
                              }}
                            />
                          </div>
                        </div>
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
                            <Button
                              disabled={col <= 0 || row <=0}
                              className="preview float-end disabled-conditionally"
                              data-title={col <= 0 || row <=0?"Enter positive numbers":""}
                              variant="outline-primary"
                              onClick={(e)=>{setPrevClicked(true);updatePreview()}}
                            >
                              Preview
                            </Button>
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
          disabled={!prevClicked}
          onClick={()=>{setPrevClicked(true); addMap()}}
        >
          Create Map
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


export default NewMapModal;
