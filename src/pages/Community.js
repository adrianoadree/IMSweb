import { Card, Placeholder, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import CommunityPosts from "../components/posts";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../firebase-config";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';


function Community({isAuth}) {

    const [show, setShow] = useState(false);
    const [inputValue, setInputValue] = useState();
    const [posts, setPosts] = useState([]);

    const [user, setUser] = useState({});
    const communityCollectionRef = collection(db, "community")
    const [newPost, setNewPost] = useState("");
    let navigate = useNavigate();

    useEffect(() =>{
        if(!isAuth){
            navigate("/login");
        }
    },[]);

    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });


    //add document to database
    const addPost = async () => {
        await addDoc(communityCollectionRef, { community_postAuthor: user.email, community_post: newPost });
        setShow(true)
        setInputValue("")
    }


    //read collection from stockcard
    useEffect(() => {
        const getPosts = async () => {
            const data = await getDocs(communityCollectionRef);
            setPosts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };
        getPosts()
    }, [])

    

    return (


        <div className="row bg-light">


            <Navigation />
            <div className="col-3" />
            <div className="col-6 p-5">
                <ToastContainer className="m-3" position='top-end'>
                    <Toast className="bg-success" onClose={() => setShow(false)} show={show} delay={3000} autohide>
                        <Toast.Header>
                            <strong className="me-auto">IMS</strong>
                        </Toast.Header>
                        <Toast.Body>
                            <span>Product <strong>SUCCESSFULLY ADDED</strong> to the Inventory</span>
                        </Toast.Body>
                    </Toast>
                </ToastContainer>





                <Card className="shadow mb-4">
                    <Card.Header className="bg-primary">
                        <small className="text-white">Create Post</small>
                    </Card.Header>
                    <Card.Body>
                        <Form>
                            <Form.Control
                                as="textarea"
                                placeholder="Share something to the community"
                                rows={2}
                                value={inputValue}
                                onChange={(event) => { setNewPost(event.target.value); }}
                            />
                        </Form>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                        <div className="row px-2">
                            <Button
                                variant="outline-primary"
                                onClick={addPost}>
                                Post</Button>
                        </div>
                    </Card.Footer>
                </Card>

                <strong className="text-muted">Feed of Posts</strong><hr />

                {posts.map((posts) => {
                    return (
                        <Card className="my-4 shadow">
                            <Card.Header className="bg-primary">
                                <div className="row">
                                    <div className="col-10">
                                        <small className="text-white"><FontAwesomeIcon icon={faUserLarge} /> {posts.community_postAuthor}</small>
                                    </div>
                                    <div className="col-2 ">
                                        <small className="text-white" ></small>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                {posts.community_post}
                            </Card.Body>
                            <Card.Footer className="bg-light">
                                <div className="row">
                                    <div className="col-12 text-muted">Comment Section</div>
                                    <div className="row">
                                        <div className="col-4">
                                            <small><FontAwesomeIcon icon={faUserLarge} /> {user?.email}</small>
                                        </div>
                                        <div className="col-8">
                                            <input className="col-12" placeholder="Enter your comment here..."></input>
                                        </div>
                                    </div>
                                </div>
                            </Card.Footer>
                        </Card>

                    )
                })}



                <Placeholder as="p" animation="glow">
                    <Placeholder lg={12} />
                </Placeholder>



            </div>
            <div className="col-3" />

        </div>

    );
}

export default Community;