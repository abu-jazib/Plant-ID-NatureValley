
"use client";

import type { ChangeEvent, FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Label will be used as the dropzone
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { UploadCloud, Loader2, ImagePlus } from "lucide-react"; // Added ImagePlus for preview title

interface ImageUploadSectionProps {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent) => Promise<void>;
  imageDataUrl: string | null;
  isLoading: boolean;
}

export function ImageUploadSection({ onFileChange, onSubmit, imageDataUrl, isLoading }: ImageUploadSectionProps) {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 font-sans">
          <UploadCloud className="text-primary" />
          Upload Leaf Image
        </CardTitle>
        <CardDescription className="font-sans">
          Choose a clear photo of a plant leaf for identification and disease detection.
          Use a high-resolution image for best results.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          {!imageDataUrl && (
            <Label
              htmlFor="leaf-image"
              className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <UploadCloud className="w-10 h-10 mb-4 text-primary" />
                <p className="mb-2 text-sm text-foreground font-sans">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground font-sans">
                  PNG, JPG, or WEBP (Max 5MB)
                </p>
              </div>
              <Input
                id="leaf-image"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={onFileChange}
                required
                className="hidden" // Visually hide the default input
                disabled={isLoading}
              />
            </Label>
          )}

          {imageDataUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-primary flex items-center font-sans">
                <ImagePlus className="mr-2 h-5 w-5" />
                Image Preview
              </h3>
              <div className="border border-border rounded-md p-2 flex justify-center items-center bg-muted/20">
                <Image
                  src={imageDataUrl}
                  alt="Uploaded leaf preview"
                  width={300} // Increased preview size
                  height={300} // Increased preview size
                  className="rounded-md object-contain max-h-[300px] shadow-sm"
                  data-ai-hint="leaf preview"
                />
              </div>
               <Button 
                variant="outline" 
                onClick={() => {
                  // This is a bit of a hack to reset the input. 
                  // A more robust solution might involve resetting form state if using react-hook-form
                  // or managing the input's value directly.
                  const input = document.getElementById('leaf-image') as HTMLInputElement;
                  if (input) input.value = ''; 
                  onFileChange({ target: { files: null } } as unknown as ChangeEvent<HTMLInputElement>);
                }} 
                className="w-full sm:w-auto font-sans"
                disabled={isLoading}
              >
                Change Image
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full font-sans" disabled={isLoading || !imageDataUrl}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Leaf"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
