import React from 'react';
import { Table, Form, Button, ListGroup, Card, Tab, FormControl, Accordion, Alert, InputGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { faCircleInfo, faSearch, faTriangleExclamation, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DocumentAttach, Calendar, Document, InformationCircle } from 'react-ionicons'
import { ChevronBack, ChevronForward, Exit, Enter } from 'react-ionicons'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ToolTip from 'react-bootstrap/Tooltip';
import { LineChart, Line, XAxis, YAxis, ReferenceDot, Legend, Tooltip, Label, ReferenceLine, ResponsiveContainer } from 'recharts';
import { LineChart, Line, XAxis, YAxis, ReferenceDot, Legend, Tooltip, Text, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Spinner } from 'loading-animations-react';
import UserRouter from '../pages/UserRouter'






function Itemforecast() {



    //---------------------VARIABLES---------------------
    const [userID, setUserID] = useState("");
    const { user } = UserAuth();//user credentials
    const [docId, setDocId] = useState(); //document Id

    const [key, setKey] = useState('main');//Tab controller
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
    const [searchValue, setSearchValue] = useState('');    // the value of the search field 
    const [searchResult, setSearchResult] = useState();    // the search result
    const [stockcard, setStockcard] = useState(); // stockcardCollection variable
    const [salesRecordCollection, setSalesRecordCollection] = useState(); // sales_record collection

    const [forecastingBoolean, setForecastingBoolean] = useState()
    const [errorBoolean, setErrorBoolean] = useState(false)

    const [transactionDates, setTransactionDates] = useState()
    const [sortedTransactionDates, setSortedTransactionDates] = useState()
    
    const [sidebarHidden, setSidebarHidden] = useState() // display/hide sidebar
    const [chartWidth, setCharWidth] = useState()
    const [safetyStockSelected, setSafetyStockSelected] = useState(false)
    const [reorderPointSelected, setReorderPointSelected] = useState(false)



    const [i1, setI1] = useState()
    const [i2, setI2] = useState()
    const [i3, setI3] = useState()
    const [i4, setI4] = useState()
    const [i5, setI5] = useState()

    const [date1, setDate1] = useState()
    const [date2, setDate2] = useState()
    const [date3, setDate3] = useState()
    const [date4, setDate4] = useState()
    const [date5, setDate5] = useState()

    const [query1, setQuery1] = useState()
    const [query2, setQuery2] = useState()
    const [query3, setQuery3] = useState()
    const [query4, setQuery4] = useState()
    const [query5, setQuery5] = useState()


    const [quantity1, setQuantity1] = useState()
    const [quantity2, setQuantity2] = useState()
    const [quantity3, setQuantity3] = useState()
    const [quantity4, setQuantity4] = useState()
    const [quantity5, setQuantity5] = useState()

    const [fillerDate1, setFillerDate1] = useState(new Date())
    const [fillerDate2, setFillerDate2] = useState(new Date())
    const [fillerDate3, setFillerDate3] = useState(new Date())
    const [fillerDate4, setFillerDate4] = useState(new Date())

    const [fillerQuantity1, setFillerQuantity1] = useState()
    const [fillerQuantity2, setFillerQuantity2] = useState()
    const [fillerQuantity3, setFillerQuantity3] = useState()
    const [fillerQuantity4, setFillerQuantity4] = useState()


    // ===================================== START OF FUNCTIONS =====================================

    useEffect(() => {
        var contents = document.getElementById("contents")
        if (sidebarHidden) {
            contents.classList.add("sidebar-hidden")
        }
        else {
            contents.classList.remove("sidebar-hidden")
        }
    },)
    
    useEffect(() => {
        setCharWidth(getChartContainerWidth())
    }, [sidebarHidden])

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    useEffect(() => {
        if (userID !== undefined) {

            const collectionRef = collection(db, "stockcard")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );

            setSidebarHidden(false)
            return unsub;

        }

    }, [userID])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (stockcard === undefined || stockcard.length == 0 || docId === undefined) {
            setSalesRecordCollection()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [docId])


    const handleDocChange = (doc) => {
        stockcard.map((product, index) => {
            if (product.id == doc) {
                setDocId(index)
            }
        })
    }


    useEffect(() => {
        if (stockcard === undefined) {
            setIsFetched(false)
        }
        else {
            setIsFetched(true)
        }
    }, [stockcard])


    useEffect(() => {
        setSearchResult(stockcard)
    }, [stockcard])


    const filter = (e) => {
        const keyword = e.target.value;

        if (keyword !== '') {
            const results = stockcard.filter((stockcard) => {
                return stockcard.id.toLowerCase().includes(keyword.toLowerCase()) || stockcard.description.toLowerCase().includes(keyword.toLowerCase())
                // Use the toLowerCase() method to make it case-insensitive
            });
            setSearchResult(results);
        } else {
            setSearchResult(stockcard);
            // If the text field is empty, show all users
        }

        setSearchValue(keyword);
    };

    useEffect(() => {
        arrayOfSalesDate()
    }, [salesRecordCollection, docId])

    function arrayOfSalesDate() {
        let tempArr = []
        if (salesRecordCollection !== undefined) {
            salesRecordCollection.map((sales) => {
                if (!tempArr.includes(sales.transaction_date))
                    tempArr.push(sales.transaction_date)
            })
            setTransactionDates(tempArr)
        }
    }

    useEffect(() => {
        sortDates()
    }, [transactionDates, docId])


    function sortDates() {
        setSortedTransactionDates()
        if (transactionDates !== undefined) {
            let temp = transactionDates.sort()
            setSortedTransactionDates(temp)
        }
    }

    useEffect(() => {
        setDates()//function
    }, [sortedTransactionDates, docId])

    function setDates() {
        if (sortedTransactionDates !== undefined) {
            if (sortedTransactionDates.length >= 5) {
                setDate1(sortedTransactionDates[sortedTransactionDates.length - 1])
                setDate2(sortedTransactionDates[sortedTransactionDates.length - 2])
                setDate3(sortedTransactionDates[sortedTransactionDates.length - 3])
                setDate4(sortedTransactionDates[sortedTransactionDates.length - 4])
                setDate5(sortedTransactionDates[sortedTransactionDates.length - 5])
            } else {
                setDate1()
                setDate2()
                setDate3()
                setDate4()
                setDate5()
            }
        }
    }


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (sortedTransactionDates === undefined || date1 === undefined) {
            setQuery1()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", date1), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setQuery1(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [date1, sortedTransactionDates])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query1 !== undefined) {
            if (query1.length !== 0) {
                query1.map((q1) => {
                    q1.product_list.map((prod) => {
                        if (prod.itemId === stockcard[docId].id) {
                            setQuantity1(prod.itemNewQuantity)
                        }
                    })
                })
            }
        }
        else {
            setQuantity1()
        }
    }, [query1, date1])





    //query documents from sales_record that contains docId
    useEffect(() => {
        if (sortedTransactionDates === undefined || date2 === undefined) {
            setQuery2()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", date2), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setQuery2(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [date2, sortedTransactionDates])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query2 !== undefined) {
            if (query2.length !== 0) {
                query2.map((q2) => {
                    q2.product_list.map((prod) => {
                        if (prod.itemId === stockcard[docId].id) {
                            setQuantity2(prod.itemNewQuantity)
                        }
                    })
                })
            }
        }
        else {
            setQuantity2()
        }
    }, [query2, date2])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (sortedTransactionDates === undefined || date3 === undefined) {
            setQuery3()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", date3), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setQuery3(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [date3, sortedTransactionDates])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query3 !== undefined) {
            if (query3.length !== 0) {
                query3.map((q3) => {
                    q3.product_list.map((prod) => {
                        if (prod.itemId === stockcard[docId].id) {
                            setQuantity3(prod.itemNewQuantity)
                        }
                    })
                })
            }
        }
        else {
            setQuantity3()
        }
    }, [query3, date3])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (sortedTransactionDates === undefined || date4 === undefined) {
            setQuery4()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", date4), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setQuery4(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [date4, sortedTransactionDates])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query4 !== undefined) {
            if (query4.length !== 0) {
                query4.map((q4) => {
                    q4.product_list.map((prod) => {
                        if (prod.itemId === stockcard[docId].id) {
                            setQuantity4(prod.itemNewQuantity)
                        }
                    })
                })
            }
        }
        else {
            setQuantity4()
        }
    }, [query4, date4])



    //query documents from sales_record that contains docId
    useEffect(() => {
        if (sortedTransactionDates === undefined || date5 === undefined) {
            setQuery5()
        }
        else {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("transaction_date", "==", date5), where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setQuery5(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [date5, sortedTransactionDates])


    //query documents from sales_record that contains docId
    useEffect(() => {
        if (query5 !== undefined) {
            if (query5.length !== 0) {
                query5.map((q5) => {
                    q5.product_list.map((prod) => {
                        if (prod.itemId === stockcard[docId].id) {
                            setQuantity5(prod.itemNewQuantity)
                        }
                    })
                })
            }
        }
        else {
            setQuantity5()
        }
    }, [query5, date5])




    useEffect(() => {
        if (sortedTransactionDates === undefined || date1 === undefined) {
            setFillerDate1()
            setFillerDate2()
            setFillerDate3()
            setFillerDate4()
        } else {
            let tempDate1 = new Date(date1)
            let tempDate2 = new Date(date1)
            let tempDate3 = new Date(date1)
            let tempDate4 = new Date(date1)

            let tempf1 = new Date()
            let tempf2 = new Date()
            let tempf3 = new Date()
            let tempf4 = new Date()

            tempf1 = tempDate1.setDate(tempDate1.getDate() + 7)
            tempf2 = tempDate2.setDate(tempDate2.getDate() + 14)
            tempf3 = tempDate3.setDate(tempDate3.getDate() + 21)
            tempf4 = tempDate4.setDate(tempDate4.getDate() + 28)

            setFillerDate1(tempf1)
            setFillerDate2(tempf2)
            setFillerDate3(tempf3)
            setFillerDate4(tempf4)
        }

    }, [date1, sortedTransactionDates])

    useEffect(() => {
        if (stockcard === undefined || quantity1 === undefined) {
            setFillerQuantity1()
            setFillerQuantity2()
            setFillerQuantity3()
            setFillerQuantity4()
        } else {
            let tempQuantity1 = 0
            let tempQuantity2 = 0
            let tempQuantity3 = 0
            let tempQuantity4 = 0

            tempQuantity1 = quantity1 - (Number(stockcard[docId].analytics.averageDailySales) * 7)
            tempQuantity2 = quantity1 - (Number(stockcard[docId].analytics.averageDailySales) * 14)
            tempQuantity3 = quantity1 - (Number(stockcard[docId].analytics.averageDailySales) * 21)
            tempQuantity4 = quantity1 - (Number(stockcard[docId].analytics.averageDailySales) * 28)

            setFillerQuantity1(Math.round(tempQuantity1))
            setFillerQuantity2(Math.round(tempQuantity2))
            setFillerQuantity3(Math.round(tempQuantity3))
            setFillerQuantity4(Math.round(tempQuantity4))
        }

    }, [stockcard, quantity1])




    useEffect(() => {

        setForecastingBoolean()
        if (sortedTransactionDates !== undefined) {
            {
                setForecastingBoolean()
                if (sortedTransactionDates.length >= 5) {
                    setForecastingBoolean(true)
                } else {
                    setForecastingBoolean(false)
                }
            }
        } else {
            setForecastingBoolean()
        }
    }, [sortedTransactionDates])


    useEffect(() => {
        console.log("forecastingBoolean: ", forecastingBoolean)
    }, [forecastingBoolean])

    useEffect(() => {
        console.log("salesRecordCollection: ", salesRecordCollection)
    }, [salesRecordCollection])

    const getChartContainerWidth = () => {
        //compute for DOM dimensions for proportions
        var chart_container = document.getElementById("chart-container")
        if (
          typeof chart_container === 'object' &&
          !Array.isArray(chart_container) &&
          chart_container !== null
        ) {
        var chartContainerWidth = getComputedStyle(chart_container);// get warehouse-map dimensions
        var chartWidth = chart_container.clientWidth // get warehouse-map width
        chartWidth -= parseFloat(chartContainerWidth.paddingLeft) + parseFloat(chartContainerWidth.paddingRight); // subtract padding dimensions from width
        return chartWidth
        }
    }

    const getData = () => {
        var temp_stocklevel_data = [
            {
                date: moment(date5).format('LL'),
                "Stock Level": quantity5
            },
            {
                date: moment(date4).format('LL'),
                "Stock Level": quantity4
            },
            {
                date: moment(date3).format('LL'),
                "Stock Level": quantity3
            },
            {
                date: moment(date2).format('LL'),
                "Stock Level": quantity2
            },
            {
                date: moment(date1).format('LL'),
                "Stock Level": quantity1,
                "Projected Stock Level": quantity1
            }
        ];
        var temp_projection_data = [
            {
                date: moment(fillerDate1).format('LL'),
                "Projected Stock Level": fillerQuantity1
            },
            {
                date: moment(fillerDate2).format('LL'),
                "Projected Stock Level": fillerQuantity2
            }, {
                date: moment(fillerDate3).format('LL'),
                "Projected Stock Level": fillerQuantity3
            }, {
                date: moment(fillerDate4).format('LL'),
                "Projected Stock Level": fillerQuantity4
            },
        ]

        for(var i = 0; i < temp_stocklevel_data.length; i++)
        {
            if(temp_stocklevel_data[i]["Stock Level"] > stockcard[docId].analytics.reorderPoint)
            {
                temp_stocklevel_data.splice(i, 0, {date: moment(stockcard[docId].analytics.dateReorderPoint).format("LL"), "Reorder Point": stockcard[docId].analytics.reorderPoint, "Stock Level": stockcard[docId].analytics.reorderPoint})
                break;
            }
        }

        return (temp_stocklevel_data.concat(temp_projection_data))
    }

    function displayAccordion() {

        if (stockcard !== undefined) {
            return (
                stockcard[docId].analytics.leadtimeMaximum !== 0 ?
                        <div>
                        <div id="analytics-stats" className="d-flex mt-3 px-4 py-3 bg-white flex-row">
                            {/*
                            <hr />
                            <h3 className='text-center'>CHART LEGEND</h3>
                            <hr />
                            <div className="col">
                                <h4>Reference Lines</h4>
                                <div className="row">
                                    <span>| <span style={{ color: '#009933' }}> <strong>ReorderPoint: </strong></span>{stockcard[docId].analytics.reorderPoint} unit(s)</span>
                                </div>
                                <div className="row">
                                    <span>| <span style={{ color: '#ff9900' }}> <strong>SafetyStock: </strong></span>{stockcard[docId].analytics.safetyStock} unit(s)</span>
                                </div>
                                <div className="row">
                                    <span>| <span style={{ color: '#262626' }}> <strong>Minimum Quantity: </strong></span>{stockcard[docId].min_qty} unit(s)</span>
                                </div>
                                <div className="row">
                                    <span>| <span style={{ color: '#262626' }}> <strong>Maximum Quantity: </strong></span>{stockcard[docId].max_qty} unit(s)</span>
                                </div>
                            </div>

                            <div className="col">
                                <h4>{stockcard[docId].id.substring(0, 9)} Outbound Stats</h4>
                                <div className="row">
                                    <span>| <span style={{ color: '#009933' }}> <strong>ReorderPoint Date: </strong></span>{moment(stockcard[docId].analytics.dateReorderPoint).format('LL')}</span>
                                </div>
                                <div className="row">
                                    <span>| <span style={{ color: '#1f3d7a' }}> <strong>Highest Daily Sales: </strong></span>{stockcard[docId].analytics.highestDailySales} unit(s)</span>
                                </div>
                                <div className="row">
                                    <span>| <span style={{ color: '#1f3d7a' }}> <strong>Average Daily Sales: </strong></span>{stockcard[docId].analytics.averageDailySales} unit(s)</span>
                                </div>
                            </div>*/}
                            <div className="analytics-numbers">
                                <small>
                                    <span className="IMS-text-muted">
                                        Highest Daily Sale
                                    </span>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2><strong>{stockcard[docId].analytics.highestDailySales}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                            <div className="analytics-numbers">
                                <small>
                                    <span className="IMS-text-muted">
                                        Average Daily Sale
                                    </span>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2><strong>{stockcard[docId].analytics.averageDailySales}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                            <div 
                                className="analytics-numbers clickable"
                                onClick={()=>{
                                    setSafetyStockSelected(true);
                                    setTimeout(function () {
                                        setSafetyStockSelected(false)
                                      }, 2500)
                                }}
                            >
                                <small>
                                    <span className="IMS-text-muted" style={{ color: '#8a5300' }}>
                                        Safety Stock
                                    </span>
                                    <a
                                        className="ms-2"
                                        data-title="The extra quantity of a product kept in storage to prevent stockouts."
                                    >
                                        <FontAwesomeIcon icon={faCircleInfo}/>
                                    </a>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2 style={{ color: '#ff9900' }}><strong>{stockcard[docId].analytics.safetyStock}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                            <div className="analytics-numbers clickable"
                                onClick={()=>{
                                    setReorderPointSelected(true);
                                    setTimeout(function () {
                                        setReorderPointSelected(false)
                                      }, 2000)
                                }}>
                                <small>
                                    <span className="IMS-text-muted" style={{ color: '#004517' }}>
                                        Reorder Point
                                    </span>
                                    <a
                                        className="ms-2"
                                        data-title="The specific level at which the product's stock needs to be replenished."
                                    >
                                        <FontAwesomeIcon icon={faCircleInfo}/>
                                    </a>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2 style={{ color: '#009933' }}><strong>{stockcard[docId].analytics.reorderPoint}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                            <div className="analytics-numbers clickable"
                                onClick={()=>{
                                    setReorderPointSelected(true);
                                    setTimeout(function () {
                                        setReorderPointSelected(false)
                                      }, 2000)
                                }}>
                                <small>
                                    <span className="IMS-text-muted" style={{ color: '#4f6e00' }}>
                                        Reorder Point Date
                                    </span>
                                    <a
                                        className="ms-2"
                                        data-title="The day where the the product's stocks needs to be replenished."
                                    >
                                        <FontAwesomeIcon icon={faCircleInfo}/>
                                    </a>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2 style={{color: "#9fde00"}}><strong>{moment(stockcard[docId].analytics.dateReorderPoint).format("MMM DD")}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>{moment(stockcard[docId].analytics.dateReorderPoint).format("YYYY")}</span>
                                </div>
                            </div>
                            <div className="analytics-numbers">
                                <small>
                                    <span className="IMS-text-muted">
                                        Minimum Quantity
                                    </span>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2><strong>{stockcard[docId].min_qty}</strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                            <div className="analytics-numbers">
                                <small>
                                    <span className="IMS-text-muted">
                                        Maximum Quantity
                                    </span>
                                </small>
                                <div className="d-flex align-items-baseline justify-content-start">
                                    <h2><strong>{stockcard[docId].max_qty} </strong></h2>
                                    <span className="text-muted ms-1" style={{ fontSize: "0.75em" }}>unit(s)</span>
                                </div>
                            </div>
                        </div>
                            <div id="analytics-linechart" className='row mt-3'>
                            <ResponsiveContainer width={(chartWidth === undefined?700:chartWidth)} height={500}>
                                <LineChart
                                    data={getData()}
                                    margin={{ top: 30, right: 20, left: 10, bottom: 5 }}
                                >
                                    <XAxis dataKey="date" />
                                    <Tooltip />

                                    <ReferenceLine
                                        y={stockcard[docId].min_qty}
                                        label={{ value: 'Minimum Quantity', position: 'insideBottomRight', textAnchor: 'middle', letterSpacing: "0.15em", offset: "10"}}
                                        stroke="#26262680" strokeDasharray="3 3" 
                                    />
                                    <ReferenceLine
                                        y={stockcard[docId].max_qty}
                                        label={{ value: 'Maximum Quantity', position: 'insideBottomRight', textAnchor: 'middle', letterSpacing: "0.15em", dy: "0", offset: "10" }}
                                        stroke="#26262680"
                                        strokeDasharray="3 3"
                                    />
                                    {/*<ReferenceLine y={stockcard[docId].analytics.reorderPoint}
                                        label={{ value: 'ReorderPoint', position: 'insideLeft', textAnchor: 'middle' }}
                                        stroke="#009933"
                                        strokeDasharray="3 3"
                                        strokeWidth={3}
                                    /> */}
                                    <ReferenceLine
                                        className={safetyStockSelected?"safety-stock-selected":""}
                                        y={stockcard[docId].analytics.safetyStock}
                                        label={{ value: 'Safety Stock', position: 'insideBottomRight', textAnchor: 'middle', letterSpacing: "0.15em", fill: "#ff9900", fontWeight: "700", offset: "10"}}
                                        stroke="#ff9900b3"
                                        strokeDasharray="3 3"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Stock Level"
                                        stroke="#ff0000"
                                        dot={{ stroke: '#ff0000', strokeWidth: 1, r: 3, strokeDasharray: '' }}
                                    />
                                    <Line
                                        className={reorderPointSelected?"reorder-point-selected":""}
                                        type="monotone"
                                        dataKey="Reorder Point"
                                        stroke="#009933"
                                        dot={{ stroke: '#009933', strokeWidth: 3, r: 5, strokeDasharray: '', fill: "#91ff52" }}
                                        legendType={"circle"}
                                        isAnimationActive={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="Projected Stock Level"
                                        stroke="#0066ff"
                                        dot={{ stroke: '#0066ff', strokeWidth: 1, r: 3, strokeDasharray: '' }}
                                    />
                                    <YAxis 
                                        label={{ value: 'Stock Level', angle: -90, position: 'insideLeft', textAnchor: 'middle' }}
                                    />
                                    <Legend 
                                        margin={{right: 30, left: 30, top: 20, bottom: 20}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            </div>

                        </div >

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
        } else {
            <Spinner
                color1="#b0e4ff"
                color2="#fff"
                textColor="rgba(0,0,0, 0.5)"
                className="w-50 h-50"
            />
        }
    }

    function displayChartError() {
        return (
            <div className='mt-2 p-3'>
                <div className="yellow-strip left-full-curve right-full-curve p-3">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                        <InformationCircle
                            color={'#0d6efd'}
                            height="40px"
                            width="40px"
                            className="mb-2"
                        />
                        <p className="text-center px-5">
                            <div className="mb-2">
                                Forecasting chart is only available for products with <strong> five (5) or more </strong> sale transaction days.
                            </div>

                            <small>
                                <span>To create a sales transaction, go to </span>
                                <Link to="/salesrecord">Sales Record</Link>
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        )


    }

    return (
        <div>
            <UserRouter
                route='/analytics'
            />
            <Navigation
                page="/analytics"
            />

            <Tab.Container
                activeKey={key}
                onSelect={(k) => setKey(k)}
            >
                <div id="contents" className="row">
                    <div className="row py-4 px-5">
                        <div className='sidebar'>
                            <Card className='sidebar-card'>
                                <Card.Header>
                                    <div className='row'>
                                        <InputGroup id="fc-search">
                                            <InputGroup.Text>
                                                <FontAwesomeIcon icon={faSearch} />
                                            </InputGroup.Text>
                                            <FormControl
                                                type="search"
                                                value={searchValue}
                                                onChange={filter}
                                                className="input"
                                                placeholder="IT000013, Rexona Pink 3mL (1pc)"
                                            />
                                        </InputGroup>
                                    </div>
                                </Card.Header>
                                <Card.Body style={{ height: "500px" }}>

                                    <div className="row g-1 sidebar-header">
                                        <div className="col-4 left-curve">
                                            Item Code
                                        </div>
                                        <div className="col-8 right-curve">
                                            Description
                                        </div>
                                    </div>
                                    <div className='scrollbar' style={{ height: '415px' }}>
                                        {isFetched ?
                                            <>
                                                {stockcard.length === 0 ?
                                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                                                        <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>Product</span> to show.</strong></h5>
                                                        <p className="d-flex align-items-center justify-content-center">
                                                            <span>Click the</span>
                                                            <Button
                                                                className="add ms-1 me-1 static-button no-click"
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Button>
                                                            <span>
                                                                button to add one.
                                                            </span>
                                                        </p>
                                                    </div>
                                                    :
                                                    <ListGroup activeKey={key} variant="flush">
                                                        {searchResult && searchResult.length > 0 ? (
                                                            searchResult.map((stockcard) => (
                                                                <ListGroup.Item
                                                                    action
                                                                    key={stockcard.id}
                                                                    eventKey={stockcard.id}
                                                                    onClick={() => { handleDocChange(stockcard.id) }}
                                                                >
                                                                    <div className="row gx-0 sidebar-contents">
                                                                        <div className="col-4">
                                                                            {stockcard.id.substring(0, 9)}
                                                                        </div>
                                                                        <div className="col-8">
                                                                            {stockcard.description}
                                                                        </div>
                                                                    </div>
                                                                </ListGroup.Item>
                                                            ))
                                                        ) : (
                                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column" style={{ marginTop: '25%' }}>
                                                                <h5>
                                                                    <strong className="d-flex align-items-center justify-content-center flex-column">
                                                                        No product matched:
                                                                        <br />
                                                                        <span style={{ color: '#0d6efd' }}>{searchValue}</span>
                                                                    </strong>
                                                                </h5>
                                                            </div>
                                                        )}
                                                    </ListGroup>
                                                }
                                            </>
                                            :
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                                                <Spinner
                                                    color1="#b0e4ff"
                                                    color2="#fff"
                                                    textColor="rgba(0,0,0, 0.5)"
                                                    className="w-50 h-50"
                                                />
                                            </div>
                                        }
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="sidebar-visibility-toggler">
                            <button
                                onClick={() => { sidebarHidden ? setSidebarHidden(false) : setSidebarHidden(true) }}
                            >
                                {sidebarHidden ?
                                    <ChevronForward
                                        color={'#000000'}
                                        height="15px"
                                        width="15px"
                                    />
                                    :
                                    <ChevronBack
                                        color={'#000000'}
                                        height="15px"
                                        width="15px"
                                    />
                                }
                            </button>
                        </div>
                        <div className="divider sm"></div>
                        <div className='data-contents'>
                            <Tab.Content>
                                <Tab.Pane eventKey='main'>
                                    <div className="row py-1 m-0 ">
                                        <div className="row p-0 m-0">
                                            <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                                            </h1>
                                            <hr />

                                            <div className="row m-0 mt-2 mb-1 px-2 py-3 blue-strip dark left-full-curve right-full-curve">
                                                <div className="row m-0 p1 px-0 text-center">
                                                    <div className="col-2">
                                                        Item Code
                                                    </div>
                                                    <div className="col-8">
                                                        Item Description
                                                    </div>
                                                    <div className="col-2">
                                                        Stock
                                                    </div>
                                                </div>
                                                <hr className="blue-strip-divider dark"></hr>
                                                <div className="row m-0 my-2 px-0">
                                                    <div className="col-2 text-center">
                                                        <h6><strong>-</strong></h6>
                                                    </div>
                                                    <div className="col-8 text-center">
                                                        <h6><strong>-</strong></h6>
                                                    </div>
                                                    <div className="col-2 text-center">
                                                        <h6><strong>-</strong></h6>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-2 p-3'>
                                                <div className="blue-strip left-full-curve right-full-curve p-3">
                                                    <div className="d-flex align-items-center justify-content-center flex-column">
                                                        <InformationCircle
                                                            color={'#0d6efd'}
                                                            height="40px"
                                                            width="40px"
                                                            className="mb-2"
                                                        />
                                                        <p className="text-center px-5">
                                                            <div className="mb-2">
                                                                <strong>Select a product to display its forecasting.</strong>
                                                            </div>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </Tab.Pane>
                                {(stockcard === undefined || stockcard.length == 0) || docId === undefined ?
                                    <></>
                                    :
                                    <Tab.Pane eventKey={stockcard[docId].id}>
                                        <div className='row py-1 m-0 ' id="product-contents">

                                            <div className="row p-0 m-0">
                                                <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                                                </h1>
                                                <hr />

                                                <div className="row m-0 mt-2 mb-1 px-2 py-3 blue-strip dark left-full-curve right-full-curve">
                                                    <div className="row m-0 p1 px-0 text-center">
                                                        <div className="col-2">
                                                            Item Code
                                                        </div>
                                                        <div className="col-8">
                                                            Item Description
                                                        </div>
                                                        <div className="col-2">
                                                            Stock
                                                        </div>
                                                    </div>
                                                    <hr className="blue-strip-divider dark"></hr>
                                                    <div className="row m-0 my-2 px-0">
                                                        <div className="col-2 text-center">
                                                            <h6><strong>{stockcard[docId].id.substring(0, 9)}</strong></h6>
                                                        </div>
                                                        <div className="col-8 text-center">
                                                            <h6><strong>{stockcard[docId].description}</strong></h6>
                                                        </div>
                                                        <div className="col-2 text-center">
                                                            <h6><strong>{stockcard[docId].qty}</strong></h6>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row m-0 p-0">

                                                {stockcard === undefined ?
                                                <Spinner
                                                    color1="#b0e4ff"
                                                    color2="#fff"
                                                    textColor="rgba(0,0,0, 0.5)"
                                                    className="w-50 h-50"
                                                />
                                                :
                                                <div id="chart-container" className="w-100">
                                                    {
                                                stockcard[docId].analytics.analyticsBoolean ?
                                                    displayAccordion()
                                                    :
                                                    displayChartError()

                                                    }
                                                </div>
                                            }
                                                </div>
                                            </div>


                                        </div>
                                    </Tab.Pane>
                                }
                            </Tab.Content>
                        </div>
                    </div>
                </div>
            </Tab.Container >
        </div >
    );


}

export default Itemforecast;