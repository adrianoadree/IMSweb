import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext';
import UserRouter from '../pages/UserRouter';
import Tips from '../components/Tips';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas';
import Barcode from 'react-jsbarcode'
import moment from "moment";


import { Tab, Table, Card, Button, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'loading-animations-react';

function PrintBarcodes() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);// user collection variable
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userProfile, setUserProfile] = useState({categories: []})// categories made by user
  const [stockcardCollection, setStockcardCollection] = useState(); // stockcard Collection
  const [classification, setClassification] = useState("All")//classification filter
  const [category, setCategory] = useState("All")// category filter
  const [itemList, setItemList] = useState()// product list that satisfied filters
  const JsBarcode = require('jsbarcode');
  var curr_date = new Date(); // get current date
  curr_date.setDate(curr_date.getDate());
  var today = curr_date

  // get user id
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

  // fetch stockcard collection
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

  // initializr product list
  useEffect(() => {
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      setItemList(stockcardCollection)
    }
  }, [stockcardCollection])

  // filter change listeners
  useEffect(() => {
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      handleFilterChange()
    }
  }, [category])

  useEffect(() => {
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      handleFilterChange()
    }
  }, [classification])

  
  // update item list according to filter
  const handleFilterChange = () => {
    var temp_item_list = []
    if(classification == "All" && category != "All")
    {
      stockcardCollection.map((product) => {
        if(product.category == category)
        {
          temp_item_list.push(product)
        }
      })
    }
    else if(classification != "All" && category == "All")
    {
      stockcardCollection.map((product) => {
        if(product.classification == classification)
        {
          temp_item_list.push(product)
        }
      })
    }
    else if(classification != "All" && category != "All")
    {
      stockcardCollection.map((product) => {
        if(product.category == category && product.classification == classification)
        {
          temp_item_list.push(product)
        }
      })
    }
    else
    {
      temp_item_list = stockcardCollection
    }

    setItemList(temp_item_list)
  }

  // generate pdf of barcodes
  const generatePDF = () => {
    // create barcodes in DOM (as containers so it can be rendered)
    for(var i = 0; i < itemList.length; i++)
    {
      var element = "#" + itemList[i].id.substring(0,9)
      JsBarcode(element, itemList[i].barcode)
    }
    // form table title
    var element = document.getElementById('generated-result');
    var clsn = classification.toUpperCase()
    var cgry= category.toUpperCase()
    var cgry_preword = ""
    var cgry_postword = ""
    if(category == "All")
    {
      cgry_preword = "in "
      cgry_postword = " categories"
    }
    else
    {
      cgry_preword = "in the "
      cgry_postword = " category"
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
    doc.text("Listing " + clsn + " products " + cgry_preword + cgry + cgry_postword, 15, 30, {align: 'left'});
    doc.autoTable({
      html: "#product-table",
      theme: "grid",
      startY: 35,
      margin: {left: 15},
      headStyles: {
        fillColor: "#fff",
        textColor: "#000",
        lineColor: "#000",
        lineWidth: 0.1
      },
      bodyStyles: {
        minCellHeight: 30,
        lineColor: "#000"
      },
      columnStyles: {
        0: {cellWidth: 25},
        1: {cellWidth: 105},
        2: {cellWidth: 10},
        3: {cellWidth: 40},
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text("" + doc.internal.getNumberOfPages(), pageWidth/2, pageHeight - 10, {align: 'center'});
        
      },
      didDrawCell: function(data) {
        if (data.column.index === 3 && data.cell.section === 'body') {
          var td = data.cell.raw;
          var img = td.getElementsByClassName('barcode')[0]
          var dim = data.cell.height - data.cell.padding('vertical');
          var textPos = data.cell;
          doc.addImage(img.src, textPos.x + 2, textPos.y + 1, 35, 20);
      }
      }
    });
    // specify file name
    var filename = "barcodes_" + moment(today).format('MMDDYY') + "_" + classification.toLowerCase() + "-" + category.toLocaleLowerCase() + ".pdf"
    // make doc downloadable
    doc.save(filename)
  }
  return (
    <div>
      <UserRouter
        route=''
      />
      <Tips 
        page="/printbar"
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
                      <Nav.Link as={Link} to="/printbarcodes" active>Barcodes</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/printqrcodes">QR Codes</Nav.Link>
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
                      <h1 className='text-center pb-2 module-title'>Print Barcodes</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0">
                        <div className="col-2 d-flex align-items-center">
                          Classification
                        </div>
                        <div className="col-10">
                          <select
                            className="form-control shadow-none"
                            value={classification}
                            onChange={(event)=>{setClassification(event.target.value)}}
                          >
                            <option value="All">All</option>
                            <option value="Imported">Imported</option>
                            <option value="Manufactured">Manufactured</option>
                            <option value="Non-trading">Non-trading</option>
                          </select>
                        </div>
                      </div>
                      <div className="row px-0 py-2 m-0">
                        <div className="col-2 d-flex align-items-center">
                          Category
                        </div>
                        <div className="col-10">
                          <select
                            className="form-control shadow-none"
                            value={category}
                            onChange={(event)=>{setCategory(event.target.value)}}
                          >
                            <option value="All">All</option>
                            {userProfile.categories.map((category)=>{
                              return(
                                <option
                                  key={category}
                                  value={category}
                                >
                                  {category}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div id="generated-result" className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0 justify-content-center align-items-center">
                        <div className="col-11">
                          <h5 className="text-center">Listing <strong>{classification.toUpperCase()}</strong> products {category == "All"?<>in <strong>ALL</strong> categories</>:<>in the <strong>{category.toUpperCase()}</strong> category.</>}</h5>
                        </div>
                        <div className="col-1">
                        
                          <Button
                            className="edit"
                            onClick={()=>{generatePDF()}}
                            data-title="Download PDF version"
                            disabled={itemList === undefined || itemList.length == 0}
                          >
                            <FontAwesomeIcon icon={faFileDownload}/>
                          </Button>
                        </div>
                      </div>
                      {itemList === undefined?
                        <div className="row p-5 m-0 justify-content-center align-items-center" style={{height: "300px"}}>
                          <Spinner
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
                        </div>
                      :
                        <Table id="product-table">
                          <thead>
                            <tr>
                              <td>Item Code</td>
                              <td>Description</td>
                              <td>Qty</td>
                              <td>Barcode</td>
                            </tr>
                          </thead>
                          <tbody>
                            {itemList.length == 0?
                              <tr>
                                <td colSpan={4}>
                                  <div className="row px-0 py-2 m-0 justify-content-center" style={{minHeight: "300px"}}>
                                    <div className="text-center">0 products</div>
                                  </div>
                                </td>
                              </tr>
                            :
                              <>
                                {itemList.map((item, index)=>{
                                  return(
                                    <tr>
                                      <td>{item.id.substring(0,9)}</td>
                                      <td>{item.description}</td>
                                      <td>{item.qty}</td>
                                      <td>
                                        <img className="barcode" id={item.id.substring(0,9)} value={item.barcode} style={{display: 'none'}}/>
                                        <Barcode
                                          format={"EAN13"}
                                          value={item.barcode}
                                          color="#000"
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
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default PrintBarcodes;