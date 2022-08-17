import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from '../context/AuthContext'


function NewPurchaseModal(props) {

    //---------------------VARIABLES---------------------
    const [stockcard, setStockcard] = useState([]); //stockcard collection
    const [varRef, setVarRef] = useState([]); // variable collection
    const [newNote, setNewNote] = useState(""); // note form input
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");


    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);



    //---------------------FUNCTIONS---------------------

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
        
    }, [{ user }])


    //fetch variable collection
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
            setVarRef(doc.data());
        });
        return unsub;
    }, [])

    //read collection from stockcard
    useEffect(() => {
        if(userID === undefined){

            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else{
            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])


    //Dynamic Add Product Button ------------------------------------------------------------
    const [productList, setProductList] = useState([{ productId: "", productQuantity: 1 }]);

    const handleProductChange = (e, index) => {
        const { name, value } = e.target
        const list = [...productList];
        list[index][name] = value
        setProductList(list)
    }
    const handleItemAdd = () => {
        setProductList([...productList, { productId: "", productQuantity: 1 }])
    }

    const handleItemRemove = (index) => {
        const list = [...productList]
        list.splice(index, 1)
        setProductList(list)
    }
    //End of Dynamic Button functions ---------------------------


    //add document to database
    const addRecord = async (purchDocNum, qty) => {
        setDoc(doc(db, "purchase_record", "PR" + Number(purchDocNum)), {
            document_date: date,
            document_note: newNote,
            document_number: "PR" + Number(purchDocNum),
            productList,
            user: user.uid
        });

        updatePurchDocNum(purchDocNum) //update variables.purchDocNum function
        updateQuantity(qty)  //update stockcard.qty function
        setProductList([{ productId: "", productQuantity: 1 }]) // set number of productList row to default
        successToast() //display success toast
    }


    const [multipleUpdate, setMultipleUpdate] = useState([]);//stockcard spec doc access

       //update stockcard.qty function
       function updateQuantity(qty) {
        productList.map((val) => {

            const unsub = onSnapshot(doc(db, "stockcard", val.productId), (doc) => {
                setMultipleUpdate(doc.data());
            });
            updateDoc(doc(db, "stockcard", val.productId), {
                qty: qty + Number(val.productQuantity)
            });
            return unsub;

        })
    }

    //update variables.purchDocNum function
    function updatePurchDocNum(purchDocNum) {
        const varColRef = doc(db, "variables", "var")
        const newData = { purchDocNum: Number(purchDocNum) + 1 }

        updateDoc(varColRef, newData)
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


    return (

        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
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


            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="px-3">
                    Add Purchase Record
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">

                <div className="row mt-2">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input
                            className="form-control"
                            type="text"
                            value={varRef.purchDocNum}
                            disabled />
                    </div>
                    <div className="col-4">
                        <label>Date</label>
                        <input
                            className="form-control"
                            value={moment(date).format('LL')}
                            disabled
                        />
                    </div>
                </div>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Note: (Optional)</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={(event) => { setNewNote(event.target.value); }}
                    />
                </Form.Group>

                <h5>Buy Products</h5>
                <hr></hr>
                <div className="row mb-2">
                    <div className="col-6">Product Name</div>
                    <div className="col-3">Quantity</div>
                </div>
                {productList.map((product, index) => (
                    <div key={index} className="row">
                        <div className="col-6 mb-3">
                            <Form.Control
                                hidden
                                size="md"
                                type="text"
                                name="productId"
                                value={product.productId}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            />
                            <Form.Select
                                defaultValue={0}
                                name="productId"
                                value={product.productId}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            >
                                <option
                                    value={0}
                                >
                                    Select item
                                </option>
                                {stockcard.map((prod) => {
                                    return (
                                        <option
                                            key={prod.id}
                                            value={prod.id}
                                        >
                                            {prod.description}
                                        </option>
                                    )
                                })}
                            </Form.Select>
                            {productList.length - 1 === index && productList.length < 10 && (
                                <Button
                                    className="mt-3"
                                    variant="outline-primary"
                                    size="md"
                                    onClick={handleItemAdd}>
                                    Add
                                </Button>
                            )}
                        </div>
                        <div className="col-3">
                            <Form.Control
                                size="md"
                                type="number"
                                name="productQuantity"
                                placeholder="Quantity"
                                min={1}
                                value={product.productQuantity}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            />
                        </div>
                        <div className="col-3">
                            {productList.length > 1 && (
                                <Button
                                    variant="outline-danger"
                                    size="md"
                                    onClick={() => handleItemRemove(index)}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div >
                ))}


            </Modal.Body>
            <Modal.Footer>
                <Button
                    className="btn btn-success"
                    style={{ width: "150px" }}
                    onClick={() => { addRecord(varRef.purchDocNum, multipleUpdate.qty) }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );



}

export default NewPurchaseModal;