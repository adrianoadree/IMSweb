import ForecastingContentList from "../components/itemforecastingcontentlist";
import { Card, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from "../layout/Navigation";


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


function Itemforecast() {

  


  return (
    <div className="row bg-light">
      <Navigation />
      <div className="col-3 p-5 ">
        <ForecastingContentList />
      </div>

      <div className="col-9 p-5">
        <Nav className="shadow" fill variant="pills" defaultActiveKey="/analytics">
          <Nav.Item>
            <Nav.Link as={Link} to="/analytics" >Top Used Item</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/itemforecasting" active>Reorder Point Forecast</Nav.Link>
          </Nav.Item>
        </Nav>

        <span><br></br></span>


        <div className="row bg-white shadow">
          <div className="row p-5" style={{ height: "500px" }}>
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
                <Card.Body>
                </Card.Body>
              </Card>
            </div>
            <div className="col-4">
              <Card className="bg-success">
                <Card.Header>
                  <small className="text-center text-white">ReorderPoint</small>
                </Card.Header>
                <Card.Body>
                </Card.Body>
              </Card>
            </div>
            <div className="col-4">
              <Card className="bg-danger">
                <Card.Header>
                  <small className="text-center text-white">SafetyStock</small>
                </Card.Header>
                <Card.Body>
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