# Image hosting web app
This web application was created as part of the shopify backend challenge.
It is hosted at (images.warrenfisher.net)[https://images.warrenfisher.net]

## Features
- Can upload a file, either by drag and drop into the file zone or
    by clicking and using file selector
    - Can view single images uploaded at the 'gallery' tab
- Uploading multiple files creates an album
    - Can view albums at the 'albums' tab
- Users can optionally create an account
    - User passwords are hashed and then sent to the backend for storage in a database
    - API returns a user authentication token, which the frontend will include with subsequent requests
- Files or albums can be made private (if you have an account) so only you can see them

## Development

- An uploads/albums folder must exist in the root
- Go to api/ and run `python app.py`
- Go to frontend/ and run `npm run start`

## Database
MySQL database diagram
![MySQL diagram](api/db.png)

## Dependencies 
The main dependencies are listed below
### API / backend
- Python
- MySQL
- SQLAlchemy
- pymysql
### Frontend
- React
- react-router-dom 
- shopify-polaris