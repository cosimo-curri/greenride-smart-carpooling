import { useState, useRef, forwardRef, useImperativeHandle } from "react";

import "../styles/FileDropZone.css";

const FileDropzone = forwardRef((props, ref) => {
    const inputRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState(null);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setFileName(null);

            if(inputRef.current)
                inputRef.current.value = "";
        }
    }));

    const handleClick = () => {
        inputRef.current.click();
    };

    const handleFile = (file) => {
        if(props.accept) {
            const acceptArray = props.accept.split(",").map((a) => a.trim().toLowerCase());
            const fileNameLower = file.name.toLowerCase();

            const isValid = acceptArray.some((type) => {
                if(type.startsWith("."))
                    return fileNameLower.endsWith(type);
                else
                    return file.type.toLowerCase() === type;
            });

            if(!isValid) {
                props.showToast(`Please upload a valid ${props.accept} file`, "error");
                return;
            }
        }

        setFileName(file.name);

        props.onFileSelect(file);
    };

    const handleChange = (e) => {
        if(e.target.files.length > 0)
            handleFile(e.target.files[0]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const files = e.dataTransfer.files;

        if(files.length > 0)
            handleFile(files[0]);
    };

    return (
        <div id="dropzone">
            <div
                onClick={ handleClick }
                onDragOver={ handleDragOver }
                onDragLeave={ handleDragLeave }
                onDrop={ handleDrop }
                className={ `dropzone ${dragOver ? "drag-over" : ""}` }
            >
                {
                    !props.moreFiles
                    ?
                    (fileName ? `Selected file: ${fileName}` : props.label)
                    :
                    props.label
                }
            </div>

            <input
                type="file"
                accept={ props.accept }
                ref={ inputRef }
                onChange={ handleChange }
            />
        </div>
    );
});

export default FileDropzone;