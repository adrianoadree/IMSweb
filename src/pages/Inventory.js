import React from 'react';
import { Tab, Table, Button, Card, ListGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, updateDoc } from 'firebase/firestore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';

function Inventory() {

  const [stockcard, setStockcard] = useState([]);
  const stockcardCollectionRef = collection(db, "stockcard")


  //Read collection from database
  useEffect(() => {
    const getStockcard = async () => {
      const data = await getDocs(stockcardCollectionRef);
      setStockcard(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getStockcard()
  }, [stockcard])

  //update Stockcard
  const updateStockcard = async (id, quantity) => {
    const stockcardDoc = doc(db, "stockcard", id)
    const newFields = { quantity: quantity + 1 }
    await updateDoc(stockcardDoc, newFields)
  }

  //delete row 
  const deleteStockcard = async (id) => {
    const stockcardDoc = doc(db, "stockcard", id)
    await deleteDoc(stockcardDoc);
    alert('Item Removed from the Database')

  }

  const [modalShow, setModalShow] = React.useState(false);

  return (
    <div className="row bg-light">
      <Navigation />

      <Tab.Container id="list-group-tabs-example" defaultActiveKey="#link2">
        <div className="row bg-light">

          <div className='col-3 p-5'>

            <Card className='shadow'>
              <Card.Header className='bg-primary'>
                <div className='row'>
                  <div className='col-9 pt-2 text-white'>
                    <h6>Product List</h6>
                  </div>
                  <div className='col-3'>
                    <Button variant="primary"
                      onClick={() => setModalShow(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "500px" }}>
                <ListGroup variant="flush">
                  <ListGroup.Item action href="#link1">
                    Link 1
                  </ListGroup.Item>

                  {stockcard.map((stockcard) => {
                    return (
                      <ListGroup.Item action href="#link2">
                        <div className='row'>
                          <div className="col-9 pt-1">
                            <small>{stockcard.product_name}</small>
                          </div>
                          <div className='col-3'>
                            <Button
                              className="text-dark"
                              variant="outline-light"
                              size="sm"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </Button>
                          </div>
                        </div>

                      </ListGroup.Item>
                    )
                  })}

                </ListGroup>
              </Card.Body>
            </Card>
          </div>


          <div className='col-9 p-5'>
            <Tab.Content>
              <Tab.Pane eventKey="#link1">
                <div className='bg-white p-3 shadow'>
                  <div className='row'>
                    <h1 className='text-center py-3'>Inventory</h1>
                  </div>

                  <span><br /><br /></span>


                  <NewProductModal
                    show={modalShow}
                    onHide={() => setModalShow(false)} />


                  <Table striped bordered hover size="sm">
                    <thead className='bg-primary'>
                      <tr>
                        <th className='px-3'>Item Name</th>
                        <th className='px-3'>Selling Price</th>
                        <th className='px-3'>Purchase Price</th>
                        <th className='px-3'>Available Stock</th>
                        <th className='text-center'>Modify / Delete</th>

                      </tr>
                    </thead>
                    <tbody style={{ height: "500px" }}>
                      {stockcard.map((stockcard) => {
                        return (
                          <tr>
                            <td className='px-3'>
                              <small>{stockcard.product_name}</small>
                            </td>
                            <td className='px-3'>
                              <small>{stockcard.purchase_price}</small>
                            </td>
                            <td className='px-3'>
                              <small>{stockcard.selling_price}</small>
                            </td>
                            <td className='px-3'>
                              <small>{stockcard.quantity}</small>
                            </td>
                            <td className='px-3'>
                              <Button className='text-black px-4' variant="outline-light" onClick={() => { updateStockcard(stockcard.id, stockcard.quantity) }}>
                                Increment <FontAwesomeIcon icon={faPenToSquare}></FontAwesomeIcon>
                              </Button>
                              /
                              <Button className='text-black px-4' variant="outline-light" onClick={() => { deleteStockcard(stockcard.id) }}>
                                <FontAwesomeIcon icon={faTrashCan}></FontAwesomeIcon>
                              </Button>
                            </td>
                          </tr>
                        )
                      })}

                    </tbody>
                  </Table>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="#link2">
                <div className='row px-5'>
                  <div className='row bg-white shadow'>
                    <h1 className='text-center py-3 p1'>Inventory</h1>
                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Product Name:
                        </Card.Header>
                        <Card.Body>
                          <small>Supplier Name:</small><br />
                          <small>Available Stock:</small><br />
                          <small>Purchase Price:</small><br />
                          <small>Selling Price:</small><br />
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Barcode
                        </Card.Header>
                        <Card.Body>
                          <div className='bg-secondary' style={{ height: "50px" }}></div>
                      

                          
                        </Card.Body>
                        <Card.Footer className='bg-white'>
                          <Button size='sm'>
                            Generate Barcode
                          </Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  </div>

                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </Tab.Container>






    </div>
  );

}
export default Inventory;