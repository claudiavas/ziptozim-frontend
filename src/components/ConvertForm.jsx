import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, TextField, Stack, Grid, Typography, Card, CardHeader, CardContent, Box, FormHelperText, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import FileInput from './FileInput';
import LanguageSelect from './LanguageSelect';
import LoadingButton from '@mui/lab/LoadingButton';



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
    const [serverError, setServerError] = useState({});
    const [confirmationMessage, setConfirmationMessage] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showError, setShowError] = useState(false);

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
                tempErrors.inputFile = inputFile ? (/\.(zip)$/i.test(inputFile.name) ? "" : "The file must be a ZIP file.") : "This field is required.";
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
        });

        console.log("tempErrors en validateForm", tempErrors);
        setErrors(tempErrors);

        // Return false if there are errors
        return Object.keys(tempErrors).every(key => tempErrors[key] === "");
    };

    const handleBlur = (e) => {
        let tempErrors = validateField(e.target.name);
        setErrors(prevErrors => ({ ...prevErrors, ...tempErrors }));
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
        setInputFile(e.target.files[0])
        console.log("e.target.files[0] en handleFileChange", e.target.files[0]);
        setErrors(prevErrors => ({ ...prevErrors, inputFile: "" }));
    };

    const handleLanguageChange = (event) => {
        const selectedOption = event?.target?.value || '';
        setSelectedLanguage(selectedOption);
        setForm(prevForm => ({ ...prevForm, language: selectedOption }));
    };

    const postFormData = async (data) => {
        try {
            const response = await axios.post(import.meta.env.VITE_API, data, {
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
        console.log("inputFile en handleSubmit", inputFile);

        // Crear un objeto FormData y agregar todos los campos del formulario
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            formData.append(key, form[key]);
        });
        if (inputFile) {
            formData.append('inputFile', inputFile);
        }

        // Imprime los datos del formulario en la consola
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        setLoading(true); // Iniciar el estado de carga

        try {
            const response = await postFormData(formData);
            if (response && response.status === 200) {
                handleFileDownload(response);
                setServerError("");
                setShowError(false); // Ocultar el error si la solicitud es exitosa

                setForm({
                    welcomePage: '',
                    favicon: '',
                    language: '',
                    title: '',
                    description: '_',
                    creator: '_',
                    publisher: 'ZiptoZim',
                });
                setInputFile(null);
                setSelectedLanguage('');

            } else {
                console.error("Error submitting form: Invalid server response");
                setServerError("Invalid server response");
                setShowError(true); // Mostrar el error
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            if (err.response && err.response.data) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        console.log("Reader result:", reader.result); // Verificar el contenido leído
                        const errorData = JSON.parse(reader.result);
                        console.log("Parsed error data:", errorData); // Verificar el contenido parseado

                        let errorMessage = "Error submitting form";
                        if (errorData.error.includes("illustration") || errorData.message.includes("favicon")) {
                            errorMessage = "Error with the icon file, please verify the file exists in the main directory or specify the correct path.";
                        } else if (errorData.error.includes("welcome")) {
                            errorMessage = "Error with the Main HTML file, please verify the file exists in the main directory or specify the correct path.";
                        }
                        console.log("errorMessage", errorMessage);
                        setServerError(errorMessage);
                        console.log("serverError en catch", serverError);
                    } catch (parseError) {
                        console.error("Error parsing error response:", parseError);
                        setServerError("Error submitting form");
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                setServerError("Error submitting form");
            }
            setShowError(true); // Mostrar el error
        } finally {
            setLoading(false); // Detener el estado de carga
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
                                        <Box sx={{ width: '40%' }}>
                                            <Typography variant="body1" align="left">Main HTML File</Typography>
                                        </Box>
                                        <TextField
                                            required
                                            name="welcomePage"
                                            label="Main HTML File"
                                            placeholder="e.g. index.html"
                                            value={form.welcomePage}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.welcomePage}
                                            helperText={errors.welcomePage}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" align="left" sx={{ fontStyle: 'italic', color: 'grey.600'}}>
                                        (name of the main file of the website, usually named index.html. If it's not located in the main directory, use the path, e.g. directory/index.html)
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Box sx={{ width: '40%' }}>
                                            <Typography variant="body1" align="left">Icon File</Typography>
                                        </Box>
                                        <TextField
                                            required
                                            name="favicon"
                                            label="Icon File"
                                            placeholder="e.g. favicon.png"
                                            value={form.favicon}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.favicon}
                                            helperText={errors.favicon}
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    <Typography variant="body2" align="left" sx={{ fontStyle: 'italic', color: 'grey.600' }}>
                                        (name of the icon of the website, usually named favicon.png If it's not located in the main directory, use the path, e.g. directory/favicon.png)
                                    </Typography>
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
                                        error={errors.inputFile}
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
                                <LoadingButton
                                    variant="contained"
                                    type="submit"
                                    size="large"
                                    loading={loading}
                                    sx={{ mt: 18, maxWidth: 'fit-content', margin: '0 auto' }}
                                >
                                    Generate Zim File
                                </LoadingButton>
                            )}

                        </Stack>
                        {showError && (
                            <Alert
                                severity="error"
                                sx={{ mt: 3.5 }}
                                onClose={() => setShowError(false)} // Ocultar el error al hacer clic en la "X"
                            >
                                <div>
                                    {serverError}
                                </div>
                            </Alert>
                        )}
                    </Grid>

                </Grid>
            </form>
        </Container>
    );
}

export default ConvertForm;