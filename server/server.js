// Import required modules
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(express.json());

// Serve static files from React build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// ========================================================
// Authentication Routes using Supabase Auth
// ========================================================

// Registration endpoint using Supabase Auth
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`Received registration request for email: ${email}`);

    // Email validation
    const emailPattern = /@(spelman\.edu|morehouse\.edu)$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ success: false, message: 'Email must end with @spelman.edu or @morehouse.edu.' });
    }

    try {
        // Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } } // Store additional user info
        });

        if (error) throw error;

        res.json({ success: true, message: 'Registration successful. Check your email for verification.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error registering user' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Received login request for email: ${email}`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Get user's name from metadata
        const name = data.user.user_metadata?.name || 'User';

        res.json({ 
            success: true, 
            message: 'Login successful', 
            name: name,
            user: data.user 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

// Email verification using 6-digit code
app.post('/verify', async (req, res) => {
    const { email, verificationCode } = req.body;
    console.log(`Verifying email: ${email} with code: ${verificationCode}`);

    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: verificationCode,
            type: 'signup'
        });

        if (error) {
            console.error('Verification failed:', error);
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'Error verifying email' });
    }
});

// ========================================================
// Review Management Routes 
// ========================================================

// Get latest reviews
app.get('/api/reviews/latest', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, likes(count)')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    // Format the data for the frontend
    const formattedReviews = data.map(review => ({
      id: review.id,
      professorName: review.professor_name,
      courseName: review.course_name,
      semester: review.semester,
      reviewText: review.review_text,
      ratings: {
        teaching: review.teaching_rating,
        difficulty: review.difficulty_rating,
        organization: review.organization_rating,
        helpfulness: review.helpfulness_rating,
        overall: review.overall_rating
      },
      studentName: review.student_name,
      studentEmail: review.student_email,
      createdAt: review.created_at,
      likes: review.likes[0]?.count || 0,
      likedByCurrentUser: false // Will be updated in the frontend
    }));
    
    res.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
});

// Search for reviews
app.get('/api/search', async (req, res) => {
  const { type, query } = req.query;
  
  if (!type || !query) {
    return res.status(400).json({ 
      success: false, 
      message: 'Search type and query are required' 
    });
  }
  
  try {
    let searchQuery = supabase
      .from('reviews')
      .select('*, likes(count)')
      .order('created_at', { ascending: false });
    
    // Apply search filters based on type
    if (type === 'professor') {
      searchQuery = searchQuery.ilike('professor_name', `%${query}%`);
    } else if (type === 'course') {
      searchQuery = searchQuery.ilike('course_name', `%${query}%`);
    }
    
    const { data, error } = await searchQuery;
    
    if (error) throw error;
    
    // Format the data for the frontend
    const formattedResults = data.map(review => ({
      id: review.id,
      professorName: review.professor_name,
      courseName: review.course_name,
      semester: review.semester,
      reviewText: review.review_text,
      ratings: {
        teaching: review.teaching_rating,
        difficulty: review.difficulty_rating,
        organization: review.organization_rating,
        helpfulness: review.helpfulness_rating,
        overall: review.overall_rating
      },
      studentName: review.student_name,
      studentEmail: review.student_email,
      createdAt: review.created_at,
      likes: review.likes[0]?.count || 0,
      likedByCurrentUser: false // Will be updated in the frontend
    }));
    
    res.json({ success: true, results: formattedResults });
  } catch (error) {
    console.error('Error searching reviews:', error);
    res.status(500).json({ success: false, message: 'Error searching reviews' });
  }
});

// Submit a new review
app.post('/api/reviews/submit', async (req, res) => {
  const { 
    professorName, 
    courseName, 
    semester, 
    reviewText, 
    ratings,
    studentEmail,
    studentName
  } = req.body;
  
  // Validate required fields
  if (!professorName || !courseName || !semester || !reviewText || !ratings.overall) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required review fields' 
    });
  }
  
  try {
    // Insert review into database
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        professor_name: professorName,
        course_name: courseName,
        semester: semester,
        review_text: reviewText,
        teaching_rating: ratings.teaching || 0,
        difficulty_rating: ratings.difficulty || 0,
        organization_rating: ratings.organization || 0,
        helpfulness_rating: ratings.helpfulness || 0,
        overall_rating: ratings.overall,
        student_email: studentEmail,
        student_name: studentName
      }])
      .select();
    
    if (error) throw error;
    
    res.json({ 
      success: true, 
      message: 'Review submitted successfully',
      reviewId: data[0].id
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Error submitting review' });
  }
});

// Like a review
app.post('/api/reviews/:reviewId/like', async (req, res) => {
  const { reviewId } = req.params;
  const { email } = req.body;
  
  if (!reviewId || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Review ID and user email are required' 
    });
  }
  
  try {
    // Check if user has already liked this review
    const { data: existingLike, error: checkError } = await supabase
      .from('review_likes')
      .select('*')
      .eq('review_id', reviewId)
      .eq('user_email', email);
    
    if (checkError) throw checkError;
    
    if (existingLike && existingLike.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already liked this review' 
      });
    }
    
    // Add a new like
    const { error: insertError } = await supabase
      .from('review_likes')
      .insert([{
        review_id: reviewId,
        user_email: email
      }]);
    
    if (insertError) throw insertError;
    
    res.json({ success: true, message: 'Review liked successfully' });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).json({ success: false, message: 'Error liking review' });
  }
});

// Get reviews by a specific user
app.get('/api/reviews/user/:email', async (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: 'User email is required' 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, likes(count)')
      .eq('student_email', email)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format the data for the frontend
    const formattedReviews = data.map(review => ({
      id: review.id,
      professorName: review.professor_name,
      courseName: review.course_name,
      semester: review.semester,
      reviewText: review.review_text,
      ratings: {
        teaching: review.teaching_rating,
        difficulty: review.difficulty_rating,
        organization: review.organization_rating,
        helpfulness: review.helpfulness_rating,
        overall: review.overall_rating
      },
      studentName: review.student_name,
      studentEmail: review.student_email,
      createdAt: review.created_at,
      likes: review.likes[0]?.count || 0,
      likedByCurrentUser: true // Since these are the user's own reviews
    }));
    
    res.json({ success: true, reviews: formattedReviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ success: false, message: 'Error fetching user reviews' });
  }
});

// Resend verification code
app.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    console.log(`Resending verification code for email: ${email}`);

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // Check if user exists
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
            filters: { email }
        });

        if (userError) throw userError;

        // If no users found with this email
        if (!userData.users || userData.users.length === 0) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        // Get the user
        const user = userData.users[0];
        
        // Check if the user is already confirmed
        if (user.email_confirmed_at) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already verified. Please login instead.' 
            });
        }

        // Generate a new OTP and send verification email
        const { error } = await supabase.auth.admin.generateOtp({
            email
        });

        if (error) throw error;

        res.json({ 
            success: true, 
            message: 'Verification code sent successfully. Please check your email.' 
        });
    } catch (error) {
        console.error('Error resending verification code:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error sending verification code' 
        });
    }
});


// Fallback route to serve React frontend for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`PULSE server running on port ${PORT}`);
});