import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav, FormControl, Alert, InputGroup } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle } from 'react-ionicons'
import moment from "moment";
import NewSalesModal from "../components/NewSalesModal";
import { UserAuth } from '../context/AuthContext'
import UserRouter from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import ProductQuickView from '../components/ProductQuickView'




function SalesRecords({ isAuth }) {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [modalShowPQV, setModalShowPQV] = useState(false); //product quick view modal
  const [salesRecordCollection, setSalesRecordCollection] = useState(); //sales_record Collection
  const [salesRecordDoc, setSalesRecordDoc] = useState([]); //sales_record Collection
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);
  const [total, setTotal] = useState(0); //total amount
  const [productToView, setProductToView] = useState(["IT0000001"])


  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    if (salesRecordCollection === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
    }
  }, [salesRecordCollection])

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
      const q = query(collectionRef, where("user", "==", userID), orderBy("transaction_number", "desc"));

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
        if (doc.data() != undefined) {
          setList(doc.data().product_list);
        }
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



  // ===================================== START OF SEARCH FUNCTION =====================================


  const [searchValue, setSearchValue] = useState('');    // the value of the search field 
  const [searchResult, setSearchResult] = useState();    // the search result


  useEffect(() => {
    setSearchResult(salesRecordCollection)
  }, [salesRecordCollection])



  const filter = (e) => {
    const keyword = e.target.value;

    if (keyword !== '') {
      const results = salesRecordCollection.filter((salesRecordCollection) => {
        return salesRecordCollection.id.toLowerCase().startsWith(keyword.toLowerCase())
        // Use the toLowerCase() method to make it case-insensitive
      });
      setSearchResult(results);
    } else {
      setSearchResult(salesRecordCollection);
      // If the text field is empty, show all users
    }

    setSearchValue(keyword);
  };

  // ====================================== END OF SEARCH FUNCTION ======================================





  return (
    <div>
      <UserRouter
        route='/salesrecord'
      />
      <Navigation
        page='/sales'
      />
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
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon1">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="search"
                        value={searchValue}
                        onChange={filter}
                        className="input"
                        placeholder="Search by Doc ID"
                      />
                    </InputGroup>
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
                  <div id='scrollbar' style={{ height: '400px' }}>
                    {isFetched ?
                      (
                        salesRecordCollection.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>Record</span> to show.</strong></h5>
                            <p className="d-flex align-items-center justify-content-center">
                              <span>Click the</span>
                              <Button
                                className="add ms-1 me-1 static-button no-click"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                              <span>
                                button to add one.
                              </span>
                            </p>
                          </div>
                          :
                          <ListGroup variant="flush">
                            {searchResult && searchResult.length > 0 ? (
                              searchResult.map((sales) => (
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
                              ))
                            ) : (
                              <div className='mt-5 text-center'>
                                <Alert variant='danger'>
                                  No Search Result for
                                  <br /><strong>{searchValue}</strong>
                                </Alert>
                              </div>
                            )}

                          </ListGroup>
                      )
                      :
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                        <Spinner
                          color1="#b0e4ff"
                          color2="#fff"
                          textColor="rgba(0,0,0, 0.5)"
                          className="w-50 h-50"
                        />
                      </div>
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
                            <ProductQuickView
                              show={modalShowPQV}
                              onHide={() => setModalShowPQV(false)}
                              productid={productToView}
                            />
                            {list.map((sales, index) => (
                              <tr key={index}>
                                <td className='ic pt-entry px-3' key={sales.itemId}>
                                  {sales.itemId === undefined ?
                                    <></>
                                    :
                                    <>
                                      <button
                                        onClick={() => { setProductToView(sales.itemId); setModalShowPQV(true) }}
                                      >
                                        {sales.itemId.substring(0, 9)}
                                      </button>
                                    </>
                                  }
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
