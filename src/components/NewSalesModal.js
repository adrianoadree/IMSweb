import React from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, getDoc, where } from "firebase/firestore";
import moment from "moment";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus, faY } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function NewSalesModal(props) {





    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [productIds, setProductIds] = useState([]); // array of prod id
    const [prodList, setProdList] = useState([])

    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [salesCounter, setSalesCounter] = useState(0); // sales counter
    const [transactionIssuer, setTransactionIssuer] = useState("") // default purchaser in web

    const [newNote, setNewNote] = useState(""); // note form input
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    var curr = new Date()
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD')
    const [newDate, setNewDate] = useState(today); // stockcardCollection variable
    const [buttonBool, setButtonBool] = useState(true); //button disabler


    //---------------------FUNCTIONS---------------------





    //set Product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
    }, [items])


    //set Product ids
    useEffect(() => {
        setProdList()
        let arrObj = []
        if (items !== undefined) {
            items.map((prod) => {
                let person = {
                    itemId: prod.itemId,
                    itemName: prod.itemName,
                    itemQuantity: Number(prod.itemQuantity),
                    itemPPrice: Number(prod.itemPPrice),
                    itemSPrice: Number(prod.itemSPrice),
                    itemQuantity: Number(prod.itemQuantity),
                    itemCurrentQuantity: Number(prod.itemCurrentQuantity),
                    itemNewQuantity: Number(prod.itemCurrentQuantity) - Number(prod.itemQuantity)
                }
                arrObj.push(person)
            })
        }
        setProdList(arrObj)
    }, [items])


    //fetch user collection from database
    useEffect(() => {
        if (userID === undefined) {
            const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {
            const q = query(userCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;

        }
    }, [userID])

    //assign profile and purchase counter
    useEffect(() => {
        userCollection.map((metadata) => {
            setSalesCounter(metadata.salesId)
            setUserProfileID(metadata.id)
            metadata.accounts.map((account) => {
                if (account.isAdmin) {
                    setTransactionIssuer(account)
                }
            })
        });
    }, [userCollection])

    //Read stock card collection from database
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
            const q = query(collectionRef, where("user", "==", userID), where("qty", ">=", 1));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])


    //Read and set data from stockcard document
    useEffect(() => {
        if (itemName != undefined) {

            const unsub = onSnapshot(doc(db, "stockcard", itemId), (doc) => {
                if (doc.data() != undefined) {
                    setItemName(doc.data().description)
                    setItemCurrentQuantity(doc.data().qty)
                    setItemSPrice(doc.data().s_price)
                    setItemPPrice(doc.data().p_price)
                }
            }, (error) => {
            });
        }
    }, [itemId])

    useEffect(() => {
        if (props.onHide) {
            clearFields()
        }
    }, [props.onHide])

    const clearFields = () => {
        setNewDate(today)
        setProductIds([])
        setItems([]);
        setNewNote("");
    }

    //----------------------Start of Dynamic form functions----------------------
    const addItem = event => {
        event.preventDefault();
        setItems([
            ...items,
            {
                itemId: itemId,
                itemName: itemName,
                itemPPrice: Number(itemPPrice),
                itemSPrice: Number(itemSPrice),
                itemQuantity: Number(itemQuantity),
                itemCurrentQuantity: Number(itemCurrentQuantity),
                itemNewQuantity: Number(itemCurrentQuantity) - Number(itemQuantity),
                averageDailySales: Number(averageDailySales),
                highestDailySales: Number(highestDailySales),
                averageLeadtime: Number(averageLeadtime),
                safetyStock: Number(safetyStock),
                reorderPoint: Number(reorderPoint),
                daysROP: Number(daysROP),
                dateReorderPoint: dateReorderPoint,
                analyticsBoolean: analyticsBoolean
            }
        ]);
        setItemId("IT999999");
        setItemQuantity(1);
    };

    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
        const ids = [...productIds]
        ids.splice(index, 1)
        setProductIds(ids)
    }

    //ButtonDisabler
    useEffect(() => {
        if (itemId != "IT999999" && itemQuantity <= itemCurrentQuantity && itemQuantity > 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemQuantity])
    //ButtonDisabler
    useEffect(() => {
        if (itemId != "IT999999" && itemQuantity <= itemCurrentQuantity && itemQuantity > 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemId])

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    const createFormat = () => {
        var format = salesCounter + "";
        while (format.length < 5) { format = "0" + format };
        format = "SR" + format + '@' + userID;
        return format;
    }



    //add document to database
    const addRecord = async () => {
        setDoc(doc(db, "sales_record", createFormat()), {
            user: userID,
            transaction_number: createFormat().substring(0, 7),
            transaction_note: newNote,
            transaction_date: newDate,
            product_list: prodList,
            product_ids: productIds,
            isVoided: false,
            issuer: transactionIssuer.name
        });
        //update stockcard.qty function
        updateQuantity()
        updateSalesDocNum() //update variables.salesDocNum function
        successToast()
        

        props.onHide()
    }

    //update stockcard.qty function
    function updateQuantity() {
        items.map((items) => {

            const stockcardRef = doc(db, "stockcard", items.itemId);

            updateDoc(stockcardRef, {
                qty: items.itemNewQuantity,
                "analytics.averageDailySales": Number(items.averageDailySales),
                "analytics.highestDailySales": Number(items.highestDailySales),
                "analytics.safetyStock": Number(items.safetyStock),
                "analytics.reorderPoint": Number(items.reorderPoint),
                "analytics.daysROP": Number(items.daysROP),
                "analytics.dateReorderPoint": items.dateReorderPoint,
                "analytics.analyticsBoolean": items.analyticsBoolean

            });

        })
    }


    //update variables.salesDocNum function
    function updateSalesDocNum() {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { salesId: Number(salesCounter) + 1 }

        updateDoc(userDocRef, newData)
    }


    //----------------------End of addRecord functions----------------------


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    // =================================================COMPUTE ANALYTIC VARIABLES =================================================
    const [stockcardDoc, setStockcardDoc] = useState(); //
    const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection
    const [arrDate, setArrDate] = useState();
    const [minDate, setMinDate] = useState()
    const [max, setMax] = useState()
    const [min, setMin] = useState()
    const [maxDate, setMaxDate] = useState(new Date())
    const [dateDifference, setDateDifference] = useState()
    const [salesQuery, setSalesQuery] = useState([])


    //ANALYTICS VARIABLE
    const [totalSales, setTotalSales] = useState()
    const [averageDailySales, setAverageDailySales] = useState(0); //average daily sales 
    const [highestDailySales, setHighestDailySales] = useState(0); //highest daily sales
    const [arrDailySales, setArrDailySales] = useState(); //highest daily sales

    const [arrayDailySales, setArrayDailySales] = useState([]); //highest daily sales


    const [minLeadtime, setMinLeadtime] = useState()
    const [maxLeadtime, setMaxLeadtime] = useState()
    const [averageLeadtime, setAverageLeadtime] = useState(0)
    const [safetyStock, setSafetyStock] = useState(0); // safetyStock
    const [reorderPoint, setReorderPoint] = useState(); // ReorderPoint
    const [daysROP, setDaysROP] = useState(); // days before ReorderPoint
    const [dateReorderPoint, setDateReorderPoint] = useState()
    const [daysDiffDateToOrder, setDaysDiffDateToOrder] = useState()
    const [transactionDates, setTransactionDates] = useState()
    const [analyticsBoolean, setAnalyticsBoolean] = useState(false)


    //query documents from sales_record that contains docId
    useEffect(() => {
        setSalesRecordCollection([])
        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("product_ids", "array-contains", itemId));

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [itemId])


    //success toastify
    const successToast = () => {
        toast.success("Generating " + createFormat().substring(0, 7), {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Zoom
        });
    }

    //array of dates of transaction of a product
    useEffect(() => {
        var temp = []
        setArrDate()
        if (salesQuery !== undefined) {
            salesQuery.map((sales) => {
                if (!temp.includes(sales.transaction_date)) {
                    temp.push(sales.transaction_date);
                }
            })
            setArrDate(temp)
        }
    }, [salesQuery])




    //access stockcard document
    useEffect(() => {
        async function readStockcardDoc() {
            const stockcardRef = doc(db, "stockcard", itemId)
            const docSnap = await getDoc(stockcardRef)
            if (docSnap.exists()) {
                setStockcardDoc(docSnap.data());
            }
        }
        readStockcardDoc()
    }, [itemId])


    useEffect(() => {
        if (salesRecordCollection !== undefined) {
            setSalesQuery([{
                id: createFormat(),
                user: userID,
                transaction_number: createFormat().substring(0, 7),
                transaction_note: "CURRENT TRANSACTION",
                transaction_date: newDate,
                product_list: {
                    itemId: itemId,
                    itemQuantity: Number(itemQuantity)
                },
                product_ids: [itemId]
            }, ...salesRecordCollection])
        }
    }, [newDate, salesRecordCollection, itemQuantity, itemId])



    useEffect(() => {
        arrayOfSalesDate()
    }, [salesRecordCollection, itemId])

    function arrayOfSalesDate() {
        let tempArr = []
        if (salesRecordCollection !== undefined) {
            salesRecordCollection.map((sales) => {
                if (!tempArr.includes(sales.transaction_date))
                    tempArr.push(sales.transaction_date)
            })
        }
        setTransactionDates(tempArr)
    }


    useEffect(() => {
        if (transactionDates !== undefined){
            if(transactionDates.length >= 5){
                setAnalyticsBoolean(true)
            }
            else{
                setAnalyticsBoolean(false)
            }
        }
    }, [transactionDates, itemId])





    //compute Total Sales
    useEffect(() => {
        let temp = 0
        salesRecordCollection.map((sales) => {
            sales.product_list.map((prod) => {
                if (prod.itemId === itemId) {
                    temp += prod.itemQuantity
                }
            })
        })
        setTotalSales(temp + Number(itemQuantity))
    }, [salesRecordCollection, itemQuantity])

    //compute Average Daily Sales
    useEffect(() => {
        setAverageDailySales()
        let x = 0
        let y = 0
        let z = 0
        x = totalSales
        y = dateDifference
        z = Number(totalSales / dateDifference)
        setAverageDailySales(Math.round(z))
    }, [totalSales, dateDifference])



    //compute array of Daily Sales
    useEffect(() => {
        setArrayDailySales()
        let tempArrQuantity = []
        salesRecordCollection.map((sales) => {
            sales.product_list.map((prod) => {
                if (prod.itemId === itemId) {
                    tempArrQuantity.push(prod.itemQuantity)
                }
            })
        })
        tempArrQuantity.push(Number(itemQuantity))
        setArrayDailySales(tempArrQuantity)
    }, [salesRecordCollection, itemQuantity])


    //initiate leadtime values
    useEffect(() => {
        setMinLeadtime()
        setMaxLeadtime()
        setAverageLeadtime()
        if (stockcardDoc !== undefined) {
            setMinLeadtime(stockcardDoc.analytics.leadtimeMinimum)
            setMaxLeadtime(stockcardDoc.analytics.leadtimeMaximum)
            setAverageLeadtime(stockcardDoc.analytics.leadtimeAverage)
        }
    }, [stockcardDoc])

    //set array of daily sales
    useEffect(() => {
        let tempMin = minDate
        let tempDate = tempMin
        let tempArrSales = []
        let tempVal = 0


        while (tempMin < maxDate) {
            tempDate = tempMin.toISOString().substring(0, 10)

            salesRecordCollection.map((value) => {
                if (value.transaction_date === tempDate) {
                    value.product_list.map((prod) => {
                        if (prod.itemId === itemId) {
                            tempVal += Number(prod.itemQuantity)
                        }
                    })
                }

            })
            if (tempDate === newDate) {
                tempVal += Number(itemQuantity)
            }
            if (tempVal !== 0) {
                tempArrSales.push(tempVal)
            }
            tempVal = 0
            tempMin.setDate(tempMin.getDate() + 1)
        }
        setArrDailySales(tempArrSales)
    }, [maxDate, minDate, newDate, itemId, itemQuantity, salesRecordCollection])

    //find Highest Daily Sales in arrDailySales
    useEffect(() => {
        findHighestDailySales()
    }, [arrDailySales])

    function findHighestDailySales() {
        setHighestDailySales(0)
        let tempVal = 0
        if (arrDailySales !== undefined) {
            arrDailySales.map((sales) => {
                if (tempVal < sales) {
                    tempVal = sales
                }
            })
        }
        setHighestDailySales(tempVal)
    }

    //compute SafetyStock
    useEffect(() => {

        let x = 0
        let y = 0
        let z = 0
        x = Number(highestDailySales) * Number(maxLeadtime)
        y = Number(averageDailySales) * Number(averageLeadtime)
        z = Number(x - y)

        setSafetyStock(Math.round(z))

    }, [highestDailySales, averageDailySales, maxLeadtime, averageLeadtime, salesQuery, salesRecordCollection])





    //compute reoderpoint
    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    useEffect(() => {
        setReorderPoint()
        let x = 0
        let y = 0
        let z = 0

        x = Number(averageDailySales * averageLeadtime)
        y = x + safetyStock
        z = Math.round(y)
        setReorderPoint(z)
    }, [safetyStock, averageDailySales, averageLeadtime])

    //compute days before ROP
    //formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage
    useEffect(() => {
        setDaysROP()
        if (stockcardDoc !== undefined) {
            let x = stockcardDoc.qty - reorderPoint
            let y = averageDailySales
            let a = (x / y)
            let z = Math.round(a)
            setDaysROP(z)
        }
    }, [averageDailySales, reorderPoint, stockcardDoc])


    function computeDaysToReorderPoint() {
        setDateReorderPoint()
        if (daysROP !== undefined) {
            let tempDate = new Date()
            let x
            let y
            y = Math.round(daysROP)
            x = tempDate.setDate(tempDate.getDate() + y)
            let z = new Date(x)
            z = moment(z).format('YYYY-MM-DD')
            setDateReorderPoint(z)
        }
    }

    useEffect(() => {
        computeDaysToReorderPoint()
    }, [daysROP, stockcardDoc])



    //search for min Date in array
    useEffect(() => {
        let tempMin
        let tempMax
        setMinDate()
        setMaxDate()
        if (arrDate !== undefined) {
            tempMin = new Date(
                Math.min(
                    ...arrDate.map(element => {
                        return new Date(element);
                    }),
                ),
            );

            tempMax = new Date(
                Math.max(
                    ...arrDate.map(element => {
                        return new Date(element);
                    }),
                ),
            );
            tempMax = tempMax.setDate(tempMax.getDate() + 1)
            let tempDate = new Date(tempMax)
            setMaxDate(tempDate)
            setMinDate(tempMin)
        }
    }, [arrDate, itemQuantity, itemId, newDate])

    //search for min Date in array
    useEffect(() => {
        let tempMin
        let tempMax
        setMin()
        setMax()
        if (arrDate !== undefined) {
            tempMin = new Date(
                Math.min(
                    ...arrDate.map(element => {
                        return new Date(element);
                    }),
                ),
            );

            tempMax = new Date(
                Math.max(
                    ...arrDate.map(element => {
                        return new Date(element);
                    }),
                ),
            );
            setMin(tempMin)
            setMax(tempMax)
        }
    }, [arrDate, itemQuantity, itemId, newDate])



    //search for min Date in array
    useEffect(() => {
        setDateDifference()
        var date1 = new Date(max)
        var date2 = new Date(min)
        let x = 0
        x = date1 - date2
        let TotalDays = Math.ceil(x / (1000 * 3600 * 24))
        if (TotalDays === 0) {
            TotalDays = 1
        }
        setDateDifference(TotalDays)
    }, [minDate, maxDate, newDate])

    useEffect(() => {
        console.log("min:", min)
        console.log("max:", max)

        console.log("highestDailySales:", highestDailySales)
        console.log("reorderPoint:", reorderPoint)
        console.log("daysROP: ", daysROP)
        console.log("averageDailySales: ", averageDailySales)
        console.log("dateDifference: ", dateDifference)
    

    }, [daysROP, reorderPoint, highestDailySales, averageDailySales, dateDifference])



    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
        >

            <Modal.Body >
                <div className="px-3 py-2">
                    <div className="module-header mb-4">
                        <h3 className="text-center">Generate a Sales Record</h3>
                    </div>
                    <div className="row">
                        <div className="col-4 px-3">
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>Transaction Number</label>
                                    <input type="text"
                                        readOnly
                                        className="form-control shadow-none no-click"
                                        placeholder=""
                                        defaultValue={createFormat().substring(0, 7)}
                                    />
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>
                                        Transaction Date
                                        <span style={{color: '#b42525'}}> *</span>
                                    </label>
                                    <input
                                        type='date'
                                        required
                                        className="form-control shadow-none"
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>Notes: (Optional)</label>
                                    <textarea
                                        className="form-control shadow-none"
                                        as="textarea"
                                        rows={5}
                                        onChange={(event) => { setNewNote(event.target.value); }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="row h-100 mx-0 my-2 mb-3 p-3 item-adding-container align-items-start">
                            <div className="row m-0 p-0">
                                <div className='col-12 text-center mb-2'>
                                    <h5><strong>Sales List</strong></h5>
                                    <div className="row p-0 m-0 py-1">
                                        <div className='col-9 p-1'>
                                            <select
                                                className="form-select shadow-none"
                                                value={itemId}
                                                onChange={e => setItemId(e.target.value)}
                                            >
                                                <option
                                                    value="IT999999">
                                                    Select Item
                                                </option>
                                                {stockcard.map((stockcard) => {
                                                    return (
                                                        <option
                                                            key={stockcard.id}
                                                            value={stockcard.id}
                                                        >{stockcard.description}</option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                        <div className='col-2 p-1'>
                                            <input
                                                className="form-control shadow-none"
                                                placeholder='Quantity'
                                                type='number'
                                                value={itemQuantity}
                                                min={1}
                                                max={itemCurrentQuantity}
                                                onChange={e => setItemQuantity(e.target.value)}
                                            />
                                        </div>
                                        <div className='col-1 p-1'>
                                            <Button
                                                onClick={addItem}
                                                disabled={buttonBool ? true : false}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="row p-0 m-0 py-1">
                                    <div className="col-12">
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr className='text-center bg-white'>
                                                    <th>Item ID</th>
                                                    <th>Item Description</th>
                                                    <th>Quantity</th>
                                                    <th>Remove</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item, index) => (
                                                    <tr
                                                        className='text-center'
                                                        key={index}>
                                                        <td>
                                                            {item.itemId === undefined ?
                                                                <></>
                                                                :
                                                                <>
                                                                    {item.itemId.substring(0, 9)}
                                                                </>
                                                            }
                                                        </td>
                                                        <td>{item.itemName}</td>
                                                        <td>{item.itemQuantity}</td>
                                                        <td>
                                                            <Button
                                                                size='sm'
                                                                variant="outline-danger"
                                                                onClick={() => handleItemRemove(index)}>
                                                                <FontAwesomeIcon icon={faMinus} />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer
                className="d-flex justify-content-center"
            >
                <Button
                    className="btn btn-danger"
                    style={{ width: "6rem" }}
                    onClick={() => props.onHide()}
                >
                    Cancel
                </Button>
                <Button
                    className="btn btn-light float-start"
                    style={{ width: "6rem" }}
                    disabled={items.length === 0 ? true : false}
                    onClick={() => { addRecord() }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );




}
export default NewSalesModal;