import React, { useEffect, useState, useCallback } from 'react';
import Image from '../image.js';

import {Card} from '@shopify/polaris';

import api_endpoint from '../config.js';

/**
 * 
 * @param {str} props.token, the user token
 */
export default function Album(props) {

    const [uploadedAlbums, setUploadedAlbums] = useState([]);

    const getState = useCallback(
        () => {
            return fetch(`${api_endpoint}/get/albums`, {
                headers: {
                    'token': props.token
                }
            });
        },
        [props.token]);

    useEffect(() => {
        getState()
            .then(response => response.json())
            .then(data => setUploadedAlbums(data))
            .catch(error => console.error(error));
    }, [useCallback])

    let albumKeys = Object.keys(uploadedAlbums);

    return (

        <div id="albums">

            { albumKeys.map((album, i) => {

                return (
                    <div className="album" key={i}>
                    <Card title={album == "undefined" ? "Public album" : album} sectioned>
                        {uploadedAlbums[album].map((image_name, j) => <Image image_name={image_name} key={j} album_name={album}/>)}
                    </Card>
                    </div>
                );

            }
            )}

        </div>
    );
}