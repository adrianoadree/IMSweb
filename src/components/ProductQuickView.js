import React from "react";
import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";

import { doc, getDoc,  } from 'firebase/firestore';
import { Cube, Grid, Pricetag, Cart, Layers, GitBranch, Close } from 'react-ionicons'
import { Spinner } from 'loading-animations-react';

function ProductQuickView(props) {
    const [docId, setDocId] = useState();
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

    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
            id="product-quick-view-modal"
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
                  <div className="row my-2 d-flex justify-content-center align-items-center">
                    <div className="col-2"></div>
                    <div className="col-4 d-flex justify-content-center align-items-center">
                      <div className="data-img" style={{height: '150px', width: '150px', padding: '0.5em'}}>
                        {stockcardDoc.img == " " || stockcardDoc.img == "" || stockcardDoc.img === undefined?
                          <div className="mb-2 d-flex align-items-center justify-content-center w-100 h-100" style={{backgroundColor: '#f3f5f9'}}>
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                              <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{height: '50%', width: 'auto !important'}}/>
                                <h6 className="text-center">No Image Uploaded</h6>
                            </div>
                          </div>
                        :
                          <div className="mb-2 d-flex align-items-center justify-content-center w-100 h-100">
                            <img key={stockcardDoc.img}src={stockcardDoc.img} style={{height: '100%', width: '100%', border: 'none', objectFit: 'contain'}}/>
                          </div>
                        }
                      </div>
                    </div>
                    <div className="col-1">
                      <Close
                        color={'#000000'}
                        height="25px"
                        width="25px"
                        data-title={'Product Description'}
                      />
                    </div>
                    <div className="col-3 d-flex justify-content-center align-items-center">
                      <div style={{fontSize: '2em', color: stockcardDoc.qty > 0?'#4973ff':'#c3c3c3' , lineHeight: '1em'}}>
                        <strong className="d-flex justify-content-center align-items-center flex-column">
                          <div>{stockcardDoc.qty}</div>
                          <div> units</div>
                        </strong>
                      </div>
                    </div>
                    <div className="col-2"></div>
                  </div>
                    <div className="row my-2 px-1">
                        <a className="col-2 data-icon">
                          <Cube
                            color={'#000000'}
                            height="25px"
                            width="25px"
                            data-title={'Product Description'}
                          />
                        </a>
                        <div className="col-10 data-label">
                          {stockcardDoc.description}
                        </div>
                      </div>
                      <div className="row my-2 px-1">
                        <a className="col-2 data-icon">
                          <GitBranch
                            color={'#00000'}
                            data-title={'Product Category'}
                            height="25px"
                            width="25px"
                          />
                        </a>
                        <div className="col-10 data-label">
                          {stockcardDoc.classification}
                        </div>
                      </div>
                      <div className="row my-2 px-1">
                        <a className="col-2 data-icon">
                          <Grid
                            color={'#00000'}
                            data-title={'Product Category'}
                            height="25px"
                            width="25px"
                          />
                        </a>
                        <div className="col-10 data-label">
                          {stockcardDoc.category}
                        </div>
                      </div>
                      <div className="row my-2 px-1">
                        <a className="col-2 data-icon">
                          <Pricetag
                            color={'#000000'}
                            height="25px"
                            width="25px"
                            data-title={'Selling Price'}
                          />
                        </a>
                        <div className="col-10 data-label">
                        &#8369; {(Math.round(stockcardDoc.s_price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
                      </div>
                      <div className="row my-2 px-1">
                        <a className="col-2 data-icon">
                          <Cart
                            color={'#00000'}
                            data-title={'Purchase Price'}
                            height="25px"
                            width="25px"
                          />
                        </a>
                        <div className="col-10 data-label">
                          &#8369; {(Math.round(stockcardDoc.p_price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </div>
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