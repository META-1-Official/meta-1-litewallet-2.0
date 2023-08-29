import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  .MuiMenu-list {
    background-color: black;
    border: 1px solid rgba(255, 255, 255, 0.1);
    .MuiMenuItem-root {
      a {
        color: white;
        text-decoration: none;
      }
      div {
        color: white;
        text-decoration: none;
      }
      &.Mui-selected {
        background: #FFC000;
      }
      &:hover {
        background: #15171B;
      }
    }
  }

  .MuiAutocomplete-popper {
    .MuiAutocomplete-noOptions, .MuiAutocomplete-loading {
        color: #15171B !important;
    }
  }
  
  .MuiOutlinedInput-notchedOutline {
    border: none !important;
  }

  .navbar-item {
    display: flex;
    align-items: center;
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0 10px;
    color: white;
    font-size: 1rem;
    font-weight: 400;
    text-decoration: none;
    
    
    &.active {
      color: #FFC000
    }
  
    &:hover {
      color: #FFC000
    }

    
  }

  .sel-item {
    display: flex;
    align-items: center;
    padding: 0 10px;
    color: white;
    font-size: 1rem;
    font-weight: 400;
    text-decoration: none;
  
    &.active {
      color: #FFC000
    }
  
    &:hover {
      color: #FFC000
    }
  }
  @media screen and (max-width: 1140px) {
    .navbar-item,
    .sel-item {
      font-size: 2rem;
    }
  }
`;

export default GlobalStyle;
