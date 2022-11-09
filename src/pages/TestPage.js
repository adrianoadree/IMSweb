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

    const [prodNearROP, setProdNearROP] = useState()
    const { user } = UserAuth();
    const [userID, setUserID] = useState("");


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])

    //Read stock card collection from database
    useEffect(() => {
        if (userID !== undefined) {
            const stockcardCollectionRef = collection(db, "stockcard")
            const q = query(stockcardCollectionRef, where("user", "==", userID), where("analytics.daysROP", "<=", 7), orderBy("analytics.daysROP", "asc"));

            const unsub = onSnapshot(q, (snapshot) =>
                setProdNearROP(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])


    return (

        <div className="row bg-light">
            <Navigation />
            <div className="row p-5">
                <div className="col-6"></div>
                <div className="col-6">
                    <Card>
                        <Card.Header>
                            PROD NEAR ROP
                        </Card.Header>
                        <Card.Body>
                            asdasd

                            <Table className="records-table white">
                                <thead>
                                    <tr>
                                        <th className="pth text-center">Product</th>
                                        <th className="pth text-center">Projected Reorder Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prodNearROP !== undefined ?
                                        <>
                                            {
                                                prodNearROP.map((prod) => {
                                                    return (
                                                        <tr>
                                                            <td>{prod.description}</td>
                                                            <td>{prod.analytics.daysROP} day(s) before reaching ROP</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </>
                                        :
                                        <>asdsad</>
                                    }
                                </tbody>

                            </Table >

                        </Card.Body>
                    </Card>
                </div>
            </div>

        </div >
    )
}

export default TestPage;