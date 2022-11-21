import { useEffect, useState, useRef } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where, getDoc } from "firebase/firestore";
import { Modal, Button, Form, Table } from "react-bootstrap";
import moment from "moment";
import { Warning } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewSupplierModal from '../components/NewSupplierModal'


function NewPurchaseModal(props) {


    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [newNote, setNewNote] = useState(""); // note form input
    const [productIds, setProductIds] = useState([]); // array of prod id

    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [purchaseCounter, setPurchaseCounter] = useState(0); // purchase counter
    const [transactionIssuer, setTransactionIssuer] = useState("") // default purchaser in web

    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [supplierCol, setSupplierCol] = useState([]); // stockcardCollection variable
    const [supplierModalShow, setSupplierModalShow] = useState(false); //add new sales record modal

    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSupplier, setItemSupplier] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const hasRun = useRef(false)
    var curr = new Date()
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD')
    const [newTransactionDate, setNewTransactionDate] = useState(today); // stockcardCollection variable
    const [newOrderDate, setNewOrderDate] = useState(today); // stockcardCollection variable


    //---------------------FUNCTIONS---------------------

    //set Product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
    }, [items])

    useEffect(()=>{
        console.log(itemSupplier)
        console.log(computeDelay())
    })

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
            setPurchaseCounter(metadata.purchaseId)
            setUserProfileID(metadata.id)
            metadata.accounts.map((account)=>{
                if(account.isAdmin)
                {
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
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])

    const handleDateChange = () => {
        if (newOrderDate === undefined || newOrderDate == "" || newOrderDate == " " || newOrderDate == 0) 
        {
            return "hide-warning-message"
        }
        else 
        {
            var t_date = new Date(newTransactionDate)
            t_date.setHours(0, 0, 0, 0)
            var o_date = new Date(newOrderDate)
            o_date.setHours(0, 0, 0, 0)
            if(t_date.valueOf() < o_date.valueOf())
            {
                return "Order date must preceed transaction date"
            }
            else
            {
                return "hide-warning-message"
            }
        }
      }

    //Read supplier collection from database
    useEffect(() => {
        if (userID === undefined) {

            const collectionRef = collection(db, "supplier")
            const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setSupplierCol(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {

            const collectionRef = collection(db, "supplier")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSupplierCol(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])

    useEffect(() => {
        if(supplierCol === undefined || supplierCol.length == 0)
        {

        }
        else
        {
            setItemSupplier(supplierCol[0].id)
        }
    }, [supplierCol])

    useEffect(()=>{
        if(props.onHide)
        {
          clearFields()
        }
      }, [props.onHide])

    const clearFields = () => {
        if(supplierCol === undefined || supplierCol.length == 0)
        {

        }
        else
        {
            setItemSupplier(supplierCol[0].id)
        }
        setProductIds([])
        setItems([]);
        setNewNote("");
        setNewTransactionDate(today)
        setNewOrderDate(today)
    }

    //Read and set data from stockcard document
    useEffect(() => {
        if (itemName != undefined) {
            const unsub = onSnapshot(doc(db, "stockcard", itemId), (doc) => {
                if(doc.data() != undefined) {
                    setItemName(doc.data().description)
                    setItemCurrentQuantity(doc.data().qty)
                    setItemSPrice(doc.data().s_price)
                    setItemPPrice(doc.data().p_price)
                }
            });
        }
    }, [itemId])



    //----------------------Start of Dynamic form functions----------------------
    const handleSupplierSelect = (value) => {
        if (value == "add-supplier") {
            setSupplierModalShow(true)
        }
        else
        {
            setItemSupplier(value)
        }
    }
    
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
                itemNewQuantity: Number(itemCurrentQuantity) + Number(itemQuantity)
            }
        ]);
        setItemId("IT999999");
        setItemQuantity(1);
    };

    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
        const ids = [... productIds]
        ids.splice(index, 1)
        setProductIds(ids)
    }

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    //create format
    const createFormat = () => {
        var format = purchaseCounter + "";
        while(format.length < 5) {format = "0" + format};
        format = "PR" + format + '@' + userID;
        return format;
     }

    const computeDelay = () => {
        var t_date = new Date(newTransactionDate)
        t_date.setHours(0, 0, 0, 0)
        var o_date = new Date(newOrderDate)
        o_date.setHours(0, 0, 0, 0)
        return (moment(t_date).diff(moment(o_date), "days"))
      }

    //add document to database
    const addRecord = async () => {
        if(newOrderDate !== undefined || newOrderDate != " " || newOrderDate != "" || newOrderDate != 0)
        {
            for(var i = 0; i < productIds.length; i++)
            {
                var stockcardItemAnalytics = {}
                await getDoc(doc(db, "stockcard", productIds[i])).then(docSnap => {
                    if (docSnap.exists()) {
                        stockcardItemAnalytics = docSnap.data().analytics
                    }
                    else
                    {
                
                    }
                })
                if(stockcardItemAnalytics.leadtimeMaximum < computeDelay())
                {
                    stockcardItemAnalytics.leadtimeMaximum = computeDelay()
                }
                if(stockcardItemAnalytics.leadtimeMinimum > computeDelay())
                {
                    stockcardItemAnalytics.leadtimeMinimum = computeDelay()
                }
                stockcardItemAnalytics.leadtimeAverage = Number((stockcardItemAnalytics.leadtimeMaximum + stockcardItemAnalytics.leadtimeMaximum)/2)
                updateDoc(doc(db, "stockcard", productIds[i]),{
                    analytics: stockcardItemAnalytics,
                })
            }
        }
        setDoc(doc(db, "purchase_record", createFormat()), {
            user: userID,
            transaction_number: createFormat().substring(0,7),
            transaction_note: newNote,
            transaction_date: newTransactionDate,
            transaction_supplier: itemSupplier,
            transaction_date: newTransactionDate,
            order_date: newOrderDate,
            product_list: items,
            product_ids: productIds,
            isVoided: false,
            issuer: transactionIssuer.name
        });
        updateQuantity()  //update stockcard.qty function
        updatePurchDocNum() //update variables.purchDocNum function
        successToast() //display success toast

        props.onHide()
    }

    //update stockcard.qty function
    function updateQuantity() {
        items.map((items) => {

            const stockcardRef = doc(db, "stockcard", items.itemId);

            // Set the "capital" field of the city 'DC'
            updateDoc(stockcardRef, {
                qty: items.itemNewQuantity
            });

        })
    }

    //update variables.purchDocNum function
    function updatePurchDocNum() {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { purchaseId: Number(purchaseCounter) + 1 }

        updateDoc(userDocRef, newData)
    }

    //success toastify
    const successToast = () => {
        toast.success('Purchase Transaction Successfully Recorded!', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    //----------------------End of addRecord functions----------------------


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    //current date
    useEffect(() => {

    }, [])


    useEffect(() => {
        if (!hasRun.current && newTransactionDate !== today) {
          hasRun.current = true
          setNewOrderDate(newTransactionDate)
        }
      },[newTransactionDate])

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
                        <h3 className="text-center">Generate a Purchase Record</h3>
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
                                        defaultValue={createFormat().substring(0,7)}
                                    />
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-6 ps-4'>
                                    <label>
                                        Transaction Date
                                        <span style={{color: '#b42525'}}> *</span>
                                    </label>
                                    <input
                                        type='date'
                                        required
                                        className="form-control shadow-none"
                                        value={newTransactionDate}
                                        onChange={e => setNewTransactionDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-6 ps-4">
                                    <label>
                                        Date Ordered
                                        <a
                                            className="ms-2"
                                            data-title="The date when the purchase order was placed"
                                        >
                                        <FontAwesomeIcon icon={faCircleInfo
                                        }/>
                                        </a>
                                    </label>
                                    <input
                                            type='date'
                                            className="form-control shadow-none"
                                            value={newOrderDate}
                                            onChange={e => setNewOrderDate(e.target.value)}
                                        />  
                                </div>
                                <div className="col-12 ps-4">
                                    <div 
                                        className={"field-warning-message red-strip my-1 m-0 " + (handleDateChange())}
                                    >
                                        {handleDateChange()}
                                    </div>  
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <NewSupplierModal
                                        show={supplierModalShow}
                                        onHide={() => setSupplierModalShow(false)}
                                    />
                                    <label>
                                        Supplier Name
                                        <span style={{color: '#b42525'}}> *</span>
                                    </label>
                                    <div className="d-flex justify-content-center">
                                        <select 
                                            required
                                            className="form-select shadow-none"
                                            value={itemSupplier}
                                            onChange={e => handleSupplierSelect(e.target.value)}
                                            >
                                                {supplierCol.map((supplier) => {
                                                    return (
                                                        <option
                                                            key={supplier.id}
                                                            value={supplier.id}
                                                        >
                                                            {supplier.supplier_name}
                                                        </option>
                                                    )
                                                })}
                                                
                                            <option
                                                value="add-supplier"
                                                className style={{fontStyle: 'italic'}}
                                            >
                                                Not on the list? Add a supplier
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                    <div className='col-12 ps-4'>
                                        <label>Notes: (Optional)</label>
                                        <textarea
                                            className="form-control shadow-none"
                                            as="textarea"
                                            rows={4}
                                            onChange={(event) => { setNewNote(event.target.value); }}
                                        />
                                    </div>
                            </div>
                        </div>
                        <div className="col-8">
                            <div className="row mx-0 h-100 my-2 mb-3 p-3 item-adding-container align-items-start">
                                <div className="row m-0 p-0">
                                    <div className='col-12 text-center mb-2'>
                                        <h5><strong>Purchase List</strong></h5>
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
                                                        min={1}
                                                        value={itemQuantity}
                                                        onChange={e => setItemQuantity(e.target.value)}
                                                    />
                                                </div>
                                                <div className='col-1 p-1'>
                                                    <Button
                                                        onClick={addItem}
                                                        disabled={itemId === "IT999999" ? true : false}
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
                                                                {item.itemId === undefined?
                                                                <></>
                                                                :
                                                                <>
                                                                {item.itemId.substring(0,9)}
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
                    disabled={items.length === 0 || (itemSupplier == "" || itemSupplier == " " || itemSupplier == 0) || handleDateChange() == "Order date must preceed transaction date"}
                    onClick={() => { addRecord() }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );



}

export default NewPurchaseModal;