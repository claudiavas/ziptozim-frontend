import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, FormHelperText } from '@mui/material';

const FileInput = ({ file, onChange, handleBlur, error }) => {
    const fileInputRef = React.useRef(null);
    const [displayFile, setDisplayFile] = useState(file);

    useEffect(() => {
        setDisplayFile(file);
    }, [file]);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
            <Box alignItems="center" gap={2}>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    name="file"
                    sx={{ mb: 2 }}
                >
                    Select Zip File
                </Button>
                <Typography variant="body1" align="center">
                    Selected file: {displayFile ? displayFile.name : 'None'}
                </Typography>
                <FormHelperText sx={{ color: 'error.main', textAlign: 'center', width: '100%' }}>
                    {error}
                </FormHelperText>
                
                {/* File input for the zip file, this component is hidden and the file is selected by clicking the button "SELECT ZIP FILE" */}
                <input
                    type="file"
                    accept=".zip"
                    name="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={onChange}
                    onBlur={handleBlur}
                />
            </Box>
    );
};

export default FileInput;
