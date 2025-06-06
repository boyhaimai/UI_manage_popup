import React from "react";
import { Box, Button, Typography, Tabs, Tab, Paper } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import classNames from "classnames/bind";

import styles from "./ManageMessage.module.scss";
const cx = classNames.bind(styles);

export default function ChatUIClone() {
  const [tabValue, setTabValue] = React.useState(0);

  return (
    <div className={cx("wrapper")}>
      <div className={cx("title")}>Chat Widget</div>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={1}
        borderBottom="1px solid #e0e0e0"
        bgcolor="#f9f9f9"
         pt="70px" // Tránh đè lên title
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box width={10} height={10} borderRadius="50%" bgcolor="green" />
          <Typography fontWeight="bold" variant="body2">
            Active
          </Typography>
          <Typography variant="body2" color="textSecondary">
            (1 - 0 / 0)
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box
              bgcolor="#2196f3"
              color="white"
              px={1}
              borderRadius={0.5}
              fontSize={12}
            >
              U
            </Box>
            <img src="https://flagcdn.com/w40/vn.png" alt="VN" width={16} />
          </Box>
          <Typography variant="body2">V1749113567332444</Typography>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => window.open("https://dashboard.tawk.to", "_blank")}
          >
            https://dashboard.tawk.to/
          </Typography>
          <Typography variant="body2" color="textSecondary">
            00:00:31
          </Typography>
          <Typography variant="body2">2</Typography>
          <Typography variant="body2">0</Typography>
        </Box>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        fontFamily="Roboto, sans-serif"       
      >
        <Box
          display="flex"
          alignItems="center"
          p={1}
          borderBottom="1px solid #e0e0e0"
        >
          <Box
            sx={{
              backgroundColor: "#ff5e5e",
              color: "white",
              width: 24,
              height: 24,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 1,
              fontSize: 16,
              mr: 1,
            }}
          >
            ★
          </Box>
          <Typography variant="body2">
            42.113.60.119 - d1c261be09cd3ad86cb130ad93dcbc2d5eae18e
          </Typography>
        </Box>

        <Box display="flex" flex={1} minHeight={0}>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            p={2}
            minHeight={0}
          >
            <Typography align="center" color="textSecondary">
              Today
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              borderTop="1px solid #e0e0e0"
              pt={1}
            >
              <Typography sx={{ mr: 2, color: "#3dd598", cursor: "pointer" }}>
                ↩️ Reply
              </Typography>
              <Typography sx={{ mr: 2, color: "#3dd598", cursor: "pointer" }}>
                🗨️ Whisper
              </Typography>
              <Button
                variant="contained"
                startIcon={<ChatBubbleOutlineIcon />}
                sx={{ backgroundColor: "#00c853", textTransform: "none" }}
              >
                Join Chat
              </Button>
            </Box>
          </Box>

          <Paper
            sx={{
              width: 300,
              borderLeft: "1px solid #e0e0e0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Visitor (0)" sx={{ fontWeight: "bold" }} />
              <Tab label="Property (0)" sx={{ fontWeight: "bold" }} />
            </Tabs>

            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              color="gray"
            >
              <ChatBubbleOutlineIcon
                sx={{ fontSize: 60, mb: 1, color: "#f5b300" }}
              />
              <Typography>No Chats Found</Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </div>
  );
}
