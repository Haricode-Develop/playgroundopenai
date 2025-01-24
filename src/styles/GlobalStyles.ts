import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    :root {
        --transition-fast: 0.2s ease-in-out;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        background-color: #1e1e1e;
        color: #ccc;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
        line-height: 1.4;
        -webkit-font-smoothing: antialiased;
    }

    /* Scrollbars */
    ::-webkit-scrollbar {
        width: 8px;
    }
    ::-webkit-scrollbar-thumb {
        background: #3a3a3a;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-track {
        background: #1f1f1f;
    }

    button, input, textarea {
        font-family: inherit;
    }
`;
