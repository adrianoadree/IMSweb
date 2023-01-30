import React from 'react';
import  UserRouter  from '../pages/UserRouter'

const MobileWarning = () => {

    return (
        <div>
            <UserRouter
            />
            <div id="login-page" className="p-2 w-100 h-100">
                <div className="px-2 pt-2 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div id="contents" className="px-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <div id="add-border" className="d-flex align-items-center justify-content-center">           
                            <div className="module-container d-flex align-items-center justify-content-center flex-column">
                            <img className="brand-img mb-5" style={{width:"50%"}} src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52"/>
                                <div>IMS Web works better in a PC.</div>
                                <div>Please use IMS Mobile instead.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }
export default MobileWarning; 
