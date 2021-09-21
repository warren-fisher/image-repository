import React, { useEffect , useState} from 'react';
import Image from '../image.js';

import {useCallback} from 'react';

import api_endpoint from '../config.js';

/**
 *
 * @param {str} props.token, the user token
 */
export default function Gallery(props) {

    const [uploadedFiles, setUploadedFiles] = useState([]);

    const getState = useCallback(()=>
    {
        return fetch(`${api_endpoint}/get/files`, {
            headers: {
                'token': props.token
            }
        });
    }, [props.token]);

    useEffect(() => {
        getState()
            .then(response => response.json())
            .then(data => setUploadedFiles(data))
            .catch(error => console.error(error));
    }, [getState]);

    return (
        <div id="imgs">
            { Object.keys(uploadedFiles).map((image, i) =>
                (<Image image_name={image} ours={uploadedFiles[image]["ours"]} key={i}/>))}
        </div>
    );
}