# CareerGenie - Personalized Career & Skills Advisor

A React-based web application that provides AI-powered career guidance and personalized skills recommendations to help users accelerate their professional growth.

## 🚀 Features

### MVP (Hackathon Ready)
- **User Authentication**: Firebase Auth with email/password and Google Sign-in
- **Career Assessment**: Interactive questionnaire to analyze user profile
- **AI Recommendations**: Personalized career paths and skills suggestions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Data**: Firebase Firestore integration

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Routing**: React Router v6

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd careergenie-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create Firestore database
   - Enable Storage
   - Copy your Firebase config and update `src/config/firebase.js`

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   └── Navbar.jsx       # Navigation component
├── pages/               # Page components
│   ├── Landing.jsx      # Landing page
│   ├── Login.jsx        # Authentication
│   ├── Register.jsx     # User registration
│   ├── Dashboard.jsx    # User dashboard
│   ├── Assessment.jsx   # Career assessment
│   ├── Recommendations.jsx # AI recommendations
│   └── Profile.jsx      # User profile management
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context
├── config/              # Configuration files
│   └── firebase.js      # Firebase configuration
├── App.jsx              # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🎯 User Flow

1. **Landing Page**: Introduction and feature overview
2. **Registration/Login**: User authentication via Firebase
3. **Dashboard**: Overview of progress and quick actions
4. **Assessment**: 6-question career assessment
5. **Recommendations**: AI-generated career and skills suggestions
6. **Profile**: User profile management and settings

## 🔥 Firebase Collections

### Users Collection (`users`)
```javascript
{
  uid: "user-id",
  name: "User Name",
  email: "user@email.com",
  createdAt: "2024-01-01T00:00:00.000Z",
  profileCompleted: false,
  assessmentCompleted: false,
  // ... other profile fields
}
```

### Assessments Collection (`assessments`)
```javascript
{
  userId: "user-id",
  responses: {
    experience: "mid",
    industry: "technology",
    skills: ["programming", "leadership"],
    // ... other responses
  },
  completedAt: "2024-01-01T00:00:00.000Z",
  version: "1.0"
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Green (#22c55e)
- **Accent**: Purple (#8b5cf6)

### Components
- **Buttons**: Primary, Secondary, Outline variants
- **Cards**: Clean white cards with subtle shadows
- **Forms**: Consistent input styling with icons
- **Navigation**: Fixed header with user context

## 📱 Responsive Design

- **Mobile First**: Designed for mobile screens first
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch Friendly**: Large click targets for mobile
- **Progressive Enhancement**: Works on all devices

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Enhancements

- **AI Integration**: Connect to Vertex AI for enhanced recommendations
- **Chat Interface**: Real-time career counseling chatbot
- **Social Features**: Share recommendations and connect with peers
- **Analytics**: Advanced progress tracking and insights
- **Mobile App**: React Native mobile application

---

Built with ❤️ for hackathons and rapid prototyping.
