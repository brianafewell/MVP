-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  semester TEXT NOT NULL,
  review_text TEXT NOT NULL,
  teaching_rating SMALLINT DEFAULT 0,
  difficulty_rating SMALLINT DEFAULT 0,
  organization_rating SMALLINT DEFAULT 0,
  helpfulness_rating SMALLINT DEFAULT 0,
  overall_rating SMALLINT NOT NULL,
  student_email TEXT NOT NULL,
  student_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_likes table for tracking likes
CREATE TABLE IF NOT EXISTS review_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure users can only like a review once
  UNIQUE(review_id, user_email)
);

-- Create a view to count likes per review
CREATE OR REPLACE VIEW likes AS
  SELECT 
    review_id,
    COUNT(*) as count
  FROM review_likes
  GROUP BY review_id;

-- Create RLS policies for security

-- Enable Row Level Security on tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.email() = student_email);

-- Policy: Anyone can read likes
CREATE POLICY "Anyone can read likes"
  ON review_likes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can like reviews
CREATE POLICY "Authenticated users can like reviews"
  ON review_likes
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at on reviews
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create an index on professor_name for faster searches
CREATE INDEX idx_reviews_professor_name ON reviews(professor_name);

-- Create an index on course_name for faster searches
CREATE INDEX idx_reviews_course_name ON reviews(course_name);

-- Create an index on student_email for faster filtering
CREATE INDEX idx_reviews_student_email ON reviews(student_email);