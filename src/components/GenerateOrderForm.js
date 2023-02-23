import React from "react";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { doc, getDoc, query, collection, onSnapshot, where } from 'firebase/firestore';

import QRCode from "react-qr-code";

import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faMobile } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from 'loading-animations-react';

function GenerateOrderForm(props) {
  const [docId, setDocId] = useState(); // product id
  const [productSupplierList, setProductSupplierList] = useState([]) // supplier product collection
  const [supplierCollection, setSupplierCollection] = useState([]) // filtered suppliers collection
  const [supplierSelected, setSupplierSelected] = useState({ supplier_emailaddress: "", supplier_mobileNum: "" }) // selected supplier
  const [isFetched, setIsFetched] = useState(false); // listener for when collection is retrieved

  //=============================== START OF STATE LISTENERS ===============================
  // set doc id
  useEffect(() => {
    if (props.product.id === undefined) {

    }
    else {
      setDocId(props.product.id)
    }
  }, [props.product.id])

  // fetch product suppliers
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
    if (docId === undefined) {

    }
    else {
      getSupplierCollection()
    }
  }, [docId])

  // listen if supplier collection is fetched
  useEffect(() => {
    if (supplierCollection === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
    }
  }, [supplierCollection])

  // remove duplicates from supplier collection
  useEffect(() => {
    if (productSupplierList === undefined || productSupplierList.length == 0) {

    }
    else {
      poolSupplierCollection()
    }
  }, [productSupplierList])

  //================================ END OF STATE LISTENERS ================================
  
  //=================================== START OF HANDLERS ==================================
  // remove duplicates from supplier collection
  const poolSupplierCollection = async () => {
    var temp_supplier_collection = []
    for (var i = 0; i < productSupplierList.length; i++) {
      await getDoc(doc(db, "supplier", productSupplierList[i])).then(docSnap => {
        if (docSnap.exists()) {
          temp_supplier_collection.push({ ...docSnap.data(), id: docSnap.id })
        }
      })
    }
    setSupplierCollection(temp_supplier_collection)
    setSupplierSelected(temp_supplier_collection[0])
  }

  // generate order contents
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

    if (type == "text") {
      return "SMSTO:" + supplierSelected.supplier_mobileNum + ":" + subject + "\n\n" + body_salutation + " " + body_opening.toLowerCase() + "\n\n" + body_message + "\n\n" + body_closing
    }
    else if (type == "email") {
      return "mailto:" + supplierSelected.supplier_emailaddress + "?subject=" + subject + "&body=" + body_salutation + "%0d%0a%0d%0a" + body_opening + "%0d%0a%0d%0a" + body_message + "%0d%0a%0d%0a" + body_closing
    }

  }

  // handle supplier change
  const handleSupplierSelect = (supplier_id) => {
    supplierCollection.map((supplier) => {
      if (supplier.id == supplier_id) {
        setSupplierSelected(supplier)
      }
    })
  }
  //=================================== END OF HANDLERS  ===================================
  
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
              <div className="row mx-0">
                <div id="order-supplier-select" className="w-100 interrelated-options mb-3 p-2">
                  {supplierSelected === undefined ?
                    <></>
                  :
                    <div className="w-100 d-flex align-items-center justify-content-center flex-row">
                      <div className="me-3">Supplier</div>
                      <select
                        className="form-control shadow-none"
                        value={supplierSelected.id}
                        onChange={(e) => { handleSupplierSelect(e.target.value) }}
                      >
                        {supplierCollection.map((supplier, index) => {
                          return (
                            <option
                              key={supplier.id}
                              value={supplier.id}
                            >
                              {supplier.supplier_name}
                            </option>
                          )
                        })}
                      </select>
                    </div>
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
                  {(supplierSelected.supplier_emailaddress == "" || supplierSelected.supplier_emailaddress == " ") && (supplierSelected.supplier_mobileNum == "" || supplierSelected.supplier_mobileNum == " ") ?
                    <h6>
                      No contact info provided.
                    </h6>
                    :
                    <>
                      {supplierSelected.supplier_emailaddress == "" || supplierSelected.supplier_emailaddress == " " ?
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
                      {supplierSelected.supplier_mobileNum == "" || supplierSelected.supplier_mobileNum == " " ?
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