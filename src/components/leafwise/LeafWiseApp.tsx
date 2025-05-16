
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { identifyPlantFromImage, type IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { detectDiseaseFromImage, type DetectDiseaseFromImageOutput } from "@/ai/flows/detect-disease-from-image";
import { suggestPlantTreatment, type SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { ImageUploadSection } from "./ImageUploadSection";
import { ResultsSection } from "./ResultsSection";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
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
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ur">("en");
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

    console.log('[LeafWiseApp Debug] handleSubmit: imageDataUrl length (client-side):', imageDataUrl.length);

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
            
            console.log(`[LeafWiseApp Debug] Preparing to call suggestPlantTreatment. Plant: ${idResult.englishIdentification.latinName}, Disease: ${diseaseRes.likelyCauses}, Disease Urdu: ${diseaseRes.likelyCausesUrdu}`);
            
            try {
              const treatmentRes = await suggestPlantTreatment({
                plantSpecies: idResult.englishIdentification.latinName,
                diseaseDescription: diseaseRes.likelyCauses,
                diseaseDescriptionUrdu: diseaseRes.likelyCausesUrdu,
              });

              console.log('[LeafWiseApp Debug] Successfully received response from suggestPlantTreatment.');
              if (treatmentRes) {
                console.log('[LeafWiseApp Debug] treatmentRes keys:', Object.keys(treatmentRes));
                console.log('[LeafWiseApp Debug] treatmentRes.suggestedSolutions length:', treatmentRes.suggestedSolutions?.length);
                console.log('[LeafWiseApp Debug] treatmentRes.preventativeMeasures length:', treatmentRes.preventativeMeasures?.length);
                console.log('[LeafWiseApp Debug] treatmentRes.suggestedSolutionsUrdu length:', treatmentRes.suggestedSolutionsUrdu?.length);
                console.log('[LeafWiseApp Debug] treatmentRes.preventativeMeasuresUrdu length:', treatmentRes.preventativeMeasuresUrdu?.length);
              } else {
                console.warn('[LeafWiseApp Debug] suggestPlantTreatment returned null or undefined.');
              }
              
              setTreatmentSuggestionResult(treatmentRes);
              toast({ title: "Suggestions Ready!", description: "Treatment and prevention advice generated."});
            } catch (treatmentError: any) {
              console.error("[LeafWiseApp CRITICAL DEBUG] Error from suggestPlantTreatment call:", treatmentError);
              console.error("[LeafWiseApp CRITICAL DEBUG] Error message:", treatmentError.message);
              console.error("[LeafWiseApp CRITICAL DEBUG] Error stack:", treatmentError.stack);
              try {
                const errorJson = JSON.stringify(treatmentError, Object.getOwnPropertyNames(treatmentError));
                console.error("[LeafWiseApp CRITICAL DEBUG] Full treatmentError object (JSON):", errorJson);
              } catch (e) {
                console.error("[LeafWiseApp CRITICAL DEBUG] Could not stringify treatmentError object:", treatmentError);
              }
              const userErrorMessage = treatmentError.message.includes('network') || treatmentError.message.includes('fetch') 
                ? "A network error occurred while fetching treatment suggestions. Please check your connection or try again."
                : `Error during treatment suggestion: ${treatmentError.message}`;
              setError(userErrorMessage);
              toast({ title: "Treatment Suggestion Failed", description: userErrorMessage, variant: "destructive" });
            }
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
      console.error('[LeafWiseApp Debug] Error during main analysis steps:', err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected response was received from the server.";
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
        language={selectedLanguage}
      />
    </div>
  );
}

