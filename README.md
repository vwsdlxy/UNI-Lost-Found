# UNI LOST & FOUND SYSTEM
## TABLE OF CONTENTS
1. Features
2. Technologies Used
3. Local Installation
4. Test Credentials
5. Live Demo
6. License

## FEATURES
- User authentication with UNI email validation
- Report lost or found items
- Browse all items with category and status filters
- Personal dashboard for user's own reports
- Mark items as claimed
- Delete reports
- Responsive design for mobile devices

Quick Tips: Email input in contact information section when submitting a report should match with logged-in email.

## TECHNOLOGIES USED
- HTML5
- CSS3 (Flexbox & Grid)
- JavaScript (ES6+)
- Font Awesome 6
- Google Fonts

## LOCAL INSTALLATION 
1. Install required software 
- Node.js
- MySQL
- Git
- VS Code (optional)
2. Download the folder UNI_Lost_Found
3. Start MySQL
4. Create database (lost_found_db) and run each section
5. Download dependencies in both frontend and backend folder
```bash
npm install 
```
6. Create .env file (follow example given in folder)
7. Start server
```bash
node server.js
```
8. Open index.html in your browser

## TEST CREDENTIALS
Login with your UNI email

Tips: login credentials were set in database. You can use the credentials below to login:
  
>> email: johnsmith@uni.edu.my
>>password: john123
  
or any existing account in database.

## LIVE DEMO
Access the application here: https://vwsdlxy.github.io/UNI-Lost-Found/index.html

## LICENSE
MIT
