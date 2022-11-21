import { useContext, createContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { setDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
const [user, setUser] = useState({});
const masterdataDocRef = doc(db, "masterdata", "user");
const months = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
}

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
     signInWithPopup(auth, provider);
  };

  const logOut = () => {
      signOut(auth)
  }

  var format = "";
  var cntr = 0;

  const createFormat = () => {
    onSnapshot(masterdataDocRef, (doc) => {
      cntr = doc.data().idCntr;
      format = cntr + "";
      while(format.length < 3) {format = "0" + format};
      format = "U" + format;
  }, []);
 }

 function subtractTime(time1, time2) {
    function addPadding(day) {
      while(day.length < 2) {day = "0" + day;}
      return day;
    }

    function changeFormat(time) {
      var date = "";
      var timeDate = time.substring(0,11);
      var timeTime = time.substring(12,19);
      date = timeDate.substring(7,11) + "-" + months[timeDate.substring(3,6)] + "-" + timeDate.substring(0,2) +  "T" + timeTime.substring(0,6) + addPadding(timeTime.substring(6,7));
      return date;
    }

    var time1F = changeFormat(time1);
    var time2F = changeFormat(time2);
    var t1 = new Date(time1);
    var t2 = new Date(time2);
    var difference = Math.abs(t2 - t1);
    return difference;
 }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      createFormat();
      setUser(currentUser);
      if (subtractTime((currentUser.metadata.creationTime).substring(5,24), (currentUser.metadata.lastSignInTime).substring(5,24)) < 60000) {
        setDoc(doc(db, "user", format), {
          name: currentUser.displayName,
          email: currentUser.email,
          isNew: true,
          status: 'new',
          user: currentUser.uid,
          stockcardId: 1,
          salesId: 1,
          purchaseId: 1,
          warehouseId: 1,
          supplierId: 1,
          adjustmentId: 1,
          preferences: {showTips: true, showQuickAccess: false,},
          categories: [],
          accounts: [{name: "admin", password: "admin", designation: "Administrator", isActive: true, isAdmin: true}],
        });

        updateDoc(masterdataDocRef,{idCntr : Number(cntr) + 1 });
          format="";
      } else {}
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ googleSignIn, logOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};