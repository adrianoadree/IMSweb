import React from "react";
import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";

import { doc, getDoc,  } from 'firebase/firestore';
import { Cube, Grid, Pricetag, Cart, InformationCircle, } from 'react-ionicons'
import { Spinner } from 'loading-animations-react';

function ProductQuickView(props) {
    const [docId, setDocId] = useState("");
    const [stockcardDoc, setStockcardDoc] = useState(); //stockcard Document variable
    const [stockcardDocId, setStockcardDocId] = useState(""); //stockcard Document variable
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

    useEffect(() => {
        async function readStockcardDoc() {
          const stockcardRef = doc(db, "stockcard", docId)
          const docSnap = await getDoc(stockcardRef)
          if (docSnap.exists()) {
            setStockcardDoc(docSnap.data());
            setStockcardDocId(docSnap.id);
          }
        }
        if(docId === undefined) {
        
        }
        else
        {
          readStockcardDoc()
        }
    }, [docId])

    useEffect(()=>{
      if(props.productid === undefined) {

      }
      else
      {
        setDocId(props.productid)
      }
    }, )

    useEffect(()=>{
      if(stockcardDoc === undefined) {
        setIsFetched(false)
      }
      else
      {
        setIsFetched(true)
      }
    }, [stockcardDoc])

    useEffect(()=>{
      
        console.log(props.productid)
        console.log(docId)
    }, )

    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
        >
            <Modal.Body
            className="d-flex justify-content-center">
            {isFetched?
              <div className='row px-3 py-2' id="product-contents">
        
        
              <div className="row py-1 data-specs m-0" id="product-info">
                <div className="col-12 mb-2 d-flex justify-content-center align-items-center">
                  <h4 className="data-id">
                    <strong>
                    {stockcardDocId.substring(0,9)}
                    </strong>
                  </h4>
                </div>
                <div className="col-12 my-2 d-flex justify-content-center align-items-center">
                
                <div className="data-img" style={{height: '150px', width: '150px'}}>
      
                  </div>
                </div>
                  <div className="col-12 my-2 px-1">
                      <span className="data-icon">
                        <Cube
                          className="me-2 pull-down"
                          color={'#000000'}
                          height="25px"
                          width="25px"
                          data-title={'Product Description'}
                        />
                      </span>
                      <span className="data-label">
                        {stockcardDoc.description}
                      </span>
                    </div>
                    <div className="col-12 my-2 px-1">
                      <span className="data-icon">
                        <Grid
                          className="me-2 pull-down"
                          color={'#00000'}
                          data-title={'Product Category'}
                          height="25px"
                          width="25px"
                        />
                      </span>
                      <span className="data-label">
                        {stockcardDoc.category}
                      </span>
                    </div>
                    <div className="col-12 my-2 px-1">
                      <span className="data-icon">
                        <Pricetag
                          className="me-2 pull-down"
                          color={'#000000'}
                          height="25px"
                          width="25px"
                          data-title={'Selling Price'}
                        />
                      </span>
                      <span className="data-label">
                        {stockcardDoc.s_price}
                      </span>
                    </div>
                    <div className="col-12 my-2 px-1">
                      <span className="data-icon">
                        <Cart
                          className="me-2 pull-down"
                          color={'#00000'}
                          data-title={'Purchase Price'}
                          height="25px"
                          width="25px"
                        />
                      </span>
                      <span className="data-label">
                        {stockcardDoc.p_price}
                      </span>
                    </div>
      
                
              </div>
      
      
            </div>
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
            
        
      </Modal.Body>
      </Modal>
    );
  }

export default ProductQuickView;