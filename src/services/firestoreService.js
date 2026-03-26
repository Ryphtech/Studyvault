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

export const seedFeedbackData = async () => {
    try {
        console.log("Starting feedback data seeding...");

        const feedbackSurveys = [
            {
                title: 'Course Evaluation: CS101',
                date: 'Created on Oct 24, 2023',
                responses: '45',
                questions: '12',
                status: 'Active',
                icon: 'school',
                color: 'blue',
                createdAt: new Date().toISOString()
            },
            {
                title: 'Canteen Feedback Survey',
                date: 'Created on Oct 20, 2023',
                responses: '128',
                questions: '8',
                status: 'Active',
                icon: 'food-fork-drink',
                color: 'purple',
                createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
                title: 'Library Services Audit',
                date: 'Last edited 2 days ago',
                responses: '-',
                questions: '15',
                status: 'Draft',
                icon: 'bookshelf',
                color: 'orange',
                createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            },
            {
                title: 'Annual Sports Day Feedback',
                date: 'Closed on Sep 15, 2023',
                responses: '342',
                questions: '5',
                status: 'Closed',
                icon: 'trophy',
                color: 'gray',
                createdAt: new Date(Date.now() - 8640000000).toISOString() // ~100 days ago
            }
        ];

        const batch = writeBatch(db);
        feedbackSurveys.forEach((survey) => {
            const docRef = doc(collection(db, "feedback"));
            batch.set(docRef, survey);
        });

        await batch.commit();
        console.log("Feedback data seeding completed!");
        return true;
    } catch (e) {
        console.error("Feedback seeding failed: ", e);
        return false;
    }
};

export const seedNotificationData = async () => {
    try {
        console.log("Starting notification data seeding...");

        const notifications = [
            {
                title: 'New Job Posting: Google Software Engineer Intern',
                body: 'Applications are now open for the summer internship program. Eligibility: Pre-final year students only.',
                category: 'Placements',
                icon: 'work',
                iconBg: 'rgba(0, 85, 255, 0.1)',
                iconColor: '#0055ff',
                isRead: false,
                createdAt: new Date().toISOString()
            },
            {
                title: 'Results Published: Semester 5 Mid-terms',
                body: 'The mid-term examination results for all CS/IT departments have been uploaded to the portal.',
                category: 'Academics',
                icon: 'school',
                iconBg: 'rgba(16, 185, 129, 0.15)',
                iconColor: '#059669',
                isRead: false,
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
            },
            {
                title: 'Annual Tech Fest: Registration ends soon',
                body: "Last call for Hackathon entries! Registration closes tonight at 11:59 PM. Don't miss out on prizes.",
                category: 'Events',
                icon: 'event',
                iconBg: 'rgba(245, 158, 11, 0.15)',
                iconColor: '#d97706',
                isRead: false,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                title: 'Holiday Notice: Campus closed',
                body: 'The college campus will remain closed on Friday for the upcoming public holiday. Classes resume Monday.',
                category: 'General',
                icon: 'campaign',
                iconBg: 'rgba(225, 29, 72, 0.15)',
                iconColor: '#e11d48',
                isRead: true,
                createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
            }
        ];

        const batch = writeBatch(db);
        notifications.forEach((notif) => {
            const docRef = doc(collection(db, "notifications"));
            batch.set(docRef, notif);
        });

        await batch.commit();
        console.log("Notification data seeding completed!");
        return true;
    } catch (e) {
        console.error("Notification seeding failed: ", e);
        return false;
    }
};

export const seedAllCurriculumData = async () => {
    try {
        console.log("Starting full curriculum data seeding...");

        const coreSubjects = [
            // --- CS (Computer Science) ---
            { id: 101, name: 'Intro to Programming', code: 'CS101', credits: '4', semester: 'Sem 1', icon: 'console' },
            { id: 102, name: 'Web Development Basics', code: 'CS102', credits: '3', semester: 'Sem 1', icon: 'web' },
            { id: 103, name: 'Object-Oriented Prog', code: 'CS201', credits: '4', semester: 'Sem 2', icon: 'code-braces' },
            { id: 104, name: 'Data Structures', code: 'CS202', credits: '4', semester: 'Sem 2', icon: 'graph' },
            { id: 105, name: 'Algorithms', code: 'CS301', credits: '4', semester: 'Sem 3', icon: 'chart-line-variant' },
            { id: 106, name: 'Database Systems', code: 'CS302', credits: '3', semester: 'Sem 3', icon: 'database' },
            { id: 107, name: 'Operating Systems', code: 'CS401', credits: '4', semester: 'Sem 4', icon: 'monitor-dashboard' },
            { id: 108, name: 'Computer Networks', code: 'CS402', credits: '4', semester: 'Sem 4', icon: 'network-router' },
            { id: 109, name: 'Software Engineering', code: 'CS501', credits: '3', semester: 'Sem 5', icon: 'code-tags' },
            { id: 110, name: 'Machine Learning', code: 'CS502', credits: '4', semester: 'Sem 5', icon: 'robot' },
            { id: 111, name: 'Cloud Computing', code: 'CS601', credits: '3', semester: 'Sem 6', icon: 'cloud' },
            { id: 112, name: 'Cybersecurity', code: 'CS602', credits: '3', semester: 'Sem 6', icon: 'shield-lock' },
            { id: 113, name: 'Mobile App Dev', code: 'CS701', credits: '4', semester: 'Sem 7', icon: 'cellphone' },
            { id: 114, name: 'Internet of Things', code: 'CS702', credits: '3', semester: 'Sem 7', icon: 'led-on' },
            { id: 115, name: 'Blockchain Basics', code: 'CS801', credits: '3', semester: 'Sem 8', icon: 'link-variant' },
            { id: 116, name: 'Major Project', code: 'CS802', credits: '6', semester: 'Sem 8', icon: 'presentation' },

            // --- EE (Electrical Engineering) ---
            { id: 201, name: 'Basic Electrical Engg', code: 'EE101', credits: '4', semester: 'Sem 1', icon: 'flash' },
            { id: 202, name: 'Circuit Theory', code: 'EE201', credits: '4', semester: 'Sem 2', icon: 'current-ac' },
            { id: 203, name: 'Analog Electronics', code: 'EE301', credits: '4', semester: 'Sem 3', icon: 'sine-wave' },
            { id: 204, name: 'Digital Logic', code: 'EE302', credits: '3', semester: 'Sem 3', icon: 'memory' },
            { id: 205, name: 'Signals & Systems', code: 'EE401', credits: '4', semester: 'Sem 4', icon: 'waveform' },
            { id: 206, name: 'Microprocessors', code: 'EE402', credits: '3', semester: 'Sem 4', icon: 'cpu-64-bit' },
            { id: 207, name: 'Control Systems', code: 'EE501', credits: '4', semester: 'Sem 5', icon: 'steering' },
            { id: 208, name: 'Power Electronics', code: 'EE502', credits: '4', semester: 'Sem 5', icon: 'lightning-bolt' },
            { id: 209, name: 'Electric Drives', code: 'EE601', credits: '3', semester: 'Sem 6', icon: 'engine' },
            { id: 210, name: 'Power Systems', code: 'EE602', credits: '4', semester: 'Sem 6', icon: 'transmission-tower' },
            { id: 211, name: 'Renewable Energy', code: 'EE701', credits: '3', semester: 'Sem 7', icon: 'solar-power' },
            { id: 212, name: 'High Voltage Engg', code: 'EE702', credits: '3', semester: 'Sem 7', icon: 'flash-alert' },
            { id: 213, name: 'Smart Grids', code: 'EE801', credits: '3', semester: 'Sem 8', icon: 'home-lightning-bolt' },
            { id: 214, name: 'Major Project', code: 'EE802', credits: '6', semester: 'Sem 8', icon: 'presentation' },

            // --- MECH (Mechanical) ---
            { id: 301, name: 'Engineering Graphics', code: 'ME101', credits: '3', semester: 'Sem 1', icon: 'draw' },
            { id: 302, name: 'Engg Mechanics', code: 'ME201', credits: '4', semester: 'Sem 2', icon: 'cogs' },
            { id: 303, name: 'Thermodynamics', code: 'ME301', credits: '4', semester: 'Sem 3', icon: 'thermometer' },
            { id: 304, name: 'Material Science', code: 'ME302', credits: '3', semester: 'Sem 3', icon: 'diamond-stone' },
            { id: 305, name: 'Fluid Mechanics', code: 'ME401', credits: '4', semester: 'Sem 4', icon: 'water' },
            { id: 306, name: 'Manufacturing Processes', code: 'ME402', credits: '4', semester: 'Sem 4', icon: 'factory' },
            { id: 307, name: 'Kinematics of Machinery', code: 'ME501', credits: '4', semester: 'Sem 5', icon: 'cog-transfer' },
            { id: 308, name: 'Heat Transfer', code: 'ME502', credits: '4', semester: 'Sem 5', icon: 'fire' },
            { id: 309, name: 'Machine Design', code: 'ME601', credits: '4', semester: 'Sem 6', icon: 'pencil-ruler' },
            { id: 310, name: 'IC Engines', code: 'ME602', credits: '3', semester: 'Sem 6', icon: 'car-shift-pattern' },
            { id: 311, name: 'Finite Element Analysis', code: 'ME701', credits: '3', semester: 'Sem 7', icon: 'chart-scatter-plot-hexbin' },
            { id: 312, name: 'Robotics', code: 'ME702', credits: '3', semester: 'Sem 7', icon: 'robot-industrial' },
            { id: 313, name: 'Refrigeration', code: 'ME801', credits: '3', semester: 'Sem 8', icon: 'snowflake' },
            { id: 314, name: 'Major Project', code: 'ME802', credits: '6', semester: 'Sem 8', icon: 'presentation' },

            // --- CIVIL ---
            { id: 401, name: 'Intro to Civil Engg', code: 'CE101', credits: '2', semester: 'Sem 1', icon: 'bridge' },
            { id: 402, name: 'Surveying', code: 'CE201', credits: '4', semester: 'Sem 2', icon: 'telescope' },
            { id: 403, name: 'Solid Mechanics', code: 'CE301', credits: '4', semester: 'Sem 3', icon: 'cube-outline' },
            { id: 404, name: 'Building Materials', code: 'CE302', credits: '3', semester: 'Sem 3', icon: 'wall' },
            { id: 405, name: 'Structural Analysis I', code: 'CE401', credits: '4', semester: 'Sem 4', icon: 'crane' },
            { id: 406, name: 'Fluid Mechanics', code: 'CE402', credits: '4', semester: 'Sem 4', icon: 'water-pump' },
            { id: 407, name: 'Soil Mechanics', code: 'CE501', credits: '4', semester: 'Sem 5', icon: 'image-filter-hdr' },
            { id: 408, name: 'Concrete Technology', code: 'CE502', credits: '3', semester: 'Sem 5', icon: 'mixer' },
            { id: 409, name: 'Structural Analysis II', code: 'CE601', credits: '4', semester: 'Sem 6', icon: 'office-building' },
            { id: 410, name: 'Transportation Engg', code: 'CE602', credits: '4', semester: 'Sem 6', icon: 'train-car' },
            { id: 411, name: 'Environmental Engg', code: 'CE701', credits: '3', semester: 'Sem 7', icon: 'leaf' },
            { id: 412, name: 'Construction Management', code: 'CE702', credits: '3', semester: 'Sem 7', icon: 'account-hard-hat' },
            { id: 413, name: 'Town Planning', code: 'CE801', credits: '3', semester: 'Sem 8', icon: 'city' },
            { id: 414, name: 'Major Project', code: 'CE802', credits: '6', semester: 'Sem 8', icon: 'presentation' },

            // --- BUSINESS ---
            { id: 501, name: 'Principles of Management', code: 'MGT101', credits: '3', semester: 'Sem 1', icon: 'briefcase' },
            { id: 502, name: 'Business Communication', code: 'MGT102', credits: '2', semester: 'Sem 1', icon: 'account-tie-voice' },
            { id: 503, name: 'Financial Accounting', code: 'ACC201', credits: '4', semester: 'Sem 2', icon: 'finance' },
            { id: 504, name: 'Microeconomics', code: 'ECO201', credits: '3', semester: 'Sem 2', icon: 'chart-bell-curve' },
            { id: 505, name: 'Marketing Management', code: 'MKT301', credits: '3', semester: 'Sem 3', icon: 'storefront' },
            { id: 506, name: 'Organizational Behavior', code: 'MGT301', credits: '3', semester: 'Sem 3', icon: 'account-group' },
            { id: 507, name: 'Macroeconomics', code: 'ECO401', credits: '3', semester: 'Sem 4', icon: 'chart-line' },
            { id: 508, name: 'Corporate Finance', code: 'FIN401', credits: '4', semester: 'Sem 4', icon: 'cash-multiple' },
            { id: 509, name: 'Human Resource Mgt', code: 'HRM501', credits: '3', semester: 'Sem 5', icon: 'account-search' },
            { id: 510, name: 'Operations Management', code: 'MGT501', credits: '3', semester: 'Sem 5', icon: 'cogs' },
            { id: 511, name: 'Business Ethics', code: 'MGT601', credits: '2', semester: 'Sem 6', icon: 'scale-balance' },
            { id: 512, name: 'Strategic Management', code: 'MGT602', credits: '4', semester: 'Sem 6', icon: 'chess-knight' },
            { id: 513, name: 'Entrepreneurship', code: 'ENT701', credits: '3', semester: 'Sem 7', icon: 'lightbulb-on' },
            { id: 514, name: 'Consumer Behavior', code: 'MKT701', credits: '3', semester: 'Sem 7', icon: 'shopping-search' },
            { id: 515, name: 'International Business', code: 'MGT801', credits: '3', semester: 'Sem 8', icon: 'earth' },
            { id: 516, name: 'Business Project', code: 'MGT802', credits: '6', semester: 'Sem 8', icon: 'presentation' },

            // --- COMMON (Mathematics, Physics, Chemistry, Basic English) ---
            { id: 901, name: 'Engineering Mathematics I', code: 'MATH101', credits: '4', semester: 'Sem 1', icon: 'function-variant' },
            { id: 902, name: 'Engineering Physics', code: 'PHY101', credits: '3', semester: 'Sem 1', icon: 'atom' },
            { id: 903, name: 'Engineering Chemistry', code: 'CHM101', credits: '3', semester: 'Sem 2', icon: 'flask' },
            { id: 904, name: 'Engineering Mathematics II', code: 'MATH201', credits: '4', semester: 'Sem 2', icon: 'sigma' },
            { id: 905, name: 'Environmental Studies', code: 'EVS201', credits: '2', semester: 'Sem 3', icon: 'tree' },
            { id: 906, name: 'Mathematics III', code: 'MATH301', credits: '4', semester: 'Sem 3', icon: 'pi' },
            { id: 907, name: 'Numerical Methods', code: 'MATH401', credits: '3', semester: 'Sem 4', icon: 'calculator' },
        ];

        const departments = {
            'Computer Science': [101, 102, 901, 902, 103, 104, 903, 904, 105, 106, 905, 906, 107, 108, 907, 109, 110, 111, 112, 113, 114, 115, 116],
            'Electrical Engineering': [201, 901, 902, 202, 903, 904, 203, 204, 906, 205, 206, 907, 207, 208, 209, 210, 211, 212, 213, 214],
            'Mechanical': [301, 901, 902, 302, 903, 904, 303, 304, 906, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314],
            'Civil': [401, 901, 902, 402, 903, 904, 403, 404, 906, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414],
            'Business': [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516]
        };

        const batch = writeBatch(db);

        // For each department, find their subjects, group by semester, and save
        for (const [deptName, subIds] of Object.entries(departments)) {
            const collectionName = `curriculum_${deptName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const bySemester = {};
            for (let i = 1; i <= 8; i++) bySemester[`Sem ${i}`] = [];

            const deptSubjects = coreSubjects.filter(sub => subIds.includes(sub.id));

            deptSubjects.forEach(s => {
                if (bySemester[s.semester]) {
                    bySemester[s.semester].push(s);
                }
            });

            Object.keys(bySemester).forEach(sem => {
                const docRef = doc(db, collectionName, sem);
                batch.set(docRef, { subjects: bySemester[sem] });
            });
        }

        await batch.commit();
        console.log("Curriculum seeding completed successfully!");
        return true;

    } catch (error) {
        console.error("Error seeding curriculum data:", error);
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

export const deleteUserProfile = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
        return true;
    } catch (e) {
        console.error("Error deleting profile", e);
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

// Real-time subscription for student attendance
export const subscribeToStudentAttendance = (studentId, callback) => {
    const q = query(
        collection(db, "attendance"),
        where("studentId", "==", studentId)
    );
    return onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(records);
    });
};

export const getStudentsForAttendance = async (courseCode) => {
    // For now, return all students since we don't have enrollment mapping
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snapshot = await getDocs(q);
    const students = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name || 'Unknown',
            roll: data.id || data.uid || doc.id.substring(0, 6).toUpperCase(),
            status: 'P', // Default
            avatar: data.profileImage || null
        };
    });
    return students;
};

export const saveAttendance = async (courseId, courseName, date, studentsList) => {
    try {
        const batch = writeBatch(db);

        for (const student of studentsList) {
            // Find specific student's aggregate record for this subject
            const q = query(
                collection(db, "attendance"),
                where("studentId", "==", student.id),
                where("subjectId", "==", courseId)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                // Update aggregate record
                const docRef = doc(db, "attendance", snap.docs[0].id);
                const data = snap.docs[0].data();
                batch.update(docRef, {
                    totalClasses: (data.totalClasses || 0) + 1,
                    attendedClasses: (data.attendedClasses || 0) + (student.status === 'P' ? 1 : 0),
                    status: student.status === 'P' ? 'Present' : (student.status === 'L' ? 'Late' : 'Absent'),
                    lastUpdated: new Date().toISOString()
                });
            } else {
                // Create new aggregate record
                const newRef = doc(collection(db, "attendance"));
                batch.set(newRef, {
                    studentId: student.id,
                    subjectId: courseId,
                    subjectName: courseName,
                    totalClasses: 1,
                    attendedClasses: student.status === 'P' ? 1 : 0,
                    status: student.status === 'P' ? 'Present' : (student.status === 'L' ? 'Late' : 'Absent'),
                    lastUpdated: new Date().toISOString()
                });
            }
        }

        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error saving attendance:", e);
        return false;
    }
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

// Real-time subscription for student marks (used by dashboard chart)
export const subscribeToStudentMarks = (studentId, callback) => {
    const q = query(
        collection(db, "marks"),
        where("studentId", "==", studentId)
    );
    return onSnapshot(q, (snapshot) => {
        const marks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(marks);
    });
};

// --- Events ---
export const subscribeToEvents = (callback) => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    return onSnapshot(q, (snapshot) => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(events);
    });
};

export const createEvent = async (eventData) => {
    try {
        const docRef = await addDoc(collection(db, "events"), eventData);
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error creating event:", e);
        return { success: false, error: e.message };
    }
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
                studentId: app.studentId, // The user's UID for matching
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

export const assignCourseToFaculty = async (courseData) => {
    try {
        const docRef = await addDoc(collection(db, "courses"), courseData);
        return { id: docRef.id, ...courseData };
    } catch (e) {
        console.error("Error assigning course to faculty:", e);
        throw e;
    }
};

export const removeCourseFromFaculty = async (courseId) => {
    try {
        await deleteDoc(doc(db, "courses", courseId));
        return true;
    } catch (e) {
        console.error("Error removing course from faculty:", e);
        throw e;
    }
};

// --- Curriculum / Subjects ---
export const getAllCurriculumSubjects = async (department = "Computer Science") => {
    try {
        // We use a separate collection or doc per department. 
        // Let's use `curriculum_${department}` as the collection name for simplicity and backward compatibility
        const collectionName = `curriculum_${department.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const snap = await getDocs(collection(db, collectionName));
        let allSubjects = [];
        snap.forEach(doc => {
            const subjects = doc.data().subjects || [];
            allSubjects.push(...subjects);
        });
        return allSubjects;
    } catch (e) {
        console.error("Error fetching curriculum:", e);
        return [];
    }
};

export const saveAllCurriculumSubjects = async (subjects, department = "Computer Science") => {
    try {
        const batch = writeBatch(db);
        const bySemester = {};
        for (let i = 1; i <= 8; i++) bySemester[`Sem ${i}`] = [];

        subjects.forEach(s => {
            if (bySemester[s.semester]) {
                bySemester[s.semester].push(s);
            }
        });

        const collectionName = `curriculum_${department.replace(/[^a-zA-Z0-9]/g, '_')}`;

        Object.keys(bySemester).forEach(sem => {
            const docRef = doc(db, collectionName, sem);
            batch.set(docRef, { subjects: bySemester[sem] });
        });

        await batch.commit();
        return true;
    } catch (e) {
        console.error("Error saving curriculum:", e);
        throw e;
    }
};

export const seedCSCurriculum = async () => {
    const subjects = [
        // Sem 1
        { name: 'Basics of Civil and Mechanical Engineering', code: 'EST120', credits: 4, semester: 'Sem 1' },
        { name: 'Civil and Mechanical Workshop', code: 'ESL120', credits: 1, semester: 'Sem 1' },
        { name: 'Engineering Chemistry', code: 'CYT100', credits: 4, semester: 'Sem 1' },
        { name: 'Engineering Chemistry Lab', code: 'CYL120', credits: 1, semester: 'Sem 1' },
        { name: 'Engineering Mechanics', code: 'EST100', credits: 3, semester: 'Sem 1' },
        { name: 'Life Skills', code: 'HUN101', credits: 0, semester: 'Sem 1' },
        { name: 'Linear Algebra and Calculus', code: 'MAT101', credits: 4, semester: 'Sem 1' },

        // Sem 2
        { name: 'Basics of Electrical and Electronics Engineering', code: 'EST130', credits: 4, semester: 'Sem 2' },
        { name: 'Electrical and Electronics Workshop', code: 'ESL130', credits: 1, semester: 'Sem 2' },
        { name: 'Engineering Graphics', code: 'EST110', credits: 3, semester: 'Sem 2' },
        { name: 'Engineering Physics A', code: 'PHT100', credits: 4, semester: 'Sem 2' },
        { name: 'Engineering Physics Lab', code: 'PHL120', credits: 1, semester: 'Sem 2' },
        { name: 'Professional Communication', code: 'HUN102', credits: 0, semester: 'Sem 2' },
        { name: 'Programming in C', code: 'EST102', credits: 4, semester: 'Sem 2' },
        { name: 'Vector Calculus, Differential Equations and Transforms', code: 'MAT102', credits: 4, semester: 'Sem 2' },

        // Sem 3
        { name: 'Data Structures', code: 'CST201', credits: 4, semester: 'Sem 3' },
        { name: 'Data Structures Lab', code: 'CSL201', credits: 2, semester: 'Sem 3' },
        { name: 'Discrete Mathematical Structures', code: 'MAT203', credits: 4, semester: 'Sem 3' },
        { name: 'Logic System Design', code: 'CST203', credits: 4, semester: 'Sem 3' },
        { name: 'Object Oriented Programming Lab (in Java)', code: 'CSL203', credits: 2, semester: 'Sem 3' },
        { name: 'Object Oriented Programming Using Java', code: 'CST205', credits: 4, semester: 'Sem 3' },
        { name: 'Professional Ethics', code: 'HUT200', credits: 2, semester: 'Sem 3' },
        { name: 'Sustainable Engineering', code: 'MCN201', credits: 0, semester: 'Sem 3' },

        // Sem 4
        { name: 'Computer Organisation and Architecture', code: 'CST202', credits: 4, semester: 'Sem 4' },
        { name: 'Constitution of India', code: 'MCN202', credits: 0, semester: 'Sem 4' },
        { name: 'Database Management Systems', code: 'CST204', credits: 4, semester: 'Sem 4' },
        { name: 'Design and Engineering', code: 'EST200', credits: 2, semester: 'Sem 4' },
        { name: 'Digital Lab', code: 'CSL202', credits: 2, semester: 'Sem 4' },
        { name: 'Graph Theory', code: 'MAT206', credits: 4, semester: 'Sem 4' },
        { name: 'Operating Systems', code: 'CST206', credits: 4, semester: 'Sem 4' },
        { name: 'Operating Systems Lab', code: 'CSL204', credits: 2, semester: 'Sem 4' },

        // Sem 5
        { name: 'Computer Networks', code: 'CST303', credits: 4, semester: 'Sem 5' },
        { name: 'Database Management Systems Lab', code: 'CSL333', credits: 2, semester: 'Sem 5' },
        { name: 'Disaster Management', code: 'MCN301', credits: 0, semester: 'Sem 5' },
        { name: 'Formal Languages and Automata Theory', code: 'CST301', credits: 4, semester: 'Sem 5' },
        { name: 'Management of Software Systems', code: 'CST309', credits: 3, semester: 'Sem 5' },
        { name: 'Microprocessors and Microcontrollers', code: 'CST307', credits: 4, semester: 'Sem 5' },
        { name: 'System Software', code: 'CST305', credits: 4, semester: 'Sem 5' },
        { name: 'System Software and Microprocessors Lab', code: 'CSL331', credits: 2, semester: 'Sem 5' },

        // Sem 6
        { name: 'Algorithm Analysis and Design', code: 'CST306', credits: 4, semester: 'Sem 6' },
        { name: 'Compiler Design', code: 'CST302', credits: 4, semester: 'Sem 6' },
        { name: 'Comprehensive Course Work', code: 'CST308', credits: 1, semester: 'Sem 6' },
        { name: 'Computer Graphics and Image Processing', code: 'CST304', credits: 4, semester: 'Sem 6' },
        { name: 'Foundations of Machine Learning (Elective)', code: 'CST312', credits: 3, semester: 'Sem 6' },
        { name: 'Industrial Economics and Foreign Trade', code: 'HUT300', credits: 3, semester: 'Sem 6' },
        { name: 'Miniproject', code: 'CSD334', credits: 2, semester: 'Sem 6' },
        { name: 'Networking Lab', code: 'CSL332', credits: 2, semester: 'Sem 6' },

        // Sem 7
        { name: 'Artificial Intelligence', code: 'CST401', credits: 3, semester: 'Sem 7' },
        { name: 'Compiler Lab', code: 'CSL411', credits: 2, semester: 'Sem 7' },
        { name: 'Industrial Safety Engineering', code: 'MCN401', credits: 0, semester: 'Sem 7' },
        { name: 'Machine Learning (Elective)', code: 'CST413', credits: 3, semester: 'Sem 7' },
        { name: 'Project Phase I', code: 'CSD415', credits: 2, semester: 'Sem 7' },
        { name: 'Renewable Energy Systems (Elective)', code: 'EET435', credits: 3, semester: 'Sem 7' },
        { name: 'Seminar', code: 'CSQ413', credits: 2, semester: 'Sem 7' },

        // Sem 8
        { name: 'Distributed Computing', code: 'CST402', credits: 3, semester: 'Sem 8' },
        { name: 'Deep Learning', code: 'CST414', credits: 3, semester: 'Sem 8' },
        { name: 'Client Server Architecture', code: 'CST426', credits: 3, semester: 'Sem 8' },
        { name: 'Internet of Things', code: 'CST448', credits: 3, semester: 'Sem 8' },
        { name: 'Comprehensive Course Viva', code: 'CST404', credits: 1, semester: 'Sem 8' },
        { name: 'Project Phase II', code: 'CSD416', credits: 4, semester: 'Sem 8' },
    ];

    try {
        await saveAllCurriculumSubjects(subjects, 'Computer Science');
        return { success: true, count: subjects.length };
    } catch (e) {
        console.error('Error seeding CS curriculum:', e);
        return { success: false, error: e.message };
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

// --- Feedback ---
export const subscribeToFeedbackSurveys = (callback) => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const surveys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(surveys);
    }, (error) => {
        console.error("Error subscribing to feedback surveys:", error);
        callback([]);
    });
};

export const submitFeedback = async (feedbackData) => {
    try {
        const docRef = await addDoc(collection(db, "feedback"), {
            ...feedbackData,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error submitting feedback:", e);
        return { success: false, error: e.message };
    }
};

// --- Event Registrations ---
export const saveEventRegistration = async (registrationData) => {
    try {
        const docRef = await addDoc(collection(db, "event_registrations"), {
            ...registrationData,
            registeredAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error saving event registration:", e);
        return { success: false, error: e.message };
    }
};

// --- Schedules ---
export const subscribeToSchedules = (day, callback) => {
    const q = query(
        collection(db, "schedules"),
        where("day", "==", day)
    );
    return onSnapshot(q, (snapshot) => {
        const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort client-side to avoid composite index requirement
        schedules.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
        callback(schedules);
    }, (error) => {
        console.error("Error subscribing to schedules:", error);
        callback([]);
    });
};

export const createScheduleSlot = async (slotData) => {
    try {
        const docRef = await addDoc(collection(db, "schedules"), {
            ...slotData,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error creating schedule slot:", e);
        return { success: false, error: e.message };
    }
};

export const deleteScheduleSlot = async (slotId) => {
    try {
        await deleteDoc(doc(db, "schedules", slotId));
        return true;
    } catch (e) {
        console.error("Error deleting schedule slot:", e);
        return false;
    }
};

// --- Notifications ---
export const subscribeToNotifications = (callback) => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
    }, (error) => {
        console.error("Error subscribing to notifications:", error);
        callback([]);
    });
};

export const createNotification = async (notificationData) => {
    try {
        const docRef = await addDoc(collection(db, "notifications"), {
            ...notificationData,
            createdAt: new Date().toISOString(),
            isRead: false
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error creating notification:", e);
        return { success: false, error: e.message };
    }
};

// --- HOD (Head of Department) ---
export const getDepartmentFaculty = async (department) => {
    try {
        const q = query(
            collection(db, "users"),
            where("role", "==", "faculty"),
            where("department", "==", department)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching department faculty:", e);
        return [];
    }
};

export const subscribeToDepartmentFaculty = (department, callback) => {
    const q = query(
        collection(db, "users"),
        where("role", "==", "faculty"),
        where("department", "==", department)
    );
    return onSnapshot(q, (snapshot) => {
        const faculty = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        callback(faculty);
    }, (error) => {
        console.error("Error subscribing to dept faculty:", error);
        callback([]);
    });
};

export const subscribeToAllFaculty = (callback) => {
    const q = query(
        collection(db, "users"),
        where("role", "==", "faculty")
    );
    return onSnapshot(q, (snapshot) => {
        const faculty = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        // Sort by name for better UX
        faculty.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        callback(faculty);
    }, (error) => {
        console.error("Error subscribing to all faculty:", error);
        callback([]);
    });
};

export const getDepartmentCourses = async (department) => {
    try {
        const q = query(
            collection(db, "courses"),
            where("department", "==", department)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching department courses:", e);
        return [];
    }
};

export const subscribeToDepartmentCourses = (department, callback) => {
    const q = query(
        collection(db, "courses"),
        where("department", "==", department)
    );
    return onSnapshot(q, (snapshot) => {
        const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(courses);
    }, (error) => {
        console.error("Error subscribing to dept courses:", error);
        callback([]);
    });
};

export const getDepartmentStats = async (department) => {
    try {
        // Count faculty in department
        const facultyQ = query(
            collection(db, "users"),
            where("role", "==", "faculty"),
            where("department", "==", department)
        );
        const facultySnap = await getDocs(facultyQ);

        // Count students in department
        const studentQ = query(
            collection(db, "users"),
            where("role", "==", "student"),
            where("department", "==", department)
        );
        const studentSnap = await getDocs(studentQ);

        // Count assigned courses in department
        const coursesQ = query(
            collection(db, "courses"),
            where("department", "==", department)
        );
        const coursesSnap = await getDocs(coursesQ);

        // Count curriculum subjects
        const collectionName = `curriculum_${department.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const currSnap = await getDocs(collection(db, collectionName));
        let totalSubjects = 0;
        currSnap.forEach(doc => {
            const subjects = doc.data().subjects || [];
            totalSubjects += subjects.length;
        });

        return {
            totalFaculty: facultySnap.size,
            totalStudents: studentSnap.size,
            assignedCourses: coursesSnap.size,
            totalSubjects
        };
    } catch (e) {
        console.error("Error fetching department stats:", e);
        return { totalFaculty: 0, totalStudents: 0, assignedCourses: 0, totalSubjects: 0 };
    }
};

// --- Faculty Marks Upload ---
export const getStudentsForMarksEntry = async (department) => {
    try {
        const q = query(
            collection(db, "users"),
            where("role", "==", "student"),
            where("department", "==", department || "Computer Science")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'Unnamed',
            roll: doc.data().rollNo || doc.data().email?.split('@')[0] || doc.id.substring(0, 6),
            marks: '',
            maxMarks: 50,
            avatar: doc.data().profileImage || null
        }));
    } catch (e) {
        console.error("Error fetching students for marks:", e);
        return [];
    }
};

export const saveMarksForCourse = async (marksData) => {
    try {
        const batch = writeBatch(db);
        const { courseId, courseName, assessmentType, facultyId, facultyName, students } = marksData;

        students.forEach(student => {
            if (student.marks !== '' && student.marks !== undefined) {
                const docRef = doc(collection(db, "marks"));
                batch.set(docRef, {
                    studentId: student.id,
                    studentName: student.name,
                    courseId,
                    courseName,
                    assessmentType,
                    score: parseInt(student.marks),
                    maxScore: student.maxMarks || 50,
                    facultyId,
                    facultyName,
                    uploadedAt: new Date().toISOString(),
                });
            }
        });

        await batch.commit();
        return { success: true };
    } catch (e) {
        console.error("Error saving marks:", e);
        return { success: false, error: e.message };
    }
};

// --- Faculty Notes Upload ---
export const saveNoteMaterial = async (noteData) => {
    try {
        const docRef = await addDoc(collection(db, "notes"), {
            ...noteData,
            uploadedAt: new Date().toISOString(),
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Error saving note material:", e);
        return { success: false, error: e.message };
    }
};

export const getNoteMaterials = async (department, semester) => {
    try {
        const q = query(
            collection(db, "notes"),
            where("department", "==", department),
            where("semester", "==", semester)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
        console.error("Error fetching note materials:", e);
        return [];
    }
};

// --- Role Security Codes ---
export const createRoleCode = async (role, code, department = null) => {
    try {
        const data = {
            role,
            code,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        if (department) data.department = department;
        await setDoc(doc(db, "role_codes", code), data);
        return { success: true };
    } catch (e) {
        console.error("Error creating role code:", e);
        return { success: false, error: e.message };
    }
};

export const deleteRoleCode = async (code) => {
    try {
        await deleteDoc(doc(db, "role_codes", code));
        return true;
    } catch (e) {
        console.error("Error deleting role code:", e);
        return false;
    }
};

export const subscribeToRoleCodes = (callback) => {
    return onSnapshot(collection(db, "role_codes"), (snapshot) => {
        const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(codes);
    });
};

export const validateRoleCode = async (role, code) => {
    try {
        const docSnap = await getDoc(doc(db, "role_codes", code));
        if (!docSnap.exists()) return { valid: false, message: "Invalid security code." };
        const data = docSnap.data();
        if (!data.isActive) return { valid: false, message: "This code has been deactivated." };
        if (data.role !== role) return { valid: false, message: "This code is not valid for the selected role." };
        return { valid: true, department: data.department || null };
    } catch (e) {
        console.error("Error validating role code:", e);
        return { valid: false, message: "Verification failed. Try again." };
    }
};

