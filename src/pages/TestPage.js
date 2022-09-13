import React from 'react';
import { Table, Form, Button, ListGroup, Card, Tab, FormControl } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function TestPage() {

    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [docId, setDocId] = useState("xx"); //document Id

    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable

    const [purchRecCollection, setPurchRecCOllection] = useState([]); // stockcardCollection variable

    const citiesRef = collection(db, "purchase_record");

    //needed for analytics

    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    //formula to calculate SafetyStock = (highest daily sales * leadtime in days) - (average daily sales * leadtime)
    //formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage

    //ask user for : leadtime
    //compute for : average daily sales, highest daily sales, 


    const [highestDailySales, setHighestDailySales] = useState(0);
    const [averageDailySales, setAverageDailySales] = useState(0);

    useEffect(() => {

        setDoc(doc(citiesRef, "SF"), {
            name: "San Francisco", state: "CA", country: "USA",
            capital: false, population: 860000,
            regions: ["west_coast", "norcal"]
        });
        setDoc(doc(citiesRef, "LA"), {
            name: "Los Angeles", state: "CA", country: "USA",
            capital: false, population: 3900000,
            regions: ["west_coast", "socal"]
        });
        setDoc(doc(citiesRef, "DC"), {
            name: "Washington, D.C.", state: null, country: "USA",
            capital: true, population: 680000,
            regions: ["east_coast"]
        });
        setDoc(doc(citiesRef, "TOK"), {
            name: "Tokyo", state: null, country: "Japan",
            capital: true, population: 9000000,
            regions: ["kanto", "honshu"]
        });
        setDoc(doc(citiesRef, "BJ"), {
            name: "Beijing", state: null, country: "China",
            capital: true, population: 21500000,
            regions: ["jingjinji", "hebei"]
        });
    }, [])




    useEffect(() => {

        const q = query(citiesRef, where("docId", "array-contains", docId));

        const unsub = onSnapshot(q, (snapshot) =>
            setPurchRecCOllection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [docId])

    useEffect(() => {
        console.log(docId)

    }, [docId])




    //---------------------FUNCTIONS---------------------




    useEffect(() => {

        console.log(purchRecCollection)

    }, [purchRecCollection])

    //----------------------------------------------------------

    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    useEffect(() => {
        //read stockcard collection
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


    return (

        <div className="row bg-light">
            <Navigation />

            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div className="row contents">
                    <div className="row py-4 px-5">
                        <div className="sidebar">
                            <Card className='sidebar-card'>
                                <Card.Header>
                                    <div className='row'>
                                        <div className="col-1 left-full-curve">
                                            <Button className="fc-search no-click me-0">
                                                <FontAwesomeIcon icon={faSearch} />
                                            </Button>
                                        </div>
                                        <div className="col-11">
                                            <FormControl
                                                placeholder="Search"
                                                aria-label="Search"
                                                aria-describedby="basic-addon2"
                                                className="fc-search right-full-curve mw-0"
                                            />
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body>
                                    <div className="row g-1 sidebar-header">
                                        <div className="col-4 left-curve">
                                            Item Code
                                        </div>
                                        <div className="col-8 right-curve">
                                            Description
                                        </div>
                                    </div>
                                    <div className='scrollbar'>
                                        <ListGroup variant="flush">
                                            {stockcard.map((stockcard) => {
                                                return (
                                                    <ListGroup.Item
                                                        action
                                                        key={stockcard.id}
                                                        eventKey={stockcard.id}
                                                        onClick={() => { setDocId(stockcard.id) }}>
                                                        <div className="row gx-0 sidebar-contents">
                                                            <div className="col-4">
                                                                {stockcard.id}
                                                            </div>
                                                            <div className="col-8">
                                                                {stockcard.description}
                                                            </div>
                                                        </div>
                                                    </ListGroup.Item>
                                                )
                                            })}

                                        </ListGroup>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="divider">

                        </div>
                        <div className="data-contents">
                            <Tab.Content>
                                <Tab.Pane eventKey={0}>
                                    <div className="row">
                                        <div className="row p-3 m-0" style={{ height: "500px" }}>
                                            <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting</h1>
                                            <hr />

                                        </div>
                                        <div className="row pt-2 pb-5 px-5">
                                            <hr />
                                            <div className="col-4">
                                                <Card className="bg-dark">
                                                    <Card.Header>
                                                        <small className="text-center text-white">Product</small>
                                                    </Card.Header>
                                                    <Card.Body style={{ height: "10px" }}>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                            <div className="col-4">
                                                <Card className="bg-success">
                                                    <Card.Header>
                                                        <small className="text-center text-white">ReorderPoint</small>
                                                    </Card.Header>
                                                    <Card.Body style={{ height: "10" }}>

                                                    </Card.Body>
                                                </Card>
                                            </div>
                                            <div className="col-4">
                                                <Card className="bg-danger">
                                                    <Card.Header>
                                                        <small className="text-center text-white">SafetyStock</small>
                                                    </Card.Header>
                                                    <Card.Body style={{ height: "10px" }} >
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey={docId}>
                                    <div className="row">
                                        <div className="row p-3 m-0" style={{ height: "500px" }}>
                                            <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                                            </h1>
                                            <hr />
                                            <div className="row m-0 mt-2 mb-4 px-5 py-2 yellow-strip">
                                                <div className="row p1 text-center">
                                                    <div className="col-3">
                                                        Item Code
                                                    </div>
                                                    <div className="col-7">
                                                        Item Description
                                                    </div>
                                                    <div className="col-2">
                                                        Quantity
                                                    </div>
                                                </div>
                                                <hr className="yellow-strip-divider"></hr>
                                                <div className="row my-2">
                                                    <div className="col-2">
                                                        <h5><strong>{docId}</strong></h5>
                                                    </div>
                                                    <div className="col-8">
                                                        <h5><strong>Desc</strong></h5>
                                                    </div>
                                                    <div className="col-2">
                                                        <h5><strong>Quanti</strong></h5>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="row pt-2 pb-5 px-5">
                                            <hr />
                                            <div className="col-4">
                                                <Card className="bg-dark">
                                                    <Card.Header>
                                                        <small className="text-center text-white">
                                                            Product ID: {docId}
                                                        </small>
                                                    </Card.Header>
                                                    <Card.Body
                                                        className="text-white"
                                                        style={{ height: "160px" }}>
                                                        <small>Product Description:</small><br />
                                                        <small> - {stockcardDoc.description}</small><br />

                                                    </Card.Body>
                                                </Card>
                                            </div>
                                            <div className="col-4">
                                                <Card className="bg-success">
                                                    <Card.Header>
                                                        <small className="text-center text-white">ReorderPoint</small>
                                                    </Card.Header>
                                                    <Card.Body style={{ height: "160px" }}>
                                                        <small className="text-center text-white"> A reorder point (ROP) is the specific level at which your stock needs to be
                                                            replenished. In other words, it tells you when to place an order so you don’t run out of an
                                                            item.</small>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                            <div className="col-4">
                                                <Card className="bg-danger">
                                                    <Card.Header>
                                                        <small className="text-center text-white">SafetyStock</small>
                                                    </Card.Header>
                                                    <Card.Body style={{ height: "160px" }} >
                                                        <small className="text-center text-white">
                                                            This is the extra quantity of a product that kept in storage to prevent stockouts. Safety stock serves as insurance against demand fluctuations.
                                                        </small>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        </div>

                                    </div>




                                </Tab.Pane>
                            </Tab.Content>
                        </div>
                    </div>
                </div>
            </Tab.Container>
        </div >
    )

}

export default TestPage;