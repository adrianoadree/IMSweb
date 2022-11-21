import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext'
import UserRouter from '../pages/UserRouter'
import Navigation from '../layout/Navigation';


import moment from "moment";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas';
import bwipjs from 'bwip-js';
import QRCode from "react-qr-code";

import { Tab, Button, Card, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'loading-animations-react';



function PrintQRCodes() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userCollection, setUserCollection] = useState([]);// user collection variable
  const [userProfile, setUserProfile] = useState({categories: []})// categories made by user

  const [warehouseCollection, setWarehouseCollection] = useState([]); //warehouse Collection
  const [stockcardCollection, setStockcardCollection] = useState(); //stockcard Collection

  const [warehouseChosenId, setWarehouseChosenId] = useState()
  const [warehouseChosen, setWarehouseChosen] = useState({})
  const [warehouseStorages, setWarehouseStorages] = useState()

  var curr_date = new Date(); // get current date
  curr_date.setDate(curr_date.getDate());
  var today = curr_date

  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection
  useEffect(() => {
    if (userID === undefined) {
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const q = query(userCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }
  }, [userID])

  // fetch user-made categories
  useEffect(() => {
    userCollection.map((metadata) => {
        setUserProfile(metadata)
    });
  }, [userCollection])

  // read warehouse collection
  useEffect(() => {
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

  // read stockcard collection
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

  // set defaults
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

  // listen to change in warehouse chosen 
  useEffect(() => {
    if(warehouseChosenId === undefined)
    {

    }
    else
    {
      handleWarehouseChosenChange()
    }
  },[warehouseChosenId])

  // get id of chosen warehouse
  const handleWarehouseChoiceChange = (value) => {
    setWarehouseChosenId(value)
    warehouseCollection.map((warehouse, index) => {
      if (warehouse.id == value) {
        setWarehouseChosen(warehouseCollection[index])
      }
    })
  }

  // get list of storages from chosen warehouse
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

  // get product information of products inside the storage
  const getProductInfo = (product_id) => {
    var tempProd = {}
    stockcardCollection.map((prod)=>{
      if(prod.id == product_id){
        tempProd = prod
      }
    })
    return tempProd
  }

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
    var pageHeight =  doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    doc.setFont('Times-Bold', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text(userProfile.bname, pageWidth/2, 15, {align: 'center'})
    doc.setFontSize(10);
    doc.text(userProfile.baddress, pageWidth/2, 20, {align: 'center'})
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(8);
    var printDateString = "Generated: " + moment(today).format("MM-DD-YYYY @ hh:mm:ss A")
    doc.text(printDateString, pageWidth - 15, 30, {align: 'right'})
    doc.setFontSize(10);
    doc.text(15, 30, "Listing all storages from " + warehouseChosen.wh_name);
    doc.autoTable({
      html: "#storage-table",
      theme: "grid",
      startY: 20,
      startY: 35,
      margin: {left: 15},
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
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text("" + doc.internal.getNumberOfPages(), pageWidth/2, pageHeight - 10, {align: 'center'});
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
      <Navigation 
        page="/printqr"
      />
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
                        <div className="col-2 d-flex align-items-center justify-content-start">
                          Warehouse
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
                            className="edit"
                            onClick={()=>{generatePDF()}}
                            data-title="Download PDF version"
                            disabled={warehouseStorages === undefined || warehouseStorages.length == 0}
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