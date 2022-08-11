import React from 'react';
import { useState, useEffect } from 'react';
import Navigation from '../layout/Navigation';
import { db } from '../firebase-config';
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { Button, Tab, ListGroup, Card, Modal } from 'react-bootstrap';
import { doc, onSnapshot, collection, deleteDoc, query, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'




function SupplierList() {

    //---------------------VARIABLES---------------------
    const [editShow, setEditShow] = useState(false); //display/ hide edit modal
    const [modalShow, setModalShow] = useState(false);//display/hide modal
    const [supplier, setSupplier] = useState([]); //supplier Collection
    const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
    const [docId, setDocId] = useState("xx"); //document id variable
    let navigate = useNavigate();

    //---------------------FUNCTIONS---------------------

<<<<<<< HEAD
=======
 

>>>>>>> parent of 76dbd3d (Revert "changed login method")
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
        console.log("Updated Supplier Info")
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




    const handleClose = () => setEditShow(false);

    function MyVerticallyCenteredModal(props) {


        //-----------------VARIABLES------------------
        const [newSuppName, setNewSuppName] = useState("");
        const [newSuppAddress, setNewSuppAddress] = useState("");
        const [newSuppEmail, setNewSuppEmail] = useState("");
        const [newSuppMobileNum, setSuppNewMobileNum] = useState(0);
        const [newSuppTelNum, setNewSuppTelNum] = useState(0);

        //SetValues
        useEffect(() => {
            setNewSuppName(supplierDoc.supplier_name)
            setNewSuppAddress(supplierDoc.supplier_address)
            setNewSuppEmail(supplierDoc.supplier_emailaddress)
            setSuppNewMobileNum(supplierDoc.supplier_mobileNum)
            setNewSuppTelNum(supplierDoc.supplier_telNum)
        }, [docId])


        //delete Toast
        const updateToast = () => {
            toast.info(' Supplier Information Successfully Updated', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
        }

        //update Supplier Document
        function updateSupplier() {
            updateDoc(doc(db, "supplier", docId), {
                supplier_name: newSuppName
                , supplier_emailaddress: newSuppEmail
                , supplier_address: newSuppAddress
                , supplier_mobileNum: Number(newSuppMobileNum)
                , supplier_telNum: Number(newSuppTelNum)
            });
            updateToast()
            handleClose();
        }




        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <ToastContainer
                    position="top-right"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />

                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Edit <strong>{newSuppName}</strong>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <div className="p-3">
                        <div className="row my-2">
                            <div className='row'>
                                <div className='col-8'>
                                    <label>Supplier Name</label>

                                    <input type="text"
                                        className="form-control"
                                        placeholder="Supplier Name"
                                        value={newSuppName}
                                        onChange={(event) => { setNewSuppName(event.target.value); }}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="row my-2">
                            <div className="col-12">
                                <label>Address</label>
                                <input type="text"
                                    className="form-control"
                                    placeholder="Address"
                                    rows={3}
                                    value={newSuppAddress}
                                    onChange={(event) => { setNewSuppAddress(event.target.value); }}
                                />
                            </div>
                        </div>


                        <h5>Contact Information</h5>
                        <hr></hr>

                        <div className="row my-2">
                            <div className="col-7">
                                <label>Email Address</label>
                                <input type="email"
                                    className="form-control"
                                    placeholder="*****@email.com"
                                    value={newSuppEmail}
                                    onChange={(event) => { setNewSuppEmail(event.target.value); }}
                                />
                            </div>
                        </div>

                        <div className="row my-2">
                            <div className="col-6">
                                <label>Mobile Number</label>
                                <input type="number"
                                    className="form-control"
                                    placeholder="09---------"
                                    value={newSuppMobileNum}
                                    onChange={(event) => { setSuppNewMobileNum(event.target.value); }}
                                />
                            </div>
                        </div>

                        <div className="row my-2">
                            <div className="col-6">
                                <label>Telephone Number</label>
                                <input type="number"
                                    className="form-control"
                                    placeholder="Contact Number"
                                    value={newSuppTelNum}
                                    onChange={(event) => { setNewSuppTelNum(event.target.value); }}
                                />
                            </div>
                        </div>


                    </div>

                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => { updateSupplier(docId) }}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }




    return (

        <div className="row bg-light">
            <Navigation />

            <ToastContainer
                position="top-right"
                autoClose={1000}
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
                                    <Button
                                        variant="outline-light"
                                        onClick={() => setModalShow(true)}>
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
                                            size="sm"
                                            variant="outline-dark"
                                            style={{ width: "100px" }}
                                            onClick={() => setEditShow(true)}
                                        >
                                            Edit <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                        <MyVerticallyCenteredModal
                                            show={editShow}
                                            onHide={() => setEditShow(false)}
                                        />



                                        <Button
                                            className="mt-2"
                                            size="sm"
                                            variant="outline-danger"
                                            style={{ width: "100px" }}
                                            onClick={() => { deleteSupplier(docId) }}
                                        >
                                            Delete <FontAwesomeIcon icon={faTrashCan} />
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