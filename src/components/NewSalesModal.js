import React from "react";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, getDoc, where } from "firebase/firestore";

import moment from "moment";

import { UserAuth } from '../context/AuthContext'

import { Button, Modal, Table } from "react-bootstrap";
import { faPlus, faMinus, } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewSalesModal(props) {
    const { user } = UserAuth(); // user credentials
    const [userID, setUserID] = useState(""); // user ID
    const [userCollection, setUserCollection] = useState([]);// user colletion
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [salesCounter, setSalesCounter] = useState(0); // sales counter

    const [stockcard, setStockcard] = useState([]); // stockcard collection

    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); // product id
    const [itemName, setItemName] = useState(""); // product description
    const [itemSPrice, setItemSPrice] = useState(0); //product selling price
    const [itemPPrice, setItemPPrice] = useState(0); //product purchase price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock

    var curr = new Date() // current date
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD') // change date format
    const [productIds, setProductIds] = useState([]); // product ids
    const [prodList, setProdList] = useState([]) // product list
    const [transactionIssuer, setTransactionIssuer] = useState("") // default purchaser in web
    const [newDate, setNewDate] = useState(today); // record date
    const [newNote, setNewNote] = useState(""); // record notes

    const [buttonBool, setButtonBool] = useState(true); // button disabler if form is incomplete

    //=============================== START OF STATE LISTENERS ===============================
    // set user id
    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    // fetch user collection from database
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

    // assign profile and purchase counter
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

    // set product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
    }, [items])

    // set product list
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

    // fetch stockcard collection
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

    // set data on product change from dropdown
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

    // disable save button if form is incomplete
    useEffect(() => {
        if (itemId != "IT999999" && itemQuantity <= itemCurrentQuantity && itemQuantity > 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemQuantity, itemId])

    // clear fields on modal close
    useEffect(() => {
        if (props.onHide) {
            clearFields()
        }
    }, [props.onHide])

    //================================ END OF STATE LISTENERS ================================
    //=================================== START OF HANDLERS ==================================

    const clearFields = () => {
        setNewDate(today)
        setProductIds([])
        setItems([]);
        setNewNote("");
    }

    // add items to list
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

    // remove items from list
    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
        const ids = [...productIds]
        ids.splice(index, 1)
        setProductIds(ids)
    }

    // create sales record id
    const createFormat = () => {
        var format = salesCounter + "";
        while (format.length < 5) { format = "0" + format };
        format = "SR" + format + '@' + userID;
        return format;
    }

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

    // ================================================= COMPUTE ANALYTIC VARIABLES =================================================
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

    // query documents from sales_record that contains docId
    useEffect(() => {
        setSalesRecordCollection([])
        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("product_ids", "array-contains", itemId));

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [itemId])

    // array of dates of transaction of a product
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

    // access stockcard document
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

    // set array of dates
    useEffect(() => {
        arrayOfSalesDate()
    }, [salesRecordCollection, itemId])

    // allow product analytics
    useEffect(() => {
        if (transactionDates !== undefined) {
            if (transactionDates.length >= 5) {
                setAnalyticsBoolean(true)
            }
            else {
                setAnalyticsBoolean(false)
            }
        }
    }, [transactionDates, itemId])

    // compute Total Sales
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

    // compute average daily sales
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

    // compute array of daily sales
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

    // initialize leadtime values
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

    // set array of daily sales
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

    // find highest daily sales in arrDailySales
    useEffect(() => {
        findHighestDailySales()
    }, [arrDailySales])

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

    // compute reoderpoint
    // formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    useEffect(() => {
        setReorderPoint()
        let x = 0
        let y = 0
        let z = 0
        x = (Number(averageDailySales) * Number(averageLeadtime))
        y = Number(x) + Number(safetyStock)
        z = Math.round(y)
        setReorderPoint(z)
    }, [safetyStock, averageDailySales, averageLeadtime])

    // compute days before ROP
    // formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage
    useEffect(() => {
        setDaysROP()
        if (stockcardDoc !== undefined) {
            setDaysROP((Number(stockcardDoc.qty) - Number(reorderPoint)) / averageDailySales)
        }
    }, [averageDailySales, reorderPoint, stockcardDoc])

    // compute reorder date
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

    // search for min Date in array
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

    // search for min Date in array
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

    // compute days  before reaching reorder point
    function computeDaysToReorderPoint() {
        setDateReorderPoint()
        if (daysROP !== undefined) {
            let tempDate = new Date()
            let x
            let y
            y = Math.round(daysROP)
            x = tempDate.setDate(tempDate.getDate() + Number(y))
            let z = new Date(x)
            z = moment(z).format('YYYY-MM-DD')
            setDateReorderPoint(z)
        }
    }
    
    // compute highest daily sales
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

    // fill array of dates
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
    //=================================== END OF HANDLERS  ===================================
    
    //============================== START OF DATABASE WRITERS ===============================
    // save sales record
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
        updateQuantity()
        updateSalesDocNum()
        successToast()
        props.onHide()
    }

    // update product data
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

    // update sales record counter
    function updateSalesDocNum() {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { salesId: Number(salesCounter) + 1 }
        updateDoc(userDocRef, newData)
    }
    //=============================== END OF DATABASE WRITERS ================================

    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
        >
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
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
                                        <span style={{ color: '#b42525' }}> *</span>
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