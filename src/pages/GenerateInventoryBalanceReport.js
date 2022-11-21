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
import '../assets/fonts/Helvetica-UTF-normal.js';

import { Tab, Table, Card, Button, Nav} from 'react-bootstrap';
import FormControl from "react-bootstrap/FormControl";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'loading-animations-react';

function GenerateInventoryBalanceReport() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);// user collection variable
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userProfile, setUserProfile] = useState({categories: []})// categories made by user

  const [stockcardCollection, setStockcardCollection] = useState(); // stockcard Collection
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]) // purchase record Collection
  const [salesRecordCollection, setSalesRecordCollection] = useState([]) // sales record Collection

  const [classification, setClassification] = useState("All")//classification filter
  const [category, setCategory] = useState("All")// category filter
  var curr_date = new Date(); // get current date
  curr_date.setDate(curr_date.getDate());
  var today = curr_date
  var today_filter = moment(curr_date).format('YYYY-MM-DD')
  const [filterDateEnd, setFilterDateEnd] = useState(today_filter);
  const [itemList, setItemList] = useState()// product list that satisfied filters

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

  // fetch purchase records collection
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

  // fetch sales records collection
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

  // initialize product list
  useEffect(() => {
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      setItemList(stockcardCollection.sort((item_1, item_2)=>{
        return item_1.description > item_2.description;
      }))
    }
  }, [stockcardCollection])

  // listen to filter changes
  useEffect(() => {
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      handleFilterChange()
    }
  }, [classification, filterDateEnd, category])
  
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

    setItemList(temp_item_list.sort((item_1, item_2)=>{
      return item_1.description > item_2.description;
    }))
  }

  // compute stock level according to date
  const computeStockLevel = (product_id, quantity) => {
    var to_subtract = 0
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
          if(record_date.getTime() > date_end.getTime())
          {
            purchase_record.product_list.map((product) => {
              if(product.itemId == product_id)
              {
                to_subtract = to_subtract + Number(product.itemQuantity)
              }
            })
          }
        }
      })
      if(quantity - to_subtract < 0)
      {
        return  0
      }
      else
      {
        return quantity - to_subtract
      }
    }
  }

  // compute total quantity and total cost
  const computeTotals = () => {
    var total_quantity = 0
    var total_cost = 0
    itemList.map((item) => {
      total_quantity = total_quantity + computeStockLevel(item.id, item.qty)
      total_cost = total_cost + (computeStockLevel(item.id, item.qty) * item.p_price)
    })

    return {totalQuantity: total_quantity, totalCost: total_cost}
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
    doc.setFontSize(8);
    var printDateString = "Generated: " + moment(today).format("MM-DD-YYYY @ hh:mm:ss A")
    doc.text(printDateString, pageWidth - 15, 40, {align: 'right'})
    doc.setFontSize(10);
    doc.text("Listing " + clsn + " products' stock level " + cgry_preword + cgry + cgry_postword + " as of " + moment(filterDateEnd).format("MMMM DD, YYYY"), 15, 30, {align: 'left'});
    doc.autoTable({
      html: "#isr-table",
      theme: "grid",
      startY: 45,
      margin: {left: 15},
      styles: {
        font: 'Helvetica-UTF'
      },
      headStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1,
        halign: "center"
      },
      bodyStyles: {
        minCellHeight: 10,
        lineColor: "#e0e0e0"
      },
      footStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1
      },
      columnStyles: {
        0: {cellWidth: 25},
        1: {cellWidth: 100},
        2: {cellWidth: 15},
        3: {
          cellWidth: 20,
          halign: "right"
        },
        4: {
          cellWidth: 20,
          halign: "right"
        },
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
      <Navigation 
        page="/reports"
      />
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
                      <Nav.Link as={Link} to="/generateisr">Item Summary Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generateibr" active>Inventory Balance Report</Nav.Link>
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
                      <h1 className='text-center pb-2 module-title'>Generate Inventory Balance Report</h1>
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
                          Date End
                        </div>
                        <div className="col-10 p-0 d-flex flex-row">
                          <div className="row w-100 m-0 p-0 d-flex align-items-center justify-content-start">
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
                              products' stock level
                              {category == "All"?<> in <strong>ALL</strong> categories</>:<> in the <strong>{category.toUpperCase()}</strong> category </>} 
                            </div>
                            <div>
                              as of
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
                              <th>Qty</th>
                              <th>Purchase Price</th>
                              <th>Cost</th>
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
                                      <td className="text-center">{computeStockLevel(item.id, item.qty)}</td>
                                      <td className="text-end">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>&#8369;</div>
                                          <div>
                                            {(Math.round(item.p_price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-end">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>&#8369;</div>
                                          <div>
                                            {(Math.round((computeStockLevel(item.id, item.qty) * item.p_price) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </>
                              }
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="text-center">{computeTotals().totalQuantity}</td>
                              <td className="text-end"></td>
                              <td className="text-end">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>&#8369;</div>
                                  <div>
                                    {(Math.round((computeTotals().totalCost * 100)) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </div>
                                </div>
                              </td>
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

export default GenerateInventoryBalanceReport;