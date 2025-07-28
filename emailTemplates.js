/**
 * Generates a professional HTML email template for password reset requests.
 * @param {object} data - The data for the template.
 * @param {string} data.resetUrl - The URL for the user to reset their password.
 * @returns {string} The complete HTML for the email.
 */
export const generatePasswordResetEmail = ({ resetUrl }) => {
  const emailStyles = `
    /* Reset and base styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 20px;
      color: #333;
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1);
      position: relative;
    }
    
    .email-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
      z-index: 10;
    }
    
    .header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 40px 24px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
      animation: pulse 6s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.1); }
    }
    
    .header img {
      max-width: 180px;
      height: auto;
      position: relative;
      z-index: 2;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }
    
    .content {
      padding: 48px 40px;
      line-height: 1.7;
      font-size: 16px;
      background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
      position: relative;
    }
    
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    }
    
    .content p {
      margin: 0 0 20px 0;
      color: #374151;
    }
    
    .content p:first-child {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .button-container {
      text-align: center;
      margin: 32px 0;
      position: relative;
    }
    
    .reset-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      cursor: pointer;
    }
    
    .reset-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .reset-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
      color: #ffffff !important;
      text-decoration: none !important;
    }
    
    .reset-button:hover::before {
      left: 100%;
    }
    
    .reset-button:active {
      transform: translateY(0px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }
    
    .security-notice {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #92400e;
    }
    
    .security-notice p {
      margin: 0 !important;
    }
    
    .footer {
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      padding: 32px 24px;
      text-align: center;
      font-size: 13px;
      color: #d1d5db;
      position: relative;
      overflow: hidden;
    }
    
    .footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #4b5563, transparent);
    }
    
    .footer p {
      margin: 8px 0;
      position: relative;
      z-index: 2;
    }
    
    .footer a {
      color: #93c5fd;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .footer a:hover {
      color: #dbeafe;
    }
    
    .brand-signature {
      font-weight: 600;
      background: linear-gradient(90deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: #667eea; /* Fallback for browsers that don't support background-clip */
    }
    
    /* Mobile responsive styles */
    @media only screen and (max-width: 640px) {
      body {
        padding: 10px;
      }
      
      .content {
        padding: 32px 24px;
      }
      
      .reset-button {
        padding: 14px 24px;
        font-size: 15px;
      }
      
      .header {
        padding: 32px 20px;
      }
    }
    
    /* Email client specific fixes */
    @media only screen and (max-width: 480px) {
      .email-container {
        border-radius: 8px;
      }
      
      .content {
        padding: 24px 20px;
      }
      
      .header {
        padding: 24px 16px;
      }
      
      .footer {
        padding: 24px 16px;
      }
    }
    
    /* Outlook specific fixes */
    .reset-button[href] {
      color: #ffffff;
      text-decoration: none;
    }
    
    /* Additional button styling for better email client support */
    table.button-table {
      border-spacing: 0;
      border-collapse: collapse;
      margin: 0 auto;
    }
    
    table.button-table td {
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    table.button-table a {
      display: block;
      padding: 16px 32px;
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 600;
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 12px;
    }
  `;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Password Reset Request</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        ${emailStyles}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="YOUR_LOGO_URL_HERE" alt="B2B Travel Platform Logo">
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset the password for your account. You can reset your password by clicking the button below:</p>
          
          <div class="button-container">
            <!-- Button with fallback table for better email client support -->
            <!--[if mso]>
            <table class="button-table" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <a href="${resetUrl}" style="color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Reset Your Password</a>
                </td>
              </tr>
            </table>
            <![endif]-->
            <!--[if !mso]><!-->
            <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
            <!--<![endif]-->
          </div>
          
          <div class="security-notice">
            <p>If you did not request a password reset, please ignore this email. This password reset link is only valid for the next 60 minutes.</p>
          </div>
          
          <p>Thanks,<br><span class="brand-signature">The B2B Travel Platform Team</span></p>
        </div>
        <div class="footer">
          <p>Created by Harshal Baviskar | <a href="http://travel.0-4.nl">travel.0-4.nl</a></p>
          <p>&copy; ${new Date().getFullYear()} B2B Travel Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};