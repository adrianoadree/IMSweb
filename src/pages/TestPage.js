import React from 'react';
import { Table, Form, Button } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { ToastContainer, toast } from "react-toastify";




function TestPage() {

    //---------------------VARIABLES---------------------

    const [varList, setVarlist] = useState([{ productId: "", productQuantity: 1 }]);



    //---------------------FUNCTIONS---------------------




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






    return (

        <div className="row bg-light">
            <Navigation />

            <div className='row'>
                <div className='col-6 p-5'>


                    <div className="row mb-2">
                        <div className="col-6">Product Name</div>
                        <div className="col-3">Quantity</div>
                    </div>
                    {productList.map((product, index) => (
                        <div key={index} className="row">
                            <div className="col-6 mb-3">

                                <Form.Select
                                    multiple={true}
                                    defaultValue={3}
                                    value={product.productId}
                                    name="productId"
                                    onChange={(e) => handleProductChange(e, index)}
                                >
                                    <option >Open this select menu</option>
                                    <option value={1}>One</option>
                                    <option value={2}>Two</option>
                                    <option value={3}>Three</option>
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

                    <div className="row">
                        <div className='col-6'>

                            <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                </div>

                <div className='col-6 p-5'>
                    <h1>productList Values: </h1>
                    <ul>
                        {productList.map((val, index) => (
                            <li key={index}><strong>Product ID: </strong> {val.productId}   /   <strong>Quantity: </strong> {val.productQuantity} </li>

                        ))}
                    </ul>

                </div>

            </div>

        </div>
    )

}

export default TestPage;