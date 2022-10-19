import React, { useEffect, useState } from "react";
import { Card, Nav, Table, Button, ButtonGroup, Tab, Accordion, Alert } from "react-bootstrap";
import NewSupplierModal from "../components/NewSupplierModal";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faArrowRightToBracket, faCartFlatbed, faFileInvoice, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import NewProductModal from "../components/NewProductModal";
import NewPurchaseModal from "../components/NewPurchaseModal";
import NewSalesModal from "../components/NewSalesModal";
import { useNavigate } from 'react-router-dom';
import { collection, where, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import { UserAuth } from '../context/AuthContext';
import moment from "moment";
import UserRouter from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';


function LandingPage() {

    const { user } = UserAuth();
    const navigate = useNavigate();
    const [userID, setUserID] = useState("");


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


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    useEffect(() => {
        console.log(user)
    }, [user]);




    // =================================== START OF TODAY'S REPORT FUNCTION ===================================
    // ----------------------------------- START OF PURCHASE REPORT FUNCTION ----------------------------------
    //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
    const [purchaseRecordCollection, setPurchaseRecordCollection] = useState(); // sales_record collection
    const [totalPurchase, setTotalPurchase] = useState(0)
    const [arrTotalPurchase, setArrTotalPurchase] = useState()

    const [purchToday, setPurchaseToday] = useState(new Date())
    const [purchStringDate, setPurchStringDate] = useState()



    useEffect(() => {
        let tempDate
        tempDate = purchToday.toISOString().substring(0, 10)
        setPurchStringDate(tempDate)
    }, [purchToday])

    useEffect(() => {
        console.log("purchStringDate", purchStringDate)
    }, [purchStringDate])


    useEffect(() => {
        console.log("purchaseRecordCollection", purchaseRecordCollection)
    }, [purchaseRecordCollection])


    useEffect(() => {
        console.log(user)
    }, [user])


    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (purchStringDate !== undefined && userID !== undefined) {
            const collectionRef = collection(db, "purchase_record")
            const q = query(collectionRef, where("transaction_date", "==", purchStringDate), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [purchStringDate && userID])


    useEffect(() => {
        let tempPurch = 0
        let arrPurchTotal = []
        if (purchaseRecordCollection !== undefined) {

            purchaseRecordCollection.map((purch) => {
                purch.product_list.map((prod) => {
                    tempPurch += Number(prod.itemQuantity)
                })
                arrPurchTotal.push(tempPurch)
                tempPurch = 0
            })
        }
        setArrTotalPurchase(arrPurchTotal)
    }, [purchaseRecordCollection])

    useEffect(() => {

        console.log("arrTotalPurchase", arrTotalPurchase)
    }, [arrTotalPurchase])

    useEffect(() => {
        let tempTotal = 0
        if (arrTotalPurchase !== undefined) {
            arrTotalPurchase.map((purch) => {
                tempTotal += purch
            })
            setTotalPurchase(tempTotal)
        }
    }, [arrTotalPurchase])


    // ------------------------------------ END OF PURCHASE REPORT FUNCTION -----------------------------------

    //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
    const [salesRecordCollection, setSalesRecordCollection] = useState(); // sales_record collection
    const [totalSales, setTotalSales] = useState(0)
    const [arrTotalSales, setArrTotalSales] = useState()

    const [salesToday, setSalesToday] = useState(new Date())
    const [salesStringToday, setSalesStringToday] = useState()



    useEffect(() => {
        let tempDate
        tempDate = salesToday.toISOString().substring(0, 10)
        setSalesStringToday(tempDate)
    }, [salesToday])

    useEffect(() => {
        console.log("salesStringToday", salesStringToday)
    }, [salesStringToday])


    useEffect(() => {
        console.log("salesRecordCollection", salesRecordCollection)
    }, [salesRecordCollection])



    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (salesStringToday !== undefined && userID !== undefined) {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", salesStringToday), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [salesStringToday && userID])


    useEffect(() => {
        let tempPurch = 0
        let arrSalesTotal = []
        if (salesRecordCollection !== undefined) {

            salesRecordCollection.map((sales) => {
                sales.product_list.map((prod) => {
                    tempPurch += Number(prod.itemQuantity)
                })
                arrSalesTotal.push(tempPurch)
                tempPurch = 0
            })
        }
        setArrTotalSales(arrSalesTotal)
    }, [salesRecordCollection])

    useEffect(() => {
        let tempTotal = 0
        if (arrTotalSales !== undefined) {
            arrTotalSales.map((sales) => {
                tempTotal += sales
            })
            setTotalSales(tempTotal)
        }
    }, [arrTotalSales])

    // ------------------------------------ END OF PURCHASE REPORT FUNCTION -----------------------------------


    // ==================================== END OF TODAY'S REPORT FUNCTION ====================================


    function purchaseTable() {
        return (
            purchaseRecordCollection !== undefined ?
                purchaseRecordCollection.length !== 0 ?
                    < Table striped bordered hover size="sm" className="records-table light" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">Transaction Number</th>
                                <th className="pth text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseRecordCollection.map((purch, index) => (
                                <tr key={index}>
                                    <td
                                        key={index}
                                        className="pt-entry"
                                        style={{ width: '420px' }}>
                                        <Accordion style={{ width: '420px' }}>
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header className='text-center'>
                                                    <h6
                                                        className='text-left'
                                                        key={purch.id}
                                                    >
                                                        {purch.id}
                                                    </h6>
                                                </Accordion.Header>
                                                    <Accordion.Body>
                                                        <Table className='text-center' striped bordered hover size="sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Item ID</th>
                                                                    <th>Item Description</th>
                                                                    <th>Quantity</th>

                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {purch.product_list.map((prod, index) => (
                                                                    <tr key={index}>
                                                                        <td>{prod.itemId.substring(0,20)}...</td>
                                                                        <td>{prod.itemName}</td>
                                                                        <td>{prod.itemQuantity}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    </td>
                                    <td className="pt-entry text-center">
                                        <h6
                                            className='text-center pt-3'
                                            key={arrTotalPurchase[index]}
                                        >
                                            {arrTotalPurchase[index]}
                                        </h6>

                                    </td>

                                </tr>
                            ))
                            }
                        </tbody>
                        <tbody>
                            <tr>
                                <th className="pth text-center"></th>
                                <th className="pth text-center">{totalPurchase}</th>
                            </tr>
                        </tbody>

                    </Table >
                    :
                    < Table striped bordered hover size="sm" className="records-table light" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">Transaction Number</th>
                                <th className="pth text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={2}>
                                    <Alert
                                        className="text-center"
                                        variant="warning">
                                        No Recorded Purchase Transaction date Today to Display
                                    </Alert>
                                </td>

                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <th className="pth text-center"></th>
                                <th className="pth text-center">{totalPurchase}</th>
                            </tr>
                        </tbody>

                    </Table >
                :
                <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                    <Spinner
                        color1="#b0e4ff"
                        color2="#fff"
                        textColor="rgba(0,0,0, 0.5)"
                        className="w-50 h-50"
                    />
                </div>

        )
    }


    function salesTable() {
        return (
            salesRecordCollection !== undefined ?
                salesRecordCollection.length !== 0 ?
                    < Table striped bordered hover size="sm" className="records-table light" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">Transaction Number</th>
                                <th className="pth text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesRecordCollection.map((sales, index) => (
                                <tr key={index}>
                                    <td
                                        key={index}
                                        className="pt-entry"
                                        style={{ width: '420px' }}>
                                        <Accordion style={{ width: '420px' }}>
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header className='text-center'>
                                                    <h6
                                                        className='text-left'
                                                        key={sales.id}
                                                    >
                                                        {sales.id}
                                                    </h6>
                                                </Accordion.Header>
                                                <Accordion.Body>
                                                    <Table className='text-center' striped bordered hover size="sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Item ID</th>
                                                                <th>Item Description</th>
                                                                <th>Quantity</th>

                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {sales.product_list.map((prod, index) => (
                                                                <tr key={index}>
                                                                    <td>{prod.itemId}</td>
                                                                    <td>{prod.itemName}</td>
                                                                    <td>{prod.itemQuantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                    </td>
                                    <td className="pt-entry text-center">
                                        <h6
                                            className='text-center pt-3'
                                            key={arrTotalSales[index]}
                                        >
                                            {arrTotalSales[index]}
                                        </h6>

                                    </td>

                                </tr>
                            ))
                            }
                        </tbody>
                        <tbody>
                            <tr>
                                <th className="pth text-center"></th>
                                <th className="pth text-center">{totalSales}</th>
                            </tr>
                        </tbody>

                    </Table >
                    :
                    < Table striped bordered hover size="sm" className="records-table light" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">Transaction Number</th>
                                <th className="pth text-center">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={2}>
                                    <Alert
                                        className="text-center"
                                        variant="warning">
                                        No Recorded Sales Transaction date Today to Display
                                    </Alert>
                                </td>

                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <th className="pth text-center"></th>
                                <th className="pth text-center">{totalSales}</th>
                            </tr>
                        </tbody>

                    </Table >
                :
                <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                    <Spinner
                        color1="#b0e4ff"
                        color2="#fff"
                        textColor="rgba(0,0,0, 0.5)"
                        className="w-50 h-50"
                    />
                </div>

        )
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
                                <Tab.Container id="list-group-tabs-example" defaultActiveKey={1}>
                                    <Nav variant="pills" defaultActiveKey={0}>
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
                                            {salesTable()}
                                        </Tab.Pane>
                                        <Tab.Pane eventKey={1}>
                                            {purchaseTable()}
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