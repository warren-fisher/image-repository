import api_endpoint from './config.js';

import {MediaCard, Card, Button} from '@shopify/polaris';

/**
 * Function component for displaying an image
 *
 * @param {str} props.image_name, name of the file
 * @param {str} props.album_name, name of the album (if the image is from an album)
 * @param {boolean} props.ours true if this file is our file, allowing us to delete it
 */
function Image(props) {

    let url;
    // If this image is from an album the API endpoint for retrieving it is slightly different
    if (props.album_name) {
        url = `${api_endpoint}/get/albums/${props.album_name}`;
    } else {
        url = `${api_endpoint}/get/files`;
    }

    console.log(props.ours);

    const deleteButton = props.ours && (
        <Button destructive 
            accessibilityLabel="delete-this-image">Delete this image</Button>);

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
        </div>
    )
}

export default Image;