import Searchbar from '../components/searchbar';
import Invcontentlist from '../components/invcontentlist';
import InventoryTable from '../components/inventorytable';
import StockcardForm from '../components/stockcardform';
import {Modal,Button} from 'react-bootstrap';


import React, { useState } from 'react';
import Navigation from '../layout/Navigation';


var x = true;



function clickHandler(){

    return(
        x = !x,
        alert(x)
    );
    


}


function displayHandler(){
    if(x == true){
        return <InventoryTable/>
    }
    else{
        return <StockcardForm/>
    }
}


function Example() {
    const [show, setShow] = useState(false);
  
    return (
      <>
        <Button variant="primary" className='Buttongrp' onClick={() => setShow(true)}>
          Add
        </Button>
  
        <Modal
          show={show}
          onHide={() => setShow(false)}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
              Add New Product
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <StockcardForm/>
          </Modal.Body>
        </Modal>
      </>
    );
  }








function Inventory(){


    return(

    
        
        <div className="row bg-light">
          <Navigation/>
            <div className="col-3 p-5">
                <Searchbar />
                <span><br /></span>
                <div class="btn-group" role="group" aria-label="Basic example">
                <Example/>
                <button onClick={clickHandler} className="Buttongrp btn btn-primary" variant="primary">Modify</button>
                <button className="Buttongrp btn btn-primary" variant="primary">Delete</button>
                </div>
                <Invcontentlist/>

            </div>

            <div className="col-8 p-5">

                <div className='bg-white p-3'>
                    <h2 className='text-center'>Inventory</h2>
                    <br></br>
                    {displayHandler()}


                </div>

            </div>

            
        </div>
    );

}
export default Inventory;