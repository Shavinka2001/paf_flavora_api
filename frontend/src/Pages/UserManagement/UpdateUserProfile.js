import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import '../PostManagement/AddNewPost.css'; // Import the CSS file

function UpdateUserProfile() {  // Function to fetch user details from backend
  const { id } = useParams();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    bio: '',
  }); // State variables
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [pictureRemoved, setPictureRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [skillInput, setSkillInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Function to handle drag and drop

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  useEffect(() => {
    fetch(`http://localhost:8080/user/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then((data) => {
        setFormData(data);
        setProfilePicture(null);
        setPreviewImage(null);
        setPictureRemoved(false);
      })
      .catch((error) => console.error('Error:', error));
  }, [id]);

  const handleInputChange = (e) => { // Function to handle input changes`
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => { // Function to handle profile picture change
    const file = e.target.files[0];
    if (file) {
      setPictureRemoved(false);
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => { // Function to remove profile picture
    setPreviewImage(null);
    setProfilePicture(null);
    setPictureRemoved(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const response = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          removeProfilePicture: pictureRemoved && !profilePicture,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile information');
      }

      if (profilePicture) {
        const pictureFormData = new FormData();
        pictureFormData.append('file', profilePicture);

        const pictureResponse = await fetch(`http://localhost:8080/user/${id}/uploadProfilePicture`, {
          method: 'PUT',
          body: pictureFormData,
        });

        if (!pictureResponse.ok) {
          throw new Error('Failed to upload profile picture');
        }
      } else if (pictureRemoved) {
        const deleteResponse = await fetch(`http://localhost:8080/user/${id}/removeProfilePicture`, {
          method: 'DELETE',
        });

        if (!deleteResponse.ok) {
          throw new Error('Failed to remove profile picture');
        }
      }

      alert('Profile updated successfully!');
      window.location.href = '/userProfile';
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (previewImage) return previewImage;
    if (formData.profilePicturePath) {
      return `http://localhost:8080/uploads/profile/${formData.profilePicturePath}?t=${new Date().getTime()}`;
    }
    return null;
  };

  const profileImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '8px',
  };

  return (
    <div className="post-creation-page">
      <NavBar />
      <div className="post-creation-container" style={{ marginTop: "80px" }}>
        <div className="post-form-card">
          <h1 className="form-title">Update Profile</h1>
          <p className="form-subtitle">Edit your personal information and skills</p>

          <form onSubmit={handleSubmit} className="modern-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => {
                  const re = /^[0-9\b]{0,10}$/;
                  if (re.test(e.target.value)) {
                    handleInputChange(e);
                  }
                }}
                maxLength="10"
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <div className="tags_preview">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="tagname">
                    #{skill}
                    <span
                      onClick={() => handleRemoveSkill(skill)}
                      className="remove-tag"
                    > ×</span>
                  </span>
                ))}
              </div>
              <div className="skill-input-container">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Add a new skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                />
                <button
                  type="button"
                  className="add-skill-button"
                  onClick={handleAddSkill}
                >
                  <IoMdAdd />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                name="bio"
                placeholder="Write something about yourself"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Picture</label>
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
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    setPictureRemoved(false);
                    setProfilePicture(file);
                    const reader = new FileReader();
                    reader.onload = () => setPreviewImage(reader.result);
                    reader.readAsDataURL(file);
                  } else {
                    alert('Please upload an image file');
                  }
                }}
              >
                {(previewImage || (formData.profilePicturePath && !pictureRemoved)) ? (
                  <div className="media-preview-item" style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
                    <img
                      src={getProfileImageUrl()}
                      alt="Profile"
                      style={profileImageStyle}
                      onError={(e) => {
                        console.error("Image failed to load");
                        e.target.src = "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                    <button
                      type="button"
                      className="remove-media-btn"
                      onClick={handleRemoveProfilePicture}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Drag & drop your profile picture here or <label className="file-label">
                      browse
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="file-input-hidden"
                      />
                    </label></p>
                    <p className="upload-hint">Supported formats: JPG, PNG, GIF</p>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
              disabled={isUploading}
            >
              <span className="button-text">
                {isUploading ? "Updating Profile..." : "Update Profile"}
              </span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserProfile;
