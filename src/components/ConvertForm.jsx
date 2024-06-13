import React, { useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import axios from 'axios';
import { Button, Container, TextField, Stack, Grid, Typography, Card, CardHeader, CardContent, Box } from '@mui/material';
import iso6393 from '@freearhey/iso-639-3';

export function ConvertForm() {

    const [form, setForm] = useState({
        welcomePage: '',
        favicon: '',
        language: '',
        title: '',
        description: '_',
        creator: '_',
        publisher: 'ZiptoZim'
    });

    const [downloadUrl, setDownloadUrl] = useState('');
    const [isFileReady, setIsFileReady] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.type === 'file') {
            setFile(e.target.files[0]);
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach((key) => {
            formData.append(key, form[key]);
        });

        // Append the file to formData
        formData.append('inputFile', file);

        // Log the contents of formData
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await axios.post('http://localhost:3019/upload', formData, {
                responseType: 'blob', // Importante para manejar la respuesta como un archivo
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 600000000,
            });


            // Crear una URL para el blob
            const blob = new Blob([response.data], { type: 'application/octet-stream' });


            // Para descargas
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'nombreDelArchivo.zim'; // Extensión según el tipo de archivo
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);


            //const downloadUrl = window.URL.createObjectURL(blob);
            setDownloadUrl(downloadUrl);
            console.log("downloadUrl", downloadUrl);
            setIsFileReady(true);

            // Extraer el nombre del archivo del header 'content-disposition'
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'archivo.zim'; // Nombre por defecto
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            // Crear un enlace para descargar el archivo
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.setAttribute('download', filename); // Especifica el nombre del archivo para descargar
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Limpiar después de la descarga
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (err) {
            console.error(err);
        }
    };


    const inputFileRef = React.useRef();
    const onFileButtonClick = () => {
        inputFileRef.current.click();
    };

    const options = iso6393.map(language => ({
        value: language.code,
        label: language.name,
    }));

    const [selectedLanguage, setSelectedLanguage] = useState(null);

    const handleLanguageChange = (selectedOption) => {
        setSelectedLanguage(selectedOption);
        if (selectedOption) {
            setForm(prevForm => ({ ...prevForm, language: selectedOption.value }));
        } else {
            setForm(prevForm => ({ ...prevForm, language: '' }));
        }
    };

    useEffect(() => {
        console.log("isFileReady", isFileReady);
    }, [isFileReady]); // Asegura que se consologuee isFileReady solo después de que su estado haya cambiado.


    return (
        <Container>
            <form onSubmit={handleSubmit}>
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
                                        <Typography variant="body1" align="left" sx={{ width: '60%' }}>XXX of main HTML page, if it's not in the main directory, use the path, e.g. docs/index.html</Typography>
                                        <TextField
                                            required
                                            name="welcomePage"
                                            label="Main HTML Page"
                                            placeholder="e.g. index.html"
                                            onChange={handleChange}
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
                                            onChange={handleChange}
                                            size="small"
                                            align="left"
                                            style={{ width: '40%' }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '60%' }}>Language of the content</Typography>
                                        <ReactSelect
                                            id="language-select"
                                            options={options}
                                            isSearchable
                                            value={selectedLanguage}
                                            onChange={handleLanguageChange}
                                            menuPortalTarget={document.body}
                                            styles={{
                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                container: base => ({ ...base, width: '90%' })
                                            }}
                                        />
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} style={{ width: '100%' }}>
                                        <Typography variant="body1" align="left" sx={{ width: '40%' }}>Enter a title that reflects the content</Typography>
                                        <TextField
                                            required
                                            name="title"
                                            label="Title"
                                            placeholder="e.g. Our Website"
                                            onChange={handleChange}
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
                                            size="small"
                                            align="left"
                                            style={{ width: '60%' }}
                                        />
                                    </Box>
                                    <input
                                        type="file"
                                        name="inputFile"
                                        ref={inputFileRef}
                                        style={{ display: 'none' }}
                                        onChange={(e) => setForm({ ...form, inputFile: e.target.files[0] })}
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
                                            onClick={onFileButtonClick}
                                            sx={{ mb: 2 }}
                                        >
                                            Select Zip File
                                        </Button>
                                        <Typography variant="body1" align="center">Selected file: {form.inputFile ? form.inputFile.name : 'None'}</Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                            {isFileReady ? (
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = 'URL_DEL_ARCHIVO_A_DESCARGAR'; // Reemplaza esto con la URL real del archivo
                                        link.download = 'NombreDelArchivo.zim'; // Opcional: especifica un nombre de archivo para la descarga
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
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