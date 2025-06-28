// CropAvatarModal.js
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal, Box, Slider, Button, Typography } from "@mui/material";
import getCroppedImg from "./cropImageUtils";

const CropAvatarModal = ({ open, image, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    const croppedImage = await getCroppedImg(image, croppedAreaPixels);
    onCropComplete(croppedImage);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: "95%",
          maxWidth: 580,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
          Cắt ảnh đại diện
        </Typography>

        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 300,
            borderRadius: 2,
            overflow: "hidden",
            mb: 2,
          }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </Box>

        <Typography gutterBottom fontSize={13} fontWeight={500}>
          Thu phóng
        </Typography>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(e, newZoom) => setZoom(newZoom)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleDone}
          sx={{
            borderRadius: 99,
            textTransform: "none",
            fontWeight: "bold",
            py: 1.2,
            fontSize: 14,
            backgroundColor: "#000000",
          }}
        >
          Cắt ảnh
        </Button>
      </Box>
    </Modal>
  );
};

export default CropAvatarModal;
