import { useEffect } from "react";
import Navigation from "../layout/Navigation";
import Barcode from 'react-jsbarcode'
import { Card, Table, OverlayTrigger, Alert, Tooltip, ToggleButtonGroup, ToggleButton, FormControl, ListGroup, InputGroup } from "react-bootstrap";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "react-bootstrap";
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, Delive } from 'react-ionicons'
import { UserAuth } from '../context/AuthContext'
import { db } from '../firebase-config';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faTruck, faBarcode, faFileLines, faInbox, faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from 'loading-animations-react';


function TestPage() {
    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [docId, setDocId] = useState("xx"); //document Id
    const [salesRecordCollection, setSalesRecordCollection] = useState(); //sales_record Collection

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    //Read stock card collection from database
    useEffect(() => {
        if (userID === undefined) {

            const stockcardCollectionRef = collection(db, "sales_record")
            const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {
            const stockcardCollectionRef = collection(db, "sales_record")
            const q = query(stockcardCollectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])

    //======================================================================================
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved


    useEffect(() => {
        if (salesRecordCollection === undefined) {
            setIsFetched(false)
        }
        else {
            setIsFetched(true)
        }
    }, [salesRecordCollection])

    // ===================================== START OF SEARCH FUNCTION =====================================


    const [searchValue, setSearchValue] = useState('');    // the value of the search field 
    const [searchResult, setSearchResult] = useState();    // the search result

    const [converter, setConverter] = useState();    // the value of the search field 
    const [output, setOutput] = useState("05 October 2011");    // the value of the search field 


    useEffect(() => {
        let data
        data = output.toISOString()
        setConverter(data)
    }, [output])


    useEffect(() => {
        setSearchResult(salesRecordCollection)
    }, [salesRecordCollection])



    const filter = (e) => {
        const keyword = e.target.value;

        if (keyword !== '') {
            const results = salesRecordCollection.filter((salesRecordCollection) => {
                return salesRecordCollection.id.toLowerCase().startsWith(keyword.toLowerCase())
                // Use the toLowerCase() method to make it case-insensitive
            });
            setSearchResult(results);
        } else {
            setSearchResult(salesRecordCollection);
            // If the text field is empty, show all users
        }

        setSearchValue(keyword);
    };

    // ====================================== END OF SEARCH FUNCTION ======================================



    return (
        <div>
            <Navigation />
            <div className="row">
                <div className='sidebar'>
                    <Card className='sidebar-card'>
                        <Card.Header>
                            <div className='row'>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text id="basic-addon1">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </InputGroup.Text>
                                    <FormControl
                                        type="search"
                                        value={searchValue}
                                        onChange={filter}
                                        className="input"
                                        placeholder="Search"
                                    />
                                </InputGroup>
                            </div>
                        </Card.Header>
                        <Card.Body style={{ height: "500px" }}>
                            <div className="row g-1 sidebar-header">
                                <div className="col-4 left-curve">
                                    Doc
                                </div>
                                <div className="col-8 right-curve">
                                    Date
                                </div>
                            </div>
                            <div id='scrollbar' style={{ height: '400px' }}>
                                {isFetched ?
                                    (
                                        salesRecordCollection.length === 0 ?
                                            <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                                                <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>Record</span> to show.</strong></h5>
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
                                            <ListGroup variant="flush">
                                                {searchResult && searchResult.length > 0 ? (
                                                    searchResult.map((sales) => (
                                                        <ListGroup.Item
                                                            action
                                                            key={sales.id}
                                                            eventKey={sales.id}
                                                            onClick={() => { setDocId(sales.id) }}>
                                                            <div className="row gx-0 sidebar-contents">
                                                                <div className="col-4">
                                                                    <small>{sales.transaction_number}</small>
                                                                </div>
                                                                <div className="col-8">
                                                                    <small>{moment(sales.transaction_date).format('ll')}</small>
                                                                </div>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))
                                                ) : (
                                                    <div className='mt-5 text-center'>
                                                        <Alert variant='danger'>
                                                            No Search Result for
                                                            <br /><strong>{searchValue}</strong>
                                                        </Alert>
                                                    </div>
                                                )}

                                            </ListGroup>
                                    )
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
                <div className="col">
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <FormControl
                            type="search"
                            value={output}
                            onChange={(event) => { setOutput(event.target.value); }}
                            className="input"
                            placeholder="Search"
                        />
                    </InputGroup>
                    {converter}
                </div>
            </div>
        </div >
    )
}

export default TestPage;