import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import '../PostManagement/AddNewPost.css'; // Import the CSS from AddNewPost

function AddAchievements() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    postOwnerID: '',
    category: '',
    postOwnerName: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
        method: 'POST',
        body: formData,
      });
      imageUrl = await uploadResponse.text();
    }

    const response = await fetch('http://localhost:8080/achievements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, imageUrl }),
    });
    if (response.ok) {
      alert('Achievements added successfully!');
      window.location.href = '/myAchievements';
    } else {
      alert('Failed to add Achievements.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      category: '',
      postOwnerID: formData.postOwnerID,
      postOwnerName: formData.postOwnerName,
    });
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="post-creation-page">
      <NavBar />
      <div className="post-creation-container" style={{ marginTop: "80px" }}>
        <div className="post-form-card">
          <h1 className="form-title">Add Achievement</h1>
          <p className="form-subtitle">Share your accomplishments with the world</p>
          
          <form onSubmit={(e) => {
            handleSubmit(e);
            resetForm();
          }} className="modern-form">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <div 
                className={`media-drop-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleImageChange(e);
                }}
              >
                {imagePreview ? (
                  <div className="media-preview-container">
                    <div className="media-preview-item">
                      <img className="media-preview" src={imagePreview} alt="Preview" />
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Drag & drop image here or <label className="file-label">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input-hidden"
                        required
                      />
                    </label></p>
                    <p className="upload-hint">Upload an image for your achievement (max 50MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                name="title"
                type="text"
                placeholder="Enter achievement title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleChange}
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
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe your achievement"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-button" style={{ 
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)" 
            }}>
              <span className="button-text">Add Achievement</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddAchievements;
