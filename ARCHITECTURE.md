# College Management Portal - Detailed System Architecture

This document provides an in-depth technical overview of the College Management Portal, detailing its file structure, data models, state management, and the specific responsibilities of each sub-system.

---

## 1. Project Overview & Technology Stack

The College Management Portal is a cross-platform mobile application built to unify the academic and administrative experience.

- **Core Engine**: React Native `0.81.5` managed via Expo `~54.0.27`.
- **Navigation Engine**: `@react-navigation/native` utilizing Stack (`@react-navigation/stack`) and Bottom Tabs (`@react-navigation/bottom-tabs`).
- **Data & Auth**: Firebase `^12.6.0` (Authentication & Cloud Firestore).
- **UI & Visualization**: 
  - Components: `react-native-paper`
  - Graphics/Charts: `react-native-svg`, `react-native-chart-kit`
  - Icons: `@expo/vector-icons` (MaterialIcons, MaterialCommunityIcons)
  - Layout: Flexbox-based custom `StyleSheet` objects utilizing Tailwind-inspired naming conventions.
- **State Management**: React Context API (`AuthContext`, `RoleContext`).

---

## 2. Directory & File Structure Deep Dive

The application logic is contained within the `src/` directory.

### `src/context/` (State Management Layer)
- **`AuthContext.js`**: Wraps the Firebase Authentication SDK. Initializes a listener on `onAuthStateChanged` to maintain the session state (Logged In vs Logged Out). Provides `login`, `register`, and `logout` methods globally.
- **`RoleContext.js`**: Depends on `AuthContext`. Once a `uid` is established, it queries the `users` collection in Firestore to determine the user's role (`student`, `faculty`, `admin`, `placement_officer`). This is the crux of the app's routing logic.

### `src/navigation/` (Routing Layer)
- **`RoleBasedNavigator.js`**: The root switch. Displays a loading indicator while contexts stabilize. If unauthenticated, it returns `AuthNavigator`. If authenticated, it reads the role from `RoleContext` and mounts the corresponding stack.
- **Role Navigators (`StudentNavigator.js`, `AdminNavigator.js`, etc.)**: Each of these defines a Bottom Tab Navigator for main views and pushes detail screens (like `EventDetails` or `NotificationDetail`) onto a Stack hiding the bottom tabs.

### `src/services/` (Data Access Layer)
- **`firebaseConfig.js`**: Initializes the Firebase connection and explicitly configures Auth persistence using `@react-native-async-storage/async-storage`.
- **`firestoreService.js`**: A massive utility file containing all CRUD operations. It acts as the ORM between the frontend components and Firestore. Notable functions include:
  - `seedInitialData()`: Scripts to populate the database with mock subjects, users, and events.
  - `getStudentDashboardStats(uid)`: Aggregates CGPA and Attendance points.
  - `getUpcomingEvents()`, `getRecentJobs()`: Setup real-time listeners (`onSnapshot`) for dashboard feeds.
- **`mockData.js`**: Contains JSON arrays of seed data used during initialization.

### `src/screens/` (Presentation Layer)
Grouped strictly by the role that has primary access to them. See *Section 4* for detailed breakdowns.

---

## 3. Data Schema (Cloud Firestore)

The application utilizes a NoSQL document database structure.

### `users` collection
Acts as the central identity registry.
- `uid` (String, Document ID: Matches Firebase Auth ID)
- `role` (String: 'student' | 'faculty' | 'admin' | 'placement_officer')
- `name`, `email`, `department`, `semester` (Strings)
- `cgpa`, `attendancePercentage` (Numbers: Denormalized/Cached aggregates for fast dashboard loading)

### `attendance` collection
Records individual class attendance.
- `id` (Auto-generated)
- `studentId` (String: Reference to `users.uid`)
- `subjectId`, `subjectName` (String)
- `date` (Timestamp)
- `status` (String: 'Present' | 'Absent')

### `marks` collection
Stores academic performance per subject.  
- `id` (Auto-generated)
- `studentId` (String: Reference to `users.uid`)
- `subjectId`, `subjectName` (String)
- `semester`, `credits` (String/Number)
- `cia1`, `cia2`, `assignment`, `total` (Numbers)

### `courses` collection
Curriculum linking faculty to subjects.
- `id` (String: Subject Code e.g., 'CS701')
- `name` (String: e.g., 'Mobile App Dev')
- `credits`, `semester`, `department` (String/Number)
- `facultyId` (String: Reference to `users.uid`)

### `placements` collection
Active job postings.
- `id` (Auto-generated)
- `companyName`, `role`, `package`, `description`, `eligibility` (Strings)
- `date` (Timestamp)
- `isNew` (Boolean)

### `events` collection
Campus activities.
- `id` (Auto-generated)
- `title`, `type`, `location`, `time` (Strings)
- `date` (Timestamp)
- `image` (URL String)

---

## 4. Key Sub-Systems & Workflows by Role

### A. Student Sub-System
The most feature-rich interface focused on visualization and engagement.
1. **Home/Dashboard (`Dashboard.js`)**: 
   - Fetches cached `users` document for personalized greetings.
   - Listens to `events` and `placements` collections for quick updates.
   - Links to deeper analytics pages.
2. **Academics (`Attendance.js`, `Marks.js`, `PerformanceAnalytics.js`)**: 
   - Queries `attendance` and `marks` filtering by the active `studentId`.
   - `PerformanceAnalytics.js` visualizes trend lines using `react-native-chart-kit`.
3. **Engagement (`Events.js`, `EventDetails.js`, `EventRegistration.js`)**: 
   - Browsing campus events. The `EventRegistration` screen pulls the student's existing `name` and `department` to auto-fill registration forms.
4. **Career (`Placements.js`, `ApplyDrive.js`, `DriveResults.js`)**: 
   - Allows users to see job requirements and submit applications.

### B. Faculty Sub-System
Focused on data entry and course management.
1. **Attendance Marking (`AttendanceManager.js`)**: 
   - Faculty select a course they own (from `courses` collection where `facultyId == uid`).
   - Fetches all students enrolled in that semester/department.
   - Writes batch updates to the `attendance` collection.
2. **Academic Uploads (`MarksUpload.js`)**: 
   - Similar flow to attendance but updates the `marks` collection. Calculates `total` score automatically based on CIA1, CIA2, and Assignment inputs before saving to Firestore.

### C. Administrator Sub-System
The orchestrator of the platform structure.
1. **Curriculum Master (`ManageSubjects.js`, `AssignFacultySubject.js`)**: 
   - Admins define the `courses` collection.
   - They assign `users` (where role='faculty') to specific course IDs, granting those faculty members access to mark attendance for that subject.
2. **User Management (`ManageStudents.js`, `ManageFaculty.js`)**: 
   - Can view and theoretically modify user attributes or trigger password resets.
3. **Schedule Management (`ManageSchedules.js`)**: 
   - Global timetable coordination.

### D. Placement Officer Sub-System
Dedicated to the recruitment pipeline.
1. **Drive Announcements (`ManageDrives.js`)**: 
   - Writes new job postings to the `placements` collection.
2. **Student Targeting (`FilterStudents.js`)**: 
   - Powerful query screen. Queries the `users` collection (role='student') filtering by combinations of `department`, `semester`, and `cgpa >= X`.
3. **Outcome Management (`ManageDriveResults.js`)**: 
   - Uploads lists of selected students, closing the placement loop.

---

## 5. UI/UX & Design Philosophy

- **Component Reusability**: Common interface elements (buttons, cards, headers) are styled uniformly across files using `StyleSheet.create`. 
- **Glassmorphism**: Extensive use of translucent backgrounds (`rgba(255,255,255,0.8)`) overlaying gradients to establish a modern, deep UI.
- **Feedback Loops**: Interactions are paired with immediate visual changes (e.g., Tab bar icon states, `SafeAreaInsets` to prevent notch clipping, sticky headers built with ScrollView configurations).
- **Navigation Modals**: Detail screens (`NotificationDetail`, `EventRegistration`) are pushed over the bottom tabs to maximize screen real estate and focus the user's attention.
