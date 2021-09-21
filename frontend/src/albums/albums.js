import React, { useEffect, useState, useCallback } from 'react';

import IndividualAlbum from './individual.js';

import api_endpoint from '../config.js';

/**
 * 
 * @param {str} props.token, the user token
 */
export default function Albums(props) {

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
            .then(data => 
                {
                    setUploadedAlbums(data);
                })
            .catch(error => console.error(error));
    }, [getState])

    let albumKeys = Object.keys(uploadedAlbums);

    return (
        <div id="albums">
            { albumKeys.map((album, i) => {
                return <IndividualAlbum token={props.token} files={uploadedAlbums[album]} album={album} key={i}/>
            })}
        </div>
    );
}