
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Edit, Trash2, ZoomIn } from "lucide-react";
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
                  />
                )}
              </AspectRatio>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Drag the image to adjust the crop. The image will be cropped to a 1:1 ratio.
            </p>

            {showZoomSlider && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="zoom-slider" className="flex items-center text-sm">
                    <ZoomIn className="h-4 w-4 mr-1" />
                    Zoom: {Math.round(zoomLevel[0] * 100)}%
                  </Label>
                </div>
                <Slider
                  id="zoom-slider"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={zoomLevel}
                  onValueChange={handleZoomChange}
                />
              </div>
            )}
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
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, canvasRef, zoomLevel = 1 }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  React.useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    
    if (!img || !canvas || !src) return;
    
    const drawImageOnCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const size = canvas.width;
      ctx.clearRect(0, 0, size, size);
      
      // Apply the zoom level to the image scale
      const imgWidth = img.naturalWidth * scale * zoomLevel;
      const imgHeight = img.naturalHeight * scale * zoomLevel;
      
      ctx.drawImage(
        img,
        -position.x, 
        -position.y, 
        imgWidth,
        imgHeight
      );
    };
    
    img.onload = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetWidth; // Square aspect ratio
      
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
  }, [src, position, scale, zoomLevel, canvasRef]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPosition.x;
    const deltaY = e.clientY - lastPosition.y;
    
    setPosition(prev => ({
      x: prev.x - deltaX,
      y: prev.y - deltaY
    }));
    
    setLastPosition({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-move"
      />
    </>
  );
};

export default ImageUploader;
