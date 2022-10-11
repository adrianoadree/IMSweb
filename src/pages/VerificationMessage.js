import React, { useEffect, useState } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { db } from "../firebase-config";
import RestrictedNavigation from '../layout/RestrictedNavigation';
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import  UserRouter  from '../pages/UserRouter'

const VerificationMessage = () => {

    const { googleSignIn, user, isNew } = UserAuth();
    const navigate = useNavigate();

    return (
        <div>
            <UserRouter
                route='/verify'
            />
            <RestrictedNavigation/>
            <div id="login-page">
                <div className="contents">
                    <div id="add-border">           
                        <div className="module-container" style={{width: '500px'}}>
                            <h2>
                                <strong>
                                    Hey, {(user.displayName).split(" ")[0]}
                                </strong>
                            </h2>
                            <h4>
                                Your verification is underway.
                            </h4>
                            <br />
                            <h5>
                                This should take 2-5 business days.
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }
export default VerificationMessage; 
