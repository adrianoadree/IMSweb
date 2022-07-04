import React from 'react';
import { useState, useEffect } from 'react';
import { Button, Tab, ListGroup, Table, Card } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { db } from '../firebase-config';
import { doc, onSnapshot, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faLocationDot, faPlus, faShop, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';



function SupplierList({isAuth}) {

    const [modalShow, setModalShow] = React.useState(false);
    const [supplier, setSupplier] = useState([]);
    const supplierCollectionRef = collection(db, "supplier")


    const [suppId, setSuppId] = useState("xx");
    const docRef = doc(db, "supplier", suppId)


    const [supplierName, setSupplierName] = useState([]);
    const [supplierCompany, setSupplierCompany] = useState([]);
    const [supplierAddress, setSupplierAddress] = useState([]);
    const [supplierContact, setSupplierContact] = useState([]);
    let navigate = useNavigate();


    useEffect(() =>{
        if(!isAuth){
            navigate("/login");
        }
    },[]);

    //access document from a collection
    onSnapshot(docRef, (doc) => {
        setSupplierName(doc.data().supplier_name)
        setSupplierCompany(doc.data().supplier_company)
        setSupplierAddress(doc.data().supplier_address)
        setSupplierContact(doc.data().supplier_contact)

    },[])

    //Read supplier collection from database
    useEffect(() => {
        const getSupplier = async () => {
            const data = await getDocs(supplierCollectionRef);
            setSupplier(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };
        getSupplier()
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
                        <Card.Body style={{height:"500px"}}>
                            <ListGroup variant="flush">
                                {supplier.map((supplier) => {
                                    return (
                                        <ListGroup.Item action eventKey={supplier.id} onClick={() => { setSuppId(supplier.id) }}>
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
                            <div className='bg-white p-5 shadow'>
                                <div>
                                    <small className="my-1"> <FontAwesomeIcon icon={faUser} /> <span className='text-muted'>Supplier Name: </span>{ } </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faShop} /> <span className='text-muted'>Supplier Company: </span>{ } </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faLocationDot} /> <span className='text-muted'>Address: </span>{ }</small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faAddressBook} /> <span className='text-muted'>Contact Number: </span>{ }</small><br />
                                </div>
                                <h5 className="text-center p1">Transaction History</h5>
                                <hr />
                                <Table striped bordered hover size="sm">
                                    <thead className='bg-primary'>
                                        <tr>
                                            <th className='px-3'>Document Number</th>
                                            <th className='px-3'>Date</th>
                                            <th className='px-3'>Total</th>
                                            <th className='text-center'>Modify / Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{height:"400px"}}>
                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey={suppId}>
                            <div className='bg-white p-5'>
                                <div>
                                    <small className="my-1"> <FontAwesomeIcon icon={faUser} /> <span className='text-muted'>Supplier Name: </span>{supplierName} </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faShop} /> <span className='text-muted'>Supplier Company: </span>{supplierCompany} </small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faLocationDot} /> <span className='text-muted'>Address: </span>{supplierAddress}</small><br />
                                    <small className="my-1"> <FontAwesomeIcon icon={faAddressBook} /> <span className='text-muted'>Contact Number: </span>{supplierContact}</small><br />
                                </div>
                                <h5 className="text-center">Transaction History</h5>
                                <hr />
                                <Table striped bordered hover size="sm">
                                    <thead className='bg-primary'>
                                        <tr>
                                            <th className='px-3'>Document Number</th>
                                            <th className='px-3'>Date</th>
                                            <th className='px-3'>Total</th>
                                            <th className='text-center'>Modify / Delete</th>
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