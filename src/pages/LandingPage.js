import React from "react";
import { Card, Nav, Table, Button, ButtonGroup } from "react-bootstrap";
import NewSupplierModal from "../components/NewSupplierModal";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartFlatbed, faFileInvoice, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import NewProductModal from "../components/NewProductModal";
import NewPurchaseModal from "../components/NewPurchaseModal";
import NewSalesModal from "../components/NewSalesModal";

function LandingPage() {
    const [productModalShow, setProductModalShow] = React.useState(false);
    const [supplierModalShow, setSupplierModalShow] = React.useState(false);
    const [purchaseModalShow, setPurchaseModalShow] = React.useState(false);
    const [salesModalShow, setSalesModalShow] = React.useState(false);


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
                                <h6 className="text-muted">
                                    <FontAwesomeIcon icon={faCartFlatbed} />Register New Product to the Inventory
                                </h6>
                                <Button variant="outline-primary" onClick={() => setProductModalShow(true)}>
                                    <span>Add new Product</span>
                                </Button>
                                <NewProductModal
                                    show={productModalShow}
                                    onHide={() => setProductModalShow(false)} />
                            </div>
                            <hr />
                            <div className="row">
                                <h6 className="text-muted"><FontAwesomeIcon icon={faUserPlus} />
                                    Register New Supplier
                                </h6>
                                <Button variant="outline-primary" onClick={() => setSupplierModalShow(true)}>
                                    <span>Add new Supplier</span>
                                </Button>
                                <NewSupplierModal
                                    show={supplierModalShow}
                                    onHide={() => setSupplierModalShow(false)} />
                            </div>
                            <hr />
                            <div className="row">
                                <h6 className="text-muted">
                                    <FontAwesomeIcon icon={faFileInvoice} /> Record New Transaction
                                </h6>
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


                <Card className="mt-2 shadow">
                    <Card.Header className="bg-danger text-white">
                        Product(s) Near Restocking Point
                    </Card.Header>
                    <Card.Body style={{ height: "250px" }}>

                    </Card.Body>
                </Card>

            </div>
            <div className="col-6 py-5" >
                <Card className="shadow">
                    <Card.Header className="bg-primary py-3 px-4">
                        <h5 className="text-white">Today's Report</h5>
                        <small className="text-white">Date</small>
                    </Card.Header>
                    <Card.Body style={{ height: "550px" }}>
                        <Nav fill variant="pills" defaultActiveKey="1">
                            <Nav.Item>
                                <Nav.Link eventKey="1">
                                    Sales
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="2">
                                    Purchase
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <br />
                        <Table striped bordered hover size="sm">
                            <thead className="bg-primary">
                                <tr>
                                    <th>Doc Number</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Mark</td>
                                    <td>Otto</td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>Jacob</td>
                                    <td>Thornton</td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td colSpan={2}>Larry the Bird</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                    <Card.Footer className="bg-primary">
                        <h6 className="text-white">Total</h6>
                    </Card.Footer>

                </Card>


            </div>
            <div className="col-1" />

        </div>
    )
}
export default LandingPage;