import api_endpoint from './config.js';

import {MediaCard} from '@shopify/polaris';

/**
 * Function component for displaying an image
 *
 * @param {str} props.image_name, name of the file
 * @param {str} props.album_name, name of the album (if the image is from an album)
 */
function Image(props) {

    let url;
    // If this image is from an album the API endpoint for retrieving it is slightly different
    if (props.album_name) {
        url = `${api_endpoint}/get/albums/${props.album_name}`;
    } else {
        url = `${api_endpoint}/get/files`;
    }

    return (
        <div class="image-container">
            <MediaCard
                title={props.image_name}
            >
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