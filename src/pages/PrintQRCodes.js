import RPersoneact from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Nav, Table } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, Call, InformationCircle } from 'react-ionicons'
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserRouter from '../pages/UserRouter'
import { UserAuth } from '../context/AuthContext'
import { Spinner } from 'loading-animations-react';
import QRCode from "react-qr-code";

import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import moment from "moment";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas';
import bwipjs from 'bwip-js';





function PrintQRCodes() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [warehouseCollection, setWarehouseCollection] = useState([]); //supplier Collection
  const [warehouseChosenId, setWarehouseChosenId] = useState()
  const [warehouseChosen, setWarehouseChosen] = useState({})
  const [warehouseStorages, setWarehouseStorages] = useState()
  const tableRef = useRef(null);
  const [stockcardCollection, setStockcardCollection] = useState(); //supplier Collection
  const QRBarcode = require('qrcode');
  const JsBarcode = require('jsbarcode');
  var curr_date = new Date(); // get current date
  curr_date.setDate(curr_date.getDate());
  curr_date.setHours(0, 0, 0, 0); // set current date's hours to zero to compare dates only
  var today = curr_date


  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    if (userID !== undefined) {
      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
      setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])

  useEffect(()=>{
    console.log(warehouseChosenId)
    console.log(warehouseChosen)
})

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  const getProductInfo = (product_id) => {
    var tempProd = {}
    stockcardCollection.map((prod)=>{
      if(prod.id == product_id){
        tempProd = prod
      }
    })
    return tempProd
  }

  useEffect(() => {
    //read purchase_record collection
    if (userID === undefined) {
      const collectionRef = collection(db, "warehouse")
      const q = query(collectionRef, where("user", "==", "DONOTDELETE"));
  
      const unsub = onSnapshot(q, (snapshot) =>
        setWarehouseCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const collectionRef = collection(db, "warehouse");
      const q = query(collectionRef, where("user", "==", userID));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setWarehouseCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
    
      return unsub;
    }
  }, [userID])
  
  useEffect(() => {
    if(warehouseCollection ===  undefined || warehouseCollection.length == 0)
    {

    }
    else
    {
      setWarehouseChosenId(warehouseCollection[0].id)
      setWarehouseChosen(warehouseCollection[0])
    }
  }, [warehouseCollection])

  const handleWarehouseChoiceChange = (value) => {
    setWarehouseChosenId(value)
    console.log(value)
    console.log(warehouseCollection.indexOf(value))
    warehouseCollection.map((warehouse, index) => {
      if (warehouse.id == value) {
        setWarehouseChosen(warehouseCollection[index])
      }
    })
  }

  const handleWarehouseChosenChange = () => {
    var temp_warehouse_cells = []
    warehouseChosen.cells.map((row) => {
      Object.keys(row).map((col) => {
        if(row[col].isStorage)
        {
          temp_warehouse_cells.push(row[col])
        }
      })
    })
    setWarehouseStorages(temp_warehouse_cells)
  }
  useEffect(() => {
    if(warehouseChosenId === undefined)
    {

    }
    else
    {
      handleWarehouseChosenChange()
    }
  },[warehouseChosenId])

  const generatePDF = () => {
    // create barcodes in DOM (as containers so it can be rendered)
    for(var i = 0; i < warehouseStorages.length; i++)
    {
      var element = warehouseStorages[i].id
      bwipjs.toCanvas(element, {
        bcid: 'qrcode',
        text: warehouseStorages[i].id,
        includetext: true,
        
    });
    }

    // create document
    var doc = new jsPDF()
    doc.setFontSize(10);
    doc.text(15, 15, "Listing all storages from " + warehouseChosen.wh_name);
    doc.autoTable({
      html: "#storage-table",
      theme: "grid",
      startY: 20,
      headStyles: {
        fillColor: "#fff",
        textColor: "#000",
        lineColor: "#000",
        lineWidth: 0.1
      },
      bodyStyles: {
        minCellHeight: 50,
        lineColor: "#000"
      },
      columnStyles: {
        0: {cellWidth: 25},
        1: {cellWidth: 20},
        2: {cellWidth: 35},
        3: {cellWidth: 60},
        4: {cellWidth: 45},
      },
      didDrawCell: function(data) {
      if (data.column.index === 4 && data.cell.section === 'body') {
        var td = data.cell.raw;
        var canvas = td.getElementsByClassName('qrcode')[0]
        var img = canvas.toDataURL("image/png");
        var dim = data.cell.height - data.cell.padding('vertical');
        var textPos = data.cell;
        doc.addImage(img, textPos.x + 3, textPos.y + 3, 35, 35);
      }
    }
  });
      // specify file name
      var filename = "qrcodes_" + moment(today).format('MMDDYY') + "_" + warehouseChosen.wh_name + ".pdf"
      // make doc downloadable
      doc.save(filename)
  }
  return (
    <div>
      <UserRouter
        route=''
      />
      <Navigation />
      <Tab.Container
        activeKey="main"
      >
        <div id="contents" className="row print-codes">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                  <h5><strong>Print</strong></h5>
                </Card.Header>
                <Card.Body>
                  <Nav className="user-management-tab mb-3 flex-column" defaultActiveKey="/profilemanagement">
                    <Nav.Item>
                      <Nav.Link as={Link} to="/printbarcodes">Barcodes</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/printqrcodes" active>QR Codes</Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
                <Tab.Pane eventKey='main'>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Print QR Codes</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                    <div className="row px-0 py-2 m-0">
                        <div className="col-2 d-flex align-items-center justify-content-center">
                          Choose Warehouse
                        </div>
                        <div className="col-10">
                          <select
                            className="form-control shadow-none"
                            value={warehouseChosenId}
                            onChange={(event)=>{handleWarehouseChoiceChange(event.target.value)}}
                          >
                            {warehouseCollection.map((warehouse) => {
                              return(
                                <option value={warehouse.id}>{warehouse.wh_name}</option>
                              )
                            })

                            }
                          </select>
                        </div>
                      </div>
                      <div id="generated-result" className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0 justify-content-center align-items-center">
                        <div className="col-11">
                          <h5 className="text-center">Listing all storages from {warehouseChosenId === undefined?"":warehouseChosenId.substring(0,4)}</h5>
                        </div>
                        <div className="col-1">
                          <Button
                            onClick={()=>{generatePDF()}}
                          >
                            <FontAwesomeIcon icon={faFileDownload}/>
                          </Button>
                        </div>
                      </div>
                      {warehouseStorages === undefined?
                        <div className="row p-5 m-0 justify-content-center align-items-center" style={{height: "300px"}}>
                          
                            <Spinner
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
                        </div>
                      :
                        <Table id="storage-table">
                          <thead>
                            <tr>
                              <td>Storage ID</td>
                              <td>Type</td>
                              <td>Remarks</td>
                              <td>Products Included</td>
                              <td>QR Code</td>
                            </tr>
                          </thead>
                          <tbody>
                              {warehouseStorages.length == 0?
                                <tr>
                                  <td colSpan={4}>
                                    <div className="row px-0 py-2 m-0 justify-content-center" style={{minHeight: "300px"}}>
                                      <div className="text-center">0 storages</div>
                                    </div>
                                  </td>
                                </tr>
                              :
                                <>
                                {warehouseStorages.map((storage, index)=>{
                                  return(
                                    <tr>
                                      <td>
                                        {storage.id.substring(0,9)}
                                        <br/>
                                        <i>{storage.alias}</i>
                                      </td>
                                      <td>{storage.type.charAt(0).toUpperCase() + storage.type.slice(1)}</td>
                                      <td>{storage.remarks}</td>
                                      <td>
                                        {storage.products.map((product, index)=> (
                                          <>
                                          <span className="row"
                                              key={product}
                                          >
                                            <div className="col-9">
                                              {getProductInfo(product).description}
                                            </div>
                                            <div className="col-3">
                                               [{getProductInfo(product).qty} units]
                                               {index != storage.products.length - 1 ? <span>, </span> : <></>}
                                            </div>
                                          </span>
                                          <br/>
                                          </>
                                        ))}
                                      </td>
                                      <td>
                                      <canvas className="qrcode" id={storage.id} style={{display: 'none'}}/>
                                        
                                         <QRCode
                                        value={storage.id}
                                        size={100}
                                      />
                                      </td>
                                    </tr>
                                  )
                                })}
                                </>
                              }
                            </tbody>
                            </Table>
                      }
                    </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default PrintQRCodes;