import React, { useEffect, useState } from 'react';

import NewProductModal from "../components/NewProductModal";
import NewPurchaseModal from "../components/NewPurchaseModal";
import NewSalesModal from "../components/NewSalesModal";
import NewSupplierModal from "../components/NewSupplierModal";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleArrowLeft, faFileInvoice, faCircleArrowRight, faBoxOpen, faUser, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

function QuickAccess() {
  const [quickAccessExpanded, setQuickAccessExpanded] = useState(false) // listener if quick access is expanded

  const [productModalShow, setProductModalShow] = useState(false); // show/display new product modal
  const [supplierModalShow, setSupplierModalShow] = useState(false); // show/display new supplier modal
  const [purchaseModalShow, setPurchaseModalShow] = useState(false); // show/display new purchase modal
  const [salesModalShow, setSalesModalShow] = useState(false); // show/display new sale modal

  useEffect(() => {
    var quick_access = document.getElementById("quick-access")
    if (quickAccessExpanded) {
      quick_access.classList.add("expanded")
    }
    else {
      quick_access.classList.remove("expanded")
    }
  }, [quickAccessExpanded])


  return (
    <div>
      <NewSalesModal
        show={salesModalShow}
        onHide={() => setSalesModalShow(false)}
      />
      <NewPurchaseModal
        show={purchaseModalShow}
        onHide={() => setPurchaseModalShow(false)}
      />
      <NewProductModal
        show={productModalShow}
        onHide={() => setProductModalShow(false)}
      />
      <NewSupplierModal
        show={supplierModalShow}
        onHide={() => setSupplierModalShow(false)}
      />

      <div
        id="quick-access"
        className="d-flex align-items-bottom justify-content-center flex-column"
      >
        <div id="quick-access-header">
          <div className="d-flex justify-content-center align-items-end px-2 py-0 w-100">
            <button
              className="qa-btn d-flex justify-content-end py-0"
              data-title="Generate Sales Record"
              onClick={() => setSalesModalShow(true)}
            >
              <div className="qa-btn-icon">
                <FontAwesomeIcon icon={faFileInvoice} className="darkblue-icon" />
                <sub>
                  <FontAwesomeIcon icon={faCircleArrowLeft} className="darkblue-icon" />
                </sub>
              </div>
            </button>
          </div>
        </div>
        <div id="quick-access-buttons">
          <div className="d-flex justify-content-center flex-column p-2 align-items-center">
            <button
              className="qa-btn d-flex justify-content-end"
              data-title="Generate Purchase Record"
              onClick={() => setPurchaseModalShow(true)}
            >
              <div className="qa-btn-icon">
                <FontAwesomeIcon icon={faFileInvoice} className="darkblue-icon" />
                <sub>
                  <FontAwesomeIcon icon={faCircleArrowRight} f className="darkblue-icon" />
                </sub>
              </div>
            </button>
            <button
              className="qa-btn d-flex justify-content-end"
              data-title="Register New Product"
              onClick={() => setProductModalShow(true)}
            >
              <div className="qa-btn-icon">
                <FontAwesomeIcon icon={faBoxOpen} className="darkblue-icon" />
                <sub style={{ marginLeft: '-1.5em' }}>
                  <FontAwesomeIcon icon={faCirclePlus} className="darkblue-icon" />
                </sub>
              </div>
            </button>
            <button
              className="qa-btn d-flex justify-content-end"
              data-title="Register New Supplier"
              onClick={() => setSupplierModalShow(true)}
            >
              <div className="qa-btn-icon">
                <FontAwesomeIcon icon={faUser} className="darkblue-icon" />
                <sub>
                  <FontAwesomeIcon icon={faCirclePlus} className="darkblue-icon" />
                </sub>
              </div>
            </button>
          </div>
        </div>
        <div
          id="quick-access-toggler"
          onClick={() => { if (quickAccessExpanded) { setQuickAccessExpanded(false) } else { setQuickAccessExpanded(true) } }}
        >
          <div className="d-flex justify-content-center flex-column p-2 align-items-center">
            <button
              className="qa-btn d-flex justify-content-end"
              data-title={quickAccessExpanded ? "Minimze quick access" : "Maximize quick access"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M 492.2 388.533 L 387.446 403.785 L 340.571 499.047 C 332.194 516.049 307.819 516.174 299.319 499.047 L 252.442 403.785 L 147.69 388.533 C 128.813 385.783 121.188 362.531 134.938 349.279 L 210.817 275.27 L 192.815 170.631 C 189.69 151.754 209.567 137.627 226.192 146.504 L 319.944 195.885 L 413.698 146.504 C 421.448 142.377 430.823 143.127 437.948 148.254 C 444.948 153.379 448.573 162.131 447.073 170.631 L 429.198 275.27 L 505.075 349.279 C 518.7 362.531 511.075 385.783 492.2 388.533 Z" transform="matrix(-1, 0, 0, -1, 639.92244, 655.631287)" />
                <path d="M 53.88 41.658 L 310.844 42.271 C 342.483 45.097 335.281 84.759 311.827 82.704 L 53.88 82.704 C 27.166 84.691 22.246 43.09 53.88 41.658 Z" />
                <path d="M 52.859 113.546 L 212.754 114.159 C 242.803 118.036 233.542 157.195 213.366 154.592 L 52.859 154.592 C 32.032 157.846 21.841 118.393 52.859 113.546 Z" />
                <path d="M 56.499 191.423 L 159.983 192.036 C 193.626 198.245 183.621 237.579 160.379 232.469 L 56.499 232.469 C 34.293 236.588 22.188 197.068 56.499 191.423 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAccess