import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, TextField, Stack, Grid, Typography, Card, CardHeader, CardContent, Box, FormHelperText, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import FileInput from './FileInput';
import LanguageSelect from './LanguageSelect';


export function ConvertForm() {

    const [form, setForm] = useState({
        welcomePage: '',
        favicon: '',
        language: '',
        title: '',
        description: '_',
        creator: '_',
        publisher: 'ZiptoZim',
    });

    const [inputFile, setInputFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isZimReady, setIsZimReady] = useState(false);
    const [serverError, setServerError] = useState("");
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState('');



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
                tempErrors.language = form.language && form.language.trim() !== '' ? "" : "This field is required";
                break;
            case 'title':
                tempErrors.title = form.title ? "" : "This field is required.";
                break;
            case 'inputFile':
                tempErrors.inputFile = inputFile ? (inputFile.type === "application/zip" ? "" : "The file must be a .zip format.") : "This field is required.";
                break;
            default:
                break;
        }

        return tempErrors;

    };

    const validateForm = () => {
        let tempErrors = {};
        ['welcomePage', 'favicon', 'language', 'title', 'inputFile'].forEach(field => {
            tempErrors = { ...tempErrors, ...validateField(field) };
            console.log(`After validating ${field}:`, tempErrors);

        });

        console.log("tempErrors en validateForm", tempErrors);
        setErrors(tempErrors);

        // Return false if there are errors
        return Object.keys(tempErrors).every(key => tempErrors[key] === "");
    };

    const handleBlur = (e) => {
        console.log("e.target.name en handleBlur", e.target.name);
        let tempErrors = validateField(e.target.name);
        setErrors(prevErrors => ({ ...prevErrors, ...tempErrors }));
        console.log("tempErrors en handleBlur", tempErrors);
        console.log("form en handleBlur", form);
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
        setInputFile(e.target.files[0].name)
        console.log("e.target.files[0] en handleFileChange", e.target.files[0]);
        console.log("inputFile en handleFileChange", inputFile);
        console.log("input file type", inputFile.type);
    };

    useEffect(() => {
        if (inputFile) {
            let tempErrors = { ...errors, ...validateField("inputFile") };
            console.log("inputFile en useEffect", inputFile);
            setErrors(tempErrors);
        }
    }, [inputFile]);

    const handleLanguageChange = (event) => {
        const selectedOption = event?.target?.value || '';
        setSelectedLanguage(selectedOption);
        setForm(prevForm => ({ ...prevForm, language: selectedOption }));
        console.log("Selected language:", selectedOption);
    };


    const postFormData = async (formData) => {
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Valida el formulario
        if (!validateForm()) {
            return;
        }

        // Crear un objeto FormData y agregar todos los campos del formulario

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            formData.append(key, form[key]);
        });
        if (file) {
            formData.append('inputFile', file);
        }

        // Imprime los datos del formulario en la consola
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await postFormData(formData);
            if (response && response.status === 200) {
                handleFileDownload(response);
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
                });
                setSelectedLanguage('');

            } else {
                console.error("Error submitting form: Invalid server response");
                setServerError("Invalid server response");
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setServerError(err.response ? err.response.data : "Error submitting form");
        }
    };

    const handleFileDownload = (response) => {
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
    };


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
                                        <LanguageSelect
                                            selectedLanguage={selectedLanguage}
                                            handleLanguageChange={handleLanguageChange}
                                            handleBlur={handleBlur}
                                            error={errors.language}
                                        />
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
                                    <Typography variant="body1" align="left" sx={{ mb: 2 }}>Select the zip file to be converted to Zim: </Typography>
                                    <FileInput
                                        file={inputFile}
                                        onChange={handleFileChange}
                                        handleBlur={handleBlur}
                                        error={errors.file}
                                    />
                                </CardContent>
                            </Card>
                            {isZimReady ? (
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

                </Grid>
            </form>
        </Container>
    );
}

export default ConvertForm;