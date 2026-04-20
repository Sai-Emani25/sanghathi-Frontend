import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const PasswordInput = ({ 
  label = "Password", 
  value, 
  onChange, 
  fullWidth = true, 
  autoComplete = "current-password",
  inputRef,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      type={showPassword ? "text" : "password"}
      fullWidth={fullWidth}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      inputRef={inputRef}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleTogglePassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      {...props}
    />
  );
};

export default PasswordInput;