import Searchbar from "../components/searchbar";
import Contentlist from "../components/contentlist";
import { ButtonGroup,Button,Nav } from "react-bootstrap";
import TableData from "../components/table";
import Navigation from "../layout/Navigation";



function Records(){
    return(
        <div className="row bg-light">
            <Navigation/>
                <div className="col-3 p-5">
                    <Searchbar />
                    <span><br /></span>
                    <ButtonGroup aria-label="Basic example">
                    <Button className="ButtonC" variant="primary">Add</Button>
                    <Button className="ButtonC" variant="primary">Delete</Button>
                    <Button className="ButtonC" variant="primary">Modify</Button>
                    </ButtonGroup>

                    <Contentlist />
                </div>
            
                <div className="col-9 p-5">
                    <Nav fill variant="pills" defaultActiveKey="/records">
                        <Nav.Item>
                            <Nav.Link href="/records">Purchase History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-1">Sales History</Nav.Link>
                        </Nav.Item>                  
                    </Nav>
                    <span><br></br></span>
                
                    <div className="row px-5 py-3 bg-white">
                        <div className="row px-2 bg-white">
                        <small> Document Number: </small>
                        <small> Date: </small>
                        <small> Note: </small>
                        </div>
                    
                    <span><br /></span>
                    <TableData />

                    </div>



                



                
                </div>

        </div>
    )

}

export default Records;