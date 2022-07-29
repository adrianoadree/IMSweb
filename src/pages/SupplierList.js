import React from 'react';
import { useState, useEffect } from 'react';
import Navigation from '../layout/Navigation';
import { db } from '../firebase-config';
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { Button, Tab, ListGroup, Card } from 'react-bootstrap';
import { doc, onSnapshot, collection, deleteDoc, query, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'




function SupplierList({ isAuth }) {

    //---------------------VARIABLES---------------------
    const [modalShow, setModalShow] = useState(false);//display/hide modal
    const [supplier, setSupplier] = useState([]); //supplier Collection
    const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
    const [docId, setDocId] = useState("xx"); //document id variable
    let navigate = useNavigate();

    //---------------------FUNCTIONS---------------------

    useEffect(() => {
        if (!isAuth) {
            navigate("/login");
        }
    }, []);


    //Read supplier collection from database
    useEffect(() => {
        const supplierCollectionRef = collection(db, "supplier")
        const q = query(supplierCollectionRef);
        const unsub = onSnapshot(q, (snapshot) =>
            setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])


    useEffect(() => {
        async function readSupplierDoc() {
            const salesRecord = doc(db, "supplier", docId)
            const docSnap = await getDoc(salesRecord)
            if (docSnap.exists()) {
                setSupplierDoc(docSnap.data());
            }
        }
        readSupplierDoc()
    }, [docId])




    //delete Toast
    const deleteToast = () => {
        toast.error('Supplier DELETED from the Database', {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
    //Delete collection from database
    const deleteSupplier = async (id) => {
        const supplierDoc = doc(db, "supplier", id)
        deleteToast();
        await deleteDoc(supplierDoc);
    }


    return (

        <div className="row bg-light">
            <Navigation />

            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

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
                        <Card.Body style={{ height: "500px" }} id='scrollbar'>
                            <ListGroup variant="flush">
                                {supplier.map((supplier) => {
                                    return (
                                        <ListGroup.Item
                                            action
                                            key={supplier.id}
                                            eventKey={supplier.id}
                                            onClick={() => { setDocId(supplier.id) }}>
                                            <div className='row'>
                                                <small><strong>{supplier.supplier_name}</strong></small><br />
                                                <small>{supplier.id}</small>
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

                            <div className='row px-5'>
                                <div className='row bg-white shadow'>
                                    <h1 className='text-center pt-4 p1'>Supplier</h1>
                                    <hr />
                                </div>

                                <div className='row'>
                                    <div className='col-6 mt-4'>
                                        <Card className='shadow'>
                                            <Card.Header className='bg-primary text-white'>
                                                Supplier Information
                                            </Card.Header>
                                            <Card.Body>
                                                <small>Supplier ID: </small><br />
                                                <small>Supplier Name: </small><br />
                                                <small>Supplier Address: </small><br />

                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <div className='col-6 mt-4'>
                                        <Card className='shadow'>
                                            <Card.Header className='bg-primary text-white'>
                                                Contact Information

                                            </Card.Header>
                                            <Card.Body>
                                                <small>Mobile Number: </small><br />
                                                <small>Telephone Number: </small><br />
                                                <small>Email Address: </small><br />
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>


                            </div>

                        </Tab.Pane>

                        <Tab.Pane eventKey={docId}>

                            <div className='row px-5'>
                                <div className='row bg-white shadow'>
                                    <div className="col-10">
                                        <h1 className='text-center pt-4 p1'>{supplierDoc.supplier_name}</h1>
                                        <hr />
                                    </div>
                                    <div className="col-2 pt-4">
                                        <Button
                                            size="md"
                                            variant="outline-danger"
                                            onClick={() => { deleteSupplier(docId) }}
                                        >
                                            Delete<FontAwesomeIcon icon={faTrashCan} />
                                        </Button>
                                    </div>

                                </div>

                                <div className='row'>
                                    <div className='col-6 mt-4'>
                                        <Card className='shadow'>
                                            <Card.Header className='bg-primary text-white'>
                                                Supplier Information
                                            </Card.Header>
                                            <Card.Body>
                                                <small>Supplier ID: <strong className='mx-2'>{docId}</strong></small><br />
                                                <small>Supplier Name: <strong className='mx-2'>{supplierDoc.supplier_name}</strong></small><br />
                                                <small>Supplier Address: <strong className='mx-2'>{supplierDoc.supplier_address}</strong> </small><br />
                                            </Card.Body>
                                        </Card>
                                    </div>
                                    <div className='col-6 mt-4'>
                                        <Card className='shadow'>
                                            <Card.Header className='bg-primary text-white'>
                                                Contact Information

                                            </Card.Header>
                                            <Card.Body>
                                                <small>Mobile Number: <strong className='mx-2'>{supplierDoc.supplier_mobileNum}</strong></small><br />
                                                <small>Telephone Number: <strong className='mx-2'>{supplierDoc.supplier_telNum}</strong></small><br />
                                                <small>Email Address: <strong className='mx-2'>{supplierDoc.supplier_emailaddress}</strong></small><br />
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </div>


                            </div>

                        </Tab.Pane>
                    </Tab.Content>
                </div>
            </Tab.Container >




        </div >



    );
}
export default SupplierList;