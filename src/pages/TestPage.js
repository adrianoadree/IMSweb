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



    //---------------------VARIABLES---------------------
    const [userID, setUserID] = useState("");
    const { user } = UserAuth();//user credentials
    const [key, setKey] = useState('main');//Tab controller

    return (
        <div>

            <Navigation />

            <Tab.Container
                activeKey={key}
                onSelect={(k) => setKey(k)}
            >
                <div id="contents" className="row">
                    <div className="row py-4 px-5">
                        

                    </div>
                </div>
            </Tab.Container >
        </div >
    );


}


export default TestPage;