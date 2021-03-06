from sqlalchemy import create_engine
from sqlalchemy.sql import select, text

from cred_mysql import credentials

engine = create_engine(
    f"mysql+pymysql://{credentials['username']}:{credentials['password']}@localhost/imagerepository",
     echo=True)

def get_files(user_code=None):
    """Get all files that a user can view"""

    if user_code is None:
        s = text("""SELECT P_NAME, U_CODE FROM photos WHERE P_PRIVATE = 0 AND A_ID IS NULL""")
        result = engine.connect().execute(s)

    s = text("""SELECT P_NAME, U_CODE FROM photos WHERE (P_PRIVATE = 0 OR U_CODE = :x) AND A_ID IS NULL""")
    result = engine.connect().execute(s, x=user_code)

    files = {}
    
    for row in result:
        files[row[0]] = {'ours': (True if (user_code and row[1]==user_code) else False)}

    # Returns dictionary filename -> {private: boolean}
    return files

def get_albums(user_code=None):
    """
    Get all albums that a user can view

    Arguments:
        username {string} -- The user accessing the albums
    """

    if user_code is None:
        s = text("""SELECT A_NAME, P_NAME, photos.U_CODE FROM albums INNER JOIN photos ON albums.A_ID = photos.A_ID
             WHERE P_PRIVATE = 0""")
        result = engine.connect().execute(s)
    else:
        s = text("""SELECT A_NAME, P_NAME, photos.U_CODE FROM albums INNER JOIN photos ON albums.A_ID = photos.A_ID
                WHERE P_PRIVATE = 0 OR photos.U_CODE = :x""")
        result = engine.connect().execute(s, x=user_code)

    albums = {}

    for row in result:
        try:
            albums[row[0]]
        except KeyError:
            albums[row[0]] = {}

        albums[row[0]][row[1]] = {'ours': (True if (user_code and row[2]==user_code) else False)}
        
    # Returns dictionary albumname -> dictionary of filename -> {private: boolean}
    return albums

def delete_file_record(filename, user_code):
    """
    Delete a file's record from the database if the user owns it

    Arguments:
        filename {string} -- the filename to delete
        user_code {int} -- the users code in the database
    Returns:
        {bool} if the user was allowed to delete that file or not
    """
    if user_code is None:
        return False
        
    s = text("""DELETE FROM photos WHERE A_ID IS NULL AND P_NAME = :x AND U_CODE = :y""")
    result = engine.connect().execute(s, x=filename, y=user_code)
        
    return (True if result.rowcount else False)

def delete_file_album_record(albumname, filename, user_code):
    """
    Delete a file from an album if ther user owns it

    Arguments:
        albumname {string} -- the album to delete from
        filename {string} -- the filename to delete
        user_code {int} -- the users code in the database
    Returns:
        {bool} if the user was allowed to delete that file or not
    """
    if user_code is None:
        return False
        
    s = text("""DELETE photos FROM photos JOIN albums USING(A_ID) WHERE A_NAME = :x AND P_NAME = :y AND photos.U_CODE = :z""")
    result = engine.connect().execute(s, x=albumname, y=filename, z=user_code)
    
    if (result.rowcount):
        # Left join so we get stuff in albums not in photos
        # Only select stuff which dont have a photo name, ie empty album
        # Delete that album if correct user permissions
        s = text("""DELETE albums FROM albums LEFT JOIN photos USING(A_ID) WHERE P_NAME IS NULL 
                    AND albums.U_CODE = :x AND albums.A_NAME = :y""")                     
        result = engine.connect().execute(s, x=user_code, y=albumname)
        
        # File deleted, album deleted
        return (True, (True if result.rowcount else False))
    
    # File delete, album delete (neither)
    return (False, False)

def get_user_code(username):
    """
    Get a user's ID code

    Arguments:
        username {string} -- The user
    """
    s = text("""SELECT U_CODE FROM users where U_NAME like :x""")
    result = engine.connect().execute(s, x=username)

    for row in result:
        return row[0]
    return None

def get_album_code(album_name):
    """
    Get an album's ID code

    Arguments:
        album_name {string} -- The album name
    """
    s = text("""SELECT A_ID FROM albums where A_NAME like :x""")
    result = engine.connect().execute(s, x=album_name)

    for row in result:
        return row[0]
    return None

def create_file_record(filename, private, user_code=None, album_code=None):
    """
    Add the specified file to the MySQL database, for access control reasons

    Arguments:
        username {string} -- The user creating the file
        filename {string} -- The file's name
        private {bool} -- Whether or not the file is private (only the user can see)
    """
    bool_code = 1 if private else 0

    if user_code is None and album_code is None:
        s = text("""INSERT INTO photos (P_PRIVATE, P_NAME) VALUES (:y, :z)""")
        result = engine.connect().execute(s, y=bool_code, z=filename)
    elif album_code is None:
        s = text("""INSERT INTO photos (U_CODE, P_PRIVATE, P_NAME) VALUES (:x, :y, :z)""")
        result = engine.connect().execute(s, x=user_code, y=bool_code, z=filename)
    else:
        if user_code is None:
            s = text("""INSERT INTO photos (A_ID, P_PRIVATE, P_NAME) VALUES (:a, :y, :z)""")
            result = engine.connect().execute(s, a=album_code, y=bool_code, z=filename)
        else:
            s = text("""INSERT INTO photos (A_ID, U_CODE, P_PRIVATE, P_NAME) VALUES (:a, :x, :y, :z)""")
            result = engine.connect().execute(s, a=album_code, x=user_code, y=bool_code, z=filename)

    return

def create_album_record(album_name, private, user_code=None):
    """
    Add the specified album to the MySQL database, for access control reasons

    Arguments:
        username {string} -- The user creating the album
        album_name {string} -- The album's name
        private {bool} -- Whether or not the album is private (only the user can see)
    Returns:
        album_code {integer} -- The album's code
    """
    bool_code = 1 if private else 0

    if user_code is None:
        s = text("""INSERT INTO albums (A_PRIVATE, A_NAME) VALUES (:y, :z)""")
        result = engine.connect().execute(s, y=bool_code, z=album_name)
    else:
        s = text("""INSERT INTO albums (U_CODE, A_PRIVATE, A_NAME) VALUES (:x, :y, :z)""")
        result = engine.connect().execute(s, x=user_code, y=bool_code, z=album_name)

    return get_album_code(album_name)

# TODO: verify username, password that they do not contain invalid characters
def create_user(username, password):
    """
    Create a new user account based on the credentials

    Arguments:
        username {string} -- The user
        password {string} -- The password
    """
    s = text("""INSERT INTO users (U_NAME, U_PSWD) VALUES (:x, :y)""")

    result = engine.connect().execute(s, x=username, y=password)
    return

def login_user(username, password):
    """
    Attempt to login with a username and password combination

    Arguments:
        username {string} -- The user
        password {string} -- The password
    """
    s = text("""SELECT * FROM users WHERE U_NAME LIKE :x AND U_PSWD LIKE :y""")
    result = engine.connect().execute(s, x=username, y=password)

    res = result.first()

    if res is None:
        return 'failure'
    return 'success'

def is_available_check(result):
    """
    Helper method for checking the availability of username, album name, or photo name

    Arguments
        results -- The result from a query to the database engine
    """
    is_available = True

    for res in result:
        # If there is a result then this name is taken
        is_available = False
        break

    return is_available

def check_user_name(username):
    """
    Check if a username is available for use

    Arguments:
        username {string} -- The user
    """
    s = text("""SELECT * FROM users where U_NAME like :x""")

    result = engine.connect().execute(s, x=username)
    return is_available_check(result)

def check_album_name(album_name):
    """
    Check if an album name is available for use

    Arguments:
        album_name {string} -- The album name
    """
    s = text("""SELECT * FROM albums where A_NAME like :x""")

    result = engine.connect().execute(s, x=album_name)
    return is_available_check(result)

def check_photo_name(photo_name):
    """
    Check if a photo name is available for use

    Arguments:
        photo_name {string} -- The photo name
    """
    s = text("""SELECT * FROM photos where P_NAME like :x AND A_ID IS NULL""")

    result = engine.connect().execute(s, x=photo_name)
    return is_available_check(result)