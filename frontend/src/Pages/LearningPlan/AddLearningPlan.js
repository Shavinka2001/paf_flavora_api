import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file.');
        return;
      }
      
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div className="post-creation-page">
      <NavBar />
      <div className="post-creation-container" style={{ marginTop: "80px" }}>
        <div className="post-form-card">
          <h1 className="form-title">Create Learning Plan</h1>
          <p className="form-subtitle">Share your learning journey with the community</p>
          
          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your learning plan title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                placeholder="Describe your learning plan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>
            
            <div className="form-group date-range-container">
              <div className="date-field">
                <label className="form-label">Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="date-field">
                <label className="form-label">End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Template Style</label>
              <select
                className="form-select"
                value={templateID}
                onChange={(e) => setTemplateID(e.target.value)}
                required
              >
                <option value="">Select Template</option>
                <option value="1">Template 1</option>
                <option value="2">Template 2</option>
                <option value="3">Template 3</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content URL</label>
              <input
                className="form-input"
                type="url"
                placeholder="Add YouTube or other content URL"
                value={contentURL}
                onChange={(e) => setContentURL(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tags-container">
                {tags.map((tag, index) => (
                  <span className="tag-chip" key={index}>
                    #{tag} <span onClick={() => handleDeleteTag(index)} className="tag-delete">×</span>
                  </span>
                ))}
              </div>
              <div className="tag-input-container">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="tag-add-button"
                  onClick={handleAddTag}
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Featured Image</label>
              <div 
                className={`media-drop-area ${imagePreview ? 'has-preview' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDragLeave={() => {}}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageChange(e);
                }}
              >
                {imagePreview ? (
                  <div className="media-preview-item">
                    <img className="media-preview" src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-media-btn"
                      onClick={() => {
                        setImagePreview(null);
                        setImage(null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <FaImage />
                    </div>
                    <p>Drag & drop image here or <label className="file-label">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input-hidden"
                      />
                    </label></p>
                    <p className="upload-hint">Upload an image (max 50MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="template-preview-section">
              <h3 className="preview-title">Template Preview</h3>
              <div className="template-preview-container">
                {/* Template previews - keep your existing template preview code */}
                <div className="template template-1">
                  <p className='template_id_one'>template 1</p>
                  <p className='template_title'>{title || "Title Preview"}</p>
                  <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                  <p className='template_description'>{category}</p>
                  <hr></hr>
                  <p className='template_description'>{description || "Description Preview"}</p>
                  <div className="tags_preview">
                    {tags.map((tag, index) => (
                      <span key={index} className="tagname">#{tag}</span>
                    ))}
                  </div>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
                  {contentURL && (
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      className="iframe_preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
                <div className="template template-2">
                  <p className='template_id_one'>template 2</p>
                  <p className='template_title'>{title || "Title Preview"}</p>
                  <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                  <p className='template_description'>{category}</p>
                  <hr></hr>
                  <p className='template_description'>{description || "Description Preview"}</p>
                  <div className="tags_preview">
                    {tags.map((tag, index) => (
                      <span key={index} className="tagname">#{tag}</span>
                    ))}
                  </div>
                  <div className='preview_part'>
                    <div className='preview_part_sub'>
                      {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
                    </div>
                    <div className='preview_part_sub'>
                      {contentURL && (
                        <iframe
                          src={getEmbedURL(contentURL)}
                          title="Content Preview"
                          className="iframe_preview_new"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  </div>
                </div>
                <div className="template template-3">
                  <p className='template_id_one'>template 3</p>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
                  {contentURL && (
                    <iframe
                      src={getEmbedURL(contentURL)}
                      title="Content Preview"
                      className="iframe_preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                  <p className='template_title'>{title || "Title Preview"}</p>
                  <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
                  <p className='template_description'>{category}</p>
                  <hr></hr>
                  <p className='template_description'>{description || "Description Preview"}</p>
                  <div className="tags_preview">
                    {tags.map((tag, index) => (
                      <span key={index} className="tagname">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" className="submit-button" style={{ 
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)" 
            }} disabled={isSubmitting}>
              <span className="button-text">{isSubmitting ? 'Creating...' : 'Create Learning Plan'}</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;