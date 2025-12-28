import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    updateDoc,
    onSnapshot
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// --- Users ---
export const getUserProfile = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

// --- Attendance ---
export const markAttendance = async (subjectId, date, studentId, status) => {
    return await addDoc(collection(db, "attendance"), {
        subjectId,
        date,
        studentId,
        status
    });
};

export const getStudentAttendance = async (studentId) => {
    const q = query(collection(db, "attendance"), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Marks ---
export const uploadMarks = async (studentId, subjectId, marksData) => {
    // Check if exists or create new
    // For simplicity using addDoc, but might want setDoc with specific logic
    return await addDoc(collection(db, "marks"), {
        studentId,
        subjectId,
        ...marksData,
        timestamp: new Date()
    });
};

// --- Events ---
// Real-time listener for events
export const subscribeToEvents = (callback) => {
    return onSnapshot(collection(db, "events"), (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(events);
    });
};

export const createEvent = async (eventData) => {
    return await addDoc(collection(db, "events"), eventData);
};

// --- Placements ---
export const getActiveDrives = async () => {
    // Logic to filter by date or active status
    const q = query(collection(db, "placements"), where("isActive", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
