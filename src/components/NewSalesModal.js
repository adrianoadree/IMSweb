import React from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, getDoc, where } from "firebase/firestore";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function NewSalesModal(props) {





    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [productIds, setProductIds] = useState([]); // array of prod id

    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [salesCounter, setSalesCounter] = useState(0); // sales counter

    const [newNote, setNewNote] = useState(""); // note form input
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const [newDate, setNewDate] = useState(new Date()); // stockcardCollection variable
    const [buttonBool, setButtonBool] = useState(true); //button disabler


    //---------------------FUNCTIONS---------------------





    //set Product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
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
                daysROP: Number(daysROP)
            }
        ]);
        setItemId("IT999999");
        setItemQuantity(1);
    };

    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
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
            product_list: items,
            product_ids: productIds

        });

        setProductIds([])
        setItems([]);
        setNewNote("");
        updateQuantity()  //update stockcard.qty function
        updateSalesDocNum() //update variables.salesDocNum function

    }

    //update stockcard.qty function
    function updateQuantity() {
        items.map((items) => {

            const stockcardRef = doc(db, "stockcard", items.itemId);

            updateDoc(stockcardRef, {
                qty: items.itemNewQuantity,
                analytics:
                {
                    averageDailySales: Number(items.averageDailySales),
                    highestDailySales: Number(items.highestDailySales),
                    averageLeadtime: Number(items.averageLeadtime),
                    safetyStock: Number(items.safetyStock),
                    reorderPoint: Number(items.reorderPoint),
                    daysROP: Number(items.daysROP)
                }

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


    //current date
    useEffect(() => {
        let tempDate = new Date()
        setNewDate(tempDate.toISOString().substring(0, 10))

    }, [])


    // =================================================COMPUTE ANALYTIC VARIABLES =================================================
    const [stockcardDoc, setStockcardDoc] = useState(); //
    const [salesRecordCollection, setSalesRecordCollection] = useState(); // sales_record collection
    const [filteredResults, setFilteredResults] = useState()
    const [startDate, setStartDate] = useState(new Date(2022, 8, 1));
    const [today, setToday] = useState(new Date());
    const [arrDate, setArrDate] = useState();
    const [arrDailySales, setArrDailySales] = useState();
    const [arrAverageDailySales, setArrAverageDailySales] = useState();
    const [product_list, setProduct_list] = useState({ itemId: '', itemQuantity: 0 });
    const [currTransaction, setCurrTransaction] = useState()
    const [salesQuery, setSalesQuery] = useState()
    const [minDate, setMinDate] = useState()
    const [maxDate, setMaxDate] = useState(new Date())
    const [dateDifference, setDateDifference] = useState()

    //ANALYTICS VARIABLE
    const [averageDailySales, setAverageDailySales] = useState(); //average daily sales 
    const [highestDailySales, setHighestDailySales] = useState(); //highest daily sales

    const [minLeadtime, setMinLeadtime] = useState()
    const [maxLeadtime, setMaxLeadtime] = useState()
    const [averageLeadtime, setAverageLeadtime] = useState()
    const [safetyStock, setSafetyStock] = useState(); // safetyStock
    const [reorderPoint, setReorderPoint] = useState(); // ReorderPoint
    const [daysROP, setDaysROP] = useState(); // days before ReorderPoint



    //initiate leadtime values
    useEffect(() => {
        setMinLeadtime()
        setMaxLeadtime()
        if (stockcardDoc !== undefined) {
            setMinLeadtime(stockcardDoc.analytics_minLeadtime)
            setMaxLeadtime(stockcardDoc.analytics_maxLeadtime)
        }
    }, [stockcardDoc])


    //initiate leadtime values
    useEffect(() => {
        setAverageLeadtime()
        setAverageLeadtime((maxLeadtime + minLeadtime) / 2)
    }, [maxLeadtime && minLeadtime])


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


    //compute safetystock
    //formula to calculate SafetyStock = (highest daily sales * leadtime in days) - (average daily sales * leadtime)
    useEffect(() => {
        setSafetyStock()
        let x = highestDailySales * maxLeadtime
        let y = averageDailySales * averageLeadtime
        let z = Math.round(x - y)
        setSafetyStock(z)
    }, [averageDailySales])

    //compute reoderpoint
    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    useEffect(() => {
        setReorderPoint()
        let x = averageDailySales * averageLeadtime
        let y = safetyStock
        let a = (x + y)
        let z = Math.round(a)
        setReorderPoint(z)
    }, [safetyStock])

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


    useEffect(() => {
        console.log("highestDailySales: ", highestDailySales)
    }, [highestDailySales])


    useEffect(() => {
        console.log("averageDailySales: ", averageDailySales)
    }, [averageDailySales])

    useEffect(() => {
        console.log("averageLeadtime: ", averageLeadtime)
    }, [averageLeadtime])


    useEffect(() => {
        console.log("safetyStock: ", safetyStock)
    }, [safetyStock])

    useEffect(() => {
        console.log("reorderPoint: ", reorderPoint)
    }, [reorderPoint])

    useEffect(() => {
        console.log("daysROP: ", daysROP)
    }, [daysROP])




    useEffect(() => {
        setProduct_list({ itemId: itemId, itemQuantity: Number(itemQuantity) })
    }, [itemId])

    useEffect(() => {
        setProduct_list({ itemId: itemId, itemQuantity: Number(itemQuantity) })
    }, [itemQuantity])



    useEffect(() => {
        setCurrTransaction({
            user: userID,
            transaction_number: createFormat().substring(0, 7),
            transaction_note: "CURRENT TRANSACTION",
            transaction_date: newDate,
            product_list: product_list,
            product_ids: [itemId]
        })
    }, [product_list])


    useEffect(() => {
        if (salesRecordCollection !== undefined) {
            setSalesQuery([{ currTransaction }, ...salesRecordCollection])
        }
    }, [currTransaction])

    useEffect(() => {
        if (salesRecordCollection !== undefined) {
            setSalesQuery([{ currTransaction }, ...salesRecordCollection])
        }
    }, [salesRecordCollection])



    //query documents from sales_record that contains docId
    useEffect(() => {

        const collectionRef = collection(db, "sales_record")
        const q = query(collectionRef, where("product_ids", "array-contains", itemId));

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [itemId])



    //query documents from sales_record that contains docId
    useEffect(() => {
        if (salesQuery !== undefined) {

            setFilteredResults(salesRecordCollection.map((element) => {
                return {
                    ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === itemId)
                }
            }))
        }
    }, [salesQuery])

    //array of dates of transaction of a product
    useEffect(() => {
        var temp = []
        setArrDate()
        if (salesRecordCollection !== undefined) {
            salesRecordCollection.map((sales) => {
                if (!temp.includes(sales.transaction_date)) {
                    temp.push(sales.transaction_date);
                }
            })
            setArrDate(temp)
        }
    }, [salesQuery])


    //search for min Date in array
    useEffect(() => {
        let tempMin
        setMinDate()
        if (arrDate !== undefined) {
            tempMin = new Date(
                Math.min(
                    ...arrDate.map(element => {
                        return new Date(element);
                    }),
                ),
            );
            setMinDate(tempMin)
        }
    }, [arrDate])

    //search for min Date in array
    useEffect(() => {
        setDateDifference()
        let tempDays
        const diffTime = Math.abs(maxDate - minDate);
        tempDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDateDifference(tempDays)
    }, [minDate])


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
        setArrDailySales()
        setArrAverageDailySales()

        if (arrDate !== undefined) {
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
        }


        var tempEndDate = new Date(today.setDate(today.getDate() + 14))

        setToday(tempEndDate)
        setStartDate(new Date(2022, 8, 1))
    }, [filteredResults])



    //compute for averageDailySales
    useEffect(() => {
        var tempTotal = 0
        setAverageDailySales()
        if (arrDailySales !== undefined) {
            arrDailySales.map((val) => {
                tempTotal += val
            })
        }
        let x = (tempTotal / dateDifference)
        setAverageDailySales(Math.round(x))
    }, [arrDailySales])

    //compute for averageDailySales
    useEffect(() => {
        var tempTotal = 0
        setAverageDailySales()
        if (arrDailySales !== undefined) {
            arrDailySales.map((val) => {
                tempTotal += val
            })
        }
        let x = (tempTotal / dateDifference)
        setAverageDailySales(Math.round(x))
    }, [dateDifference])


    //compute for highestDailySales
    useEffect(() => {
        var temp = 0;
        setHighestDailySales()
        if (filteredResults !== undefined) {
            filteredResults.map((value) => {
                value.product_list.map((prod) => {
                    if (temp < prod.itemQuantity) {
                        temp = prod.itemQuantity
                    }
                })
            })
        }
        setHighestDailySales(temp)
    }, [arrDailySales])

    return (
        <Modal
            {...props}
            size="lg"
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
                    <div className="row my-2 mb-3">
                        <div className='col-3 ps-4'>
                            <label>Transaction Number</label>
                            <input type="text"
                                readOnly
                                className="form-control shadow-none no-click"
                                placeholder=""
                                defaultValue={createFormat().substring(0, 7)}
                            />
                        </div>
                        <div className='col-4 ps-4'>
                            <label>Transaction Date</label>
                            <input
                                type='date'
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
                                rows={1}
                                onChange={(event) => { setNewNote(event.target.value); }}
                            />
                        </div>
                    </div>
                    <div className="row my-2 mb-3 p-3 item-adding-container">
                        <div className="row m-0 p-0">
                            <div className='col-12 text-center mb-2'>
                                <h5><strong>Sales List</strong></h5>
                                <div className="row p-0 m-0 py-1">
                                    <div className='col-6 p-1'>
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
                                    <div className='col-4 p-1'>
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
                                    <div className='col-2 p-1'>
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