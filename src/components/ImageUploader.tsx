import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Edit, Trash2, ZoomIn, MoveHorizontal, MoveVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  currentImage: string;
  name: string;
  onImageChange: (imagePath: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  showZoomSlider?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  currentImage, 
  name, 
  onImageChange,
  size = "lg",
  showZoomSlider = false
}) => {
  const [previewImage, setPreviewImage] = useState<string>(currentImage);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number[]>([1]);
  const [xPosition, setXPosition] = useState<number[]>([0]);
  const [yPosition, setYPosition] = useState<number[]>([0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      onImageChange(objectUrl);
    }
  };

  const handleEdit = () => {
    setCropImage(previewImage);
    setIsEditing(true);
    setZoomLevel([1]); // Reset zoom level when opening editor
    setXPosition([0]); // Reset x position
    setYPosition([0]); // Reset y position
  };

  const handleRemove = () => {
    setPreviewImage("");
    onImageChange("");
  };

  const handleCropSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const croppedImageUrl = canvas.toDataURL('image/png');
    setPreviewImage(croppedImageUrl);
    onImageChange(croppedImageUrl);
    setIsEditing(false);
    setCropImage(null);
  };

  const handleCropCancel = () => {
    setIsEditing(false);
    setCropImage(null);
  };

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
          <AvatarImage src={previewImage} alt={name} />
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
          Upload Photo
        </Button>

        {previewImage && (
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

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            <div className="relative border rounded-md overflow-hidden">
              <AspectRatio ratio={1/1} className="bg-muted">
                {cropImage && (
                  <ImageCropper 
                    src={cropImage} 
                    canvasRef={canvasRef} 
                    zoomLevel={zoomLevel[0]}
                    xPosition={xPosition[0]}
                    yPosition={yPosition[0]}
                  />
                )}
              </AspectRatio>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Drag the image to adjust the crop. The image will be cropped to a 1:1 ratio.
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
              Save Crop
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
  zoomLevel: number;
  xPosition: number;
  yPosition: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ 
  src, 
  canvasRef, 
  zoomLevel = 1,
  xPosition = 0,
  yPosition = 0 
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState(0);
  
  React.useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    
    if (!img || !canvas || !src) return;
    
    const drawImageOnCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const size = canvas.width;
      setCanvasSize(size);
      ctx.clearRect(0, 0, size, size);
      
      // Calculate image dimensions with zoom
      const imgWidth = imageSize.width * scale * zoomLevel;
      const imgHeight = imageSize.height * scale * zoomLevel;
      
      // Calculate center position adjustments when zooming
      const centerX = size / 2;
      const centerY = size / 2;
      
      // Calculate the position offsets to keep center fixed during zoom
      // and add the slider positions for x and y
      const offsetX = centerX - (imgWidth / 2) + xPosition;
      const offsetY = centerY - (imgHeight / 2) + yPosition;
      
      // Draw the image with position adjusted to keep the center point fixed
      ctx.drawImage(
        img,
        offsetX, 
        offsetY, 
        imgWidth,
        imgHeight
      );
    };
    
    img.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetWidth; // Square aspect ratio
      
      // Save the natural dimensions of the image
      setImageSize({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      
      const imgRatio = img.naturalWidth / img.naturalHeight;
      if (imgRatio > 1) {
        setScale(canvas.height / img.naturalHeight);
      } else {
        setScale(canvas.width / img.naturalWidth);
      }
      
      drawImageOnCanvas();
    };
    
    img.src = src;
    
    const intervalId = setInterval(drawImageOnCanvas, 10);
    return () => clearInterval(intervalId);
  }, [src, scale, zoomLevel, xPosition, yPosition, canvasRef, imageSize]);
  
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
