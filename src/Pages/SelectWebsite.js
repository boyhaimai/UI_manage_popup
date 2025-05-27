import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://ai.bang.vawayai.com:5000";

function SelectWebsite() {
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/get-websites`, {
          withCredentials: true,
        });
        if (response.data.success && response.data.websites) {
          setWebsites(response.data.websites);
        } else {
          setError("Không tìm thấy danh sách website.");
          navigate("/");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không thể kết nối đến server.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [navigate]);

  const handleSelect = () => {
    if (!selectedWebsite) {
      setError("Vui lòng chọn một website.");
      return;
    }
    const site = websites.find((w) => w.domain === selectedWebsite);
    if (site) {
      axios
        .post(
          `${API_BASE_URL}/select-website`,
          { config_id: site.config_id },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.success) {
            navigate("/config_ui");
          } else {
            setError(response.data.message);
          }
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Không thể kết nối đến server.");
        });
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
        }}
      >
        <CircularProgress sx={{ color: "#0F172A" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        padding: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "400px",
          width: "100%",
          bgcolor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ fontSize: "14px", fontWeight: "bold", mb: 3, color: "#0F172A" }}
        >
          Chọn website để cấu hình
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "14px" }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ fontSize: "14px" }}>Website</InputLabel>
          <Select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            label="Website"
            sx={{ fontSize: "14px", "& .MuiSelect-select": { py: 1.5 } }}
          >
            {websites.map((w) => (
              <MenuItem
                key={w.domain}
                value={w.domain}
                sx={{ fontSize: "14px" }}
              >
                {w.domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSelect}
          sx={{
            fontSize: "14px",
            bgcolor: "#0F172A",
            "&:hover": { bgcolor: "#1e293b" },
            py: 1.5,
          }}
        >
          Tiếp tục
        </Button>
      </Box>
    </Box>
  );
}

export default SelectWebsite;