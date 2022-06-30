import AnalyticsContentList from "../components/analyticscontentlist";

import { Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from "../layout/Navigation";


const data = [
  {
    date: 'Monday',
    Chippy: 500,
    Bearbrand: 700,
    PancitCanton: 500,
  },
  {
    date: 'Tuesday',
    Chippy: 450,
    Bearbrand: 600,
    PancitCanton: 470,
  },

  {
    date: 'Wednesday',
    Chippy: 400,
    Bearbrand: 590,
    PancitCanton: 450,
  },

  {
    date: 'Thursday',
    Chippy: 390,
    Bearbrand: 1080,
    PancitCanton: 440,
  },
  {
    date: 'Friday',
    Chippy: 360,
    Bearbrand: 550,
    PancitCanton: 430,
  },
  {
    date: 'Saturday',
    Chippy: 300,
    Bearbrand: 530,
    PancitCanton: 400,
  },
  {
    date: 'Sunday',
    Chippy: 280,
    Bearbrand: 500,
    PancitCanton: 390,
  },
];




function Analytics() {



  return (
    <div className="row bg-light">
      <Navigation />
      <div className="col-3 p-5 ">
        <AnalyticsContentList />


      </div>

      <div className="col-9 p-5 ">
        <Nav className="shadow" fill variant="pills" defaultActiveKey="/analytics">
          <Nav.Item>
            <Nav.Link as={Link} to="/analytics" active>Top Used Item</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/itemforecasting">Reorder Point Forecast</Nav.Link>
          </Nav.Item>
        </Nav>
        <span><br></br></span>



        <div className="row p-5 bg-white shadow" style={{ height: "500px" }}>


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
              <CartesianGrid />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Chippy" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Bearbrand" stroke="#82ca9d" />
              <Line type="monotone" dataKey="PancitCanton" stroke="black" />

            </LineChart>
          </ResponsiveContainer>
        </div>





      </div>
    </div>


  );
}
export default Analytics;
