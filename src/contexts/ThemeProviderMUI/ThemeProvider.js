// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: "var(--lato_font)", // Ghi đè Roboto
    color: "var(--c_letter)",
  },
});

export default theme;
