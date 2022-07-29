import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, where } from "firebase/firestore";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function NewSalesModal(props) {

    //---------------------VARIABLES---------------------
    const [stockcard, setStockcard] = useState([]); //stockcard collection
    const [varRef, setVarRef] = useState([]); // variable collection
    const [newNote, setNewNote] = useState(""); // note form input
    const [queryList, setQueryList] = useState(["IT00018"]); //compound query access
    const [queryQuantity, setQqueryQuantity] = useState([0]); //compound query access


    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);

    //---------------------FUNCTIONS---------------------

    //fetch variable collection
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
            setVarRef(doc.data());
        });
        return unsub;
    }, [])

    //read collection from stockcard where qty is not 0
    useEffect(() => {
        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef, where("qty", ">", 0));

        const unsub = onSnapshot(q, (snapshot) =>
            setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );


        return unsub;
    }, [])


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




    //stores list.productId array to queryList
    useEffect(() => {
        const TempArr = [];
        productList.map((name) => {
            TempArr.push(name.productId)
        })
        setQueryList(TempArr)
    }, [productList])//list listener, rerenders when list value changes

    //stores list.productId array to queryList
    useEffect(() => {
        const TempArr = [];
        productList.map((name) => {
            TempArr.push(name.productQuantity)
        })
        setQqueryQuantity(TempArr)
    }, [productList])//list listener, rerenders when list value changes



    //add document to database
    const addRecord = async (salesDocNum, qty) => {
        setDoc(doc(db, "sales_record", "SR" + Number(salesDocNum)), {
            document_date: date,
            document_note: newNote,
            document_number: "SR" + Number(salesDocNum),
            productList
        });

        props.onHide() //close Modal
        successToast() //display success toast


        updateSalesDocNum(salesDocNum) //update variables.purchDocNum function
        updateQuantity(qty)  //update stockcard.qty function
        setProductList([{ productId: "", productQuantity: 1 }]) // set number of productList row to default
    }


    const [quantityHolder, setQuantityHolder] = useState([]);//stockcard spec doc access

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "stockcard", "IT00001"), (doc) => {
            setQuantityHolder(doc.data());
        });

        return unsub;
    }, [])

    //update stockcard.qty function
    function updateQuantity(qty) {
        productList.map((val) => {

            const varColRef = doc(db, "stockcard", val.productId)
            const newData = { qty: qty - Number(val.productQuantity) }

            updateDoc(varColRef, newData)
        })
    }

    //update variables.purchDocNum function
    function updateSalesDocNum(salesDocNum) {
        const varColRef = doc(db, "variables", "var")
        const newData = { salesDocNum: Number(salesDocNum) + 1 }

        updateDoc(varColRef, newData)
    }

    //success toastify
    const successToast = () => {
        toast.success('Sales Transaction Successfully Recorded!', {
            position: "top-right",
            autoClose: 4996,
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
                autoClose={3500}
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
                    Add Sales Record
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">

                <div className="row mt-2">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input
                            className="form-control"
                            type="text"
                            value={varRef.salesDocNum}
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

                <h5>Sell Products</h5>
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
                    onClick={() => { addRecord(varRef.salesDocNum, quantityHolder.qty) }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );




}
export default NewSalesModal;