import { useEffect } from "react";
import Navigation from "../layout/Navigation";
import Barcode from 'react-jsbarcode'

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "react-bootstrap";

function TestPage() {

    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    function showDatePicker() {
        return (
            <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                    setDateRange(update);
                }}
                withPortal
            />
        )
    }

    return (
        <div>
            <Navigation />
            <div className="input-container">
                <Button 
                variant='primary'
                onClick={() => showDatePicker()}
                >
                    Click to Open Calendar
                    </Button>
            </div>
        </div>
    )
}

export default TestPage;