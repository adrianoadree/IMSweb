import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewPurchaseModal from "../components/NewPurchaseModal";
import moment from "moment";




function Records({ isAuth }) {

  //---------------------VARIABLES---------------------

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); //purchase_record Collection
  const [purchaseRecord, setPurchaseRecord] = useState([]); //purchase_record spec doc
  const [docId, setDocId] = useState("xx") // doc id variable
  const [list, setList] = useState([{}]); // array of purchase_record list


  //---------------------FUNCTIONS---------------------

  //read purchase_record collection
  useEffect(() => {
    const purchaseRecordCollectionRef = collection(db, "purchase_record")
    const q = query(purchaseRecordCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [])


  //fetch purchase_record spec Document
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "purchase_record", docId), (doc) => {
      setPurchaseRecord(doc.data());
    });
    return unsub;
  }, [docId])

  //fetch sold_product spec Document
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "purchase_record", docId), (doc) => {
      setList(doc.data().productList);
    });
    return unsub;
  }, [docId])

  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "purchase_record", id)
    await deleteDoc(purchaseRecDoc);
  }




  return (
    <div>
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row bg-light">
          <div className="col-3 p-5">
            <Card>
              <Card.Header
                className="bg-primary text-white"
              >
                <div className="row">
                  <div className="col-9 pt-2">
                    <h6>Transaction List</h6>
                  </div>
                  <div className="col-3">
                    <Button onClick={() => setModalShow(true)}><FontAwesomeIcon icon={faPlus} /></Button>
                    <NewPurchaseModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "550px" }}>
                <ListGroup variant="flush">
                  {purchaseRecordCollection.map((purchaseRecordCollection) => {
                    return (
                      <ListGroup.Item
                        action
                        key={purchaseRecordCollection.id}
                        eventKey={purchaseRecordCollection.id}
                        onClick={() => { setDocId(purchaseRecordCollection.id) }}>
                        <div className="row">
                          <div className="col-9">
                            <small><strong>Doc No: {purchaseRecordCollection.document_number}</strong></small><br />
                            <small>Doc No: </small><br />
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
              <Tab.Pane eventKey={0}>
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
                          <th className='px-3'>Item Name</th>
                          <th className='px-3'>Quantity</th>
                          <th className='px-3'>Price</th>
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
                      <div className="col-11">
                        <small> <FontAwesomeIcon icon={faFile} /> Document Number: <strong>{purchaseRecord.document_number }</strong></small><br />
                        <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: </small><br />
                        <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: <strong>{ purchaseRecord.document_note}</strong></small><br />
                      </div>
                      <div className="col-1">
                        <Button
                          size="lg"
                          variant="outline-danger"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      </div>

                    </div>


                    <span><br /></span>
                    <div style={{ height: "400px" }}>
                      <Table striped bordered hover size="sm">
                        <thead className='bg-primary'>
                          <tr>
                            <th className='px-3'>Item Name</th>
                            <th className='px-3'>Quantity</th>
                            <th className='px-3'>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((product) => (
                            <tr>
                              <td key={product.productName}>{product.productName} </td>
                              <td key={product.productQuantity}>{product.productQuantity}</td>
                              <td></td>
                            </tr>
                          ))}
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