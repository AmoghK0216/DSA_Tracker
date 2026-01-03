# LeetCode Tracker

A personal, lightweight web application to track Data Structures & Algorithms practice with a 6-day rotation system covering key topics. Built for individual use without user authentication.

<img width="1862" height="1116" alt="image" src="https://github.com/user-attachments/assets/e269b266-acf7-4dc4-abb5-69033910d1a8" />
<br>
<br>
<br>
<img width="1854" height="1116" alt="image" src="https://github.com/user-attachments/assets/a07273c3-4ae6-42c5-9a2b-2efb66192de3" />







## Features

### 📅 Structured Learning
- **6-Day Rotation**: Arrays, Linked Lists, Trees/Graphs, Dynamic Programming, and Advanced Topics
- **3 Problems Daily**: Focused practice with manageable daily goals
- Track progress with visual indicators
- Reset the cycle manually to clear the daily problem data.
 > **Note:** All solved problems are saved in solved problems tab. Reset clears the daily problem data, so you can start a new cycle

### 📊 Smart Problem Management
- Mark problems as solved with automatic persistence
- Flag problems for review or as tricky
- Add detailed notes, links, and complexity analysis
- Manual problem addition for flexibility

### 🔍 Advanced Filtering & Search
- View all solved problems with search functionality
- Filter by review status or tricky problems
- Sort by completion date
- Real-time search across names, links, and notes

### ⚡ Keyboard Shortcuts
- `Alt+1` - Today's Problems
- `Alt+2` - All Solved Problems
- `Alt+3` - Review Problems
- `Alt+4` - Tricky Problems
- `Alt+S` - Focus search bar
- `Esc` - Unfocus search bar

### 🔄 Cloud Storage
- Personal cloud-based storage with Firebase Firestore
- Automatic save with optimized database operations
- Access your progress from any device

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **Database**: Firebase Firestore
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmoghK0216/DSA_Tracker.git
   cd DSA_Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore Database
   - Create a `.env` file in the root directory:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. **Configure Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /appData/{document} {
         allow read, write: if true;  // Open access for personal use
       }
     }
   }
   ```
   
   > **Note:** These rules allow open access since this is a personal tracking tool. For additional security, consider restricting by IP or using Firebase App Check.

5. **Set Authentication as Anonymous in Firebase**

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Daily Practice Flow
1. Navigate to "Today's Problems" tab
2. Fill in problem details (name, link, notes)
3. Mark as "Review" or "Tricky" if needed
4. Check the completion box when solved
5. Problem automatically saves to your history

> **Note:** Checking the completion box creates a snapshot of the problem. Subsequent edits to the daily problem won't update already saved entries.

### Review System
- Mark problems that need revisiting with the Review flag
- Flag challenging problems as Tricky for later focus
- Use keyboard shortcuts for quick navigation

### Search & Filter
- Use the search bar in History, Review, and Tricky tabs
- Search by problem name, LeetCode link, or notes
- Real-time filtering as you type

## Project Structure

```
src/
├── components/
│   ├── DailyProblemCard.jsx    # Individual problem card for daily view
│   ├── ProblemCard.jsx          # Card for solved problems history
│   ├── ProgressBar.jsx          # Overall progress visualization
│   ├── DaySelector.jsx          # 6-day rotation selector
│   ├── ViewTabs.jsx             # Tab navigation component
│   ├── SearchBar.jsx            # Search functionality
│   └── Modal.jsx                # Custom modal dialogs
├── App.jsx                      # Main application logic
├── constants.js                 # Topics and day configurations
├── firebase.js                  # Firebase initialization
└── index.css                    # Global styles
```

## Database Architecture

The app uses a split-document structure for optimal performance:

- **appData/daily** - Current day and daily problem progress
- **appData/solved** - Persistent solved problems data

This architecture minimizes read/write operations and enables field-level updates.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev)
- Inspired by the need for structured DSA practice tracking
