import { supabase } from './supabaseClient';
import { USERS, ATTENDANCE, MARKS, PLACEMENTS, EVENTS, COURSES, ADMIN_STATS_MOCK, PLACED_STUDENTS } from './mockData';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

// ─── Helper: snake_case → camelCase key mapping ───
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const mapKeys = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [toCamel(k), v])
    );
};
const mapToSnake = (obj) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [toSnake(k), v])
    );
};
const mapRow = (row) => (row ? { ...mapKeys(row) } : null);
const mapRows = (rows) => (rows || []).map(mapRow);

// ─── Seeding ───
export const seedInitialData = async (targetUserId = null) => {
    try {
        console.log("Starting data seeding...");

        // Users — skipped since profiles are linked to auth.users;
        // You would need to register each user first via supabase.auth.signUp

        // Attendance
        for (const record of ATTENDANCE) {
            await supabase.from('attendance').insert(mapToSnake(record));
        }

        // Marks
        for (const mark of MARKS) {
            await supabase.from('marks').insert(mapToSnake(mark));
        }

        if (targetUserId && targetUserId !== 'student_demo') {
            for (const record of ATTENDANCE) {
                await supabase.from('attendance').insert(mapToSnake({ ...record, studentId: targetUserId }));
            }
            for (const mark of MARKS) {
                await supabase.from('marks').insert(mapToSnake({ ...mark, studentId: targetUserId }));
            }
        }

        // Placements
        for (const job of PLACEMENTS) {
            await supabase.from('placements').insert(mapToSnake(job));
        }

        // Placed Students
        for (const student of PLACED_STUDENTS) {
            await supabase.from('placed_students').insert(mapToSnake(student));
        }

        // Events
        for (const event of EVENTS) {
            await supabase.from('events').insert(mapToSnake(event));
        }

        console.log("Seeding completed successfully!");
        return true;
    } catch (e) {
        console.error("Seeding failed: ", e);
        return false;
    }
};

export const removeSeedData = async (targetUserId = null) => {
    try {
        console.log("Starting data removal...");
        await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('marks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('placements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('placed_students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log("Data removal completed!");
        return true;
    } catch (e) {
        console.error("Data removal failed: ", e);
        return false;
    }
};

export const seedFeedbackData = async () => {
    try {
        const feedbackSurveys = [
            { title: 'Course Evaluation: CS101', date: 'Created on Oct 24, 2023', responses: '45', questions: '12', status: 'Active', icon: 'school', color: 'blue', created_at: new Date().toISOString() },
            { title: 'Canteen Feedback Survey', date: 'Created on Oct 20, 2023', responses: '128', questions: '8', status: 'Active', icon: 'food-fork-drink', color: 'purple', created_at: new Date(Date.now() - 86400000).toISOString() },
            { title: 'Library Services Audit', date: 'Last edited 2 days ago', responses: '-', questions: '15', status: 'Draft', icon: 'bookshelf', color: 'orange', created_at: new Date(Date.now() - 172800000).toISOString() },
            { title: 'Annual Sports Day Feedback', date: 'Closed on Sep 15, 2023', responses: '342', questions: '5', status: 'Closed', icon: 'trophy', color: 'gray', created_at: new Date(Date.now() - 8640000000).toISOString() },
        ];
        await supabase.from('feedback').insert(feedbackSurveys);
        console.log("Feedback data seeding completed!");
        return true;
    } catch (e) {
        console.error("Feedback seeding failed: ", e);
        return false;
    }
};

export const seedNotificationData = async () => {
    try {
        const notifications = [
            { title: 'New Job Posting: Google Software Engineer Intern', body: 'Applications are now open for the summer internship program.', category: 'Placements', icon: 'work', icon_bg: 'rgba(0, 85, 255, 0.1)', icon_color: '#0055ff', is_read: false, created_at: new Date().toISOString() },
            { title: 'Results Published: Semester 5 Mid-terms', body: 'The mid-term examination results have been uploaded.', category: 'Academics', icon: 'school', icon_bg: 'rgba(16, 185, 129, 0.15)', icon_color: '#059669', is_read: false, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
            { title: 'Annual Tech Fest: Registration ends soon', body: "Last call for Hackathon entries!", category: 'Events', icon: 'event', icon_bg: 'rgba(245, 158, 11, 0.15)', icon_color: '#d97706', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
            { title: 'Holiday Notice: Campus closed', body: 'The college campus will remain closed on Friday.', category: 'General', icon: 'campaign', icon_bg: 'rgba(225, 29, 72, 0.15)', icon_color: '#e11d48', is_read: true, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        ];
        await supabase.from('notifications').insert(notifications);
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
            { id: 101, name: 'Intro to Programming', code: 'CS101', credits: 4, semester: 'Sem 1', icon: 'console' },
            { id: 102, name: 'Web Development Basics', code: 'CS102', credits: 3, semester: 'Sem 1', icon: 'web' },
            { id: 103, name: 'Object-Oriented Prog', code: 'CS201', credits: 4, semester: 'Sem 2', icon: 'code-braces' },
            { id: 104, name: 'Data Structures', code: 'CS202', credits: 4, semester: 'Sem 2', icon: 'graph' },
            { id: 105, name: 'Algorithms', code: 'CS301', credits: 4, semester: 'Sem 3', icon: 'chart-line-variant' },
            { id: 106, name: 'Database Systems', code: 'CS302', credits: 3, semester: 'Sem 3', icon: 'database' },
            { id: 107, name: 'Operating Systems', code: 'CS401', credits: 4, semester: 'Sem 4', icon: 'monitor-dashboard' },
            { id: 108, name: 'Computer Networks', code: 'CS402', credits: 4, semester: 'Sem 4', icon: 'network-router' },
            { id: 109, name: 'Software Engineering', code: 'CS501', credits: 3, semester: 'Sem 5', icon: 'code-tags' },
            { id: 110, name: 'Machine Learning', code: 'CS502', credits: 4, semester: 'Sem 5', icon: 'robot' },
            { id: 111, name: 'Cloud Computing', code: 'CS601', credits: 3, semester: 'Sem 6', icon: 'cloud' },
            { id: 112, name: 'Cybersecurity', code: 'CS602', credits: 3, semester: 'Sem 6', icon: 'shield-lock' },
            { id: 113, name: 'Mobile App Dev', code: 'CS701', credits: 4, semester: 'Sem 7', icon: 'cellphone' },
            { id: 114, name: 'Internet of Things', code: 'CS702', credits: 3, semester: 'Sem 7', icon: 'led-on' },
            { id: 115, name: 'Blockchain Basics', code: 'CS801', credits: 3, semester: 'Sem 8', icon: 'link-variant' },
            { id: 116, name: 'Major Project', code: 'CS802', credits: 6, semester: 'Sem 8', icon: 'presentation' },
            { id: 201, name: 'Basic Electrical Engg', code: 'EE101', credits: 4, semester: 'Sem 1', icon: 'flash' },
            { id: 202, name: 'Circuit Theory', code: 'EE201', credits: 4, semester: 'Sem 2', icon: 'current-ac' },
            { id: 203, name: 'Analog Electronics', code: 'EE301', credits: 4, semester: 'Sem 3', icon: 'sine-wave' },
            { id: 204, name: 'Digital Logic', code: 'EE302', credits: 3, semester: 'Sem 3', icon: 'memory' },
            { id: 205, name: 'Signals & Systems', code: 'EE401', credits: 4, semester: 'Sem 4', icon: 'waveform' },
            { id: 206, name: 'Microprocessors', code: 'EE402', credits: 3, semester: 'Sem 4', icon: 'cpu-64-bit' },
            { id: 207, name: 'Control Systems', code: 'EE501', credits: 4, semester: 'Sem 5', icon: 'steering' },
            { id: 208, name: 'Power Electronics', code: 'EE502', credits: 4, semester: 'Sem 5', icon: 'lightning-bolt' },
            { id: 209, name: 'Electric Drives', code: 'EE601', credits: 3, semester: 'Sem 6', icon: 'engine' },
            { id: 210, name: 'Power Systems', code: 'EE602', credits: 4, semester: 'Sem 6', icon: 'transmission-tower' },
            { id: 211, name: 'Renewable Energy', code: 'EE701', credits: 3, semester: 'Sem 7', icon: 'solar-power' },
            { id: 212, name: 'High Voltage Engg', code: 'EE702', credits: 3, semester: 'Sem 7', icon: 'flash-alert' },
            { id: 213, name: 'Smart Grids', code: 'EE801', credits: 3, semester: 'Sem 8', icon: 'home-lightning-bolt' },
            { id: 214, name: 'Major Project', code: 'EE802', credits: 6, semester: 'Sem 8', icon: 'presentation' },
            { id: 301, name: 'Engineering Graphics', code: 'ME101', credits: 3, semester: 'Sem 1', icon: 'draw' },
            { id: 302, name: 'Engg Mechanics', code: 'ME201', credits: 4, semester: 'Sem 2', icon: 'cogs' },
            { id: 303, name: 'Thermodynamics', code: 'ME301', credits: 4, semester: 'Sem 3', icon: 'thermometer' },
            { id: 304, name: 'Material Science', code: 'ME302', credits: 3, semester: 'Sem 3', icon: 'diamond-stone' },
            { id: 305, name: 'Fluid Mechanics', code: 'ME401', credits: 4, semester: 'Sem 4', icon: 'water' },
            { id: 306, name: 'Manufacturing Processes', code: 'ME402', credits: 4, semester: 'Sem 4', icon: 'factory' },
            { id: 307, name: 'Kinematics of Machinery', code: 'ME501', credits: 4, semester: 'Sem 5', icon: 'cog-transfer' },
            { id: 308, name: 'Heat Transfer', code: 'ME502', credits: 4, semester: 'Sem 5', icon: 'fire' },
            { id: 309, name: 'Machine Design', code: 'ME601', credits: 4, semester: 'Sem 6', icon: 'pencil-ruler' },
            { id: 310, name: 'IC Engines', code: 'ME602', credits: 3, semester: 'Sem 6', icon: 'car-shift-pattern' },
            { id: 311, name: 'Finite Element Analysis', code: 'ME701', credits: 3, semester: 'Sem 7', icon: 'chart-scatter-plot-hexbin' },
            { id: 312, name: 'Robotics', code: 'ME702', credits: 3, semester: 'Sem 7', icon: 'robot-industrial' },
            { id: 313, name: 'Refrigeration', code: 'ME801', credits: 3, semester: 'Sem 8', icon: 'snowflake' },
            { id: 314, name: 'Major Project', code: 'ME802', credits: 6, semester: 'Sem 8', icon: 'presentation' },
            { id: 401, name: 'Intro to Civil Engg', code: 'CE101', credits: 2, semester: 'Sem 1', icon: 'bridge' },
            { id: 402, name: 'Surveying', code: 'CE201', credits: 4, semester: 'Sem 2', icon: 'telescope' },
            { id: 403, name: 'Solid Mechanics', code: 'CE301', credits: 4, semester: 'Sem 3', icon: 'cube-outline' },
            { id: 404, name: 'Building Materials', code: 'CE302', credits: 3, semester: 'Sem 3', icon: 'wall' },
            { id: 405, name: 'Structural Analysis I', code: 'CE401', credits: 4, semester: 'Sem 4', icon: 'crane' },
            { id: 406, name: 'Fluid Mechanics', code: 'CE402', credits: 4, semester: 'Sem 4', icon: 'water-pump' },
            { id: 407, name: 'Soil Mechanics', code: 'CE501', credits: 4, semester: 'Sem 5', icon: 'image-filter-hdr' },
            { id: 408, name: 'Concrete Technology', code: 'CE502', credits: 3, semester: 'Sem 5', icon: 'mixer' },
            { id: 409, name: 'Structural Analysis II', code: 'CE601', credits: 4, semester: 'Sem 6', icon: 'office-building' },
            { id: 410, name: 'Transportation Engg', code: 'CE602', credits: 4, semester: 'Sem 6', icon: 'train-car' },
            { id: 411, name: 'Environmental Engg', code: 'CE701', credits: 3, semester: 'Sem 7', icon: 'leaf' },
            { id: 412, name: 'Construction Management', code: 'CE702', credits: 3, semester: 'Sem 7', icon: 'account-hard-hat' },
            { id: 413, name: 'Town Planning', code: 'CE801', credits: 3, semester: 'Sem 8', icon: 'city' },
            { id: 414, name: 'Major Project', code: 'CE802', credits: 6, semester: 'Sem 8', icon: 'presentation' },
            { id: 501, name: 'Principles of Management', code: 'MGT101', credits: 3, semester: 'Sem 1', icon: 'briefcase' },
            { id: 502, name: 'Business Communication', code: 'MGT102', credits: 2, semester: 'Sem 1', icon: 'account-tie-voice' },
            { id: 503, name: 'Financial Accounting', code: 'ACC201', credits: 4, semester: 'Sem 2', icon: 'finance' },
            { id: 504, name: 'Microeconomics', code: 'ECO201', credits: 3, semester: 'Sem 2', icon: 'chart-bell-curve' },
            { id: 505, name: 'Marketing Management', code: 'MKT301', credits: 3, semester: 'Sem 3', icon: 'storefront' },
            { id: 506, name: 'Organizational Behavior', code: 'MGT301', credits: 3, semester: 'Sem 3', icon: 'account-group' },
            { id: 507, name: 'Macroeconomics', code: 'ECO401', credits: 3, semester: 'Sem 4', icon: 'chart-line' },
            { id: 508, name: 'Corporate Finance', code: 'FIN401', credits: 4, semester: 'Sem 4', icon: 'cash-multiple' },
            { id: 509, name: 'Human Resource Mgt', code: 'HRM501', credits: 3, semester: 'Sem 5', icon: 'account-search' },
            { id: 510, name: 'Operations Management', code: 'MGT501', credits: 3, semester: 'Sem 5', icon: 'cogs' },
            { id: 511, name: 'Business Ethics', code: 'MGT601', credits: 2, semester: 'Sem 6', icon: 'scale-balance' },
            { id: 512, name: 'Strategic Management', code: 'MGT602', credits: 4, semester: 'Sem 6', icon: 'chess-knight' },
            { id: 513, name: 'Entrepreneurship', code: 'ENT701', credits: 3, semester: 'Sem 7', icon: 'lightbulb-on' },
            { id: 514, name: 'Consumer Behavior', code: 'MKT701', credits: 3, semester: 'Sem 7', icon: 'shopping-search' },
            { id: 515, name: 'International Business', code: 'MGT801', credits: 3, semester: 'Sem 8', icon: 'earth' },
            { id: 516, name: 'Business Project', code: 'MGT802', credits: 6, semester: 'Sem 8', icon: 'presentation' },
            { id: 901, name: 'Engineering Mathematics I', code: 'MATH101', credits: 4, semester: 'Sem 1', icon: 'function-variant' },
            { id: 902, name: 'Engineering Physics', code: 'PHY101', credits: 3, semester: 'Sem 1', icon: 'atom' },
            { id: 903, name: 'Engineering Chemistry', code: 'CHM101', credits: 3, semester: 'Sem 2', icon: 'flask' },
            { id: 904, name: 'Engineering Mathematics II', code: 'MATH201', credits: 4, semester: 'Sem 2', icon: 'sigma' },
            { id: 905, name: 'Environmental Studies', code: 'EVS201', credits: 2, semester: 'Sem 3', icon: 'tree' },
            { id: 906, name: 'Mathematics III', code: 'MATH301', credits: 4, semester: 'Sem 3', icon: 'pi' },
            { id: 907, name: 'Numerical Methods', code: 'MATH401', credits: 3, semester: 'Sem 4', icon: 'calculator' },
        ];

        const departments = {
            'Computer Science': [101,102,901,902,103,104,903,904,105,106,905,906,107,108,907,109,110,111,112,113,114,115,116],
            'Electrical Engineering': [201,901,902,202,903,904,203,204,906,205,206,907,207,208,209,210,211,212,213,214],
            'Mechanical': [301,901,902,302,903,904,303,304,906,305,306,307,308,309,310,311,312,313,314],
            'Civil': [401,901,902,402,903,904,403,404,906,405,406,407,408,409,410,411,412,413,414],
            'Business': [501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516],
        };

        const allRows = [];
        const deptKeys = Object.keys(departments);
        for (let i = 0; i < deptKeys.length; i++) {
            const deptName = deptKeys[i];
            const subIds = departments[deptName];
            const deptSubjects = coreSubjects.filter(sub => subIds.includes(sub.id));
            deptSubjects.forEach(s => {
                allRows.push({ ...s, id: ((i + 1) * 1000) + s.id, department: deptName });
            });
        }

        // Use upsert to handle potential ID conflicts
        const { error } = await supabase.from('subjects').upsert(allRows, { onConflict: 'id' });
        if (error) throw error;

        console.log("Curriculum seeding completed successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding curriculum data:", error);
        return false;
    }
};

export const seedCSCurriculumData = async () => {
    try {
        console.log("Starting CS curriculum data seeding...");
        const csSubjects = [
            // Sem 1
            { id: 1001, name: 'Basics of Civil and Mechanical Engineering', code: 'EST120', credits: 4.0, semester: 'Sem 1', icon: 'bridge' },
            { id: 1002, name: 'Civil and Mechanical Workshop', code: 'ESL120', credits: 1.0, semester: 'Sem 1', icon: 'hammer-wrench' },
            { id: 1003, name: 'Engineering Chemistry', code: 'CYT100', credits: 4.0, semester: 'Sem 1', icon: 'flask' },
            { id: 1004, name: 'Engineering Chemistry Lab', code: 'CYL120', credits: 1.0, semester: 'Sem 1', icon: 'flask-outline' },
            { id: 1005, name: 'Engineering Mechanics', code: 'EST100', credits: 3.0, semester: 'Sem 1', icon: 'cogs' },
            { id: 1006, name: 'Life Skills', code: 'HUN101', credits: 0.0, semester: 'Sem 1', icon: 'account-heart' },
            { id: 1007, name: 'Linear Algebra and Calculus', code: 'MAT101', credits: 4.0, semester: 'Sem 1', icon: 'sigma' },

            // Sem 2
            { id: 1008, name: 'Basics of Electrical and Electronics', code: 'EST130', credits: 4.0, semester: 'Sem 2', icon: 'flash' },
            { id: 1009, name: 'Electrical and Electronics Workshop', code: 'ESL130', credits: 1.0, semester: 'Sem 2', icon: 'lightning-bolt' },
            { id: 1010, name: 'Engineering Graphics', code: 'EST110', credits: 3.0, semester: 'Sem 2', icon: 'draw' },
            { id: 1011, name: 'Engineering Physics A', code: 'PHT100', credits: 4.0, semester: 'Sem 2', icon: 'atom' },
            { id: 1012, name: 'Engineering Physics Lab', code: 'PHL120', credits: 1.0, semester: 'Sem 2', icon: 'atom-variant' },
            { id: 1013, name: 'Professional Communication', code: 'HUN102', credits: 0.0, semester: 'Sem 2', icon: 'account-tie-voice' },
            { id: 1014, name: 'Programming in C', code: 'EST102', credits: 4.0, semester: 'Sem 2', icon: 'language-c' },
            { id: 1015, name: 'Vector Calculus, DE and Transforms', code: 'MAT102', credits: 4.0, semester: 'Sem 2', icon: 'math-integral' },

            // Sem 3
            { id: 1016, name: 'Data Structures', code: 'CST201', credits: 4.0, semester: 'Sem 3', icon: 'graph' },
            { id: 1017, name: 'Data Structures Lab', code: 'CSL201', credits: 2.0, semester: 'Sem 3', icon: 'folder-network' },
            { id: 1018, name: 'Discrete Mathematical Structures', code: 'MAT203', credits: 4.0, semester: 'Sem 3', icon: 'function-variant' },
            { id: 1019, name: 'Logic System Design', code: 'CST203', credits: 4.0, semester: 'Sem 3', icon: 'memory' },
            { id: 1020, name: 'OOP Lab (in Java)', code: 'CSL203', credits: 2.0, semester: 'Sem 3', icon: 'language-java' },
            { id: 1021, name: 'OOP Using Java', code: 'CST205', credits: 4.0, semester: 'Sem 3', icon: 'coffee' },
            { id: 1022, name: 'Professional Ethics', code: 'HUT200', credits: 2.0, semester: 'Sem 3', icon: 'scale-balance' },
            { id: 1023, name: 'Sustainable Engineering', code: 'MCN201', credits: 0.0, semester: 'Sem 3', icon: 'leaf' },

            // Sem 4
            { id: 1024, name: 'Computer Organisation and Architecture', code: 'CST202', credits: 4.0, semester: 'Sem 4', icon: 'cpu-64-bit' },
            { id: 1025, name: 'Constitution of India', code: 'MCN202', credits: 0.0, semester: 'Sem 4', icon: 'book-open-variant' },
            { id: 1026, name: 'Database Management Systems', code: 'CST204', credits: 4.0, semester: 'Sem 4', icon: 'database' },
            { id: 1027, name: 'Design and Engineering', code: 'EST200', credits: 2.0, semester: 'Sem 4', icon: 'pencil-ruler' },
            { id: 1028, name: 'Digital Lab', code: 'CSL202', credits: 2.0, semester: 'Sem 4', icon: 'desktop-tower' },
            { id: 1029, name: 'Graph Theory', code: 'MAT206', credits: 4.0, semester: 'Sem 4', icon: 'chart-line-variant' },
            { id: 1030, name: 'Operating Systems', code: 'CST206', credits: 4.0, semester: 'Sem 4', icon: 'monitor-dashboard' },
            { id: 1031, name: 'Operating Systems Lab', code: 'CSL204', credits: 2.0, semester: 'Sem 4', icon: 'console' },

            // Sem 5
            { id: 1032, name: 'Computer Networks', code: 'CST303', credits: 4.0, semester: 'Sem 5', icon: 'network-router' },
            { id: 1033, name: 'DBMS Lab', code: 'CSL333', credits: 2.0, semester: 'Sem 5', icon: 'database-search' },
            { id: 1034, name: 'Disaster Management', code: 'MCN301', credits: 0.0, semester: 'Sem 5', icon: 'alert' },
            { id: 1035, name: 'Formal Languages and Automata Theory', code: 'CST301', credits: 4.0, semester: 'Sem 5', icon: 'code-tags' },
            { id: 1036, name: 'Management of Software Systems', code: 'CST309', credits: 3.0, semester: 'Sem 5', icon: 'view-dashboard-variant' },
            { id: 1037, name: 'Microprocessors and Microcontrollers', code: 'CST307', credits: 4.0, semester: 'Sem 5', icon: 'chip' },
            { id: 1038, name: 'System Software', code: 'CST305', credits: 4.0, semester: 'Sem 5', icon: 'application-cog' },
            { id: 1039, name: 'System Software and Microprocessors Lab', code: 'CSL331', credits: 2.0, semester: 'Sem 5', icon: 'monitor-edit' },

            // Sem 6
            { id: 1040, name: 'Algorithm Analysis and Design', code: 'CST306', credits: 4.0, semester: 'Sem 6', icon: 'sort-variant' },
            { id: 1041, name: 'Compiler Design', code: 'CST302', credits: 4.0, semester: 'Sem 6', icon: 'code-json' },
            { id: 1042, name: 'Comprehensive Course Work', code: 'CST308', credits: 1.0, semester: 'Sem 6', icon: 'school' },
            { id: 1043, name: 'Computer Graphics and Image Processing', code: 'CST304', credits: 4.0, semester: 'Sem 6', icon: 'image-size-select-actual' },
            { id: 1044, name: 'Foundations of Machine Learning (Elective)', code: 'CST312', credits: 3.0, semester: 'Sem 6', icon: 'robot' },
            { id: 1045, name: 'Industrial Economics and Foreign Trade', code: 'HUT300', credits: 3.0, semester: 'Sem 6', icon: 'chart-bar' },
            { id: 1046, name: 'Miniproject', code: 'CSD334', credits: 2.0, semester: 'Sem 6', icon: 'presentation' },
            { id: 1047, name: 'Networking Lab', code: 'CSL332', credits: 2.0, semester: 'Sem 6', icon: 'server-network' },

            // Sem 7
            { id: 1048, name: 'Artificial Intelligence', code: 'CST401', credits: 3.0, semester: 'Sem 7', icon: 'brain' },
            { id: 1049, name: 'Compiler Lab', code: 'CSL411', credits: 2.0, semester: 'Sem 7', icon: 'console-network' },
            { id: 1050, name: 'Industrial Safety Engineering', code: 'MCN401', credits: 0.0, semester: 'Sem 7', icon: 'hard-hat' },
            { id: 1051, name: 'Machine Learning (Elective)', code: 'CST413', credits: 3.0, semester: 'Sem 7', icon: 'robot-outline' },
            { id: 1052, name: 'Project Phase I', code: 'CSD415', credits: 2.0, semester: 'Sem 7', icon: 'presentation-play' },
            { id: 1053, name: 'Renewable Energy Systems (Elective)', code: 'EET435', credits: 3.0, semester: 'Sem 7', icon: 'solar-power' },
            { id: 1054, name: 'Seminar', code: 'CSQ413', credits: 2.0, semester: 'Sem 7', icon: 'human-male-board' },

            // Sem 8
            { id: 1055, name: 'Distributed Computing', code: 'CST402', credits: 3.0, semester: 'Sem 8', icon: 'laptop' },
            { id: 1056, name: 'Deep Learning', code: 'CST414', credits: 3.0, semester: 'Sem 8', icon: 'head-lightbulb' },
            { id: 1057, name: 'Client Server Architecture', code: 'CST426', credits: 3.0, semester: 'Sem 8', icon: 'server' },
            { id: 1058, name: 'Internet Of Things', code: 'CST448', credits: 3.0, semester: 'Sem 8', icon: 'led-on' },
            { id: 1059, name: 'Comprehensive Course Viva', code: 'CST404', credits: 1.0, semester: 'Sem 8', icon: 'microphone' },
            { id: 1060, name: 'Project Phase II', code: 'CSD416', credits: 4.0, semester: 'Sem 8', icon: 'flag-checkered' }
        ];

        const allRows = csSubjects.map(sub => ({
            ...sub,
            department: 'Computer Science and Engineering'
        }));

        // Insert into Supabase
        const { error } = await supabase.from('subjects').upsert(allRows, { onConflict: 'id' });
        if (error) throw error;

        console.log("CS Curriculum seeding completed successfully!");
        return true;
    } catch (error) {
        console.error("Error seeding CS curriculum data:", error);
        return false;
    }
};

// ─── Users / Profiles ───
export const getUserProfile = async (uid) => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
        if (error || !data) return null;
        return mapRow(data);
    } catch (e) {
        console.error("Error fetching profile", e);
        return null;
    }
};

export const updateUserProfile = async (userId, data) => {
    try {
        const removeUndefined = (obj) => {
            return Object.entries(obj).reduce((acc, [k, v]) => {
                if (v === undefined) return acc;
                if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date)) {
                    const cleaned = removeUndefined(v);
                    if (Object.keys(cleaned).length > 0) acc[k] = cleaned;
                } else {
                    acc[k] = v;
                }
                return acc;
            }, {});
        };
        const cleanData = removeUndefined(data);
        const snakeData = mapToSnake(cleanData);
        const { error } = await supabase.from('profiles').update(snakeData).eq('id', userId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error updating profile", e);
        return false;
    }
};

export const deleteUserProfile = async (userId) => {
    try {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error deleting profile", e);
        return false;
    }
};

export const subscribeToUsersByRole = (role, callback) => {
    // Initial fetch
    supabase.from('profiles').select('*').eq('role', role).then(({ data }) => {
        callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
    });
    // Real-time subscription
    const channelId = `users_role_${role}_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `role=eq.${role}` }, async () => {
            const { data } = await supabase.from('profiles').select('*').eq('role', role);
            callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

// ─── Dashboard Stats ───
export const getStudentDashboardStats = async (studentId) => {
    const profile = await getUserProfile(studentId);
    const attendanceRecords = await getStudentAttendance(studentId);
    let total = 0, attended = 0;
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
    supabase.from('profiles').select('*').then(({ data }) => {
        const users = data || [];
        callback({
            totalStudents: users.filter(u => u.role === 'student').length,
            totalFaculty: users.filter(u => u.role === 'faculty').length,
            recentActivity: ADMIN_STATS_MOCK.recentActivity
        });
    });
    const channelId = `admin_stats_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*');
            const users = data || [];
            callback({
                totalStudents: users.filter(u => u.role === 'student').length,
                totalFaculty: users.filter(u => u.role === 'faculty').length,
                recentActivity: ADMIN_STATS_MOCK.recentActivity
            });
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const getAdminStats = async () => {
    try {
        const { data } = await supabase.from('profiles').select('*');
        const users = data || [];
        return {
            totalStudents: users.filter(u => u.role === 'student').length,
            totalFaculty: users.filter(u => u.role === 'faculty').length,
            recentActivity: ADMIN_STATS_MOCK.recentActivity
        };
    } catch (e) {
        return ADMIN_STATS_MOCK;
    }
};

// ─── Attendance ───
export const getStudentAttendance = async (studentId) => {
    const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId);
    return mapRows(data);
};

export const subscribeToStudentAttendance = (studentId, callback) => {
    supabase.from('attendance').select('*').eq('student_id', studentId).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `attendance_${studentId}_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${studentId}` }, async () => {
            const { data } = await supabase.from('attendance').select('*').eq('student_id', studentId);
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const getStudentsForAttendance = async (courseCode) => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student');
    return (data || []).map(d => ({
        id: d.id,
        name: d.name || 'Unknown',
        roll: d.roll_no || d.email?.split('@')[0] || d.id.substring(0, 6).toUpperCase(),
        status: 'P',
        avatar: d.profile_image || null
    }));
};

export const saveAttendance = async (courseId, courseName, date, studentsList, markedBy = null) => {
    try {
        const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD

        for (const student of studentsList) {
            // 1. Upsert per-date record in attendance_records
            await supabase.from('attendance_records').upsert({
                student_id: student.id,
                subject_id: courseId,
                subject_name: courseName,
                date: dateStr,
                status: student.status,
                marked_by: markedBy,
                updated_at: new Date().toISOString()
            }, { onConflict: 'student_id,subject_id,date' });

            // 2. Update aggregate attendance table
            const { data: existing } = await supabase.from('attendance')
                .select('*')
                .eq('student_id', student.id)
                .eq('subject_id', courseId);

            if (existing && existing.length > 0) {
                const rec = existing[0];
                await supabase.from('attendance').update({
                    total_classes: (rec.total_classes || 0) + 1,
                    attended_classes: (rec.attended_classes || 0) + (student.status === 'P' ? 1 : 0),
                    status: student.status === 'P' ? 'Present' : (student.status === 'L' ? 'Late' : 'Absent'),
                    last_updated: new Date().toISOString()
                }).eq('id', rec.id);
            } else {
                await supabase.from('attendance').insert({
                    student_id: student.id,
                    subject_id: courseId,
                    subject_name: courseName,
                    total_classes: 1,
                    attended_classes: student.status === 'P' ? 1 : 0,
                    status: student.status === 'P' ? 'Present' : (student.status === 'L' ? 'Late' : 'Absent'),
                    last_updated: new Date().toISOString()
                });
            }
        }
        return true;
    } catch (e) {
        console.error("Error saving attendance:", e);
        return false;
    }
};

/**
 * Get attendance records for a specific date and subject
 */
export const getAttendanceForDate = async (courseId, date) => {
    try {
        const dateStr = new Date(date).toISOString().split('T')[0];
        const { data, error } = await supabase.from('attendance_records')
            .select('*')
            .eq('subject_id', courseId)
            .eq('date', dateStr);
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching attendance for date:", e);
        return [];
    }
};

/**
 * Update a previously saved attendance record and adjust aggregate counts
 */
export const updateAttendanceRecord = async (courseId, courseName, date, studentsList) => {
    try {
        const dateStr = new Date(date).toISOString().split('T')[0];

        // Get existing records for this date to compute delta
        const { data: oldRecords } = await supabase.from('attendance_records')
            .select('*')
            .eq('subject_id', courseId)
            .eq('date', dateStr);

        const oldMap = {};
        (oldRecords || []).forEach(r => { oldMap[r.student_id] = r.status; });

        for (const student of studentsList) {
            const oldStatus = oldMap[student.id];
            const newStatus = student.status;

            // Update per-date record
            await supabase.from('attendance_records').upsert({
                student_id: student.id,
                subject_id: courseId,
                subject_name: courseName,
                date: dateStr,
                status: newStatus,
                updated_at: new Date().toISOString()
            }, { onConflict: 'student_id,subject_id,date' });

            // Update aggregate only if status changed
            if (oldStatus && oldStatus !== newStatus) {
                const { data: aggData } = await supabase.from('attendance')
                    .select('*')
                    .eq('student_id', student.id)
                    .eq('subject_id', courseId);

                if (aggData && aggData.length > 0) {
                    const rec = aggData[0];
                    const oldWasPresent = oldStatus === 'P' ? 1 : 0;
                    const newIsPresent = newStatus === 'P' ? 1 : 0;
                    const delta = newIsPresent - oldWasPresent;

                    await supabase.from('attendance').update({
                        attended_classes: Math.max(0, (rec.attended_classes || 0) + delta),
                        status: newStatus === 'P' ? 'Present' : (newStatus === 'L' ? 'Late' : 'Absent'),
                        last_updated: new Date().toISOString()
                    }).eq('id', rec.id);
                }
            }
        }
        return true;
    } catch (e) {
        console.error("Error updating attendance record:", e);
        return false;
    }
};

// ─── Marks ───
export const getStudentMarks = async (studentId) => {
    const { data } = await supabase.from('marks').select('*').eq('student_id', studentId);
    return mapRows(data);
};

export const subscribeToStudentMarks = (studentId, callback) => {
    supabase.from('marks').select('*').eq('student_id', studentId).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `marks_${studentId}_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'marks', filter: `student_id=eq.${studentId}` }, async () => {
            const { data } = await supabase.from('marks').select('*').eq('student_id', studentId);
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

// ─── Events ───
export const subscribeToEvents = (callback) => {
    supabase.from('events').select('*').order('date', { ascending: true }).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `events_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
            const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const createEvent = async (eventData) => {
    try {
        const { data, error } = await supabase.from('events').insert(mapToSnake(eventData)).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error creating event:", e);
        return { success: false, error: e.message };
    }
};

export const getUpcomingEvents = async (limitCount = 5) => {
    try {
        const { data } = await supabase.from('events').select('*').order('date', { ascending: true }).limit(limitCount);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching events:", e);
        return [];
    }
};

// ─── Placements ───
export const applyForDrive = async (driveId, studentId, applicationData) => {
    try {
        const { data, error } = await supabase.from('applications').insert({
            drive_id: driveId,
            student_id: studentId,
            ...mapToSnake(applicationData),
            status: 'Applied',
            status_color: 'gray',
            applied_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error applying for drive:", e);
        return { success: false, error: e.message };
    }
};

export const getStudentApplications = async (studentId) => {
    try {
        const { data } = await supabase.from('applications').select('*').eq('student_id', studentId);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching student applications:", e);
        return [];
    }
};

export const getActiveDrives = async () => {
    const { data } = await supabase.from('placements').select('*').order('date', { ascending: false });
    return mapRows(data);
};

export const getDriveById = async (driveId) => {
    try {
        const { data, error } = await supabase.from('placements').select('*').eq('id', driveId).single();
        if (error || !data) return null;
        return mapRow(data);
    } catch (e) {
        console.error("Error fetching drive by ID:", e);
        return null;
    }
};

export const subscribeToActiveDrives = (callback) => {
    supabase.from('placements').select('*').order('date', { ascending: false }).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `placements_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'placements' }, async () => {
            const { data } = await supabase.from('placements').select('*').order('date', { ascending: false });
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const createPlacementDrive = async (driveData) => {
    try {
        const { data, error } = await supabase.from('placements').insert({
            ...mapToSnake(driveData),
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return mapRow(data);
    } catch (e) {
        console.error("Error creating placement drive:", e);
        throw e;
    }
};

export const getRecentJobs = async (limitCount = 5) => {
    try {
        const { data } = await supabase.from('placements').select('*').limit(limitCount);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching jobs:", e);
        return [];
    }
};

export const getPlacedStudents = async () => {
    try {
        const { data } = await supabase.from('placed_students').select('*');
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching placed students:", e);
        return [];
    }
};

export const subscribeToPlacedStudents = (callback) => {
    supabase.from('placed_students').select('*').then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `placed_students_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'placed_students' }, async () => {
            const { data } = await supabase.from('placed_students').select('*');
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const subscribeToDriveStudents = (driveId, callback) => {
    const fetchStudents = async () => {
        const { data: applications } = await supabase.from('applications').select('*').eq('drive_id', driveId);
        const studentsData = await Promise.all((applications || []).map(async (app) => {
            const profile = await getUserProfile(app.student_id);
            return {
                id: app.id,
                studentId: app.student_id,
                studentRollNo: profile?.rollNo || app.student_id.substring(0, 8).toUpperCase(),
                name: profile?.name || 'Unknown Student',
                dept: profile?.department || 'N/A',
                status: app.status || 'Applied',
                statusColor: app.status_color || 'gray',
            };
        }));
        callback(studentsData);
    };
    fetchStudents();
    const channelId = `drive_students_${driveId}_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `drive_id=eq.${driveId}` }, fetchStudents)
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const updateApplicationStatuses = async (updates) => {
    try {
        for (const update of updates) {
            await supabase.from('applications').update({
                status: update.status,
                status_color: update.statusColor
            }).eq('id', update.id);
        }
        return true;
    } catch (e) {
        console.error("Error updating application statuses:", e);
        return false;
    }
};

// ─── Courses / Faculty Schedule ───
export const getFacultyCourses = async (facultyId) => {
    try {
        const { data } = await supabase.from('courses').select('*').eq('faculty_id', facultyId);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching faculty courses:", e);
        return [];
    }
};

export const assignCourseToFaculty = async (courseData) => {
    try {
        const insertData = {
            faculty_id: courseData.facultyId || courseData.faculty_id,
            faculty_name: courseData.facultyName || courseData.faculty_name,
            subject_code: courseData.subjectCode || courseData.subject_code || courseData.code,
            subject_name: courseData.subjectName || courseData.subject_name || courseData.name,
            department: courseData.department
        };
        const { data, error } = await supabase.from('courses').insert(insertData).select().single();
        if (error) throw error;
        return mapRow(data);
    } catch (e) {
        console.error("Error assigning course to faculty:", e);
        throw e;
    }
};

export const removeCourseFromFaculty = async (courseId) => {
    try {
        const { error } = await supabase.from('courses').delete().eq('id', courseId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error removing course from faculty:", e);
        throw e;
    }
};

// ─── Curriculum / Subjects ───
export const getAllCurriculumSubjects = async (department = "Computer Science") => {
    try {
        const { data } = await supabase.from('subjects').select('*').ilike('department', `%${department}%`);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching curriculum:", e);
        return [];
    }
};

export const saveAllCurriculumSubjects = async (subjects, department = "Computer Science") => {
    try {
        // Delete existing subjects for this department using fuzzy match
        await supabase.from('subjects').delete().ilike('department', `%${department}%`);
        
        // Insert all subjects, generating an ID if none exists (since DB might not have auto-increment enabled)
        const rows = subjects.map((s, index) => {
            const rowParams = {
                name: s.name,
                code: s.code,
                credits: typeof s.credits === 'string' ? parseInt(s.credits) : s.credits,
                semester: s.semester,
                department: department,
                icon: s.icon || 'book-open-variant'
            };
            // Use existing ID or generate a unique one to prevent the 'null value in id column' error
            // Using Date.now() + index guarantees a unique int8 sequence
            rowParams.id = (s.id !== undefined && s.id !== null) ? s.id : (Date.now() + index);
            
            return rowParams;
        });

        if (rows.length > 0) {
            // Using insert directly since we've already cleared existing subjects
            const { error } = await supabase.from('subjects').insert(rows);
            if (error) throw error;
        }
        return true;
    } catch (e) {
        console.error("Error saving curriculum:", e);
        throw e;
    }
};

export const seedCSCurriculum = async (department = 'Computer Science') => {
    const subjects = [
        { name: 'Basics of Civil and Mechanical Engineering', code: 'EST120', credits: 4, semester: 'Sem 1' },
        { name: 'Engineering Chemistry', code: 'CYT100', credits: 4, semester: 'Sem 1' },
        { name: 'Engineering Mechanics', code: 'EST100', credits: 3, semester: 'Sem 1' },
        { name: 'Linear Algebra and Calculus', code: 'MAT101', credits: 4, semester: 'Sem 1' },
        { name: 'Data Structures', code: 'CST201', credits: 4, semester: 'Sem 3' },
        { name: 'Discrete Mathematical Structures', code: 'MAT203', credits: 4, semester: 'Sem 3' },
        { name: 'Logic System Design', code: 'CST203', credits: 4, semester: 'Sem 3' },
        { name: 'Object Oriented Programming Using Java', code: 'CST205', credits: 4, semester: 'Sem 3' },
        { name: 'Computer Organisation and Architecture', code: 'CST202', credits: 4, semester: 'Sem 4' },
        { name: 'Database Management Systems', code: 'CST204', credits: 4, semester: 'Sem 4' },
        { name: 'Operating Systems', code: 'CST206', credits: 4, semester: 'Sem 4' },
        { name: 'Graph Theory', code: 'MAT206', credits: 4, semester: 'Sem 4' },
        { name: 'Computer Networks', code: 'CST303', credits: 4, semester: 'Sem 5' },
        { name: 'Formal Languages and Automata Theory', code: 'CST301', credits: 4, semester: 'Sem 5' },
        { name: 'System Software', code: 'CST305', credits: 4, semester: 'Sem 5' },
        { name: 'Algorithm Analysis and Design', code: 'CST306', credits: 4, semester: 'Sem 6' },
        { name: 'Compiler Design', code: 'CST302', credits: 4, semester: 'Sem 6' },
        { name: 'Computer Graphics and Image Processing', code: 'CST304', credits: 4, semester: 'Sem 6' },
        { name: 'Artificial Intelligence', code: 'CST401', credits: 3, semester: 'Sem 7' },
        { name: 'Distributed Computing', code: 'CST402', credits: 3, semester: 'Sem 8' },
        { name: 'Deep Learning', code: 'CST414', credits: 3, semester: 'Sem 8' },
        { name: 'Project Phase II', code: 'CSD416', credits: 4, semester: 'Sem 8' },
    ];

    try {
        await saveAllCurriculumSubjects(subjects, department);
        return { success: true, count: subjects.length };
    } catch (e) {
        console.error('Error seeding CS curriculum:', e);
        return { success: false, error: e.message };
    }
};

// ─── Common ───
export const markAttendance = async (subjectId, date, studentId, status) => {
    return await supabase.from('attendance').insert({
        subject_id: subjectId,
        student_id: studentId,
        status,
        last_updated: date
    });
};

// ─── Feedback ───
export const subscribeToFeedbackSurveys = (callback) => {
    supabase.from('feedback_surveys').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `feedback_surveys_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback_surveys' }, async () => {
            const { data } = await supabase.from('feedback_surveys').select('*').order('created_at', { ascending: false });
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const createFeedbackSurvey = async (surveyData) => {
    try {
        const { data, error } = await supabase.from('feedback_surveys').insert({
            ...mapToSnake(surveyData),
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error creating feedback survey:", e);
        return { success: false, error: e.message };
    }
};

export const updateFeedbackSurvey = async (id, updates) => {
    try {
        const { error } = await supabase.from('feedback_surveys').update(mapToSnake(updates)).eq('id', id);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("Error updating feedback survey:", e);
        return { success: false, error: e.message };
    }
};

export const getSurveyResults = async (surveyId) => {
    try {
        const { data, error } = await supabase.from('feedback').select('*').eq('survey_id', surveyId);
        if (error) throw error;
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching survey results:", e);
        return [];
    }
};

export const submitFeedback = async (feedbackData) => {
    try {
        const { data, error } = await supabase.from('feedback').insert({
            ...mapToSnake(feedbackData),
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error submitting feedback:", e);
        return { success: false, error: e.message };
    }
};

// ─── Event Registrations ───
export const saveEventRegistration = async (registrationData) => {
    try {
        const { data, error } = await supabase.from('event_registrations').insert({
            ...mapToSnake(registrationData),
            registered_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error saving event registration:", e);
        return { success: false, error: e.message };
    }
};

// ─── Schedules ───
export const subscribeToSchedules = (day, callback) => {
    supabase.from('schedules').select('*').eq('day', day).order('start_time', { ascending: true }).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelId = `schedules_${day}_${Date.now()}`;
    const channel = supabase.channel(channelId)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, async () => {
            const { data } = await supabase.from('schedules').select('*').eq('day', day).order('start_time', { ascending: true });
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const createScheduleSlot = async (slotData) => {
    try {
        const { data, error } = await supabase.from('schedules').insert({
            ...mapToSnake(slotData),
            created_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error creating schedule slot:", e);
        return { success: false, error: e.message };
    }
};

export const deleteScheduleSlot = async (slotId) => {
    try {
        const { error } = await supabase.from('schedules').delete().eq('id', slotId);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error deleting schedule slot:", e);
        return false;
    }
};

// ─── Notifications ───
export const subscribeToNotifications = (callback) => {
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelName = `notifications_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
            const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const createNotification = async (notificationData) => {
    try {
        const { data, error } = await supabase.from('notifications').insert({
            ...mapToSnake(notificationData),
            created_at: new Date().toISOString(),
            is_read: false
        }).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error creating notification:", e);
        return { success: false, error: e.message };
    }
};

// ─── HOD ───
export const getDepartmentFaculty = async (department) => {
    try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'faculty').eq('department', department);
        return (data || []).map(d => ({ uid: d.id, ...mapRow(d) }));
    } catch (e) {
        console.error("Error fetching department faculty:", e);
        return [];
    }
};

export const subscribeToDepartmentFaculty = (department, callback) => {
    supabase.from('profiles').select('*').eq('role', 'faculty').eq('department', department).then(({ data }) => {
        callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
    });
    const channelName = `dept_faculty_${department.replace(/\s+/g, '_')}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*').eq('role', 'faculty').eq('department', department);
            callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const subscribeToAllFaculty = (callback) => {
    supabase.from('profiles').select('*').eq('role', 'faculty').order('name', { ascending: true }).then(({ data }) => {
        callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
    });
    const channelName = `all_faculty_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
            const { data } = await supabase.from('profiles').select('*').eq('role', 'faculty').order('name', { ascending: true });
            callback((data || []).map(d => ({ uid: d.id, ...mapRow(d) })));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const getDepartmentCourses = async (department) => {
    try {
        const { data } = await supabase.from('courses').select('*').ilike('department', `%${department}%`);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching department courses:", e);
        return [];
    }
};

export const subscribeToDepartmentCourses = (department, callback) => {
    supabase.from('courses').select('*').ilike('department', `%${department}%`).then(({ data }) => {
        callback(mapRows(data));
    });
    const channelName = `dept_courses_${department}_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, async () => {
            const { data } = await supabase.from('courses').select('*').ilike('department', `%${department}%`);
            callback(mapRows(data));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const getDepartmentStats = async (department) => {
    try {
        const { data: faculty } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'faculty').ilike('department', `%${department}%`);
        const { data: students } = await supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student').ilike('department', `%${department}%`);
        const { data: courses } = await supabase.from('courses').select('id', { count: 'exact' }).ilike('department', `%${department}%`);
        const { data: subs } = await supabase.from('subjects').select('id', { count: 'exact' }).ilike('department', `%${department}%`);
        return {
            totalFaculty: (faculty || []).length,
            totalStudents: (students || []).length,
            assignedCourses: (courses || []).length,
            totalSubjects: (subs || []).length,
        };
    } catch (e) {
        console.error("Error fetching department stats:", e);
        return { totalFaculty: 0, totalStudents: 0, assignedCourses: 0, totalSubjects: 0 };
    }
};

// ─── Faculty Marks Upload ───
export const getStudentsForMarksEntry = async (department) => {
    try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'student').eq('department', department || 'Computer Science');
        return (data || []).map(d => ({
            id: d.id,
            name: d.name || 'Unnamed',
            roll: d.roll_no || d.email?.split('@')[0] || d.id.substring(0, 6),
            marks: '',
            maxMarks: 50,
            avatar: d.profile_image || null
        }));
    } catch (e) {
        console.error("Error fetching students for marks:", e);
        return [];
    }
};

export const saveMarksForCourse = async (marksData) => {
    try {
        const { courseId, courseName, assessmentType, facultyId, facultyName, students } = marksData;
        const rows = students
            .filter(s => s.marks !== '' && s.marks !== undefined)
            .map(s => ({
                student_id: s.id,
                student_name: s.name,
                course_id: courseId,
                course_name: courseName,
                assessment_type: assessmentType,
                score: parseInt(s.marks),
                max_score: s.maxMarks || 50,
                faculty_id: facultyId,
                faculty_name: facultyName,
                uploaded_at: new Date().toISOString(),
            }));
        if (rows.length > 0) {
            const { error } = await supabase.from('marks').insert(rows);
            if (error) throw error;
        }
        return { success: true };
    } catch (e) {
        console.error("Error saving marks:", e);
        return { success: false, error: e.message };
    }
};

// ─── Faculty Notes Upload ───
export const saveNoteMaterial = async (noteData) => {
    try {
        const payload = {
            title: noteData.subjectName || noteData.title || '',
            description: noteData.description || '',
            file_url: noteData.fileUri || noteData.fileUrl || '',
            file_name: noteData.fileName || '',
            file_type: noteData.materialType || noteData.fileType || 'notes',
            department: noteData.department || '',
            semester: noteData.semester || '',
            subject: noteData.subjectCode || noteData.subject || '',
            faculty_id: noteData.facultyId || '',
            faculty_name: noteData.facultyName || '',
            uploaded_at: new Date().toISOString(),
        };
        const { data, error } = await supabase.from('notes').insert(payload).select().single();
        if (error) throw error;
        return { success: true, id: data.id };
    } catch (e) {
        console.error("Error saving note material:", e);
        return { success: false, error: e.message };
    }
};

export const getNoteMaterials = async (department, semester) => {
    try {
        const { data } = await supabase.from('notes').select('*').eq('department', department).eq('semester', semester);
        return mapRows(data);
    } catch (e) {
        console.error("Error fetching note materials:", e);
        return [];
    }
};

// ─── Role Security Codes ───
export const createRoleCode = async (role, code, department = null) => {
    try {
        const row = {
            code,
            role,
            created_at: new Date().toISOString(),
            is_active: true,
        };
        if (department) row.department = department;
        const { error } = await supabase.from('role_codes').upsert(row);
        if (error) throw error;
        return { success: true };
    } catch (e) {
        console.error("Error creating role code:", e);
        return { success: false, error: e.message };
    }
};

export const deleteRoleCode = async (code) => {
    try {
        const { error } = await supabase.from('role_codes').delete().eq('code', code);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error("Error deleting role code:", e);
        return false;
    }
};

export const subscribeToRoleCodes = (callback) => {
    supabase.from('role_codes').select('*').then(({ data }) => {
        callback((data || []).map(d => ({ id: d.code, ...mapRow(d) })));
    });
    const channelName = `role_codes_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'role_codes' }, async () => {
            const { data } = await supabase.from('role_codes').select('*');
            callback((data || []).map(d => ({ id: d.code, ...mapRow(d) })));
        })
        .subscribe();
    return () => supabase.removeChannel(channel);
};

export const validateRoleCode = async (role, code) => {
    try {
        const { data, error } = await supabase.from('role_codes').select('*').eq('code', code).single();
        if (error || !data) return { valid: false, message: "Invalid security code." };
        if (!data.is_active) return { valid: false, message: "This code has been deactivated." };
        if (data.role !== role) return { valid: false, message: "This code is not valid for the selected role." };
        return { valid: true, department: data.department || null };
    } catch (e) {
        console.error("Error validating role code:", e);
        return { valid: false, message: "Verification failed. Try again." };
    }
};

/**
 * Upload Audio to Supabase Storage
 */
export const uploadAudio = async (uri) => {
    try {
        const fileExt = uri.split('.').pop() || 'm4a';
        const fileName = `audio_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

        const { data, error } = await supabase.storage
            .from('chat_media')
            .upload(filePath, decode(base64), {
                contentType: `audio/${fileExt}`,
            });

        if (error) throw error;
        
        const { data: publicData } = supabase.storage.from('chat_media').getPublicUrl(filePath);
        return publicData.publicUrl;
    } catch (e) {
        console.error("Error uploading audio:", e);
        return null;
    }
};
