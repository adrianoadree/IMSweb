import React, { useEffect, useState } from "react";
import { Card, Nav, Table, Button, ButtonGroup, Tab, Carousel } from "react-bootstrap";
import NewSupplierModal from "../components/NewSupplierModal";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartFlatbed, faFileInvoice, faUserPlus,faArrowRightToBracket,faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import NewProductModal from "../components/NewProductModal";
import NewPurchaseModal from "../components/NewPurchaseModal";
import NewSalesModal from "../components/NewSalesModal";
import { useNavigate } from 'react-router-dom';
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import { UserAuth } from '../context/AuthContext';
import moment from "moment";
import UserRouter from '../pages/UserRouter'


function LandingPage() {

    const { user } = UserAuth();
    const navigate = useNavigate();

    const [productModalShow, setProductModalShow] = React.useState(false);
    const [supplierModalShow, setSupplierModalShow] = React.useState(false);
    const [purchaseModalShow, setPurchaseModalShow] = React.useState(false);
    const [salesModalShow, setSalesModalShow] = React.useState(false);

    const [purchRecord, setPurchRecord] = useState([]);
    const [salesRecord, setSalesRecord] = useState([]);


    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);


    //---------------------FUNCTIONS---------------------


    /* useEffect(() => {
         if (user == null) {
             navigate('/login');
         }
     }, [user]);
 */

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

    function formatDate(string) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(string).toLocaleDateString([], options);
    }

    return (
        <div>
            <UserRouter
                route='/home'
            />
            <Navigation />
            <div className="row contents">
                <div className="row py-4 px-5">
                    <div className="sidebar h-auto">
                        <Card className="sidebar-card">
                            <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                                <h4><strong>Quick Access</strong></h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="p-1">
                                    <div className="row py-1">
                                        <div className="col-3  d-flex justify-content-center">
                                            <FontAwesomeIcon icon={faCartFlatbed} size="4x" className="darkblue-icon" />
                                        </div>
                                        <div className="col-9">
                                            <div className="row mb-3">
                                                <div className="col-12">
                                                    <h5>Register New Product</h5>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <Button variant="outline-primary" className="float-end" onClick={() => setProductModalShow(true)}>
                                                        <strong>Add New Product</strong>
                                                    </Button>
                                                </div>
                                            </div>
                                            <NewProductModal
                                                show={productModalShow}
                                                onHide={() => setProductModalShow(false)} />
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row py-1">
                                        <div className="col-3 d-flex justify-content-center">
                                            <FontAwesomeIcon icon={faUserPlus} size="4x" className="darkblue-icon" />
                                        </div>
                                        <div className="col-9">
                                            <div className="row mb-3">
                                                <div className="col-12">
                                                    <h5>Register New Supplier</h5>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <Button variant="outline-primary" className="float-end" onClick={() => setSupplierModalShow(true)}>
                                                        <strong>Add New Supplier</strong>
                                                    </Button>
                                                </div>
                                            </div>
                                            <NewSupplierModal
                                                show={supplierModalShow}
                                                onHide={() => setSupplierModalShow(false)} />
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row py-1">
                                        <div className="col-3 d-flex justify-content-center">
                                            <FontAwesomeIcon icon={faFileInvoice} size="4x" className="darkblue-icon" />
                                        </div>
                                        <div className="col-9">
                                            <div className="row mb-3">
                                                <div className="col-12">
                                                    <h5>Register New Transaction</h5>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-12">
                                                    <Button variant="outline-primary" className="float-end" onClick={() => setSalesModalShow(true)}>
                                                        <strong>Sales</strong>
                                                    </Button>
                                                    <Button variant="outline-primary" className="float-end  me-2" onClick={() => setPurchaseModalShow(true)}>
                                                        <strong>Purchase</strong>
                                                    </Button>
                                                </div>
                                            </div>
                                            <NewSalesModal
                                                show={salesModalShow}
                                                onHide={() => setSalesModalShow(false)} />
                                        </div>
                                        <NewPurchaseModal
                                            show={purchaseModalShow}
                                            onHide={() => setPurchaseModalShow(false)} />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                    <div className="divider">

                    </div>
                    <div className="data-contents p-3">
                        <Card className="sidebar-card">
                            <Card.Header className="py-3 text-center left-curve right-curve">
                                <h4 className="mb-2"><strong>Today's Report</strong></h4>
                                <span className="header-subtitle-strip">
                                    <h5 className="header-subtitle">{moment(date).format('dddd')}, {moment(date).format('MMMM D, YYYY')}</h5>
                                </span>
                            </Card.Header>
                            <Card.Body className="folder-style">
                                <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                                    <Nav variant="pills" defaultActiveKey={1}>
                                        <Nav.Item>
                                            <Nav.Link eventKey={0}>
                                                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                                                Sales
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey={1}>
                                                <FontAwesomeIcon icon={faArrowRightToBracket} />
                                                Purchase
                                            </Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                    <Tab.Content>
                                        <Tab.Pane eventKey={0}>
                                            <Table striped bordered hover size="sm" className="records-table light">
                                                <thead className="bg-primary">
                                                    <tr>
                                                        <th className="pth text-center">Document Number</th>
                                                        <th className="pth text-center">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {salesRecord.map((salesRecord) => (
                                                        <tr>
                                                            <td className="pt-entry text-center">{salesRecord.document_number}</td>
                                                            <td className="pt-entry text-center">{salesRecord.document_date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={1}>
                                            <Table striped bordered hover size="sm" className="records-table light">
                                                <thead className="bg-primary">
                                                    <tr>
                                                        <th className="pth text-center">Document Number</th>
                                                        <th className="pth text-center">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {purchRecord.map((purchRecord) => {
                                                        return (
                                                            <tr>
                                                                <td className="pt-entry text-center">{purchRecord.document_number}</td>
                                                                <td className="pt-entry text-center">{date}</td>
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
                </div>
            </div>
        </div>
    )
}
export default LandingPage;