import React from 'react';
import { Table, Form, Button, ListGroup, Card, Tab, FormControl, Accordion, Alert } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { faCircleInfo, faSearch, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ToolTip from 'react-bootstrap/Tooltip';
import { LineChart, Line, XAxis, YAxis, ReferenceDot, Legend, Tooltip, Label, ReferenceLine } from 'recharts';
import { Link } from 'react-router-dom';






function Itemforecast() {

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


    const [minLeadtime, setMinLeadtime] = useState(0)
    const [maxLeadtime, setMaxLeadtime] = useState(0)
    const [averageLeadtime, setAverageLeadtime] = useState(0)


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

    //initiate leadtime values
    useEffect(() => {
        setMinLeadtime(stockcardDoc.analytics_minLeadtime)
        setMaxLeadtime(stockcardDoc.analytics_maxLeadtime)
    }, [stockcardDoc])


    //initiate leadtime values
    useEffect(() => {
        setAverageLeadtime((maxLeadtime + minLeadtime) / 2)
    }, [maxLeadtime])

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

    const [temporaryDate, setTemporaryDate] = useState(new Date())

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
    }, [filteredResults])


    //reset value to default
    useEffect(() => {
        setHighestDailySales(0)
    }, [filteredResults])

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
        today.setDate(today.getDate() + 14)

        while (startDate < today) {
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


        var tempEndDate = new Date(today.setDate(today.getDate() + 14))

        setToday(tempEndDate)
        setStartDate(new Date(2022, 8, 1))
    }, [filteredResults])

    const [sortedTransactionDates, setSortedTransactionDates] = useState([])

    //sort array of transaction dates
    useEffect(() => {
        let temp = arrDate.sort()
        setSortedTransactionDates(temp)
    }, [arrDate])


    //compute for averageDailySales
    useEffect(() => {
        var tempTotal = 0
        arrDailySales.map((val) => {
            tempTotal += val
        })
        let x = (tempTotal / arrDailySales.length)
        setAverageDailySales(Math.round(x))
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

    //compute for highestDailySales
    useEffect(() => {
        var temp = 0;
        filteredResults.map((value) => {
            value.product_list.map((prod) => {
                if (temp < prod.itemQuantity) {
                    temp = prod.itemQuantity
                }
            })
        })
        setHighestDailySales(temp)
    }, [arrDailySales])

    //compute safetystock
    //formula to calculate SafetyStock = (highest daily sales * leadtime in days) - (average daily sales * leadtime)
    useEffect(() => {
        let x = highestDailySales * maxLeadtime
        let y = averageDailySales * averageLeadtime
        let z = Math.round(x - y)
        setSafetyStock(z)
    }, [averageDailySales])

    //compute reoderpoint
    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    useEffect(() => {
        let x = averageDailySales * averageLeadtime
        let y = safetyStock
        let a = (x + y)
        let z = Math.round(a)
        setReorderPoint(z)
    }, [safetyStock])

    //compute days before ROP
    //formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage
    useEffect(() => {
        let x = stockcardDoc.qty - reorderPoint
        let y = averageDailySales
        let a = (x / y)
        let z = Math.round(a)
        setDaysROP(z)
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

    const leadTimeTooltip = (props) => (
        <ToolTip id="LeadTime" className="tooltipBG" {...props}>
            Lead time is the amount of days it takes for your vendor to fulfill
            your order
        </ToolTip>
    );

    const ROPToolTip = (props) => (
        <ToolTip className="tooltipBG" id="ROP" style={{ color: 'yellow' }} {...props}>
            A reorder point (ROP) is the specific level at which your stock needs to be
            replenished. In other words, it tells you when to place an order so you don’t run out of an
            item.
        </ToolTip>
    );


    const safetystockTooltip = (props) => (
        <ToolTip id="safetystock" className="tooltipBG" {...props}>
            This is the extra quantity of a product that kept in storage to prevent stockouts.  Safety stock serves as insurance against demand fluctuations.
        </ToolTip>
    );

    const NdaysROPTooltip = (props) => (
        <ToolTip id="ndaysROP" className="tooltipBG"{...props}>
            The number of days the before the product reaches ReorderPoint(ROP)
        </ToolTip>
    );

    const averageSalesTooltip = (props) => (
        <ToolTip id="averageSales" className="tooltipBG" {...props}>
            The average number of units being sold within a day
        </ToolTip>
    );

    const highestSalesTooltip = (props) => (
        <ToolTip id="highestSales" className="tooltipBG" {...props}>
            The highest number of units being sold within a day
        </ToolTip>
    );

    const totalSalesTooltip = (props) => (
        <ToolTip id="totalSales" className="tooltipBG" {...props}>
            The total number of units sold
        </ToolTip>
    );
    //-----------------------------------------------------------------------



    //----------------------------CHART FUNCTIONS----------------------------




    function displayAccordion() {

        const CustomReferenceDot = props => {
            return (
                <circle cx={props.cx} r="10" cy={props.cy} fill="gold">
                    <animate
                        attributeName="r"
                        from="8"
                        to="20"
                        dur="1.5s"
                        begin="0s"
                        repeatCount="indefinite"
                    />
                </circle>
            );
        };

        return (

            maxLeadtime !== 0 ?
                <>
                    <div>
                        <Accordion defaultActiveKey="0" className="mt-2">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><h6>Stock Level Projection Chart</h6></Accordion.Header>
                                <Accordion.Body>
                                    <LineChart
                                        width={600}
                                        height={400}
                                        data={data}
                                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                    >
                                        <XAxis dataKey="date">
                                        </XAxis>
                                        <YAxis label={{ value: 'Stock Level', angle: -90, position: 'insideLeft', textAnchor: 'middle' }} />
                                        <Tooltip />
                                        <Legend />
                                        <ReferenceLine y={reorderPoint}
                                            label={{ value: 'ReorderPoint', position: 'insideLeft', textAnchor: 'middle' }}
                                            stroke="green" strokeDasharray="3 3" />
                                        <ReferenceLine y={safetyStock}
                                            label={{ value: 'SafetyStock', position: 'insideLeft', textAnchor: 'middle' }}
                                            stroke="yellow" strokeDasharray="3 3" />
                                        <Line type="monotone" dataKey="StockLevel" stroke="green"
                                            dot={{ stroke: '#8884d8', strokeWidth: 1, r: 10, strokeDasharray: '' }}
                                        />
                                        <Line type="monotone" dataKey="ProjectedStockLevel" stroke="blue"
                                            dot={{ stroke: '#blue', strokeWidth: 1, r: 10, strokeDasharray: '' }}
                                        />
                                    </LineChart>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        <Accordion defaultActiveKey="1">
                            <Accordion.Item eventKey="1">
                                <Accordion.Header><h6>Inventory Projection Statistical Tools</h6></Accordion.Header>
                                <Accordion.Body>

                                    <div className="row pt-2 pb-1 px-3">
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
                                                placement="left"
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

                                    <div className="row pt-2 pb-1 px-3">
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
                                                placement="left"
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

                                    <div className="row pt-2 pb-1 px-3">
                                        <div className="col-4">
                                            <OverlayTrigger
                                                placement="left"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={totalSalesTooltip}
                                            >
                                                <Card className="bg-dark">
                                                    <Card.Header className="text-center text-white">
                                                        <small>
                                                            Minimum Leadtime <FontAwesomeIcon icon={faCircleInfo} />
                                                        </small>
                                                    </Card.Header>
                                                    <Card.Body
                                                        className="text-white text-center"
                                                        style={{ height: "50px" }}>
                                                        <h5>{minLeadtime} day(s)</h5>
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
                                                            Maximum Leadtime <FontAwesomeIcon icon={faCircleInfo} />
                                                        </small>
                                                    </Card.Header>
                                                    <Card.Body
                                                        className="text-white text-center"
                                                        style={{ height: "50px" }}>
                                                        <h5>{maxLeadtime} day(s)</h5>
                                                    </Card.Body>
                                                </Card>
                                            </OverlayTrigger>
                                        </div>
                                        <div className="col-4">
                                            <OverlayTrigger
                                                placement="right"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={averageSalesTooltip}
                                            >
                                                <Card className="bg-dark">
                                                    <Card.Header className="text-center text-white">
                                                        <small>
                                                            Average Leadtime <FontAwesomeIcon icon={faCircleInfo} />
                                                        </small>
                                                    </Card.Header>
                                                    <Card.Body
                                                        className="text-white text-center"
                                                        style={{ height: "50px" }}>
                                                        <h5>{averageLeadtime} day(s)</h5>
                                                    </Card.Body>
                                                </Card>
                                            </OverlayTrigger>
                                        </div>
                                    </div>

                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        <Accordion>
                            <Accordion.Item>
                                <Accordion.Header>
                                    DATA COMPILATION
                                </Accordion.Header>
                                <Accordion.Body>
                                    <div className='row'>

                                        <div className='col-3'>
                                            Array of Transaction Dates
                                            <ul>
                                                {arrDate.map((date) => {
                                                    return (
                                                        <li key={date}>{date}</li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                        <div className='col-3'>
                                            Array of Total Daily Sales
                                            {arrDailySales.map((daily) => {
                                                return (
                                                    <li key={daily}>{daily}</li>
                                                )
                                            })}
                                        </div>

                                        <div className='col-3'>
                                            Sorted Array of Total Daily Sales
                                            {sortedTransactionDates.map((sorted) => {
                                                return (
                                                    <li key={sorted}>{sorted}</li>
                                                )
                                            })}
                                        </div>
                                        <div className='col-3'>
                                            {sortedTransactionDates[0]}
                                        </div>
                                    </div>


                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                    </div >
                </>

                :
                <div className='mt-2 p-3'>
                    <Alert variant="danger">
                        <Alert.Heading className='text-center'>Setup Product Leadtime</Alert.Heading>
                        <p className="text-center">
                            Forecasting only works when the product <strong>leadtime</strong> has been set. to set product leadtime go to  <Alert.Link as={Link} to="/stockcard">Stockcard Page</Alert.Link>.
                        </p>
                    </Alert>
                </div>




        )
    }

    function displayChartError() {
        return (
            <div className='mt-2 p-3'>
                <Alert variant="danger">
                    <Alert.Heading className="text-center">
                        PREREQUISITE FOR FORECASTING
                    </Alert.Heading>
                    <p className="text-center">
                        Forecasting only works when the product <strong>leadtime</strong> has been set. to set product leadtime go to  <Alert.Link as={Link} to="/stockcard">Stockcard Page</Alert.Link>. <br />
                        and the product needs to have more than <strong>5 days</strong> existing sales transaction. to create a sales transaction, go to <Alert.Link as={Link} to="/salesrecord">Sales Record</Alert.Link>. <br />
                    </p>
                </Alert>
            </div>
        )
    }

    //-----------------------------------------------------------------------


    //-------------------------------Chart Data function-------------------------
    const [transactionDatesChecker, setTransactionDatesChecker] = useState(false)


    useEffect(() => {
        if (sortedTransactionDates.length >= 5) {
            setTransactionDatesChecker(true)
        } else {
            setTransactionDatesChecker(false)
        }
    }, [sortedTransactionDates])


    const [date1, setDate1] = useState("")
    const [date2, setDate2] = useState("")
    const [date3, setDate3] = useState("")
    const [date4, setDate4] = useState("")
    const [date5, setDate5] = useState("")

    useEffect(() => {
        if (sortedTransactionDates.length >= 5) {
            setDate1(sortedTransactionDates[sortedTransactionDates.length - 1])
            setDate2(sortedTransactionDates[sortedTransactionDates.length - 2])
            setDate3(sortedTransactionDates[sortedTransactionDates.length - 3])
            setDate4(sortedTransactionDates[sortedTransactionDates.length - 4])
            setDate5(sortedTransactionDates[sortedTransactionDates.length - 5])
        }
        else {
            setDate1("")
            setDate2("")
            setDate3("")
            setDate4("")
            setDate5("")
        }
    }, [sortedTransactionDates])


    useEffect(() => {
        console.log(date1, date2, date3, date4, date5)
    }, [date1])


    // ---------------------------------Q1 DATA---------------------------------

    const [query1, setQuery1] = useState([{}])
    const [q1ProductList, setQ1ProductList] = useState([{}])
    const [q1Quantity, setQ1Quantity] = useState(0)
    const [q1Date, setQ1Date] = useState("")


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("transaction_date", "==", date1));

        const unsub = onSnapshot(q, (snapshot) =>
            setQuery1(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [date1])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query1.length !== 0) {

            query1.map((q1) => {
                setQ1ProductList(q1.product_list)
            })

        }
    }, [query1])

    useEffect(() => {
        if (q1ProductList !== undefined) {
            q1ProductList.map((q1) => {
                if (q1.itemId === docId) {
                    setQ1Date(date1)
                    setQ1Quantity(q1.itemNewQuantity)
                }
            })
        }
    }, [q1ProductList])


    // -------------------------------------------------------------------------

    // ---------------------------------Q2 DATA---------------------------------

    const [query2, setQuery2] = useState([{}])
    const [q2ProductList, setQ2ProductList] = useState([{}])
    const [q2Quantity, setQ2Quantity] = useState(0)
    const [q2Date, setQ2Date] = useState("")


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("transaction_date", "==", date2));

        const unsub = onSnapshot(q, (snapshot) =>
            setQuery2(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [date2])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query2.length !== 0) {

            query2.map((q2) => {
                setQ2ProductList(q2.product_list)
            })

        }
    }, [query2])

    useEffect(() => {
        if (q2ProductList !== undefined) {
            q2ProductList.map((q2) => {
                if (q2.itemId === docId) {
                    setQ2Date(date2)
                    setQ2Quantity(q2.itemNewQuantity)
                }
            })
        }
    }, [q2ProductList])
    // -------------------------------------------------------------------------

    // ---------------------------------Q3 DATA---------------------------------

    const [query3, setQuery3] = useState([{}])
    const [q3ProductList, setQ3ProductList] = useState([{}])
    const [q3Quantity, setQ3Quantity] = useState(0)
    const [q3Date, setQ3Date] = useState("")


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("transaction_date", "==", date3));

        const unsub = onSnapshot(q, (snapshot) =>
            setQuery3(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [date3])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query3.length !== 0) {

            query3.map((q3) => {
                setQ3ProductList(q3.product_list)
            })

        }
    }, [query3])

    useEffect(() => {
        if (q3ProductList !== undefined) {
            q3ProductList.map((q3) => {
                if (q3.itemId === docId) {
                    setQ3Date(date3)
                    setQ3Quantity(q3.itemNewQuantity)
                }
            })
        }
    }, [q3ProductList])
    // -------------------------------------------------------------------------

    // ---------------------------------Q4 DATA---------------------------------

    const [query4, setQuery4] = useState([{}])
    const [q4ProductList, setQ4ProductList] = useState([{}])
    const [q4Quantity, setQ4Quantity] = useState(0)
    const [q4Date, setQ4Date] = useState("")


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("transaction_date", "==", date4));

        const unsub = onSnapshot(q, (snapshot) =>
            setQuery4(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [date4])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query4.length !== 0) {

            query4.map((q4) => {
                setQ4ProductList(q4.product_list)
            })

        }
    }, [query4])

    useEffect(() => {
        if (q4ProductList !== undefined) {
            q4ProductList.map((q4) => {
                if (q4.itemId === docId) {
                    setQ4Date(date4)
                    setQ4Quantity(q4.itemNewQuantity)
                }
            })
        }
    }, [q4ProductList])
    // -------------------------------------------------------------------------

    // ---------------------------------Q5 DATA---------------------------------

    const [query5, setQuery5] = useState([{}])
    const [q5ProductList, setQ5ProductList] = useState([{}])
    const [q5Quantity, setQ5Quantity] = useState(0)
    const [q5Date, setQ5Date] = useState("")


    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("transaction_date", "==", date5));

        const unsub = onSnapshot(q, (snapshot) =>
            setQuery5(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [date5])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query5.length !== 0) {

            query5.map((q5) => {
                setQ5ProductList(q5.product_list)
            })

        }
    }, [query5])

    useEffect(() => {
        if (q5ProductList !== undefined) {
            q5ProductList.map((q5) => {
                if (q5.itemId === docId) {
                    setQ5Date(date5)
                    setQ5Quantity(q5.itemNewQuantity)
                }
            })
        }
    }, [q5ProductList])
    // -------------------------------------------------------------------------

    const [fillerDate1, setFillerDate1] = useState(new Date())
    const [fillerDate2, setFillerDate2] = useState(new Date())
    const [fillerDate3, setFillerDate3] = useState(new Date())
    const [fillerDate4, setFillerDate4] = useState(new Date())
    const [fillerDate5, setFillerDate5] = useState(new Date())

    today.setDate(today.getDate() + 14)



    useEffect(() => {
        let halfROP = Math.round(daysROP / 2)
        let quarterROP = Math.round(daysROP / 4)

        let tempDate1 = new Date(q1Date)
        let tempDate2 = new Date(q1Date)
        let tempDate3 = new Date(q1Date)
        let tempDate4 = new Date(q1Date)
        let tempDate5 = new Date(q1Date)

        let tempf1 = new Date()
        let tempf2 = new Date()
        let tempf3 = new Date()
        let tempf4 = new Date()
        let tempf5 = new Date()

        tempf1 = tempDate1.setDate(tempDate1.getDate() + 7)
        tempf2 = tempDate2.setDate(tempDate2.getDate() + 14)
        tempf3 = tempDate3.setDate(tempDate3.getDate() + 21)
        tempf4 = tempDate4.setDate(tempDate4.getDate() + 28)
        tempf5 = tempDate5.setDate(tempDate5.getDate() + 35)

        setFillerDate1(tempf1)
        setFillerDate2(tempf2)
        setFillerDate3(tempf3)
        setFillerDate4(tempf4)
        setFillerDate5(tempf5)

    }, [q1Date])
    //---------------------------------------------------------------------------


    const [currQuantityROPDifference, setCurrQuantityROPDifference] = useState(0)
    const [fillerQuantity1, setFillerQuantity1] = useState(0)
    const [fillerQuantity2, setFillerQuantity2] = useState(0)
    const [fillerQuantity3, setFillerQuantity3] = useState(0)
    const [fillerQuantity4, setFillerQuantity4] = useState(0)
    const [fillerQuantity5, setFillerQuantity5] = useState(0)

    const [halfQuantity, setHalfQuantity] = useState(0)
    const [quarterQuantity, setQuarterQuantity] = useState(0)
    const [tempQuantity1, setTempQuantity1] = useState(0)
    const [tempQuantity2, setTempQuantity2] = useState(0)
    const [tempQuantity3, setTempQuantity3] = useState(0)
    const [tempQuantity4, setTempQuantity4] = useState(0)
    const [tempQuantity5, setTempQuantity5] = useState(0)


    useEffect(() => {
        setTempQuantity1(q1Quantity)
        setTempQuantity2(q1Quantity)
        setTempQuantity3(q1Quantity)
        setTempQuantity4(q1Quantity)
        setTempQuantity5(q1Quantity)
    }, [q1Quantity])


    useEffect(() => {
        setFillerQuantity1(Math.round(tempQuantity1 - (averageDailySales*7)))
        setFillerQuantity2(Math.round(tempQuantity2 - (averageDailySales*14)))
        setFillerQuantity3(Math.round(tempQuantity3 - (averageDailySales*21)))
        setFillerQuantity4(Math.round(tempQuantity4 - (averageDailySales*28)))
        setFillerQuantity5(Math.round(tempQuantity5 - (averageDailySales*35)))
    }, [tempQuantity1])

    //---------------------------------------------------------------------------





    const data = [
        {
            date: moment(q5Date).format('ll'),
            StockLevel: q5Quantity,
        },
        {
            date: moment(q4Date).format('ll'),
            StockLevel: q4Quantity,
        },
        {
            date: moment(q3Date).format('ll'),
            StockLevel: q3Quantity,
        },
        {
            date: moment(q2Date).format('ll'),
            StockLevel: q2Quantity,
        },
        {
            date: moment(q1Date).format('ll'),
            StockLevel: q1Quantity,
            ProjectedStockLevel: q1Quantity
        },
        {
            date: moment(fillerDate1).format('ll'),
            ProjectedStockLevel: fillerQuantity1,
        },
        {
            date: moment(fillerDate2).format('ll'),
            ProjectedStockLevel: fillerQuantity2,
        },
        {
            date: moment(fillerDate3).format('ll'),
            ProjectedStockLevel: fillerQuantity3,
        },
        {
            date: moment(fillerDate4).format('ll'),
            ProjectedStockLevel: fillerQuantity4,
        },

        {
            date: moment(fillerDate5).format('ll'),
            ProjectedStockLevel: fillerQuantity5,
        },


    ];

    return (

        <div className="row bg-light">
            <Navigation />

            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div className="row contents">
                    <div className="row py-4 px-5">
                        <div className="sidebar">

                            <Card className='sidebar-card' style={{ height: "550px" }}>
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
                                    <div className='scrollbar' style={{ height: '400px' }}>
                                        {stockcard.length === 0 ?
                                            <div className='py-4 px-2'>
                                                <Alert variant="secondary" className='text-center'>
                                                    <p>
                                                        <strong>No Recorded Product Registered to Forecast ReorderPoint</strong>
                                                    </p>
                                                </Alert>
                                            </div>
                                            :
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
                                        }

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


                                        <Accordion defaultActiveKey="1" className="mt-2">
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header><h6>Stock Level Projection Chart</h6></Accordion.Header>
                                                <Accordion.Body>
                                                    <Alert variant='primary' className='mt-2 text-center'>
                                                        <strong> Select a Product to display Forecasting</strong>
                                                    </Alert>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                        <Accordion defaultActiveKey="0">
                                            <Accordion.Item eventKey="1">
                                                <Accordion.Header><h6>Inventory Projection Statistical Tools</h6></Accordion.Header>
                                                <Accordion.Body>
                                                    <Alert variant='primary' className='mt-2 text-center'>
                                                        <strong> Select a Product to display Forecasting</strong>
                                                    </Alert>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
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

                                        {sortedTransactionDates <= 5 ? displayChartError() : displayAccordion()}





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

export default Itemforecast;