import { Card, Nav, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, onSnapshot } from "firebase/firestore";
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


function Itemforecast({ isAuth }) {
  let navigate = useNavigate();

  const [stockcard, setStockcard] = useState([]);


  //read supplier collection
  useEffect(() => {
    const stockcardCollectionRef = collection(db, "stockcard")
    const q = query(stockcardCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;
  }, [])

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);


  return (
    <div className="row bg-light">
      <Navigation />
      <div className="col-3 p-5 ">
        <Card className="shadow" >
          <Card.Header className="bg-primary text-white">
            Product List
          </Card.Header>
          <Card.Body style={{ height: '600px' }}  id="scrollbar">
            <ListGroup as="ol" variant="flush" numbered>
              {stockcard.map((stockcard) => {
                return (
                  <ListGroup.Item as="li">
                    <small>{stockcard.id}</small>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </Card.Body>
        </Card>



      </div>

      <div className="col-9 p-5">

        <div className="row bg-white shadow">
          <div className="row p-5" style={{ height: "500px" }}>
            <h3 className='text-center p1'>ReorderPoint Forecasting</h3>
            <hr />
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
          <div className="row pt-2 pb-5 px-5">
            <hr />
            <div className="col-4">
              <Card className="bg-dark">
                <Card.Header>
                  <small className="text-center text-white">Product</small>
                </Card.Header>
                <Card.Body style={{ height: "160px" }}>
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

      </div>




    </div>



  );
}

export default Itemforecast;