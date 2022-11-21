import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext';
import UserRouter from '../pages/UserRouter';
import Navigation from '../layout/Navigation';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas';
import moment from "moment";


import { Tab, Table, Card, Button, Nav} from 'react-bootstrap';
import FormControl from "react-bootstrap/FormControl";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'loading-animations-react';

function GenerateItemSummaryReport() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);// user collection variable
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userProfile, setUserProfile] = useState({categories: []})// user's profile

  const [stockcardCollection, setStockcardCollection] = useState(); // stockcard Collection
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([])
  const [salesRecordCollection, setSalesRecordCollection] = useState([])

  const [classification, setClassification] = useState("All")//classification filter
  const [category, setCategory] = useState("All")// category filter
  const [filterDateEnd, setFilterDateEnd] = useState(today_filter); // end date filter
  const [filterDateStart, setFilterDateStart] = useState("2001-01-01"); // start date filter
  const [itemList, setItemList] = useState()// product list that satisfied filters

  var curr_date = new Date(); // get current date
  curr_date.setDate(curr_date.getDate());
  var today = curr_date
  var today_filter = moment(curr_date).format('YYYY-MM-DD')

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

  useEffect(() => {
    if (userID !== undefined) {
      const collectionRef = collection(db, "purchase_record")
      const q = query(collectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
          setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])

  useEffect(() => {
    if (userID !== undefined) {
      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
          setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
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
  }, [classification, category])

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

  // compute per product total in
  const computeTotalIn = (product_id) => {
    var count = 0
    var date_start = new Date(filterDateStart)
    var date_end = new Date(filterDateEnd)
    var record_date
    if(purchaseRecordCollection === undefined || purchaseRecordCollection.length == 0)
    {
      return 0
    }
    else
    {
      purchaseRecordCollection.map((purchase_record)=>{
        if(!purchase_record.isVoided)
        {
          record_date = new Date(purchase_record.transaction_date)
          if(record_date.getTime() >= date_start.getTime() && record_date.getTime() <= date_end.getTime())
          {
            purchase_record.product_list.map((product) => {
              if(product.itemId == product_id)
              {
                count = count + Number(product.itemQuantity)
              }
            })
          }
        }
      })
      return count
    }
  }

  // compute per product total out
  const computeTotalOut = (product_id) => {
    var count = 0
    var min = 0
    var max = 0
    var date_start = new Date(filterDateStart)
    var date_end = new Date(filterDateEnd)
    var record_date
    if(salesRecordCollection === undefined || salesRecordCollection.length == 0)
    {
      return 0
    }
    else
    {
      salesRecordCollection.map((sales_record)=>{
        record_date = new Date(sales_record.transaction_date)
        if(!sales_record.isVoided)
        {
          if(record_date.getTime() >= date_start.getTime() && record_date.getTime() <= date_end.getTime())
          {
            sales_record.product_list.map((product) => {
              if(product.itemId == product_id)
              {
                count = count + Number(product.itemQuantity)
                if(product.itemQuantity > max)
                {
                  max = product.itemQuantity
                }
                if(product.itemQuantity < min)
                {
                  min = product.itemQuantity
                }
              }
            })
          }
        }
      })
      return {total: count, low: min, high: max}
    }
  }

  // compute per grand totals
  const computeTotals = () => {
    var total_quantity_in = 0
    var total_quantity_out = 0
    itemList.map((item) => {
      total_quantity_in = total_quantity_in + computeTotalIn(item.id)
      total_quantity_out = total_quantity_out + computeTotalOut(item.id).total
    })

    return {totalIn: total_quantity_in, totalOut: total_quantity_out}
  }

  // generate pdf of report
  const generatePDF = () => {
    // form table title
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
    doc.setFontSize(10);
    var printDateString = "Generated: " + moment(today).format("MM-DD-YYYY @ hh:mm:ss A")
    doc.text("Table 1. " + clsn + " products' stats " + cgry_preword + cgry + cgry_postword + " from " + moment(filterDateStart).format("MMMM DD, YYYY") + " to " + moment(filterDateEnd).format("MMMM DD, YYYY"), pageWidth/2, 40, {align: 'center'})
    doc.setFontSize(8);
    doc.text(printDateString, pageWidth - 15, 30, {align: 'right'});
    doc.autoTable({
      html: "#isr-table",
      theme: "grid",
      startY: 45,
      margin: {left: 15},
      headStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1
        
      },
      bodyStyles: {
        minCellHeight: 10,
        lineColor: "#e0e0e0"
      },
      columnStyles: {
        0: {cellWidth: 25},
        1: {cellWidth: 115},
        2: {cellWidth: 20},
        3: {cellWidth: 20},
      },
      footStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text("" + doc.internal.getNumberOfPages(), pageWidth/2, pageHeight - 10, {align: 'center'});
      }
    });
    // specify file name
    var filename = "item-summary-report_" + moment(today).format('MMDDYY') + "_" + classification.toLowerCase() + "-" + category.toLocaleLowerCase() + ".pdf"
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
        <div id="contents" className="row generate-reports">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                  <h5><strong>Generate</strong></h5>
                </Card.Header>
                <Card.Body>
                  <Nav className="user-management-tab mb-3 flex-column" defaultActiveKey="/profilemanagement">
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generateisr" active>Item Summary Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generateibr">Inventory Balance Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generatewcr">Warehouse Composition Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generateppr">Product Projections Report</Nav.Link>
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
                      <h1 className='text-center pb-2 module-title'>Generate Item Summary Report</h1>
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
                      <div className="row px-0 py-2 m-0">
                        <div className="col-2 d-flex align-items-center">
                              Date
                        </div>
                        <div className="col-10 p-0 d-flex flex-row">
                          <div className="row w-100 m-0 p-0 d-flex align-items-center justify-content-start">
                            <div className="col-5 d-flex align-items-center justify-content-center">
                                <input
                                  className="form-control shadow-none"
                                  type="date"
                                  required
                                  value={filterDateStart}
                                  onChange={(e) => { setFilterDateStart(e.target.value) }}
                                />
                            </div>
                            <div className="col-1 d-flex align-items-center justify-content-center">
                              -
                            </div>
                            <div className="col-5 d-flex align-items-center justify-content-center">
                                <input
                                  className="form-control shadow-none"
                                  type="date"
                                  max={moment(today).format("YYYY-MM-DD")}
                                  required
                                  value={filterDateEnd}
                                  onChange={(e) => { setFilterDateEnd(e.target.value) }}
                                />
                            </div>
                          </div>
                        </div>
                </div>
                    </div>
                    <div id="generated-result" className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0 justify-content-center align-items-center">
                        <div className="col-11">
                          <h5 className="text-center">
                            <div className="mb-2">
                              Listing 
                              <strong> {classification.toUpperCase()} </strong>
                              products' stats 
                              {category == "All"?<> in <strong>ALL</strong> categories</>:<> in the <strong>{category.toUpperCase()}</strong> category </>} 
                            </div>
                            <div>
                              from 
                              <strong> {moment(filterDateStart).format("MMMM DD, YYYY")} </strong>
                              to 
                              <strong> {moment(filterDateEnd).format("MMMM DD, YYYY")}</strong>.
                            </div>
                          </h5>
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
                        <Table id="isr-table" className="records-table light">
                          <thead>
                            <tr>
                              <th>Item Code</th>
                              <th>Description</th>
                              <th>Total Qty In</th>
                              <th>Total Qty Out</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemList.length == 0?
                              <tr>
                                <td colSpan={5}>
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
                                      <td className="text-center">{computeTotalIn(item.id)}</td>
                                      <td className="text-center">{computeTotalOut(item.id).total}</td>
                                    </tr>
                                  )
                                })}
                              </>
                              }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="text-center">{computeTotals().totalIn}</td>
                              <td className="text-center">{computeTotals().totalOut}</td>
                            </tr>
                          </tfoot>
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

export default GenerateItemSummaryReport;