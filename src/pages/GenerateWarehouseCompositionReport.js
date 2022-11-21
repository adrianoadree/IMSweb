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
import { PieChart } from 'react-minimal-pie-chart';

function GenerateWarehouseCompositionReport() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);// user collection variable
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userProfile, setUserProfile] = useState({categories: []})// categories made by user

  const [stockcardCollection, setStockcardCollection] = useState(); // stockcard Collection 
  
  const COLORS = ['#B0EEC1', '#B5E3FF', '#FEFFBF', '#FFDEBC'];
  const COLORS2 = ['#FFCFB7', '#FFF5D8', '#439DB2', '#4193AD'];
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

  // get data list by classification
  const getClassificationData = () => {
    var data = 
    [
      {name: 'Imported', value: 0, color: COLORS[0], key: 'Imported', title: 'Imported'}, 
      {name: 'Manufactured', value: 0, color: COLORS[1], key: 'Manufactured', title: 'Manufactured'}, 
      {name: 'Non-trading', value: 0, color: COLORS[3], key: 'Non-trading', title: 'Non-trading'}
    ]

    for(var i = 0; i < data.length; i++)
    {
      if(stockcardCollection === undefined)
      {

      }
      else
      {
        stockcardCollection.map((product) =>{ 
          if(product.classification == data[i].name)
          {
            data[i].value++
          }
        })
      }
    }

    return data
  }

  // get data list by category
  const getCategoryData = () => {
    var categories = userProfile.categories
    var category_data = []
    var temp_obj = {name: "", value: 0, title: "", key: "", color: ""}
    for(var i = 0; i < categories.length; i++)
    {
      temp_obj = {name: categories[i], value: 0, title: categories[i], key: categories[i], color: COLORS2[i]}
      if(stockcardCollection === undefined)
      {
  
      }
      else
      {
        stockcardCollection.map((product) =>{ 
          if(product.category == temp_obj.name)
          {
            temp_obj.value++
          }
        })
      }
      category_data.push(temp_obj)
    }
    return category_data
  }

  // remove item from data list if value is 0
  const removeEmptyDataValue = (data_array) => {
    var temp_data = []
    data_array.map((data_entry) => {
      if(data_entry.value > 0)
      {
        temp_data.push(data_entry)
      }
    })
    return temp_data
  }

  // get total of all values in data list
  const getTotalDataValue = (data_array, type) => {
    var temp_total = 0
  
    data_array.map((data_entry) => {
      temp_total = temp_total + data_entry.value
    })
  
    return temp_total
  }

  // append percentage to pie chart
  const appendPercentageToPieChart = (data, type) => {

    var chart = document.getElementsByClassName(type + "-piechart")[0];
    var total = getTotalDataValue(data)
    if (
      typeof chart === 'object' &&
      !Array.isArray(chart) &&
      chart !== null
    )
    {
      var childrenList = chart.childNodes;
      
      for(var j = 0; j < data.length; j++)
      {
        for(var i = 0; i < childrenList.length; i++)
        {
          if(childrenList[i].textContent == data[j].name)
          {
            childrenList[i].textContent = ""
            var tspanName = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspanName.textContent = data[j].name;
            tspanName.setAttribute("id", data[j].name);
            tspanName.setAttribute("text-anchor","middle");
      
            var tspanPercentage = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspanPercentage.textContent = ((data[j].value/total)*100).toFixed(2) + "%";
            tspanPercentage.setAttribute("id", (data[j].value/total)*100 + "%");
            tspanPercentage.setAttribute("dy","5");
            tspanPercentage.setAttribute("style","font-size: 6px");
            childrenList[i].appendChild(tspanName);
            childrenList[i].appendChild(tspanPercentage);
          }
        }
      }
    }
  }

  // generate pdf of report
  const generatePDF = () => {
    // create canvas of charts in DOM
    html2canvas(document.querySelector("#classification-chart")).then(classification_piechart => {
      classification_piechart.setAttribute("id", "classification-chart-canvas")
      classification_piechart.setAttribute("style", "display: none;")
      document.getElementById("classification-chart").appendChild(classification_piechart)
    });

    html2canvas(document.querySelector("#category-chart")).then(category_piechart => {
      category_piechart.setAttribute("id", "category-chart-canvas")
      category_piechart.setAttribute("style", "display: none;")
      document.getElementById("category-chart").appendChild(category_piechart)
    });
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
    doc.text(15, 30, "Warehouse Composition Report",);

    var classification_piechart_canvas = document.getElementById("classification-chart-canvas")
    var classification_piechart = classification_piechart_canvas.toDataURL("image/png");
    doc.addImage(classification_piechart, "PNG", (pageWidth - 130) / 2, 35, 130, 130)

    doc.setFontSize(10);
    doc.text("Figure 1.1 Warehouse Composition by Classification", pageWidth/2, 170, {align: 'center'});

    doc.autoTable({
      html: "#classification-table",
      theme: "grid",
      startY: 180,
      margin: {left: (pageWidth - 125) / 2, right: (pageWidth - 125) / 2},
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
      footStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1
      },
      columnStyles: {
        0: {cellWidth: 85},
        1: {cellWidth: 40},
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text("" + doc.internal.getNumberOfPages(), pageWidth/2, pageHeight - 10, {align: 'center'});

      }
    });

    doc.addPage()
    
    var category_piechart_canvas = document.getElementById("category-chart-canvas")
    var category_piechart = category_piechart_canvas.toDataURL("image/png");
    doc.addImage(category_piechart, "PNG", (pageWidth - 130) / 2, 15, 130, 130)

    doc.setFontSize(10);
    doc.text("Figure 1.2 Warehouse Composition by Category", pageWidth/2, 150, {align: 'center'});

    doc.autoTable({
      html: "#category-table",
      theme: "grid",
      startY: 160,
      margin: {left: (pageWidth - 125) / 2, right: (pageWidth - 125) / 2},
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
      footStyles: {
        fillColor: "#b8dcff",
        textColor: "#000",
        lineColor: "#e0e0e0",
        lineWidth: 0.1
      },
      columnStyles: {
        0: {cellWidth: 85},
        1: {cellWidth: 40},
      },
      didDrawPage: function (data) {
        doc.setFontSize(8);
        doc.text("" + doc.internal.getNumberOfPages(), pageWidth/2, pageHeight - 10, {align: 'center'});

      }
    });
    // specify file name
    var filename = "warehouse-composition-report_" + moment(today).format('MMDDYY') + ".pdf"
    doc.save(filename)
    // make doc downloadable
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
                      <Nav.Link as={Link} to="/generateisr">Item Summary Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generateibr">Inventory Balance Report</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/generatewcr" active>Warehouse Composition Report</Nav.Link>
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
                  <div className='row py-1 m-0' id="report-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Generate Warehouse Composition Report</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0 justify-content-center align-items-center">
                        <div className="col-11">
                          <h5 className="text-center"></h5>
                        </div>
                        <div className="col-1">
                          <Button
                            onClick={()=>{generatePDF()}}
                          >
                            <FontAwesomeIcon icon={faFileDownload}/>
                          </Button>
                        </div>
                      </div>
                      <div className="row px-0 py-2 m-0">
                          <div className="col-7">
                            <div id="classification-chart" className="p-4">
                                <PieChart
                                  className="classification-piechart"
                                  animate
                                  animationDuration={500}
                                  animationEasing="ease-out"
                                  center={[50, 50]}
                                  lengthAngle={360}
                                  paddingAngle={0}
                                  radius={50}
                                  startAngle={0}
                                  viewBoxSize={[100, 100]}
                                  data={removeEmptyDataValue(getClassificationData())}
                                  label={(data) => data.dataEntry.title}
                                  labelPosition={65}
                                  labelStyle={{
                                    fontSize: "4px",
                                    fill: "#00000080",
                                    fontWeight: "600"
                                  }}
                                >
                                </PieChart>
                              {appendPercentageToPieChart(getClassificationData(), "classification")}
                            </div>
                          </div>
                          <div className="col-5">
                            <h3 className="pb-5">By Classification</h3>
                            <Table id="classification-table" className="records-table light">
                              <thead>
                                <tr>
                                  <th>Classification</th>
                                  <th>No. of Products</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getClassificationData().map((data_entry) => {
                                  return(
                                    <tr>
                                      <td>{data_entry.name}</td>
                                      <td>{data_entry.value}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td></td>
                                  <td>{getTotalDataValue(getClassificationData())}</td>
                                </tr>
                              </tfoot>
                            </Table>
                          </div>
                      </div>
                      <div className="row px-0 py-2 m-0">
                          <div className="col-7">
                            <div id="category-chart" className="p-4">
                              <PieChart
                                className="category-piechart"
                                animate
                                animationDuration={500}
                                animationEasing="ease-out"
                                center={[50, 50]}
                                lengthAngle={360}
                                paddingAngle={0}
                                radius={50}
                                startAngle={0}
                                viewBoxSize={[100, 100]}
                                data={removeEmptyDataValue(getCategoryData())}
                                label={(data) => data.dataEntry.title}
                                labelPosition={65}
                                labelStyle={{
                                  fontSize: "4px",
                                  fill: "#00000080",
                                  fontWeight: "600",
                                }}
                              >
                              </PieChart>
                              
                              {appendPercentageToPieChart(getCategoryData(), "category")}
                            </div>
                          </div>
                          <div className="col-5">
                            <h3 className="pb-5">By Category</h3>
                            <Table id="category-table" className="records-table light">
                              <thead>
                                <tr>
                                  <th>Category</th>
                                  <th>No. of Products</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getCategoryData().map((data_entry) => {
                                  return(
                                    <tr>
                                      <td>{data_entry.name}</td>
                                      <td>{data_entry.value}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td></td>
                                  <td>{getTotalDataValue(getCategoryData())}</td>
                                </tr>
                              </tfoot>
                            </Table>
                          </div>
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

export default GenerateWarehouseCompositionReport;