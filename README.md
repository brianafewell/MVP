# HW 5: Technical Assignment - Improving an MVP

## 🚀 PULSE: Professor Undergrad Learning & Student Evaluations

PULSE is a web application designed to help students share and access reviews of professors and courses. Similar to RateMyProfessor but specifically tailored for Spelman and Morehouse students, PULSE allows users to:

- Search for professors or courses
- Submit detailed reviews with ratings across multiple criteria
- Read and like other students' reviews
- Track their own submitted reviews

The app uses React for the frontend, Express for the backend, and Supabase for authentication and database management, creating a secure and scalable platform for student feedback.

## 💻 Live Demo

Check out the live demo at [https://pulse-app-demo-0cdb634ad214.herokuapp.com/](https://pulse-app-demo-0cdb634ad214.herokuapp.com/)

Sign up with a Spelman or Morehouse email address, verify your account, and explore the functionality.

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/amoretti86/pulse-app.git
cd pulse-app
```

### 2. Create Your Own Repository

Since you'll be making significant improvements to the app, create your own GitHub repository:

```bash
# Create a new repository on GitHub first, then:

# Remove the original remote
git remote remove origin

# Add your new repository as the origin
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to your new repository
git push -u origin main
```

### 3. Set Up Supabase

1. **Sign up for Supabase**
   - Go to [https://supabase.com/](https://supabase.com/) and create an account
   - Click "New Project" and give it a name
   - Choose a strong password for the database
   - Select a region close to your users
   - Click "Create new project"

2. **Get Your Supabase Credentials**
   - Go to "Settings" → "API" in the Supabase Dashboard
   - Copy the following values:
     - **Supabase URL**
     - **Service Role Key** (needed for admin operations)

3. **Set Up the Database Schema**
   - In the Supabase Dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy the contents of `server/pulse_schema.sql` from the repo
   - Paste into the SQL editor and click "Run"

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
```

### 5. Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 6. Run Locally

```bash
# Start the server
npm run dev
```

Visit `http://localhost:3000` to see your app running locally.

## 📊 Managing Your Supabase Database

### Viewing the Database Schema

1. Go to the Supabase Dashboard
2. Select "Table Editor" from the sidebar
3. You'll see the following tables:
   - `reviews` - Contains all professor reviews
   - `review_likes` - Tracks which users liked which reviews

### Managing Users

1. Go to "Authentication" → "Users" in the Supabase Dashboard
2. Here you can:
   - View all registered users
   - Delete user accounts
   - Manage user metadata
   - Reset passwords

## 🚀 Deploying to Heroku

1. **Install Heroku CLI** (if not already installed)
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create a Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Push to Heroku**
   ```bash
   git push heroku main
   ```

6. **Open Your App**
   ```bash
   heroku open
   ```

## 📝 Assignment: Improve the MVP

Your task is to significantly improve the PULSE MVP by implementing new features, enhancing the design, or adding monetization. Here's how to proceed:

### Step 1: Test and Analyze the Demo

- Sign up on the demo app
- Submit some test reviews
- Search for professors/courses
- Identify strengths and weaknesses

### Step 2: Clone and Setup

- Follow the setup instructions above
- Make sure you have your own GitHub repository
- Set up your own Supabase project

### Step 3: Choose Your Improvement Path

Select at least one of these paths to focus your improvements:

#### A. Enhanced Functionality
- Add professor profiles with more details
- Implement course-specific reviews
- Create department analytics
- Add filtering and sorting options for reviews
- Implement a professor response system

#### B. Improved User Experience
- Redesign the interface for better aesthetics
- Optimize for mobile devices
- Add dark mode support
- Implement user profiles with achievements
- Create a notification system for new reviews

#### C. Monetization Strategy
- Integrate Stripe payment processing
- Create a premium tier with additional features
- Develop a sponsored content system for departments
- Implement targeted ads for campus services
- Create a professor verification system with subscription

### Step 4: Get User Feedback

**This is a critical part of the assignment!**

- Find at least 5 real users to test your improved app
- Document their feedback systematically
- Implement changes based on user feedback
- Create a short "user research" summary

### Step 5: Documentation

- Update the README with your changes
- Create a CHANGELOG.md documenting improvements
- Include screenshots of your enhanced app
- Write a short business case if you implemented monetization

### Step 6: Deployment and Submission

- Deploy your improved app to Heroku
- Push your code to your GitHub repository
- Submit the following:
  - GitHub repository URL
  - Deployed app URL
  - User research summary (PDF)
  - Any monetization strategy documentation (if applicable)

## 💡 Evaluation Criteria

Your improved MVP will be evaluated based on:

1. **Technical Implementation** - Code quality and working features
2. **User Experience** - Interface design and usability
3. **User Research** - Quality of feedback collected and applied
4. **Innovation** - Creativity of improvements
5. **Documentation** - Clarity of documentation and business case

## 💪 Bonus Points

- Implement features that differentiate PULSE from similar platforms
- Demonstrate user growth or engagement metrics
- Develop a compelling business model with revenue projections
- Create a roadmap for future development

Best of luck improving the PULSE MVP! This assignment simulates the real-world process of iterating on a product based on user feedback, an essential skill for digital entrepreneurs.