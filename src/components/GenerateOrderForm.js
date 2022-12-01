import React from "react";
import { Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";

import { doc, getDoc, query, collection, onSnapshot, where } from 'firebase/firestore';
import { Spinner } from 'loading-animations-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMobile } from '@fortawesome/free-solid-svg-icons'
import QRCode from "react-qr-code";

function GenerateOrderForm(props) {
    const [docId, setDocId] = useState();
    const [supplierSelected, setSupplierSelected] = useState({supplier_emailaddress: "", supplier_mobileNum: ""})
    const [supplierCollection, setSupplierCollection] = useState([])
    const [productSupplierList, setProductSupplierList] = useState([])
    const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

    useEffect(() => {
        async function getSupplierCollection() {
          const collectionRef = collection(db, "purchase_record")
          const q = query(collectionRef, where("product_ids", "array-contains", docId));

          const unsub = onSnapshot(q, (snapshot) => {
            var temp_supplier_product_list = []
            snapshot.docs.map((doc) => {
                temp_supplier_product_list.push(doc.data().transaction_supplier)
            })
            setProductSupplierList([...new Set(temp_supplier_product_list)])
          }
          );
          return unsub;
        }
        if(docId === undefined) {
        
        }
        else
        {
          getSupplierCollection()
        }
    }, [docId])

    const poolSupplierCollection = async() => {
      var temp_supplier_collection = []
      for(var i = 0; i < productSupplierList.length; i++)
      {
        await getDoc(doc(db, "supplier", productSupplierList[i])).then(docSnap => {
          if (docSnap.exists()) {
            temp_supplier_collection.push({ ...docSnap.data(), id: docSnap.id })
          }
      })
      }
      setSupplierCollection(temp_supplier_collection)
      setSupplierSelected(temp_supplier_collection[0])
    }

    useEffect(() => {
      //read sales_record collection
      if (productSupplierList === undefined || productSupplierList.length == 0) {

      }
      else 
      {
        poolSupplierCollection()
      }
    }, [productSupplierList])

    useEffect(()=>{
      if(props.product.id === undefined) {

      }
      else
      {
        setDocId(props.product.id)
      }
    }, [props.product.id])

    useEffect(()=>{
      if(supplierCollection === undefined) {
        setIsFetched(false)
      }
      else
      {
        setIsFetched(true)
      }
    }, [supplierCollection])

    const generateMessage = (type) => {
      var subject = props.businessname + " order"
      var body_salutation = "Good day,"
      var body_opening = "We would like to order: "
      var body_message = 
        props.product.description + 
        " - " + props.product.qty + " cases " +
        " @ " + props.product.price + 
        " = " + Number(props.product.qty * props.product.price)
      var body_closing = "Thank you"

      if(type == "text")
      {
        return "SMSTO:" + supplierSelected.supplier_mobileNum + ":" + subject + "\n\n" + body_salutation + " " + body_opening.toLowerCase() + "\n\n" + body_message + "\n\n" + body_closing
      }
      else if(type == "email")
      {
        return "mailto:" + supplierSelected.supplier_emailaddress + "?subject=" + subject + "&body=" + body_salutation + "%0d%0a%0d%0a" + body_opening + "%0d%0a%0d%0a" + body_message + "%0d%0a%0d%0a" + body_closing
      }
      
    }

  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
      id="product-quick-view-modal"
    >
      <Modal.Body>
        <div className="px-3 py-2">
          {isFetched ?
            <>
              <div className="module-header mb-4">
                <h3 className="text-center">Generate Order</h3>
              </div>
              <div className="w-100 h-auto row mx-0">
                <div className="interrelated-options mb-3 p-2" style={{ overflowY: "scroll" }}>
                  {supplierSelected === undefined ?
                    <></>
                    :
                    <>
                      {supplierCollection.map((supplier, index) => {
                        return (
                          <>
                            {index == 0 ?
                              <a
                                className={"start-option" + (supplierSelected.id == supplier.id ? " active" : "")}
                                onClick={() => { setSupplierSelected(supplier) }}
                              >
                                {supplier.supplier_name}
                              </a>
                              :
                              index == supplierCollection.length - 1 ?
                                <a
                                  className={"end-option" + (supplierSelected.id == supplier.id ? " active" : "")}
                                  onClick={() => { setSupplierSelected(supplier) }}
                                >
                                  {supplier.supplier_name}
                                </a>
                                :
                                <a
                                  className={"center-option divider" + (supplierSelected.id == supplier.id ? " active" : "")}
                                  onClick={() => { setSupplierSelected(supplier) }}
                                >
                                  {supplier.supplier_name}
                                </a>
                            }
                          </>
                        )
                      })}</>
                  }


                </div>
                <div id="order-form" className="p-3 mb-3">
                  <h5 className="mb-3">{props.businessname}</h5>
                  <div className="ps-2">
                    <h6 className="mb-3">Order:</h6>
                    <ol>
                      <li className="no-click">
                        <div className="w-100 d-flex align-items-center justify-content-between flex-row ps-0 mb-2">
                          <span className="px-1">
                            {props.product.description}
                          </span>
                          <span className="px-1">
                            -
                          </span>
                          <span className="px-2 no-break"> {props.product.qty + " cs"}</span>
                          <span className="px-2">
                            @
                          </span>
                          <span className="px-2">
                            {(Math.round(props.product.price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </span>
                        </div>
                        <div className="w-100 d-flex align-items-center justify-content-end flex-row ps-0">
                          <span>
                            <strong className="me-3">TOTAL =</strong>{(Math.round((props.product.price * props.product.qty) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          </span>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
                <div id="contact-supplier-actions" className="text-end">
                  <h6 className="text-muted mb-2">Send via :</h6>
                  {(supplierSelected.supplier_emailaddress == "" || supplierSelected.supplier_emailaddress == " ") && (supplierSelected.supplier_mobileNum == "" || supplierSelected.supplier_mobileNum == " ")?
                    <h6>
                      No contact info provided.
                    </h6>
                  :
                    <>
                      {supplierSelected.supplier_emailaddress == "" || supplierSelected.supplier_emailaddress == " "?
                        <></>
                      :
                        <h6 className="mb-2 me-2">
                          <a 
                            href={generateMessage("email")}
                            className="me-2"
                          >
                            <strong>{supplierSelected.supplier_emailaddress}</strong>
                          </a>
                          <FontAwesomeIcon icon={faEnvelope} />
                        </h6>
                      }
                      {supplierSelected.supplier_mobileNum == "" || supplierSelected.supplier_mobileNum == " "?
                        <></>
                      :
                        <h6 className="mb-2 me-2">
                            <QRCode
                            className="me-3"
                            value={generateMessage("text")}
                            size={120}
                            />
                          <FontAwesomeIcon icon={faMobile} />
                        </h6>
                      }
                    </>
                  }
                </div>
              </div>
            </>
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
      </Modal.Body>
    </Modal>
  );
  }

export default GenerateOrderForm;