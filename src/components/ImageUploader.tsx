import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Edit, Trash2, ZoomIn, MoveHorizontal, MoveVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface ImageUploaderProps {
  currentImage: string;
  name: string;
  onImageChange: (imagePath: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  showZoomSlider?: boolean;
  showAutoDetect?: boolean;
}

interface ImageSize {
  width: number;
  height: number;
}

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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: 1,
    xPosition: 0,
    yPosition: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const hasImage = Boolean(previewImage && previewImage.trim() !== "");

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
    xl: "h-40 w-40"
  };

  useEffect(() => {
    if (currentImage && currentImage !== previewImage) {
      setPreviewImage(currentImage);
      
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

  const uploadToSupabase = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      
      const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filePath = `${safeName}/${fileName}`;
      
      const { data: buckets } = await supabase.storage.listBuckets();
      const profileImagesBucket = buckets?.find(bucket => bucket.name === 'profile_images');
      
      if (!profileImagesBucket) {
        console.error('Profile images bucket does not exist');
        throw new Error('Storage bucket not configured');
      }
      
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(data.path);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      setImageLoaded(true);
      
      const supabaseUrl = await uploadToSupabase(file);
      if (supabaseUrl) {
        onImageChange(supabaseUrl);
      } else {
        onImageChange(objectUrl);
      }
      
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
    
    setZoomLevel([adjustments.zoom]);
    setXPosition([adjustments.xPosition]);
    setYPosition([adjustments.yPosition]);
  };

  const handleRemove = async () => {
    if (previewImage && previewImage.includes('profile_images')) {
      try {
        const path = previewImage.split('profile_images/').pop();
        if (path) {
          const { error } = await supabase.storage
            .from('profile_images')
            .remove([path]);
            
          if (error) {
            console.error('Error deleting image:', error);
          }
        }
      } catch (error) {
        console.error('Error removing image from storage:', error);
      }
    }
    
    setPreviewImage("");
    setImageLoaded(false);
    onImageChange("");
    
    setAdjustments({
      zoom: 1,
      xPosition: 0,
      yPosition: 0
    });
  };

  const handleUpdateImageSize = (size: ImageSize, newScale: number) => {
    setImageSize(size);
    setScale(newScale);
  };

  const handleCropSave = async () => {
    setAdjustments({
      zoom: zoomLevel[0],
      xPosition: xPosition[0],
      yPosition: yPosition[0]
    });
    
    setIsEditing(false);
    
    if (previewImage && previewImage.trim() !== "") {
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && cropImage) {
          const img = new Image();
          img.onload = async () => {
            const imgWidth = imageSize.width * scale * zoomLevel[0];
            const imgHeight = imageSize.height * scale * zoomLevel[0];
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const offsetX = xPosition[0];
            const offsetY = yPosition[0];
            
            const posX = centerX - (imgWidth / 2) + offsetX;
            const posY = centerY - (imgHeight / 2) + offsetY;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(
              img,
              posX, 
              posY, 
              imgWidth,
              imgHeight
            );
            
            try {
              const dataUrl = canvas.toDataURL('image/png');
              
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], `cropped_${Date.now()}.png`, { type: 'image/png' });
              
              const supabaseUrl = await uploadToSupabase(file);
              if (supabaseUrl) {
                setPreviewImage(supabaseUrl);
                onImageChange(supabaseUrl);
              } else {
                setPreviewImage(dataUrl);
                onImageChange(dataUrl);
              }
            } catch (error) {
              console.error("Error creating image data URL:", error);
              
              const timestamp = new Date().getTime();
              let updatedImage = previewImage;
              
              if (previewImage.includes('?')) {
                updatedImage = `${previewImage.split('?')[0]}?t=${timestamp}&zoom=${zoomLevel[0]}&x=${xPosition[0]}&y=${yPosition[0]}`;
              } else {
                updatedImage = `${previewImage}?t=${timestamp}&zoom=${zoomLevel[0]}&x=${xPosition[0]}&y=${yPosition[0]}`;
              }
              
              setPreviewImage(updatedImage);
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

  React.useEffect(() => {
    if (currentImage && currentImage.trim() !== "") {
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
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⊙</span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              {hasImage ? "Change Photo" : "Upload Photo"}
            </>
          )}
        </Button>

        {hasImage && (
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="w-1/2"
              disabled={isUploading}
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
              disabled={isUploading}
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
            <Button onClick={handleCropSave} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Save Adjustments"}
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
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, size, size);
      
      const circleRadius = Math.max(2, size / 2 - 2);
      
      ctx.save();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(
        img,
        posX, 
        posY, 
        imgWidth,
        imgHeight
      );
      
      ctx.restore();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2, true);
      ctx.clip();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 1; i < 3; i++) {
        const y = (size / 3) * i;
        ctx.beginPath();
        ctx.moveTo(centerX - circleRadius, y);
        ctx.lineTo(centerX + circleRadius, y);
        ctx.stroke();
      }
      
      for (let i = 1; i < 3; i++) {
        const x = (size / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, centerY - circleRadius);
        ctx.lineTo(x, centerY + circleRadius);
        ctx.stroke();
      }
      
      ctx.restore();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();
      
      previewCanvas.width = size;
      previewCanvas.height = size;
      const previewCtx = previewCanvas.getContext('2d');
      if (previewCtx) {
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
