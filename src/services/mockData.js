export const USERS = [
    {
        uid: "student_demo",
        name: "Alex Morgan",
        email: "alex.morgan@college.edu",
        role: "student",
        department: "Computer Science",
        semester: 6,
        cgpa: 8.4,
        attendancePercentage: 85,
        profileImage: null
    },
    {
        uid: "faculty_demo",
        name: "Prof. Sarah Wilson",
        email: "sarah.wilson@college.edu",
        role: "faculty",
        department: "Computer Science",
        designation: "Senior Professor",
        specialization: "Data Science"
    },
    {
        uid: "admin_demo",
        name: "Admin User",
        email: "admin@college.edu",
        role: "admin",
        department: "Administration"
    }
];

export const ATTENDANCE = [
    {
        studentId: "student_demo",
        subjectId: "CS-302",
        subjectName: "Software Engineering",
        totalClasses: 45,
        attendedClasses: 38,
        status: "Present", // For recent activity
        lastUpdated: new Date().toISOString()
    },
    {
        studentId: "student_demo",
        subjectId: "CS-304",
        subjectName: "Computer Networks",
        totalClasses: 42,
        attendedClasses: 30,
        status: "Absent",
        lastUpdated: new Date().toISOString()
    },
    {
        studentId: "student_demo",
        subjectId: "DA-201",
        subjectName: "Data Analytics",
        totalClasses: 40,
        attendedClasses: 36,
        status: "Present",
        lastUpdated: new Date().toISOString()
    }
];

export const MARKS = [
    {
        studentId: "student_demo",
        subjectId: "CS-302",
        subjectName: "Software Engineering",
        credits: 4,
        cia1: 19,
        cia2: 18,
        assignment: 9,
        total: 46, // Out of 50
        maxScore: 50
    },
    {
        studentId: "student_demo",
        subjectId: "CS-304",
        subjectName: "Computer Networks",
        credits: 3,
        cia1: 14,
        cia2: 13,
        assignment: 8,
        total: 35,
        maxScore: 50
    },
    {
        studentId: "student_demo",
        subjectId: "DA-201",
        subjectName: "Data Analytics",
        credits: 3,
        cia1: 18,
        cia2: 16,
        assignment: 8,
        total: 42,
        maxScore: 50
    }
];

export const PLACEMENTS = [
    {
        companyName: "TechCorp Systems",
        role: "Jr. Software Engineer",
        package: "12 LPA",
        date: "Oct 24, 2023",
        description: "Leading global technology services company.",
        type: "Full Time",
        eligibility: "CGPA > 7.5",
        location: "Bangalore",
        isNew: true
    },
    {
        companyName: "Innovate AI",
        role: "Data Scientist",
        package: "18 LPA",
        date: "Oct 28, 2023",
        description: "AI-first startup working on generative models.",
        type: "Full Time",
        eligibility: "CGPA > 8.0",
        location: "Remote",
        isNew: true
    },
    {
        companyName: "CloudScale",
        role: "DevOps Engineer",
        package: "10 LPA",
        date: "Nov 05, 2023",
        description: "Cloud infrastructure management platform.",
        type: "Internship + FTE",
        eligibility: "CGPA > 7.0",
        location: "Hyderabad",
        isNew: false
    }
];

export const EVENTS = [
    {
        title: "Mid-Term Exams",
        type: "Exam",
        date: "2023-10-12", // ISO String for easier parsing or Timestamp later
        time: "10:00 AM",
        location: "Room 302",
        description: "Semester 6 Mid-term examinations start."
    },
    {
        title: "Project Submission",
        type: "Deadline",
        date: "2023-10-15",
        time: "11:59 PM",
        location: "Online",
        description: "Final year project phase 1 submission."
    },
    {
        title: "Guest Lecture",
        type: "Lecture",
        date: "2023-10-20",
        time: "02:00 PM",
        location: "Auditorium",
        description: "Talk on Future of AI by Dr. Smith."
    }
];

export const COURSES = [
    {
        id: "CS-302",
        name: "Software Engineering",
        code: "CS-302",
        facultyId: "faculty_demo",
        schedule: [
            { day: "Monday", time: "10:00 AM - 11:00 AM", room: "302" },
            { day: "Wednesday", time: "11:00 AM - 12:00 PM", room: "Lab 1" }
        ],
        studentsEnrolled: 45
    },
    {
        id: "DA-201",
        name: "Data Analytics",
        code: "DA-201",
        facultyId: "faculty_demo",
        schedule: [
            { day: "Tuesday", time: "09:00 AM - 10:00 AM", room: "304" },
            { day: "Thursday", time: "02:00 PM - 03:00 PM", room: "304" }
        ],
        studentsEnrolled: 38
    }
];

export const ADMIN_STATS_MOCK = {
    totalStudents: 2450,
    totalFaculty: 128,
    recentActivity: [
        { title: "New Student Enrollment Complete", desc: "Batch 2024 admissions have been finalized.", time: "2 hours ago", type: "success" },
        { title: "Pending Faculty Leave Requests", desc: "You have 3 pending leave approvals.", time: "5 hours ago", type: "warning" }
    ]
};

export const PLACED_STUDENTS = [
    {
        id: 1,
        name: 'Sarah Khan',
        company: 'Google',
        package: '₹24 LPA',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
        id: 2,
        name: 'Rahul Mehta',
        company: 'Amazon',
        package: '₹18 LPA',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
];
