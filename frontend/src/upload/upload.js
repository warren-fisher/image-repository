import React, {useState, useCallback} from 'react';

import {DropZone, Stack, Thumbnail, Caption, Banner, List} from '@shopify/polaris';

import api_endpoint from '../config.js';

/**
 *
 * @param {*} props.token, the user token
 */
export default function Upload(props) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const [albumName, setAlbumName] = useState("");
    const [isPrivate, setPrivate] = useState(false);

    const [isDuplicate, setDuplicate] = useState(false);

    // Error for not allowed files
    const hasError = rejectedFiles.length > 0;

    const hasErrorAddAlbumName = selectedFiles.length > 1 && albumName === "";

    const handleSubmission = e => {
        e.preventDefault();
        const formData = new FormData();
        setDuplicate(false);

        if (selectedFiles.length === 0) {
            // Do nothing if no files
            return
        }
        else if (selectedFiles.length === 1) {
            formData.append("File", selectedFiles[0]);
            formData.append("private", isPrivate);

            fetch(`${api_endpoint}/post/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'token': props.token }
            })
                .then((response) => {
                    if (response.ok)
                    {
                        return response.json();
                    }
                    if (response.status === 409)
                    {
                        // We tried to upload a file that was a duplicate of an existing file
                        setSelectedFiles([]);
                        setDuplicate(true);
                        return
                    }
                    return Promise.reject(response);
                })
                .then((data) => {
                    if (data === "success")
                    {
                        setSelectedFiles([]);
                    }
                })
                .catch(error => {
                        console.error(error)
                });

        } else {
            // Don't let the user submit with no album name if they have multiple files
            if (albumName === "")
            {
                return 
            }

            for (var i = 0; i < selectedFiles.length; i++) {
                formData.append("album[]", selectedFiles[i]);
            }

            formData.append("album_name", albumName);
            formData.append("private", isPrivate);

            fetch(`${api_endpoint}/post/upload/album`, {
                method: 'POST',
                body: formData,
                headers: {'token': props.token}
            })
                .then(response => response.json())
                .then(data => 
                    {
                        if (data === "success")
                        {
                            setSelectedFiles([]);
                            setAlbumName("");
                        }
                    })
                .catch(error => console.error(error));
        }
    }

    const handleDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
          setSelectedFiles((files) => [...files, ...acceptedFiles]);
          setRejectedFiles(rejectedFiles);
        },
        []);

    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

    const fileUpload = !selectedFiles.length && <DropZone.FileUpload />;
    const uploadedFiles = selectedFiles.length > 0 && (
        <Stack vertical>
        {selectedFiles.map((file, index) => (
            <Stack alignment="center" key={index}>
            
            <Thumbnail
                size="small"
                alt={file.name}
                source={
                validImageTypes.includes(file.type)
                    ? window.URL.createObjectURL(file)
                    : ""
                }
            />
            <div>
                {file.name} <Caption>{file.size} bytes</Caption>
            </div>
            </Stack>
        ))}
        </Stack>);

    const errorMessage = hasError && (
        <Banner
          title="The following images couldn&#39;t be uploaded:"
          status="critical"
        >
          <List type="bullet">
            {rejectedFiles.map((file, index) => (
              <List.Item key={index}>
                {`"${file.name}" is not supported. File type must be .gif, .jpg, .png or .svg.`}
              </List.Item>
            ))}
          </List>
        </Banner>
      );

    const errorEnterAlbum = hasErrorAddAlbumName && (
        <Banner
          title="You must enter an album name when uploading multiple images"
          status="critical"/>
      );

    const errorHasDuplicate = isDuplicate && (
        <Banner
          title="A file you tried to upload was a duplicate, ignoring"
          status="critical"/>
      );

    return (
        <div id="upload">
            <h1> Upload new image(s)</h1>
            <form method="post" encType="multipart/form-data">
                <p> Select file(s) to upload </p>
                {errorHasDuplicate}
                {errorEnterAlbum}
                {errorMessage}
                <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                    {uploadedFiles}
                    {fileUpload}
                </DropZone>

                {selectedFiles.length > 1 ? 
                <label>
                    <p>When you upload multiple files you must include an album name (alphanumeric characters only)</p>
                    <input type="text" name="albumname" onChange={e => setAlbumName(e.target.value)} />
                </label>
                : null
                }   

                {/* User can only view private file toggle if they are logged in */}
                {   props.token ?
                    <label>
                        <p>Would you like your file(s) to be private?</p>
                        <input type="checkbox" name="private" onChange={e => setPrivate(e.target.value)} />
                    </label>
                    :
                    true
                }

                <label>
                    <p>Upload your file(s) when you are ready</p>
                    <input type="submit" value="Upload" onClick={handleSubmission} />
                </label>
            </form>
        </div>
    )
}