import { useEffect } from "react";
import Navigation from "../layout/Navigation";
import Barcode from 'react-jsbarcode'
import { Card, Table, OverlayTrigger, Alert, Tooltip, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "react-bootstrap";
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, Delive } from 'react-ionicons'
import { UserAuth } from '../context/AuthContext'
import { db } from '../firebase-config';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';


function TestPage() {
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [docId, setDocId] = useState("IT100016"); //document Id
    const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); // sales_record collection
    const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    //query documents from purchase_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "purchase_record")
        const q = query(collectionRef, where("product_ids", "array-contains", docId));

        const unsub = onSnapshot(q, (snapshot) =>
            setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [docId])


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("product_ids", "array-contains", docId));

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [docId])


    const salesQuantityReport = (props) => (
        <Tooltip id="salesQuantityReport" className="tooltipBG" {...props}>
            Displays a Report containing: Transaction Number, Date of Transaction, Quantity of a certain transaction
        </Tooltip>
    );

    // ==================================== START OF REPORT GENERATION ====================================

    // =============================== START OF PURCHASE REPORT FUNCTIONS ===============================

    const [purchaseReport, setPurchaseReport] = useState()
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [reportTotalPurchase, setReportTotalPurchase] = useState(0)

    const [filteredPurchaseReport, setFilteredPurchaseReport] = useState()
    const [startDateHolder, setStartDateHolder] = useState()
    const [endDateHolder, setEndDateHolder] = useState()

    const [purchaseReportHeaderBoolean, setPurchaseReportHeaderBoolean] = useState(true)


    //reset state values
    useEffect(() => {
        setPurchaseReport()
        setReportTotalPurchase(0)
        setDateRange(([null, null]))
    }, [docId])

    useEffect(() => {
        setStart(startDate)
        setEnd(endDate)
    }, [dateRange])



    useEffect(() => {

        if (start && end !== null) {


            start.setDate(start.getDate() + 1)
            end.setDate(end.getDate() + 2)
            let tempTotal = 0
            let tempDate
            let tempIDArr = []
            let tempQuantityArr = []
            let tempDateArr = []

            let tempArrReport = [{}]

            while (start < end) {
                tempDate = start.toISOString().substring(0, 10)
                purchaseRecordCollection.map((purch) => {
                    if (purch.transaction_date === tempDate && userID === purch.user) {
                        purch.product_list.map((prod) => {
                            if (prod.itemId === docId) {
                                tempTotal += prod.itemQuantity
                                tempIDArr.push(purch.transaction_number)
                                tempDateArr.push(purch.transaction_date)
                                tempQuantityArr.push(prod.itemQuantity)
                                tempArrReport.push({ ID: purch.transaction_number, Date: purch.transaction_date, Quantity: prod.itemQuantity })
                            }
                        })
                    }
                })
                start.setDate(start.getDate() + 1)
            }
            setPurchaseReport(tempArrReport)
            setReportTotalPurchase(tempTotal)
        }

    }, [end])



    useEffect(() => {
        if (purchaseReport !== undefined) {
            const results = purchaseReport.filter(element => {
                if (Object.keys(element).length !== 0) {
                    return true;
                }
                return false;
            });

            setFilteredPurchaseReport(results)
        }
    }, [purchaseReport])


    useEffect(() => {
        if (startDate !== null) {
            let x = new Date(startDate)
            let tempDate = new Date()

            if (x !== null) {
                tempDate = x
                setStartDateHolder(tempDate)
            }
        }
    }, [startDate])


    useEffect(() => {
        if (endDate !== null) {
            let x = new Date(endDate)
            let tempDate = new Date()

            if (x !== null) {
                tempDate = x
                setEndDateHolder(tempDate)
            }
        }
    }, [endDate])



    useEffect(() => {
        if (filteredPurchaseReport !== undefined) {
            if (filteredPurchaseReport.length === 0) {
                setPurchaseReportHeaderBoolean(true)
            }
            else {
                setPurchaseReportHeaderBoolean(false)
            }
        }
    }, [filteredPurchaseReport])


    useEffect(() => {
        if (filteredPurchaseReport !== undefined) {
            if (filteredPurchaseReport.length === 0) {
                setDateRange([null], [null])
            }
        }
    }, [filteredPurchaseReport])


    //-----------------PURCHASE REPORT HEADER FUNCTIONS-----------------
    function reportPurchaseHeader() {
        if (filteredPurchaseReport !== undefined) {
            return (
                <>
                    {filteredPurchaseReport.length !== 0 ?
                        reportPurchaseHeaderTrue()
                        :
                        reportPurchaseHeaderFalse()
                    }
                </>
            )
        }
    }


    function reportPurchaseHeaderTrue() {
        return (
            <>
                <div className='row'>
                    <div className='row text-center'>
                        <div className='row p-3'>
                            <h4 className='text-primary'>PURCHASE TRANSACTION REPORT <br />FOR DATE(S)</h4>
                        </div>
                        <div className='row'>
                            <span>
                                <strong>{moment(startDateHolder).format('ll')}</strong> to <strong>{moment(endDateHolder).format('ll')}</strong>
                                <Button
                                    className='ml-2'
                                    size='sm'
                                    variant="outline-primary"
                                    onClick={() => { setStart(new Date()); setEnd(new Date()); }}
                                >
                                    reset
                                </Button>
                            </span>

                        </div>
                    </div>
                </div>
            </>
        )
    }


    function reportPurchaseHeaderFalse() {
        return (
            <div>

                <div className="row py-1 m-0 mb-2">
                    <span>
                        <InformationCircle
                            className="me-2 pull-down"
                            color={'#0d6efd'}
                            title={'Category'}
                            height="40px"
                            width="40px"
                        />
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 250, hide: 400 }}
                            overlay={salesQuantityReport}
                        >
                            <h4 className="data-id">PURCHASE TRANSACTION REPORT</h4>
                        </OverlayTrigger>
                    </span>

                </div>
                <div className='row text-center mb-2'>
                    <label>Date-Range to Report</label>
                    <DatePicker
                        placeholderText='Enter Date-Range'
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                        }}
                        withPortal
                    />
                </div>
            </div>

        )
    }
    //------------------------------------------------------------------

    //-----------------PURCHASE REPORT BODY FUNCTIONS-----------------

    function reportPurchaseBody() {
        if (filteredPurchaseReport !== undefined) {
            return (
                <div>
                    <Table striped bordered hover>
                        <thead>
                            <tr className='text-center'>
                                <th>Date</th>
                                <th>Transaction Number</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {filteredPurchaseReport.length === 0 ?
                                <tr>
                                    <td colSpan={3}>
                                        <Alert variant='warning'>
                                            <strong>No Transaction to Report</strong>
                                        </Alert>
                                    </td>
                                </tr>
                                :
                                <>{
                                    filteredPurchaseReport.map((purch, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{moment(purch.Date).format('ll')}</td>
                                                <td>{purch.ID}</td>
                                                <td>{purch.Quantity}</td>
                                            </tr>
                                        )
                                    })}
                                </>

                            }
                            <tr>
                                <td colSpan={2}><strong>Total</strong></td>
                                <td><strong>{reportTotalPurchase} units</strong></td>
                            </tr>
                        </tbody>
                    </Table >
                </div>
            )
        }
    }


    //------------------------------------------------------------------


    function reportPurchaseCard() {
        return (
            <Card>
                <Card.Header className='bg-white'>
                    {reportPurchaseHeader()}
                </Card.Header>
                <Card.Body className='bg-white'>
                    {reportPurchaseBody()}
                </Card.Body>
            </Card>
        )
    }
    // =============================== END OF PURCHASE REPORT FUNCTIONS ===============================


    // =============================== START OF SALES REPORT FUNCTIONS ===============================


    const [salesDateRange, setSalesDateRange] = useState([null, null]);
    const [salesStartDate, salesEndDate] = salesDateRange;
    const [reportTotalSales, setReportTotalSales] = useState(0)
    const [salesReport, setSalesReport] = useState()
    const [filteredSalesReport, setFilteredSalesReport] = useState()

    const [salesStart, setSalesStart] = useState(new Date());
    const [salesEnd, setSalesEnd] = useState(new Date());

    const [salesStartDateHolder, setSalesStartDateHolder] = useState()
    const [salesEndDateHolder, setSalesEndDateHolder] = useState()



    useEffect(() => {
        setSalesStart(salesStartDate)
        setSalesEnd(salesEndDate)
    }, [salesDateRange])



    useEffect(() => {
        if (salesStartDate !== null) {
            let x = new Date(salesStartDate)
            let tempDate = new Date()

            if (x !== null) {
                tempDate = x
                setSalesStartDateHolder(tempDate)
            }
        }
    }, [salesStartDate])


    useEffect(() => {
        if (salesEndDate !== null) {
            let x = new Date(salesEndDate)
            let tempDate = new Date()

            if (x !== null) {
                tempDate = x
                setSalesEndDateHolder(tempDate)
            }
        }
    }, [salesEndDate])




    useEffect(() => {
        if (salesReport !== undefined) {
            const results = salesReport.filter(element => {
                if (Object.keys(element).length !== 0) {
                    return true;
                }
                return false;
            });

            setFilteredSalesReport(results)
        }
    }, [salesReport])



    useEffect(() => {
        if (filteredSalesReport !== undefined) {
            if (filteredSalesReport.length === 0) {
                setSalesDateRange([null], [null])
            }
        }
    }, [filteredSalesReport])



    useEffect(() => {

        if (salesStart && salesEnd !== null) {


            salesStart.setDate(salesStart.getDate() + 1)
            salesEnd.setDate(salesEnd.getDate() + 2)
            let tempTotal = 0
            let tempDate
            let tempIDArr = []
            let tempQuantityArr = []
            let tempDateArr = []

            let tempArrReport = [{}]

            while (salesStart < salesEnd) {
                tempDate = salesStart.toISOString().substring(0, 10)
                salesRecordCollection.map((sales) => {
                    if (sales.transaction_date === tempDate && userID === sales.user) {
                        sales.product_list.map((prod) => {
                            if (prod.itemId === docId) {
                                tempTotal += prod.itemQuantity
                                tempIDArr.push(sales.transaction_number)
                                tempDateArr.push(sales.transaction_date)
                                tempQuantityArr.push(prod.itemQuantity)
                                tempArrReport.push({ ID: sales.transaction_number, Date: sales.transaction_date, Quantity: prod.itemQuantity })
                            }
                        })
                    }
                })
                salesStart.setDate(salesStart.getDate() + 1)
            }
            setSalesReport(tempArrReport)
            setReportTotalSales(tempTotal)
        }

    }, [salesEnd])






    // --------------------------- START OF SALES REPORT HEADER FUNCTIONS ---------------------------

    function reportSalesHeader() {
        if (filteredSalesReport !== undefined) {
            return (
                <>
                    {filteredSalesReport.length !== 0 ?
                        reportSalesHeaderTrue()
                        :
                        reportSalesHeaderFalse()
                    }
                </>
            )
        }
    }


    function reportSalesHeaderTrue() {
        return (
            <>
                <div className='row'>
                    <div className='row text-center'>
                        <div className='row p-3'>
                            <h4 className='text-primary'>SALES TRANSACTION REPORT <br />FOR DATE(S)</h4>
                        </div>
                        <div className='row'>
                            <span>
                                <strong>{moment(salesStartDateHolder).format('ll')}</strong> to <strong>{moment(salesEndDateHolder).format('ll')}</strong>
                                <Button
                                    className='ml-2'
                                    size='sm'
                                    variant="outline-primary"
                                    onClick={() => { setSalesStart(new Date()); setSalesEnd(new Date()); }}
                                >
                                    reset
                                </Button>
                            </span>

                        </div>
                    </div>
                </div>
            </>
        )
    }

    function reportSalesHeaderFalse() {
        return (
            <div>

                <div className="row py-1 m-0 mb-2">
                    <span>
                        <InformationCircle
                            className="me-2 pull-down"
                            color={'#0d6efd'}
                            title={'Category'}
                            height="40px"
                            width="40px"
                        />
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 250, hide: 400 }}
                            overlay={salesQuantityReport}
                        >
                            <h4 className="data-id">SALES TRANSACTION REPORT</h4>
                        </OverlayTrigger>
                    </span>

                </div>
                <div className='row text-center mb-2'>
                    <label>Date-Range to Report</label>
                    <DatePicker
                        placeholderText='Enter Date-Range'
                        selectsRange={true}
                        startDate={salesStartDate}
                        endDate={salesEndDate}
                        onChange={(update) => {
                            setSalesDateRange(update);
                        }}
                        withPortal
                    />
                </div>
            </div>

        )
    }
    // ---------------------------- END OF SALES REPORT HEADER FUNCTIONS ----------------------------

    // ---------------------------- START OF SALES REPORT BODY FUNCTIONS ----------------------------


    function reportSalesBody() {
        if (filteredSalesReport !== undefined) {
            return (
                <div>
                    <Table striped bordered hover>
                        <thead>
                            <tr className='text-center'>
                                <th>Date</th>
                                <th>Transaction Number</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {filteredSalesReport.length === 0 ?
                                <tr>
                                    <td colSpan={3}>
                                        <Alert variant='warning'>
                                            <strong>No Transaction to Report</strong>
                                        </Alert>
                                    </td>
                                </tr>
                                :
                                <>{
                                    filteredSalesReport.map((sales, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{moment(sales.Date).format('ll')}</td>
                                                <td>{sales.ID}</td>
                                                <td>{sales.Quantity}</td>
                                            </tr>
                                        )
                                    })}
                                </>

                            }
                            <tr>
                                <td colSpan={2}><strong>Total</strong></td>
                                <td><strong>{reportTotalSales} units</strong></td>
                            </tr>
                        </tbody>
                    </Table >
                </div>
            )
        }
    }

    // ------------------------------ END OF SALES REPORT BODY FUNCTIONS -----------------------------

    function reportSalesCard() {
        return (
            <Card>
                <Card.Header className='bg-white'>
                    {reportSalesHeader()}
                </Card.Header>
                <Card.Body className='bg-white'>
                    {reportSalesBody()}
                </Card.Body>
            </Card>
        )
    }
    // ================================ END OF SALES REPORT FUNCTIONS ================================




    // ===================================== END OF REPORT GENERATION =====================================

    const [reportBooleanValue, setReportBooleanValue] = useState(true)
    const handleReportBooleanChange = (val) => setReportBooleanValue(val);


    return (
        <div>
            <Navigation />
            <div className="row">
                <div className="col-6 p-5">
                    {reportPurchaseCard()}
                    {reportSalesCard()}
                </div>

                <div className="col-6 p-5">
                    <ToggleButtonGroup type="radio" name='reportBooleanButton' value={reportBooleanValue} onChange={handleReportBooleanChange}>
                        <ToggleButton 
                        id="tbg-btn-1" 
                        variant="outline-primary"
                        value={true}>
                            Option 1
                        </ToggleButton>
                        <ToggleButton 
                        id="tbg-btn-2" 
                        variant="outline-primary"
                        value={false}>
                            Option 2
                        </ToggleButton>
                    </ToggleButtonGroup>
                    {reportBooleanValue? 
                    <p>true</p>
                    :
                    <p>False</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default TestPage;