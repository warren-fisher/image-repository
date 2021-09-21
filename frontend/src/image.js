import api_endpoint from './config.js';

import {MediaCard, Button} from '@shopify/polaris';
import { useCallback, useState } from 'react';

/**
 * Function component for displaying an image
 *
 * @param {str} props.image_name, name of the file
 * @param {str} props.album_name, name of the album (if the image is from an album)
 * @param {boolean} props.ours true if this file is our file, allowing us to delete it
 * @param {} props.token our token
 * @param {} props.decreaseFileCount, if we are an album decrease the count of current files if we delete one
 */
function Image(props) {

    const [deleted, setDeleted] = useState(false);

    // If this image is from an album the API endpoint for retrieving it is slightly different than otherwise
    let url;
    if (props.album_name) {
        url = `${api_endpoint}/get/albums/${props.album_name}`;
    } else {
        url = `${api_endpoint}/get/files`;
    }

    // API endpoint to delete this file
    const deleteUrl = props.ours && (props.album_name ? 
        `${api_endpoint}/delete/file/from_album/${props.album_name}/${props.image_name}`
        :
        `${api_endpoint}/delete/file/${props.image_name}`);

    const deleteFile = useCallback(() => 
        {
            fetch(deleteUrl, {method: 'DELETE', headers: {'token': props.token}})
                .then(response => {
                    if (response.ok){
                        return response.json();
                    }
                    return Promise.reject(response);
                })
                .then(data => {
                    setDeleted(true)
                    if (props.album_name)
                    {
                        // If deleted decrease our count
                        props.decreaseFileCount();
                    }})
                .catch(error => console.error(error));

        }, [props, deleteUrl]);

    const deleteButton = props.ours && (
        <Button destructive 
            accessibilityLabel="delete-this-image"
            onClick={deleteFile}>Delete this image</Button>);

    if (deleted)
    {
        return null;
    }
    return (
        <div className="image-container">
            <MediaCard
                title={props.image_name}
                description={deleteButton}>
                <img src={`${url}/${props.image_name}`} alt={props.image_name} width="100%" height="100%"     
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                    }}/>
                
            </MediaCard>
        </div>);
}

export default Image;