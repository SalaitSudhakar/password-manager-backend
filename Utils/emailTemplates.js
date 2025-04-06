export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { color: #065F46; font-family: Arial, sans-serif; }
                .container { padding: 20px; border: 2px solid #047857; background: #D1FAE5; border-radius: 10px; max-width: 600px; margin: auto; }
                a { color: #047857; font-weight: bold; }
                a:hover {
                  color: #184545;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>Dear {{name}},</p>
                <p>We received a request to reset your password. Click the link below to set a new password:</p>
                <p><a href="{{resetLink}}">Reset Password</a></p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best,<br>The {{your company name}} Team</p>
            </div>
        </body>
        </html>

`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { background-color: #E6FFFA; color: #065F46; font-family: Arial, sans-serif; }
            .container { padding: 20px; border: 2px solid #047857; background: #D1FAE5; border-radius: 10px; max-width: 600px; margin: auto; }
            a { color: #047857; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <p>Dear {{name}},</p>
            <p>Congratulations! Your Password has been updated successfully.</p>
            <p>You can now log in and enjoy our services: <a href="{{Login Link}}">Login</a></p>
            <p>Best,<br>The {{your Company Name}} Team</p>
        </div>
    </body>
    </html>
    `

export const EMAIL_VERIFY_TEMPLATE = `
 
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { color: #065F46; font-family: Arial, sans-serif; }
            .container { padding: 20px; border: 2px solid #047857; background: #D1FAE5; border-radius: 10px; max-width: 600px; margin: auto; }
            a { color: #047857; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <p>Dear {{name}},</p>
            <p>Your OTP for email verification is: <strong><br />{{otp}}</strong></p>
            <p>Please enter this code on the verification page to complete your registration.</p>
            <p>This code is valid for 15 minutes.</p>
            <p>Best,<br>The {{Your Company Name}} Team</p>
        </div>
    </body>
    </html>
`;

export const WELCOME_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { color: #065F46; font-family: Arial, sans-serif; }
        .container { padding: 20px; border: 2px solid #047857; background: #D1FAE5; border-radius: 10px; max-width: 600px; margin: auto; }
        a { color: #047857; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <p>Dear {{name}},</p>
        <p>Thank you for signing up with {{Your Company Name}}! We&#39<!-- apostrophe entity --></-->re excited to have you on board.</p>
        <p>Get started by exploring our platform: <a href="{{front end link}}">Visit Our site</a></p>
        <p>If you have any questions, feel free to reach out.</p>
        <p>Best,<br>The {{Your Company Name}} Team</p>
    </div>
</body>
</html>
`;

export const EMAIL_VERIFY_SUCCESS_TEMPLATE = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { background-color: #E6FFFA; color: #065F46; font-family: Arial, sans-serif; }
            .container { padding: 20px; border: 2px solid #047857; background: #D1FAE5; border-radius: 10px; max-width: 600px; margin: auto; }
            a { color: #047857; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <p>Dear {{name}},</p>
            <p>Congratulations! Your email has been successfully verified.</p>
            <p>You can now log in and enjoy our services: <a href="{{Login Link}}">Login</a></p>
            <p>Best,<br>The {{Your Company Name}} Team</p>
        </div>
    </body>
    </html>
`