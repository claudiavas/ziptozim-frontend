import React, { useState, useRef, useMemo, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import axios from 'axios';
import { Button, Container, TextField, Stack, Grid, Typography, Card, CardHeader, CardContent, Box, FormHelperText, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import iso6393 from '@freearhey/iso-639-3';

// Adaptador para react-window
const height = 35; // Altura de cada opción, ajusta según sea necesario
const MenuList = (props) => {
    const { options, children, maxHeight, getValue } = props;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
        <List
            height={maxHeight}
            itemCount={children.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
            width="100%"
        >
            {({ index, style }) => <div style={style}>{children[index]}</div>}
        </List>
    );
};


export function ConvertForm() {

    const [form, setForm] = useState({
        welcomePage: '',
        favicon: '',
        language: '',
        title: '',
        description: '_',
        creator: '_',
        publisher: 'ZiptoZim',
        inputFile: null,
    });

    const [isFileReady, setIsFileReady] = useState(false);
    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [serverError, setServerError] = useState("");
    const [confirmationMessage, setConfirmationMessage] = useState("");


    const validateField = (name) => {
        let tempErrors = { ...errors };

        switch (name) {
            case 'welcomePage':
                tempErrors.welcomePage = form.welcomePage ? (/\.(html|htm)$/i.test(form.welcomePage) ? "" : "The welcome page must be an HTML or HTM file.") : "This field is required.";
                break;
            case 'favicon':
                tempErrors.favicon = form.favicon ? (/\.(png|jpg|jpeg)$/i.test(form.favicon) ? "" : "The favicon must be a PNG o JPG file.") : "This field is required.";
                break;
            case 'language':
                tempErrors.language = form.language ? "" : "This field is required.";
                break;
            case 'title':
                tempErrors.title = form.title ? "" : "This field is required.";
                break;
            case 'file':
                const isZipFile = isFileReady && form.inputFile && form.inputFile.type === "application/zip";
                tempErrors.file = isFileReady ? (isZipFile ? "" : "The file must be a .zip format.") : "A ZIP file is required.";
                break;
            default:
                break;
        }
        console.log(tempErrors);
        setErrors(tempErrors);
        return !Object.values(tempErrors).some(error => error !== "");
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: ""
        }));
    };

    const handleFileChange = (e) => {
        setForm({ ...form, inputFile: e.target.files[0] });
        setTouchedFields({ ...touchedFields, inputFile: true });

        if (e.target.files[0].type !== "application/zip") {
            setErrors({ ...errors, file: "The file must be a .zip format." });
            setIsFileReady(false);
        } else {
            setErrors({ ...errors, file: "" });
            setIsFileReady(true);
        }
    };

    // Language options for the select component

    const languageOptions = useMemo(() => iso6393
        .map(language => ({
            value: language.code,
            label: language.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)), // Ordena alfabéticamente por label
        [],);

    const [selectedLanguage, setSelectedLanguage] = useState('');

    const handleLanguageChange = (event) => {

        const selectedOption = event.target.value;

        setSelectedLanguage(selectedOption);
        if (selectedOption) {
            setForm(prevForm => ({ ...prevForm, language: selectedOption }));
        } else {
            setForm(prevForm => ({ ...prevForm, language: '' }));
        }
    };

    async function postFormData(formData) {
        try {
            const response = await axios.post(import.meta.env.VITE_API, formData, {
                responseType: 'blob', // Important to manage the response as a blob
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 600000000,
            });
            // Verificar el estado de la respuesta aquí si es necesario
            return response;
        } catch (err) {
            // Lanzar el error para manejarlo en el bloque try-catch de handleSubmit
            throw err;
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        // Verifica si hay errores
        if (Object.values(errors).some(error => error !== "")) {
            return;
        }

        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await postFormData(formData);
            if (response && response.status === 200) {
                await handleFileDownload(response);
                setServerError("");

                // Limpia el estado del formulario y referencias al archivo
                setForm({
                    welcomePage: '',
                    favicon: '',
                    language: '',
                    title: '',
                    description: '_',
                    creator: '_',
                    publisher: 'ZiptoZim',
                    inputFile: null
                });
                setIsFileReady(false);
                setSelectedLanguage('');

            } else {
                console.error("Error submitting form: Invalid server response");
                setServerError("Invalid server response");
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setServerError(err.response ? err.response.data : "Error submitting form");

        }
    }

    async function handleFileDownload(response) {
        if (form && form.inputFile) {
            const blob = new Blob([response.data], { type: 'application/octet-stream' });
            const downloadUrl = URL.createObjectURL(blob);
            const fileName = form.inputFile.name;
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName.replace(/\.zip$/i, ".zim");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

        } else {
            alert("No file selected for download.");
        }
    }


    return (
        <Container>
            <form noValidate onSubmit={handleSubmit}>
                <Grid container display='flex' justifyContent='space-between'>
                    <Grid item xs={12} sm={7.8}>
                        <Card sx={{ mb: '2rem', backgroundColor: 'transparent', border: '1px solid', borderColor: 'grey.300', boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)' }}>
                            <CardHeader title="Required" />
                            <CardContent>
                                <Stack
                                    direction={{ xs: 'column', sm: 'column' }}
                                    spacing={2}
                                    useFlexGap
                                    sx={{ pt: 2 }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '60%' }}>Name of the main HTML page, if it's not in the main directory, use the path, e.g. docs/index.html</Typography>
                                        <TextField
                                            required
                                            name="welcomePage"
                                            label="Main HTML Page"
                                            placeholder="e.g. index.html"
                                            value={form.welcomePage}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.welcomePage}
                                            helperText={errors.welcomePage}
                                            size="small"
                                            align="left"
                                            style={{ width: '40%' }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '60%' }}>Name of the icon, if it's not in the main directory, use the path, e.g. img/favicon.png</Typography>
                                        <TextField
                                            required
                                            name="favicon"
                                            label="Website's Icon"
                                            placeholder="e.g. favicon.png"
                                            value={form.favicon}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.favicon}
                                            helperText={errors.favicon}
                                            size="small"
                                            align="left"
                                            style={{ width: '40%' }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
                                        <Typography variant="body1" align="left" sx={{ width: '60%' }}>Language of the content</Typography>
                                        <FormControl sx={{ width: '90%' }} error={touchedFields.language && !!errors.language}>
                                            <InputLabel id="language-select-label">Select language</InputLabel>
                                            <Select
                                                labelId="language-select-label"
                                                id="language-select"
                                                label="Select language"
                                                placeholder='Select language'
                                                value={selectedLanguage}
                                                onChange={handleLanguageChange}
                                            >
                                                {languageOptions.map((option) => (
                                                    <MenuItem key={`${option.value}-${option.label}`} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                           <FormHelperText>{errors.language}</FormHelperText>
                                        </FormControl>
                                    </Box>

                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '40%' }}>Enter a title that reflects the content</Typography>
                                        <TextField
                                            required
                                            name="title"
                                            label="Title"
                                            placeholder="e.g. Our Website"
                                            value={form.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.title}
                                            helperText={errors.title}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                        <Card sx={{ mb: '2rem', backgroundColor: 'transparent', border: '1px solid', borderColor: 'grey.300', boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)' }}>
                            <CardHeader title="Optional (would be filled by default value)" />
                            <CardContent>
                                <Stack
                                    direction={{ xs: 'column', sm: 'column' }}
                                    spacing={2}
                                    useFlexGap
                                    sx={{ pt: 2 }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '40%' }}>Enter a short description of the content</Typography>
                                        <TextField
                                            name="description"
                                            label="Description"
                                            onChange={handleChange}
                                            defaultValue="_"
                                            value={form.description}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" style={{ width: '40%' }}>Creator(s) of the content</Typography>
                                        <TextField
                                            name="creator"
                                            label="Creator"
                                            onChange={handleChange}
                                            defaultValue="_"
                                            value={form.creator}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" style={{ width: '40%' }}>Creator of the ZIM file itself (default value: ZiptoZim)</Typography>
                                        <TextField
                                            name="publisher"
                                            label="Publisher"
                                            onChange={handleChange}
                                            defaultValue="ZiptoZim"
                                            value={form.publisher}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    {/* File input for the zip file, this component is hidden and the file is selected by clicking the button "SELECT ZIP FILE" */}
                                    <input
                                        type="file"
                                        name="inputFile"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Stack
                            direction={{ xs: 'column', sm: 'column' }}
                            spacing={1}
                            useFlexGap
                        >
                            <Card sx={{ mb: '2rem', backgroundColor: 'transparent', border: '1px solid', borderColor: 'grey.300', boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.25)' }}>
                                <CardHeader title="Upload Zip File" />
                                <CardContent>
                                    <Typography variant="body1" align="left" sx={{ mb: 2 }}>Select the zip file to be converted to Zim (double click), it's recommended that the main html file and the icon are placed in the main directory.</Typography>
                                    <Box alignItems="center" gap={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => fileInputRef.current.click()}
                                            sx={{ mb: 2 }}
                                        >
                                            Select Zip File
                                        </Button>
                                        {touchedFields.inputFile && errors.file && (<FormHelperText sx={{ color: 'error.main', textAlign: 'center', width: '100%' }}>
                                            {errors.file}
                                        </FormHelperText>
                                        )}
                                        <Typography variant="body1" align="center">Selected file: {form.inputFile ? form.inputFile.name : 'None'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                            {isFileReady && !errors.file ? (
                                <Button
                                    variant="contained"
                                    onClick={handleFileDownload}
                                    size="large"
                                    sx={{ mt: 2, maxWidth: 'fit-content', margin: '0 auto', backgroundColor: 'green' }}
                                >
                                    Download Zim File
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    type="submit"
                                    size="large"
                                    sx={{ mt: 20, maxWidth: 'fit-content', margin: '0 auto' }}
                                >
                                    Generate Zim File
                                </Button>
                            )}

                        </Stack>
                    </Grid>
                    <FormHelperText sx={{ color: 'error.main', textAlign: 'center', width: '100%' }}>
                        {errors.file}
                    </FormHelperText>
                    {confirmationMessage && <Alert severity="success">{confirmationMessage}</Alert>}

                </Grid>
            </form>
        </Container>
    );
}

export default ConvertForm;