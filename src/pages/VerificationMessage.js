import React from 'react';
import { UserAuth } from '../context/AuthContext';

import Navigation from '../layout/Navigation';
import  UserRouter  from '../pages/UserRouter'

const VerificationMessage = () => {

    const { user} = UserAuth(); // user data

    return (
        <div>
            <UserRouter
                route='/verify'
            />
            <Navigation
                page='/verify'
            />
            <div id="login-page" className="pt-5 h-100">
                <div className="px-5 pt-5 h-75 d-flex align-items-center justify-content-center">
                    <div id="contents" className="px-0 w-auto h-100 d-flex align-items-center justify-content-center">
                        <div id="add-border" className="d-flex align-items-center justify-content-center">           
                            <div className="module-container d-flex align-items-center justify-content-center flex-column">
                                <h2 className="py-4">
                                    <strong>
                                        Hey, {(user.displayName).split(" ")[0]}
                                    </strong>
                                </h2>
                                <h4 className="py-1">
                                    Your verification is underway.
                                </h4>
                                <br />
                                <h5 className="py-0">
                                    This should take 2-5 business days.
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }
export default VerificationMessage; 
