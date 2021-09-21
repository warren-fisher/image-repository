# Image hosting web app
This web application was created as part of the shopify backend challenge.
It is hosted at (images.warrenfisher.net)[https://images.warrenfisher.net]

## Features
- [x] Can upload a file, either by drag and drop into the file zone or
    by clicking and using file selector
    - Can view single images uploaded at the 'gallery' tab
- [x] Can upload multiple files and name it as an album
    - Can view albums at the 'albums' tab
- [x] Users can optionally create an account
    - User passwords are hashed and then sent to the backend for storage in a database
    - API returns a user authentication token, which the frontend will include with subsequent requests
- [x] If a user is logged in they can make file or album uploads private so only they can see them
- [x] If a user was logged in when they uploaded a file or album, they can delete the file(s)

## Example testing scenario
1. Upload a file when not logged in
2. Click image gallery to see this image
3. Go click login, and register for an account
4. Once registered you will be automatically logged in
5. Go to upload your images and upload an album
6. Enter an album name and mark it as private
7. Go to albums tab and see your pictures. 
8. Delete one picture from the album (permenant).
9. If you log out you wont be able to see this album anymore since it was private
10. Log back in and see that this album is still available, minus the one picture you deleted

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