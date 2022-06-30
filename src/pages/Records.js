import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Navigation from "../layout/Navigation";
import { Table, Button } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faNoteSticky, faXmark, faUser, faPesetaSign } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import ListGroup from 'react-bootstrap/ListGroup';

import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc } from 'firebase/firestore';
import NewPurchaseModal from "../components/NewPurchaseModal";


function Records() {

    const [modalShow, setModalShow] = React.useState(false);

    const [purchaseRecord, setPurchaseRecord] = useState([]);
    const purchaseRecordCollectionRef = collection(db, "purchase_record")
    const [setsupplierRecord] = useState([]);
    const supplierRecordCollectionRef = collection(db, "supplier")


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
        <div className="row bg-light">
            <Navigation />
            <div className="col-3 p-5">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white" >
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
                    </div>

                    <div className="card-body" style={{ height: '500px' }}>
                        <ListGroup variant="flush">
                            {purchaseRecord.map((purchaseRecord) => {
                                return (
                                    <ListGroup.Item action variant="light">
                                        <div className="row">
                                            <div className="col-9">
                                                <small><strong>{purchaseRecord.supplier_name}</strong></small><br />
                                                <small className="text-secondary">Doc No: {purchaseRecord.document_number}</small><br />
                                                <small className="text-secondary">Date</small>

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

                    </div>
                </div>


            </div>
            <div className="col-9 p-5">
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

        </div>
    )

}

export default Records;