
"use client";

import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import type { DetectDiseaseFromImageOutput } from "@/ai/flows/detect-disease-from-image";
import type { SuggestPlantTreatmentOutput } from "@/ai/flows/suggest-treatment-flow";
import { PlantIdentificationCard } from "./PlantIdentificationCard";
import { PlantIdentificationUrduCard } from "./PlantIdentificationUrduCard";
import { DiseaseDetectionCard } from "./DiseaseDetectionCard";
import { DiseaseSolutionCard } from "./DiseaseSolutionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Image as ImageIcon, Info, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AdSenseUnit } from "@/components/ads/AdSenseUnit"; 

interface ResultsSectionProps {
  plantIdResult: IdentifyPlantFromImageOutput | null;
  diseaseResult: DetectDiseaseFromImageOutput | null;
  treatmentSuggestionResult: SuggestPlantTreatmentOutput | null;
  imageDataUrl: string | null;
  error: string | null;
  isLoading: boolean;
  currentLoadingStep: string | null;
  language: "en" | "ur";
}

export function ResultsSection({ 
  plantIdResult, 
  diseaseResult, 
  treatmentSuggestionResult,
  imageDataUrl, 
  error, 
  isLoading,
  currentLoadingStep,
  language
}: ResultsSectionProps) {

  // Define Ad Slot IDs - REPLACE THESE WITH YOUR ACTUAL SLOT IDs
  const adSlotResults1 = "7823272783";
  const adSlotResults2 = "1025946056";

  if (isLoading && currentLoadingStep) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center space-y-4 p-6 border rounded-lg shadow-md bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-sans">{currentLoadingStep}</p>
        <p className="text-sm text-center text-muted-foreground/80 font-sans">
          Please wait while we analyze your image and prepare the results.
        </p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mt-6 font-sans">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-sans">Error</AlertTitle>
        <AlertDescription className="font-sans">{error}</AlertDescription>
      </Alert>
    );
  }

  const noResultsToShow = !plantIdResult && !diseaseResult && !treatmentSuggestionResult && !imageDataUrl && !isLoading;

  if (noResultsToShow) {
     return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center font-sans">
            <Info className="mr-2 text-primary" />
            Awaiting Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-sans">
            Upload an image of a plant leaf and click "Analyze Leaf" to get started. 
            We'll identify the plant, check for diseases, and provide suggestions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {imageDataUrl && !plantIdResult && !diseaseResult && (
        <Card className="shadow-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl flex items-center font-sans">
                <ImageIcon className="mr-2 text-primary"/>
                Uploaded Leaf Image
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center p-4 bg-muted/30">
            <Image
              src={imageDataUrl}
              alt="Uploaded leaf"
              width={300}
              height={300}
              className="rounded-lg object-contain max-h-[350px] shadow-md"
              data-ai-hint="uploaded leaf"
            />
          </CardContent>
        </Card>
      )}
      
      {(plantIdResult || diseaseResult || treatmentSuggestionResult) && <Separator className="my-6" />}

      {plantIdResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlantIdentificationCard
              englishResult={plantIdResult.englishIdentification}
              confidence={plantIdResult.confidence}
              wikiLink={plantIdResult.wikiLink}
            />
            <PlantIdentificationUrduCard
              urduResult={plantIdResult.urduIdentification}
              confidence={plantIdResult.confidence}
            />
          </div>
          <AdSenseUnit 
            key={adSlotResults1} // Add unique key
            adClient="ca-pub-2252656502777909" 
            adSlot={adSlotResults1} 
            className="my-6"
            showAdLabel={true}
          />
        </>
      )}
      
      {diseaseResult && (
        <>
          <DiseaseDetectionCard result={diseaseResult} language={language} />
          {treatmentSuggestionResult && diseaseResult.diseaseDetected && (
            <AdSenseUnit 
              key={adSlotResults2} // Add unique key
              adClient="ca-pub-2252656502777909" 
              adSlot={adSlotResults2} 
              className="my-6"
              showAdLabel={true}
            />
          )}
        </>
      )}
      
      {treatmentSuggestionResult && diseaseResult?.diseaseDetected && (
          <DiseaseSolutionCard result={treatmentSuggestionResult} language={language} />
      )}
    </div>
  );
}
