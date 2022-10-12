import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faVcard } from '@fortawesome/free-solid-svg-icons'
import { Checkbox, CaretDown, CaretUp } from 'react-ionicons'
import { useState } from 'react';
import { propTypes } from 'react-barcode';




function NewUserBanner(props) {

  const [shown, setShown] = useState(true);
  const toggle=() =>{
    var bnr = document.getElementById("banner");
    var tgl = document.getElementById("banner-visibility-toggle");
    if (bnr.style.display === "none") {
      bnr.style.display = "block";
      tgl.setAttribute("data-title","Hide");
      setShown(true);
    } else {
      bnr.style.display = "none";
      tgl.setAttribute("data-title","Show");
      setShown(false);
    }
  } 

  var name = props.name;
  var fname = name.split(" ")[0];

  return (
    <div id="banner-container">
      <div id="banner">
        <div id="banner-left">
        <h1><span className="f-cursive">Welcome</span> <span></span>{fname}!</h1>
        </div>
          
        <div id="banner-right">
        <Checkbox
          className="me-2 pull-down"
          color={'#80b200'} 
          title={'Category'}
          height="25px"
          width="25px"
        />
        To start off, fill out the form below. This is for verification if your business is registered. All we need are some personal information and general information about your business.
        <br />
        <Checkbox
          className="me-2 pull-down"
          color={'#80b200'} 
          title={'Category'}
          height="25px"
          width="25px"
        />
        Once done, click "Submit" and wait for the verification. If the verification process is successful, you can now use the application.
        </div>

      </div>
      <div id="banner-footer">
        <button
          id="banner-visibility-toggle"
          className="hide float-end"
          data-title="Hide"
          onClick={() => toggle()}
        >
          {shown?
            <CaretUp
              className="caret pull-down"
              color={'#000000'} 
              title={'Category'}
              height="15px"
              width="15px"
            />
            :
            <CaretDown
            className="caret pull-down"
            color={'#000000'} 
            title={'Category'}
            height="15px"
            width="15px"
            />
          }
      </button>
      </div>

    </div>
  );
}

export default NewUserBanner;