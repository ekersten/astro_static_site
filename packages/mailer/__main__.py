import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def main(args):
    """
    DigitalOcean Serverless Function
    Sends an email notification when a phone number is received
    """
    
    # Extract phone number from parameters
    phone_number = args.get('phone_number') or args.get('phoneNumber')
    
    if not phone_number:
        return {
            'statusCode': 400,
            'body': 'Missing required parameter: phone_number'
        }
    
    # Email configuration from environment variables
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    email_user = os.environ.get('EMAIL_USER')
    email_pass = os.environ.get('EMAIL_PASS')
    notification_email = os.environ.get('NOTIFICATION_EMAIL', email_user)
    
    if not email_user or not email_pass:
        return {
            'statusCode': 500,
            'body': 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS environment variables.'
        }
    
    try:
        # Create message
        message = MIMEMultipart()
        message['From'] = email_user
        message['To'] = notification_email
        message['Subject'] = 'New Phone Number Received!'
        
        # Email body
        html_body = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New Phone Number Notification</h2>
            <p>A new phone number has been received:</p>
            <p style="font-size: 18px; font-weight: bold; color: #2c3e50;">
                {phone_number}
            </p>
            <p style="color: #7f8c8d; font-size: 12px;">
                Received at: {__import__('datetime').datetime.now().isoformat()}
            </p>
        </div>
        """
        
        text_body = f"New phone number received: {phone_number}"
        
        message.attach(MIMEText(text_body, 'plain'))
        message.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(email_user, email_pass)
            server.send_message(message)
        
        return {
            'statusCode': 200,
            'body': f'Email sent successfully for {phone_number}'
        }
        
    except Exception as error:
        print(f'Error sending email: {error}')
        return {
            'statusCode': 500,
            'body': f'Failed to send email: {str(error)}'
        }