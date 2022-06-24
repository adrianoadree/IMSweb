import { Card } from "react-bootstrap";
import CommunityPosts from "../components/posts";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle, faUserLarge } from "@fortawesome/free-solid-svg-icons";

function Community(){

    return(
        
        <div className="row bg-light">
            <Navigation/>
            <div className="col-3"/>
            <div className="col-6 p-5">


            <div className="card text-white bg-secondary mb-5">
                    <div className="card-header">Create Post</div>
                    <div className="card-body">
                        <p className="card-text">Write Post</p>
                    </div>
            </div>
            
            <Card className="my-3 border border-dark">
                <Card.Header className="bg-primary">
                <div className="row">
                    <div className="col-10">
                        <small className="text-white"><FontAwesomeIcon icon ={faUserLarge}/> USER</small>
                    </div>
                    <div className="col-2 ">
                        <small className="text-white" >Date</small>
                    </div>
                </div>
                </Card.Header>
                <Card.Body>
                    <span>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</span>
                </Card.Body>
                <Card.Footer className="bg-light">
                    <div className="row">
                        <div className="col-12 text-muted">Comment Section</div>
                        <div className="row">
                            <div ><input className="col-12 "></input></div>
                        </div>
                    </div>
                </Card.Footer>
            </Card>


            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>
            <CommunityPosts/>


            </div>
            <div className="col-3"/>

        </div>

    );
}

export default Community;