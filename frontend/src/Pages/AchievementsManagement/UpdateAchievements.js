import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import '../PostManagement/AddNewPost.css'; // Import the same CSS file used by AddNewPost/UpdatePost

function UpdateAchievements() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement..');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8080/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update achievement data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8080/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        navigate('/allAchievements');
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="post-creation-page">
      <NavBar />
      <div className="post-creation-container" style={{ marginTop: "80px" }}>
        <div className="post-form-card">
          <h1 className="form-title">Update Achievement</h1>
          <p className="form-subtitle">Edit your achievement details</p>
          
          <form onSubmit={handleSubmit} className="modern-form">
            {/* Image Upload Section */}
            <div className="form-group">
              <label className="form-label">Achievement Image</label>
              {previewImage && (
                <div className="media-preview-container" style={{ marginBottom: '15px' }}>
                  <div className="media-preview-item">
                    <img
                      src={previewImage}
                      alt="Achievement Preview"
                      className="media-preview"
                    />
                  </div>
                </div>
              )}
              <div className="media-drop-area">
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Select an image or <label className="file-label">
                  browse
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="file-input-hidden"
                  />
                </label></p>
                <p className="upload-hint">Upload a high-quality image (max 50MB)</p>
              </div>
            </div>

            {/* Title Input */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="Enter achievement title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category Select */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Category</option>
                <option value="Street Food">Street Food</option>
                <option value="One-Pot Meals">One-Pot Meals</option>
                <option value="Meal Prep / Batch Cooking">Meal Prep / Batch Cooking</option>
                <option value="Budget-Friendly">Budget-Friendly</option>
                <option value="Kid-Friendly">Kid-Friendly</option>
                <option value="Healthy Recipes">Healthy Recipes</option>
                <option value="Comfort Food">Comfort Food</option>
                <option value="Traditional / Cultural Recipes">Traditional / Cultural Recipes</option>
                <option value="Fusion Recipes">Fusion Recipes</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe your achievement"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                required
              />
            </div>

            {/* Date Input */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading}
              style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
            >
              <span className="button-text">{isLoading ? 'Updating...' : 'Update Achievement'}</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateAchievements;