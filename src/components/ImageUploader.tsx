
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Edit, Trash2, ZoomIn, MoveHorizontal, MoveVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  currentImage: string;
  name: string;
  onImageChange: (imagePath: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  showZoomSlider?: boolean;
  showAutoDetect?: boolean;
}

// Add interfaces for image size and position tracking
interface ImageSize {
  width: number;
  height: number;
}

// Add interface for storing image adjustments
interface ImageAdjustments {
  zoom: number;
  xPosition: number;
  yPosition: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage, 
  name, 
  onImageChange,
  size = "lg",
  showZoomSlider = false,
  showAutoDetect = false
}) => {
  const [previewImage, setPreviewImage] = useState<string>(currentImage);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number[]>([1]);
  const [xPosition, setXPosition] = useState<number[]>([0]);
  const [yPosition, setYPosition] = useState<number[]>([0]);
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
  const [scale, setScale] = useState<number>(1);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: 1,
    xPosition: 0,
    yPosition: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Check if there's a valid image to display
  const hasImage = Boolean(previewImage && previewImage.trim() !== "");

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  // Use effect to update previewImage when currentImage changes
  useEffect(() => {
    if (currentImage && currentImage !== previewImage) {
      setPreviewImage(currentImage);
      
      // Check if image is valid
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageLoaded(false);
      };
      img.src = currentImage;
    }
  }, [currentImage]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setImageLoaded(true);
      onImageChange(objectUrl);
      
      // Reset adjustments when uploading a new image
      setAdjustments({
        zoom: 1,
        xPosition: 0,
        yPosition: 0
      });
    }
  };

  const handleEdit = () => {
    setCropImage(previewImage);
    setIsEditing(true);
    
    // Set initial slider values based on saved adjustments
    setZoomLevel([adjustments.zoom]);
    setXPosition([adjustments.xPosition]);
    setYPosition([adjustments.yPosition]);
  };

  const handleRemove = () => {
    setPreviewImage("");
    setImageLoaded(false);
    onImageChange("");
    
    // Reset adjustments when removing an image
    setAdjustments({
      zoom: 1,
      xPosition: 0,
      yPosition: 0
    });
  };

  // Update image size from the ImageCropper
  const handleUpdateImageSize = (size: ImageSize, newScale: number) => {
    setImageSize(size);
    setScale(newScale);
  };

  const handleCropSave = () => {
    // Save the adjustments
    setAdjustments({
      zoom: zoomLevel[0],
      xPosition: xPosition[0],
      yPosition: yPosition[0]
    });
    
    // Close the dialog first
    setIsEditing(false);
    
    // Make sure we're not losing the image
    if (previewImage && previewImage.trim() !== "") {
      // Create a data URL from the canvas without the grid and circular mask
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && cropImage) {
          const img = new Image();
          img.onload = () => {
            // Calculate dimensions
            const imgWidth = imageSize.width * scale * zoomLevel[0];
            const imgHeight = imageSize.height * scale * zoomLevel[0];
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const offsetX = xPosition[0];
            const offsetY = yPosition[0];
            
            const posX = centerX - (imgWidth / 2) + offsetX;
            const posY = centerY - (imgHeight / 2) + offsetY;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw only the image without any overlays
            ctx.drawImage(
              img,
              posX, 
              posY, 
              imgWidth,
              imgHeight
            );
            
            try {
              // Get the data URL from the canvas
              const dataUrl = canvas.toDataURL('image/png');
              
              // Update the preview image with the adjusted image
              setPreviewImage(dataUrl);
              
              // Pass the image back to the parent component
              onImageChange(dataUrl);
            } catch (error) {
              console.error("Error creating image data URL:", error);
              
              // Fallback: just store the adjustment parameters
              const timestamp = new Date().getTime();
              let updatedImage = previewImage;
              
              if (previewImage.includes('?')) {
                updatedImage = `${previewImage.split('?')[0]}?t=${timestamp}&zoom=${zoomLevel[0]}&x=${xPosition[0]}&y=${yPosition[0]}`;
              } else {
                updatedImage = `${previewImage}?t=${timestamp}&zoom=${zoomLevel[0]}&x=${xPosition[0]}&y=${yPosition[0]}`;
              }
              
              // Update the preview image with parameters
              setPreviewImage(updatedImage);
              
              // Pass the image back to the parent component
              onImageChange(updatedImage);
            }
          };
          img.src = cropImage;
        }
      }
    }
  };

  const handleCropCancel = () => {
    setIsEditing(false);
    setCropImage(null);
  };

  // Initialize the component with the current image if available
  React.useEffect(() => {
    if (currentImage && currentImage.trim() !== "") {
      // Create a temporary Image to check if it loads properly
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageLoaded(false);
      };
      img.src = currentImage;
    }
  }, [currentImage]);

  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value);
  };

  const handleXPositionChange = (value: number[]) => {
    setXPosition(value);
  };

  const handleYPositionChange = (value: number[]) => {
    setYPosition(value);
  };

  const initials = name
    .split(" ")
    .map(part => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative cursor-pointer group"
        onClick={handleClick}
      >
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage 
            src={previewImage} 
            alt={name} 
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="flex flex-col w-full gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-1" />
          {hasImage ? "Change Photo" : "Upload Photo"}
        </Button>

        {hasImage && (
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="w-1/2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="w-1/2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Hidden canvas for saving image without grid */}
      <canvas ref={previewCanvasRef} className="hidden" />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Image</DialogTitle>
            <DialogDescription>
              Position and zoom your image to fit nicely in the circular frame.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="relative border rounded-md overflow-hidden">
              <AspectRatio ratio={1/1} className="bg-muted">
                {cropImage && (
                  <ImageCropper 
                    src={cropImage} 
                    canvasRef={canvasRef} 
                    previewCanvasRef={previewCanvasRef}
                    zoomLevel={zoomLevel[0]}
                    xPosition={xPosition[0]}
                    yPosition={yPosition[0]} 
                    onUpdateImageSize={handleUpdateImageSize}
                  />
                )}
              </AspectRatio>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Use the sliders below to adjust zoom and position
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoom-slider" className="flex items-center text-sm">
                  <ZoomIn className="h-4 w-4 mr-1" />
                  Zoom: {Math.round(zoomLevel[0] * 100)}%
                </Label>
                <Slider
                  id="zoom-slider"
                  min={0.5}
                  max={3}
                  step={0.01}
                  value={zoomLevel}
                  onValueChange={handleZoomChange}
                  className="transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="x-position-slider" className="flex items-center text-sm">
                  <MoveHorizontal className="h-4 w-4 mr-1" />
                  Horizontal Position
                </Label>
                <Slider
                  id="x-position-slider"
                  min={-200}
                  max={200}
                  step={1}
                  value={xPosition}
                  onValueChange={handleXPositionChange}
                  className="transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="y-position-slider" className="flex items-center text-sm">
                  <MoveVertical className="h-4 w-4 mr-1" />
                  Vertical Position
                </Label>
                <Slider
                  id="y-position-slider"
                  min={-200}
                  max={200}
                  step={1}
                  value={yPosition}
                  onValueChange={handleYPositionChange}
                  className="transition-all"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleCropCancel}>
              Cancel
            </Button>
            <Button onClick={handleCropSave}>
              Save Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ImageCropperProps {
  src: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  previewCanvasRef: React.RefObject<HTMLCanvasElement>;
  zoomLevel: number;
  xPosition: number;
  yPosition: number;
  onUpdateImageSize: (size: ImageSize, scale: number) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  src, 
  canvasRef, 
  previewCanvasRef,
  zoomLevel = 1,
  xPosition = 0,
  yPosition = 0,
  onUpdateImageSize
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState(0);
  
  React.useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    
    if (!img || !canvas || !previewCanvas || !src) return;
    
    const drawImageOnCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const size = canvas.width;
      setCanvasSize(size);
      
      const imgWidth = imageSize.width * scale * zoomLevel;
      const imgHeight = imageSize.height * scale * zoomLevel;
      
      const centerX = size / 2;
      const centerY = size / 2;
      
      const offsetX = xPosition;
      const offsetY = yPosition;
      
      const posX = centerX - (imgWidth / 2) + offsetX;
      const posY = centerY - (imgHeight / 2) + offsetY;
      
      ctx.clearRect(0, 0, size, size);
      
      // Draw dark background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, size, size);
      
      // Make sure the radius is positive to avoid the error
      const circleRadius = Math.max(2, size / 2 - 2);
      
      // Save context state
      ctx.save();
      
      // Create clipping circle for preview (visual guide only)
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      // Draw image within clipping path
      ctx.drawImage(
        img,
        posX, 
        posY, 
        imgWidth,
        imgHeight
      );
      
      // Restore context to remove clipping path
      ctx.restore();
      
      // Draw the circle outline (visual guide only)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw grid lines (visual guides only)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2, true);
      ctx.clip();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 1; i < 3; i++) {
        const y = (size / 3) * i;
        ctx.beginPath();
        ctx.moveTo(centerX - circleRadius, y);
        ctx.lineTo(centerX + circleRadius, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 1; i < 3; i++) {
        const x = (size / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, centerY - circleRadius);
        ctx.lineTo(x, centerY + circleRadius);
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Draw center dot (visual guide only)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Setup the hidden preview canvas (without grid and guides)
      previewCanvas.width = size;
      previewCanvas.height = size;
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
        // Draw only the image (no grid, no circular mask)
        previewCtx.clearRect(0, 0, size, size);
        previewCtx.drawImage(
          img,
          posX, 
          posY, 
          imgWidth,
          imgHeight
        );
      }
    };
    
    img.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetWidth;
      
      const newImageSize = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      
      setImageSize(newImageSize);
      
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let newScale = 1;
      
      if (imgRatio > 1) {
        newScale = canvas.height / img.naturalHeight;
      } else {
        newScale = canvas.width / img.naturalWidth;
      }
      
      setScale(newScale);
      
      // Pass image size and scale to parent component
      onUpdateImageSize(newImageSize, newScale);
      
      drawImageOnCanvas();
    };
    
    img.src = src;
    
    const intervalId = setInterval(drawImageOnCanvas, 30);
    return () => clearInterval(intervalId);
  }, [src, scale, zoomLevel, xPosition, yPosition, canvasRef, previewCanvasRef, imageSize, onUpdateImageSize]);
  
  return (
    <>
      <img
        ref={imgRef}
        src={src}
        className="hidden"
        alt="Source"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </>
  );
};

export default ImageUploader;
