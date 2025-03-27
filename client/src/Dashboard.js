import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ name, email, onLogout }) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'submit', 'myReviews'
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('professor'); // 'professor' or 'course'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Review submission states
  const [professorName, setProfessorName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [teachingRating, setTeachingRating] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(0);
  const [organizationRating, setOrganizationRating] = useState(0);
  const [helpfulnessRating, setHelpfulnessRating] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [submissionMessage, setSubmissionMessage] = useState('');
  
  // Review browsing states
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ==========================================
  // EFFECTS
  // ==========================================
  
  // Load latest reviews when dashboard mounts
  useEffect(() => {
    fetchLatestReviews();
  }, []);
  
  // ==========================================
  // API FUNCTIONS
  // ==========================================
  
  const fetchLatestReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/reviews/latest');
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`/api/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!professorName || !courseName || !semester || !reviewText || !overallRating) {
      setSubmissionMessage('Please fill out all required fields and provide an overall rating.');
      return;
    }
    
    try {
      const response = await axios.post('/api/reviews/submit', {
        professorName,
        courseName,
        semester,
        reviewText,
        ratings: {
          teaching: teachingRating,
          difficulty: difficultyRating,
          organization: organizationRating,
          helpfulness: helpfulnessRating,
          overall: overallRating
        },
        studentEmail: email,
        studentName: name
      });
      
      setSubmissionMessage('Review submitted successfully!');
      
      // Reset form
      setProfessorName('');
      setCourseName('');
      setSemester('');
      setReviewText('');
      setTeachingRating(0);
      setDifficultyRating(0);
      setOrganizationRating(0);
      setHelpfulnessRating(0);
      setOverallRating(0);
      
      // Refresh reviews
      fetchLatestReviews();
      
      // Switch to Browse tab
      setTimeout(() => {
        setActiveTab('search');
        setSubmissionMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmissionMessage('Error submitting review. Please try again.');
    }
  };
  
  const handleLikeReview = async (reviewId) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/like`, { email });
      
      // Update local state to reflect the like
      setReviews(reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            likes: review.likes + 1,
            likedByCurrentUser: true
          };
        }
        return review;
      }));
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };
  
  // ==========================================
  // RENDERING HELPERS
  // ==========================================
  
  const StarRating = ({ value, onChange }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= value ? 'active' : ''}`}
            onClick={() => onChange(star)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
  const ReviewCard = ({ review }) => {
    const { 
      id, 
      professorName, 
      courseName, 
      semester, 
      reviewText, 
      ratings, 
      studentName, 
      createdAt, 
      likes, 
      likedByCurrentUser
    } = review;
    
    return (
      <div className="review-card">
        <div className="review-header">
          <h3>{professorName}</h3>
          <div className="course-info">{courseName} • {semester}</div>
          <div className="review-overall-rating">
            {Array(5).fill().map((_, idx) => (
              <span key={idx} className={idx < Math.round(ratings.overall) ? 'star active' : 'star'}>★</span>
            ))}
          </div>
        </div>
        
        <div className="review-body">
          <p>{reviewText}</p>
        </div>
        
        <div className="review-ratings">
          <div className="rating-item">
            <span className="rating-label">Teaching:</span>
            <span className="rating-value">{ratings.teaching}</span>
          </div>
          <div className="rating-item">
            <span className="rating-label">Difficulty:</span>
            <span className="rating-value">{ratings.difficulty}</span>
          </div>
          <div className="rating-item">
            <span className="rating-label">Organization:</span>
            <span className="rating-value">{ratings.organization}</span>
          </div>
          <div className="rating-item">
            <span className="rating-label">Helpfulness:</span>
            <span className="rating-value">{ratings.helpfulness}</span>
          </div>
        </div>
        
        <div className="review-footer">
          <div className="review-meta">
            <span className="reviewer">- {studentName || 'Anonymous'}</span>
            <span className="review-date">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <button 
            className={`like-button ${likedByCurrentUser ? 'liked' : ''}`}
            onClick={() => !likedByCurrentUser && handleLikeReview(id)}
            disabled={likedByCurrentUser}
          >
            👍 {likes}
          </button>
        </div>
      </div>
    );
  };
  
  // ==========================================
  // TAB CONTENT RENDERERS
  // ==========================================
  
  const renderSearchTab = () => (
    <div className="search-tab">
      <h2>Find Professor Reviews</h2>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-type-selector">
          <label className={`search-type ${searchType === 'professor' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="searchType" 
              value="professor" 
              checked={searchType === 'professor'} 
              onChange={() => setSearchType('professor')} 
            />
            Professor
          </label>
          <label className={`search-type ${searchType === 'course' ? 'active' : ''}`}>
            <input 
              type="radio" 
              name="searchType" 
              value="course" 
              checked={searchType === 'course'} 
              onChange={() => setSearchType('course')} 
            />
            Department/Course
          </label>
        </div>
        
        <div className="search-input-group">
          <input
            type="text"
            placeholder={searchType === 'professor' ? "Professor's name..." : "Department or course code..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      <div className="search-results">
        {searchResults.length > 0 ? (
          <div className="results-grid">
            {searchResults.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="recent-reviews">
            <h3>Recent Reviews</h3>
            {loading ? (
              <p>Loading recent reviews...</p>
            ) : reviews.length > 0 ? (
              <div className="results-grid">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p>No reviews available yet. Be the first to submit one!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  const renderSubmitTab = () => (
    <div className="submit-tab">
      <h2>Submit a Professor Review</h2>
      
      <div className="guidelines-box">
        <h3>Guidelines for Constructive Feedback</h3>
        <p>Please keep your review respectful and constructive. Focus on course content, teaching methods, and your learning experience. Avoid personal attacks or inappropriate comments.</p>
        <p>The most helpful reviews provide specific examples and suggestions for improvement.</p>
      </div>
      
      <form className="review-form" onSubmit={handleSubmitReview}>
        <div className="form-group">
          <label>Professor Name*</label>
          <input
            type="text"
            value={professorName}
            onChange={(e) => setProfessorName(e.target.value)}
            placeholder="Enter professor's full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Course Name/Code*</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="E.g., CS101, Introduction to Biology"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Semester*</label>
          <select 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
            required
          >
            <option value="">Select a semester</option>
            <option value="Fall 2024">Fall 2024</option>
            <option value="Spring 2024">Spring 2024</option>
            <option value="Fall 2023">Fall 2023</option>
            <option value="Spring 2023">Spring 2023</option>
            <option value="Fall 2022">Fall 2022</option>
            <option value="Spring 2022">Spring 2022</option>
          </select>
        </div>
        
        <div className="form-group ratings-group">
          <label>Ratings</label>
          
          <div className="rating-row">
            <span className="rating-label">Teaching Quality:</span>
            <StarRating value={teachingRating} onChange={setTeachingRating} />
          </div>
          
          <div className="rating-row">
            <span className="rating-label">Course Difficulty:</span>
            <StarRating value={difficultyRating} onChange={setDifficultyRating} />
          </div>
          
          <div className="rating-row">
            <span className="rating-label">Organization:</span>
            <StarRating value={organizationRating} onChange={setOrganizationRating} />
          </div>
          
          <div className="rating-row">
            <span className="rating-label">Helpfulness:</span>
            <StarRating value={helpfulnessRating} onChange={setHelpfulnessRating} />
          </div>
          
          <div className="rating-row">
            <span className="rating-label">Overall Rating:*</span>
            <StarRating value={overallRating} onChange={setOverallRating} />
          </div>
        </div>
        
        <div className="form-group">
          <label>Your Review*</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this professor and course. What did you like? What could be improved? Please be specific and constructive."
            rows={6}
            required
          />
        </div>
        
        <button type="submit" className="submit-button">Submit Review</button>
        
        {submissionMessage && (
          <div className="submission-message">
            {submissionMessage}
          </div>
        )}
      </form>
    </div>
  );
  
  const renderMyReviewsTab = () => (
    <div className="my-reviews-tab">
      <h2>My Reviews</h2>
      
      {loading ? (
        <p>Loading your reviews...</p>
      ) : (
        <div className="my-reviews-list">
          {reviews.filter(review => review.studentEmail === email).length > 0 ? (
            reviews
              .filter(review => review.studentEmail === email)
              .map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
          ) : (
            <p>You haven't submitted any reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
  
  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>PULSE</h1>
        <h2>Professor Undergrad Learning & Student Evaluations</h2>
        
        <div className="user-info">
          <span>Welcome, {name}</span>
          <button className="logout-btn" onClick={onLogout}>Log Out</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <button 
          className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Browse Reviews
        </button>
        <button 
          className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Review
        </button>
        <button 
          className={`tab-btn ${activeTab === 'myReviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('myReviews')}
        >
          My Reviews
        </button>
      </nav>
      
      <main className="dashboard-content">
        {activeTab === 'search' && renderSearchTab()}
        {activeTab === 'submit' && renderSubmitTab()}
        {activeTab === 'myReviews' && renderMyReviewsTab()}
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 PULSE - Professor Undergrad Learning & Student Evaluations</p>
      </footer>
    </div>
  );
}

export default Dashboard;