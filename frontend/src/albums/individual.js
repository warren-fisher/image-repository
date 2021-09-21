import React, { useEffect, useState, useCallback } from 'react';
import Image from '../image.js';

import {Card} from '@shopify/polaris';

/**
 * @param {} props.token our token
 * @param {str} props.album, the album name
 * @param {str} props.files, the files to display
 */
export default function IndividualAlbum(props) {
    const [fileCount, setFileCount] = useState(1);

    // Set file count on initial load
    useEffect(() => 
    {
        setFileCount(Object.keys(props.files).length);
    }, [props.files])

    const decreaseFileCount = useCallback(() => {
        setFileCount(fileCount - 1);
    }, [fileCount]);

    // Empty albums happen if they were deleted from
    if (fileCount === 0) 
    {
        return null;
    }

    return (
        <div className="album">
            <Card title={props.album === "undefined" ? "Public album" : props.album} sectioned>
                { Object.keys(props.files).map((image, j) =>
                    (<Image decreaseFileCount={decreaseFileCount} token={props.token} image_name={image} 
                        ours={props.files[image]["ours"]} album_name={props.album} key={j}/>))}
            </Card>
        </div>
    );
}