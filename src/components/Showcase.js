import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleArrowLeft, faFileInvoice, faCircleArrowRight, faBoxOpen, faUser, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

function Showcase() {

  const COLORS = ['#FFCFB7', '#FFF5D8', '#439DB2', '#4193AD','#B0EEC1', '#B5E3FF', '#FEFFBF', '#FFDEBC'];

return(
      <div
        id="showcase"
        className="w-100 h-100 p-5"
      >
        <div 
          className="w-100 h-100 row"
          style={{borderRadius: "15px"}}
        >
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[0]}}
          >
            Mobile Companion
          </div>
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[1]}}
          >
            Warehouse Mapping
          </div>
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[2]}}
          >
            Stock Level Projection
          </div>
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[3]}}
          >
            Reorder Point Forecasting
          </div>
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[4]}}
          >
            Record-keeping
          </div>
          <div 
            className="col-4 d-flex align-items-center"
            style={{backgroundColor: COLORS[5]}}
          >
            Barcode Auto-generation
          </div>

        </div>
      </div>
)
}

export default Showcase