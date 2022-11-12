import RPersoneact from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, Call, InformationCircle } from 'react-ionicons'
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserRouter from '../pages/UserRouter'
import { UserAuth } from '../context/AuthContext'
import { Spinner } from 'loading-animations-react';




function SupplierList() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

  const [editShow, setEditShow] = useState(false); //display/ hide edit modal
  const [modalShow, setModalShow] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState(); //supplier Collection
  const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
  const [docId, setDocId] = useState(); //document id variable

  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])


  return (
    <div>
      <UserRouter
        route=''
      />
      <Navigation />

      <Tab.Container
        activeKey={key}
        onSelect={(k) => setKey(k)}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                   
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div id='scrollbar' style={{ height: '400px' }}>
                    <ListGroup activeKey={key} variant="flush">
                            <ListGroup.Item
                                  action
                                  key={0}
                                  eventKey={0}
                                  onClick={() => { }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-12">
                                      Choice
                                    </div>
                                  </div>
                                </ListGroup.Item>

                          </ListGroup>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
                <Tab.Pane eventKey='main'>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Supplier List</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={0}>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Supplier List</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      
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

export default SupplierList;