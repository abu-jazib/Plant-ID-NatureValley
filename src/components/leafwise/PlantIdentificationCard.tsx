
import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Percent, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlantIdentificationCardProps {
  englishResult: IdentifyPlantFromImageOutput['englishIdentification'];
  confidence: number;
  wikiLink: string;
}

export function PlantIdentificationCard({ englishResult, confidence, wikiLink }: PlantIdentificationCardProps) {
  const confidencePercentage = (confidence * 100).toFixed(1);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center font-sans">
          <Leaf className="mr-2 text-primary h-5 w-5" />
          Plant Identification (English)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 font-sans">
        <div>
          <h3 className="font-semibold text-primary font-sans">Common Name:</h3>
          <p className="text-lg font-sans">{englishResult.commonName}</p>
        </div>
        <div>
          <h3 className="font-semibold text-primary font-sans">Latin Name:</h3>
          <p className="text-lg italic font-sans">{englishResult.latinName}</p>
        </div>
        <div>
          <h3 className="font-semibold text-primary flex items-center font-sans">
            Confidence:
            <Badge variant="secondary" className="ml-2 font-sans">
              <Percent className="h-3 w-3 mr-1" />
              {confidencePercentage}
            </Badge>
          </h3>
        </div>
        {wikiLink && (
          <Button variant="outline" asChild className="mt-2 font-sans">
            <a href={wikiLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Wikipedia
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
