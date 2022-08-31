import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, onSnapshot,doc,getDoc } from "firebase/firestore";
import { Card, Nav, ListGroup, Tab, Button, FormControl } from 'react-bootstrap';
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function Itemforecast() {

  //---------------------VARIABLES---------------------

  const [docId, setDocId] = useState("xx"); //document Id
  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
  const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable


  const data = [
    {
      date: 'Monday',
      Product: 500,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Tuesday',
      Product: 450,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Wednesday',
      Product: 370,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Thursday',
      Product: 200,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Friday',
      Product: 120,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Saturday',
      Product: 80,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
    {
      date: 'Sunday',
      Product: 20,
      ReorderPoint: 120,
      SafetyStock: 100,
    },
  ];

  //---------------------FUNCTIONS---------------------


  //Read stock card collection from database
  useEffect(() => {
    const collectionRef = collection(db, "stockcard");
    const q = query(collectionRef);
    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [])

  //access stockcard document
  useEffect(() => {
    async function readStockcardDoc() {
      const stockcardRef = doc(db, "stockcard", docId)
      const docSnap = await getDoc(stockcardRef)
      if (docSnap.exists()) {
        setStockcardDoc(docSnap.data());
      }
    }
    readStockcardDoc()
  }, [docId])


  return (
    <div className="row">
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row contents">
            <div className="row py-4 px-5">
                <div className="sidebar">
                  <Card className='sidebar-card'>
                    <Card.Header>
                      <div className='row'>
                        <div className="col-1 left-full-curve">
                          <Button className="fc-search no-click me-0">
                            <FontAwesomeIcon icon={faSearch} />
                          </Button>
                        </div>
                        <div className="col-11">
                          <FormControl
                              placeholder="Search"
                              aria-label="Search"
                              aria-describedby="basic-addon2"
                              className="fc-search right-full-curve mw-0"
                            />
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body>
                      <div className="row g-1 sidebar-header">
                        <div className="col-4 left-curve">
                          Item Code
                        </div>
                        <div className="col-8 right-curve">
                          Description
                        </div>
                      </div>
                      <div className='scrollbar'>
                      <ListGroup variant="flush">
                        {stockcard.map((stockcard) => {
                          return (
                            <ListGroup.Item
                              action
                              key={stockcard.id}
                              eventKey={stockcard.id}
                              onClick={() => { setDocId(stockcard.id) }}>
                                  <div className="row gx-0 sidebar-contents">
                                  <div className="col-4">
                                    {stockcard.id}
                                  </div>
                                  <div className="col-8">
                                    {stockcard.description}
                                  </div>
                                </div>
                            </ListGroup.Item>
                          )
                        })}

                      </ListGroup>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="divider">

                </div>
                <div className="data-contents">
                <Tab.Content>
                  <Tab.Pane eventKey={0}>
                    <div className="row">
                      <div className="row p-3 m-0" style={{ height: "500px" }}>
                        <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting</h1>
                        <hr />
                        <div className="row m-0 mt-2 mb-4 px-5 py-2 yellow-strip">
                          <div className="row p1 text-center">
                            <div className="col-3">
                              Item Code
                            </div>
                            <div className="col-7">
                              Item Description
                            </div>
                            <div className="col-2">
                              Quantity
                            </div>
                          </div>
                          <hr className="yellow-strip-divider"></hr>
                          <div className="row my-2">
                            <div className="col-2">
                              <h5><strong>ID</strong></h5>
                            </div>
                            <div className="col-8">
                              <h5><strong>Desc</strong></h5>
                            </div>
                            <div className="col-2">
                              <h5><strong>Quanti</strong></h5>
                            </div>
                          </div>
                        </div>
                        <div>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              width={500}
                              height={300}
                              data={data}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="Product" stroke="black" activeDot={{ r: 8 }} />
                              <Line type="monotone" dataKey="ReorderPoint" stroke="green" />
                              <Line type="monotone" dataKey="SafetyStock" stroke="red" />

                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="row pt-2 pb-5 px-5">
                        <hr />
                        <div className="col-4">
                          <Card className="bg-dark">
                            <Card.Header>
                              <small className="text-center text-white">Product</small>
                            </Card.Header>
                            <Card.Body style={{ height: "10px" }}>
                            </Card.Body>
                          </Card>
                        </div>
                        <div className="col-4">
                          <Card className="bg-success">
                            <Card.Header>
                              <small className="text-center text-white">ReorderPoint</small>
                            </Card.Header>
                            <Card.Body style={{ height: "10" }}>

                            </Card.Body>
                          </Card>
                        </div>
                        <div className="col-4">
                          <Card className="bg-danger">
                            <Card.Header>
                              <small className="text-center text-white">SafetyStock</small>
                            </Card.Header>
                            <Card.Body style={{ height: "10px" }} >
                            </Card.Body>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey={docId}>
                    <div className="row">
                      <div className="row p-3 m-0" style={{ height: "500px" }}>
                        <h1 className='text-center pb-2 module-title'>Reorder Point Forecasting
                        </h1>
                        <hr />
                        <div className="row m-0 mt-2 mb-4 px-5 py-2 yellow-strip">
                          <div className="row p1 text-center">
                            <div className="col-3">
                              Item Code
                            </div>
                            <div className="col-7">
                              Item Description
                            </div>
                            <div className="col-2">
                              Quantity
                            </div>
                          </div>
                          <hr className="yellow-strip-divider"></hr>
                          <div className="row my-2">
                            <div className="col-2">
                              <h5><strong>{docId}</strong></h5>
                            </div>
                            <div className="col-8">
                              <h5><strong>Desc</strong></h5>
                            </div>
                            <div className="col-2">
                              <h5><strong>Quanti</strong></h5>
                            </div>
                          </div>
                        </div>
                        <div>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={data}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Product" stroke="black" activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="ReorderPoint" stroke="green" />
                            <Line type="monotone" dataKey="SafetyStock" stroke="red" />

                          </LineChart>
                        </ResponsiveContainer>

                        </div>
                      </div>
                      <div className="row pt-2 pb-5 px-5">
                        <hr />
                        <div className="col-4">
                          <Card className="bg-dark">
                            <Card.Header>
                              <small className="text-center text-white">
                                Product ID: {docId}
                              </small>
                            </Card.Header>
                            <Card.Body
                              className="text-white"
                              style={{ height: "160px" }}>
                              <small>Product Description:</small><br />
                              <small> - {stockcardDoc.description}</small><br />

                            </Card.Body>
                          </Card>
                        </div>
                        <div className="col-4">
                          <Card className="bg-success">
                            <Card.Header>
                              <small className="text-center text-white">ReorderPoint</small>
                            </Card.Header>
                            <Card.Body style={{ height: "160px" }}>
                              <small className="text-center text-white"> A reorder point (ROP) is the specific level at which your stock needs to be
                                replenished. In other words, it tells you when to place an order so you don’t run out of an
                                item.</small>
                            </Card.Body>
                          </Card>
                        </div>
                        <div className="col-4">
                          <Card className="bg-danger">
                            <Card.Header>
                              <small className="text-center text-white">SafetyStock</small>
                            </Card.Header>
                            <Card.Body style={{ height: "160px" }} >
                              <small className="text-center text-white">
                                This is the extra quantity of a product that kept in storage to prevent stockouts. Safety stock serves as insurance against demand fluctuations.
                              </small>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>

                    </div>




                  </Tab.Pane>
                </Tab.Content>
              </div>
            </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default Itemforecast;