import React from "react";
import { Modal, Card, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleRight } from '@fortawesome/free-solid-svg-icons'
import { updateDoc,doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Cube, Grid, Pricetag, Cart, InformationCircle, } from 'react-ionicons'
import { Spinner } from 'loading-animations-react';

function WarehouseMapAddProductModal(props) {
    const [docId, setDocId] = useState();
    const [userId, setUserId] = useState("");
    const [warehouseDoc, setWarehouseDoc] = useState(); //stockcard Document variable
    const [warehouseCells, setWarehouseCells] = useState([]); //stockcard Document variable
    const [warehouseCell, setWarehouseCell] = useState();
    const [warehouseDocId, setWarehouseDocId] = useState(""); //stockcard Document variable
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
    const [productsInStorage, setProductsInStorage] = useState([]);
    const [cellId, setCellId] = useState("");
    const [cellType, setCellType] = useState("");
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [stockCardId, setStockcardId] = useState("xx"); //document Id
    const [colInd, setColInd] = useState(0);
    const [rowInd, setRowInd] = useState(0);
    
    useEffect(()=>{
      if(props.userid === undefined) {

      }
      else
      {
        setUserId(props.userid)
      }
    }, )

    useEffect(() => {
      if (userId === undefined) {
  
        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));
  
        const unsub = onSnapshot(q, (snapshot) =>
          setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
      }
      else {
        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef, where("user", "==", userId));
  
        const unsub = onSnapshot(q, (snapshot) =>
          setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
      }
    }, [userId])

    useEffect(() => {
        async function readWarehouseDoc() {
          const warehouseRef = doc(db, "warehouse", docId)
          const docSnap = await getDoc(warehouseRef)
          if (docSnap.exists()) {
            setWarehouseDoc(docSnap.data());
            setWarehouseDocId(docSnap.id);
          }
        }
        if(docId === undefined) {
          console.log(docId)
        }
        else
        {
          console.log(docId)
          readWarehouseDoc()
        }
    }, [docId])

    useEffect(()=>{
      if(props === undefined) {

      }
      else
      {
        setDocId(props.warehouseid)
        setRowInd(props.rowindex)
        setColInd(props.colindex)
      }
    })

    useEffect(()=>{
      if(warehouseDoc === undefined) {
        setIsFetched(false)
      }
      else
      {
        setIsFetched(true)
        setProductsInStorage(warehouseDoc.cells[rowInd][colInd].products)
        setCellId(warehouseDoc.cells[rowInd][colInd].id)
        setCellType(warehouseDoc.cells[rowInd][colInd].type)
      }
    }, [warehouseDoc])

    useEffect(()=>{
        console.log(props)
        console.log('passed warehouse id: ' + props.warehouseid)
        console.log('passed user id: ' + props.userid)
        console.log('current warehouse id:' +docId)
        console.log('current warehouse id:' + warehouseDocId)
        console.log('current user id:' + userId)
        console.log('passed row index:' + props.rowindex)
        console.log('col index:' + colInd)
        console.log('row index:' + rowInd)
        console.log(warehouseDoc)
        console.log(stockcard)
        console.log(warehouseCells)
        console.log(productsInStorage)
        console.log(cellId)
    }, )
    const handleProductSelect = (product) => {
      console.log("selectedProduct: " +product)
      let productIndex = productsInStorage.indexOf(product)
      var currentSelectedProduct = document.getElementById(product);
      
      if(currentSelectedProduct.classList.contains("product-selected")) 
      {
        currentSelectedProduct.classList.remove("product-selected")
      }
      else
      {
        currentSelectedProduct.classList.add("product-selected")
      }
      console.log(currentSelectedProduct)
      if(productIndex >= 0) {
        setProductsInStorage([
          ...productsInStorage.slice(0, productIndex),
          ...productsInStorage.slice(productIndex + 1, productsInStorage.length)
        ]);
      }
      else
      {
        setProductsInStorage([... productsInStorage, product])
    }
  }

  const placeProducts = async () => {
    var tempCell = warehouseDoc.cells;
    tempCell[rowInd][colInd].products = productsInStorage
      const getWarehouse = doc(db, 'warehouse', docId);
      await updateDoc(getWarehouse,{
          cells: tempCell,
        });
    props.onHide()
  }
    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
        >
            <Modal.Body
            className="d-flex justify-content-center">
              <div className="px-3 py-2 w-100">
                <div className="module-header mb-4">
                  <h3 className="text-center">Editing {cellId}</h3>
                </div>
          <div className="row my-2 mb-3">
            {isFetched?
              <div id="product-adding-stage">
                <div className="row h-100">
                  <div className="col-5 p-0 h-100 ">
                    <div className="product-adding-stage-active h-100 ">
                      <div className="product-adding-stage-header">
                        Products in Stockcard
                      </div>
                      <div className="products-container">
                        <div className="row">
                        <p className="product-adding-stage-tip">Click a product to <span style={{color: '#629ce3c3'}}>add</span> to the storage</p>
                        </div>
                        <div className="row">
                          {stockcard.map((stockcard, index) => {
                            return (
                              <>
                              {productsInStorage === undefined? <><Spinner 
                color1="#b0e4ff"
                color2="#fff"
                textColor="rgba(0,0,0, 0.5)"
                className="w-50 h-50"
                /></>:<>
                                {stockcard === undefined?<></>:<>
                                  {productsInStorage.indexOf(stockcard.id) == -1?
                                    <div className="col-6 p-0">
                                      <button
                                        className="product-inselection"
                                        id={stockcard.id}
                                        key={stockcard.id}
                                        onClick={() => { handleProductSelect(stockcard.id)}}
                                        style={{border: '0', background: 'none'}}
                                      >
                                        <Card>
                                          <Card.Body>
                                            <strong>{stockcard.description}</strong>
                                            <div className="row specification" style={{margin: '0 auto'}}>
                                              <div className="col-8 p-0 p-0">
                                                <p className="code">{stockcard.id.substring(0, 9)}</p>
                                              </div>
                                              <div className="col-4 p-0 p-0">
                                              <p className="qty">QTY: {stockcard.qty}</p>
                                              </div>
                                            </div>
                                            
                                            
                                          </Card.Body>
                                        </Card>
                                      </button>
                                    </div>
                                
                                  :<></>}
                                </>}
                              </>}
                            </>)})}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-2 h-100 d-flex align-items-center justify-content-center">
                    <div className={'storage ' + cellType} style={{height: '100px', width: '100px'}}>
                      <div className="w-100 h-100 position-relative d-inline-block d-flex align-items-center">
                        <div className="position-absolute" style={{color: 'rgb(9, 255, 0)', lineHeight: '0', fontSize: '1.5rem', left: '-0.5em', backgroundColor: '#fff', padding: '0.25em', borderRadius: '50%'}}>
                          <div><FontAwesomeIcon icon={faArrowCircleRight} /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-5 h-100 p-0">
                  <div className="product-adding-stage-active instorage h-100">
                      <div className="product-adding-stage-header">
                        Products in this Storage
                      </div>
                      <div className="products-container">
                      <div className="row">
                        <p className="product-adding-stage-tip">Click a product to <span style={{color: '#e36262c3'}}>remove</span> from the storage</p>
                        </div>
                        <div className="row">
                          {stockcard.map((stockcard, index) => {
                            return (
                              <>
                              {productsInStorage === undefined?<></>:<>
                                {stockcard === undefined?<></>:<>
                                  {productsInStorage.indexOf(stockcard.id) >= 0?
                                    <div className="col-6 p-0">
                                      <button
                                        className="product-inselection"
                                        id={stockcard.id}
                                        key={stockcard.id}
                                        onClick={() => { handleProductSelect(stockcard.id)}}
                                        
                                      >
                                        <Card
                                        >
                                          <Card.Body>
                                            <strong>{stockcard.description}</strong>
                                            <div className="row specification" style={{margin: '0 auto'}}>
                                              <div className="col-8 p-0 p-0">
                                                <p className="code">{stockcard.id.substring(0, 9)}</p>
                                              </div>
                                              <div className="col-4 p-0 p-0">
                                              <p className="qty">QTY: {stockcard.qty}</p>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </button>
                                    </div>
                                
                                  :<></>}
                                </>}
                              </>}
                            </>)})}
                        </div>
                      </div>
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
          </div>
          </div>
            </Modal.Body>
            <Modal.Footer
        className="d-flex justify-content-center"
      >
         <Button
         className="btn btn-danger"
         style={{ width: "6rem" }}
         onClick={() => props.onHide()}
         >
          Cancel
        </Button>
        <Button
          className="btn btn-light float-start"
          style={{ width: "6rem" }}
          onClick={() => placeProducts()}
          >
          Save
        </Button>
      </Modal.Footer>
      </Modal>
    );
  }

export default WarehouseMapAddProductModal;