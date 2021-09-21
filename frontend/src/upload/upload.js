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
    const [albumName, setAlbumName] = useState();
    const [isPrivate, setPrivate] = useState(false);
    const hasError = rejectedFiles.length > 0;

    const handleSubmission = e => {
        e.preventDefault();
        const formData = new FormData();

        if (selectedFiles.length == 0) {
            // what to do if no files?

        }
        else if (selectedFiles.length == 1) {
            formData.append("File", selectedFiles[0]);
            formData.append("private", isPrivate);

            fetch(`${api_endpoint}/post/upload`, {
                method: 'POST',
                body: formData,
                headers: { 'token': props.token }
            })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error(error));

        } else {
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
                .then(data => console.log(data))
                .catch(error => console.error(error));
        }
    }

    const handleDrop = useCallback(
        (_droppedFiles, acceptedFiles, rejectedFiles) => {
          setSelectedFiles((files) => [...files, ...acceptedFiles]);
          setRejectedFiles(rejectedFiles);
        },
        [],
      );

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

    return (
        <div id="upload">
            <h1> Upload new image(s)</h1>
            <form method="post" enctype="multipart/form-data">
                <p> Select file(s) to upload </p>
                {errorMessage}
                <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                    {uploadedFiles}
                    {fileUpload}
                </DropZone>

                <label>
                    <p>If you are submitting more than one file please include an album name (alphanumeric characters only)</p>
                    <input type="text" name="albumname" onChange={e => setAlbumName(e.target.value)} />
                </label>

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