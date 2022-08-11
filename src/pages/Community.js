import { Card, Placeholder, Form, Button } from "react-bootstrap";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../firebase-config";
import { addDoc, collection, orderBy, query, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import moment from "moment";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Community() {

    const communityCollectionRef = collection(db, "community")

    const [inputValue, setInputValue] = useState();
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [user, setUser] = useState({})
    const [newPost, setNewPost] = useState("");
    let navigate = useNavigate();



    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });


    //add document to database
    const addPost = async () => {
        await addDoc(communityCollectionRef, { community_postAuthor: user.email, community_post: newPost, community_postTimestamp: serverTimestamp() });
        successToast();
    }

    //read collection from community
    useEffect(() => {
        const q = query(communityCollectionRef, orderBy("community_postTimestamp", "desc"));

        const unsub = onSnapshot(q, (snapshot) =>
            setPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );

        return unsub;
    }, [])



    const successToast = () => {
        toast.success('Post Successfully added to the Community', {
            position: "top-right",
            autoClose: 4996,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    return (


        <div className="row bg-light">


            <Navigation />

            <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />


            <div className="col-3" />
            <div className="col-6 p-5">
                <Card className="shadow mb-4">
                    <Card.Header className="bg-dark">
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
                                variant="outline-dark"
                                onClick={addPost}>
                                Post</Button>
                        </div>
                    </Card.Footer>
                </Card>

                <strong className="text-muted">Feed of Posts</strong><hr />

                {posts.map((posts) => {
                    return (
                        <Card className="my-4 shadow" key={posts.id}>
                            <Card.Header className="bg-primary">
                                <div className="row">
                                    <div className="col-9">
                                        <small className="text-white"><FontAwesomeIcon icon={faUserLarge} /> {posts.community_postAuthor}</small>
                                    </div>
                                    <div className="col-3 ">
                                        <small className="text-white" >
                                            {new Date(posts.community_postTimestamp?.seconds * 1000).toLocaleDateString("en-US")}
                                        </small>
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
                                        <div className="col-10">
                                            <Form.Control type="text" placeholder="Enter Comment here...." />
                                        </div>
                                        <div className="col-2">
                                            <Button
                                            variant="outline-primary"
                                            >
                                                <small>Comment</small>
                                            </Button>
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