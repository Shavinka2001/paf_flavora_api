import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css'; // We'll create this CSS file

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [categories, setCategories] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB .....`);
        window.location.reload();
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        window.location.reload();
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      window.location.reload();
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      window.location.reload();
    }

    setMedia(files);
    setMediaPreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', categories);
    media.forEach((file, index) => formData.append(`mediaFiles`, file));

    try {
      const response = await axios.post('http://localhost:8080/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post created successfully!');
      window.location.href = '/myAllPost';
    } catch (error) {
      console.error(error);
      alert('Failed to create post.');
      window.location.reload();
    }
  };

  return (
    <div className="post-creation-page">
      <NavBar />
      <div className="post-creation-container" style={{ marginTop: "80px" }}>
        <div className="post-form-card">
          <h1 className="form-title">Create New Post</h1>
          <p className="form-subtitle">Share your thoughts with the world</p>
          
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
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
                placeholder="What's on your mind?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Media</label>
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
                  const files = Array.from(e.dataTransfer.files);
                  handleMediaChange({ target: { files } });
                }}
              >
                <div className="upload-icon">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Drag & drop files here or <label className="file-label">
                  browse
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,video/mp4"
                    multiple
                    onChange={handleMediaChange}
                    className="file-input-hidden"
                  />
                </label></p>
                <p className="upload-hint">Upload up to 3 images or 1 video (max 30s, 50MB)</p>
              </div>
              
              {mediaPreviews.length > 0 && (
                <div className="media-preview-container">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className="media-preview" src={preview.url} alt={`Preview ${index}`} />
                      )}
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => {
                          const newPreviews = [...mediaPreviews];
                          const newMedia = [...media];
                          newPreviews.splice(index, 1);
                          newMedia.splice(index, 1);
                          setMediaPreviews(newPreviews);
                          setMedia(newMedia);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" className="submit-button" style={{ 
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)" 
            }}>
              <span className="button-text">Publish Post</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
