
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { identifyPlantFromImage, type IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { detectDiseaseFromImage, type DetectDiseaseFromImageOutput } from "@/ai/flows/detect-disease-from-image";
import { suggestPlantTreatment, type SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { ImageUploadSection } from "./ImageUploadSection";
import { ResultsSection } from "./ResultsSection";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit"; // Import AdSenseUnit

export function LeafWiseApp() {
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [plantIdResult, setPlantIdResult] = useState<IdentifyPlantFromImageOutput | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<DetectDiseaseFromImageOutput | null>(null);
  const [treatmentSuggestionResult, setTreatmentSuggestionResult] = useState<SuggestPlantTreatmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ur">("en");
  const { toast } = useToast();

  const MAX_IMAGE_SIZE_MB = 1;
  const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setError(null);
      setPlantIdResult(null);
      setDiseaseResult(null);
      setTreatmentSuggestionResult(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        const originalImageDataUrl = e.target?.result as string;

        // Check file size
        if (selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
          toast({
            title: "Compressing Image",
            description: `Image is larger than ${MAX_IMAGE_SIZE_MB}MB. Compressing before upload...`,
          });

          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_DIMENSION = 1280; // Max width or height for resizing
            let { width, height } = img;

            if (width > height) {
              if (width > MAX_DIMENSION) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              }
            } else {
              if (height > MAX_DIMENSION) {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality JPEG
              setImageDataUrl(compressedDataUrl);
              setFile(selectedFile); // Keep original file for potential use, or convert to Blob if needed
              toast({
                title: "Compression Complete",
                description: "Image compressed and ready.",
              });
            } else {
              // Fallback if canvas context fails
              setImageDataUrl(originalImageDataUrl);
              setFile(selectedFile);
              toast({
                title: "Compression Failed",
                description: "Using original image. Canvas context error.",
                variant: "destructive",
              });
            }
          };
          img.onerror = () => {
            // Fallback if image loading fails
             setImageDataUrl(originalImageDataUrl);
             setFile(selectedFile);
             toast({
                title: "Compression Failed",
                description: "Using original image. Image load error.",
                variant: "destructive",
              });
          };
          img.src = originalImageDataUrl;
        } else {
          // Image is within size limit
          setImageDataUrl(originalImageDataUrl);
          setFile(selectedFile);
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setImageDataUrl(null);
    }
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageDataUrl) {
      setError("Please select an image file.");
      toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPlantIdResult(null);
    setDiseaseResult(null);
    setTreatmentSuggestionResult(null);

    try {
      setCurrentLoadingStep("Identifying plant...");
      toast({ title: "Processing...", description: "Identifying plant species." });
      const idResult = await identifyPlantFromImage({ photoDataUri: imageDataUrl });
      
      if (idResult && idResult.englishIdentification && idResult.englishIdentification.commonName) {
        setPlantIdResult(idResult);
        toast({ title: "Plant Identified!", description: `Species: ${idResult.englishIdentification.commonName}` });

        if (idResult.englishIdentification.latinName) {
          setCurrentLoadingStep("Detecting diseases...");
          toast({ title: "Processing...", description: "Detecting diseases." });
          const diseaseRes = await detectDiseaseFromImage({
            leafImageDataUri: imageDataUrl,
            plantSpecies: idResult.englishIdentification.latinName,
          });
          setDiseaseResult(diseaseRes);
          toast({ title: "Disease Scan Complete!", description: diseaseRes.diseaseDetected ? "Potential issues found." : "Looks healthy!"});

          if (diseaseRes.diseaseDetected && diseaseRes.likelyCauses) {
            setCurrentLoadingStep("Suggesting treatment...");
            toast({ title: "Processing...", description: "Generating treatment suggestions." });
            
            const treatmentRes = await suggestPlantTreatment({
              plantSpecies: idResult.englishIdentification.latinName,
              diseaseDescription: diseaseRes.likelyCauses,
              diseaseDescriptionUrdu: diseaseRes.likelyCausesUrdu,
            });
            setTreatmentSuggestionResult(treatmentRes);
            toast({ title: "Suggestions Ready!", description: "Treatment and prevention advice generated."});
          } else if (diseaseRes.diseaseDetected && !diseaseRes.likelyCauses) {
             toast({ title: "Info", description: "Disease detected, but no specific causes identified to suggest treatment.", variant: "default" });
          }
        } else {
          setError("Plant identified, but Latin name is missing. Disease detection skipped.");
          toast({ title: "Identification Incomplete", description: "Latin name missing, disease detection skipped.", variant: "destructive" });
        }
      } else {
        setPlantIdResult(idResult); 
        setError("Could not reliably identify the plant or essential details are missing.");
        toast({ title: "Identification Failed", description: "Essential plant details are missing from the AI response. Please try a clearer image.", variant: "destructive" });
      }
    } catch (err: any) {
      const errorMessage = `Error during analysis: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      toast({ title: "Analysis Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setCurrentLoadingStep(null);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-center md:justify-end mb-1">
      </div>
      <div className="flex justify-center md:justify-end mb-4">
      </div>
      <div className="flex justify-center md:justify-end mb-4">
         <LanguageSwitcher
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            className="w-full max-w-xs md:max-w-none md:w-auto"
          />
      </div>
      <ImageUploadSection
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        imageDataUrl={imageDataUrl}
        isLoading={isLoading}
      />

      {/* AdSense Ad Unit 1 */}
      <AdSenseUnit 
        adClient="ca-pub-2252656502777909" // REPLACE
        adSlot="2339027729" // REPLACE
        className="my-6"
        showAdLabel={true} // Explicitly show label
      />

      <ResultsSection
        plantIdResult={plantIdResult}
        diseaseResult={diseaseResult}
        treatmentSuggestionResult={treatmentSuggestionResult}
        imageDataUrl={imageDataUrl}
        error={error}
        isLoading={isLoading}
        currentLoadingStep={currentLoadingStep}
        language={selectedLanguage}
      />
    </div>
  );
}

