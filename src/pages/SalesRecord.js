import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav, FormControl, Alert } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle } from 'react-ionicons'
import moment from "moment";
import NewSalesModal from "../components/NewSalesModal";
import { UserAuth } from '../context/AuthContext'
import  UserRouter  from '../pages/UserRouter'




function SalesRecords({ isAuth }) {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [salesRecordCollection, setSalesRecordCollection] = useState([]); //sales_record Collection
  const [salesRecordDoc, setSalesRecordDoc] = useState([]); //sales_record Collection
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);
  const [total, setTotal] = useState(0); //total amount


  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])


  useEffect(() => {
    //read sales_record collection
    if (userID === undefined) {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }

  }, [userID])

  useEffect(() => {
    //fetch purchase_record spec Document
    async function readSalesDoc() {
      const salesRecord = doc(db, "sales_record", docId)
      const docSnap = await getDoc(salesRecord)
      if (docSnap.exists()) {
        setSalesRecordDoc(docSnap.data());
      }
    }
    readSalesDoc();

  }, [docId])


  useEffect(() => {
    //read list of product names in product list
    async function fetchPurchDoc() {
      const unsub = await onSnapshot(doc(db, "sales_record", docId), (doc) => {
        setList(doc.data().product_list);
      });
      return unsub;
    }
    fetchPurchDoc()
  }, [docId])





  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "sales_record", id)
    const purchaseListRecDoc = doc(db, "sales_products", id)
    await deleteDoc(purchaseListRecDoc);
    await deleteDoc(purchaseRecDoc);
    setKey('main')
  }






  return (
    <div>
      <UserRouter
      route='/salesrecord'
      />
      <Navigation />
      <Tab.Container
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <div className="row contents">
          <div className="row py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <div className="col-1">
                      <Button className="fc-search left-full-curve no-click me-0"
                        onClick={() => setModalShow(true)}>
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    <div className="col-11">
                      <FormControl
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        className="fc-search right-full-curve mw-0"
                      />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-4 left-curve">
                      Doc
                    </div>
                    <div className="col-8 right-curve">
                      Date
                    </div>
                  </div>
                  <div className='scrollbar' style={{ height: '400px' }}>
                    {salesRecordCollection.length === 0 ?
                      <div className='py-4 px-2'>
                        <Alert variant="secondary" className='text-center'>
                          <p>
                            <strong>No Recorded Sales Transaction</strong>
                          </p>
                        </Alert>
                      </div>
                      :
                      <ListGroup variant="flush">
                        {salesRecordCollection.map((sales) => {
                          return (
                            <ListGroup.Item
                              action
                              key={sales.id}
                              eventKey={sales.id}
                              onClick={() => { setDocId(sales.id) }}>
                              <div className="row gx-0 sidebar-contents">
                                <div className="col-4">
                                  <small>{sales.transaction_number}</small>
                                </div>
                                <div className="col-8">
                                  <small>{moment(sales.transaction_date).format('ll')}</small>
                                </div>
                              </div>
                            </ListGroup.Item>
                          )
                        })}
                      </ListGroup>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className="data-contents">
              <Tab.Content>
                <Tab.Pane eventKey="main">
                  <div className="">
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/salesrecord">
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                      </Nav.Item>

                    </Nav>
                    <div className="row m-0">
                      <div className="row py-1 m-0">
                        <div className="col">
                          <span>
                            <InformationCircle
                              className="me-2 pull-down"
                              color={'#0d6efd'}
                              title={'Category'}
                              height="40px"
                              width="40px"
                            />
                          </span>
                          <h4 className="data-id">Document ID</h4>
                        </div>
                        <div className="col">
                          <div className="float-end">
                            <Button
                              className="add me-1"
                              data-title="Add New Purchase Record"
                              onClick={() => setModalShow(true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <Button
                              disabled
                              className="delete me-1"
                              data-title="Delete Purchase Record"
                              onClick={() => { deleteSalesRecord(docId) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="row p-1 data-specs m-0" id="record-info">
                        <div className="mb-3">
                          <div className="row m-0 mt-2">
                            <div className="col-12">
                              <span className="data-icon lg">
                                <Calendar
                                  className="me-2 pull-down"
                                  color={'#00000'}
                                  title={'Category'}
                                  height="25px"
                                  width="25px"
                                />
                              </span>
                              <span className="data-label lg">
                                Document Date
                              </span>
                            </div>
                          </div>
                          <div className="row m-0 mt-2">
                            <div className="col-12">
                              <span className="data-icon lg">
                                <Create
                                  className="me-2 pull-down"
                                  color={'#00000'}
                                  title={'Category'}
                                  height="25px"
                                  width="25px"
                                />
                              </span>
                              <span className="data-label lg">
                                Document Note
                              </span>
                            </div>
                          </div>
                        </div>
                        <Table striped bordered hover size="sm" className="records-table">
                          <thead>
                            <tr>
                              <th className='ic pth px-3'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Selling Price</th>
                              <th className='ext pth text-center'>Extension</th>
                            </tr>
                          </thead>
                          <tbody>

                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={docId}>
                  <div>
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                      </Nav.Item>

                    </Nav>
                    <div className="row m-0">
                      <div className="row py-1 m-0">
                        <div className="col">
                          <span>
                            <InformationCircle
                              className="me-2 pull-down"
                              color={'#0d6efd'}
                              title={'Category'}
                              height="40px"
                              width="40px"
                            />
                          </span>
                          <h4 className="data-id">{salesRecordDoc.transaction_number}</h4>
                        </div>
                        <div className="col">
                          <div className="float-end">
                            <NewSalesModal
                              show={modalShow}
                              onHide={() => setModalShow(false)}
                            />
                            <Button
                              className="add me-1"
                              data-title="Add New Sales Record"
                              onClick={() => setModalShow(true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <Button
                              className="delete me-1"
                              data-title="Delete Sales Record"
                              onClick={() => { deleteSalesRecord(docId) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="row p-1 m-0 data-specs" id="record-info">
                        <div className="mb-3">
                          <div className="row m-0 mt-2">
                            <div className="col-12">
                              <span className="data-icon lg">
                                <Calendar
                                  className="me-2 pull-down"
                                  color={'#00000'}
                                  title={'Category'}
                                  height="25px"
                                  width="25px"
                                />
                              </span>
                              <span className="data-label lg">
                                {moment(salesRecordDoc.transaction_date).format('LL')}
                              </span>
                            </div>
                          </div>
                          <div className="row m-0 mt-2">
                            <div className="col-12">
                              <span className="data-icon lg">
                                <Create
                                  className="me-2 pull-down"
                                  color={'#00000'}
                                  title={'Category'}
                                  height="25px"
                                  width="25px"
                                />
                              </span>
                              <span className="data-label lg">
                                {salesRecordDoc.transaction_note}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Table striped bordered hover size="sm" className="records-table">
                          <thead>
                            <tr>
                              <th className='ic pth px-3'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Selling Price</th>
                              <th className='ext pth text-center'>Extension</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((sales, index) => (
                              <tr key={index}>
                                <td className='ic pt-entry px-3' key={sales.itemId}>
                                  {sales.itemId}
                                </td>
                                <td className="qc pt-entry text-center" key={sales.itemQuantity}>
                                  {sales.itemQuantity}
                                </td>
                                <td className="dc pt-entry text-center" key={sales.itemName}>
                                  {sales.itemName}
                                </td>
                                <td className="pp pt-entry text-center" >
                                  <FontAwesomeIcon icon={faPesoSign} />
                                  {sales.itemSPrice}
                                </td>
                                <td className="ext pt-entry text-center" >
                                  <FontAwesomeIcon icon={faPesoSign} />
                                  {sales.itemSPrice * sales.itemQuantity}
                                </td>
                              </tr>
                            ))
                            }
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div >
  );
}

export default SalesRecords;
