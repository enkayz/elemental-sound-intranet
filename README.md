# Elemental Sound Intranet Portal

A comprehensive intranet system for Elemental Sound, designed to manage rehearsal room maintenance, equipment inventory, and training resources.

## Features

- **User Authentication**: Role-based access control with different permission levels
- **Dashboard**: Personalized view of tasks, room status, notifications, and equipment issues
- **Inventory Management**: Complete system for tracking equipment across rehearsal rooms
- **Forms**: Digital versions of maintenance forms and checklists
- **Document Library**: Central repository for procedures and guidelines
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React.js with Next.js
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Form Handling**: Formik with Yup validation
- **Local Database**: LowDB (JSON-based local database)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd elemental-sound-intranet
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Default Login

The system comes with a default administrator account:
- **Username**: admin
- **Password**: admin123

## Project Structure

```
elemental-sound-intranet/
├── public/            # Static assets
├── src/
│   ├── components/    # Reusable UI components
│   ├── data/          # Database and data utilities
│   ├── pages/         # Next.js pages
│   │   ├── api/       # API endpoints
│   │   └── ...        # Page components
│   ├── styles/        # Global styles
│   └── utils/         # Utility functions
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## Usage

After logging in with the default admin account, you can:

1. Navigate the dashboard to view room status and tasks
2. Explore the inventory management system to track equipment
3. View and submit digital forms
4. Access the documentation library
5. Create additional user accounts with different roles

## Customization

The system is designed to be customizable. You can modify:

- Colors and branding in `tailwind.config.js`
- Default data in `src/data/db.js`
- Page layouts and components in their respective files

## Local Development

All data is stored locally using LowDB, which creates a JSON file at `src/data/db.json`. This makes it easy to develop and test without external database dependencies.

In a production environment, you would typically replace this with a more robust database solution.

## License

MIT 