// styles.js

export const formControl = {
    minWidth: 200, 
    backgroundColor: '#6b4f4b',
    borderRadius: '5px', 
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      border: 'none',
    },
    '& .MuiOutlinedInput-root': {
      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',  // Removes the border on hover
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',  // Removes the border when focused
      },
    },
    '& .MuiInputLabel-root': {
      color: '#2b1d19',  // Set your desired color for the label
      '&.Mui-focused': {
        color: '#2b1d19',  // Prevent the label color from turning blue when focused
      },
    },

  };
  
  export const menuItem = {
    color: '#2b1d19',  // Set your desired color for the menu items
    '&:hover': {
      backgroundColor: '#6b4f4b',  // Optional: Change background on hover for better UX
    },
  };