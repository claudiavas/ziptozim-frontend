import React, { useMemo, useState } from 'react';
import { FormControl, FormHelperText, Autocomplete, TextField } from '@mui/material';
import iso6393 from '@freearhey/iso-639-3';

const LanguageSelect = ({ selectedLanguage, handleLanguageChange, handleBlur, error }) => {
    const languageOptions = useMemo(() => iso6393
        .map(language => ({
            value: language.code,
            label: language.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)), // Ordena alfabéticamente por label
        [],
    );

    const [inputValue, setInputValue] = useState('');

    return (
        <FormControl sx={{ width: '90%' }} error={!!error}>
            <Autocomplete
                id="language-select"
                options={languageOptions}
                getOptionLabel={(option) => option.label}
                value={languageOptions.find(option => option.value === selectedLanguage) || null}
                onChange={(event, newValue) => {
                    handleLanguageChange({ target: { value: newValue ? newValue.value : '' } });
                }}
                inputValue={inputValue}
                onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                }}
                onBlur={handleBlur}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select language"
                        placeholder="Type to filter languages"
                        margin="normal"
                        error={!!error}
                        helperText={error}
                        name="language"
                    />
                )}
                clearOnEscape
            />
        </FormControl>
    );
};

export default LanguageSelect;
