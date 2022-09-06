import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewPurchaseModal from "../components/NewPurchaseModal";
import moment from "moment";
import { UserAuth } from '../context/AuthContext'




function Records() {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [purchRecord, setPurchRecord] = useState([]);
  const [purchDoc, setPurchDoc] = useState([]);

  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])


  //read Functions

  //read sales_record collection
  useEffect(() => {

    if (userID === undefined) {

      const purchaseRecordCollectionRef = collection(db, "purchase_record")
      const q = query(purchaseRecordCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const purchaseRecordCollectionRef = collection(db, "purchase_record")
      const q = query(purchaseRecordCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }

  }, [userID])

  //read sales_record collection
  useEffect(() => {
    async function readPurchDoc() {
      const purchRecord = doc(db, "purchase_record", docId)
      const docSnap = await getDoc(purchRecord)
      if (docSnap.exists()) {
        setPurchDoc(docSnap.data());
      }
    }
    readPurchDoc();
  }, [docId])


  //-----------------------------------------------------------------------------
  



  useEffect(() => {
    //read list of product names in product list
    async function fetchPurchDoc() {
      const unsub = await onSnapshot(doc(db, "purchase_record", docId), (doc) => {
        setList(doc.data().product_list);
      });
      return unsub;
    }
    fetchPurchDoc()
  }, [docId])





  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "purchase_record", id)
    const purchaseListRecDoc = doc(db, "purchase_products", id)
    await deleteDoc(purchaseListRecDoc);
    await deleteDoc(purchaseRecDoc);
  }






  return (
    <div>
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey="main">
        <div className="row bg-light">
          <div className="col-3 p-5">
            <Card className="shadow">
              <Card.Header
                className="bg-primary text-white"
              >
                <div className="row">
                  <div className="col-9 pt-2">
                    <h6>Transaction List</h6>
                  </div>
                  <div className="col-3">
                    <Button
                      variant="outline-light"
                      onClick={() => setModalShow(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <NewPurchaseModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "550px" }} id='scrollbar'>
                <ListGroup
                  variant="flush"
                >
                  {purchaseRecordCollection.map((purch) => {
                    return (
                      <ListGroup.Item
                        action
                        key={purch.id}
                        eventKey={purch.id}
                        onClick={() => { setDocId(purch.id) }}>
                        <div className="row">
                          <div className="col-9">
                            <small><strong>Doc No: {purch.document_number}</strong></small><br />
                            <small>Date: {purch.document_date}</small><br />
                          </div>
                          <div className="col-3">

                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>

              </Card.Body>
            </Card>

          </div>
          <div className="col-9 p-5">
            <Tab.Content>
              <Tab.Pane eventKey="main">
                <div>
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/records">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <span><br></br></span>
                  <div className="row px-5 py-3 bg-white shadow">
                    <div className="row pt-4 px-2 bg-white">
                      <small> <FontAwesomeIcon icon={faFile} /> Document Number: </small>
                      <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: </small>
                      <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: </small>
                    </div>

                    <span><br /></span>
                    <Table striped bordered hover size="sm">
                      <thead className='bg-primary'>
                        <tr>
                          <th className='px-3'>Item Code</th>
                          <th className="text-center">Quantity</th>
                          <th className='text-center'>Description</th>
                          <th className='text-center'>Purchase Price</th>
                          <th className='text-center'>Extension</th>
                        </tr>
                      </thead>
                      <tbody style={{ height: "300px" }}>

                      </tbody>
                    </Table>


                  </div>


                </div>
              </Tab.Pane>

              <Tab.Pane eventKey={docId}>
                <div>
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/records">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <span><br></br></span>

                  <div className="row px-5 py-3 bg-white shadow">
                    <div className="row pt-4 px-2 bg-white">
                      <div className="col-9">
                        <small> <FontAwesomeIcon icon={faFile} /> Document Number: <strong></strong></small><br />
                        <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: <strong></strong></small><br />
                        <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: <strong></strong></small><br />
                      </div>
                      <div className="col-3">
                        <Button
                          size="md"
                          variant="outline-danger"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          Delete Record <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      </div>

                    </div>


                    <span><br /></span>
                    <div style={{ height: "400px" }}>
                      <Table striped bordered hover size="sm">
                        <thead className='bg-primary'>
                          <tr>
                            <th className='px-3'>Item Code</th>
                            <th className="text-center">Quantity</th>
                            <th className='text-center'>Description</th>
                            <th className='text-center'>Purchase Price</th>
                            <th className='text-center'>Extension</th>
                          </tr>
                        </thead>
                        <tbody>

                          {list.map((prod, index) => (

                            <tr key={index}>
                              <td className='px-3'>
                                {prod.productId}
                              </td>

                              <td className="text-center">
                              </td>

                              <td className="text-center">
                              </td>

                              <td className="text-center" >
                                <FontAwesomeIcon icon={faPesoSign} />
                              </td>

                              <td className="text-center" >
                                <FontAwesomeIcon icon={faPesoSign} />
                                {
                                }
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


      </Tab.Container>

    </div >

  );


}

export default Records;