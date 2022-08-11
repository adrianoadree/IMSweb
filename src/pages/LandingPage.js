import React, { useEffect, useState } from "react";
import { Card, Nav, Table, Button, ButtonGroup, Tab } from "react-bootstrap";
import NewSupplierModal from "../components/NewSupplierModal";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartFlatbed, faFileInvoice, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import NewProductModal from "../components/NewProductModal";
import NewPurchaseModal from "../components/NewPurchaseModal";
import NewSalesModal from "../components/NewSalesModal";
import { useNavigate } from 'react-router-dom';
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import { UserAuth } from '../context/AuthContext';

function LandingPage({ isAuth }) {
    const [productModalShow, setProductModalShow] = React.useState(false);
    const [supplierModalShow, setSupplierModalShow] = React.useState(false);
    const [purchaseModalShow, setPurchaseModalShow] = React.useState(false);
    const [salesModalShow, setSalesModalShow] = React.useState(false);

    const [purchRecord, setPurchRecord] = useState([]);
    const [salesRecord, setSalesRecord] = useState([]);


    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);


    const { user } = UserAuth();
    const navigate = useNavigate();



    //---------------------FUNCTIONS---------------------



    //read sales_record collection
    useEffect(() => {
        const purchaseRecordCollectionRef = collection(db, "sales_record")
        const q = query(purchaseRecordCollectionRef, where("document_date", "==", date));

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])

    //read from purchase_record collection
    useEffect(() => {
        const purchaseRecordCollectionRef = collection(db, "purchase_record")
        const q = query(purchaseRecordCollectionRef, where("document_date", "==", date));

        const unsub = onSnapshot(q, (snapshot) =>
            setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])

    return (
        <div className="row bg-light">
            <Navigation />

            <div className="col-1" />
            <div className="col-4 py-5" >
                <Card className="shadow">
                    <Card.Header className="bg-primary  text-white py-3"><strong>Quick Access</strong></Card.Header>
                    <Card.Body>
                        <div className="p-3">
                            <div className="row">
                                <p className="text-muted">
                                    <FontAwesomeIcon icon={faCartFlatbed} /> Register New Product to the Inventory
                                </p>
                                <Button variant="outline-primary" onClick={() => setProductModalShow(true)}>
                                    <span>Add new Product</span>
                                </Button>
                                <NewProductModal
                                    show={productModalShow}
                                    onHide={() => setProductModalShow(false)} />
                            </div>
                            <hr />
                            <div className="row">
                                <p className="text-muted">
                                    <FontAwesomeIcon icon={faUserPlus} /> Register New Supplier
                                </p>
                                <Button variant="outline-primary" onClick={() => setSupplierModalShow(true)}>
                                    <span>Add new Supplier</span>
                                </Button>
                                <NewSupplierModal
                                    show={supplierModalShow}
                                    onHide={() => setSupplierModalShow(false)} />
                            </div>
                            <hr />
                            <div className="row">
                                <p className="text-muted">
                                    <FontAwesomeIcon icon={faFileInvoice} /> Record New Transaction
                                </p>
                                <ButtonGroup className="mt-2" >
                                    <Button variant="outline-primary" onClick={() => setSalesModalShow(true)}>
                                        <span>Sales</span>
                                    </Button>
                                    <NewSalesModal
                                        show={salesModalShow}
                                        onHide={() => setSalesModalShow(false)} />

                                    <Button variant="outline-primary" onClick={() => setPurchaseModalShow(true)}>
                                        <span>Purchase</span>
                                    </Button>
                                    <NewPurchaseModal
                                        show={purchaseModalShow}
                                        onHide={() => setPurchaseModalShow(false)} />


                                </ButtonGroup>
                            </div>
                            <hr />

                        </div>
                    </Card.Body>
                </Card>



            </div>
            <div className="col-6 py-5" >
                <Card className="shadow">
                    <Card.Header className="bg-primary py-3 px-4">
                        <h5 className="text-white">Today's Report</h5>
                        <small className="text-white">Date: {date}</small>
                    </Card.Header>
                    <Card.Body style={{ height: "550px" }}>
                        <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                            <Nav fill variant="pills" defaultActiveKey={1} className="shadow">
                                <Nav.Item>
                                    <Nav.Link eventKey={0}>
                                        Sales
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey={1}>
                                        Purchase
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <br />
                            <Tab.Content>

                                <Tab.Pane eventKey={0}>
                                    <Table striped bordered hover size="sm">
                                        <thead className="bg-primary">
                                            <tr>
                                                <th className="px-3">Document Number</th>
                                                <th className="px-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {salesRecord.map((salesRecord) => (
                                                <tr>
                                                    <td className="px-3">{salesRecord.document_number}</td>
                                                    <td className="px-3">{salesRecord.document_date}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>
                                <Tab.Pane eventKey={1}>
                                    <Table striped bordered hover size="sm">
                                        <thead className="bg-primary">
                                            <tr>
                                                <th className="px-3">Document Number</th>
                                                <th className="px-3">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {purchRecord.map((purchRecord) => {
                                                return (
                                                    <tr>
                                                        <td className="px-3">{purchRecord.document_number}</td>
                                                        <td className="px-3">{date}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Tab.Pane>


                            </Tab.Content>


                        </Tab.Container>

                    </Card.Body>
                </Card>


            </div>
            <div className="col-1" />

        </div >
    )
}
export default LandingPage;