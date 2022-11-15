import React from "react";
import { Modal, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { UserAuth } from '../context/AuthContext';

import { doc, getDoc, collection, query, where, onSnapshot} from 'firebase/firestore';
import { Cube, Grid, Pricetag, Cart, Layers, GitBranch, Close } from 'react-ionicons'
import { Spinner } from 'loading-animations-react';

function RecordQuickView(props) {
  const { user } = UserAuth();
  const [userID, setUserID] = useState("");
  const [recordDoc, setRecordDoc] = useState(); //transaction document variable
  const [isFetched, setIsFetched] = useState(false); //listener for when collection is retrieved
  const userCollectionRef = collection(db, "user"); //user collection database reference variable
  const [userCollection, setUserCollection] = useState(); // user collection  variable
  const [userProfile, setUserProfile] = useState({}); //user profile document variable
  const [supplierCollection, setSupplierCollection] = useState(); //supplier collection  variable

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    //read user collection
    if (userID === undefined) {
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else 
    {
      const userCollectionRef = collection(db, "user");
      const q = query(userCollectionRef, where("user", "==", userID));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
          
    }
  }, [userID])

  useEffect(() => {
    //read supplier collection
    if (userID === undefined) {
      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplierCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplierCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])
  
  useEffect(() => {
    //set user profile
    if(userCollection === undefined)
    {

    }
    else
    {
      userCollection.map((metadata) => {
        setUserProfile(metadata)
      });
    }
  }, [userCollection])

  
  useEffect(() => {
    async function readPurchaseRecordDoc() {
      const purchaseRecordRef = doc(db, "purchase_record", props.recordid)
      const docSnap = await getDoc(purchaseRecordRef)
      if (docSnap.exists()) {
        setRecordDoc({ ...docSnap.data(), id: docSnap.id });
      }
    }
    async function readSalesRecordDoc() {
      const salesRecordRef = doc(db, "sales_record", props.recordid)
      const docSnap = await getDoc(salesRecordRef)
      if (docSnap.exists()) {
        setRecordDoc({ ...docSnap.data(), id: docSnap.id });
      }
    }
    if(props.recordid === undefined) {
    
    }
    else
    {
      if(props.recordid.startsWith("PR"))
      {
        readPurchaseRecordDoc() //for purchase record
      }
      else
      {
        readSalesRecordDoc() // for sales record
      }
    }
  }, [props.recordid])

  useEffect(()=>{
    if(recordDoc === undefined) {
      setIsFetched(false)
    }
    else
    {
      setIsFetched(true)
    }
  }, [recordDoc])

  const getSupplierInfo = (supplier_id) => {
    var target_supplier
    if(supplierCollection !== undefined)
    {
    supplierCollection.map((supp) => {
      if(supp.id == supplier_id)
      {
        target_supplier = supp
      }
    })
    return target_supplier
    }
    else
    {
      return {supplier_name: "", supplier_emailaddress: "", supplier_address: "", supplier_mobileNum: "", supplier_telNum: ""}
    }
  }

  const expandProductList = (product_list) => {
    var temp_product_list = product_list
    while(temp_product_list.length < 5) {
      temp_product_list.push(
        {
          itemQuantity: 0,
          itemName: "|",
          itemSPrice: 0,
          itemPPrice: 0,
        }
      )
    }
    return temp_product_list;
  }

  const findTotal = (product_list, type) => {
    var total = 0
    if(type == "P")
    {
      product_list.map((product)=>{
        total = total + (product.itemQuantity * product.itemPPrice)
      })
    }
    else
    {
      product_list.map((product)=>{
        total = total + (product.itemQuantity * product.itemSPrice)
      })
    }
    return total
  }

  const checkIfEmpty = (info_string) => {
    return (info_string === undefined || info_string == "" || info_string == " " || info_string == 0)
  }
    
  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      id="record-quick-view-modal"
      fullscreen="xl-down"
      className="IMS-modal"
    >
      {recordDoc === undefined?
        <></> 
      : 
        <Modal.Body
          className="d-flex justify-content-center"
        >
          {isFetched?
            <div id="record-receipt" className="p-4">
              <div className="business-information">
                <div className="p-0 m-0 w-100 h-100 d-flex align-items-center justify-content-center text-center flex-column">
                  {recordDoc.id.startsWith("PR")?
                    <>
                      {recordDoc.transaction_supplier.startsWith("SU")?
                        <>
                          <h3 className="stretched-heading">{getSupplierInfo(recordDoc.transaction_supplier).supplier_name.toUpperCase()}</h3>
                          <small>{getSupplierInfo(recordDoc.transaction_supplier).supplier_address}</small>
                          <small>
                            {checkIfEmpty(getSupplierInfo(recordDoc.transaction_supplier).supplier_mobileNum)?
                              <></>
                            :
                              <>Mobile Number: {getSupplierInfo(recordDoc.transaction_supplier).supplier_mobileNum}  &#x2022; </>
                            }
                            {checkIfEmpty(getSupplierInfo(recordDoc.transaction_supplier).supplier_telNum)?
                              <></>
                            :
                              <>Telephone Number: {getSupplierInfo(recordDoc.transaction_supplier).supplier_telNum}  &#x2022;</>
                            }
                            {checkIfEmpty(getSupplierInfo(recordDoc.transaction_supplier).supplier_emailaddress)?
                              <></>
                            :
                              <>Email: {getSupplierInfo(recordDoc.transaction_supplier).supplier_emailaddress}</>
                            }
                          </small>
                        </>
                      :
                        <h3 className="stretched-heading">{recordDoc.transaction_supplier.toUpperCase()}</h3>
                      }
                    </>
                  :
                    <>
                      <h3 className="stretched-heading">{userProfile.bname.toUpperCase()}</h3>
                      <small>{userProfile.baddress}</small>
                      <small>Mobile Number: {userProfile.bphone}  &#x2022;  Email: {userProfile.bemail}</small>
                    </>
                  }
                </div>
              </div>
              <div className="receipt-metadata">
                <div className="p-0 m-0 w-100 h-100 d-flex align-items-center justify-content-between text-center">
                  <h3 className="heading">OFFICIAL RECEIPT</h3>
                  <h3 id="record-id">No. <span>{recordDoc.id.substring(2, 7)}</span></h3>
                </div>
              </div>
              <div className="receipt-contents">
                <div className="recipient p-1">
                  <div className="row p-0 m-0 w-100 d-flex align-items-center justify-content-between">
                    <div className="col-9 p-0 m-0 d-flex align-items-baseline justify-content-between pe-2">
                      <div className="col-2">
                        <small>Deliver To:</small>
                       </div>
                       <div className="col-10">
                        <div className=" w-100 field-underline">
                          {recordDoc.id.startsWith("PR")?
                            <h5>{userProfile.bname.toUpperCase()}</h5>
                          :
                          <>
                            <h5>Customer</h5>
                          </>
                          }

                        </div>
                      </div>
                     </div>
                    <div className="col-3 p-0 m-0 d-flex align-items-baseline justify-content-between ps-2">
                      <div className="col-3">
                        <small>Date:</small>
                      </div>
                      <div className="col-9">
                        <div className=" w-100 field-underline">
                          <h5>{recordDoc.transaction_date}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row p-0 m-0 w-100 d-flex align-items-center justify-content-between">
                    <div className="col-9 p-0 m-0 d-flex align-items-baseline justify-content-between pe-2">
                      <div className="col-2">
                        <small>Address:</small>
                       </div>
                       <div className="col-10">
                        <div className=" w-100 field-underline"></div>
                      </div>
                     </div>
                  </div>
                </div>
                <div className="breakdown">
                  <Table className="scrollable-table receipt-table mb-0 h-100">
                    <thead>
                      <tr>
                        <th className="qty">
                          Quantity
                        </th>
                        <th colSpan={3}>
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expandProductList(recordDoc.product_list).map((item) => {
                        return(
                          <tr
                            className={item.itemName == "|"?"empty-product-list":""}>
                            <td className="qty">{item.itemQuantity} units</td>
                            <td className="desc">{item.itemName}</td>
                            <td className="price">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>&#8369;</div>
                                <div>{(Math.round(item.itemPPrice * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                              </div>
                            </td>
                            <td className="amnt">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>&#8369;</div>
                                <div>{(Math.round((item.itemQuantity * item.itemPPrice) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                              </div>
                            </td>
                          </tr>
                        )
                        })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td className="qty"></td>
                        <td className="desc"></td>
                        <td className="price">
                          <strong>Total</strong>
                        </td>
                        <td className="amnt">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>&#8369;</div>
                            <div>
                              {recordDoc.id.startsWith("PR")?
                                <>{(Math.round((findTotal(recordDoc.product_list, "P")) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</>
                              :
                                <>{(Math.round((findTotal(recordDoc.product_list, "S")) * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</>
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </div>
              <div className="receipt-footer">
                <div className="row p-0 m-0 d-flex justify-content-center align-items-center">
                  <div className="col-8 p-0 m-0 d-flex align-items-baseline justify-content-between pe-2">
                    <div className="col-1">
                      <small>Notes: </small>
                    </div>
                    <div className="col-11">
                      <div className=" w-100 field-underline">
                      {recordDoc.transaction_note}
                      </div>
                    </div>
                  </div>
                  <div className="col-4 p-0 m-0 d-flex align-items-baseline justify-content-between pe-2">
                    <div className="col-3">
                      <small>Ordered: </small>
                    </div>
                    <div className="col-9">
                      <div className=" w-100 field-underline">
                      {recordDoc.id.startsWith("PR")?
                        <>
                          {recordDoc.order_date === undefined || recordDoc.order_date == "" || recordDoc.order_date == " "?
                            <></>
                          :
                          <>{recordDoc.order_date}</>
                          }
                        </>
                      :
                        <>N/A</>
                      }
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
            </Modal.Body>
          }
      </Modal>
    );
  }

export default RecordQuickView;