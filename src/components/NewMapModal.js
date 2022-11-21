import { addDoc, setDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { padStart } from "lodash";
import { Modal, Button } from 'react-bootstrap';
import React, { StrictMode } from "react";
import { collection, where, query, getDoc } from 'firebase/firestore';
import { db, get, then } from '../firebase-config';
import { useState, useEffect } from 'react';
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import { UserAuth } from '../context/AuthContext'
import { Warning } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from 'loading-animations-react';




export default NewMapModal;
