import React, { useState } from 'react';
import './ContactSupport.css'; // Make sure this is created and imported

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="contact-container">
      <h2 className="contact-title">📞 Contact Support</h2>

      <div className="contact-content">
        {/* Contact Info */}
        <div className="contact-info">
          <p><strong>📱 Phone:</strong> +233 24 209 4530</p>
          <p><strong>💬 WhatsApp:</strong> +233 55 417 4033</p>
          <p><strong>📧 Email 1:</strong> <a href="mailto:deligmini@yahoo.com">deligmini@yahoo.com</a></p>
          <p><strong>📧 Email 2:</strong> <a href="mailto:deligmini95@gmail.com">deligmini95@gmail.com</a></p>
        </div>

        {/* Form */}
        <div className="contact-form">
          <h3>📬 Send Us a Message</h3>

          {submitted ? (
            <div className="success-message">✅ Thank you! Your message has been sent.</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label>
                Your Name
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </label>

              <label>
                Your Email
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </label>

              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                />
              </label>

              <label>
                Message
                <textarea
                  name="message"
                  rows="4"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                ></textarea>
              </label>

              <button type="submit">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
