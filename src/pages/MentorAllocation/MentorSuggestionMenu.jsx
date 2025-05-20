import React from "react";
import { List, ListItem, ListItemText } from '@mui/material';

const MentorSuggestionMenu = ({ suggestions, onMentorSelect }) => {
  return (
    <List sx={{ p: 0 }}>
      {suggestions.map((mentor) => (
        <ListItem
          key={mentor._id}
          onClick={() => onMentorSelect(mentor)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemText primary={mentor.name} />
        </ListItem>
      ))}
    </List>
  );
};

export default MentorSuggestionMenu;
