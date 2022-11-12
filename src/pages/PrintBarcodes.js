import RPersoneact from 'react';
import { Tab, Table, Card, Button, Modal, Form, Alert, Nav } from 'react-bootstrap';
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
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'
import Barcode from 'react-jsbarcode'
import toImg from 'react-svg-to-image';




function PrintBarcodes() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);// userCollection variable
  const userCollectionRef = collection(db, "user")// user collection
  const [categorySuggestions, setCategorySuggestions] = useState([])
  const [stockcardCollection, setStockcardCollection] = useState(); //supplier Collection
  const [classification, setClassification] = useState("All")
  const [category, setCategory] = useState("All")
  const [itemList, setItemList] = useState()
  const pdfRef = useRef(null);
  const tableRef = useRef(null);



  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

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

  useEffect(() => {
    userCollection.map((metadata) => {
        setCategorySuggestions(metadata.categories)
        
    });
  }, [userCollection])

  //Read stockcard collection from database
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
    if(stockcardCollection === undefined)
    {

    }
    else
    {
      setItemList(stockcardCollection)
    }
  }, [stockcardCollection])

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


  const generatePDF = () => {
    var element = document.getElementById('generated-result');
    /*html2canvas(element).then(function(canvas) {
      var imgData = canvas.toDataURL(
          'image/png');              
      var doc = new jsPDF('p', 'mm');
      doc.addImage(imgData, 'PNG', 10, 10);
      doc.save('sample-file.pdf');
    });
    const content = pdfRef.current;
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.html(content, {
            callback: function (doc) {
                doc.save('sample.pdf');
            },
            width: 1,
        windowWidth: 1
    });*/
    var doc = new jsPDF()
    doc.text(7, 15, "Overflow 'ellipsize' (default)");
  doc.autoTable({
    html: "#product-table",
    bodyStyles: {minCellHeight: 15},
    didDrawCell: function(data) {
    if (data.column.index === 3 && data.cell.section === 'body') {
       var td = data.cell.raw;
       var canvas = td.getElementsByTagName('svg')[0]
       console.log(canvas.outerHTML)
       var img = new Image()
       var serializer = new XMLSerializer()
       var svgStr = serializer.serializeToString(canvas);

        img.src = 'data:image/svg+xml;base64,'+window.btoa(svgStr);
       console.log(img.src)
       var dim = data.cell.height - data.cell.padding('vertical');
       var textPos = data.cell;
       doc.addImage('data:image/jpeg;base64,'+window.btoa(svgStr), textPos.x, textPos.y, dim, dim);
    }
  }
});
  doc.save('table.pdf')
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
                        <div className="col-2">
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
                        <div className="col-2">
                          Category
                        </div>
                        <div className="col-10">
                          <select
                            className="form-control shadow-none"
                            value={category}
                            onChange={(event)=>{setCategory(event.target.value)}}
                          >
                            <option value="All">All</option>
                            {categorySuggestions.map((category)=>{
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
                    <div  ref={pdfRef} id="generated-result" className="row py-1 m-0">
                      <div className="row px-0 py-2 m-0 justify-content-center">
                        <div className="text-center">Listing <strong>{classification.toUpperCase()}</strong> products {category == "All"?<>in <strong>ALL</strong> categories</>:<>in the <strong>{category.toUpperCase()}</strong> category.</>}</div>
                      </div>
                      {itemList === undefined?
                        <Spinner
                          color1="#b0e4ff"
                          color2="#fff"
                          textColor="rgba(0,0,0, 0.5)"
                          className="w-50 h-50"
                        />
                      :
                        <>
                          {itemList.length == 0?
                            <div className="row px-0 py-2 m-0 justify-content-center">
                              <div className="text-center">0 products</div>
                            </div>
                          :
                            <Table ref={tableRef} id="product-table">
                              <thead>
                                <tr>
                                  <td>Item Code</td>
                                  <td>Description</td>
                                  <td>Qty</td>
                                  <td>Barcode</td>
                                </tr>
                              </thead>
                              <tbody>
                              {itemList.map((item, index)=>{
                                return(
                                  <tr>
                                    <td>{item.id.substring(0,9)}</td>
                                    <td>{item.description}</td>
                                    <td>{item.qty}</td>
                                    <td>
                                      <Barcode
                                        id={'barcode-' + index}
                                        title={item.barcode}
                                        className='barcode'
                                        format="EAN13"
                                        value={item.barcode}
                                        color="#c6d4ea"
                                      />
                                    </td>
                                  </tr>
                                )
                              })}
                              </tbody>
                            </Table>
                          }
                        </>
                      }
                    </div>
                    <Button
                      onClick={()=>{generatePDF()}}
                    >
                      Generate PDF
                    </Button>
                    
                    <embed src="" width="800px" height="2100px" />
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