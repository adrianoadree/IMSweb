import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase-config";
import { collection, where, query, onSnapshot, orderBy } from "firebase/firestore";

import moment from "moment";

import { UserAuth } from '../context/AuthContext';
import UserRouter from '../pages/UserRouter'
import Navigation from "../layout/Navigation";

import { ChevronBack, ChevronForward, Exit, Enter } from 'react-ionicons'
import { Card, Nav, Table,  Tab, ListGroup } from "react-bootstrap";
import { Spinner } from 'loading-animations-react';

import ProductQuickView from "../components/ProductQuickView";


function LandingPage() {
    
    const { user } = UserAuth();
    const [userID, setUserID] = useState("");
    const userCollectionRef = collection(db, "user");
    const [userCollection, setUserCollection] = useState(); // stockcardCollection variable

    const [stockcardCollection, setStockcardCollection] = useState(); // stockcardCollection variable
    const [purchaseRecordCollection, setPurchaseRecordCollection] = useState(); // sales_record collection
    const [salesRecordCollection, setSalesRecordCollection] = useState();

    const [showProductQuickViewModal, setShowProductQuickViewModal] = useState(false); // show/hide product quick view modal
    const [productToView, setProductToView] = useState() // set product to view
    const [sidebarHidden, setSidebarHidden] = useState(false) // display/hide sidebar

    const [productsSold, setProductsSold] = useState([])
    const [productsBought, setProductsBought] = useState([])
    const [totalSales, setTotalSales] = useState(0)
    const [totalPurchases, setTotalPurchases] = useState(0)

    const [dateSelected, setDateSelected] = useState() // selected date variable
    const [purchaseDescriptionSorting, setPurchaseDescriptionSorting] = useState("ascending")
    const [purchaseQuantitySorting, setPurchaseQuantitySorting] = useState("unsorted")
    const [salesDescriptionSorting, setSalesDescriptionSorting] = useState("ascending")
    const [salesQuantitySorting, setSalesQuantitySorting] = useState("unsorted")

    const [topProducts, setTopProducts] = useState()
    const [prodNearROP, setProdNearROP] = useState()
    const [userProfile, setUserProfile] = useState({});

    var curr_date = new Date(); // get current date
    curr_date.setDate(curr_date.getDate());
    curr_date.setHours(0, 0, 0, 0); // set current date's hours to zero to compare dates only

    // date periods for summary report
    var today = curr_date

    var yesterday = new Date(curr_date.getFullYear(), curr_date.getMonth(), curr_date.getDate() - 1); // get yesterday's date

    var firstday_week = new Date(curr_date.getFullYear(), curr_date.getMonth(), curr_date.getDate() - curr_date.getDay()); // get week's first day date
    var lastday_week = new Date(curr_date.getFullYear(), curr_date.getMonth(), curr_date.getDate() - curr_date.getDay() + 6); // get week's last day date

    var firstday_month = new Date(curr_date.getFullYear(), curr_date.getMonth(), 1); // get month's first day date
    var lastday_month = new Date(curr_date.getFullYear(), curr_date.getMonth() + 1, 0); // get month's last day date


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
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    useEffect(() => {
        if (userID === undefined) {
            const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {
            const userCollectionRef = collection(db, "user");
            const q = query(userCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;

        }
    }, [userID])

    useEffect(() => {
        if (userCollection === undefined) {

        }
        else {
            userCollection.map((metadata) => {
                setUserProfile(metadata)
            });

        }
    }, [userCollection])

        //query documents from stockcard that contains docId
    useEffect(() => {
        if (userID === undefined) {

            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {
            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])

    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (userID !== undefined) {
            const collectionRef = collection(db, "purchase_record")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])

    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (userID !== undefined) {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])
    //query documents from stockcard that contains docId
    useEffect(() => {
        if (userID === undefined) {

            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {
            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])

    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (userID !== undefined) {
            const collectionRef = collection(db, "purchase_record")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])

    //query documents from purchase_record that contains docId
    useEffect(() => {
        if (userID !== undefined) {
            const collectionRef = collection(db, "sales_record")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])

    // make default date selected today
    useEffect(() => {
        if (purchaseRecordCollection === undefined || salesRecordCollection === undefined || stockcardCollection === undefined) {

        }
        else {
            setDateSelected("today")
            determineLeaderboard()
        }
    }, [purchaseRecordCollection, salesRecordCollection, stockcardCollection])

    // update summary report date on date change
    useEffect(() => {
        if (purchaseRecordCollection !== undefined && salesRecordCollection !== undefined) {
            handleDateChange()
        }
        else {

        }
    }, [dateSelected])

    // change sorting
    useEffect(() => {
        if (purchaseQuantitySorting == "ascending" || purchaseQuantitySorting == "descending")
            handlePurchaseQuantityOrderChange()
    }, [purchaseQuantitySorting])

    useEffect(() => {
        if (purchaseDescriptionSorting == "ascending" || purchaseDescriptionSorting == "descending")
            handlePurchaseDescriptionOrderChange()
    }, [purchaseDescriptionSorting])

    useEffect(() => {
        if (salesQuantitySorting == "ascending" || salesQuantitySorting == "descending")
            handleSalesQuantityOrderChange()
    }, [salesQuantitySorting])

    useEffect(() => {
        if (salesDescriptionSorting == "ascending" || salesDescriptionSorting == "descending")
            handleSalesDescriptionOrderChange()
    }, [salesDescriptionSorting])

    // display date according to date selected
    const handleDateDisplay = () => {
        switch (dateSelected) {
            case "today":
                var temp_date = new Date(today)
                temp_date.setDate(temp_date.getDate())
                return moment(temp_date).format('dddd') + ", " + moment(temp_date).format('MMMM DD, YYYY');
                break;
            case "this month":
                var temp_date_first = firstday_month.setDate(firstday_month.getDate())
                var temp_date_last = lastday_month.setDate(lastday_month.getDate())
                return moment(temp_date_first).format('MMMM') + " " + moment(temp_date_first).format('DD') + " - " + moment(temp_date_last).format('DD') + ", " + moment(temp_date_first).format('YYYY')
                break;
            case "yesterday":
                var temp_date = yesterday.setDate(yesterday.getDate());
                return moment(temp_date).format('dddd') + ", " + moment(temp_date).format('MMMM DD, YYYY');
                break;
            case "this week":
                var temp_date_first = firstday_week.setDate(firstday_week.getDate())
                var temp_date_last = lastday_week.setDate(lastday_week.getDate())
                return moment(temp_date_first).format('MMMM') + " " + moment(temp_date_first).format('DD') + " - " + moment(temp_date_last).format('MMMM') + " " + moment(temp_date_last).format('DD') + ", " + moment(temp_date_first).format('YYYY')
                break;
        }
    }

    // update summary report according to date selected
    const handleDateChange = () => {
        // date variables, changes depending on what the user selected
        var date_start
        var date_end

        switch (dateSelected) {
            case "today":
                date_start = today
                date_end = today
                break;
            case "yesterday":
                date_start = yesterday
                date_end = yesterday
                break;
            case "this week":
                date_start = firstday_week
                date_end = lastday_week
                break;
            case "this month":
                date_start = firstday_month
                date_end = lastday_month
                break;
        }

        var tempProductBoughtList = []
        var tempProductBoughtListId = []
        var tempProductBoughtListQty = []
        var tempProductBoughtListTransacItem = []
        var tempProductBoughtListTransac = []
        var tempProductInfo = {
            "id": "",
            "description": "",
            "img": "",
            "transaction": [],
            "qty": 0
        }

        var record_date
        purchaseRecordCollection.map((purch) => {
            record_date = new Date(purch.transaction_date)
            record_date.setHours(0, 0, 0, 0)
            tempProductBoughtListTransacItem = []
            if (!purch.isVoided) {
                if ((record_date.getTime() >= date_start.getTime() && record_date.getTime() <= date_end.getTime())) {
                    purch.product_list.map((product) => {
                        if (tempProductBoughtListId.indexOf(product.itemId) >= 0) {
                            tempProductBoughtListQty[tempProductBoughtListId.indexOf(product.itemId)] = tempProductBoughtListQty[tempProductBoughtListId.indexOf(product.itemId)] + product.itemQuantity
                            tempProductBoughtListTransac[tempProductBoughtListId.indexOf(product.itemId)].push(purch.id)
                        }
                        else {
                            tempProductBoughtListId.push(product.itemId)
                            tempProductBoughtListQty.push(product.itemQuantity)
                            if(tempProductBoughtListTransacItem.indexOf(purch.id) == -1)
                            {
                                tempProductBoughtListTransacItem.push(purch.id)
                            }
                            tempProductBoughtListTransac.push(tempProductBoughtListTransacItem)
                        }
                    })
                }
            }
        })

        stockcardCollection.map((product) => {
            var tempProductInfo = {
                "id": "",
                "description": "",
                "img": "",
                "transaction": [],
                "qty": 0
            }
            if (tempProductBoughtListId.indexOf(product.id) >= 0) {
                tempProductInfo.id = tempProductBoughtListId[tempProductBoughtListId.indexOf(product.id)]
                tempProductInfo.description = product.description
                tempProductInfo.img = product.img
                tempProductInfo.transaction = tempProductBoughtListTransac[tempProductBoughtListId.indexOf(product.id)]
                tempProductInfo.qty = Number(tempProductBoughtListQty[tempProductBoughtListId.indexOf(product.id)])

                tempProductBoughtList.push(tempProductInfo)
            }
        })

        var tempPurchasesTotal = 0

        tempProductBoughtList.map((product) => {
            tempPurchasesTotal = tempPurchasesTotal + product.qty
        })

        setTotalPurchases(tempPurchasesTotal)
        setProductsBought(tempProductBoughtList)
        var sorted_products_bought = [...tempProductBoughtList]
        sorted_products_bought.sort((description1, description2) => { return description1.description > description2.description })
        setProductsBought(sorted_products_bought)
        setPurchaseDescriptionSorting("ascending")
        setPurchaseQuantitySorting("unsorted")

        var tempProductSoldList = []
        var tempProductSoldListId = []
        var tempProductSoldListQty = []
        var tempProductSoldListTransacItem = []
        var tempProductSoldListTransac = []
        var tempProductInfo = {
            "id": "",
            "description": "",
            "img": "",
            "transaction": [],
            "qty": 0
        }

        var record_date
        salesRecordCollection.map((sale) => {
            record_date = new Date(sale.transaction_date)
            record_date.setHours(0, 0, 0, 0)
            tempProductSoldListTransacItem = []
            if (!sale.isVoided) {
                if ((record_date.getTime() >= date_start.getTime() && record_date.getTime() <= date_end.getTime())) {
                    sale.product_list.map((product) => {
                        if (tempProductSoldListId.indexOf(product.itemId) >= 0) {
                            tempProductSoldListQty[tempProductSoldListId.indexOf(product.itemId)] = tempProductSoldListQty[tempProductSoldListId.indexOf(product.itemId)] + product.itemQuantity
                            for(var i = 0; i < tempProductSoldListTransac[tempProductSoldListId.indexOf(product.itemId)].length; i++)
                            {
                                if(tempProductSoldListTransac[tempProductSoldListId.indexOf(product.itemId)][i] == sale.id)
                                {

                                }
                                else
                                {

                                    tempProductSoldListTransac[tempProductSoldListId.indexOf(product.itemId)].push(sale.id)
                                }
                            }
                        }
                        else {
                            tempProductSoldListId.push(product.itemId)
                            tempProductSoldListQty.push(product.itemQuantity)
                            if(tempProductSoldListTransacItem.indexOf(sale.id) == -1)
                            {
                                tempProductSoldListTransacItem.push(sale.id)
                            }
                            tempProductSoldListTransac.push(tempProductSoldListTransacItem)
                        }
                    })
                }
            }
        })

        stockcardCollection.map((product) => {
            tempProductInfo = {
                "id": "",
                "description": "",
                "img": "",
                "transaction": [],
                "qty": 0
            }
            if (tempProductSoldListId.indexOf(product.id) >= 0) {
                tempProductInfo.id = tempProductSoldListId[tempProductSoldListId.indexOf(product.id)]
                tempProductInfo.description = product.description
                tempProductInfo.img = product.img
                tempProductInfo.transaction = tempProductSoldListTransac[tempProductSoldListId.indexOf(product.id)]
                tempProductInfo.qty = Number(tempProductSoldListQty[tempProductSoldListId.indexOf(product.id)])

                tempProductSoldList.push(tempProductInfo)
            }
        })

        var tempSalesTotal = 0

        tempProductSoldList.map((product) => {
            tempSalesTotal = tempSalesTotal + product.qty
        })

        setTotalSales(tempSalesTotal)
        var sorted_products_sold = [...tempProductSoldList]
        sorted_products_sold.sort((description1, description2) => { return description1.description > description2.description })
        setProductsSold(sorted_products_sold)
        setSalesDescriptionSorting("ascending")
        setSalesQuantitySorting("unsorted")
    }

    // update product list according to sorting method
    const handlePurchaseQuantityOrderChange = () => {
        var sorted_products_bought = [...productsBought]
        if (purchaseQuantitySorting == "ascending") {
            sorted_products_bought.sort((qty1, qty2) => { return qty1.qty > qty2.qty })
        }
        else if (purchaseQuantitySorting == "descending") {
            sorted_products_bought.sort((qty1, qty2) => { return qty1.qty < qty2.qty })
        }

        setProductsBought(sorted_products_bought)
    }

    const handlePurchaseDescriptionOrderChange = () => {
        var sorted_products_bought = [...productsBought]
        if (purchaseDescriptionSorting == "ascending") {
            sorted_products_bought.sort((description1, description2) => { return description1.description > description2.description })
        }
        else if (purchaseDescriptionSorting == "descending") {
            sorted_products_bought.sort((description1, description2) => { return description1.description < description2.description })
        }

        setProductsBought(sorted_products_bought)
    }

    const handleSalesQuantityOrderChange = () => {
        var sorted_products_sold = [...productsSold]
        if (salesQuantitySorting == "ascending") {
            sorted_products_sold.sort((qty1, qty2) => { return qty1.qty > qty2.qty })
        }
        else if (salesQuantitySorting == "descending") {
            sorted_products_sold.sort((qty1, qty2) => { return qty1.qty < qty2.qty })
        }

        setProductsSold(sorted_products_sold)
    }

    const handleSalesDescriptionOrderChange = () => {
        var sorted_products_sold = [...productsSold]
        if (salesDescriptionSorting == "ascending") {
            sorted_products_sold.sort((description1, description2) => { return description1.description > description2.description })
        }
        else if (salesDescriptionSorting == "descending") {
            sorted_products_sold.sort((description1, description2) => { return description1.description < description2.description })
        }

        setProductsSold(sorted_products_sold)
    }

    const determineLeaderboard = () => {
        var tempProductSoldList = []
        var tempProductSoldListId = []
        var tempProductSoldListQty = []
        var tempProductSoldListTransacItem = []
        var tempProductSoldListTransac = []
        var tempProductInfo = {
            "id": "",
            "description": "",
            "img": "",
            "transaction": [],
            "qty": 0
        }

        var record_date
        salesRecordCollection.map((sale) => {
            record_date = new Date(sale.transaction_date)
            record_date.setHours(0, 0, 0, 0)
            if (!sale.isVoided) {
                if ((record_date.getTime() >= firstday_month.getTime() && record_date.getTime() <= lastday_month.getTime())) {
                    sale.product_list.map((product) => {
                        if (tempProductSoldListId.indexOf(product.itemId) >= 0) {
                            tempProductSoldListQty[tempProductSoldListId.indexOf(product.itemId)] = tempProductSoldListQty[tempProductSoldListId.indexOf(product.itemId)] + product.itemQuantity
                            tempProductSoldListTransac[tempProductSoldListId.indexOf(product.itemId)].push(sale.id)
                        }
                        else {
                            tempProductSoldListId.push(product.itemId)
                            tempProductSoldListQty.push(product.itemQuantity)
                            tempProductSoldListTransacItem.push(sale.id)
                            tempProductSoldListTransac.push(tempProductSoldListTransacItem)
                        }
                    })
                }
            }
        })
        if (stockcardCollection !== undefined) {
            stockcardCollection.map((product) => {
                tempProductInfo = {
                    "id": "",
                    "description": "",
                    "img": "",
                    "transaction": [],
                    "qty": 0
                }
                if (tempProductSoldListId.indexOf(product.id) >= 0) {
                    tempProductInfo.id = tempProductSoldListId[tempProductSoldListId.indexOf(product.id)]
                    tempProductInfo.description = product.description
                    tempProductInfo.img = product.img
                    tempProductInfo.transaction = tempProductSoldListTransac[tempProductSoldListId.indexOf(product.id)]
                    tempProductInfo.qty = Number(tempProductSoldListQty[tempProductSoldListId.indexOf(product.id)])

                    tempProductSoldList.push(tempProductInfo)
                }
            })

            var tempSalesTotal = 0

            tempProductSoldList.map((product) => {
                tempSalesTotal = tempSalesTotal + product.qty
            })
            
            var sorted_products_sold = [... tempProductSoldList]
            sorted_products_sold.sort((prod1, prod2)=>{return prod1.qty < prod2.qty})
            setTopProducts(sorted_products_sold)
        }
    }

    function Notification() {
        return (
            <ListGroup>
                {prodNearROP !== undefined ?
                    prodNearROP.length !== 0 ?
                        prodNearROP.map((prod) => {
                            return (
                                <ListGroup.Item key={prod.id}>
                                    <div className="row px-2">
                                        <div className="col">
                                            <div className="row">
                                                <span><small>{prod.id.substring(0, 9)}</small> | <span style={{ color: '#4172c1' }}> <strong>{prod.description}</strong></span></span>
                                            </div>
                                        </div>
                                        <div className="col ">
                                            <div className="float-end">

                                                {prod.analytics.daysROP > 0 ?
                                                    <small><strong>{prod.analytics.daysROP}</strong> day(s)<br /> before Restocking</small>
                                                    :
                                                    prod.analytics.daysROP === 0 ?
                                                        <small>Restock <strong>Today</strong></small>
                                                        :
                                                        <small><strong>{Math.abs(prod.analytics.daysROP)}</strong> day(s)<br /> past Restocking</small>
                                                }

                                            </div>
                                        </div>
                                        <div className="row">
                                            <small className="text-muted float-end">Date to Restock: {moment(prod.analytics.dateReorderPoint).format('LL')}</small>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            )
                        })
                        :
                        <div className="full-column text-center">
                            No Product near Restocking
                        </div>                        
                    :
                    <Spinner
                        color1="#b0e4ff"
                        color2="#fff"
                        textColor="rgba(0,0,0, 0.5)"
                        className="w-100 h-100"
                    />
                }

            </ListGroup>
        )
    }

    function DisplayTopProducts(props) {
        if (topProducts.length >= 4) {
            return (
                <>
                    <div id="top-products-first" className="d-flex align-items-center justify-content-center flex-column col-4">
                        <div className="ranking-container">
                            <div className="ranking">
                                1
                            </div>
                        </div>
                        <img src={topProducts[0].img} style={{ height: 'auto', width: '100px', aspectRatio: '1 / 1' }} />
                        <div>{topProducts[0].description}</div>
                    </div>
                    <div className="d-flex align-items-center justify-content-start flex-column col-8 top-products-others">
                        <div className="row w-100 my-3">
                                <div className="ranking-container">
                                    <div className="ranking">
                                        2
                                    </div>
                                </div>
                            <div className="d-flex align-items-center justify-content-start col-12">
                                <img src={topProducts[1].img} style={{ height: '50px', width: 'auto', aspectRatio: '1 / 1' }} />
                                <div className="ps-3">{topProducts[1].description}</div>
                            </div>
                        </div>
                        <div className="row w-100 my-3">
                                <div className="ranking-container">
                                    <div className="ranking">
                                        3
                                    </div>
                                </div>
                            <div className="d-flex align-items-center justify-content-start col-12">
                                <img src={topProducts[2].img} style={{ height: 'auto', width: '50px', aspectRatio: '1 / 1' }} />
                                <div className="ps-3">{topProducts[2].description}</div>
                            </div>
                        </div>
                        <div className="row w-100 my-3">
                                <div className="ranking-container">
                                    <div className="ranking">
                                        4
                                    </div>
                                </div>
                            <div className="d-flex align-items-center justify-content-start col-12">
                                <img src={topProducts[3].img} style={{ height: '50px', width: 'auto', aspectRatio: '1 / 1' }} />
                                <div className="ps-3">{topProducts[3].description}</div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
        else if (topProducts.length == 3) {
            return (
                <>
                    <div className="d-flex align-items-center justify-content-center col-6">
                        <img src={topProducts[0].img} style={{ height: '70px', width: 'auto', aspectRatio: '1 / 1' }} />
                        {topProducts[0].description}
                    </div>
                    <div className="d-flex align-items-center justify-content-center col-3">
                        <div className="row">

                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center col-3">
                        <div className="row">

                        </div>
                    </div>
                </>
            )
        }
        else if (topProducts.length < 3 && topProducts.length > 0) {
            return (
                <>
                    <div className="d-flex align-items-center justify-content-center col-6">
                        <img src={topProducts[0].img} style={{ height: '70px', width: 'auto', aspectRatio: '1 / 1' }} />
                        {topProducts[0].description}
                    </div>
                    <div className="d-flex align-items-center justify-content-center col-6">
                        <div className="row">

                        </div>
                    </div>
                </>
            )
        }
        else if(topProducts.length == 0)
        {
            return(
                    <div className="d-flex align-items-center justify-content-center col-12 p-5">
                        <h4>No sales yet</h4>
                    </div>
            )
        }
        else {
            return (
                <div>
                    <div className="d-flex align-items-center justify-content-center col-12">
                        <div style={{ height: '70px', width: 'auto' }}>
                            <Spinner
                                color1="#b0e4ff"
                                color2="#fff"
                                textColor="rgba(0,0,0, 0.5)"
                                className="w-100 h-100"
                            />
                        </div>
                    </div>
                </div>
            )

        }
    }

    function purchaseTable() {
        return (
            productsBought !== undefined ?
                productsBought.length !== 0 ?
                    <Table className="records-table white">
                        <thead>
                            <tr>
                                <th className="pth text-center">
                                    <button
                                        className="plain-button"
                                        onClick={() => {
                                            purchaseDescriptionSorting == "ascending" ? setPurchaseDescriptionSorting("descending") : setPurchaseDescriptionSorting("ascending");
                                            setPurchaseQuantitySorting("unsorted")
                                        }}
                                    >
                                        Product
                                        <sup className={"sort-caret" + (purchaseDescriptionSorting == "ascending" ? " active" : "")}>&#9650;</sup>
                                        <sup className={"sort-caret" + (purchaseDescriptionSorting == "descending" ? " active" : "")}>&#9660;</sup>
                                    </button>
                                </th>
                                <th className="pth text-center">Transaction</th>
                                <th className="pth text-center">
                                    <button
                                        className="plain-button"
                                        onClick={() => {
                                            purchaseQuantitySorting == "ascending" ? setPurchaseQuantitySorting("descending") : setPurchaseQuantitySorting("ascending");
                                            setPurchaseDescriptionSorting("unsorted")
                                        }}
                                    >
                                        Quantity
                                        <sup className={"sort-caret" + (purchaseQuantitySorting == "ascending" ? " active" : "")}>&#9650;</sup>
                                        <sup className={"sort-caret" + (purchaseQuantitySorting == "descending" ? " active" : "")}>&#9660;</sup>

                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsBought.map((purchase, index) => (
                                <tr 
                                    key={index}
                                    className="clickable"
                                    onClick={() => { setProductToView(purchase.id); setShowProductQuickViewModal(true) }}
                                >
                                    <td className="start-column">
                                        <div className="row m-0 p-0">
                                            <div className="col-3 text-center">
                                                {purchase.img === undefined || purchase.img == "" || purchase.img == " " ?
                                                    <span>
                                                        <div className="data-img d-flex align-items-center justify-content-center" style={{ width: '90px', height: 'auto', backgroundColor: '#f3f5f9' }}>
                                                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{ width: '80%' }} />
                                                        </div>
                                                    </span>
                                                :
                                                    <img src={purchase.img} style={{ width: '90px', height: 'auto' }} />
                                                }
                                            </div>
                                            <div className="col-9">
                                                <h5>{purchase.description}</h5>
                                                <h6>{purchase.id.substring(0, 9)}</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="center-column text-center">
                                        {purchase.transaction.map((transac_id, i) => (
                                            <span
                                                key={i}
                                            >
                                                {transac_id.substring(0, 7)}
                                                {i != purchase.transaction.length - 1 ? <span>, </span> : <></>}
                                            </span>
                                        ))}
                                    </td>
                                    <td className="end-column text-center">
                                        {purchase.qty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="2" className="pth text-center"></th>
                                <th className="pth text-center">{totalPurchases}</th>
                            </tr>
                        </tfoot>

                    </Table >
                    :
                    <Table className="records-table white">
                        <thead>
                            <tr>
                                <th className="pth text-center">Product</th>
                                <th className="pth text-center">Transaction</th>
                                <th className="pth text-center">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={3}
                                    className="full-column text-center"
                                >
                                    No purchases {dateSelected}
                                </td>

                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan="2" className="pth text-center"></th>
                                <th className="pth text-center">{totalPurchases}</th>
                            </tr>
                        </tfoot>

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
            productsSold !== undefined ?
                productsSold.length !== 0 ?
                    < Table className="records-table white" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">
                                    <button
                                        className="plain-button"
                                        onClick={() => {
                                            salesDescriptionSorting == "ascending" ? setSalesDescriptionSorting("descending") : setSalesDescriptionSorting("ascending");
                                            setSalesQuantitySorting("unsorted")
                                        }}
                                    >
                                        Product
                                        <sup className={"sort-caret" + (salesDescriptionSorting == "ascending" ? " active" : "")}>&#9650;</sup>
                                        <sup className={"sort-caret" + (salesDescriptionSorting == "descending" ? " active" : "")}>&#9660;</sup>
                                    </button>
                                </th>
                                <th className="pth text-center">Transaction</th>
                                <th className="pth text-center">
                                    <button
                                        className="plain-button"
                                        onClick={() => {
                                            salesQuantitySorting == "ascending" ? setSalesQuantitySorting("descending") : setSalesQuantitySorting("ascending");
                                            setSalesDescriptionSorting("unsorted")
                                        }}
                                    >
                                        Quantity
                                        <sup className={"sort-caret" + (salesQuantitySorting == "ascending" ? " active" : "")}>&#9650;</sup>
                                        <sup className={"sort-caret" + (salesQuantitySorting == "descending" ? " active" : "")}>&#9660;</sup>

                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {productsSold.map((sale, index) => (
                                <tr 
                                    key={index}
                                    className="clickable"
                                    onClick={() => { setProductToView(sale.id); setShowProductQuickViewModal(true) }}
                                >
                                    <td className="start-column">
                                        <div className="row m-0 p-0">
                                            <div className="col-3 text-center">
                                                {sale.img === undefined || sale.img == "" || sale.img == " " ?
                                                    <span>
                                                        <div className="data-img d-flex align-items-center justify-content-center" style={{ width: '90px', height: 'auto', backgroundColor: '#f3f5f9' }}>
                                                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{ width: '80%' }} />
                                                        </div>
                                                    </span>
                                                :
                                                    <img src={sale.img} style={{ width: '90px', height: 'auto' }} />
                                                }
                                            </div>
                                            <div className="col-9">
                                                <h5>{sale.description}</h5>
                                                <h6>{sale.id.substring(0, 9)}</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        className="center-column"
                                    >
                                        {sale.transaction.map((transac_id, i) => (
                                            <span
                                                key={transac_id}
                                            >
                                                {transac_id.substring(0, 7)}
                                                {i != sale.transaction.length - 1 ? <span>, </span> : <></>}
                                            </span>
                                        ))}
                                    </td>
                                    <td
                                        className="end-column text-center"
                                    >
                                        {sale.qty}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tbody>
                            <tr>
                                <th colSpan="2" className="pth text-center"></th>
                                <th className="pth text-center">{totalSales}</th>
                            </tr>
                        </tbody>

                    </Table >
                    :
                    < Table className="records-table white" >
                        <thead className="bg-primary">
                            <tr>
                                <th className="pth text-center">Product</th>
                                <th className="pth text-center">Transaction</th>
                                <th className="pth text-center">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td
                                    colSpan={3}
                                    className="full-column text-center"
                                >
                                    No sales {dateSelected}
                                </td>

                            </tr>
                        </tbody>
                        <tbody>
                            <tr>
                                <th colSpan="2" className="pth text-center"></th>
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

    //Read stock card collection from database
    useEffect(() => {
        if (userID !== undefined) {
            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", userID), where("analytics.analyticsBoolean", "==", true), orderBy("analytics.daysROP", "asc"));

            const unsub = onSnapshot(q, (snapshot) =>
                setProdNearROP(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])


    function Notification() {
        return (
            <ListGroup className='scrollbar' style={{ height: '200px' }}>
                {prodNearROP !== undefined ?
                    prodNearROP.length !== 0 ?
                        prodNearROP.map((prod) => {
                            return (
                                <ListGroup.Item key={prod.id}>
                                    <div className="row px-2">
                                        <div className="col">
                                            <div className="row">
                                                <span><small>{prod.id.substring(0, 9)}</small> | <span style={{ color: '#4172c1' }}> <strong>{prod.description}</strong></span></span>
                                            </div>
                                        </div>
                                        <div className="col ">
                                            <div className="float-end">

                                                {prod.analytics.daysROP > 0 ?
                                                    <small><strong>{prod.analytics.daysROP}</strong> day(s)<br /> before Restocking</small>
                                                    :
                                                    prod.analytics.daysROP === 0 ?
                                                        <small>Restock <strong>Today</strong></small>
                                                        :
                                                        <small><strong>{Math.abs(prod.analytics.daysROP)}</strong> day(s)<br /> past Restocking</small>
                                                }

                                            </div>
                                        </div>
                                        <div className="row">
                                            <small className="text-muted float-end">Date to Restock: {moment(prod.analytics.dateReorderPoint).format('LL')}</small>
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            )
                        })
                        :
                        <div className="full-column text-center">
                            No Product near Restocking
                        </div>                        
                    :
                    <Spinner
                        color1="#b0e4ff"
                        color2="#fff"
                        textColor="rgba(0,0,0, 0.5)"
                        className="w-100 h-100"
                    />
                }

            </ListGroup>
        )
    }


    return (
        <div>
            <UserRouter
                route='/home'
            />
            <Navigation
                page='/home'
            />
            <ProductQuickView
                show={showProductQuickViewModal}
                onHide={() => setShowProductQuickViewModal(false)}
                productid={productToView}
            />
            <div id="contents" className="row">
                <div className="row py-4 px-5">
                    <div className="sidebar">
                        <Card className="sidebar-card">
                            <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                                <h5><strong>Notifications</strong></h5>
                            </Card.Header>
                            <Card.Body>
                                <Notification />
                            </Card.Body>
                        </Card>
                        <Card id="top-products" className="sidebar-card">
                            <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                                <h5 id="top-products-badge"><strong>Top Selling Products</strong></h5>
                            </Card.Header>
                            <Card.Body>
                                <div id="top-products-content" className="row p-0 m-0 d-flex align-items-center justify-content-center">
                                    {topProducts === undefined ?
                                        <Spinner
                                            color1="#b0e4ff"
                                            color2="#fff"
                                            textColor="rgba(0,0,0, 0.5)"
                                            className="w-50 h-50 p-2"
                                        />
                                    :
                                        <DisplayTopProducts />
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
                    <div className="divider sm">

                    </div>
                    <div className="data-contents p-3">
                        <Card className="sidebar-card">
                            <Card.Header className="py-3 text-center left-curve right-curve">
                                {userProfile === undefined ?
                                    <></>
                                :
                                    <div className="py-2" style={{ color: '#4172c1' }}>
                                        <h2><strong>{userProfile.bname}</strong></h2>
                                    </div>
                                }
                                <div id="summary-report-options" className="interrelated-options">
                                    <a
                                        className={dateSelected == "today" ? "start-option active" : "start-option"}
                                        onClick={() => { setDateSelected("today") }}
                                    >
                                        Today
                                    </a>
                                    <a
                                        className={dateSelected == "yesterday" ? "center-option divider active" : "center-option divider"}
                                        onClick={() => { setDateSelected("yesterday") }}
                                    >
                                        Yesterday
                                    </a>
                                    <a
                                        className={dateSelected == "this week" ? "center-option active" : "center-option"}
                                        onClick={() => { setDateSelected("this week") }}
                                    >
                                        This Week
                                    </a>
                                    <a
                                        className={dateSelected == "this month" ? "end-option active" : "end-option"}
                                        onClick={() => { setDateSelected("this month") }}
                                    >
                                        This Month
                                    </a>
                                </div>
                                <h4 className="mb-2 py-2"><strong>Summary Report</strong></h4>
                                <h5 className="yellow-strip subtitle left-full-curve right-full-curve p-2">{handleDateDisplay()}</h5>
                            </Card.Header>
                            <Card.Body className="folder-style mt-2">
                                <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                                    <Nav variant="pills" defaultActiveKey={0}>
                                        <Nav.Item>
                                            <Nav.Link eventKey={0}>
                                                <Exit
                                                    color={'#0d6efd'}
                                                    height="25px"
                                                    width="25px"
                                                    className="me-2"
                                                />
                                                Sales
                                            </Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey={1}>
                                                <Enter
                                                    color={'#0d6efd'}
                                                    height="25px"
                                                    width="25px"
                                                    className="me-2"
                                                />
                                                Purchases
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