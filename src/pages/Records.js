import React from "react";
import { Card, Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Navigation from "../layout/Navigation";
import { Table, Button, Tab } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faNoteSticky, faXmark, faUser, faPesetaSign } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import ListGroup from 'react-bootstrap/ListGroup';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import NewPurchaseModal from "../components/NewPurchaseModal";
import { useNavigate } from 'react-router-dom';


function Records({isAuth}) {


  const [modalShow, setModalShow] = React.useState(false);

  const [purchaseRecord, setPurchaseRecord] = useState([]);
  const purchaseRecordCollectionRef = collection(db, "purchase_record")
  const [setsupplierRecord] = useState([]);
  const supplierRecordCollectionRef = collection(db, "supplier")

  const [purchId, setPurchId] = useState("xxx")
  const docRef = doc(db, "purchase_record", purchId)


  const [purchDocNumber, setPurchDocNumber] = useState(0);
  const [purchNote, setPurchNote] = useState("");
  const [purchProduct, setPurchProduct] = useState("");
  const [purchQuantity, setPurchQuantity] = useState(0);
  let navigate = useNavigate();


  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

  //access document from a collection
  onSnapshot(docRef, (doc) => {

    setPurchDocNumber(doc.data().document_number)
    setPurchNote(doc.data().document_note)
    setPurchProduct(doc.data().product_name)
    setPurchQuantity(doc.data().product_quantity)

  }, [])



  //read supplierCollection
  useEffect(() => {
    const getSupplier = async () => {
      const data = await getDocs(supplierRecordCollectionRef);
      setsupplierRecord(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getSupplier()
  }, [])

  //read Purchaserecord collection from Firebase
  useEffect(() => {
    const getPurchaseRecord = async () => {
      const data = await getDocs(purchaseRecordCollectionRef);
      setPurchaseRecord(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

    };
    getPurchaseRecord()
  }, [])

  //Delete Data from firebase
  const deleteTransaction = async (id) => {
    const transcationDoc = doc(db, "purchase_record", id)
    await deleteDoc(transcationDoc);
    alert('Record DELETED from the Database')
  }


  return (
    <div>


      <Navigation />

      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row bg-light">
          <div className='col-3 p-5'>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white">
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
              <Card.Body className="">
                <ListGroup variant="flush">
                  {purchaseRecord.map((purchaseRecord) => {
                    return (
                      <ListGroup.Item
                        action
                        eventKey={purchaseRecord.id}
                        onClick={() => { setPurchId(purchaseRecord.id) }}>
                        <div className="row">
                          <div className="col-9">
                            <small><strong>{purchaseRecord.supplier_name}</strong></small><br />
                            <small>Doc No: {purchaseRecord.document_number}</small><br />
                            <small>Date</small>

                          </div>

                          <div className="col-3">
                            <Button
                              className="text-dark"
                              variant="outline-light"
                              onClick={() => { deleteTransaction(purchaseRecord.id) }}
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </Button>{' '}
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card.Body>
            </Card>



          </div>



          <div className='col-9 p-5'>
            <Tab.Content>
              <Tab.Pane eventKey={purchId}>
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
                      <small> <FontAwesomeIcon icon={faUser} /> Supplier Name: </small>
                      <small> <FontAwesomeIcon icon={faCalendarDays} /> Date: </small>
                      <small> <FontAwesomeIcon icon={faNoteSticky} /> Note:{purchNote} </small>
                      <small> <FontAwesomeIcon icon={faPesetaSign} /> Total: </small>
                    </div>

                    <span><br /></span>
                    <Table striped bordered hover size="sm">
                      <thead className='bg-primary'>
                        <tr>
                          <th className='px-3'>Item Code</th>
                          <th className='px-3'>Item Name</th>
                          <th className='px-3'>Quantity</th>
                          <th className='px-3'>Price</th>
                          <th className='text-center'>Modify / Delete</th>
                        </tr>
                      </thead>
                      <tbody style={{ height: "300px" }}>

                      </tbody>
                    </Table>


                  </div>


                </div>
              </Tab.Pane>
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
                      <small> <FontAwesomeIcon icon={faUser} /> Supplier Name: </small>
                      <small> <FontAwesomeIcon icon={faCalendarDays} /> Date: </small>
                      <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: </small>
                      <small> <FontAwesomeIcon icon={faPesetaSign} /> Total: </small>
                    </div>

                    <span><br /></span>
                    <Table striped bordered hover size="sm">
                      <thead className='bg-primary'>
                        <tr>
                          <th className='px-3'>Item Code</th>
                          <th className='px-3'>Item Name</th>
                          <th className='px-3'>Quantity</th>
                          <th className='px-3'>Price</th>
                          <th className='text-center'>Modify / Delete</th>
                        </tr>
                      </thead>
                      <tbody style={{ height: "300px" }}>

                      </tbody>
                    </Table>


                  </div>


                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>




      </Tab.Container>

    </div>




  );


}

export default Records;