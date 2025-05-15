
import type { IdentifyPlantFromImageOutput } from "@/ai/flows/identify-plant-from-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Languages } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlantIdentificationUrduCardProps {
  urduResult: IdentifyPlantFromImageOutput['urduIdentification'];
  confidence: number;
}

export function PlantIdentificationUrduCard({ urduResult, confidence }: PlantIdentificationUrduCardProps) {
  const confidencePercentage = (confidence * 100).toFixed(1);

  // The card will now always render. Specific fields below will only render if they have content.

  return (
    <Card className="shadow-lg h-full font-jameel" dir="rtl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center font-jameel">
          <Languages className="ml-2 text-primary h-5 w-5" />
          شناختِ نباتات (اردو)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 font-jameel">
        {urduResult?.commonName && (
          <div>
            <h3 className="font-semibold text-primary">عام نام:</h3>
            <p className="text-lg">{urduResult.commonName}</p>
          </div>
        )}
        {urduResult?.latinNameRepresentation && (
          <div>
            <h3 className="font-semibold text-primary">لاطینی نام (اردو):</h3>
            <p className="text-lg">{urduResult.latinNameRepresentation}</p>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-primary flex items-center">
            اعتماد:
            <Badge variant="secondary" className="mr-2"> {/* Adjusted margin for RTL */}
              <Percent className="h-3 w-3 ml-1" /> {/* Adjusted margin for RTL */}
              {confidencePercentage}
            </Badge>
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
