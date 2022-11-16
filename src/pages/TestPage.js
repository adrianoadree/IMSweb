import { useEffect } from "react";
import Navigation from "../layout/Navigation";
import Barcode from 'react-jsbarcode'
import { Card, Table, OverlayTrigger, Alert, Tab, ToggleButtonGroup, ToggleButton, FormControl, Accordion, ListGroup, InputGroup } from "react-bootstrap";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import ToolTip from 'react-bootstrap/Tooltip';
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "react-bootstrap";
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, Delive, Car } from 'react-ionicons'
import { UserAuth } from '../context/AuthContext'
import { db } from '../firebase-config';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where, orderBy } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus, faTrashCan, faTriangleExclamation, faSearch, faTruck, faBarcode, faFileLines, faInbox, faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from 'loading-animations-react';
import { LineChart, Line, XAxis, YAxis, ReferenceDot, Legend, Tooltip, Label, ReferenceLine } from 'recharts';
import { Link } from 'react-router-dom';


function TestPage() {



    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [key, setKey] = useState('main');//Tab controller
    const [userID, setUserID] = useState("");

    const [docId, setDocId] = useState("xx"); //document Id
    const [stockcard, setStockcard] = useState(); // stockcardCollection variable
    const [stockcardDoc, setStockcardDoc] = useState(); //stockcard Document variable
    const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection
    const [filteredResults, setFilteredResults] = useState([])
    const [forecastingBoolean, setForecastingBoolean] = useState(false)
    const [whTemplates, setWhTemplates] = useState(
        [
            {
              description: "Convenience Store",
              specs: "5x5 | 25 spaces",
              img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fwarehouse_templates%2Fconvenience-store.png?alt=media&token=0dc2c3e5-2f3e-43bd-bbbd-4396cf9f9394",
              contents: 
              [
                {
                  "0": {
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "products": [],
                    "id": "WH06-A01"
                  },
                  "1": {
                    "id": "WH06-A02",
                    "isStorage": false,
                    "products": [],
                    "color": "pattern-white-tile"
                  },
                  "2": {
                    "products": [],
                    "id": "WH06-A03",
                    "color": "pattern-white-tile",
                    "isStorage": false
                  },
                  "3": {
                    "color": "pattern-white-tile",
                    "id": "WH06-A04",
                    "products": [],
                    "isStorage": false
                  },
                  "4": {
                    "id": "WH06-A05",
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "products": []
                  }
                },
                {
                  "0": {
                    "id": "WH06-B01",
                    "type": "shelf",
                    "orientation": "flip-left",
                    "products": [],
                    "remarks": " ",
                    "isStorage": true,
                    "color": "pattern-white-tile"
                  },
                  "1": {
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B02",
                    "products": []
                  },
                  "2": {
                    "color": "pattern-white-tile",
                    "id": "WH06-B03",
                    "remarks": " ",
                    "isStorage": true,
                    "type": "pallet",
                    "products": [],
                    "orientation": "flip-top"
                  },
                  "3": {
                    "products": [],
                    "id": "WH06-B04",
                    "type": "pallet",
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "orientation": "flip-top",
                    "remarks": ""
                  },
                  "4": {
                    "type": "shelf",
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-B05",
                    "products": [],
                    "orientation": "flip-right",
                    "remarks": " "
                  }
                },
                {
                  "0": {
                    "isStorage": true,
                    "products": [],
                    "id": "WH06-C01",
                    "remarks": " ",
                    "color": "pattern-white-tile",
                    "orientation": "flip-left",
                    "type": "shelf"
                  },
                  "1": {
                    "products": [],
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "id": "WH06-C02"
                  },
                  "2": {
                    "remarks": "",
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "type": "pallet",
                    "id": "WH06-C03",
                    "products": [],
                    "orientation": "flip-top"
                  },
                  "3": {
                    "type": "pallet",
                    "isStorage": false,
                    "id": "WH06-C04",
                    "products": [],
                    "color": "pattern-white-tile",
                    "remarks": "",
                    "orientation": "flip-top"
                  },
                  "4": {
                    "type": "shelf",
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "products": [],
                    "id": "WH06-C05",
                    "orientation": "flip-right",
                    "remarks": " "
                  }
                },
                {
                  "0": {
                    "id": "WH06-D01",
                    "orientation": "flip-left",
                    "isStorage": true,
                    "products": [],
                    "color": "pattern-white-tile",
                    "remarks": " ",
                    "type": "shelf"
                  },
                  "1": {
                    "isStorage": false,
                    "id": "WH06-D02",
                    "color": "pattern-white-tile",
                    "products": []
                  },
                  "2": {
                    "remarks": " ",
                    "isStorage": true,
                    "products": [],
                    "orientation": "flip-top",
                    "color": "pattern-white-tile",
                    "type": "pallet",
                    "id": "WH06-D03"
                  },
                  "3": {
                    "products": [],
                    "id": "WH06-D04",
                    "color": "pattern-white-tile",
                    "type": "pallet",
                    "remarks": "",
                    "orientation": "flip-top",
                    "isStorage": false
                  },
                  "4": {
                    "products": [],
                    "id": "WH06-D05",
                    "color": "pattern-white-tile",
                    "remarks": " ",
                    "orientation": "flip-right",
                    "isStorage": true,
                    "type": "shelf"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-E01"
                  },
                  "1": {
                    "products": [],
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "id": "WH06-E02"
                  },
                  "2": {
                    "id": "WH06-E03",
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "products": []
                  },
                  "3": {
                    "isStorage": false,
                    "id": "WH06-E04",
                    "color": "pattern-white-tile",
                    "products": []
                  },
                  "4": {
                    "products": [],
                    "color": "pattern-white-tile",
                    "isStorage": false,
                    "id": "WH06-E05"
                  }
                }
              ]
            },
            {
              description: "Meat Shop",
              specs: "3x6 | 18 Spaces",
              img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fwarehouse_templates%2Fmeatshop.png?alt=media&token=6ff5f67b-3042-4774-9a5a-04e47560f38c",
              contents: 
              [
                {
                  "0": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-A01",
                    "type": "freezer",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "1": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-A02",
                    "type": "freezer",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "2": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-A03",
                    "type": "freezer",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "3": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-A04",
                    "type": "freezer",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-A05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-A06"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B02"
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B04"
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-B06"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-C01",
                    "type": "shelf",
                    "orientation": "flip-bottom",
                    "remarks": " "
                  },
                  "1": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-white-tile",
                    "id": "WH06-C02",
                    "type": "shelf",
                    "orientation": "flip-bottom",
                    "remarks": " "
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-C03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-white-tile",
                    "id": "WH06-C04"
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-none",
                    "id": "WH06-C05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-none",
                    "id": "WH06-C06"
                  }
                }
              ]
            },
            {
              description: "Wholesaler",
              specs: "5X7 | 35 Spaces",
              img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fwarehouse_templates%2Fwholesaler.png?alt=media&token=3915a570-7dc3-458b-b87c-4865ec03d793",
              contents:
              [
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A02"
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A04"
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A06"
                  },
                  "6": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-A07"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B02",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B04",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B06",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "6": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-B07"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C02",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C04",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C06",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "6": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-C07"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D02",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D04",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": true,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D06",
                    "type": "pallet",
                    "orientation": "flip-top",
                    "remarks": " "
                  },
                  "6": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-D07"
                  }
                },
                {
                  "0": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E01"
                  },
                  "1": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E02"
                  },
                  "2": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E03"
                  },
                  "3": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E04"
                  },
                  "4": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E05"
                  },
                  "5": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E06"
                  },
                  "6": {
                    "products": [],
                    "isStorage": false,
                    "color": "pattern-smooth-concrete",
                    "id": "WH06-E07"
                  }
                }
              ]
            }
          ]
    )

    const addTemplates = async () => {
        const dox = doc(db, 'masterdata', "warehouse");
        await updateDoc(dox,{
            templates: whTemplates,
            
        });
    }
    //ANALYTICS Datas
   /* const [totalSales, setTotalSales] = useState(0); // total sales*/
    const [minLeadtime, setMinLeadtime] = useState()
    const [maxLeadtime, setMaxLeadtime] = useState()
    const [averageLeadtime, setAverageLeadtime] = useState()

    const [startDate, setStartDate] = useState(new Date(2022, 8, 1));

    const [stringStartDate, setStringStartDate] = useState("");

    const [today, setToday] = useState(new Date());
    const [stringToday, setStringToday] = useState("");


    const [arrDate, setArrDate] = useState([]);
    // ==================================== VARIABLES ====================================

    const [transactionDates, setTransactionDates] = useState()
    const [sortedTransactionDates, setSortedTransactionDates] = useState()
    const [totalSales, setTotalSales] = useState(0); // total sales

    const [date1, setDate1] = useState("")
    const [date2, setDate2] = useState("")
    const [date3, setDate3] = useState("")
    const [date4, setDate4] = useState("")
    const [date5, setDate5] = useState("")

    // ===================================================================================

    // ==================================== FUNCTIONS ====================================
    useEffect(() => {
        if (sortedTransactionDates !== undefined) {
            {
                sortedTransactionDates.length >= 5 ?
                    setForecastingBoolean(true)
                    :
                    setForecastingBoolean(false)
            }
        }
    }, [sortedTransactionDates])

    useEffect(() => {
        arrayOfSalesDate()
    }, [salesRecordCollection])

    function arrayOfSalesDate() {
        let tempArr = []
        salesRecordCollection.map((sales) => {
            if (!tempArr.includes(sales.transaction_date))
                tempArr.push(sales.transaction_date)
        })
        setTransactionDates(tempArr)
    }

    function sortDates() {
        setSortedTransactionDates()
        if (transactionDates !== undefined) {
            let temp = transactionDates.sort()
            setSortedTransactionDates(temp)
        }
    }

    //sort array of transaction dates
    useEffect(() => {
        sortDates()
    }, [transactionDates])

    useEffect(() => {
        console.log("transactionDates:", transactionDates)
    }, [transactionDates])


    useEffect(() => {
        console.log("sortedTransactionDates:", sortedTransactionDates)
    }, [sortedTransactionDates])

    //-------------------------------Chart Data function-------------------------

    useEffect(() => {
        setDate1("")
        setDate2("")
        setDate3("")
        setDate4("")
        setDate5("")
        if (sortedTransactionDates !== undefined) {
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
        }
    }, [sortedTransactionDates])




    // ===================================================================================
















    //---------------------FUNCTIONS---------------------

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    //---------------------ANALYTICS COMPUTATIONS---------------------


    useEffect(() => {
        setMinLeadtime()
        setMaxLeadtime()
        setAverageLeadtime()
        if (stockcardDoc !== undefined) {
            setMaxLeadtime(stockcardDoc.analytics.leadtimeMaximum)
            setMinLeadtime(stockcardDoc.analytics.leadtimeMinimum)
            setAverageLeadtime(stockcardDoc.analytics.leadtimeAverage)
        }
    }, [stockcardDoc])


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


    useEffect(() => {
        let tempStart = new Date(startDate)
        setStringStartDate(tempStart.toISOString().substring(0, 10))
    }, [startDate])




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


    //----------------------------CHART FUNCTIONS----------------------------




    function displayAccordion() {

        if (stockcardDoc !== undefined) {
            return (
                maxLeadtime !== 0 ?
                    <>
                        <div>
                            <div className='row mt-3'>

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
                                    <ReferenceLine y={stockcardDoc.min_qty}
                                        label={{ value: 'Minimum Quantity', position: 'insideRight', textAnchor: 'middle' }}
                                        stroke="gray" strokeDasharray="3 3" />

                                    <ReferenceLine y={stockcardDoc.max_qty}
                                        label={{ value: 'Maximum Quantity', position: 'insideRight', textAnchor: 'middle' }}
                                        stroke="gray" strokeDasharray="3 3" />

                                    <ReferenceLine y={stockcardDoc.analytics.reorderPoint}
                                        label={{ value: 'ReorderPoint', position: 'insideLeft', textAnchor: 'middle' }}
                                        stroke="#009933" strokeDasharray="3 3" />
                                    <ReferenceLine y={stockcardDoc.analytics.safetyStock}
                                        label={{ value: 'SafetyStock', position: 'insideLeft', textAnchor: 'middle' }}
                                        stroke="#ff9900" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="StockLevel" stroke="#ff0000"

                                        dot={{ stroke: '#8884d8', strokeWidth: 1, r: 10, strokeDasharray: '' }}
                                    />
                                    <Line type="monotone" dataKey="ProjectedStockLevel" stroke="#0066ff"
                                        dot={{ stroke: '#blue', strokeWidth: 1, r: 10, strokeDasharray: '' }}
                                    />
                                </LineChart>
                            </div>
                            <div className="row mt-3 px-4 py-2 bg-white">
                                <div className="col">
                                    <div className="row">
                                        <span>| <span style={{ color: '#009933' }}> <strong>ReorderPoint: </strong></span>{stockcardDoc.analytics.reorderPoint} unit(s)</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#ff9900' }}> <strong>SafetyStock: </strong></span>{stockcardDoc.analytics.safetyStock} unit(s)</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#1f3d7a' }}> <strong>Minimum Quantity: </strong></span>{stockcardDoc.min_qty} unit(s)</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#1f3d7a' }}> <strong>Maximum Quantity: </strong></span>{stockcardDoc.max_qty} unit(s)</span>
                                    </div>
                                </div>

                                <div className="col">

                                    <div className="row">
                                        <span>| <span style={{ color: '#009933' }}> <strong>ReorderPoint Date: </strong></span>{moment(stockcardDoc.analytics.dateReorderPoint).format('LL')}</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#1f3d7a' }}> <strong>Total Sales: </strong></span>{totalSales} unit(s)</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#1f3d7a' }}> <strong>Highest Daily Sales: </strong></span>{stockcardDoc.analytics.highestDailySales} unit(s)</span>
                                    </div>
                                    <div className="row">
                                        <span>| <span style={{ color: '#1f3d7a' }}> <strong>Average Daily Sales: </strong></span>{stockcardDoc.analytics.averageDailySales} unit(s)</span>
                                    </div>
                                </div>


                            </div>

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
    }

    const [errorBoolean, setErrorBoolean] = useState(false)

    useEffect(() => {
        {
            maxLeadtime === 0 ?
                setErrorBoolean(true)
                :
                setErrorBoolean(false)
        }
    }, [maxLeadtime])

    function displayChartError() {
        return (
            errorBoolean ?
                <>

                    < div className='mt-2 p-3' >
                        <Alert variant="danger">
                            <Alert.Heading className="text-center">
                                PREREQUISITE FOR FORECASTING
                            </Alert.Heading>
                            <p className="text-center">
                                Forecasting Chart only displays when product <strong>Leadtime</strong> has been set. To set product leadtime go to  <Alert.Link as={Link} to="/stockcard">Stockcard Page</Alert.Link>. <br />
                            </p>
                        </Alert>
                    </div >
                </>
                :
                <>
                    <div className='mt-2 p-3'>
                        <Alert variant="danger">
                            <Alert.Heading className="text-center">
                                PREREQUISITE FOR FORECASTING
                            </Alert.Heading>
                            <p className="text-center">
                                Forecasting Chart is only available for those products with <strong>Five(5) days</strong>  or more sales transaction days. to create a sales transaction, go to
                                <Alert.Link as={Link} to="/salesrecord">Sales Record</Alert.Link>. <br />
                            </p>
                        </Alert>
                    </div>
                </>


        )


    }

    //-----------------------------------------------------------------------

    useEffect(() => {
        console.log("sortedTransactionDates: ", sortedTransactionDates)
    }, [sortedTransactionDates])


    useEffect(() => {
        console.log("arrDate: ", arrDate)
    }, [arrDate])



    // ---------------------------------Q1 DATA---------------------------------

    const [query1, setQuery1] = useState()
    const [q1ProductList, setQ1ProductList] = useState()
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
        if (query1 !== undefined) {
            if (query1.length !== 0) {
                query1.map((q1) => {
                    setQ1ProductList(q1.product_list)
                })
            }
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

    today.setDate(today.getDate() + 14)



    useEffect(() => {
        let tempDate1 = new Date(q1Date)
        let tempDate2 = new Date(q1Date)
        let tempDate3 = new Date(q1Date)
        let tempDate4 = new Date(q1Date)

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

    }, [q1Date])
    //---------------------------------------------------------------------------


    const [fillerQuantity1, setFillerQuantity1] = useState(0)
    const [fillerQuantity2, setFillerQuantity2] = useState(0)
    const [fillerQuantity3, setFillerQuantity3] = useState(0)
    const [fillerQuantity4, setFillerQuantity4] = useState(0)
    const [tempQuantity1, setTempQuantity1] = useState(0)
    const [tempQuantity2, setTempQuantity2] = useState(0)
    const [tempQuantity3, setTempQuantity3] = useState(0)
    const [tempQuantity4, setTempQuantity4] = useState(0)


    useEffect(() => {
        setTempQuantity1(q1Quantity)
        setTempQuantity2(q1Quantity)
        setTempQuantity3(q1Quantity)
        setTempQuantity4(q1Quantity)
    }, [q1Quantity])


    useEffect(() => {
        if (stockcardDoc !== undefined) {
            setFillerQuantity1(Math.round(tempQuantity1 - (stockcardDoc.analytics.averageDailySales * 7)))
            setFillerQuantity2(Math.round(tempQuantity2 - (stockcardDoc.analytics.averageDailySales * 14)))
            setFillerQuantity3(Math.round(tempQuantity3 - (stockcardDoc.analytics.averageDailySales * 21)))
            setFillerQuantity4(Math.round(tempQuantity4 - (stockcardDoc.analytics.averageDailySales * 28)))
        }
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


    ];

    // ===================================== START OF SEARCH FUNCTION =====================================
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved


    const [searchValue, setSearchValue] = useState('');    // the value of the search field 
    const [searchResult, setSearchResult] = useState();    // the search result


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
            const results = stockcard.filter((user) => {
                return user.description.toLowerCase().startsWith(keyword.toLowerCase()) ||
                    user.id.toLowerCase().startsWith(keyword.toLowerCase());
                // Use the toLowerCase() method to make it case-insensitive
            });
            setSearchResult(results);
        } else {
            setSearchResult(stockcard);
            // If the text field is empty, show all users
        }

        setSearchValue(keyword);
    };

    // ====================================== END OF SEARCH FUNCTION ======================================








    return (

        <div className="row bg-light">
            <Navigation />

            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div id="contents" className="row">
                    <div className="row py-4 px-5">

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
                                                        <h5><strong>
                                                            {docId === undefined ?
                                                                <>
                                                                </>
                                                                :
                                                                <>
                                                                    {docId.substring(0, 9)}
                                                                </>
                                                            }
                                                        </strong></h5>
                                                    </div>
                                                    <div className="col-7 text-center">
                                                        {stockcardDoc !== undefined ?
                                                            <h5><strong>{stockcardDoc.description}</strong></h5>
                                                            :
                                                            <></>
                                                        }
                                                    </div>
                                                    <div className="col-2 text-center">
                                                        {stockcardDoc !== undefined ?
                                                            <h5><strong>{stockcardDoc.qty}</strong></h5>
                                                            :
                                                            <></>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {forecastingBoolean ?
                                            displayAccordion()
                                            :
                                            displayChartError()
                                        }







                                    </div>




                                </Tab.Pane>
                            </Tab.Content>
                        </div>
                    </div>
                </div>
            </Tab.Container >
        </div >
    )
}

