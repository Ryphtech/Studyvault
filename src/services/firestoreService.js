import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    setDoc,
    writeBatch,
    deleteDoc
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { USERS, ATTENDANCE, MARKS, PLACEMENTS, EVENTS, COURSES, ADMIN_STATS_MOCK, PLACED_STUDENTS } from "./mockData";

// --- Seeding ---
export const seedInitialData = async (targetUserId = null) => {
    try {
        console.log("Starting data seeding...");

        // Users
        for (const user of USERS) {
            await setDoc(doc(db, "users", user.uid), user);
        }

        // Attendance
        for (const record of ATTENDANCE) {
            await addDoc(collection(db, "attendance"), record);
        }

        // Marks
        for (const mark of MARKS) {
            await addDoc(collection(db, "marks"), mark);
        }

        // Duplicate Attendance & Marks for Target User (if strictly different from demo)
        if (targetUserId && targetUserId !== 'student_demo') {
            console.log(`Seeding personal data for ${targetUserId}...`);

            // Personal Attendance
            for (const record of ATTENDANCE) {
                const personalRecord = { ...record, studentId: targetUserId };
                await addDoc(collection(db, "attendance"), personalRecord);
            }

            // Personal Marks
            for (const mark of MARKS) {
                const personalMark = { ...mark, studentId: targetUserId };
                await addDoc(collection(db, "marks"), personalMark);
            }
        }

        // Placements
        for (const job of PLACEMENTS) {
            await addDoc(collection(db, "placements"), job);
        }

        // Placed Students
        for (const student of PLACED_STUDENTS) {
            await addDoc(collection(db, "placed_students"), student);
        }

        // Events
        for (const event of EVENTS) {
            await addDoc(collection(db, "events"), event);
        }

        // Courses (Faculty Schedule)
        for (const course of COURSES) {
            await setDoc(doc(db, "courses", course.id), course);
        }

        // Admin Stats (Mock collection for now to persist it)
        await setDoc(doc(db, "system", "stats"), ADMIN_STATS_MOCK);

        console.log("Seeding completed successfully!");
        return true;
    } catch (e) {
        console.error("Seeding failed: ", e);
        return false;
    }
};

// --- Remove Seeding ---
export const removeSeedData = async (targetUserId = null) => {
    try {
        console.log("Starting data removal...");
        const collectionsToDelete = ["attendance", "marks", "placements", "placed_students", "events", "courses", "system"];

        for (const colName of collectionsToDelete) {
            const querySnapshot = await getDocs(collection(db, colName));
            for (const document of querySnapshot.docs) {
                await deleteDoc(document.ref);
            }
        }

        // Also delete demo users, but DO NOT delete targetUserId
        const demoUsers = ["student_demo", "faculty_demo", "admin_demo"];
        for (const uid of demoUsers) {
            if (uid !== targetUserId) {
                await deleteDoc(doc(db, "users", uid));
            }
        }

        console.log("Data removal successfully completed!");
        return true;
    } catch (e) {
        console.error("Data removal failed: ", e);
        return false;
    }
};

// --- Users ---
export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching profile", e);
        return null;
    }
};

export const updateUserProfile = async (userId, data) => {
    try {
        const docRef = doc(db, "users", userId);

        // Helper function to recursively remove undefined properties
        const removeUndefinedPaths = (obj) => {
            return Object.entries(obj).reduce((acc, [k, v]) => {
                if (v === undefined) return acc;
                if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
                    const cleaned = removeUndefinedPaths(v);
                    if (Object.keys(cleaned).length > 0) {
                        acc[k] = cleaned;
                    }
                } else {
                    acc[k] = v;
                }
                return acc;
            }, {});
        };

        const cleanData = removeUndefinedPaths(data);

        // Merge true so it only updates the provided fields without wiping out existing ones (e.g., authentication flags, role)
        await setDoc(docRef, cleanData, { merge: true });
        return true;
    } catch (e) {
        console.error("Error updating profile", e);
        return false;
    }
};

export const subscribeToUsersByRole = (role, callback) => {
    const q = query(
        collection(db, "users"),
        where("role", "==", role)
    );
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        callback(users);
    }, (error) => {
        console.error("Error subscribing to users by role:", error);
    });
};

// --- Dashboard Stats ---
export const getStudentDashboardStats = async (studentId) => {
    const profile = await getUserProfile(studentId);

    // Calculate real-time attendance
    const attendanceRecords = await getStudentAttendance(studentId);
    let total = 0;
    let attended = 0;
    attendanceRecords.forEach(rec => {
        total += rec.totalClasses || 0;
        attended += rec.attendedClasses || 0;
    });
    const attendancePercentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
        attendance: attendancePercentage,
        cgpa: profile?.cgpa || 0,
        name: profile?.name || "Student",
        department: profile?.department || "General"
    };
};

export const getFacultyProfile = async (facultyId) => {
    return await getUserProfile(facultyId);
};

export const subscribeToAdminStats = (callback) => {
    // Real-time listener for user counts
    const q = query(collection(db, "users"));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data());
        const totalStudents = users.filter(u => u.role === 'student').length;
        const totalFaculty = users.filter(u => u.role === 'faculty').length;

        // Merging with static recent activity for now
        callback({
            totalStudents,
            totalFaculty,
            recentActivity: ADMIN_STATS_MOCK.recentActivity
        });
    });
};

export const getAdminStats = async () => {
    // Deprecated in favor of subscribeToAdminStats, keeping for backward compatibility if needed temporarily
    try {
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map(doc => doc.data());
        return {
            totalStudents: users.filter(u => u.role === 'student').length,
            totalFaculty: users.filter(u => u.role === 'faculty').length,
            recentActivity: ADMIN_STATS_MOCK.recentActivity
        };
    } catch (e) {
        return ADMIN_STATS_MOCK;
    }
};

// --- Attendance ---
export const getStudentAttendance = async (studentId) => {
    const q = query(
        collection(db, "attendance"),
        where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Marks ---
export const getStudentMarks = async (studentId) => {
    const q = query(
        collection(db, "marks"),
        where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- Events ---
export const subscribeToEvents = (callback) => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(events);
    });
};

export const getUpcomingEvents = async (limitCount = 5) => {
    try {
        const q = query(
            collection(db, "events"),
            orderBy("date", "asc"),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching events:", e);
        return [];
    }
};

// --- Placements ---
export const applyForDrive = async (driveId, studentId, applicationData) => {
    try {
        const docRef = await addDoc(collection(db, "applications"), {
            driveId,
            studentId,
            ...applicationData,
            status: 'Applied',
            statusColor: 'gray',
            appliedAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error applying for drive:", e);
        return { success: false, error: e.message };
    }
};

export const getStudentApplications = async (studentId) => {
    try {
        const q = query(
            collection(db, "applications"),
            where("studentId", "==", studentId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching student applications:", e);
        return [];
    }
};

export const getActiveDrives = async () => {
    const q = query(collection(db, "placements"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getDriveById = async (driveId) => {
    try {
        const docRef = doc(db, "placements", driveId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (e) {
        console.error("Error fetching drive by ID:", e);
        return null;
    }
};

export const subscribeToActiveDrives = (callback) => {
    const q = query(collection(db, "placements"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
        const drives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(drives);
    }, (error) => {
        console.error("Error subscribing to active drives:", error);
    });
};

export const createPlacementDrive = async (driveData) => {
    try {
        const docRef = await addDoc(collection(db, "placements"), {
            ...driveData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...driveData };
    } catch (e) {
        console.error("Error creating placement drive:", e);
        throw e;
    }
};

export const getRecentJobs = async (limitCount = 5) => {
    try {
        const q = query(collection(db, "placements"), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching jobs:", e);
        return [];
    }
};

export const getPlacedStudents = async () => {
    try {
        const q = query(collection(db, "placed_students"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching placed students:", e);
        return [];
    }
};

export const subscribeToPlacedStudents = (callback) => {
    const q = query(collection(db, "placed_students"));
    return onSnapshot(q, (snapshot) => {
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(students);
    }, (error) => {
        console.error("Error subscribing to placed students:", error);
    });
};

export const subscribeToDriveStudents = (driveId, callback) => {
    const q = query(
        collection(db, "applications"),
        where("driveId", "==", driveId)
    );

    return onSnapshot(q, async (snapshot) => {
        const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const studentsData = await Promise.all(applications.map(async (app) => {
            const profile = await getUserProfile(app.studentId);
            return {
                id: app.id, // Application ID
                studentRollNo: profile?.id || app.studentId.substring(0, 8).toUpperCase(),
                name: profile?.name || 'Unknown Student',
                dept: profile?.department || profile?.academicDetails?.department || 'N/A',
                status: app.status || 'Applied',
                statusColor: app.statusColor || 'gray',
            };
        }));

        callback(studentsData);
    }, (error) => {
        console.error("Error subscribing to drive students:", error);
    });
};

export const updateApplicationStatuses = async (updates) => {
    try {
        const batch = writeBatch(db);
        updates.forEach(update => {
            const appRef = doc(db, "applications", update.id);
            batch.update(appRef, {
                status: update.status,
                statusColor: update.statusColor
            });
        });
        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error updating application statuses:", e);
        return false;
    }
};

// --- Courses / Faculty Schedule ---
export const getFacultyCourses = async (facultyId) => {
    try {
        const q = query(collection(db, "courses"), where("facultyId", "==", facultyId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching faculty courses:", e);
        return [];
    }
};

// --- Common ---
export const markAttendance = async (subjectId, date, studentId, status) => {
    return await addDoc(collection(db, "attendance"), {
        subjectId,
        date,
        studentId,
        status
    });
};
