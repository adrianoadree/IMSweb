import Searchbar from "../components/searchbar";
import SupplierContentList from "../components/suppliercontentlist";
import { Button,ButtonGroup } from 'react-bootstrap';
import Navigation from "../layout/Navigation";

function SupplierList(){
    return(
            <div className="row bg-light">
                <Navigation/>
                <div className="col-3 p-5">
                    <Searchbar/>
                    <span><br></br></span>
                    <ButtonGroup aria-label="Basic example">
                    <Button className="ButtonC" variant="primary">Add</Button>
                    <Button className="ButtonC" variant="primary">Delete</Button>
                    <Button className="ButtonC" variant="primary">Modify</Button>
                    </ButtonGroup>
                    <SupplierContentList/>

                </div>
                <div className="col-9 p-5">
                    <div className="bg-white">
                        <div className="row px-2 py-5 bg-white">
                        <small> Supplier Name: </small>
                        <small> Note: </small>
                        </div>
                    </div>
                </div>


            </div>




    );
}
export default SupplierList;