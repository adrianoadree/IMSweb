import React from 'react';
import { Table, Form, Button, ListGroup, Card, Tab, FormControl } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { faCircleInfo, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';


function TestPage() {

    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");

    const [docId, setDocId] = useState("xx"); //document Id
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable
    const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection

    const [filteredResults, setFilteredResults] = useState([])

    //needed for analytics

    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    //formula to calculate SafetyStock = (highest daily sales * leadtime in days) - (average daily sales * leadtime)
    //formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage

    //ask user for : leadtime
    //compute for : average daily sales, highest daily sales, 

    //ANALYTICS Datas
    const [highestDailySales, setHighestDailySales] = useState(0); //highest daily sales
    const [averageDailySales, setAverageDailySales] = useState(0); //average daily sales 
    const [totalSales, setTotalSales] = useState(0); // total sales
    const [safetyStock, setSafetyStock] = useState(0); // safetyStock
    const [reorderPoint, setReorderPoint] = useState(0); // ReorderPoint
    const [daysROP, setDaysROP] = useState(0); // days before ReorderPoint
    const [leadtime, setLeadtime] = useState(1); // leadtime


    const [dailySales, setDailySales] = useState(0);


    const [startDate, setStartDate] = useState(new Date(2022, 8, 1));
    const [stringStartDate, setStringStartDate] = useState("");

    const [today, setToday] = useState(new Date());
    const [stringToday, setStringToday] = useState("");


    const [arrDate, setArrDate] = useState([]);
    const [arrDailySales, setArrDailySales] = useState([]);
    const [arrAverageDailySales, setArrAverageDailySales] = useState([]);







    //---------------------FUNCTIONS---------------------

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    //---------------------ANALYTICS COMPUTATIONS---------------------


    //array of dates of transaction of a product
    useEffect(() => {
        var temp = []
        salesRecordCollection.map((sales) => {
            if (!temp.includes(sales.transaction_date)) {
                temp.push(sales.transaction_date);
            }
        })
        setArrDate(temp)
    }, [salesRecordCollection])



    //reset value to default
    useEffect(() => {
        /*setHighestDailySales(0)
        setAverageDailySales(0)
        setTotalSales(0)
        setSafetyStock(0)
        setLeadtime(0)
        setDailySales(0)*/
        let temp = new Date()
        let tempStart = new Date(startDate)
        setStringToday(temp.toISOString().substring(0, 10))
        setStringStartDate(tempStart.toISOString().substring(0, 10))
    }, [docId])

    useEffect(() => {
        let tempStart = new Date(startDate)
        setStringStartDate(tempStart.toISOString().substring(0, 10))
    }, [startDate])


    //loops from start date to current date
    //compute and provides array of totalSales per day
    //compute array of average per day
    useEffect(() => {
        var tempDate
        var totalDailySales = []
        var tempVal = 0
        var tempAverageDailySales = []
        var tempAverage = 0
        var AverageCounter = 0

        while (startDate <= today) {
            tempDate = startDate.toISOString().substring(0, 10)

            if (arrDate.includes(tempDate)) {

                filteredResults.map((value) => {
                    if (value.transaction_date === tempDate) {
                        value.product_list.map((prod) => {
                            tempVal += prod.itemQuantity
                        })
                        AverageCounter++
                    }
                    tempAverage = tempVal / AverageCounter
                })
                totalDailySales.push(tempVal)
                tempAverageDailySales.push(tempAverage)
                tempVal = 0
                tempAverage = 0
                AverageCounter = 0
            }
            setArrDailySales(totalDailySales)
            setArrAverageDailySales(tempAverageDailySales)
            startDate.setDate(startDate.getDate() + 1)
        }


        console.log(docId, " : ", arrDailySales)
        console.log(docId, " : ", arrAverageDailySales)
        console.log(highestDailySales)
        console.log(averageDailySales)
        setStartDate(new Date(2022, 8, 1))
    }, [filteredResults])


    //compute for highestDailySales
    useEffect(() => {
        for (var i = 0; i < arrDailySales.length; i++) {
            if (arrDailySales[i] > highestDailySales) {
                setHighestDailySales(arrDailySales[i])
            }
        }
    }, [arrDailySales])


    //compute for averageDailySales
    useEffect(() => {
        var tempTotal = 0
        arrDailySales.map((val) => {
            tempTotal += val
        })
        setAverageDailySales(tempTotal / arrDailySales.length)
    }, [arrDailySales])

    //compute for total sales
    useEffect(() => {
        var temp = 0;
        filteredResults.map((value) => {
            value.product_list.map((prod) => {
                temp += prod.itemQuantity
            })
        })
        setTotalSales(temp)
    }, [filteredResults])

    //compute safetystock
    useEffect(() => {
        setSafetyStock((highestDailySales * leadtime) - (averageDailySales * leadtime))
        //let x = Math.round(safetyStock)
        //setSafetyStock(x)
    }, [averageDailySales])

    //compute reoderpoint
    useEffect(() => {
        let x = averageDailySales * leadtime
        let y = safetyStock
        let a = (x + y)
        let z = Math.round(a)
        setReorderPoint(z)
    }, [safetyStock])

    //compute days before ROP
    useEffect(() => {
        setDaysROP((stockcardDoc.qty - leadtime) / averageDailySales)
        //let x = Math.round(daysROP)
        //setDaysROP(x)
    }, [averageDailySales])



    //----------------------------------------------------------------

    // --------------------------------- |||||||||||||||||| ---------------------------------

    //---------------------FIRESTORE QUERY---------------------

    //read stockcard collection
    useEffect(() => {
        if (userID === undefined) {

            const collectionRef = collection(db, "stockcard")
            const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {

            const collectionRef = collection(db, "stockcard")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;

        }

    }, [userID])


    //access stockcard document
    useEffect(() => {
        async function readStockcardDoc() {
            const stockcardRef = doc(db, "stockcard", docId)
            const docSnap = await getDoc(stockcardRef)
            if (docSnap.exists()) {
                setStockcardDoc(docSnap.data());
            }
        }
        readStockcardDoc()
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


    //query documents from sales_record that contains docId
    useEffect(() => {

        setFilteredResults(salesRecordCollection.map((element) => {
            return {
                ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === docId)
            }
        }))

    }, [salesRecordCollection])

    //---------------------------------------------------------


    //-------------------------------TOOL TIPS-------------------------------

    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Simple tooltip
        </Tooltip>
    );

    const leadTimeTooltip = (props) => (
        <Tooltip id="LeadTime" {...props}>
            Lead time is the amount of days it takes for your vendor to fulfill
            your order
        </Tooltip>
    );

    const ROPToolTip = (props) => (
        <Tooltip id="ROP" {...props}>
            A reorder point (ROP) is the specific level at which your stock needs to be
            replenished. In other words, it tells you when to place an order so you don’t run out of an
            item.
        </Tooltip>
    );


    const safetystockTooltip = (props) => (
        <Tooltip id="safetystock" {...props}>
            This is the extra quantity of a product that kept in storage to prevent stockouts.  Safety stock serves as insurance against demand fluctuations.
        </Tooltip>
    );

    const NdaysROPTooltip = (props) => (
        <Tooltip id="ndaysROP" {...props}>
            The number of days the before the product reaches ReorderPoint(ROP)
        </Tooltip>
    );

    const averageSalesTooltip = (props) => (
        <Tooltip id="averageSales" {...props}>
            The average number of units being sold within a day
        </Tooltip>
    );

    const highestSalesTooltip = (props) => (
        <Tooltip id="highestSales" {...props}>
            The highest number of units being sold within a day
        </Tooltip>
    );

    const totalSalesTooltip = (props) => (
        <Tooltip id="totalSales" {...props}>
            The total number of units sold
        </Tooltip>
    );
    //-----------------------------------------------------------------------


    return (

        <div className="row bg-light">
            <Navigation />

            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div className="row contents">
                    <div className="row py-4 px-5">
                        <div className="sidebar">
                            <Card className='sidebar-card'>
                                <Card.Header>
                                    <div className='row'>
                                        <div className="col-1 left-full-curve">
                                            <Button className="fc-search no-click me-0">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </Button>
                                        </div>
                                        <div className="col-11">
                                            <FormControl
                                                placeholder="Search"
                                                aria-label="Search"
                                                aria-describedby="basic-addon2"
                                                className="fc-search right-full-curve mw-0"
                                            />
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row g-1 sidebar-header">
                                        <div className="col-4 left-curve">
                                            Item Code
                                        </div>
                                        <div className="col-8 right-curve">
                                            Description
                                        </div>
                                    </div>
                                    <div className='scrollbar'>
                                        <ListGroup variant="flush">
                                            {stockcard.map((stockcard) => {
                                                return (
                                                    <ListGroup.Item
                                                        action
                                                        key={stockcard.id}
                                                        eventKey={stockcard.id}
                                                        onClick={() => { setDocId(stockcard.id) }}>
                                                        <div className="row gx-0 sidebar-contents">
                                                            <div className="col-4">
                                                                {stockcard.id}
                                                            </div>
                                                            <div className="col-8">
                                                                {stockcard.description}
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                )
                                            })}

                                        </ListGroup>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="divider">

                        </div>
                        <div className="data-contents">
                            <Tab.Content>
                                <Tab.Pane eventKey={0}>
                                    <div className="row">
                                        <div className="row p-3 m-0" style={{ height: "200px" }}>
                                            <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                                            </h1>
                                            <hr />

                                            <div className="row m-0 mt-2 mb-4 px-5 py-2 yellow-strip">
                                                <div className="row p1 text-center">
                                                    <div className="col-3">
                                                        Item Code
                                                    </div>
                                                    <div className="col-7">
                                                        Item Description
                                                    </div>
                                                    <div className="col-2">
                                                        Available Stock
                                                    </div>
                                                </div>
                                                <hr className="yellow-strip-divider"></hr>
                                                <div className="row my-2">
                                                    <div className="col-3 text-center">
                                                        <h5><strong></strong></h5>
                                                    </div>
                                                    <div className="col-7 text-center">
                                                        <h5><strong></strong></h5>
                                                    </div>
                                                    <div className="col-2 text-center">
                                                        <h5><strong></strong></h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row pt-2 pb-1 px-5">
                                            <hr />
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={NdaysROPTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                N Days Before ROP <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>day(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>

                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={ROPToolTip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                ReorderPoint <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>

                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={safetystockTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header
                                                            className="text-center text-white"
                                                        >
                                                            <small>
                                                                Safety Stock <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                        </div>

                                        <div className="row pt-2 pb-1 px-5">
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={averageSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Average Daily Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={highestSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Highest Daily Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={totalSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Total Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                        </div>

                                    </div>




                                </Tab.Pane>
                                <Tab.Pane eventKey={docId}>
                                    <div className="row">
                                        <div className="row p-3 m-0" style={{ height: "200px" }}>
                                            <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                                            </h1>
                                            <hr />

                                            <div className="row m-0 mt-2 mb-4 px-5 py-2 yellow-strip">
                                                <div className="row p1 text-center">
                                                    <div className="col-3">
                                                        Item Code
                                                    </div>
                                                    <div className="col-7">
                                                        Item Description
                                                    </div>
                                                    <div className="col-2">
                                                        Available Stock
                                                    </div>
                                                </div>
                                                <hr className="yellow-strip-divider"></hr>
                                                <div className="row my-2">
                                                    <div className="col-3 text-center">
                                                        <h5><strong>{docId}</strong></h5>
                                                    </div>
                                                    <div className="col-7 text-center">
                                                        <h5><strong>{stockcardDoc.description}</strong></h5>
                                                    </div>
                                                    <div className="col-2 text-center">
                                                        <h5><strong>{stockcardDoc.qty}</strong></h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row pt-2 pb-1 px-5">
                                            <hr />
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={NdaysROPTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                N Days Before ROP <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{daysROP} day(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>

                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={ROPToolTip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                ReorderPoint <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{reorderPoint} unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>

                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={safetystockTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header
                                                            className="text-center text-white"
                                                        >
                                                            <small>
                                                                Safety Stock <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{safetyStock} unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                        </div>

                                        <div className="row pt-2 pb-1 px-5">
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={averageSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Average Daily Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{averageDailySales} unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={highestSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Highest Daily Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{highestDailySales} unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                            <div className="col-4">
                                                <OverlayTrigger
                                                    placement="right"
                                                    delay={{ show: 250, hide: 400 }}
                                                    overlay={totalSalesTooltip}
                                                >
                                                    <Card className="bg-dark">
                                                        <Card.Header className="text-center text-white">
                                                            <small>
                                                                Total Sales <FontAwesomeIcon icon={faCircleInfo} />
                                                            </small>
                                                        </Card.Header>
                                                        <Card.Body
                                                            className="text-white text-center"
                                                            style={{ height: "50px" }}>
                                                            <h5>{totalSales} unit(s)</h5>
                                                        </Card.Body>
                                                    </Card>
                                                </OverlayTrigger>
                                            </div>
                                        </div>

                                    </div>




                                </Tab.Pane>
                            </Tab.Content>
                        </div>
                    </div>
                </div>
            </Tab.Container>
        </div >
    )

}

export default TestPage;