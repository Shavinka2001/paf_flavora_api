import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png';
import { IoMdAdd } from "react-icons/io";

function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        setIsAnimated(true);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

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

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.fullname.trim()) {
                alert("Full name is required");
                return;
            }
            if (!formData.email) {
                alert("Email is required");
                return;
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                alert("Email is invalid");
                return;
            }
            if (!formData.password.trim() || formData.password.length < 6) {
                alert("Password is required and must be at least 6 characters");
                return;
            }
            if (!profilePicture) {
                alert("Profile picture is required");
                return;
            }
        }
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (formData.phone.length !== 10) {
            alert("Phone number must be exactly 10 digits");
            isValid = false;
        }

        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }

        if (!formData.bio.trim()) {
            alert("Bio is required");
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id;

                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email);
                setIsVerificationModalOpen(true);
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    const StepIndicator = () => (
        <div className="step-indicator">
            <div className="step-progress">
                <div className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>
                <div className={`step-circle ${currentStep === 2 ? 'active' : ''}`}>2</div>
            </div>
        </div>
    );

    return (
        <div className="modern-container">
            <div className="background-shapes">
                <div className="bg-shape shape-circle"></div>
                <div className="bg-shape shape-donut"></div>
                <div className="bg-shape shape-square"></div>
            </div>
            
            <div className={`glass-card ${isAnimated ? 'fade-in' : ''}`}>
                <div className="card-left">
                    <div className="brand-section">
                        <div className="logo-container">
                            <div className="logo-icon">F</div>
                        </div>
                        <h2 className="brand-name">Flavora</h2>
                    </div>
                    <div 
                        className="welcome-image"
                        style={{
                            background: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80') no-repeat center",
                            backgroundSize: "cover"
                        }}
                    ></div>
                    <div className="welcome-text">
                        <h3>Join Our Community</h3>
                        <p>Create an account to share your culinary journey</p>
                    </div>
                </div>

                <div className="card-right">
                    <div className="login-header">
                        <h2>Create Account</h2>
                        <p>Step {currentStep} of 2</p>
                    </div>
                    
                    <StepIndicator />
                    
                    <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()} className="login-form">
                        {currentStep === 1 && (
                            <>
                                <div className="profile-upload-container">
                                    <div className="profile-preview-wrapper" onClick={triggerFileInput}>
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Selected Profile"
                                                className="profile-preview"
                                            />
                                        ) : (
                                            <FaUserCircle className="default-profile-icon" />
                                        )}
                                    </div>
                                    <input
                                        id="profilePictureInput"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        className="file-input-hidden"
                                    />
                                    <p className="upload-text">{previewImage ? 'Change Photo' : 'Upload Profile Picture'}</p>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="fullname">Full Name</label>
                                    <div className="input-container">
                                        <i className="input-icon">👤</i>
                                        <input
                                            type="text"
                                            id="fullname"
                                            name="fullname"
                                            value={formData.fullname}
                                            onChange={handleInputChange}
                                            required
                                            className="modern-input"
                                            placeholder="Your Full Name"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-container">
                                        <i className="input-icon">✉️</i>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="modern-input"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="input-container">
                                        <i className="input-icon">🔒</i>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="modern-input"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="button" 
                                    onClick={nextStep} 
                                    className="signin-button"
                                >
                                    Continue
                                </button>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className="input-container">
                                        <i className="input-icon">📱</i>
                                        <input
                                            type="text"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const re = /^[0-9\b]{0,10}$/;
                                                if (re.test(e.target.value)) {
                                                    handleInputChange(e);
                                                }
                                            }}
                                            maxLength="10"
                                            pattern="[0-9]{10}"
                                            required
                                            className="modern-input"
                                            placeholder="Your Phone Number"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="skills">Skills</label>
                                    <div className="modern-skills-container">
                                        <div className="skills-tags">
                                            {formData.skills.map((skill, index) => (
                                                <span className="skill-chip" key={index}>
                                                    {skill}
                                                    <button
                                                        type="button"
                                                        className="remove-skill-btn"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                    >×</button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="skills-input-row">
                                            <div className="input-container skill-input-container">
                                                <i className="input-icon">💼</i>
                                                <input
                                                    type="text"
                                                    id="skills"
                                                    value={skillInput}
                                                    onChange={(e) => setSkillInput(e.target.value)}
                                                    className="modern-input"
                                                    placeholder="Add a skill"
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={handleAddSkill} 
                                                className="add-skill-btn"
                                            >
                                                <IoMdAdd />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="bio">Bio</label>
                                    <div className="input-container">
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            required
                                            className="modern-input modern-textarea"
                                            placeholder="Tell us about yourself"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-actions register-actions">
                                    <button 
                                        type="button" 
                                        onClick={prevStep} 
                                        className="back-button"
                                    >
                                        Back
                                    </button>
                                    
                                    <button 
                                        type="submit" 
                                        className="signin-button"
                                    >
                                        Register
                                    </button>
                                </div>
                            </>
                        )}
                    </form>
                    
                    <div className="separator">
                        <span>OR</span>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                        className="google-button"
                    >
                        <img src={GoogalLogo} alt='Google' />
                        <span>Sign up with Google</span>
                    </button>
                    
                    <div className="signup-prompt">
                        <span>Already have an account?</span>
                        <button 
                            className="signup-link"
                            onClick={() => (window.location.href = '/')}
                        >
                            Sign in now
                        </button>
                    </div>
                </div>
            </div>

            {isVerificationModalOpen && (
                <div className="modern-modal-overlay">
                    <div className="modern-modal">
                        <h2>Verify Your Email</h2>
                        <p>Please enter the verification code sent to your email.</p>
                        <div className="input-container verification-input">
                            <i className="input-icon">🔑</i>
                            <input
                                type="text"
                                value={userEnteredCode}
                                onChange={(e) => setUserEnteredCode(e.target.value)}
                                placeholder="Enter verification code"
                                className="modern-input"
                            />
                        </div>
                        <button onClick={handleVerifyCode} className="signin-button">
                            Verify
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
