import { Card,Nav,Table } from "react-bootstrap";
import ReportToday from "../components/reportstoday";
import Navigation from "../layout/Navigation";


function LandingPage(){


    return(
        <div className="row bg-light">
            <Navigation/>
            <div className="col-1"/>
                

            <div className="col-5 p-5" >
                <Card>
                    <Card.Header className="bg-primary py-3 px-4">
                        <h5 className="text-white">Today's Report</h5>
                        <small className="text-white">Date</small>
                    </Card.Header>
                    <Card.Body style={{height: "550px"}}>
                    <Nav fill variant="pills" defaultActiveKey="1">
                        <Nav.Item>
                            <Nav.Link eventKey="1">
                                Sales
                            </Nav.Link>
                        </Nav.Item>                    
                        <Nav.Item>
                            <Nav.Link eventKey="2">
                             Purchase
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                        <br/>
                    <Table striped bordered hover size="sm">
                        <thead className="bg-primary">
                            <tr>
                            <th>Doc Number</th>
                            <th>Date</th>
                            <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                            <td>1</td>
                            <td>Mark</td>
                            <td>Otto</td>
                            </tr>
                            <tr>
                            <td>2</td>
                            <td>Jacob</td>
                            <td>Thornton</td>
                            </tr>
                            <tr>
                            <td>3</td>
                            <td colSpan={2}>Larry the Bird</td>
                            </tr>
                        </tbody>
                    </Table>
                    </Card.Body>
                    <Card.Footer className="bg-primary">
                        <h6 className="text-white">Total</h6>
                    </Card.Footer>

                </Card>


            </div>

            <div className="col-5 p-5" >
                <ReportToday/>
            </div>




            <div className="col-1"/>

        </div>
    )
}
export default LandingPage;