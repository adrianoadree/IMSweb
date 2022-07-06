import React from 'react';
import { useState, useEffect } from 'react';
import Navigation from '../layout/Navigation';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faLocationDot, faPlus, faShop, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Tab,
    ListGroup,
    Table,
    Card
} from 'react-bootstrap';

import {
    doc,
    onSnapshot,
    collection,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';



function SupplierList({ isAuth }) {

    const [modalShow, setModalShow] = useState(false);
    const [supplier, setSupplier] = useState([]);
    const [purchRecord, setPurchRecord] = useState([]);


    const [suppId, setSuppId] = useState("xx");
    const docRef = doc(db, "supplier", suppId)


    const [supplierName, setSupplierName] = useState([]);
    const [supplierCompany, setSupplierCompany] = useState([]);
    const [supplierAddress, setSupplierAddress] = useState([]);
    const [supplierContact, setSupplierContact] = useState([]);
    let navigate = useNavigate();


    useEffect(() => {
        if (!isAuth) {
            navigate("/login");
        }
    }, []);

    //access document from a collection
    onSnapshot(docRef, (doc) => {
        setSupplierName(doc.data().supplier_name)
        setSupplierCompany(doc.data().supplier_company)
        setSupplierAddress(doc.data().supplier_address)
        setSupplierContact(doc.data().supplier_contact)

    }, [])

    //Read supplier collection from database
    useEffect(() => {
        const supplierCollectionRef = collection(db, "supplier")
        const q = query(supplierCollectionRef);

        const unsub = onSnapshot(q, (snapshot) =>
            setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );

        return unsub;
    }, [])

    //read from purchase_record collection
    useEffect(() => {
        const purchaseRecordCollectionRef = collection(db, "purchase_record")
        const q = query(purchaseRecordCollectionRef, where("product_supplier", "==", supplierName));

        const unsub = onSnapshot(q, (snapshot) =>
            setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        console.log(purchRecord)
        return unsub;
    }, [])



    //Delete collection from database
    const deleteSupplier = async (id) => {
        const supplierDoc = doc(db, "supplier", id)
        await deleteDoc(supplierDoc);
    }


    return (

        <div className="row bg-light">
            <Navigation />

            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div className='col-3 p-5'>
                    <Card className="shadow">
                        <Card.Header className="bg-primary">
                            <div className="row">
                                <div className="col-9 pt-2 text-white">
                                    <h6>Supplier List</h6>
                                </div>
                                <div className="col-3">
                                    <Button variant="primary" onClick={() => setModalShow(true)}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                    <NewSupplierModal
                                        show={modalShow}
                                        onHide={() => setModalShow(false)}
                                    />
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ height: "500px" }}>
                            <ListGroup variant="flush">
                                {supplier.map((supplier) => {
                                    return (
                                        <ListGroup.Item
                                            action
                                            key={supplier.id}
                                            eventKey={supplier.id}
                                            onClick={() => { setSuppId(supplier.id) }}>
                                            <div className='row'>
                                                <div className="col-9 pt-1">
                                                    {supplier.supplier_name}<br />
                                                    <small className="text-secondary">{supplier.supplier_company}</small>
                                                </div>
                                                <div className='col-3'>
                                                    <Button
                                                        className="text-dark"
                                                        variant="outline-light"
                                                        size="sm"
                                                        onClick={() => { deleteSupplier(supplier.id) }}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </Button>
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
                        <Tab.Pane eventKey={0}>
                            <div className='bg-white p-5'>
                                <div>
                                    <small className="my-1"> <FontAwesomeIcon icon={faUser} /> Supplier Name: </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faShop} /> Supplier Company:  </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faLocationDot} /> Address: </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faAddressBook} />Contact Number: </small><br />
                                </div>
                                <h5 className="text-center">Transaction History</h5>
                                <hr />
                                <Table striped bordered hover size="sm">
                                    <thead className='bg-primary'>
                                        <tr>
                                            <th className='px-3'>Document Number</th>
                                            <th className='px-3'>Date</th>
                                            <th className='px-3'>Product Name</th>
                                            <th className='px-3'>Quantity</th>
                                            <th className='px-3'>Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchRecord.map((purchRecord) => {
                                            return (
                                                <tr>
                                                    <td>{purchRecord.document_number}</td>
                                                    <td>{}</td>
                                                    <td>{purchRecord.product_name}</td>
                                                    <td>{purchRecord.product_quantity}</td>
                                                    <td>{purchRecord.document_note}</td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey={suppId}>
                            <div className='bg-white p-5'>
                                <div>
                                    <small className="my-1"> <FontAwesomeIcon icon={faUser} /> Supplier Name: {supplierName} </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faShop} /> Supplier Company: {supplierCompany} </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faLocationDot} /> Address: {supplierAddress}</small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faAddressBook} />Contact Number: {supplierContact}</small><br />
                                </div>
                                <h5 className="text-center">Transaction History</h5>
                                <hr />
                                <Table striped bordered hover size="sm">
                                    <thead className='bg-primary'>
                                        <tr>
                                            <th className='px-3'>Document Number</th>
                                            <th className='px-3'>Date</th>
                                            <th className='px-3'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </Tab.Container>




        </div>



    );
}
export default SupplierList;