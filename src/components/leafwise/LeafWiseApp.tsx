
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { identifyPlantFromImage, type IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { detectDiseaseFromImage, type DetectDiseaseFromImageOutput } from "@/ai/flows/detect-disease-from-image";
import { suggestPlantTreatment, type SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { ImageUploadSection } from "./ImageUploadSection";
import { ResultsSection } from "./ResultsSection";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"; // Added import
import { useToast } from "@/hooks/use-toast";

export function LeafWiseApp() {
  const [file, setFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [plantIdResult, setPlantIdResult] = useState<IdentifyPlantFromImageOutput | null>(null);
  const [diseaseResult, setDiseaseResult] = useState<DetectDiseaseFromImageOutput | null>(null);
  const [treatmentSuggestionResult, setTreatmentSuggestionResult] = useState<SuggestPlantTreatmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ur">("en"); // Added language state
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      // Clear previous results when a new file is selected
      setPlantIdResult(null);
      setDiseaseResult(null);
      setTreatmentSuggestionResult(null);
      setError(null);
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
      setPlantIdResult(idResult);

      if (idResult && idResult.englishIdentification && idResult.englishIdentification.commonName) {
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

          if (diseaseRes.diseaseDetected) {
            setCurrentLoadingStep("Suggesting treatment...");
            toast({ title: "Processing...", description: "Generating treatment suggestions." });
            const treatmentRes = await suggestPlantTreatment({
              plantSpecies: idResult.englishIdentification.latinName,
              diseaseDescription: diseaseRes.likelyCauses, // English description
              diseaseDescriptionUrdu: diseaseRes.likelyCausesUrdu, // Urdu description
            });
            setTreatmentSuggestionResult(treatmentRes);
            toast({ title: "Suggestions Ready!", description: "Treatment and prevention advice generated."});
          }
        } else {
          setError("Plant identified, but Latin name is missing. Disease detection skipped.");
          toast({ title: "Identification Incomplete", description: "Latin name missing, disease detection skipped.", variant: "destructive" });
        }
      } else {
        setError("Could not reliably identify the plant or essential details are missing.");
        toast({ title: "Identification Failed", description: "Essential plant details are missing from the AI response.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(`Error during ${currentLoadingStep || 'analysis'}: ${errorMessage}`);
      toast({ title: "Analysis Failed", description: `Error during ${currentLoadingStep || 'analysis'}: ${errorMessage}`, variant: "destructive" });
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
      <ResultsSection
        plantIdResult={plantIdResult}
        diseaseResult={diseaseResult}
        treatmentSuggestionResult={treatmentSuggestionResult}
        imageDataUrl={imageDataUrl}
        error={error}
        isLoading={isLoading}
        currentLoadingStep={currentLoadingStep}
        language={selectedLanguage} // Pass selected language
      />
    </div>
  );
}
