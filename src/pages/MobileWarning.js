import React from 'react';
import  UserRouter  from '../pages/UserRouter'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-bootstrap/Carousel';

const MobileWarning = () => {
    const carousel_content = [
        {caption: "Quick Access Dashboard", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_dashboard.png?alt=media&token=2840ec02-bb7f-4858-aea5-2bc3744530c1"},
        {caption: "Multi-user", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_user-select.png?alt=media&token=035ed65b-a6c7-4eb4-bb36-23463b4ab27e"},
        {caption: "Record Viewing", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_records.png?alt=media&token=d01ad8b4-f6ea-407a-a596-efbc7f04a5e6"},
        {caption: "Barcode Scanning", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_barcode-scanning.png?alt=media&token=ceec8bae-9142-4b30-98c9-d11284321001"},
        {caption: "Warehouse Map Viewing", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_warehouse.png?alt=media&token=ace42c49-5dde-4fbf-8569-73d6235024b7"},
        {caption: "Analytics", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_analytics.png?alt=media&token=b0b6cb8b-0edd-4f44-8f98-4c9adbe9334d"}
    ]

    return (
        <div>
            <UserRouter />
            <div id="mobile-warning" className="d-flex align-items-center justify-content-center flex-row">
                <div className="mobile-warning-section" >
                    <div className="p-5 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <div className="px-5 py-2 d-flex align-items-center justify-content-center flex-column">
                            <img id="brand-img-mobile" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52"/>
                        </div>
                        <hr />
                        <div className="text-center" style={{backgroundColor: "#09151f", borderRadius: "10px", padding: "2em 1.5em", color: "#ffffff"}}>
                            <h2 className="mb-2"><strong>IMS Web works better on a PC</strong></h2>
                            <h6 style={{color: "#b2c6d6"}}>Please use IMS Mobile instead</h6>
                        </div>
                        <div className="text-end w-100 mt-5">
                            <a id="learn-more" href="#mobile-showcase">Learn more ˃</a>
                        </div>
                    </div>
                </div>
            <div id="mobile-showcase" className="mobile-warning-section" style={{ background: "#ffffff" }}>
                <div className="p-5 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                    <div id="IMS-carousel-container" className="mb-2">
                        <div className="w-100 h-auto m-0 p-0">
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_top.png?alt=media&token=e477553b-05d3-435b-9cc6-1fc643183f97"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </div>
                        <div className="w-100 h-auto p-0 d-flex align-items-center justify-content-center flex-row" style={{marginTop: '-1px'}}>
                            <div className="m-0 p-0">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_left.png?alt=media&token=0c735225-3219-4421-91d7-b4e32a7762b1"
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                            </div>
                            <div className="m-0 p-0">
                                <Carousel
                                    id="IMS-carousel"
                                >
                                    {carousel_content.map((item)=>{
                                        return(
                                            <Carousel.Item>
                                                <img
                                                    src={item.img}
                                                    alt="Mobile Companion"
                                                >
                                                </img>
                                                <Carousel.Caption>
                                                    <h5>
                                                        {item.caption}
                                                    </h5>
                                                </Carousel.Caption>
                                            </Carousel.Item>
                                        )
                                    })}
                                </Carousel>
                            </div>
                            <div className="m-0 p-0">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_right.png?alt=media&token=ddc0b349-4fc4-4d1f-a2f6-faa58af1c011"
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                            </div>
                        </div>
                        <div className="w-100 h-auto p-0" style={{marginTop: '-2px'}}>
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_bottom.png?alt=media&token=b5b4d530-f24b-442e-b9c4-292c6004a1da"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </div>
                    </div>
                    <h5 className="mt-5 mb-5"><strong>IMS is also available on <span style={{ color: "#3DDC84" }}>Android</span></strong></h5>
                    <button className="edit d-flex align-items-center justify-content-center" style={{ padding: "0.5em 1em" }}>
                        <h5 className="pe-3" style={{ borderRight: "1px solid #b2c6d6" }}><FontAwesomeIcon icon={faDownload} /></h5>
                        <h6 className="ps-3">Download Now</h6>
                    </button>
                </div>
            </div>

            </div>
        </div>
    );
    }
export default MobileWarning; 
